import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../build/icon.png?asset'
import { championDataService } from './services/championDataService'
import { settingsService } from './services/settingsService'
import { UpdaterService } from './services/updaterService'
import { lcuConnector } from './services/lcuConnector'
import { gameflowMonitor } from './services/gameflowMonitor'
import { teamCompositionMonitor } from './services/teamCompositionMonitor'
import { preselectLobbyMonitor } from './services/preselectLobbyMonitor'
import { autoBanPickService } from './services/autoBanPickService'
import {
  translationService,
  supportedLanguages,
  type LanguageCode
} from './services/translationService'
import { licenseService } from './services/licenseService'
import { versionCheckService } from './services/versionCheckService'
import { remoteControlService } from './services/remoteControlService'
import { autoMessageService } from './services/autoMessageService'
import { runeService } from './services/runeService'
import { autoRuneService } from './services/autoRuneService'
import { autoSpellService } from './services/autoSpellService'
import { spellService } from './services/spellService'
import { liveGameService } from './services/liveGameService'
import { integrityService } from './services/integrityService'
import { antiDebugService } from './services/antiDebugService'
import { fetchProtectionService } from './services/fetchProtectionService'

// Initialize services
const updaterService = new UpdaterService()

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('autrex', process.execPath, [join(process.cwd(), 'out')])
  } else {
    app.setAsDefaultProtocolClient('autrex')
  }
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    // Handle protocol URL on Windows/Linux
    const url = commandLine.pop()
    if (url && url.startsWith('autrex://')) {
      handleAuthToken(url)
    }
  })
}

function handleAuthToken(url: string) {
  const urlObj = new URL(url)
  const token = urlObj.searchParams.get('token')
  if (token && mainWindow) {
    mainWindow.webContents.send('auth-token', token)
  }
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: is.dev // Only allow DevTools in development
    }
  })

  // Prevent DevTools in production
  if (!is.dev) {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools()
      antiDebugService.stopProtection()
      dialog.showErrorBox(
        'Security Alert',
        'Developer tools are not allowed in production. The application will now close.'
      )
      app.quit()
    })
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // Set main window for updater service
    if (mainWindow) {
      updaterService.setMainWindow(mainWindow)
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function updateTrayMenu(): void {
  if (!tray) return

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.show()
          mainWindow.focus()
        } else {
          createWindow()
        }
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

function createTray(): void {
  const trayIcon = nativeImage.createFromPath(icon)
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))
  tray.setToolTip('Autrex')
  updateTrayMenu()

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    } else {
      createWindow()
    }
  })
}

if (gotTheLock) {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(async () => {
    // CRITICAL: Install fetch protection FIRST before any network calls
    fetchProtectionService.install()
    fetchProtectionService.startIntegrityMonitoring(10000) // Check every 10 seconds

    // Start anti-debug protection
    antiDebugService.startProtection()

    // Check for VM
    if (antiDebugService.checkVirtualMachine()) {
      console.warn('[Security] Running in virtual machine - monitoring enabled')
    }

    // Perform integrity checks
    const integrityCheck = await integrityService.performAllChecks()
    if (!integrityCheck.valid) {
      console.error('[Security] Integrity check failed:', integrityCheck.reason)
      dialog.showErrorBox(
        'Security Warning',
        `Application integrity check failed: ${integrityCheck.reason}\n\nThe application may have been tampered with. Please reinstall from official sources.`
      )
      app.quit()
      return
    }

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.autrex')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // Initialize services (no initialization methods needed for these services)
    // championDataService and translationService are singletons that initialize themselves

    createWindow()
    createTray()

    console.log('[Main] Window and tray created, setting up handlers...')
    
    setupIpcHandlers()
    setupLCUConnection()

    console.log('[Main] Scheduling update check in 3 seconds...')
    
    // Check for updates on startup (after a short delay)
    setTimeout(() => {
      console.log('[Main] Running scheduled update check...')
      updaterService.checkForUpdates().catch((err) => {
        console.error('[Updater] Failed to check for updates on startup:', err)
      })
    }, 3000)

    // Start periodic license validation if license exists
    const licenseStatus = licenseService.checkLicenseStatus()
    if (licenseStatus.valid) {
      licenseService.startPeriodicValidation(() => {
        // Send notification to renderer when license becomes invalid
        if (mainWindow) {
          mainWindow.webContents.send('license:invalidated')
        }
      })
    }

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // Handle protocol links on macOS
    app.on('open-url', (event, url) => {
      event.preventDefault()
      handleAuthToken(url)
    })
  })
}

