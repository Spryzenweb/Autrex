import { promisify } from 'util'
import { exec } from 'child_process'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as https from 'https'
import { app } from 'electron'
import axios from 'axios'

const execAsync = promisify(exec)

interface LoginCredentials {
  username: string
  password: string
}

interface RiotClientCreds {
  port: number
  password: string
}

class AccountLoginService {
  private riotClientPath: string | null = null

  // ==================== RIOT CLIENT BINARY BULMA ====================

  async findRiotClient(): Promise<string | null> {
    if (this.riotClientPath) return this.riotClientPath

    if (process.platform === 'darwin') {
      return await this.findRiotClientMac()
    } else if (process.platform === 'win32') {
      return await this.findRiotClientWindows()
    }
    return null
  }

  private async findRiotClientMac(): Promise<string | null> {
    // RiotClientInstalls.json'dan dinamik yol bul
    const jsonPaths = [
      path.join(app.getPath('home'), 'Library', 'Application Support', 'Riot Games', 'RiotClientInstalls.json'),
      '/Users/Shared/Riot Games/RiotClientInstalls.json'
    ]

    for (const jsonPath of jsonPaths) {
      try {
        const raw = await fs.readFile(jsonPath, 'utf-8')
        const installs = JSON.parse(raw)
        const candidates = [installs?.rc_live, installs?.rc_default].filter(Boolean)

        for (const candidate of candidates) {
          const bin = candidate.endsWith('.app')
            ? path.join(candidate, 'Contents', 'MacOS', 'RiotClientServices')
            : candidate
          try {
            await fs.access(bin)
            this.riotClientPath = bin
            console.log('[AccountLogin] Riot Client found via JSON:', bin)
            return bin
          } catch { /* devam */ }
        }
      } catch { /* JSON yok */ }
    }

    // Sabit path'ler
    for (const p of [
      '/Users/Shared/Riot Games/Riot Client.app/Contents/MacOS/RiotClientServices',
      '/Applications/Riot Client.app/Contents/MacOS/RiotClientServices',
      path.join(app.getPath('home'), 'Applications', 'Riot Client.app', 'Contents', 'MacOS', 'RiotClientServices'),
    ]) {
      try {
        await fs.access(p)
        this.riotClientPath = p
        return p
      } catch { /* yok */ }
    }

    return null
  }

  private async findRiotClientWindows(): Promise<string | null> {
    // 1. RiotClientInstalls.json'dan dinamik yol bul (en güvenilir - herhangi bir diskte çalışır)
    const installsJsonPaths = [
      path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'Riot Games', 'RiotClientInstalls.json'),
      path.join(process.env.LOCALAPPDATA || '', 'Riot Games', 'RiotClientInstalls.json'),
    ]

    for (const jsonPath of installsJsonPaths) {
      try {
        const raw = await fs.readFile(jsonPath, 'utf-8')
        const installs = JSON.parse(raw)
        const candidates = [installs?.rc_live, installs?.rc_default].filter(Boolean)

        for (const candidate of candidates) {
          const bin = candidate.endsWith('.exe') ? candidate
            : path.join(candidate, 'RiotClientServices.exe')
          try {
            await fs.access(bin)
            this.riotClientPath = bin
            console.log('[AccountLogin] Riot Client found via JSON (Windows):', bin)
            return bin
          } catch { /* devam */ }
        }
      } catch { /* JSON yok */ }
    }

    // 2. Registry'den bul (kullanıcı farklı diske kurmuş olabilir)
    try {
      const { stdout } = await execAsync(
        'reg query "HKLM\\SOFTWARE\\WOW6432Node\\Riot Games, Inc\\Riot Client" /v "InstallLocation" 2>nul'
      )
      const match = stdout.match(/InstallLocation\s+REG_SZ\s+(.+)/)
      if (match) {
        const bin = path.join(match[1].trim(), 'RiotClientServices.exe')
        try {
          await fs.access(bin)
          this.riotClientPath = bin
          console.log('[AccountLogin] Riot Client found via Registry:', bin)
          return bin
        } catch { /* yok */ }
      }
    } catch { /* registry key yok */ }

    // 3. Ortam değişkenlerine dayalı standart path'ler (fallback)
    const standardPaths = [
      path.join(process.env.PROGRAMFILES || '', 'Riot Games', 'Riot Client', 'RiotClientServices.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Riot Games', 'Riot Client', 'RiotClientServices.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Riot Games', 'Riot Client', 'RiotClientServices.exe'),
    ]

