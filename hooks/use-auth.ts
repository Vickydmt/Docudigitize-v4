"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, name: string) => Promise<boolean>
  signInWithGoogle: () => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simple mock login - in a real app, you would validate against a backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, accept any email/password with basic validation
      if (!email.includes("@") || password.length < 6) {
        return false
      }

      const mockUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name: email.split("@")[0],
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      localStorage.setItem("isLoggedIn", "true")

      // Dispatch custom event for header to update
      window.dispatchEvent(new Event("auth-change"))
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, accept any valid email/password
      if (!email.includes("@") || password.length < 6) {
        return false
      }

      const mockUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name: name || email.split("@")[0],
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      localStorage.setItem("isLoggedIn", "true")

      // Dispatch custom event for header to update
      window.dispatchEvent(new Event("auth-change"))
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      // Simulate Google sign-in
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser = {
        id: Math.random().toString(36).substring(2, 15),
        email: "user@gmail.com",
        name: "Google User",
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      localStorage.setItem("isLoggedIn", "true")

      // Dispatch custom event for header to update
      window.dispatchEvent(new Event("auth-change"))
      return true
    } catch (error) {
      console.error("Google login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.setItem("isLoggedIn", "false")

    // Dispatch custom event for header to update
    window.dispatchEvent(new Event("auth-change"))
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user,
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