if (gotTheLock) {
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

function setupIpcHandlers(): void {
  // License management
  ipcMain.handle('license:activate', async (_, key: string) => {
    try {
      const result = await licenseService.activateLicenseOnline(key)

      // Start periodic validation if activation successful
      if (result.valid) {
        licenseService.startPeriodicValidation(() => {
          // Send notification to renderer when license becomes invalid
          if (mainWindow) {
            mainWindow.webContents.send('license:invalidated')
          }

          // Stop LCU services when license becomes invalid
          cleanup()
        })

        // Setup LCU connection now that license is valid
        setupLCUConnection()
      }

      return result
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle('license:status', () => {
    try {
      const result = licenseService.checkLicenseStatus()
      return result
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle('license:deactivate', async () => {
    try {
      // Stop periodic validation
      licenseService.stopPeriodicValidation()

      // Stop all LCU services immediately
      console.log('[Main] Stopping all services due to license deactivation')
      cleanup()

      // Deactivate online
      await licenseService.deactivateLicenseOnline()

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle('license:info', () => {
    try {
      const info = licenseService.getLicenseInfo()
      return { success: true, info }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  // Settings management
  ipcMain.handle('get-settings', (_, key?: string) => {
    return settingsService.get(key)
  })

  ipcMain.handle('set-settings', (_, key: string, value: any) => {
    settingsService.set(key, value)
    return { success: true }
  })

  // Theme management
  ipcMain.handle('theme:save', async (_, config: any) => {
    try {
      // Save theme configuration to settings service
      settingsService.set('theme_config', config)
      return { success: true }
    } catch (error) {
      console.error('[Main] Failed to save theme config:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle('theme:load', () => {
    try {
      const config = settingsService.get('theme_config')
      return { success: true, config }
    } catch (error) {
      console.error('[Main] Failed to load theme config:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle('theme:save-custom', async (_, themes: any[]) => {
    try {
      // Save custom themes to settings service
      settingsService.set('custom_themes', themes)
      return { success: true }
    } catch (error) {
      console.error('[Main] Failed to save custom themes:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle('theme:load-custom', () => {
    try {
      const themes = settingsService.get('custom_themes') || []
      return { success: true, themes }
    } catch (error) {
      console.error('[Main] Failed to load custom themes:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  // Champion data
  ipcMain.handle('get-champion-data', async (_, language: string = 'en_US') => {
    return await championDataService.loadChampionData(language)
  })

  ipcMain.handle('update-champion-data', async (_, language: string = 'en_US') => {
    try {
      const result = await championDataService.fetchAndSaveChampionData(language)
      return result
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Translation
  ipcMain.handle('get-translations', (_, language: LanguageCode) => {
    translationService.setLanguage(language)
    return { success: true }
  })

  ipcMain.handle('get-supported-languages', () => {
    return supportedLanguages
  })

  // LCU Connection handlers
  ipcMain.handle('lcu:connect', async () => {
    try {
      await lcuConnector.connect()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('lcu:disconnect', () => {
    lcuConnector.disconnect()
    return { success: true }
  })

  ipcMain.handle('lcu:get-status', () => {
    return {
      connected: lcuConnector.isConnected(),
      gameflowPhase: gameflowMonitor.getCurrentPhase()
    }
  })

  ipcMain.handle('lcu:get-current-phase', () => {
    return gameflowMonitor.getCurrentPhase()
  })

  ipcMain.handle('lcu:get-champ-select-session', async () => {
    try {
      return await lcuConnector.getChampSelectSession()
    } catch {
      return null
    }
  })

  ipcMain.handle('lcu:get-owned-champions', async () => {
    try {
      const result = await lcuConnector.getOwnedChampions()
      console.log('[Main] LCU owned champions result:', result)
      return result
    } catch (err) {
      console.error('[Main] Failed to get owned champions:', err)
      return []
    }
  })

  ipcMain.handle('lcu:get-all-champions', async () => {
    try {
      const result = await lcuConnector.getAllChampions()
      console.log('[Main] LCU all champions result:', result)
      return result
    } catch (err) {
      console.error('[Main] Failed to get all champions:', err)
      return []
    }
  })

  ipcMain.handle('lcu:get-current-summoner', async () => {
    try {
      const result = await lcuConnector.getCurrentSummoner()
      console.log('[Main] LCU current summoner result:', result)
      return result
    } catch (err) {
      console.error('[Main] Failed to get current summoner:', err)
      return { success: false, error: 'Failed to get summoner info' }
    }
  })

  // Generic LCU request handler
  ipcMain.handle(
    'lcu:request',
    async (_, method: string, endpoint: string, body?: Record<string, unknown>) => {
      try {
        return await lcuConnector.request(method, endpoint, body)
      } catch (err) {
        console.error('[Main] LCU request failed:', err)
        throw err
      }
    }
  )

  // Accounts Manager handlers
  ipcMain.handle('accounts:load', async () => {
    try {
      const { accountsService } = await import('./services/accountsService')
      const accounts = await accountsService.loadAccounts()
      return { success: true, accounts }
    } catch (error: any) {
      console.error('[Main] Failed to load accounts:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(
    'accounts:add',
    async (_, account: { username: string; password: string; note?: string }) => {
      try {
        const { accountsService } = await import('./services/accountsService')
        await accountsService.addAccount(account)
        return { success: true }
      } catch (error: any) {
        console.error('[Main] Failed to add account:', error)
        return { success: false, error: error.message }
      }
    }
  )

  ipcMain.handle('accounts:delete', async (_, usernames: string[]) => {
    try {
      const { accountsService } = await import('./services/accountsService')
      await accountsService.deleteAccounts(usernames)
      return { success: true }
    } catch (error: any) {
      console.error('[Main] Failed to delete accounts:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(
    'accounts:login',
    async (_, credentials: { username: string; password: string }) => {
      try {
        const { accountLoginService } = await import('./services/accountLoginService')

        // Login to the account
        await accountLoginService.login(credentials)

        // Wait for LCU to be ready
        const lcuReady = await accountLoginService.waitForLCU(60000)

        if (!lcuReady) {
          return { success: false, error: 'LCU başlatılamadı. Lütfen manuel olarak kontrol edin.' }
        }

        return { success: true }
      } catch (error: any) {
        console.error('[Main] Failed to login:', error)
        return { success: false, error: error.message || 'Giriş yapılamadı' }
      }
    }
  )

  ipcMain.handle(
    'accounts:pull-data',
    async (_, credentials: { username: string; password: string }) => {
      try {
        const { accountsService } = await import('./services/accountsService')

        // Don't login - just pull data from currently open LCU
        // Ensure LCU connector is connected
        if (!lcuConnector.isConnected()) {
          console.log('[Main] LCU not connected, attempting to connect...')
          try {
            await lcuConnector.connect()
            // Wait for connection to stabilize
            await new Promise((resolve) => setTimeout(resolve, 2000))
          } catch (connectError) {
            console.error('[Main] Failed to connect to LCU:', connectError)
            return {
              success: false,
              error: 'LCU bağlantısı kurulamadı. League Client açık olduğundan emin olun.'
            }
          }
        }

        // Now pull data from LCU
        try {
          // Get summoner info
          const summonerResp = await lcuConnector.request(
            'GET',
            '/lol-summoner/v1/current-summoner'
          )
          const summoner = summonerResp as any

          // Get ranked stats
          const rankedResp = await lcuConnector.request(
            'GET',
            `/lol-ranked/v1/ranked-stats/${summoner.puuid}`
          )
          const ranked = rankedResp as any

          // Get wallet - try first, but may not work
          let blueEssence = 0
          let riotPoints = 0
          try {
            const walletResp = await lcuConnector.request('GET', '/lol-store/v1/wallet')
            const wallet = walletResp as any
            console.log('[Main] Wallet response:', JSON.stringify(wallet, null, 2))
            blueEssence = wallet?.ip || 0
            riotPoints = wallet?.rp || 0
          } catch {
            console.log('[Main] Wallet endpoint failed, will use loot data instead')
          }

          // Get loot (for Orange Essence, BE, and RP)
          let orangeEssence = 0
          try {
            const lootResp = await lcuConnector.request('GET', '/lol-loot/v1/player-loot')
            const loot = lootResp as any
            console.log(
              '[Main] Loot response sample:',
              Array.isArray(loot) ? loot.slice(0, 5) : loot
            )
            if (Array.isArray(loot)) {
              // Find currencies
              const cosmeticCurrency = loot.find((item: any) => item.lootId === 'CURRENCY_cosmetic')
              const rpCurrency = loot.find((item: any) => item.lootId === 'CURRENCY_RP')
              const beCurrency = loot.find((item: any) => item.lootId === 'CURRENCY_champion')

              orangeEssence = cosmeticCurrency?.count || 0

              // If wallet failed, use loot data
              if (riotPoints === 0 && rpCurrency) {
                riotPoints = rpCurrency.count || 0
              }
              if (blueEssence === 0 && beCurrency) {
                blueEssence = beCurrency.count || 0
              }

              console.log(
                '[Main] Currencies from loot - OE:',
                orangeEssence,
                'RP:',
                riotPoints,
                'BE:',
                blueEssence
              )
            }
          } catch (lootError) {
            console.error('[Main] Failed to get loot:', lootError)
          }

          // Get owned champions
          const championsResp = await lcuConnector.request(
            'GET',
            '/lol-champions/v1/owned-champions-minimal'
          )
          const champions = championsResp as any

          // Get skins
          const skinsResp = await lcuConnector.request(
            'GET',
            '/lol-inventory/v2/inventory/CHAMPION_SKIN'
          )
          const skins = skinsResp as any

          // Get region
          const regionResp = await lcuConnector.request('GET', '/riotclient/region-locale')
          const region = regionResp as any

          // Build rank strings
          const soloQueue = ranked?.queueMap?.RANKED_SOLO_5x5
          const flexQueue = ranked?.queueMap?.RANKED_FLEX_SR

          console.log('[Main] SoloQ data:', soloQueue)
          console.log('[Main] FlexQ data:', flexQueue)

          const buildRank = (queue: any) => {
            if (!queue || !queue.tier || queue.tier === 'NONE') return 'Unranked'
            const tier = queue.tier
            const division = queue.division || ''
            return division ? `${tier} ${division}` : tier
          }

          const soloRank = buildRank(soloQueue)
          const flexRank = buildRank(flexQueue)

          console.log('[Main] Built ranks - Solo:', soloRank, 'Flex:', flexRank)

          console.log('[Main] Final extracted values:')
          console.log('  - BE:', blueEssence)
          console.log('  - RP:', riotPoints)
          console.log('  - OE:', orangeEssence)

          // Update account in database
          await accountsService.updateAccount(credentials.username, {
            riotID: `${summoner.gameName}#${summoner.tagLine}`,
            level: summoner.summonerLevel || 0,
            server: region?.region || '',
            be: blueEssence,
            rp: riotPoints,
            oe: orangeEssence,
            rank: soloRank,
            rank2: flexRank,
            champions: Array.isArray(champions) ? champions.length : 0,
            skins: Array.isArray(skins) ? skins.length : 0
          })

          return { success: true }
        } catch (lcuError: any) {
          console.error('[Main] Failed to pull data from LCU:', lcuError)
          return { success: false, error: "LCU'dan veri çekilemedi: " + lcuError.message }
        }
      } catch (error: any) {
        console.error('[Main] Failed to pull data:', error)
        return { success: false, error: error.message || 'Bilgiler çekilemedi' }
      }
    }
  )

  // Get account champion details
  ipcMain.handle('accounts:get-champions', async () => {
    try {
      if (!lcuConnector.isConnected()) {
        return { success: false, error: 'LCU bağlı değil' }
      }

      const championsResp = await lcuConnector.request(
        'GET',
        '/lol-champions/v1/owned-champions-minimal'
      )
      const champions = championsResp as any[]

      if (!Array.isArray(champions)) {
        console.error('[Main] Champions response is not an array:', champions)
        return { success: false, error: 'Geçersiz şampiyon verisi' }
      }

      // Load champion data for names and images
      let championData: any = null
      try {
        championData = await championDataService.loadChampionData('tr_TR')
        console.log(
          '[Main] Champion data loaded, has champions array:',
          championData?.champions ? championData.champions.length : 'null'
        )
      } catch (champError) {
        console.warn('[Main] Could not load champion data:', champError)
      }

      // Create a map for faster lookup
      const championMap = new Map()
      if (championData?.champions) {
        championData.champions.forEach((champ: any) => {
          championMap.set(champ.id, champ)
        })
      }

      const championList = champions
        .filter((c: any) => {
          try {
            return c && c.ownership && c.ownership.owned === true
          } catch {
            return false
          }
        })
        .map((c: any) => {
          try {
            const champInfo = championMap.get(c.id)
            // Only return plain data, no nested objects
            return {
              id: Number(c.id || 0),
              name: String(champInfo?.name || c.name || `Champion ${c.id}`),
              alias: String(champInfo?.alias || c.alias || ''),
              imageUrl: champInfo?.alias
                ? `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champInfo.alias}.png`
                : null
            }
          } catch (mapError) {
            console.error('[Main] Error mapping champion:', c, mapError)
            return null
          }
        })
        .filter((c) => c !== null)
        .sort((a, b) => {
          try {
            return (a?.name || '').localeCompare(b?.name || '')
          } catch {
            return 0
          }
        })

      console.log(
        '[Main] Returning champions:',
        championList.length,
        'sample:',
        championList.slice(0, 2)
      )
      return { success: true, champions: championList }
    } catch (error: any) {
      console.error('[Main] Failed to get champions:', error)
      return { success: false, error: error.message || 'Şampiyonlar yüklenemedi' }
    }
  })

  // Get account skin details
  ipcMain.handle('accounts:get-skins', async () => {
    try {
      if (!lcuConnector.isConnected()) {
        return { success: false, error: 'LCU bağlı değil' }
      }

      const skinsResp = await lcuConnector.request(
        'GET',
        '/lol-inventory/v2/inventory/CHAMPION_SKIN'
      )
      const skins = skinsResp as any[]

      if (!Array.isArray(skins)) {
        console.error('[Main] Skins response is not an array:', skins)
        return { success: false, error: 'Geçersiz skin verisi' }
      }

      // Load champion data for names
      let championData: any = null
      try {
        championData = await championDataService.loadChampionData('tr_TR')
        console.log(
          '[Main] Champion data loaded for skins, has champions array:',
          championData?.champions ? championData.champions.length : 'null'
        )
      } catch (champError) {
        console.warn('[Main] Could not load champion data:', champError)
      }

      // Create a map for faster lookup
      const championMap = new Map()
      if (championData?.champions) {
        championData.champions.forEach((champ: any) => {
          championMap.set(champ.id, champ)
        })
      }

      const skinList = skins
        .slice(0, 500) // Limit to first 500 to avoid performance issues
        .map((skinId: number) => {
          try {
            const championId = Math.floor(skinId / 1000)
            const skinNum = skinId % 1000

            // Find champion info
            const champInfo = championMap.get(championId)
            const championName = champInfo?.name || `Champion ${championId}`
            const championAlias = champInfo?.alias || ''

            // Find skin info
            const skinInfo = champInfo?.skins?.find((s: any) => s.num === skinNum)
            const skinName = skinInfo?.name || `Skin ${skinNum}`

            // Only return plain data, no nested objects
            return {
              id: Number(skinId),
              championId: Number(championId),
              championName: String(championName),
              championAlias: String(championAlias),
              skinName: String(skinName),
              skinNum: Number(skinNum),
              championImageUrl: championAlias
                ? `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${championAlias}.png`
                : null,
              skinImageUrl: championAlias
                ? `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championAlias}_${skinNum}.jpg`
                : null
            }
          } catch (mapError) {
            console.error('[Main] Error mapping skin:', skinId, mapError)
            return null
          }
        })
        .filter((skin) => skin !== null)

      console.log('[Main] Returning skins:', skinList.length, 'sample:', skinList.slice(0, 2))
      return { success: true, skins: skinList }
    } catch (error: any) {
      console.error('[Main] Failed to get skins:', error)
      return { success: false, error: error.message || 'Skinler yüklenemedi' }
    }
  })

  // Settings Editor handlers
  ipcMain.handle('settings:load', async () => {
    try {
      const { settingsEditorService } = await import('./services/settingsEditorService')
      const result = await settingsEditorService.loadSettings()
      return { success: true, ...result }
    } catch (error: any) {
      console.error('[Main] Failed to load settings:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:save', async (_, data: { sections: any[] }) => {
    try {
      const { settingsEditorService } = await import('./services/settingsEditorService')
      await settingsEditorService.saveSettings(data.sections)
      return { success: true }
    } catch (error: any) {
      console.error('[Main] Failed to save settings:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:export', async () => {
    try {
      const { settingsEditorService } = await import('./services/settingsEditorService')
      await settingsEditorService.exportSettings()
      return { success: true }
    } catch (error: any) {
      console.error('[Main] Failed to export settings:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:import', async () => {
    try {
      const { settingsEditorService } = await import('./services/settingsEditorService')
      await settingsEditorService.importSettings()
      return { success: true }
    } catch (error: any) {
      console.error('[Main] Failed to import settings:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:toggle-lock', async (_, data: { lock: boolean }) => {
    try {
      const { settingsEditorService } = await import('./services/settingsEditorService')
      await settingsEditorService.toggleLock(data.lock)
      return { success: true }
    } catch (error: any) {
      console.error('[Main] Failed to toggle lock:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:apply-to-client', async (_, data: { sections: any[] }) => {
    try {
      const { settingsEditorService } = await import('./services/settingsEditorService')
      await settingsEditorService.saveSettings(data.sections)
      // Restart League client would go here
      return { success: true }
    } catch (error: any) {
      console.error('[Main] Failed to apply to client:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('settings:apply-to-account', async (_, _data: { sections: any[] }) => {
    try {
      // This would apply settings via LCU API
      console.log('[Main] Apply to account requested')
      return { success: true }
    } catch (error: any) {
      console.error('[Main] Failed to apply to account:', error)
      return { success: false, error: error.message }
    }
  })

  // Game detection
  ipcMain.handle('detect-game', () => {
    // Return a simple game detection result
    return { gameDetected: false, gamePath: null }
  })

  // Champion data loading
  ipcMain.handle('load-champion-data', async (_, language: string = 'en_US') => {
    try {
      const data = await championDataService.loadChampionData(language)
      if (data) {
        return { success: true, data }
      } else {
        return { success: false, error: 'No champion data found' }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Champion data fetching
  ipcMain.handle('fetch-champion-data', async (_, language: string = 'en_US') => {
    try {
      const result = await championDataService.fetchAndSaveChampionData(language)
      return result
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Preset management (placeholder handlers)
  ipcMain.handle('preset:list', () => {
    return []
  })

  ipcMain.handle('preset:save', () => {
    return { success: false, error: 'Preset functionality removed' }
  })

  ipcMain.handle('preset:load', () => {
    return { success: false, error: 'Preset functionality removed' }
  })

  ipcMain.handle('preset:delete', () => {
    return { success: false, error: 'Preset functionality removed' }
  })

  // Additional skin management handlers
  ipcMain.handle('list-downloaded-skins', () => {
    return []
  })

  // Skin management (placeholder handlers)
  ipcMain.handle('get-downloaded-skins', () => {
    return []
  })

  ipcMain.handle('get-favorites', () => {
    return []
  })

  // Cache management
  ipcMain.handle('get-cache-info', () => {
    return { size: 0, files: 0 }
  })

  // Patcher controls (placeholder handlers)
  ipcMain.handle('is-patcher-running', () => {
    return false
  })

  ipcMain.handle('run-patcher', () => {
    return { success: false, error: 'Patcher functionality removed' }
  })

  ipcMain.handle('stop-patcher', () => {
    return { success: true }
  })

  ipcMain.handle('cancel-apply', () => {
    return { success: true }
  })

  ipcMain.handle('is-applying', () => {
    return false
  })

  // Dialog handlers
  ipcMain.handle('dialog:openFile', async (_, options) => {
    if (!mainWindow) return { canceled: true, filePaths: [] }
    return await dialog.showOpenDialog(mainWindow, options)
  })

  // Version check handlers
  ipcMain.handle('version:check', async () => {
    return await versionCheckService.checkVersion()
  })

  ipcMain.handle('version:current', () => {
    return versionCheckService.getCurrentVersion()
  })

  // Remote Control handlers
  ipcMain.handle('remote:start', async () => {
    try {
      const hwid = licenseService.generateHardwareId()
      const session = await remoteControlService.startSession(hwid)

      // Send initial game status with summoner data
      try {
        const currentPhase = gameflowMonitor.getCurrentPhase()
        const summoner = await lcuConnector.getCurrentSummoner()
        const ownedChampions = await lcuConnector.getOwnedChampions()
        const ownedChampionIds = ownedChampions.map((c: any) => c.id)

        console.log('[Main] Sending initial game status to remote control:', {
          phase: currentPhase,
          summoner: summoner?.displayName,
          ownedChampionsCount: ownedChampionIds.length
        })

        await remoteControlService.updateGameStatus(currentPhase, summoner, ownedChampionIds)
      } catch (error) {
        console.error('[Main] Failed to send initial game status:', error)
        // Continue anyway, status will be updated on next phase change
      }

      return { success: true, session }
    } catch (error) {
      console.error('[Main] Failed to start remote session:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('remote:stop', async () => {
    try {
      await remoteControlService.stopSession()
      return { success: true }
    } catch (error) {
      console.error('[Main] Failed to stop remote session:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('remote:status', () => {
    const session = remoteControlService.getCurrentSession()
    return {
      isActive: remoteControlService.isActive(),
      session
    }
  })

  // File management
  ipcMain.handle('get-pending-files', () => {
    return []
  })

  ipcMain.handle('clear-pending-files', () => {
    return { success: true }
  })

  // Auto ban/pick handlers
  ipcMain.handle('set-auto-pick-champions', (_, championIds: number[]) => {
    autoBanPickService.setPickChampions(championIds)
    return { success: true }
  })

  ipcMain.handle('set-auto-ban-champions', (_, championIds: number[]) => {
    autoBanPickService.setBanChampions(championIds)
    return { success: true }
  })

  // Rune page handlers
  ipcMain.handle('runes:get-pages', async () => {
    try {
      const pages = await runeService.getRunePages()
      return { success: true, pages }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('runes:get-current-page', async () => {
    try {
      const page = await runeService.getCurrentRunePage()
      return { success: true, page }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('runes:get-trees', async () => {
    try {
      const trees = await runeService.getRuneTrees()
      return { success: true, trees }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('runes:create-page', async (_, page) => {
    try {
      // Check if at max capacity and delete oldest if needed
      await runeService.deleteOldestEditablePageIfNeeded()

      const newPage = await runeService.createRunePage(page)
      return { success: true, page: newPage }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('runes:update-page', async (_, pageId, page) => {
    try {
      const updatedPage = await runeService.updateRunePage(pageId, page)
      return { success: true, page: updatedPage }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('runes:delete-page', async (_, pageId) => {
    try {
      const success = await runeService.deleteRunePage(pageId)
      return { success }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('runes:set-current-page', async (_, pageId) => {
    try {
      const success = await runeService.setCurrentRunePage(pageId)
      return { success }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Auto rune handlers
  ipcMain.handle('auto-rune:start', () => {
    autoRuneService.start()
    return { success: true }
  })

  ipcMain.handle('auto-rune:stop', () => {
    autoRuneService.stop()
    return { success: true }
  })

  ipcMain.handle('auto-rune:set-target-page', (_, pageId) => {
    autoRuneService.setTargetPage(pageId)
    return { success: true }
  })

  ipcMain.handle('auto-rune:get-target-page', () => {
    return { success: true, pageId: autoRuneService.getTargetPage() }
  })

  ipcMain.handle('auto-rune:get-status', () => {
    return {
      success: true,
      isRunning: autoRuneService.isRunning(),
      targetPageId: autoRuneService.getTargetPage()
    }
  })

  // Auto spell handlers
  ipcMain.handle('auto-spell:start', () => {
    autoSpellService.start()
    settingsService.set('autoSpellEnabled', true)
    return { success: true }
  })

  ipcMain.handle('auto-spell:stop', () => {
    autoSpellService.stop()
    settingsService.set('autoSpellEnabled', false)
    return { success: true }
  })

  ipcMain.handle('auto-spell:set-target-spells', (_, spell1Id, spell2Id) => {
    autoSpellService.setTargetSpells(spell1Id, spell2Id)
    return { success: true }
  })

  ipcMain.handle('auto-spell:get-target-spells', () => {
    const spells = autoSpellService.getTargetSpells()
    return { success: true, ...spells }
  })

  ipcMain.handle('auto-spell:get-status', () => {
    const spells = autoSpellService.getTargetSpells()
    return {
      success: true,
      isRunning: autoSpellService.isRunning(),
      ...spells
    }
  })

  // Spell handlers
  ipcMain.handle('spells:get-available', async () => {
    try {
      const spells = await spellService.getAvailableSpells()
      return { success: true, spells }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('spells:get-current', async () => {
    try {
      const spells = await spellService.getCurrentSpells()
      return { success: true, spells }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('spells:set', async (_, spell1Id, spell2Id) => {
    try {
      const success = await spellService.setSpells(spell1Id, spell2Id)
      return { success }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Auto message handlers
  ipcMain.handle('auto-message:update-settings', (_, settings) => {
    autoMessageService.updateSettings(settings)
    return { success: true }
  })

  ipcMain.handle('auto-message:get-status', () => {
    return autoMessageService.getStatus()
  })

  // Live game handlers
  ipcMain.handle('live-game:start', () => {
    liveGameService.startPolling()
    return { success: true }
  })

  ipcMain.handle('live-game:stop', () => {
    liveGameService.stopPolling()
    return { success: true }
  })

  ipcMain.handle('live-game:get-data', () => {
    return liveGameService.getLastGameData()
  })

  ipcMain.handle('live-game:get-state', () => {
    return liveGameService.getConnectionState()
  })

  // Setup live game listeners
  liveGameService.onGameData((data) => {
    mainWindow?.webContents.send('live-game:data', data)
  })

  liveGameService.onConnectionState((state) => {
    console.log('[LiveGame] State changed to:', state)
    mainWindow?.webContents.send('live-game:state', state)
  })

  // Start live game polling automatically
  liveGameService.startPolling()

  // Open external links
  ipcMain.on('open-external', (_, url: string) => {
    shell.openExternal(url).catch((err) => {
      console.error('Failed to open external URL:', err)
    })
  })

  // App version
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // Updater
  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await updaterService.checkForUpdates()
      return result
    } catch (error) {
      return { hasUpdate: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('download-update', async () => {
    try {
      const result = await updaterService.downloadUpdate()
      return result
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('install-update', async () => {
    try {
      updaterService.quitAndInstall()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('quit-and-install', async () => {
    try {
      updaterService.quitAndInstall()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('cancel-update', async () => {
    try {
      updaterService.cancelUpdate()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('get-update-changelog', async () => {
    try {
      const changelog = await updaterService.getChangelog()
      return { success: true, changelog }
    } catch (error) {
      return {
        success: false,
        changelog: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  ipcMain.handle('get-update-info', () => {
    try {
      const info = updaterService.getUpdateInfo()
      return { success: true, info }
    } catch (error) {
      return {
        success: false,
        info: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  // Window controls
  ipcMain.handle('minimize-window', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.minimize()
    }
    return { success: true }
  })

  ipcMain.handle('maximize-window', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
    }
    return { success: true }
  })

  ipcMain.handle('close-window', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.close()
    }
    return { success: true }
  })

  ipcMain.handle('window-is-maximized', () => {
    const window = BrowserWindow.getFocusedWindow()
    return window ? window.isMaximized() : false
  })

  // Renderer ready notification
  ipcMain.handle('renderer-ready', () => {
    return { success: true }
  })

  // Misc tools handlers
  ipcMain.handle('nuke-logs', async () => {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')

      const leaguePath = settingsService.get('leaguePath') || ''
      if (!leaguePath) {
        return { success: false, error: 'League path not found' }
      }

      const logsPath = path.join(leaguePath, 'Logs')
      const deletedFiles: string[] = []

      try {
        const files = await fs.readdir(logsPath)
        for (const file of files) {
          const filePath = path.join(logsPath, file)
          await fs.unlink(filePath)
          deletedFiles.push(file)
        }
        return { success: true, deletedCount: deletedFiles.length, files: deletedFiles }
      } catch {
        return { success: false, error: 'Logs folder not found or empty' }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('get-riot-hwid', async () => {
    try {
      const hwid = licenseService.generateHardwareId()
      return { success: true, hwid }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('disable-riot-autolaunch', async () => {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')

      const riotPath = settingsService.get('riotPath') || ''
      if (!riotPath) {
        return { success: false, error: 'Riot path not found' }
      }

      const configPath = path.join(riotPath, 'RiotClientInstalls.json')

      try {
        const configData = await fs.readFile(configPath, 'utf-8')
        const config = JSON.parse(configData)
        config.rc_default = { ...config.rc_default, launch_on_startup: false }
        await fs.writeFile(configPath, JSON.stringify(config, null, 2))
        return { success: true }
      } catch {
        return { success: false, error: 'Config file not found' }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('uninstall-league', async () => {
    try {
      const leaguePath = settingsService.get('leaguePath') || ''
      if (!leaguePath) {
        return { success: false, error: 'League path not found' }
      }

      // This is a dangerous operation - just return success for now
      // In production, you'd want to run the actual uninstaller
      return { success: false, error: 'Uninstall functionality disabled for safety' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })
}

function setupLCUConnection(): void {
  // IMPORTANT: Only setup LCU connection if license is valid
  const licenseStatus = licenseService.checkLicenseStatus()
  if (!licenseStatus.valid) {
    console.log('[Main] License not valid, skipping LCU connection setup')
    return
  }

  // Forward LCU events to renderer
  lcuConnector.on('connected', () => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('lcu:connected')
    })
  })

  lcuConnector.on('disconnected', () => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('lcu:disconnected')
    })
  })

  lcuConnector.on('error', () => {
    // LCU connection error - will retry automatically
  })

  // Forward champ select session to remote control
  lcuConnector.on('champ-select-session', async (session) => {
    if (remoteControlService.isActive()) {
      console.log('[Main] Champ select session update received, forwarding to remote control')
      console.log('[Main] Session data:', {
        localPlayerCellId: session.localPlayerCellId,
        myTeamCount: session.myTeam?.length,
        enemyTeamCount: session.theirTeam?.length,
        myTeamBansCount: session.bans?.myTeamBans?.length,
        theirTeamBansCount: session.bans?.theirTeamBans?.length,
        myTeam: session.myTeam,
        theirTeam: session.theirTeam,
        bans: session.bans
      })
      await remoteControlService.updateChampSelectState(session)
    }
  })

  // Forward lobby session to remote control (WebSocket eventi)
  lcuConnector.on('lobby-session', async (lobby) => {
    if (remoteControlService.isActive()) {
      console.log('[Main] Lobby session update received, forwarding to remote control')
      await remoteControlService.updateLobbyState(lobby)
    }
  })

  // Lobby fazına girildiğinde mevcut lobi datasını hemen çek
  gameflowMonitor.on('phase-changed', async (phase) => {
    if (phase === 'Lobby' && remoteControlService.isActive()) {
      try {
        const lobbyData = await lcuConnector.getLobbyData()
        if (lobbyData) {
          await remoteControlService.updateLobbyState(lobbyData)
        }
      } catch (e) {
        console.log('[Main] Could not fetch initial lobby data:', e)
      }
    }
  })

  // Forward gameflow events
  gameflowMonitor.on('phase-changed', async (phase, previousPhase) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('lcu:phase-changed', { phase, previousPhase })
    })

    // Update remote control game status
    if (remoteControlService.isActive()) {
      try {
        const summoner = await lcuConnector.getCurrentSummoner()
        const ownedChampions = await lcuConnector.getOwnedChampions()
        const ownedChampionIds = ownedChampions.map((c: any) => c.id)

        console.log('[Main] Updating game status for phase:', phase, {
          summoner: summoner?.displayName,
          ownedChampionsCount: ownedChampionIds.length
        })

        await remoteControlService.updateGameStatus(phase, summoner, ownedChampionIds)
      } catch (error) {
        console.error('[RemoteControl] Failed to send summoner/champion data:', error)
        // Still update phase even if summoner/champion data fails
        await remoteControlService.updateGameStatus(phase)
      }
    }

    // Handle auto ban/pick based on phase
    if (phase === 'ChampSelect') {
      const autoPickEnabled = settingsService.get('autoPickEnabled')
      const autoBanEnabled = settingsService.get('autoBanEnabled')
      if (autoPickEnabled || autoBanEnabled) {
        autoBanPickService.start()
      }
    } else if (phase !== 'ChampSelect' && previousPhase === 'ChampSelect') {
      autoBanPickService.stop()
    }
  })

  gameflowMonitor.on('champion-selected', async (data) => {
    // Forward to all windows
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('lcu:champion-selected', data)
    })
  })

  gameflowMonitor.on('queue-id-detected', (data) => {
    // Forward early queue ID detection to all windows
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('lcu:queue-id-detected', data)
    })
  })

  gameflowMonitor.on('ready-check-accepted', () => {
    // Forward to all windows
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('lcu:ready-check-accepted')
    })
  })

  // Forward team composition events
  teamCompositionMonitor.on('team-composition-updated', (composition) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('team:composition-updated', composition)
    })
  })

  teamCompositionMonitor.on('ready-for-smart-apply', (composition) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('team:ready-for-smart-apply', composition)
    })
  })

  teamCompositionMonitor.on('team-reset', (newPhase: string) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('team:reset', newPhase)
    })
  })

  // Forward preselectLobbyMonitor events
  preselectLobbyMonitor.on('preselect-mode-detected', (data: any) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('preselect:mode-detected', data)
    })
  })

  preselectLobbyMonitor.on('champions-changed', (champions: any[]) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('preselect:champions-changed', champions)
    })
  })

  preselectLobbyMonitor.on('snapshot-taken', (snapshot: any) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('preselect:snapshot-taken', snapshot)
    })
  })

  preselectLobbyMonitor.on('match-found', (snapshot: any) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('preselect:match-found', snapshot)
    })
  })

  preselectLobbyMonitor.on('queue-cancelled', () => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('preselect:queue-cancelled')
    })
  })

  preselectLobbyMonitor.on('cancel-preselect-apply', () => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('preselect:cancel-apply')
    })
  })

  preselectLobbyMonitor.on('ready-for-preselect-apply', (snapshot: any) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('preselect:ready-for-apply', snapshot)
    })
  })

  preselectLobbyMonitor.on('state-reset', () => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('preselect:state-reset')
    })
  })

  // Check if League Client integration is enabled in settings
  const leagueClientEnabled = settingsService.get('leagueClientEnabled')
  // Default to true if not set
  if (leagueClientEnabled !== false) {
    // Start auto-connect which will keep trying to connect to League client
    // This ensures we connect even if League is started after the app
    lcuConnector.startAutoConnect(5000) // Check every 5 seconds
  }

  // When connected, start gameflow monitoring
  lcuConnector.on('connected', () => {
    gameflowMonitor.start()
    teamCompositionMonitor.start()
    autoMessageService.start()

    // Start auto ban/pick if enabled
    const autoPickEnabled = settingsService.get('autoPickEnabled')
    const autoBanEnabled = settingsService.get('autoBanEnabled')
    if (autoPickEnabled || autoBanEnabled) {
      autoBanPickService.start()
    }

    // Start auto rune service if enabled
    const autoRuneEnabled = settingsService.get('autoRuneEnabled')
    if (autoRuneEnabled !== false) {
      autoRuneService.start()
    }

    // Start auto spell service if enabled
    const autoSpellEnabled = settingsService.get('autoSpellEnabled')
    if (autoSpellEnabled !== false) {
      autoSpellService.start()
    }
  })
}

// Cleanup function for graceful shutdown
function cleanup(): void {
  try {
    console.log('[Main] Cleaning up all services...')

    // Stop auto-connect first to prevent reconnection
    lcuConnector.stopAutoConnect()

    // Disconnect from LCU
    lcuConnector.disconnect()

    // Stop all monitors and services
    gameflowMonitor.stop()
    teamCompositionMonitor.stop()
    preselectLobbyMonitor.stop()
    autoBanPickService.stop()
    autoMessageService.stop()
    autoRuneService.stop()

    console.log('[Main] All services stopped')
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

if (gotTheLock) {
  app.on('before-quit', () => {
    cleanup()
  })

  app.on('will-quit', () => {
    cleanup()
  })

  process.on('SIGINT', () => {
    cleanup()
    app.quit()
  })

  process.on('SIGTERM', () => {
    cleanup()
    app.quit()
  })
}

// Auth handlers removed - new license system will be implemented
