import { ElectronAPI } from '@electron-toolkit/preload'
import { SkinInfo } from '../main/types'

export interface IApi {
  detectGame: () => Promise<{ success: boolean; gamePath?: string | null; error?: string }>
  browseGameFolder: () => Promise<{ success: boolean; gamePath?: string }>
  downloadSkin: (url: string) => Promise<{ success: boolean; skinInfo?: SkinInfo; error?: string }>
  listDownloadedSkins: () => Promise<{ success: boolean; skins?: SkinInfo[]; error?: string }>
  deleteSkin: (
    championName: string,
    skinName: string
  ) => Promise<{ success: boolean; error?: string }>

  // Batch download management
  downloadAllSkins: (
    skinUrls: string[],
    options?: { excludeChromas?: boolean; concurrency?: number }
  ) => Promise<{ success: boolean; error?: string }>
  pauseBatchDownload: () => Promise<{ success: boolean; error?: string }>
  resumeBatchDownload: () => Promise<{ success: boolean; error?: string }>
  cancelBatchDownload: () => Promise<{ success: boolean; error?: string }>
  getBatchDownloadState: () => Promise<{
    success: boolean
    data?: {
      totalSkins: number
      completedSkins: number
      currentSkin: string | null
      currentProgress: number
      downloadSpeed: number
      timeRemaining: number
      failedSkins: string[]
      isRunning: boolean
      isPaused: boolean
    } | null
    error?: string
  }>
  onDownloadAllSkinsProgress: (
    callback: (progress: {
      totalSkins: number
      completedSkins: number
      currentSkin: string | null
      currentProgress: number
      downloadSpeed: number
      timeRemaining: number
      failedSkins: string[]
      isRunning: boolean
      isPaused: boolean
    }) => void
  ) => () => void
  retryFailedDownloads: () => Promise<{ success: boolean; error?: string }>

  // Bulk download from repository
  downloadAllSkinsBulk: (options: {
    excludeChromas: boolean
    excludeVariants: boolean
    excludeLegacy: boolean
    excludeEsports: boolean
    onlyFavorites: boolean
    overwriteExisting: boolean
    concurrency?: number
  }) => Promise<{ success: boolean; error?: string }>
  onDownloadAllSkinsBulkProgress: (
    callback: (progress: {
      phase: 'downloading' | 'extracting' | 'processing' | 'completed'
      totalSize?: number
      downloadedSize?: number
      totalFiles?: number
      processedFiles?: number
      currentFile?: string
      skippedFiles?: number
      failedFiles?: string[]
      downloadSpeed?: number
      timeRemaining?: number
      overallProgress: number
    }) => void
  ) => () => void

  // File import
  importSkinFile: (
    filePath: string,
    options?: { championName?: string; skinName?: string; author?: string; imagePath?: string }
  ) => Promise<{ success: boolean; skinInfo?: SkinInfo; error?: string }>
  importSkinFilesBatch: (filePaths: string[]) => Promise<{
    success: boolean
    totalFiles: number
    successCount: number
    failedCount: number
    results: Array<{
      filePath: string
      success: boolean
      skinInfo?: SkinInfo
      error?: string
    }>
  }>
  validateSkinFile: (filePath: string) => Promise<{ valid: boolean; error?: string }>
  extractModInfo: (filePath: string) => Promise<{
    success: boolean
    info?: {
      name?: string
      author?: string
      description?: string
      version?: string
      champion?: string
      hasImage?: boolean
    }
    error?: string
  }>
  browseSkinFile: () => Promise<{ success: boolean; filePath?: string }>
  browseSkinFiles: () => Promise<{ success: boolean; filePaths?: string[] }>
  browseImageFile: () => Promise<{ success: boolean; filePath?: string }>
  // URL download
  downloadFromUrl: (url: string) => Promise<{ success: boolean; filePath?: string; error?: string }>

  // File path helper
  getPathForFile: (file: File) => string

