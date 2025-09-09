import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

interface BackButtonProps {
  to?: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
  variant?: 'default' | 'ghost' | 'outline'
}

export function BackButton({ 
  to, 
  onClick, 
  className, 
  children,
  variant = 'ghost'
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={cn('gap-2', className)}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
      {children || 'Back'}
    </Button>
  )
}

export default BackButton