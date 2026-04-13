# 🎨 Dark Mode CSS Modernization - Implementation Guide

## Overview
This guide contains specific CSS updates to modernize PocketFlow's dark mode with glass morphism, enhanced shadows, and advanced visual effects.

---

## 1. Updated Color Palette (index.css)

### Replace `:root` CSS Variables Section

Replace the existing color variables with:

```css
:root {
  /* Modern Primary Blue - More refined */
  --primary: #4ba8f4;
  --on-primary: #ffffff;
  --primary-container: #0d47a1;
  --on-primary-container: #e3f2fd;
  
  /* Modern Secondary Green */
  --secondary: #2dd4a4;
  --on-secondary: #ffffff;
  --secondary-container: #064e3b;
  --on-secondary-container: #d1fae5;
  
  /* Modern Tertiary Purple */
  --tertiary: #c084fc;
  --on-tertiary: #ffffff;
  --tertiary-container: #4c1d95;
  --on-tertiary-container: #f3e8ff;
  
  /* Error - More modern red */
  --error: #ff5252;
  --on-error: #ffffff;
  --error-container: #ffebee;
  --on-error-container: #b71c1c;
  
  /* Modern Dark Background - GitHub-inspired */
  --background: #0d1117;
  --on-background: #e5e7eb;
  
  /* Enhanced Surface Colors */
  --surface: #161b22;
  --on-surface: #f0f4ff;
  --surface-variant: #21262d;
  --on-surface-variant: #c9d1d9;
  
  /* Modern Outlines */
  --outline: #30363d;
  --outline-variant: #21262d;
  
  /* Enhanced Surface Containers */
  --surface-container-lowest: #0d1117;
  --surface-container-low: #161b22;
  --surface-container: #1c2128;
  --surface-container-high: #262c36;
  --surface-container-highest: #2d333b;
}

.dark {
  --primary: #4ba8f4;
  --on-primary: #001a33;
  --primary-container: #1e3a5f;
  --on-primary-container: #b3ddff;
  
  --secondary: #4ade80;
  --on-secondary: #001a05;
  --secondary-container: #1b4d2e;
  --on-secondary-container: #a6f3c9;
  
  --tertiary: #d8b4fe;
  --on-tertiary: #3d0066;
  --tertiary-container: #5a189a;
  --on-tertiary-container: #f0e5ff;
  
  --error: #ff6b6b;
  --on-error: #000000;
  --error-container: #8b0000;
  --on-error-container: #ffcccc;
  
  --background: #0d1117;
  --on-background: #e5e7eb;
  
  --surface: #0d1117;
  --on-surface: #f0f4ff;
  --surface-variant: #21262d;
  --on-surface-variant: #c9d1d9;
  
  --outline: #30363d;
  --outline-variant: #21262d;
  
  --surface-container-lowest: #0d1117;
  --surface-container-low: #161b22;
  --surface-container: #1c2128;
  --surface-container-high: #262c36;
  --surface-container-highest: #2d333b;
}
```

---

## 2. Enhanced Global Styling

### Add these utilities after the CSS variables:

