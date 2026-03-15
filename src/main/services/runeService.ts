import { EventEmitter } from 'events'
import { lcuConnector } from './lcuConnector'

export interface RunePage {
  id: number
  name: string
  current: boolean
  order: number
  primaryStyleId: number
  subStyleId: number
  selectedPerkIds: number[]
  isActive: boolean
  isDeletable: boolean
  isEditable: boolean
  isValid: boolean
  lastModified: number
}

export interface RuneTree {
  id: number
  key: string
  icon: string
  name: string
  slots: RuneSlot[]
}

export interface RuneSlot {
  runes: Rune[]
}

export interface Rune {
  id: number
  key: string
  icon: string
  name: string
  shortDesc: string
  longDesc: string
}

class RuneService extends EventEmitter {
  private static instance: RuneService
  private runePages: RunePage[] = []
  private runeTrees: RuneTree[] = []

  private constructor() {
    super()
  }

  static getInstance(): RuneService {
    if (!RuneService.instance) {
      RuneService.instance = new RuneService()
    }
    return RuneService.instance
  }

  /**
   * Get all rune pages
   */
  async getRunePages(): Promise<RunePage[]> {
    try {
      const pages = await lcuConnector.request('GET', '/lol-perks/v1/pages')
      this.runePages = pages || []
      return this.runePages
    } catch (error) {
      console.error('[RuneService] Failed to get rune pages:', error)
      return []
    }
  }

  /**
   * Get current rune page
   */
  async getCurrentRunePage(): Promise<RunePage | null> {
    try {
      const page = await lcuConnector.request('GET', '/lol-perks/v1/currentpage')
      return page
    } catch (error) {
      console.error('[RuneService] Failed to get current rune page:', error)
      return null
    }
  }

  /**
   * Get all rune trees (styles)
   */
  async getRuneTrees(): Promise<RuneTree[]> {
    try {
      const response = await lcuConnector.request('GET', '/lol-perks/v1/styles')
      console.log(
        '[RuneService] Raw styles response type:',
        Array.isArray(response) ? 'array' : 'object'
      )

      // Get the styles array
      let stylesArray: any[] = []
      if (Array.isArray(response)) {
        stylesArray = response
      } else if (response?.styles && Array.isArray(response.styles)) {
        stylesArray = response.styles
      }

      console.log('[RuneService] Styles array length:', stylesArray.length)

      // Get all perks data to map perk IDs to full perk objects
      const perksResponse = await lcuConnector.request('GET', '/lol-perks/v1/perks')
      const perksMap = new Map()
      if (Array.isArray(perksResponse)) {
        perksResponse.forEach((perk: any) => {
          perksMap.set(perk.id, perk)
        })
      }

      console.log('[RuneService] Perks map size:', perksMap.size)

      // Transform the data to match our interface
      const trees: RuneTree[] = stylesArray.map((style: any) => {
        console.log('[RuneService] Processing style:', style.name, 'slots:', style.slots?.length)

        return {
          id: style.id,
          key: style.idName || style.key,
          icon: style.iconPath || '',
          name: style.name,
          slots: (style.slots || []).map((slot: any) => {
            console.log('[RuneService] Processing slot type:', slot.type, 'perks:', slot.perks)

            // slot.perks is an array of perk IDs
            const runesArray = (slot.perks || []).map((perkId: number) => {
              const perk = perksMap.get(perkId)
              if (!perk) {
                console.warn('[RuneService] Perk not found in map:', perkId)
              }
              return {
                id: perkId,
                key: perk?.key || `perk_${perkId}`,
                icon: perk?.iconPath || '',
                name: perk?.name || `Perk ${perkId}`,
                shortDesc: perk?.shortDesc || '',
                longDesc: perk?.longDesc || ''
              }
            })

            return {
              runes: runesArray,
              type: slot.type // Include slot type (kStatMod for stat runes)
            }
          })
        }
      })

      console.log('[RuneService] Transformed trees:', trees.length)
      this.runeTrees = trees
      return this.runeTrees
    } catch (error) {
      console.error('[RuneService] Failed to get rune trees:', error)
      return []
    }
  }