  // File association handlers
  notifyRendererReady: () => Promise<{ success: boolean }>
  getPendingFiles: () => Promise<string[]>
  clearPendingFiles: () => Promise<{ success: boolean }>
  onFilesToImport: (callback: (filePaths: string[]) => void) => () => void

  runPatcher: (
    gamePath: string,
    selectedSkins: string[]
  ) => Promise<{ success: boolean; message?: string }>
  stopPatcher: () => Promise<{ success: boolean; error?: string }>
  isPatcherRunning: () => Promise<boolean>
  cancelApply: () => Promise<{ success: boolean; message?: string }>
  isApplying: () => Promise<boolean>

  // Cache management
  clearSkinCache: (skinName: string) => Promise<{ success: boolean; error?: string }>
  clearAllSkinsCache: () => Promise<{ success: boolean; error?: string }>
  getCacheInfo: () => Promise<{
    success: boolean
    data?: { exists: boolean; modCount: number; sizeInMB: number }
    error?: string
  }>
  fetchChampionData: (
    language?: string
  ) => Promise<{ success: boolean; message: string; championCount?: number }>
  loadChampionData: (language?: string) => Promise<{ success: boolean; data?: any; error?: string }>
  checkChampionUpdates: (
    language?: string
  ) => Promise<{ success: boolean; needsUpdate?: boolean; error?: string }>

  // Favorites
  addFavorite: (
    championKey: string,
    skinId: string,
    skinName: string,
    chromaId?: string,
    chromaName?: string
  ) => Promise<{ success: boolean; error?: string }>
  removeFavorite: (
    championKey: string,
    skinId: string,
    chromaId?: string
  ) => Promise<{ success: boolean; error?: string }>
  isFavorite: (championKey: string, skinId: string, chromaId?: string) => Promise<boolean>
  getFavorites: () => Promise<{ success: boolean; favorites?: any[]; error?: string }>
  getFavoritesByChampion: (
    championKey: string
  ) => Promise<{ success: boolean; favorites?: any[]; error?: string }>

