import { app } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

interface Account {
  username: string
  password: string
  riotID?: string
  level?: number
  server?: string
  be?: number
  rp?: number
  oe?: number
  rank?: string
  rank2?: string
  champions?: number
  skins?: number
  note?: string
}

class AccountsService {
  private accountsFilePath: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.accountsFilePath = path.join(userDataPath, 'accounts.csv')
  }

  async loadAccounts(): Promise<Account[]> {
    try {
      const fileExists = await fs
        .access(this.accountsFilePath)
        .then(() => true)
        .catch(() => false)

      if (!fileExists) {
        // Create empty file with headers
        const headers =
          'username;password;riotID;level;server;be;rp;oe;rank;rank2;champions;skins;note\n'
        await fs.writeFile(this.accountsFilePath, headers, 'utf-8')
        return []
      }

      const content = await fs.readFile(this.accountsFilePath, 'utf-8')
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ';',
        relax_column_count: true
      })

      return records.map((record: any) => ({
        username: record.username || '',
        password: record.password || '',
        riotID: record.riotID || '',
        level: parseInt(record.level) || 0,
        server: record.server || '',
        be: parseInt(record.be) || 0,
        rp: parseInt(record.rp) || 0,
        oe: parseInt(record.oe) || 0,
        rank: record.rank || '',
        rank2: record.rank2 || '',
        champions: parseInt(record.champions) || 0,
        skins: parseInt(record.skins) || 0,
        note: record.note || ''
      }))
    } catch (error) {
      console.error('Failed to load accounts:', error)
      return []
    }
  }

  async saveAccounts(accounts: Account[]): Promise<void> {
    try {
      const csv = stringify(accounts, {
        header: true,
        columns: [
          'username',
          'password',
          'riotID',
          'level',
          'server',
          'be',
          'rp',
          'oe',
          'rank',
          'rank2',
          'champions',
          'skins',
          'note'
        ],
        delimiter: ';'
      })

      await fs.writeFile(this.accountsFilePath, csv, 'utf-8')
    } catch (error) {
      console.error('Failed to save accounts:', error)
      throw error
    }
  }

  async addAccount(account: { username: string; password: string; note?: string }): Promise<void> {
    const accounts = await this.loadAccounts()

    // Check if account already exists
    const exists = accounts.some((a) => a.username === account.username)
    if (exists) {
      throw new Error('Bu kullanıcı adı zaten mevcut')
    }

    accounts.push({
      username: account.username,
      password: account.password,
      note: account.note || '',
      riotID: '',
      level: 0,
      server: '',
      be: 0,
      rp: 0,
      oe: 0,
      rank: '',
      rank2: '',
      champions: 0,
      skins: 0
    })

    await this.saveAccounts(accounts)
  }

  async deleteAccounts(usernames: string[]): Promise<void> {
    const accounts = await this.loadAccounts()
    const filtered = accounts.filter((a) => !usernames.includes(a.username))
    await this.saveAccounts(filtered)
  }

  async updateAccount(username: string, updates: Partial<Account>): Promise<void> {
    const accounts = await this.loadAccounts()
    const index = accounts.findIndex((a) => a.username === username)

    if (index === -1) {
      throw new Error('Hesap bulunamadı')
    }

    accounts[index] = { ...accounts[index], ...updates }
    await this.saveAccounts(accounts)
  }
}

export const accountsService = new AccountsService()
