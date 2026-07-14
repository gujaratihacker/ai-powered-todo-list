import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import { uid } from '../lib/utils'

interface AuthState {
  user: User | null
  token: string | null
  /** OTP for the pending email change. Stored client-side only for stub demo. */
  emailOtp: string | null
  register: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  requestPasswordReset: (email: string) => Promise<void>
  verifyEmail: (code: string) => Promise<boolean>
  updateProfile: (patch: Partial<User>) => void
  /** Start an email change: sends an OTP to `newEmail`. Returns the OTP for stub display. */
  requestEmailChange: (newEmail: string) => Promise<string>
  /** Confirm the email change with the OTP. Returns true on success. */
  confirmEmailChange: (otp: string) => Promise<boolean>
  cancelEmailChange: () => void
}

/** Stubbed auth. Replace with real API calls when a backend is wired. */
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      emailOtp: null,

      async register(email, password, name) {
        void password
        const user: User = {
          id: uid('u'),
          email,
          name,
          verified: false,
          createdAt: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
        set({ user, token: `stub.${user.id}` })
      },
      async login(email, password) {
        void password
        const existing = get().user
        const user: User =
          existing?.email === email
            ? existing
            : {
                id: uid('u'),
                email,
                name: email.split('@')[0],
                verified: true,
                createdAt: new Date().toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }
        set({ user, token: `stub.${user.id}` })
      },
      async loginWithGoogle() {
        const user: User = {
          id: uid('u'),
          email: 'you@gmail.com',
          name: 'Google User',
          verified: true,
          avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Google%20User',
          createdAt: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
        set({ user, token: `stub.${user.id}` })
      },
      logout() {
        set({ user: null, token: null, emailOtp: null })
      },
      async requestPasswordReset(email) {
        console.info('[auth] password reset requested for', email)
      },
      async verifyEmail(code) {
        if (code.length < 4) return false
        const user = get().user
        if (user) set({ user: { ...user, verified: true } })
        return true
      },
      updateProfile(patch) {
        const user = get().user
        if (!user) return
        set({ user: { ...user, ...patch } })
      },

      async requestEmailChange(newEmail) {
        const user = get().user
        if (!user) throw new Error('Not signed in')
        // Generate a 6-digit OTP. In production the backend emails this.
        const otp = String(Math.floor(100000 + Math.random() * 900000))
        set({
          user: { ...user, pendingEmail: newEmail },
          emailOtp: otp,
        })
        // Log so demo users can find it easily.
        console.info(`[auth] OTP sent to ${newEmail}: ${otp}`)
        return otp
      },
      async confirmEmailChange(otp) {
        const { user, emailOtp } = get()
        if (!user || !user.pendingEmail || !emailOtp) return false
        if (otp.trim() !== emailOtp) return false
        set({
          user: {
            ...user,
            email: user.pendingEmail,
            pendingEmail: undefined,
            verified: true,
          },
          emailOtp: null,
        })
        return true
      },
      cancelEmailChange() {
        const user = get().user
        if (!user) return
        set({ user: { ...user, pendingEmail: undefined }, emailOtp: null })
      },
    }),
    { name: 'aurora.auth' },
  ),
)
