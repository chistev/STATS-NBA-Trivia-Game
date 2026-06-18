import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import Confetti from '../components/Confetti'

describe('Confetti', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true
    })
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
      writable: true
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Initial rendering', () => {
    it('should render without crashing', () => {
      render(<Confetti />)
      
      const container = document.querySelector('.fixed.inset-0')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('pointer-events-none')
      expect(container).toHaveClass('z-50')
    })

    it('should create 100 particles on mount', () => {
      render(<Confetti />)
      
      const particles = document.querySelectorAll('.absolute')
      expect(particles).toHaveLength(100)
    })

    it('should position particles at different x coordinates within window width', () => {
      render(<Confetti />)
      
      const particles = document.querySelectorAll('.absolute')
      particles.forEach(p => {
        const left = parseFloat(p.style.left)
        expect(left).toBeGreaterThanOrEqual(0)
        expect(left).toBeLessThanOrEqual(1200)
      })
    })

    it('should start particles above the screen (y = -20)', () => {
      render(<Confetti />)
      
      const particles = document.querySelectorAll('.absolute')
      particles.forEach(p => {
        const top = parseFloat(p.style.top)
        expect(top).toBe(-20)
      })
    })

    it('should set random particle sizes between 4 and 12', () => {
      render(<Confetti />)
      
      const particles = document.querySelectorAll('.absolute')
      particles.forEach(p => {
        const size = parseFloat(p.style.width)
        expect(size).toBeGreaterThanOrEqual(4)
        expect(size).toBeLessThanOrEqual(12)
        expect(p.style.width).toBe(p.style.height) // Should be square
      })
    })

    it('should apply rotate(45deg) transform to particles', () => {
      render(<Confetti />)
      
      const particles = document.querySelectorAll('.absolute')
      particles.forEach(p => {
        expect(p.style.transform).toBe('rotate(45deg)')
      })
    })

    it('should apply transition to particles', () => {
      render(<Confetti />)
      
      const particles = document.querySelectorAll('.absolute')
      particles.forEach(p => {
        expect(p.style.transition).toBe('all 0.05s linear')
      })
    })
  })

  describe('Animation', () => {
    it('should animate particles downward', () => {
      render(<Confetti />)
      
      // Get initial positions
      const particles = document.querySelectorAll('.absolute')
      const initialTops = Array.from(particles).map(p => parseFloat(p.style.top))
      
      // Advance time by 50ms (one animation frame)
      act(() => {
        vi.advanceTimersByTime(50)
      })
      
      // Get new positions
      const updatedParticles = document.querySelectorAll('.absolute')
      const newTops = Array.from(updatedParticles).map(p => parseFloat(p.style.top))
      
      // Each particle should have moved down
      newTops.forEach((top, index) => {
        expect(top).toBeGreaterThan(initialTops[index])
      })
    })

    it('should animate particles horizontally', () => {
      render(<Confetti />)
      
      // Get initial positions
      const particles = document.querySelectorAll('.absolute')
      const initialLefts = Array.from(particles).map(p => parseFloat(p.style.left))
      
      // Advance time by 50ms
      act(() => {
        vi.advanceTimersByTime(50)
      })
      
      // Get new positions
      const updatedParticles = document.querySelectorAll('.absolute')
      const newLefts = Array.from(updatedParticles).map(p => parseFloat(p.style.left))
      
      // Some particles should have moved horizontally (may be same if velocityX is 0)
      const someMoved = newLefts.some((left, index) => left !== initialLefts[index])
      expect(someMoved).toBe(true)
    })

    it('should remove particles that go below the screen', () => {
      render(<Confetti />)
      
      // Advance time significantly to move particles down
      act(() => {
        // Advance 100 frames (50ms each = 5000ms total)
        for (let i = 0; i < 100; i++) {
          vi.advanceTimersByTime(50)
        }
      })
      
      const particles = document.querySelectorAll('.absolute')
      particles.forEach(p => {
        const top = parseFloat(p.style.top)
        // Some particles may have been filtered out, but those remaining should be above the screen
        expect(top).toBeLessThanOrEqual(800)
      })
    })

    it('should animate at 50ms intervals', () => {
      render(<Confetti />)
      
      const particles = document.querySelectorAll('.absolute')
      const initialTops = Array.from(particles).map(p => parseFloat(p.style.top))
      
      // Advance time by 49ms (should not trigger animation yet)
      act(() => {
        vi.advanceTimersByTime(49)
      })
      
      let updatedParticles = document.querySelectorAll('.absolute')
      let newTops = Array.from(updatedParticles).map(p => parseFloat(p.style.top))
      
      // Positions should not have changed (or only very slightly due to floating point)
      // They might have changed by 0.0001 due to floating point, so check approximate
      const changed = newTops.some((top, index) => Math.abs(top - initialTops[index]) > 0.1)
      expect(changed).toBe(false)
      
      // Advance by 1ms more (total 50ms)
      act(() => {
        vi.advanceTimersByTime(1)
      })
      
      updatedParticles = document.querySelectorAll('.absolute')
      newTops = Array.from(updatedParticles).map(p => parseFloat(p.style.top))
      
      // Now positions should have changed
      const moved = newTops.some((top, index) => top !== initialTops[index])
      expect(moved).toBe(true)
    })
  })

  describe('Cleanup', () => {
    it('should clear interval and timeout on unmount', () => {
      const { unmount } = render(<Confetti />)
      
      // Spy on clearInterval and clearTimeout
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
      
      unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
      expect(clearTimeoutSpy).toHaveBeenCalled()
    })

    it('should clear particles after 5 seconds', () => {
      render(<Confetti />)
      
      // Initially there should be particles
      let particles = document.querySelectorAll('.absolute')
      expect(particles.length).toBeGreaterThan(0)
      
      // Advance time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      
      // All particles should be cleared
      particles = document.querySelectorAll('.absolute')
      expect(particles).toHaveLength(0)
    })

    it('should clean up interval when component unmounts before timeout', () => {
      const { unmount } = render(<Confetti />)
      
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
      
      unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('should clean up timeout when component unmounts before timeout completes', () => {
      const { unmount } = render(<Confetti />)
      
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
      
      // Unmount before 5 seconds
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      unmount()
      
      expect(clearTimeoutSpy).toHaveBeenCalled()
    })
  })

  describe('Responsive behavior', () => {
    it('should use window.innerWidth for particle positioning', () => {
      // Change window width
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        writable: true
      })
      
      render(<Confetti />)
      
      const particles = document.querySelectorAll('.absolute')
      particles.forEach(p => {
        const left = parseFloat(p.style.left)
        expect(left).toBeGreaterThanOrEqual(0)
        expect(left).toBeLessThanOrEqual(800)
      })
    })

    it('should use window.innerHeight for removing particles below screen', () => {
      // Change window height
      Object.defineProperty(window, 'innerHeight', {
        value: 600,
        writable: true
      })
      
      render(<Confetti />)
      
      // Advance time to move particles down
      act(() => {
        for (let i = 0; i < 100; i++) {
          vi.advanceTimersByTime(50)
        }
      })
      
      const particles = document.querySelectorAll('.absolute')
      particles.forEach(p => {
        const top = parseFloat(p.style.top)
        expect(top).toBeLessThanOrEqual(600)
      })
    })
  })

  describe('Performance', () => {
    it('should not cause memory leaks during animation', () => {
      const { unmount } = render(<Confetti />)
      
      // Run animation for a while
      act(() => {
        for (let i = 0; i < 50; i++) {
          vi.advanceTimersByTime(50)
        }
      })
      
      // Unmount should clean up all intervals and timeouts
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
      
      unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
      expect(clearTimeoutSpy).toHaveBeenCalled()
    })

    it('should update particle states efficiently', () => {
      const renderSpy = vi.spyOn(console, 'warn')
      
      render(<Confetti />)
      
      // Advance time for a few frames
      act(() => {
        for (let i = 0; i < 10; i++) {
          vi.advanceTimersByTime(50)
        }
      })
      
      // Should not have performance warnings
      expect(renderSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('setState'),
        expect.anything()
      )
      
      renderSpy.mockRestore()
    })
  })
})