  /**
   * Create a new rune page
   */
  async createRunePage(page: {
    name: string
    primaryStyleId: number
    subStyleId: number
    selectedPerkIds: number[]
  }): Promise<RunePage | null> {
    try {
      const newPage = await lcuConnector.request('POST', '/lol-perks/v1/pages', page)
      console.log('[RuneService] Created rune page:', newPage)
      return newPage
    } catch (error) {
      console.error('[RuneService] Failed to create rune page:', error)
      return null
    }
  }

  /**
   * Update an existing rune page
   */
  async updateRunePage(
    pageId: number,
    page: {
      name: string
      primaryStyleId: number
      subStyleId: number
      selectedPerkIds: number[]
    }
  ): Promise<RunePage | null> {
    try {
      const updatedPage = await lcuConnector.request('PUT', `/lol-perks/v1/pages/${pageId}`, page)
      console.log('[RuneService] Updated rune page:', updatedPage)
      return updatedPage
    } catch (error) {
      console.error('[RuneService] Failed to update rune page:', error)
      return null
    }
  }

  /**
   * Delete a rune page
   */
  async deleteRunePage(pageId: number): Promise<boolean> {
    try {
      await lcuConnector.request('DELETE', `/lol-perks/v1/pages/${pageId}`)
      console.log('[RuneService] Deleted rune page:', pageId)
      return true
    } catch (error) {
      console.error('[RuneService] Failed to delete rune page:', error)
      return false
    }
  }

  /**
   * Set a rune page as current
   */
  async setCurrentRunePage(pageId: number): Promise<boolean> {
    try {
      console.log('[RuneService] Attempting to set current rune page to:', pageId)

      // First, verify the page exists
      const pages = await this.getRunePages()
      const targetPage = pages.find((p) => p.id === pageId)

      if (!targetPage) {
        console.error('[RuneService] Target page not found:', pageId)
        return false
      }

      console.log('[RuneService] Target page found:', targetPage.name)

      // LCU API expects just the page ID as a number in the request body
      // Use requestRaw to properly serialize the number
      const response = await lcuConnector.requestRaw('PUT', `/lol-perks/v1/currentpage`, pageId)
      console.log('[RuneService] PUT response:', response)

      // Verify the change
      await new Promise((resolve) => setTimeout(resolve, 500))
      const currentPage = await this.getCurrentRunePage()
      console.log('[RuneService] Current page after change:', currentPage?.id, currentPage?.name)

      if (currentPage && currentPage.id === pageId) {
        console.log('[RuneService] Successfully set current rune page:', pageId)
        return true
      } else {
        console.error(
          '[RuneService] Failed to verify rune page change. Expected:',
          pageId,
          'Got:',
          currentPage?.id
        )
        return false
      }
    } catch (error) {
      console.error('[RuneService] Failed to set current rune page:', error)
      return false
    }
  }

  /**
   * Delete oldest editable page if at max capacity (25 pages)
   */
  async deleteOldestEditablePageIfNeeded(): Promise<boolean> {
    try {
      const pages = await this.getRunePages()

      // Check if at max capacity (25 pages)
      if (pages.length >= 25) {
        // Find oldest editable page
        const editablePages = pages
          .filter((p) => p.isEditable && p.isDeletable)
          .sort((a, b) => a.lastModified - b.lastModified)

        if (editablePages.length > 0) {
          const oldestPage = editablePages[0]
          console.log('[RuneService] Deleting oldest editable page:', oldestPage.name)
          return await this.deleteRunePage(oldestPage.id)
        }
      }

      return true
    } catch (error) {
      console.error('[RuneService] Failed to delete oldest page:', error)
      return false
    }
  }

  /**
   * Validate rune selection
   */
  validateRuneSelection(
    primaryStyleId: number,
    subStyleId: number,
    selectedPerkIds: number[]
  ): { valid: boolean; error?: string } {
    // Must have exactly 9 runes selected (4 primary + 2 secondary + 3 stat)
    if (selectedPerkIds.length !== 9) {
      return { valid: false, error: '9 rün seçmelisiniz (4 ana + 2 ikincil + 3 istatistik)' }
    }

    // Primary and sub styles must be different
    if (primaryStyleId === subStyleId) {
      return { valid: false, error: 'Ana ve ikincil ağaç farklı olmalı' }
    }

    return { valid: true }
  }
}

export const runeService = RuneService.getInstance()