```css
/* ============================================
   GLOBAL DARK MODE ENHANCEMENTS
   ============================================ */

/* Glass Morphism Utility */
.glass {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.dark .glass {
  background: rgba(13, 17, 23, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.05),
              0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Glass Border Effect */
.glass-border {
  background: linear-gradient(135deg, #1c2128, #161b22) padding-box,
              linear-gradient(135deg, #4ba8f4, #2dd4a4) border-box;
  border: 1px solid transparent;
}

.dark .glass-border {
  background: linear-gradient(135deg, rgba(28, 33, 40, 0.6), rgba(22, 27, 34, 0.6)) padding-box,
              linear-gradient(135deg, rgba(75, 168, 244, 0.3), rgba(45, 212, 164, 0.3)) border-box;
  border: 1px solid transparent;
  backdrop-filter: blur(12px);
}

/* Glow Effect */
.glow {
  text-shadow: 0 0 10px rgba(75, 168, 244, 0.4);
}

.dark .glow {
  color: #7bc3ff;
  text-shadow: 0 0 8px rgba(123, 195, 255, 0.5),
               0 0 16px rgba(75, 168, 244, 0.2);
}

/* Shadow Enhancements */
.shadow-dark {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .shadow-dark {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Smooth Transitions */
.smooth-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.smooth-transition-fast {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============================================
   COMPONENTS STYLING
   ============================================ */

/* Cards */
.dark .card,
.dark [class*="card"],
.dark [class*="container"] {
  background: linear-gradient(135deg, #161b22 0%, #0f1419 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Buttons */
.dark button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark button:not([class*="primary"]):not([class*="error"]) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark button:hover {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 16px rgba(75, 168, 244, 0.15);
  border-color: rgba(75, 168, 244, 0.3);
}

.dark button:active {
  transform: scale(0.98);
}

/* Primary Button */
.dark .bg-primary {
  background: linear-gradient(135deg, #4ba8f4 0%, #1e88e5 100%);
  box-shadow: 0 4px 16px rgba(75, 168, 244, 0.3);
}

.dark .bg-primary:hover {
  box-shadow: 0 8px 24px rgba(75, 168, 244, 0.4);
  transform: translateY(-2px);
}

/* Text Colors */
.dark .text-on-surface {
  color: #f0f4ff;
}

.dark .text-on-surface-variant {
  color: #c9d1d9;
}

/* Input Fields */
.dark input,
.dark textarea,
.dark select {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark input::placeholder,
.dark textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.dark input:focus,
.dark textarea:focus,
.dark select:focus {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(75, 168, 244, 0.5);
  box-shadow: 0 0 24px rgba(75, 168, 244, 0.15),
              inset 0 1px 2px rgba(75, 168, 244, 0.1);
  outline: none;
}

/* ============================================
   SCROLLBAR STYLING
   ============================================ */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(75, 168, 244, 0.3);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 168, 244, 0.5);
  background-clip: padding-box;
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 168, 244, 0.2);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 168, 244, 0.35);
}

/* Firefox Scrollbar */
* {
  scrollbar-color: rgba(75, 168, 244, 0.3) transparent;
  scrollbar-width: thin;
}

.dark * {
  scrollbar-color: rgba(75, 168, 244, 0.2) transparent;
}

/* ============================================
   ANIMATIONS
   ============================================ */

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 24px rgba(75, 168, 244, 0.2);
  }
  50% {
    box-shadow: 0 0 32px rgba(75, 168, 244, 0.4);
  }
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.float {
  animation: float 3s ease-in-out infinite;
}

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.gradient-shift {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease-in-out infinite;
}

/* ============================================
   DIALOG & MODALS
   ============================================ */

.dark dialog {
  background: linear-gradient(135deg, #161b22 0%, #0f1419 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dark dialog::backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

/* ============================================
   FOCUS STATES & ACCESSIBILITY
   ============================================ */

.dark input:focus-visible,
.dark button:focus-visible,
.dark textarea:focus-visible,
.dark select:focus-visible {
  outline: 2px solid rgba(75, 168, 244, 0.5);
  outline-offset: 2px;
}

/* ============================================
   UTILITIES FOR SPECIFIC COMPONENTS
   ============================================ */

/* Hero Card */
.dark .hero-card {
  background: linear-gradient(135deg, 
    rgba(75, 168, 244, 0.1) 0%, 
    rgba(45, 212, 164, 0.05) 100%);
  border: 1px solid rgba(75, 168, 244, 0.2);
  box-shadow: 0 8px 32px rgba(75, 168, 244, 0.1),
              inset 0 1px 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
}

/* Badge */
.dark .badge {
  background: rgba(75, 168, 244, 0.1);
  border: 1px solid rgba(75, 168, 244, 0.2);
  color: #7bc3ff;
}

/* Progress Bar */
.dark .progress-bar {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .progress-bar-fill {
  background: linear-gradient(90deg, #4ba8f4 0%, #7bc3ff 100%);
  box-shadow: 0 0 16px rgba(75, 168, 244, 0.3);
}

/* List Items */
.dark .list-item {
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .list-item:hover {
  background: rgba(75, 168, 244, 0.05);
  border-color: rgba(75, 168, 244, 0.2);
}
```

