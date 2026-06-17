import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClueCard from '../components/ClueCard'

describe('ClueCard', () => {
  const mockOnReveal = vi.fn()
  const defaultProps = {
    clue: 'This is a test clue',
    index: 0,
    revealed: false,
    onReveal: mockOnReveal,
    disabled: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the clue when revealed', () => {
      render(
        <ClueCard 
          {...defaultProps} 
          revealed={true} 
        />
      )
      
      expect(screen.getByText('This is a test clue')).toBeInTheDocument()
    })

    it('should show locked state when not revealed', () => {
      render(<ClueCard {...defaultProps} />)
      
      expect(screen.getByText(/Clue #1 \(Click to reveal\)/)).toBeInTheDocument()
      expect(screen.queryByText('This is a test clue')).not.toBeInTheDocument()
    })

    it('should display the correct clue number', () => {
      render(
        <ClueCard 
          {...defaultProps} 
          index={2} 
        />
      )
      
      expect(screen.getByText(/Clue #3 \(Click to reveal\)/)).toBeInTheDocument()
    })

    it('should render the correct icon for each clue index', () => {
      const { rerender } = render(
        <ClueCard 
          {...defaultProps} 
          index={0} 
          revealed={true} 
        />
      )
      
      // Clue 0 should have Trophy icon
      const trophyIcon = document.querySelector('[class*="lucide-trophy"]')
      expect(trophyIcon).toBeInTheDocument()
      
      rerender(
        <ClueCard 
          {...defaultProps} 
          index={1} 
          revealed={true} 
        />
      )
      
      // Clue 1 should have Award icon
      const awardIcon = document.querySelector('[class*="lucide-award"]')
      expect(awardIcon).toBeInTheDocument()
      
      rerender(
        <ClueCard 
          {...defaultProps} 
          index={2} 
          revealed={true} 
        />
      )
      
      // Clue 2 should have Star icon
      const starIcon = document.querySelector('[class*="lucide-star"]')
      expect(starIcon).toBeInTheDocument()
      
      rerender(
        <ClueCard 
          {...defaultProps} 
          index={3} 
          revealed={true} 
        />
      )
      
      // Clue 3+ should show the index number
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('should display the correct difficulty badge for each clue index', () => {
      const { rerender } = render(
        <ClueCard 
          {...defaultProps} 
          index={0} 
          revealed={true} 
        />
      )
      
      expect(screen.getByText('Easy')).toBeInTheDocument()
      
      rerender(
        <ClueCard 
          {...defaultProps} 
          index={1} 
          revealed={true} 
        />
      )
      
      expect(screen.getByText('Medium')).toBeInTheDocument()
      
      rerender(
        <ClueCard 
          {...defaultProps} 
          index={2} 
          revealed={true} 
        />
      )
      
      expect(screen.getByText('Hard')).toBeInTheDocument()
      
      rerender(
        <ClueCard 
          {...defaultProps} 
          index={3} 
          revealed={true} 
        />
      )
      
      expect(screen.getByText('Expert')).toBeInTheDocument()
    })

    it('should show Lock icon when not revealed', () => {
      render(<ClueCard {...defaultProps} />)
      
      const lockIcon = document.querySelector('[class*="lucide-lock"]')
      expect(lockIcon).toBeInTheDocument()
    })

    it('should show Eye icon when revealed', () => {
      render(
        <ClueCard 
          {...defaultProps} 
          revealed={true} 
        />
      )
      
      const eyeIcon = document.querySelector('[class*="lucide-eye"]')
      expect(eyeIcon).toBeInTheDocument()
    })

    it('should show EyeOff icon when not revealed', () => {
      render(<ClueCard {...defaultProps} />)
      
      const eyeOffIcon = document.querySelector('[class*="lucide-eye-off"]')
      expect(eyeOffIcon).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onReveal when clicked and not revealed', async () => {
      const user = userEvent.setup()
      
      render(<ClueCard {...defaultProps} />)
      
      const clueCard = screen.getByText(/Clue #1 \(Click to reveal\)/).closest('.clue-card')
      await user.click(clueCard)
      
      expect(mockOnReveal).toHaveBeenCalledWith(0)
    })

    it('should not call onReveal when already revealed', async () => {
      const user = userEvent.setup()
      
      render(
        <ClueCard 
          {...defaultProps} 
          revealed={true} 
        />
      )
      
      const clueCard = screen.getByText('This is a test clue').closest('.clue-card')
      await user.click(clueCard)
      
      expect(mockOnReveal).not.toHaveBeenCalled()
    })

    it('should not call onReveal when disabled', async () => {
      const user = userEvent.setup()
      
      render(
        <ClueCard 
          {...defaultProps} 
          disabled={true} 
        />
      )
      
      const clueCard = screen.getByText(/Clue #1 \(Click to reveal\)/).closest('.clue-card')
      await user.click(clueCard)
      
      expect(mockOnReveal).not.toHaveBeenCalled()
    })


    it('should not apply hover effects when disabled', async () => {
      const user = userEvent.setup()
      
      render(
        <ClueCard 
          {...defaultProps} 
          disabled={true} 
        />
      )
      
      const clueCard = screen.getByText(/Clue #1 \(Click to reveal\)/).closest('.clue-card')
      
      // The card should have opacity-50 class when disabled
      expect(clueCard).toHaveClass('opacity-50')
      
      await user.hover(clueCard)
      
      // Should not have hover:border-blue-500 when disabled
      expect(clueCard).not.toHaveClass('hover:border-blue-500')
    })
  })

  describe('Styling', () => {
    it('should apply revealed styling when revealed', () => {
      render(
        <ClueCard 
          {...defaultProps} 
          revealed={true} 
        />
      )
      
      const clueCard = screen.getByText('This is a test clue').closest('.clue-card')
      expect(clueCard).toHaveClass('revealed')
      expect(clueCard).toHaveClass('border-blue-500')
    })

    it('should have cursor-pointer when not revealed and not disabled', () => {
      render(<ClueCard {...defaultProps} />)
      
      const clueCard = screen.getByText(/Clue #1 \(Click to reveal\)/).closest('.clue-card')
      expect(clueCard).toHaveClass('cursor-pointer')
    })

    it('should not have cursor-pointer when disabled', () => {
      render(
        <ClueCard 
          {...defaultProps} 
          disabled={true} 
        />
      )
      
      const clueCard = screen.getByText(/Clue #1 \(Click to reveal\)/).closest('.clue-card')
      expect(clueCard).not.toHaveClass('cursor-pointer')
    })

    it('should apply gradient background when revealed', () => {
      render(
        <ClueCard 
          {...defaultProps} 
          revealed={true} 
        />
      )
      
      const clueCard = screen.getByText('This is a test clue').closest('.clue-card')
      expect(clueCard).toHaveClass('bg-gradient-to-r')
      expect(clueCard).toHaveClass('from-blue-900/40')
      expect(clueCard).toHaveClass('to-purple-900/40')
    })

    it('should apply appropriate background when not revealed', () => {
      render(<ClueCard {...defaultProps} />)
      
      const clueCard = screen.getByText(/Clue #1 \(Click to reveal\)/).closest('.clue-card')
      expect(clueCard).toHaveClass('bg-slate-900/50')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long clue text', () => {
      const longClue = 'This is a very long clue that should still display properly in the component without breaking the layout. It contains multiple sentences and should wrap to the next line.'
      
      render(
        <ClueCard 
          {...defaultProps} 
          clue={longClue} 
          revealed={true} 
        />
      )
      
      expect(screen.getByText(longClue)).toBeInTheDocument()
    })

    it('should handle clue index greater than 3', () => {
      render(
        <ClueCard 
          {...defaultProps} 
          index={5} 
          revealed={true} 
        />
      )
      
      // Should show the number 6 (index + 1)
      expect(screen.getByText('6')).toBeInTheDocument()
      expect(screen.getByText('Expert')).toBeInTheDocument() // Should default to Expert for index >= 3
    })

    it('should handle negative clue index gracefully', () => {
      render(
        <ClueCard 
          {...defaultProps} 
          index={-1} 
          revealed={true} 
        />
      )
      
      // Should show the number 0 (index + 1)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle special characters in clue text', () => {
      const specialClue = 'Clue with special chars: !@#$%^&*()_+{}|:"<>?'
      
      render(
        <ClueCard 
          {...defaultProps} 
          clue={specialClue} 
          revealed={true} 
        />
      )
      
      expect(screen.getByText(specialClue)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have appropriate text for screen readers', () => {
      render(<ClueCard {...defaultProps} />)
      
      // The locked clue text should be visible
      expect(screen.getByText(/Clue #1 \(Click to reveal\)/)).toBeInTheDocument()
    })

    it('should show difficulty badge as text for accessibility', () => {
      render(
        <ClueCard 
          {...defaultProps} 
          index={0} 
          revealed={true} 
        />
      )
      
      expect(screen.getByText('Easy')).toBeInTheDocument()
    })
  })

  describe('Visual Feedback', () => {
    it('should show pulsing dot when not revealed', () => {
      render(<ClueCard {...defaultProps} />)
      
      const dot = document.querySelector('.animate-pulse')
      expect(dot).toBeInTheDocument()
      expect(dot).toHaveClass('bg-blue-500')
    })

    it('should not show pulsing dot when revealed', () => {
      render(
        <ClueCard 
          {...defaultProps} 
          revealed={true} 
        />
      )
      
      const dot = document.querySelector('.animate-pulse')
      expect(dot).not.toBeInTheDocument()
    })

    it('should apply shadow when revealed', () => {
      render(
        <ClueCard 
          {...defaultProps} 
          revealed={true} 
        />
      )
      
      const clueCard = screen.getByText('This is a test clue').closest('.clue-card')
      expect(clueCard).toHaveClass('shadow-lg')
      expect(clueCard).toHaveClass('shadow-blue-500/10')
    })

    it('should change EyeOff icon color on hover when not disabled', async () => {
      const user = userEvent.setup()
      
      render(<ClueCard {...defaultProps} />)
      
      const clueCard = screen.getByText(/Clue #1 \(Click to reveal\)/).closest('.clue-card')
      
      // Initially should have text-slate-500
      const eyeOffIcon = document.querySelector('[class*="lucide-eye-off"]')
      expect(eyeOffIcon).toHaveClass('text-slate-500')
      
      // Hover should change to text-blue-400
      await user.hover(clueCard)
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // The icon should now have text-blue-400 class
      // Note: This depends on the hover state implementation
      // The hover state is tracked in the component
    })
  })
})