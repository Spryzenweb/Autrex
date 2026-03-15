import { promisify } from 'util'
import { exec } from 'child_process'
import * as path from 'path'
import * as fs from 'fs/promises'
import { app } from 'electron'

const execAsync = promisify(exec)

interface LoginCredentials {
  username: string
  password: string
}

class AccountLoginService {
  private riotClientPath: string | null = null

  async findRiotClient(): Promise<string | null> {
    try {
      const possiblePaths: string[] = []

      if (process.platform === 'darwin') {
        // Mac paths - Try standalone Riot Client first (most common location)
        possiblePaths.push(
          '/Users/Shared/Riot Games/Riot Client.app/Contents/MacOS/RiotClientServices',
          '/Applications/Riot Client.app/Contents/MacOS/RiotClientServices',
          // Also try LeagueClient.app (can be used to launch directly)
          '/Applications/League of Legends.app/Contents/LoL/LeagueClient.app/Contents/MacOS/LeagueClient',
          path.join(
            app.getPath('home'),
            'Applications',
            'League of Legends.app',
            'Contents',
            'LoL',
            'LeagueClient.app',
            'Contents',
            'MacOS',
            'LeagueClient'
          )
        )
      } else if (process.platform === 'win32') {
        // Windows paths
        possiblePaths.push(
          path.join(
            process.env.PROGRAMFILES || 'C:\\Program Files',
            'Riot Games',
            'Riot Client',
            'RiotClientServices.exe'
          ),
          path.join(
            process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)',
            'Riot Games',
            'Riot Client',
            'RiotClientServices.exe'
          ),
          path.join(
            process.env.LOCALAPPDATA || '',
            'Riot Games',
            'Riot Client',
            'RiotClientServices.exe'
          )
        )
      }

      console.log('[AccountLogin] Searching for Riot Client in paths:', possiblePaths)

      for (const clientPath of possiblePaths) {
        try {
          await fs.access(clientPath)
          this.riotClientPath = clientPath
          console.log('[AccountLogin] Found Riot Client at:', clientPath)
          return clientPath
        } catch {
          console.log('[AccountLogin] Not found at:', clientPath)
          continue
        }
      }

      console.log('[AccountLogin] Riot Client not found in any known location')
      return null
    } catch (error) {
      console.error('[AccountLogin] Error finding Riot Client:', error)
      return null
    }
  }

  async killLeagueOnly(): Promise<void> {
    try {
      console.log('[AccountLogin] Killing League of Legends processes only...')

      if (process.platform === 'darwin') {
        // Mac: Only kill League processes, NOT Riot Client
        try {
          await execAsync('pkill -9 "LeagueClient"')
        } catch {
          // Process may not be running
        }
        try {
          await execAsync('pkill -9 "League of Legends"')
        } catch {
          // Process may not be running
        }
      } else if (process.platform === 'win32') {
        // Windows: Only kill League processes, NOT Riot Client
        try {
          await execAsync('taskkill /F /IM LeagueClient.exe')
        } catch {
          // Process may not be running
        }
        try {
          await execAsync('taskkill /F /IM LeagueClientUx.exe')
        } catch {
          // Process may not be running
        }
        try {
          await execAsync('taskkill /F /IM "League of Legends.exe"')
        } catch {
          // Process may not be running
        }
      }

      // Wait a bit for processes to fully terminate
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log('[AccountLogin] League processes killed')
    } catch (error) {
      console.error('[AccountLogin] Error killing League processes:', error)
    }
  }

  async isRiotClientRunning(): Promise<boolean> {
    try {
      if (process.platform === 'darwin') {
        // Check for both RiotClientServices and LeagueClient
        try {
          const { stdout } = await execAsync('pgrep -f "RiotClientServices|LeagueClient"')
          return stdout.trim().length > 0
        } catch {
          return false
        }
      } else if (process.platform === 'win32') {
        try {
          await execAsync(
            'tasklist /FI "IMAGENAME eq RiotClientServices.exe" 2>NUL | find /I /N "RiotClientServices.exe">NUL'
          )
          return true
        } catch {
          return false
        }
      }
      return false
    } catch {
      return false
    }
  }

  async startRiotClient(): Promise<void> {
    try {
      if (!this.riotClientPath) {
        await this.findRiotClient()
      }

      if (!this.riotClientPath) {
        throw new Error('Riot Client bulunamadı')
      }

      console.log('[AccountLogin] Starting Riot Client...')

      if (process.platform === 'darwin') {
        // Mac: Extract the .app path and use open command
        let appPath = this.riotClientPath
        if (appPath.includes('/Contents/MacOS/')) {
          appPath = appPath.substring(0, appPath.indexOf('/Contents/MacOS/'))
        }
        console.log('[AccountLogin] Opening app at:', appPath)
        await execAsync(`open "${appPath}"`)
      } else if (process.platform === 'win32') {
        // Windows: Use spawn for detached process
        const { spawn } = await import('child_process')
        spawn(this.riotClientPath, [], {
          detached: true,
          stdio: 'ignore'
        }).unref()
      }

      // Wait for Riot Client to start
      await new Promise((resolve) => setTimeout(resolve, 3000))
      console.log('[AccountLogin] Riot Client started')
    } catch (error) {
      console.error('[AccountLogin] Error starting Riot Client:', error)
      throw error
    }
  }

  async logoutCurrentAccount(): Promise<void> {
    try {
      console.log('[AccountLogin] Attempting to logout current account via LCU...')

      // Try to use LCU to logout
      const lcuConnectorModule = await import('./lcuConnector')
      const lcuConnector = lcuConnectorModule.lcuConnector

      try {
        // Check if LCU is connected
        const isConnected = lcuConnector.isConnected()

        if (isConnected) {
          // Try to logout via LCU API
          await lcuConnector.request('POST', '/riotclient/kill-and-restart-ux')
          console.log('[AccountLogin] Sent logout request to LCU')
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      } catch (lcuError) {
        console.log('[AccountLogin] LCU logout failed, will kill League processes:', lcuError)
      }

      // Always kill League processes to ensure clean state
      await this.killLeagueOnly()
    } catch (error) {
      console.error('[AccountLogin] Error during logout:', error)
      // Even if logout fails, try to kill processes
      await this.killLeagueOnly()
    }
  }

  async launchLeagueWithAccount(credentials: LoginCredentials): Promise<void> {
    try {
      console.log('[AccountLogin] Launching League with account...')

      if (!this.riotClientPath) {
        await this.findRiotClient()
      }

      if (!this.riotClientPath) {
        throw new Error('League Client bulunamadı')
      }

      if (process.platform === 'darwin') {
        // Mac: Write credentials to Riot Client's settings file
        try {
          const settingsPath = path.join(
            app.getPath('home'),
            'Library',
            'Application Support',
            'Riot Games',
            'RiotClientPrivateSettings.yaml'
          )

          // Create the settings content with credentials
          const settingsContent = `
riot-login:
  persist:
    session:
      username: "${credentials.username}"
      password: "${credentials.password}"
      remember: true
`

          // Ensure directory exists
          const settingsDir = path.dirname(settingsPath)
          try {
            await fs.access(settingsDir)
          } catch {
            await fs.mkdir(settingsDir, { recursive: true })
          }

          // Write settings file
          await fs.writeFile(settingsPath, settingsContent, 'utf-8')
          console.log('[AccountLogin] Credentials written to settings file')
        } catch (settingsError) {
          console.error('[AccountLogin] Failed to write settings:', settingsError)
          // Continue anyway - user can login manually
        }

        // Launch Riot Client (not LeagueClient directly)
        let appPath = this.riotClientPath
        if (appPath.includes('/Contents/MacOS/')) {
          appPath = appPath.substring(0, appPath.indexOf('/Contents/MacOS/'))
        }

        console.log('[AccountLogin] Opening Riot Client at:', appPath)

        // Launch with League of Legends product argument
        await execAsync(
          `open "${appPath}" --args --launch-product=league_of_legends --launch-patchline=live`
        )
      } else if (process.platform === 'win32') {
        // Windows: Use Riot Client with command-line arguments
        const args = [
          '--launch-product=league_of_legends',
          '--launch-patchline=live',
          `--username=${credentials.username}`,
          `--password=${credentials.password}`
        ]

        const { spawn } = await import('child_process')
        console.log('[AccountLogin] Launching with credentials on Windows')
        spawn(this.riotClientPath, args, {
          detached: true,
          stdio: 'ignore',
          windowsHide: true
        }).unref()
      }

      console.log('[AccountLogin] Launch command sent')

      // Wait for the launch to process
      await new Promise((resolve) => setTimeout(resolve, 3000))
    } catch (error) {
      console.error('[AccountLogin] Error launching League:', error)
      throw error
    }
  }

  async login(credentials: LoginCredentials): Promise<void> {
    try {
      console.log('[AccountLogin] Starting login process...')

      // Step 1: Check if Riot Client is running
      const riotClientRunning = await this.isRiotClientRunning()

      if (!riotClientRunning) {
        console.log('[AccountLogin] Riot Client not running, starting it...')
        await this.startRiotClient()
        // Wait for Riot Client to fully start
        await new Promise((resolve) => setTimeout(resolve, 5000))
      } else {
        console.log('[AccountLogin] Riot Client is already running')
      }

      // Step 2: Logout from current account and kill League processes
      await this.logoutCurrentAccount()

      // Step 3: Launch League with new account credentials
      await this.launchLeagueWithAccount(credentials)

      console.log('[AccountLogin] Login process completed')
    } catch (error) {
      console.error('[AccountLogin] Login failed:', error)
      throw error
    }
  }

  async waitForLCU(maxWaitTime: number = 60000): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Check if lockfile exists
        const lockfilePaths = this.getLockfilePaths()

        for (const lockfilePath of lockfilePaths) {
          try {
            await fs.access(lockfilePath)
            console.log('[AccountLogin] LCU is ready, lockfile found at:', lockfilePath)
            return true
          } catch {
            // Lockfile doesn't exist yet
            continue
          }
        }
      } catch {
        // Error checking lockfile
      }

      // Wait 1 second before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log('[AccountLogin] LCU did not start within timeout')
    return false
  }

  private getLockfilePaths(): string[] {
    const paths: string[] = []

    if (process.platform === 'darwin') {
      paths.push(
        // Primary location - directly in LoL directory
        '/Applications/League of Legends.app/Contents/LoL/lockfile',
        // Alternative location - user's home directory
        path.join(
          app.getPath('home'),
          'Applications',
          'League of Legends.app',
          'Contents',
          'LoL',
          'lockfile'
        )
      )
    } else if (process.platform === 'win32') {
      paths.push(
        path.join(process.env.LOCALAPPDATA || '', 'Riot Games', 'League of Legends', 'lockfile'),
        path.join(
          process.env.PROGRAMFILES || 'C:\\Program Files',
          'Riot Games',
          'League of Legends',
          'lockfile'
        )
      )
    }

    return paths
  }
}

export const accountLoginService = new AccountLoginService()
