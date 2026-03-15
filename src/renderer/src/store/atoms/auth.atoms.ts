import { atom } from 'jotai'

// Simplified auth atoms - old authentication system removed
// License management is now handled by license.atoms.ts
export const authTokenAtom = atom<string | null>(null)