    for (const p of standardPaths) {
      if (!p.startsWith('\\') && p.length > 20) {
        try {
          await fs.access(p)
          this.riotClientPath = p
          return p
        } catch { /* yok */ }
      }
    }

    // 4. Tüm sabit sürücüleri tara
    const drives = ['C', 'D', 'E', 'F', 'G']
    for (const drive of drives) {
      for (const folder of ['Riot Games', 'Program Files\\Riot Games', 'Program Files (x86)\\Riot Games']) {
        const p = `${drive}:\\${folder}\\Riot Client\\RiotClientServices.exe`
        try {
          await fs.access(p)
          this.riotClientPath = p
          console.log('[AccountLogin] Riot Client found via drive scan:', p)
          return p
        } catch { /* yok */ }
      }
    }

    return null
  }

  // ==================== RIOT CLIENT LOCKFILE (API ERİŞİMİ İÇİN) ====================

  private async findRiotClientLockfile(): Promise<RiotClientCreds | null> {
    const lockfilePaths: string[] = []

    if (process.platform === 'darwin') {
      lockfilePaths.push(
        // Terminalde bulunan gerçek lokasyonlar
        '/Users/Shared/Riot Games/Metadata/Riot Client/lockfile',
        path.join(app.getPath('home'), 'Library', 'Application Support', 'Riot Games', 'Riot Client', 'Config', 'lockfile'),
        // Diğer olası lokasyonlar
        '/Users/Shared/Riot Games/Riot Client/lockfile',
        path.join(app.getPath('home'), 'Library', 'Application Support', 'Riot Games', 'RiotClientServices', 'lockfile'),
      )
    } else if (process.platform === 'win32') {
      // Riot Client lockfile - herhangi bir diskte çalışır
      lockfilePaths.push(
        path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'Riot Games', 'Metadata', 'Riot Client', 'lockfile'),
        path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'Riot Games', 'Riot Client', 'Config', 'lockfile'),
        path.join(process.env.LOCALAPPDATA || '', 'Riot Games', 'Riot Client', 'Data', 'lockfile'),
      )
      // Sabit disk taraması
      for (const drive of ['C', 'D', 'E', 'F', 'G']) {
        lockfilePaths.push(
          `${drive}:\\ProgramData\\Riot Games\\Metadata\\Riot Client\\lockfile`,
          `${drive}:\\Riot Games\\Riot Client\\lockfile`,
        )
      }
    }

    for (const p of lockfilePaths) {
      try {
        const content = await fs.readFile(p, 'utf-8')
        // Lockfile format: name:pid:port:password:protocol
        const parts = content.trim().split(':')
        if (parts.length >= 4) {
          console.log('[AccountLogin] Found Riot Client lockfile at:', p)
          return { port: parseInt(parts[2]), password: parts[3] }
        }
      } catch { /* yok */ }
    }

    // Process'den port ve token bulmayı dene
    return await this.findRiotClientCredsFromProcess()
  }

  private async findRiotClientCredsFromProcess(): Promise<RiotClientCreds | null> {
    try {
      if (process.platform === 'darwin') {
        const { stdout } = await execAsync('ps aux | grep -i "RiotClientServices" | grep -v grep')
        const portMatch = stdout.match(/--app-port=(\d+)/)
        const tokenMatch = stdout.match(/--remoting-auth-token=([a-zA-Z0-9_-]+)/)
        if (portMatch && tokenMatch) {
          return { port: parseInt(portMatch[1]), password: tokenMatch[1] }
        }
      } else if (process.platform === 'win32') {
        const { stdout } = await execAsync(
          'wmic process where "name=\'RiotClientServices.exe\'" get CommandLine /format:list'
        )
        const portMatch = stdout.match(/--app-port=(\d+)/)
        const tokenMatch = stdout.match(/--remoting-auth-token=([a-zA-Z0-9_-]+)/)
        if (portMatch && tokenMatch) {
          return { port: parseInt(portMatch[1]), password: tokenMatch[1] }
        }
      }
    } catch { /* process bulunamadı */ }
    return null
  }

  // ==================== RIOT CLIENT API LOGIN ====================

  private async loginViaRiotClientAPI(credentials: LoginCredentials): Promise<boolean> {
    const creds = await this.findRiotClientLockfile()
    if (!creds) {
      console.log('[AccountLogin] Could not find Riot Client API credentials')
      return false
    }

    console.log(`[AccountLogin] Found Riot Client API at port ${creds.port}`)

    const axiosInstance = axios.create({
      baseURL: `https://127.0.0.1:${creds.port}`,
      auth: { username: 'riot', password: creds.password },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 10000,
    })

    try {
      // Mevcut oturumu kapat
      console.log('[AccountLogin] Logging out current session via Riot Client API...')
      try {
        await axiosInstance.delete('/riotclient/auth-token')
      } catch { /* oturum zaten kapalı olabilir */ }

      await new Promise((r) => setTimeout(r, 1500))

      // Yeni credentials ile login
      console.log('[AccountLogin] Logging in with new credentials via Riot Client API...')
      const loginResponse = await axiosInstance.put('/riotclient/auth-token', {
        username: credentials.username,
        password: credentials.password,
        persistLogin: true,
      })

      console.log('[AccountLogin] Riot Client API login response:', loginResponse.status)

      if (loginResponse.status >= 200 && loginResponse.status < 300) {
        console.log('[AccountLogin] ✅ Login via Riot Client API successful!')

        // League'i başlat
        await new Promise((r) => setTimeout(r, 1000))
        try {
          await axiosInstance.post('/riotclient/launch-uid-overlay', {
            productId: 'league_of_legends',
            patchline: 'live',
          })
        } catch {
          // Bu endpoint çalışmazsa League'i direkt başlat
          await this.launchLeagueDirect()
        }

        return true
      }
    } catch (error: any) {
      console.error('[AccountLogin] Riot Client API login failed:', error?.response?.status, error?.message)
    }

    return false
  }

  // ==================== PROCESS KONTROL ====================

  async isRiotClientRunning(): Promise<boolean> {
    try {
      if (process.platform === 'darwin') {
        const { stdout } = await execAsync('pgrep -f "RiotClientServices"')
        return stdout.trim().length > 0
      } else if (process.platform === 'win32') {
        const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq RiotClientServices.exe" /NH')
        return stdout.toLowerCase().includes('riotclientservices.exe')
      }
      return false
    } catch { return false }
  }

  async isLeagueRunning(): Promise<boolean> {
    try {
      if (process.platform === 'darwin') {
        const { stdout } = await execAsync('pgrep -f "LeagueClient"')
        return stdout.trim().length > 0
      } else if (process.platform === 'win32') {
        const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq LeagueClient.exe" /NH')
        return stdout.toLowerCase().includes('leagueclient.exe')
      }
      return false
    } catch { return false }
  }

  async killLeagueOnly(): Promise<void> {
    console.log('[AccountLogin] Killing League processes...')
    if (process.platform === 'darwin') {
      for (const p of ['LeagueClient', 'LeagueClientUx', 'League of Legends']) {
        try { await execAsync(`pkill -9 -f "${p}"`) } catch { /* yok */ }
      }
    } else if (process.platform === 'win32') {
      for (const e of ['LeagueClient.exe', 'LeagueClientUx.exe', 'League of Legends.exe']) {
        try { await execAsync(`taskkill /F /IM "${e}"`) } catch { /* yok */ }
      }
    }
    await new Promise((r) => setTimeout(r, 2000))
  }

  // ==================== RIOT CLIENT BAŞLATMA ====================

  async startRiotClient(): Promise<void> {
    if (!this.riotClientPath) await this.findRiotClient()
    if (!this.riotClientPath) throw new Error('Riot Client bulunamadı')

    console.log('[AccountLogin] Starting Riot Client...')
    const { spawn } = await import('child_process')

    if (process.platform === 'darwin') {
      spawn(this.riotClientPath, [], { detached: true, stdio: 'ignore' }).unref()
    } else {
      spawn(this.riotClientPath, [], { detached: true, stdio: 'ignore', windowsHide: true }).unref()
    }

    // Lockfile hazır olana kadar bekle
    console.log('[AccountLogin] Waiting for Riot Client API to be ready...')
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1000))
      const creds = await this.findRiotClientLockfile()
      if (creds) {
        console.log('[AccountLogin] Riot Client API is ready')
        await new Promise((r) => setTimeout(r, 1000))
        break
      }
    }
  }

  // League'i Riot Client olmadan direkt başlat (fallback)
  private async launchLeagueDirect(): Promise<void> {
    if (!this.riotClientPath) return
    const { spawn } = await import('child_process')
    spawn(
      this.riotClientPath,
      ['--launch-product=league_of_legends', '--launch-patchline=live'],
      { detached: true, stdio: 'ignore' }
    ).unref()
  }

  // ==================== ANA LOGIN AKIŞI ====================

  async login(credentials: LoginCredentials): Promise<void> {
    console.log('[AccountLogin] ===== LOGIN START =====')

    if (!this.riotClientPath) await this.findRiotClient()
    if (!this.riotClientPath) throw new Error('Riot Client bulunamadı.')

    // League çalışıyorsa kapat
    if (await this.isLeagueRunning()) {
      console.log('[AccountLogin] Closing League...')
      await this.killLeagueOnly()
    }

    // Riot Client çalışmıyorsa başlat
    if (!await this.isRiotClientRunning()) {
      console.log('[AccountLogin] Starting Riot Client...')
      await this.startRiotClient()
    }

    // ÖNCELİK 1: Riot Client API üzerinden login (en güvenilir)
    const apiLoginSuccess = await this.loginViaRiotClientAPI(credentials)

    if (!apiLoginSuccess) {
      // FALLBACK: Windows'ta credential argümanı ile başlat
      if (process.platform === 'win32') {
        console.log('[AccountLogin] Falling back to credential args method (Windows)...')
        const { spawn } = await import('child_process')
        spawn(
          this.riotClientPath,
          [
            '--launch-product=league_of_legends',
            '--launch-patchline=live',
            `--username=${credentials.username}`,
            `--password=${credentials.password}`
          ],
          { detached: true, stdio: 'ignore', windowsHide: true }
        ).unref()
      } else {
        // macOS fallback: credentials dosyası + League launch
        console.log('[AccountLogin] Falling back to credentials file method (macOS)...')
        await this.writeCredentialsMac(credentials)
        await this.launchLeagueDirect()
      }
    }

    console.log('[AccountLogin] ===== LOGIN COMPLETE =====')
  }

  private async writeCredentialsMac(credentials: LoginCredentials): Promise<void> {
    const dir = path.join(app.getPath('home'), 'Library', 'Application Support', 'Riot Games')
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(
      path.join(dir, 'RiotClientPrivateSettings.yaml'),
      `riot-login:\n  persist:\n    session:\n      username: "${credentials.username}"\n      password: "${credentials.password}"\n      remember: true\n`,
      'utf-8'
    )
    console.log('[AccountLogin] Credentials file written')
  }

  // ==================== LCU BEKLEME ====================

  async waitForLCU(maxWaitTime: number = 90000): Promise<boolean> {
    const startTime = Date.now()
    console.log('[AccountLogin] Waiting for LCU lockfile...')

    while (Date.now() - startTime < maxWaitTime) {
      for (const p of this.getLockfilePaths()) {
        try {
          await fs.access(p)
          console.log('[AccountLogin] LCU ready at:', p)
          return true
        } catch { /* henüz yok */ }
      }
      await new Promise((r) => setTimeout(r, 1000))
    }

    return false
  }

  private getLockfilePaths(): string[] {
    if (process.platform === 'darwin') {
      return [
        '/Applications/League of Legends.app/Contents/LoL/lockfile',
        path.join(app.getPath('home'), 'Applications', 'League of Legends.app', 'Contents', 'LoL', 'lockfile'),
        '/Users/Shared/Riot Games/League of Legends.app/Contents/LoL/lockfile',
      ]
    }
    const lcuPaths: string[] = [
      path.join(process.env.LOCALAPPDATA || '', 'Riot Games', 'League of Legends', 'lockfile'),
      path.join(process.env.PROGRAMFILES || '', 'Riot Games', 'League of Legends', 'lockfile'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Riot Games', 'League of Legends', 'lockfile'),
    ]
    // Sabit disk taraması - farklı disklerde kurulu olabilir
    for (const drive of ['C', 'D', 'E', 'F', 'G']) {
      lcuPaths.push(
        `${drive}:\\Riot Games\\League of Legends\\lockfile`,
        `${drive}:\\Program Files\\Riot Games\\League of Legends\\lockfile`,
      )
    }
    return lcuPaths
  }
}

export const accountLoginService = new AccountLoginService()