---

## 3. Tailwind Config Updates (tailwind.config.js)

Add these to the `theme.extend` section:

```javascript
extend: {
  // ... existing extends ...
  
  backgroundImage: {
    'gradient-dark': 'linear-gradient(135deg, #161b22 0%, #0f1419 100%)',
    'glass-dark': 'rgba(13, 17, 23, 0.5)',
  },
  
  boxShadow: {
    'glass-dark': 'inset 0 1px 2px rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.3)',
    'glow-primary': '0 0 24px rgba(75, 168, 244, 0.3)',
    'glow-secondary': '0 0 24px rgba(45, 212, 164, 0.3)',
  },
  
  backdropFilter: {
    'blur-xl': 'blur(16px)',
    'blur-2xl': 'blur(20px)',
  },
  
  animation: {
    'float': 'float 3s ease-in-out infinite',
    'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
    'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
  },
}
```

---

## 4. Component-Specific CSS Classes

### For Home Page (Balance Hero Card):

```css
.dark .balance-hero {
  background: linear-gradient(135deg, 
    rgba(75, 168, 244, 0.12) 0%, 
    rgba(45, 212, 164, 0.08) 100%);
  border: 1px solid rgba(75, 168, 244, 0.25);
  box-shadow: 0 8px 32px rgba(75, 168, 244, 0.15),
              0 0 60px rgba(75, 168, 244, 0.1),
              inset 0 1px 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
}
```

### For Settings Page (Profile Card):

```css
.dark .profile-card {
  background: linear-gradient(135deg, #1c2128 0%, #161b22 100%);
  border: 1px solid rgba(75, 168, 244, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.dark .profile-avatar {
  border: 2px solid rgba(75, 168, 244, 0.3);
  box-shadow: 0 0 24px rgba(75, 168, 244, 0.2),
              inset 0 0 12px rgba(75, 168, 244, 0.1);
}
```

### For Wallet Page (Account Cards):

```css
.dark .account-card {
  background: linear-gradient(135deg, #1c2128 0%, #161b22 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .account-card-primary {
  background: linear-gradient(135deg, 
    rgba(75, 168, 244, 0.15) 0%, 
    rgba(75, 168, 244, 0.05) 100%);
  border: 1px solid rgba(75, 168, 244, 0.2);
  box-shadow: 0 8px 32px rgba(75, 168, 244, 0.2);
}
```

---

## 5. Implementation Steps

1. **Backup current `index.css`:**
   ```bash
   cp src/index.css src/index.css.backup
   ```

2. **Update the color palette section** with the new colors above

3. **Add the global enhancements** to the styles

4. **Update tailwind.config.js** with new utilities

5. **Test in browser:**
   - Check dark mode toggle
   - Verify all pages render correctly
   - Test on mobile and desktop

6. **Run build:**
   ```bash
   npm run build
   ```

---

## 6. Browser Compatibility

These CSS features support:
- ✅ Chrome 88+
- ✅ Firefox 90+
- ✅ Safari 15+
- ✅ Edge 88+

For older browsers, features degrade gracefully (glass effect may be less pronounced).

---

## 7. Performance Notes

- Backdrop blur on multiple elements may impact performance
- Consider using `will-change` for animated elements
- Test on lower-end devices before deployment

```css
.animated-element {
  will-change: transform;
}
```

---

**Version:** 1.0  
**Last Updated:** 2026-04-13  
**Status:** Ready for Implementation
