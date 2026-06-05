/**
 * Motion Design System — PocketFlow
 *
 * Inspired by: Linear, Vercel, Stripe, Arc Browser
 * Philosophy: Subtle, purposeful, GPU-only transforms
 */
import type { Variants, Transition } from 'framer-motion'

// ─── Timing (seconds) ─────────────────────────────────────────────────────────
export const DURATION = {
  ultraFast: 0.1,
  fast:      0.15,
  normal:    0.22,
  slow:      0.32,
  page:      0.26,
  modal:     0.22,
  drawer:    0.28,
  tooltip:   0.13,
  toast:     0.18,
} as const

// ─── Easing ────────────────────────────────────────────────────────────────────
// Premium spring-style cubic-bezier — same as Linear / Vercel
export const EASE_OUT:   [number, number, number, number] = [0.16, 1, 0.3, 1]
export const EASE_IN:    [number, number, number, number] = [0.7,  0, 0.84, 0]
export const EASE_INOUT: [number, number, number, number] = [0.85, 0, 0.15, 1]

// ─── Transition presets ────────────────────────────────────────────────────────
export const tFast: Transition   = { duration: DURATION.fast,   ease: EASE_OUT }
export const tNormal: Transition = { duration: DURATION.normal, ease: EASE_OUT }
export const tPage: Transition   = { duration: DURATION.page,   ease: EASE_OUT }

// ─── Page transition ───────────────────────────────────────────────────────────
// Soft fade + micro-lift — clean, non-distracting
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0,   transition: { duration: DURATION.page,   ease: EASE_OUT } },
  exit:    { opacity: 0, y: -5,  transition: { duration: DURATION.fast,   ease: EASE_IN  } },
}

// ─── Auth page entrance ────────────────────────────────────────────────────────
export const authPageVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0,  scale: 1,  transition: { duration: DURATION.slow, ease: EASE_OUT } },
}

// ─── Fade up (section / card entrance) ────────────────────────────────────────
export const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0,  transition: { duration: DURATION.normal, ease: EASE_OUT } },
}

// ─── Fade in (overlay / backdrop) ─────────────────────────────────────────────
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION.modal } },
  exit:    { opacity: 0, transition: { duration: DURATION.fast  } },
}

// ─── Scale in (balance card, hero elements) ───────────────────────────────────
export const scaleInVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: DURATION.normal, ease: EASE_OUT } },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: DURATION.fast } },
}

// ─── Stagger containers ────────────────────────────────────────────────────────
// Use this as parent — children get automatic stagger delay
export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

export const staggerFast: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04, delayChildren: 0.03 } },
}

// ─── Stagger child ─────────────────────────────────────────────────────────────
export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE_OUT } },
}

// ─── Drawer — from bottom (mobile sheet) ──────────────────────────────────────
export const drawerBottomVariants: Variants = {
  initial: { y: '100%' },
  animate: { y: 0,       transition: { duration: DURATION.drawer, ease: EASE_OUT } },
  exit:    { y: '100%',  transition: { duration: DURATION.fast,   ease: EASE_IN  } },
}

// ─── Drawer — from left (sidebar) ─────────────────────────────────────────────
export const drawerLeftVariants: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0,        transition: { duration: DURATION.drawer, ease: EASE_OUT } },
  exit:    { x: '-100%',  transition: { duration: DURATION.fast,   ease: EASE_IN  } },
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: { opacity: 1, scale: 1,    y: 0, transition: { duration: DURATION.modal, ease: EASE_OUT } },
  exit:    { opacity: 0, scale: 0.95, y: 8, transition: { duration: DURATION.fast } },
}

// ─── FAB / floating elements ───────────────────────────────────────────────────
export const fabVariants: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1, transition: { delay: 0.25, duration: DURATION.normal, ease: EASE_OUT } },
}

// ─── Dot indicator (bottom nav active dot) ────────────────────────────────────
export const dotVariants: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: EASE_OUT } },
  exit:    { opacity: 0, scale: 0, transition: { duration: 0.12 } },
}
