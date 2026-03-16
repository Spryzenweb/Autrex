import { autoUpdater, CancellationToken } from 'electron-updater'
import { BrowserWindow } from 'electron'
import axios from 'axios'

export class UpdaterService {
  private mainWindow: BrowserWindow | null = null
  private updateInfo: any = null
  private cancellationToken: CancellationToken | null = null

  constructor() {
    // Configure autoUpdater to use Spryzenweb/Autrex repo
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'Spryzenweb',
      repo: 'Autrex'
    })
    
    autoUpdater.autoDownload = false
    autoUpdater.autoRunAppAfterInstall = true
    autoUpdater.forceDevUpdateConfig = true // Enable updates in dev mode

    console.log('[Updater] Initialized with repo: Spryzenweb/Autrex')
    this.setupEventListeners()
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window
  }

  private setupEventListeners() {
    autoUpdater.on('checking-for-update', () => {
      console.log('[Updater] Checking for updates...')
      this.sendToWindow('update-checking')
    })

    autoUpdater.on('update-available', (info) => {
      console.log('[Updater] Update available:', info)
      this.updateInfo = info
      this.sendToWindow('update-available', info)
    })

    autoUpdater.on('update-not-available', () => {
      console.log('[Updater] No updates available')
      this.sendToWindow('update-not-available')
    })

    autoUpdater.on('error', (err) => {
      console.error('[Updater] Error:', err)
      this.sendToWindow('update-error', err.message)
    })

    autoUpdater.on('download-progress', (progressObj) => {
      console.log('[Updater] Download progress:', progressObj.percent)
      this.sendToWindow('update-download-progress', progressObj)
    })

    autoUpdater.on('update-downloaded', () => {
      console.log('[Updater] Update downloaded, will install now')
      this.sendToWindow('update-downloaded')
      // Immediately quit and install
      autoUpdater.quitAndInstall(true, true)
    })
  }

  private sendToWindow(channel: string, data?: any) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data)
    }
  }

  async checkForUpdates() {
    console.log('[Updater] Starting update check...')
    
    try {
      const result = await autoUpdater.checkForUpdates()
      console.log('[Updater] Check result:', result)
      return result
    } catch (error) {
      console.error('[Updater] Error checking for updates:', error)
      throw error
    }
  }

  async downloadUpdate() {
    try {
      this.cancellationToken = new CancellationToken()
      await autoUpdater.downloadUpdate(this.cancellationToken)
    } catch (error) {
      console.error('Error downloading update:', error)
      throw error
    }
  }

  cancelUpdate() {
    if (this.cancellationToken) {
      this.cancellationToken.cancel()
      this.cancellationToken = null
    }
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall()
  }

  async getChangelog(): Promise<string | null> {
    try {
      if (!this.updateInfo || !this.updateInfo.version) {
        return null
      }

      const owner = 'Spryzenweb'
      const repo = 'Autrex'
      const version = this.updateInfo.version

      // Try to fetch changes.md from the GitHub release
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/v${version}/changes.md`

      try {
        const response = await axios.get(url)
        return response.data
      } catch {
        // If not found in release tag, try main branch
        const mainUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/changes.md`
        const response = await axios.get(mainUrl)
        return response.data
      }
    } catch (error) {
      console.error('Error fetching changelog:', error)
      return null
    }
  }

  getUpdateInfo() {
    return this.updateInfo
  }
}
