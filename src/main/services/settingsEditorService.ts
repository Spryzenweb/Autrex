import { app, dialog } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as ini from 'ini'

interface GameSetting {
  name: string
  value: string | number | boolean
  type: 'string' | 'number' | 'boolean'
}

interface SettingsSection {
  name: string
  settings: GameSetting[]
}

class SettingsEditorService {
  private gameConfigPath: string | null = null
  private persistedSettingsPath: string | null = null

  async findGameConfigPath(): Promise<string | null> {
    try {
      // Mac ve Windows için farklı yollar
      const possiblePaths: string[] = []

      if (process.platform === 'darwin') {
        // Mac için League of Legends yolları
        possiblePaths.push(
          path.join(
            app.getPath('home'),
            'Library',
            'Application Support',
            'Riot Games',
            'League of Legends',
            'Config'
          ),
          path.join('/Applications', 'League of Legends.app', 'Contents', 'LoL', 'Config'),
          path.join(
            app.getPath('home'),
            'Applications',
            'League of Legends.app',
            'Contents',
            'LoL',
            'Config'
          )
        )
      } else {
        // Windows için yollar
        possiblePaths.push(
          path.join(
            process.env.PROGRAMFILES || 'C:\\Program Files',
            'Riot Games',
            'League of Legends',
            'Config'
          ),
          path.join(
            process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)',
            'Riot Games',
            'League of Legends',
            'Config'
          ),
          path.join(app.getPath('home'), 'Riot Games', 'League of Legends', 'Config')
        )
      }

      for (const configPath of possiblePaths) {
        const gameCfgPath = path.join(configPath, 'game.cfg')
        try {
          await fs.access(gameCfgPath)
          this.gameConfigPath = gameCfgPath
          this.persistedSettingsPath = path.join(configPath, 'PersistedSettings.json')
          console.log('[SettingsEditor] Found game config at:', gameCfgPath)
          return gameCfgPath
        } catch {
          continue
        }
      }

      console.log('[SettingsEditor] Game config not found in any of the expected paths')
      return null
    } catch (error) {
      console.error('Failed to find game config:', error)
      return null
    }
  }

  async loadSettings(): Promise<{ sections: SettingsSection[]; isLocked: boolean }> {
    try {
      if (!this.gameConfigPath) {
        const found = await this.findGameConfigPath()
        if (!found) {
          console.log('[SettingsEditor] Could not find game config, returning empty sections')
          return { sections: [], isLocked: false }
        }
      }

      const sections: SettingsSection[] = []

      // Load Game.cfg
      try {
        const gameCfgContent = await fs.readFile(this.gameConfigPath!, 'utf-8')
        const gameCfgData = ini.parse(gameCfgContent)

        for (const [sectionName, sectionData] of Object.entries(gameCfgData)) {
          if (typeof sectionData === 'object' && sectionData !== null) {
            const settings: GameSetting[] = []

            for (const [key, value] of Object.entries(sectionData)) {
              let type: 'string' | 'number' | 'boolean' = 'string'
              let parsedValue: string | number | boolean = value as string

              if (value === '0' || value === '1') {
                type = 'boolean'
                parsedValue = value === '1'
              } else if (!isNaN(Number(value))) {
                type = 'number'
                parsedValue = Number(value)
              }

              settings.push({ name: key, value: parsedValue, type })
            }

            sections.push({ name: sectionName, settings })
          }
        }
      } catch (error) {
        console.error('Failed to load Game.cfg:', error)
      }

      // Check if files are locked (read-only)
      let isLocked = false
      try {
        const stats = await fs.stat(this.gameConfigPath!)
        // On Windows, check if file is read-only
        if (process.platform === 'win32') {
          isLocked = (stats.mode & 0o200) === 0
        } else {
          // On Mac/Linux, check write permission
          isLocked = (stats.mode & 0o200) === 0
        }
      } catch {
        isLocked = false
      }

      return { sections, isLocked }
    } catch (error) {
      console.error('Failed to load settings:', error)
      return { sections: [], isLocked: false }
    }
  }

  async saveSettings(sections: SettingsSection[]): Promise<void> {
    try {
      if (!this.gameConfigPath) {
        throw new Error('Game.cfg yolu bulunamadı')
      }

      const iniData: any = {}

      for (const section of sections) {
        iniData[section.name] = {}
        for (const setting of section.settings) {
          let value: string | number = setting.value as string | number
          if (setting.type === 'boolean') {
            value = setting.value ? '1' : '0'
          }
          iniData[section.name][setting.name] = value
        }
      }

      const iniContent = ini.stringify(iniData)
      await fs.writeFile(this.gameConfigPath, iniContent, 'utf-8')

      // Also save to PersistedSettings.json if it exists
      if (this.persistedSettingsPath) {
        try {
          const persistedData = {
            description: 'The settings in this file are persisted server-side.',
            files: [
              {
                name: 'Game.cfg',
                sections: sections.map((section) => ({
                  name: section.name,
                  settings: section.settings.map((s) => ({
                    name: s.name,
                    value: s.type === 'boolean' ? (s.value ? '1' : '0') : String(s.value)
                  }))
                }))
              }
            ]
          }

          await fs.writeFile(
            this.persistedSettingsPath,
            JSON.stringify(persistedData, null, 2),
            'utf-8'
          )
        } catch (error) {
          console.error('Failed to save PersistedSettings.json:', error)
        }
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }

  async exportSettings(): Promise<void> {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Ayarları Dışa Aktar',
        defaultPath: 'PersistedSettings.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      })

      if (!filePath) return

      const { sections } = await this.loadSettings()
      await fs.writeFile(filePath, JSON.stringify({ sections }, null, 2), 'utf-8')
    } catch (error) {
      console.error('Failed to export settings:', error)
      throw error
    }
  }

  async importSettings(): Promise<void> {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Ayarları İçe Aktar',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
      })

      if (!filePaths || filePaths.length === 0) return

      const content = await fs.readFile(filePaths[0], 'utf-8')
      const data = JSON.parse(content)

      if (data.sections) {
        await this.saveSettings(data.sections)
      }
    } catch (error) {
      console.error('Failed to import settings:', error)
      throw error
    }
  }

  async toggleLock(lock: boolean): Promise<void> {
    try {
      if (!this.gameConfigPath) {
        throw new Error('Game.cfg yolu bulunamadı')
      }

      if (process.platform === 'win32') {
        // On Windows, use attrib command to set/remove read-only
        const { exec } = require('child_process')
        const command = lock
          ? `attrib +R "${this.gameConfigPath}"`
          : `attrib -R "${this.gameConfigPath}"`

        await new Promise((resolve, reject) => {
          exec(command, (error: any) => {
            if (error) reject(error)
            else resolve(null)
          })
        })

        if (this.persistedSettingsPath) {
          const persistedCommand = lock
            ? `attrib +R "${this.persistedSettingsPath}"`
            : `attrib -R "${this.persistedSettingsPath}"`

          await new Promise((resolve, reject) => {
            exec(persistedCommand, (error: any) => {
              if (error) reject(error)
              else resolve(null)
            })
          })
        }
      } else {
        // On Unix-like systems, use chmod
        const mode = lock ? 0o444 : 0o644
        await fs.chmod(this.gameConfigPath, mode)
        if (this.persistedSettingsPath) {
          await fs.chmod(this.persistedSettingsPath, mode)
        }
      }
    } catch (error) {
      console.error('Failed to toggle lock:', error)
      throw error
    }
  }
}

export const settingsEditorService = new SettingsEditorService()
