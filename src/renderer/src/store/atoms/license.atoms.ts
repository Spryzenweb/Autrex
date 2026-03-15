import { atom } from 'jotai'

export enum LicenseType {
  REGULAR = 'REGULAR',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  TRIAL = 'TRIAL'
}

export interface LicenseInfo {
  key: string
  type: LicenseType
  hardwareId: string
  activatedAt: string
  expiresAt: string | null
  isValid: boolean
  remainingTime?: string
}

export interface LicenseState {
  isActivated: boolean
  licenseKey: string | null
  licenseInfo: LicenseInfo | null
  activatedAt: string | null
  expiresAt: string | null
  remainingTime: string | null
  error: string | null
  isLoading: boolean
}

// Initial state
const initialState: LicenseState = {
  isActivated: false,
  licenseKey: null,
  licenseInfo: null,
  activatedAt: null,
  expiresAt: null,
  remainingTime: null,
  error: null,
  isLoading: false
}

// License state atom
export const licenseAtom = atom<LicenseState>(initialState)

// Derived atoms for convenience
export const isLicenseActivatedAtom = atom((get) => get(licenseAtom).isActivated)
export const licenseErrorAtom = atom((get) => get(licenseAtom).error)
export const licenseLoadingAtom = atom((get) => get(licenseAtom).isLoading)
export const licenseInfoAtom = atom((get) => get(licenseAtom).licenseInfo)
