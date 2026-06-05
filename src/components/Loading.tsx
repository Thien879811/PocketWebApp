import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  message?: string
}> = ({ size = 'md', className, message }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10', xl: 'w-14 h-14' }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative">
        <div className={cn("rounded-full border-2 border-primary/20 border-t-primary animate-spin", sizes[size])} />
      </div>
      {message && (
        <p className="text-sm font-medium text-on-surface-variant">{message}</p>
      )}
    </div>
  )
}

export const LoadingScreen: React.FC<{
  message?: string
  fullScreen?: boolean
}> = ({ message = 'Đang tải...', fullScreen = true }) => (
  <div className={cn(
    "flex flex-col items-center justify-center bg-surface/90 backdrop-blur-sm",
    fullScreen ? "fixed inset-0 z-[100]" : "absolute inset-0 z-50 rounded-[inherit]"
  )}>
    <div className="flex flex-col items-center gap-5">
      {/* Spinner */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/15 border-t-primary animate-spin" />
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-primary text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            account_balance_wallet
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-primary">PocketFlow</p>
        <p className="text-xs text-on-surface-variant/70 mt-1">{message}</p>
      </div>
    </div>
  </div>
)

/* Skeleton block for content placeholders */
export const SkeletonLine: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("skeleton rounded-lg h-4", className)} />
)

export const SkeletonCard: React.FC = () => (
  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 space-y-3">
    <div className="flex items-center gap-3">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="w-2/3" />
        <SkeletonLine className="w-1/3 h-3" />
      </div>
    </div>
    <SkeletonLine />
    <SkeletonLine className="w-3/4" />
  </div>
)
