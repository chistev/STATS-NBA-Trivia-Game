import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from '../components/AuthModal'

describe('AuthModal', () => {
  const mockOnClose = vi.fn()
  const mockOnLoginSuccess = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset fetch mock
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <AuthModal 
          isOpen={false} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      expect(screen.queryByText('Welcome Back!')).not.toBeInTheDocument()
      expect(screen.queryByText('Join STATS')).not.toBeInTheDocument()
    })

    it('should render login form when isOpen is true', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      expect(screen.getByText('Welcome Back!')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
      expect(screen.getByText("Don't have an account? Sign up")).toBeInTheDocument()
      
      // Should not show confirm password for login
      expect(screen.queryByPlaceholderText('Confirm password')).not.toBeInTheDocument()
    })

    it('should render registration form when switching to sign up', () => {
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      // Click sign up link
      fireEvent.click(screen.getByText("Don't have an account? Sign up"))
      
      expect(screen.getByText('Join STATS')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
      expect(screen.getByText('Already have an account? Login')).toBeInTheDocument()
    })
  })

  describe('Form interactions', () => {
    it('should update username field when typing', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      const usernameInput = screen.getByPlaceholderText('Enter username')
      await user.type(usernameInput, 'testuser')
      
      expect(usernameInput).toHaveValue('testuser')
    })

    it('should update password field when typing', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      const passwordInput = screen.getByPlaceholderText('Enter password')
      await user.type(passwordInput, 'password123')
      
      expect(passwordInput).toHaveValue('password123')
    })

    it('should update confirm password field when typing in registration mode', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      // Switch to registration
      await user.click(screen.getByText("Don't have an account? Sign up"))
      
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm password')
      await user.type(confirmPasswordInput, 'password123')
      
      expect(confirmPasswordInput).toHaveValue('password123')
    })

    it('should switch between login and registration modes', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      // Initially login mode
      expect(screen.getByText('Welcome Back!')).toBeInTheDocument()
      
      // Switch to registration
      await user.click(screen.getByText("Don't have an account? Sign up"))
      expect(screen.getByText('Join STATS')).toBeInTheDocument()
      
      // Switch back to login
      await user.click(screen.getByText('Already have an account? Login'))
      expect(screen.getByText('Welcome Back!')).toBeInTheDocument()
    })
  })

  describe('Login functionality', () => {
    it('should successfully login with valid credentials', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        access: 'fake-access-token',
        refresh: 'fake-refresh-token',
        user: { id: 1, username: 'testuser' }
      }
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      // Fill in form
      await user.type(screen.getByPlaceholderText('Enter username'), 'testuser')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Login' }))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/auth/login/',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'testuser',
              password: 'password123'
            })
          })
        )
        
        expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'fake-access-token')
        expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'fake-refresh-token')
        expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.user))
        expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockResponse.user)
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should show error message on login failure', async () => {
      const user = userEvent.setup()
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid username or password' })
      })
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      await user.type(screen.getByPlaceholderText('Enter username'), 'testuser')
      await user.type(screen.getByPlaceholderText('Enter password'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: 'Login' }))
      
      await waitFor(() => {
        expect(screen.getByText('Invalid username or password')).toBeInTheDocument()
      })
      
      expect(mockOnLoginSuccess).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should handle network errors during login', async () => {
      const user = userEvent.setup()
      
      global.fetch.mockRejectedValueOnce(new Error('Network error'))
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      await user.type(screen.getByPlaceholderText('Enter username'), 'testuser')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Login' }))
      
      await waitFor(() => {
        expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument()
      })
    })
  })

  describe('Registration functionality', () => {
    it('should successfully register with valid credentials', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        access: 'fake-access-token',
        refresh: 'fake-refresh-token',
        user: { id: 1, username: 'newuser' }
      }
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      // Switch to registration
      await user.click(screen.getByText("Don't have an account? Sign up"))
      
      // Fill in form
      await user.type(screen.getByPlaceholderText('Enter username'), 'newuser')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.type(screen.getByPlaceholderText('Confirm password'), 'password123')
      
      await user.click(screen.getByRole('button', { name: 'Create Account' }))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/auth/register/',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'newuser',
              password: 'password123',
              password_confirm: 'password123'
            })
          })
        )
        
        expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'fake-access-token')
        expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'fake-refresh-token')
        expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.user))
        expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockResponse.user)
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      await user.click(screen.getByText("Don't have an account? Sign up"))
      
      await user.type(screen.getByPlaceholderText('Enter username'), 'newuser')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.type(screen.getByPlaceholderText('Confirm password'), 'password456')
      await user.click(screen.getByRole('button', { name: 'Create Account' }))
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })

    it('should show validation errors from server', async () => {
      const user = userEvent.setup()
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ username: ['Username already exists'] })
      })
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      await user.click(screen.getByText("Don't have an account? Sign up"))
      
      await user.type(screen.getByPlaceholderText('Enter username'), 'existinguser')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.type(screen.getByPlaceholderText('Confirm password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Create Account' }))
      
      await waitFor(() => {
        expect(screen.getByText('Username already exists')).toBeInTheDocument()
      })
    })
  })

  describe('Close functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      await user.click(screen.getByRole('button', { name: '' })) // X button
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Loading state', () => {
    it('should disable submit button and show loading text during submission', async () => {
      const user = userEvent.setup()
      
      // Make fetch slow
      global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onLoginSuccess={mockOnLoginSuccess} 
        />
      )
      
      await user.type(screen.getByPlaceholderText('Enter username'), 'testuser')
      await user.type(screen.getByPlaceholderText('Enter password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Login' }))
      
      const submitButton = screen.getByRole('button', { name: 'Loading...' })
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Loading...')
    })
  })

describe('Edge cases', () => {
  it('should handle empty form submission', async () => {
    const user = userEvent.setup()
    
    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onLoginSuccess={mockOnLoginSuccess} 
      />
    )
    
    await user.click(screen.getByRole('button', { name: 'Login' }))
    
    // Browser validation should catch empty fields
    // But we can also check that fetch was not called
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should handle API response with array of errors', async () => {
    const user = userEvent.setup()
    
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ 
        password: ['Password too short', 'Password must contain a number'],
        username: ['Username required']
      })
    })
    
    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onLoginSuccess={mockOnLoginSuccess} 
      />
    )
    
    await user.click(screen.getByText("Don't have an account? Sign up"))
    await user.type(screen.getByPlaceholderText('Enter username'), 'a')
    await user.type(screen.getByPlaceholderText('Enter password'), 'pass')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'pass')
    await user.click(screen.getByRole('button', { name: 'Create Account' }))
    
    await waitFor(() => {
      expect(screen.getByText(/Password too short/)).toBeInTheDocument()
    })
  })

  it('should handle special characters in username and password', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      access: 'fake-access-token',
      refresh: 'fake-refresh-token',
      user: { id: 1, username: 'test@user' }
    }
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })
    
    render(
      <AuthModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onLoginSuccess={mockOnLoginSuccess} 
      />
    )
    
    await user.type(screen.getByPlaceholderText('Enter username'), 'test@user')
    await user.type(screen.getByPlaceholderText('Enter password'), 'P@ssw0rd!')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/login/',
        expect.objectContaining({
          body: JSON.stringify({
            username: 'test@user',
            password: 'P@ssw0rd!'
          })
        })
      )
    })
  })
})
})