import { useState } from 'react'
import { User } from 'lucide-react'
import { cx } from '../utils'

interface AvatarProps {
  name?: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-20 w-20 text-lg',
}

export function Avatar({ name = '', src, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '')
    .trim()
    .split(/\s+/)
    .map((p) => p[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${name} avatar`}
        onError={() => setFailed(true)}
        className={cx('shrink-0 rounded-full object-cover', sizeMap[size], className)}
      />
    )
  }
  return (
    <span
      aria-hidden={!src}
      className={cx('flex shrink-0 items-center justify-center rounded-full bg-primary-light font-bold text-primary-dark', sizeMap[size], className)}
    >
      {initials || <User size={size === 'lg' ? 28 : size === 'md' ? 20 : 16} aria-hidden="true" />}
    </span>
  )
}
