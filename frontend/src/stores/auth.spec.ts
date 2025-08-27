import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const store = useAuthStore()
    
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should compute isAuthenticated correctly', () => {
    const store = useAuthStore()
    
    expect(store.isAuthenticated).toBe(false)
    
    store.token = 'test-token'
    expect(store.isAuthenticated).toBe(true)
    
    store.token = null
    expect(store.isAuthenticated).toBe(false)
  })

  it('should clear auth data on logout', () => {
    const store = useAuthStore()
    
    // Set some auth data
    store.user = { id: '1', email: 'test@test.com', username: 'test' }
    store.token = 'test-token'
    store.refreshToken = 'test-refresh-token'
    
    // Logout
    store.logout()
    
    // Check everything is cleared
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })
})