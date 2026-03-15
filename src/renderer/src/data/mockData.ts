/**
 * Mock data for browser/development environment
 * Used when window.api is not available (web browser mode)
 */

export interface MockChampion {
  id: number
  name: string
  key: string
}

export const mockChampions: MockChampion[] = [
  { id: 1, name: 'Aatrox', key: 'Aatrox' },
  { id: 2, name: 'Ahri', key: 'Ahri' },
  { id: 3, name: 'Akali', key: 'Akali' },
  { id: 4, name: 'Alistar', key: 'Alistar' },
  { id: 5, name: 'Ammu', key: 'Ammu' },
  { id: 6, name: 'Anivia', key: 'Anivia' },
  { id: 7, name: 'Annie', key: 'Annie' },
  { id: 8, name: 'Aphelios', key: 'Aphelios' },
  { id: 9, name: 'Ashe', key: 'Ashe' },
  { id: 10, name: 'Aurelion Sol', key: 'AurelionSol' },
  { id: 11, name: 'Azir', key: 'Azir' },
  { id: 12, name: 'Bard', key: 'Bard' },
  { id: 13, name: 'Blitzcrank', key: 'Blitzcrank' },
  { id: 14, name: 'Brand', key: 'Brand' },
  { id: 15, name: 'Braum', key: 'Braum' },
  { id: 16, name: 'Caitlyn', key: 'Caitlyn' },
  { id: 17, name: 'Camille', key: 'Camille' },
  { id: 18, name: 'Cassiopeia', key: 'Cassiopeia' },
  { id: 19, name: "Cho'Gath", key: 'Chogath' },
  { id: 20, name: 'Corki', key: 'Corki' },
  { id: 21, name: 'Darius', key: 'Darius' },
  { id: 22, name: 'Diana', key: 'Diana' },
  { id: 23, name: 'Dr. Mundo', key: 'DrMundo' },
  { id: 24, name: 'Draven', key: 'Draven' },
  { id: 25, name: 'Ekko', key: 'Ekko' },
  { id: 26, name: 'Elise', key: 'Elise' },
  { id: 27, name: 'Evelynn', key: 'Evelynn' },
  { id: 28, name: 'Ezreal', key: 'Ezreal' },
  { id: 29, name: 'Fiddlesticks', key: 'Fiddlesticks' },
  { id: 30, name: 'Fiora', key: 'Fiora' },
  { id: 31, name: 'Fizz', key: 'Fizz' },
  { id: 32, name: 'Galio', key: 'Galio' },
  { id: 33, name: 'Gangplank', key: 'Gangplank' },
  { id: 34, name: 'Garen', key: 'Garen' },
  { id: 35, name: 'Gnar', key: 'Gnar' },
  { id: 36, name: 'Gragas', key: 'Gragas' },
  { id: 37, name: 'Graves', key: 'Graves' },
  { id: 38, name: 'Gwen', key: 'Gwen' },
  { id: 39, name: 'Hecarim', key: 'Hecarim' },
  { id: 40, name: 'Heimerdinger', key: 'Heimerdinger' },
  { id: 41, name: 'Illaoi', key: 'Illaoi' },
  { id: 42, name: 'Irelia', key: 'Irelia' },
  { id: 43, name: 'Ivern', key: 'Ivern' },
  { id: 44, name: 'Janna', key: 'Janna' },
  { id: 45, name: 'Jarvan IV', key: 'JarvanIV' },
  { id: 46, name: 'Jax', key: 'Jax' },
  { id: 47, name: 'Jayce', key: 'Jayce' },
  { id: 48, name: 'Jhin', key: 'Jhin' },
  { id: 49, name: 'Jinx', key: 'Jinx' },
  { id: 50, name: "Kai'Sa", key: 'Kaisa' },
  { id: 51, name: 'Kalista', key: 'Kalista' },
  { id: 52, name: 'Karma', key: 'Karma' },
  { id: 53, name: 'Karthus', key: 'Karthus' },
  { id: 54, name: 'Kassadin', key: 'Kassadin' },
  { id: 55, name: 'Katarina', key: 'Katarina' },
  { id: 56, name: 'Kayle', key: 'Kayle' },
  { id: 57, name: 'Kayn', key: 'Kayn' },
  { id: 58, name: 'Kennen', key: 'Kennen' },
  { id: 59, name: "Kha'Zix", key: 'Khazix' },
  { id: 60, name: 'Kindred', key: 'Kindred' }
]

/**
 * Get mock owned champions (first 20 champions)
 */
export function getMockOwnedChampions(): MockChampion[] {
  return mockChampions.slice(0, 20).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get all mock champions
 */
export function getMockAllChampions(): MockChampion[] {
  return mockChampions.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Mock champion data structure for useChampionData hook
 */
export const mockChampionData = {
  champions: mockChampions.map((champion) => ({
    ...champion,
    title: 'Champion',
    image: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.key}_0.jpg`,
    tags: ['Fighter'],
    skins: [
      {
        id: `${champion.id}000`,
        num: 0,
        name: `Default ${champion.name}`,
        chromas: false,
        rarity: 'kNoRarity',
        rarityGemPath: null,
        isLegacy: false,
        skinType: 'kBase'
      }
    ]
  })),
  lastUpdated: new Date().toISOString(),
  version: '14.1.1'
}

/**
 * Mock settings for browser environment
 */
export const mockSettings = {
  language: 'en_US',
  theme: 'dark',
  autoPickEnabled: false,
  autoBanEnabled: false,
  championDetectionEnabled: false,
  autoAcceptEnabled: false,
  leagueClientEnabled: false
}

/**
 * Mock LCU connection status
 */
export const mockLcuStatus = {
  connected: false,
  gameflowPhase: 'None',
  championSelectSession: null
}