  // Preset management
  createPreset: (
    name: string,
    description: string | undefined,
    skins: any[]
  ) => Promise<{ success: boolean; data?: any; error?: string }>
  listPresets: () => Promise<{ success: boolean; data?: any[]; error?: string }>
  getPreset: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
  updatePreset: (
    id: string,
    updates: any
  ) => Promise<{ success: boolean; data?: any; error?: string }>
  deletePreset: (id: string) => Promise<{ success: boolean; error?: string }>
  duplicatePreset: (
    id: string,
    newName: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>
  validatePreset: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
  exportPreset: (id: string) => Promise<{ success: boolean; filePath?: string; error?: string }>
  importPreset: () => Promise<{ success: boolean; data?: any; error?: string }>

  // Tools management
  checkToolsExist: () => Promise<boolean>
  downloadTools: (attempt?: number) => Promise<{
    success: boolean
    error?: string
    errorType?: 'network' | 'github' | 'filesystem' | 'extraction' | 'validation' | 'unknown'
    errorDetails?: string
    canRetry?: boolean
  }>
  getToolsInfo: () => Promise<{
    success: boolean
    downloadUrl?: string
    version?: string
    size?: number
    error?: string
  }>
  onToolsDownloadProgress: (callback: (progress: number) => void) => () => void
  onToolsDownloadDetails: (
    callback: (details: { loaded: number; total: number; speed: number }) => void
  ) => () => void

  // Window controls
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  isWindowMaximized: () => Promise<boolean>

  // Settings
  getSettings: (key?: string) => Promise<any>
  setSettings: (key: string, value: any) => Promise<void>
  getSystemLocale: () => Promise<{ success: boolean; locale: string }>

  // Auto-updater
  checkForUpdates: () => Promise<{ success: boolean; updateInfo?: any; error?: string }>
  downloadUpdate: () => Promise<{ success: boolean; error?: string }>
  quitAndInstall: () => void
  cancelUpdate: () => Promise<{ success: boolean }>
  getUpdateChangelog: () => Promise<{ success: boolean; changelog?: string | null; error?: string }>
  getUpdateInfo: () => Promise<any>
  onUpdateChecking: (callback: () => void) => () => void
  onUpdateAvailable: (callback: (info: any) => void) => () => void
  onUpdateNotAvailable: (callback: () => void) => () => void
  onUpdateError: (callback: (error: string) => void) => () => void
  onUpdateDownloadProgress: (callback: (progress: any) => void) => () => void
  onUpdateDownloaded: (callback: () => void) => () => void

  // App info
  getAppVersion: () => Promise<string>

  // Repository management
  repositoryGetAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>
  repositoryGetActive: () => Promise<{ success: boolean; data?: any; error?: string }>
  repositorySetActive: (repositoryId: string) => Promise<{ success: boolean; error?: string }>
  repositoryAdd: (repository: any) => Promise<{ success: boolean; data?: any; error?: string }>
  repositoryRemove: (repositoryId: string) => Promise<{ success: boolean; error?: string }>
  repositoryValidate: (
    repositoryId: string
  ) => Promise<{ success: boolean; data?: boolean; error?: string }>
  repositoryUpdate: (
    repositoryId: string,
    updates: any
  ) => Promise<{ success: boolean; error?: string }>
  repositoryConstructUrl: (
    championName: string,
    skinFile: string,
    isChroma?: boolean,
    chromaBase?: string
  ) => Promise<{ success: boolean; url?: string; error?: string }>

  // Custom skin images
  getCustomSkinImage: (
    modPath: string
  ) => Promise<{ success: boolean; imageUrl?: string | null; error?: string }>
  editCustomSkin: (
    modPath: string,
    newName: string,
    newChampionKey?: string,
    newImagePath?: string
  ) => Promise<{ success: boolean; error?: string }>
  swapCustomModFile: (
    modPath: string,
    newModFilePath: string
  ) => Promise<{ success: boolean; error?: string }>
  deleteCustomSkin: (modPath: string) => Promise<{ success: boolean; error?: string }>
  extractImageForCustomSkin: (modPath: string) => Promise<{ success: boolean; error?: string }>
  extractImageFromMod: (
    modFilePath: string
  ) => Promise<{ success: boolean; imagePath?: string; error?: string; requiresTools?: boolean }>
  onExtractImageStatus: (callback: (status: string) => void) => () => void
  readImageAsBase64: (
    imagePath: string
  ) => Promise<{ success: boolean; data?: string; error?: string }>

  // Patcher events
  onPatcherStatus: (callback: (status: string) => void) => () => void
  onPatcherMessage: (callback: (message: string) => void) => () => void
  onPatcherError: (callback: (error: string) => void) => () => void
  onImportProgress: (
    callback: (data: { current: number; total: number; name: string; phase: string }) => void
  ) => () => void

  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>

  // P2P File Transfer APIs
  getModFileInfo: (filePath: string) => Promise<{
    success: boolean
    data?: {
      fileName: string
      size: number
      hash: string
      mimeType: string
    }
    error?: string
  }>
  readFileChunk: (
    filePath: string,
    offset: number,
    length: number
  ) => Promise<{ success: boolean; data?: ArrayBuffer; error?: string }>
  prepareTempFile: (
    fileName: string
  ) => Promise<{ success: boolean; path?: string; error?: string }>
  writeFileFromChunks: (
    filePath: string,
    chunks: ArrayBuffer[],
    expectedHash: string
  ) => Promise<{ success: boolean; error?: string }>
  importFile: (
    filePath: string,
    options?: any
  ) => Promise<{ success: boolean; skinInfo?: SkinInfo; error?: string }>

  // LCU Connection APIs
  lcuConnect: () => Promise<{ success: boolean; error?: string }>
  lcuDisconnect: () => Promise<{ success: boolean }>
  lcuGetStatus: () => Promise<{ connected: boolean; gameflowPhase: string }>
  lcuGetCurrentPhase: () => Promise<{ success: boolean; phase?: string; error?: string }>
  lcuGetChampSelectSession: () => Promise<{ success: boolean; session?: any; error?: string }>
  lcuGetOwnedChampions: () => Promise<{ success: boolean; champions?: any[]; error?: string }>
  lcuGetAllChampions: () => Promise<{ success: boolean; champions?: any[]; error?: string }>
  lcuGetCurrentSummoner: () => Promise<{
    success: boolean
    summoner?: {
      displayName: string
      summonerLevel: number
      profileIconId: number
      puuid: string
    }
    error?: string
  }>

  // Auto Ban/Pick APIs
  setAutoPickChampions: (championIds: number[]) => Promise<{ success: boolean; error?: string }>
  setAutoBanChampions: (championIds: number[]) => Promise<{ success: boolean; error?: string }>

  // LCU Events
  onLcuConnected: (callback: () => void) => () => void
  onLcuDisconnected: (callback: () => void) => () => void
  onLcuPhaseChanged: (
    callback: (data: { phase: string; previousPhase: string }) => void
  ) => () => void
  onLcuChampionSelected: (
    callback: (data: { championId: number; isLocked: boolean; isHover: boolean }) => void
  ) => () => void
  onLcuReadyCheckAccepted: (callback: () => void) => () => void
  onLcuQueueIdDetected: (callback: (data: { queueId: number }) => void) => () => void

  // Team Composition APIs
  getTeamComposition: () => Promise<{
    success: boolean
    composition?: { championIds: number[]; allLocked: boolean; inFinalization: boolean }
    error?: string
  }>
  isReadyForSmartApply: () => Promise<{ success: boolean; ready?: boolean; error?: string }>
  getSmartApplySummary: (
    selectedSkins: any[],
    teamChampionIds: number[],
    autoSyncedSkins?: any[]
  ) => Promise<{ success: boolean; summary?: any; error?: string }>
  smartApplySkins: (
    gamePath: string,
    selectedSkins: any[],
    teamChampionIds: number[],
    autoSyncedSkins?: any[]
  ) => Promise<{ success: boolean; summary?: any; error?: string }>

  // Team Composition Events
  onTeamCompositionUpdated: (
    callback: (composition: {
      championIds: number[]
      allLocked: boolean
      inFinalization: boolean
    }) => void
  ) => () => void
  onReadyForSmartApply: (
    callback: (composition: {
      championIds: number[]
      allLocked: boolean
      inFinalization: boolean
    }) => void
  ) => () => void
  onTeamReset: (callback: (newPhase?: string) => void) => () => void

  // Preselect Lobby APIs
  getPreselectCurrentState: () => Promise<{
    success: boolean
    state?: string
    champions?: Array<{
      summonerInternalName: string
      championId: number
      championKey?: string
      isLocalPlayer?: boolean
    }>
    isDetected?: boolean
    queueId?: number | null
    error?: string
  }>
  getPreselectSnapshot: () => Promise<{
    success: boolean
    snapshot?: {
      timestamp: number
      queueId: number
      champions: Array<{
        summonerInternalName: string
        championId: number
        championKey?: string
        isLocalPlayer?: boolean
      }>
      searchState: string
      gameflowPhase: string
    } | null
    error?: string
  }>
  getMatchmakingState: () => Promise<{
    success: boolean
    state?: {
      searchState: string
      timeInQueue?: number
      estimatedQueueTime?: number
    } | null
    error?: string
  }>
  getLobbyData: () => Promise<{
    success: boolean
    data?: any
    error?: string
  }>

  // Preselect Lobby Events
  onPreselectModeDetected: (
    callback: (data: { queueId: number; champions: any[] }) => void
  ) => () => void
  onPreselectChampionsChanged: (callback: (champions: any[]) => void) => () => void
  onPreselectSnapshotTaken: (callback: (snapshot: any) => void) => () => void
  onPreselectMatchFound: (callback: (snapshot: any) => void) => () => void
  onPreselectQueueCancelled: (callback: () => void) => () => void
  onPreselectCancelApply: (callback: () => void) => () => void
  onPreselectReadyForApply: (callback: (snapshot: any) => void) => () => void
  onPreselectStateReset: (callback: () => void) => () => void

  // MultiRitoFixes API
  checkMultiRitoFixTool: () => Promise<{ success: boolean; exists?: boolean; error?: string }>
  downloadMultiRitoFixTool: () => Promise<{ success: boolean; error?: string }>
  fixModIssues: (modPath: string) => Promise<{ success: boolean; error?: string; output?: string }>
  onMultiRitoFixDownloadProgress: (callback: (progress: number) => void) => () => void
  onFixModProgress: (callback: (message: string) => void) => () => void

  // Settings change events from tray
  onSettingsChanged: (callback: (key: string, value: any) => void) => () => void
  onOpenSettings: (callback: () => void) => () => void
  onLanguageChanged: (callback: (language: string) => void) => () => void

  // Skin update management
  checkSkinUpdates: (
    skinPaths?: string[]
  ) => Promise<{ success: boolean; data?: Record<string, any>; error?: string }>
  updateSkin: (skinInfo: SkinInfo) => Promise<{ success: boolean; data?: SkinInfo; error?: string }>
  bulkUpdateSkins: (skinInfos: SkinInfo[]) => Promise<{
    success: boolean
    data?: { updated: SkinInfo[]; failed: Array<{ skin: SkinInfo; error: string }> }
    error?: string
  }>
  generateMetadataForExistingSkins: () => Promise<{ success: boolean; error?: string }>

  // Version Check
  versionCheck: () => Promise<{
    isCompatible: boolean
    currentVersion: string
    requiredVersion: string | null
    message?: string
  }>
  getCurrentVersion: () => Promise<string>

  // Remote Control
  remoteStart: () => Promise<{
    success: boolean
    session?: { sessionCode: string; isActive: boolean; expiresAt: string }
    error?: string
  }>
  remoteStop: () => Promise<{ success: boolean; error?: string }>
  remoteStatus: () => Promise<{
    isActive: boolean
    session: { sessionCode: string; isActive: boolean; expiresAt: string } | null
  }>

  // Auto Message
  autoMessageUpdateSettings: (settings: {
    enabled?: boolean
    messages?: string[]
    delay?: number
    sendOnLobbyJoin?: boolean
  }) => Promise<{ success: boolean }>
  autoMessageGetStatus: () => Promise<{
    active: boolean
    settings: {
      enabled: boolean
      messages: string[]
      delay: number
      sendOnLobbyJoin: boolean
    }
  }>

  // Rune Pages
  runesGetPages: () => Promise<{ success: boolean; pages?: any[]; error?: string }>
  runesGetCurrentPage: () => Promise<{ success: boolean; page?: any; error?: string }>
  runesGetTrees: () => Promise<{ success: boolean; trees?: any[]; error?: string }>
  runesCreatePage: (page: {
    name: string
    primaryStyleId: number
    subStyleId: number
    selectedPerkIds: number[]
  }) => Promise<{ success: boolean; page?: any; error?: string }>
  runesUpdatePage: (
    pageId: number,
    page: {
      name: string
      primaryStyleId: number
      subStyleId: number
      selectedPerkIds: number[]
    }
  ) => Promise<{ success: boolean; page?: any; error?: string }>
  runesDeletePage: (pageId: number) => Promise<{ success: boolean; error?: string }>
  runesSetCurrentPage: (pageId: number) => Promise<{ success: boolean; error?: string }>

  // Auto Rune
  autoRuneStart: () => Promise<{ success: boolean }>
  autoRuneStop: () => Promise<{ success: boolean }>
  autoRuneSetTargetPage: (pageId: number | null) => Promise<{ success: boolean }>
  autoRuneGetTargetPage: () => Promise<{ success: boolean; pageId: number | null }>
  autoRuneGetStatus: () => Promise<{
    success: boolean
    isRunning: boolean
    targetPageId: number | null
  }>

  // Auto Spell
  autoSpellStart: () => Promise<{ success: boolean }>
  autoSpellStop: () => Promise<{ success: boolean }>
  autoSpellSetTargetSpells: (spell1Id: number, spell2Id: number) => Promise<{ success: boolean }>
  autoSpellGetTargetSpells: () => Promise<{
    success: boolean
    spell1Id: number | null
    spell2Id: number | null
  }>
  autoSpellGetStatus: () => Promise<{
    success: boolean
    isRunning: boolean
    spell1Id: number | null
    spell2Id: number | null
  }>

  // Summoner Spells
  spellsGetAvailable: () => Promise<{
    success: boolean
    spells?: Array<{
      id: number
      name: string
      description: string
      iconPath: string
      gameModes: string[]
    }>
    error?: string
  }>
  spellsGetCurrent: () => Promise<{
    success: boolean
    spells?: { spell1Id: number; spell2Id: number } | null
    error?: string
  }>
  spellsSet: (spell1Id: number, spell2Id: number) => Promise<{ success: boolean; error?: string }>

  // Live game API
  liveGameStart: () => Promise<{ success: boolean }>
  liveGameStop: () => Promise<{ success: boolean }>
  liveGameGetData: () => Promise<any>
  liveGameGetState: () => Promise<'disconnected' | 'searching' | 'connected'>

  // Generic LCU Request
  lcuRequest: (method: string, endpoint: string, body?: Record<string, unknown>) => Promise<any>

  // Accounts Manager
  accountsLoad: () => Promise<{ success: boolean; accounts?: any[]; error?: string }>
  accountsAdd: (account: {
    username: string
    password: string
    note?: string
  }) => Promise<{ success: boolean; error?: string }>
  accountsDelete: (usernames: string[]) => Promise<{ success: boolean; error?: string }>
  accountsLogin: (credentials: {
    username: string
    password: string
  }) => Promise<{ success: boolean; error?: string }>
  accountsPullData: (credentials: {
    username: string
    password: string
  }) => Promise<{ success: boolean; error?: string }>
  accountsGetChampions: () => Promise<{
    success: boolean
    champions?: Array<{
      id: number
      name: string
      alias: string
      imageUrl: string | null
    }>
    error?: string
  }>
  accountsGetSkins: () => Promise<{
    success: boolean
    skins?: Array<{
      id: number
      championId: number
      championName: string
      championAlias: string
      skinName: string
      skinNum: number
      championImageUrl: string | null
      skinImageUrl: string | null
    }>
    error?: string
  }>

  // Settings Editor
  settingsLoad: () => Promise<{
    success: boolean
    sections?: any[]
    isLocked?: boolean
    error?: string
  }>
  settingsSave: (data: { sections: any[] }) => Promise<{ success: boolean; error?: string }>
  settingsExport: () => Promise<{ success: boolean; error?: string }>
  settingsImport: () => Promise<{ success: boolean; error?: string }>
  settingsToggleLock: (data: { lock: boolean }) => Promise<{ success: boolean; error?: string }>
  settingsApplyToClient: (data: {
    sections: any[]
  }) => Promise<{ success: boolean; error?: string }>
  settingsApplyToAccount: (data: {
    sections: any[]
  }) => Promise<{ success: boolean; error?: string }>

  // Misc Tools
  invoke: (channel: string, ...args: any[]) => Promise<any>

  // Theme management
  themeSave: (config: any) => Promise<{ success: boolean; error?: string }>
  themeLoad: () => Promise<{ success: boolean; config?: any; error?: string }>
  themeSaveCustom: (themes: any[]) => Promise<{ success: boolean; error?: string }>
  themeLoadCustom: () => Promise<{ success: boolean; themes?: any[]; error?: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IApi
  }
}
