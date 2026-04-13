import React from 'react'
import { Loader2 } from 'lucide-react'
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
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500", className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <Loader2 className={cn("animate-spin text-primary relative z-10", sizeClasses[size])} strokeWidth={2.5} />
      </div>
      {message && (
        <p className="font-headline font-bold text-on-surface-variant opacity-80 mt-2 tracking-tight">
          {message}
        </p>
      )}
    </div>
  )
}

export const LoadingScreen: React.FC<{ message?: string, fullScreen?: boolean }> = ({ message = 'Đang tải dữ liệu...', fullScreen = true }) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center bg-surface/80 backdrop-blur-md animate-in fade-in duration-300",
      fullScreen ? "fixed inset-0 z-[100]" : "absolute inset-0 z-50 rounded-[inherit]"
    )}>
      <div className="bg-surface-container-low p-8 rounded-[3rem] shadow-2xl border border-outline-variant/10 flex flex-col items-center gap-6 transform transition-all hover:scale-105">
        <div className="relative flex items-center justify-center w-20 h-20">
          {/* Outer rotating dashed ring */}
          <div className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-full animate-[spin_3s_linear_infinite]" />
          
          {/* Inner pulsating glow */}
          <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse" />
          
          {/* Core loader */}
          <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" strokeWidth={3} />
        </div>
        
        <div className="flex flex-col items-center gap-2 text-center max-w-[200px]">
           <h3 className="font-headline font-black text-xl text-primary italic tracking-tight">PocketFlow</h3>
           <p className="font-label font-bold text-sm text-on-surface-variant opacity-70 mt-1 uppercase tracking-widest leading-relaxed">
             {message}
           </p>
        </div>
      </div>
    </div>
  )
}
