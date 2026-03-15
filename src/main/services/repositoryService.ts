import { SkinRepository, DEFAULT_REPOSITORY, RepositorySettings } from '../types/repository.types'
import { settingsService } from './settingsService'

export class RepositoryService {
  private repositories: SkinRepository[] = [DEFAULT_REPOSITORY]
  private activeRepositoryId: string = DEFAULT_REPOSITORY.id

  constructor() {
    this.loadRepositories()
  }

  private loadRepositories(): void {
    try {
      const settings = settingsService.get()
      if (settings.repositories) {
        this.repositories = settings.repositories.repositories || [DEFAULT_REPOSITORY]
        this.activeRepositoryId = settings.repositories.activeRepositoryId || DEFAULT_REPOSITORY.id
      }
    } catch (error) {
      console.warn('[RepositoryService] Failed to load repositories, using defaults:', error)
      this.repositories = [DEFAULT_REPOSITORY]
      this.activeRepositoryId = DEFAULT_REPOSITORY.id
    }
  }

  getActiveRepository(): SkinRepository {
    const activeRepo = this.repositories.find((repo) => repo.id === this.activeRepositoryId)
    return activeRepo || DEFAULT_REPOSITORY
  }

  getAllRepositories(): SkinRepository[] {
    return [...this.repositories]
  }

  setActiveRepository(repositoryId: string): boolean {
    const repo = this.repositories.find((r) => r.id === repositoryId)
    if (repo) {
      this.activeRepositoryId = repositoryId
      this.saveRepositories()
      return true
    }
    return false
  }

  addRepository(repository: SkinRepository): void {
    const existingIndex = this.repositories.findIndex((r) => r.id === repository.id)
    if (existingIndex >= 0) {
      this.repositories[existingIndex] = repository
    } else {
      this.repositories.push(repository)
    }
    this.saveRepositories()
  }

  removeRepository(repositoryId: string): boolean {
    if (repositoryId === DEFAULT_REPOSITORY.id) {
      return false // Cannot remove default repository
    }

    const index = this.repositories.findIndex((r) => r.id === repositoryId)
    if (index >= 0) {
      this.repositories.splice(index, 1)

      // If we removed the active repository, switch to default
      if (this.activeRepositoryId === repositoryId) {
        this.activeRepositoryId = DEFAULT_REPOSITORY.id
      }

      this.saveRepositories()
      return true
    }
    return false
  }

  parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string } | null {
    try {
      // Handle various GitHub URL formats
      const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/,
        /github\.com\/([^\/]+)\/([^\/]+)\.git/,
        /git@github\.com:([^\/]+)\/([^\/]+)\.git/
      ]

      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
          return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, ''),
            branch: match[3] || 'main'
          }
        }
      }

      return null
    } catch (error) {
      console.error('[RepositoryService] Error parsing GitHub URL:', error)
      return null
    }
  }

  private saveRepositories(): void {
    try {
      const repositorySettings: RepositorySettings = {
        repositories: this.repositories,
        activeRepositoryId: this.activeRepositoryId,
        allowMultipleActive: false
      }

      settingsService.set('repositories', repositorySettings)
    } catch (error) {
      console.error('[RepositoryService] Failed to save repositories:', error)
    }
  }
}

export const repositoryService = new RepositoryService()
