"use client"

export type LocalUserProfile = {
  name: string
  email: string
  password: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

export type PublicUserProfile = Omit<LocalUserProfile, "password">

const USER_KEY = "prh.user"
const SESSION_KEY = "prh.session"

export const emptyProfile: PublicUserProfile = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
}

function readUser(): LocalUserProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as LocalUserProfile) : null
  } catch {
    return null
  }
}

function publicProfile(user: LocalUserProfile): PublicUserProfile {
  const { password: _password, ...profile } = user
  return profile
}

export function getSavedProfile(): PublicUserProfile | null {
  const user = readUser()
  return user ? publicProfile(user) : null
}

export function getCurrentUser(): PublicUserProfile | null {
  if (typeof window === "undefined") return null
  const sessionEmail = window.localStorage.getItem(SESSION_KEY)
  const user = readUser()
  if (!user || user.email !== sessionEmail) return null
  return publicProfile(user)
}

export function signUpUser(profile: LocalUserProfile): PublicUserProfile {
  window.localStorage.setItem(USER_KEY, JSON.stringify(profile))
  window.localStorage.setItem(SESSION_KEY, profile.email)
  return publicProfile(profile)
}

export function signInUser(email: string, password: string): PublicUserProfile {
  const user = readUser()
  if (!user || user.email !== email || user.password !== password) {
    throw new Error("Invalid email or password")
  }
  window.localStorage.setItem(SESSION_KEY, user.email)
  return publicProfile(user)
}

export function updateSavedProfile(
  updates: Partial<PublicUserProfile>,
): PublicUserProfile {
  const user = readUser()
  if (!user) {
    throw new Error("Create an account before saving profile details")
  }

  const nextUser = { ...user, ...updates }
  window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  return publicProfile(nextUser)
}

export function saveCheckoutProfile(profile: PublicUserProfile) {
  const user = readUser()
  if (!user || user.email !== profile.email) return
  window.localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...profile }))
}

export function signOutUser() {
  window.localStorage.removeItem(SESSION_KEY)
}
