# 🎯 Page-by-Page Dark Mode Enhancement Guide

## Quick Reference: UI Improvements by Page

---

## 1️⃣ Home Page (`src/pages/Home.tsx`)

### Current Issues:
- ❌ Primary color too bright in hero card
- ❌ Box shadows not visible
- ❌ Shortcut cards lack depth
- ❌ FAB button needs better styling

### Proposed Changes:

#### **A. Hero Balance Card Enhancement**
```tsx
// Current className structure
className="bg-primary p-10 rounded-[3rem] text-on-primary shadow-2xl shadow-primary/30"

// Should be updated to use new glass style
className="bg-gradient-to-br from-primary/20 to-secondary/10 p-10 rounded-[3rem] text-on-surface 
  shadow-dark border border-primary/20 dark:shadow-glass-dark backdrop-blur-xl 
  bg-hero-card relative overflow-hidden group"

// Add gradient border effect
style={{
  background: 'linear-gradient(135deg, rgba(75, 168, 244, 0.1) 0%, rgba(45, 212, 164, 0.05) 100%)',
  boxShadow: '0 8px 32px rgba(75, 168, 244, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
}}
```

#### **B. Shortcut Cards Improvement**
```tsx
// Current
className="bg-surface-container-lowest p-5 rounded-[2rem] border border-outline-variant/10"

// Enhanced
className="glass p-5 rounded-[2rem] hover:shadow-glow-primary transition-all 
  group duration-300 transform hover:scale-105 hover:-translate-y-1"
```

#### **C. FAB Button Styling**
```tsx
// Current
className="w-16 h-16 bg-primary text-on-primary rounded-[1.5rem] shadow-2xl border-4 border-surface-container"

// Enhanced with glow
className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 text-white rounded-[1.5rem] 
  shadow-2xl border-2 border-primary/30 animate-pulse-glow hover:scale-110 transition-transform"
```

---

## 2️⃣ Settings Page (`src/pages/Settings.tsx`)

### Current Issues:
- ❌ Profile card blends with background
- ❌ Color indicator badges are too subtle
- ❌ Setting item borders are barely visible
- ❌ No visual feedback on interaction

### Proposed Changes:

#### **A. Profile Card Redesign**
```tsx
// Current
className="bg-surface-container-lowest p-8 rounded-[3rem] border border-outline-variant/10"

// Enhanced
className="profile-card p-8 rounded-[3rem] border border-primary/20 relative overflow-hidden"

// Add:
<div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
<div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
```

#### **B. Avatar Enhancement**
```tsx
// Current
className="w-28 h-28 rounded-[2.5rem] bg-surface-container-high"

// Enhanced
className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-secondary/10 
  border-2 border-primary/40 shadow-glow-primary overflow-hidden relative"

// Add inner glow
<div className="absolute inset-0 rounded-[2.5rem] blur-md bg-gradient-to-br from-primary/20 to-transparent" />
```

#### **C. Settings Groups Styling**
```tsx
// Current
className="bg-surface-container-lowest rounded-[3rem] overflow-hidden border border-outline-variant/10"

// Enhanced
className="glass rounded-[3rem] overflow-hidden hover:border-primary/30 transition-all 
  shadow-glass-dark"

// Button items inside
className="w-full flex items-center justify-between p-6 hover:bg-primary/5 
  transition-all group border-b border-outline-variant/10 last:border-0"
```

#### **D. Icon Badge Colors**
```tsx
// Add color-coded badges for each setting item
const colorMap = {
  'Categories': 'bg-primary/15 text-primary border border-primary/20',
  'Goals': 'bg-secondary/15 text-secondary border border-secondary/20',
  'Dark Mode': 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  'AI Assistant': 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
}
```

---

## 3️⃣ Transactions/Ledger Page (`src/features/transactions/pages/Transactions.tsx`)

### Current Issues:
- ❌ Transaction items have no clear separation
- ❌ Date headers too subtle
- ❌ Category icons hard to see in dark
- ❌ No active/hover states

### Proposed Changes:

#### **A. Date Header Styling**
```tsx
// New component for date dividers
<div className="sticky top-0 z-20 py-4 mb-4 text-center">
  <span className="px-4 py-2 text-xs font-black tracking-widest uppercase text-on-surface-variant 
    bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full 
    border border-primary/10 backdrop-blur-sm">
    {dateStr}
  </span>
</div>
```

#### **B. Transaction Item Card**
```tsx
// Current - flat list
// Enhanced - card with hover effect
className="group glass rounded-2xl p-4 mb-3 border border-outline-variant/5 
  hover:border-primary/30 hover:shadow-glow-primary transition-all 
  transform hover:scale-101 hover:-translate-y-0.5 cursor-pointer"
```

#### **C. Category Icon Enhancement**
```tsx
// Add glowing badge for category
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 
  flex items-center justify-center border border-primary/20 shadow-glow-primary">
  <span className="material-symbols-outlined text-primary">{icon}</span>
</div>
```

---

## 4️⃣ Wallet/Accounts Page (`src/features/accounts/pages/Wallet.tsx`)

### Current Issues:
- ❌ Primary color too bright on bank cards
- ❌ Credit card progress bar hard to see
- ❌ Insufficient visual distinction
- ❌ Delete button blend with background

### Proposed Changes:

#### **A. Bank Card (Primary) Recoloring**
```tsx
// Current - uses primary directly
className="bg-primary text-on-primary"

// Enhanced - more sophisticated gradient
className="bg-gradient-to-br from-primary/80 to-blue-600 text-white 
  shadow-2xl shadow-primary/40 border border-primary/30"
```

#### **B. Credit Card Enhancement**
```tsx
// Current
className="bg-surface-container-high text-on-surface border border-outline-variant/10"

// Enhanced
className="glass bg-gradient-to-br from-error/15 to-error/5 text-on-surface 
  border-2 border-error/20 hover:border-error/40 transition-all"
```

#### **C. Progress Bar Styling**
```tsx
// Current
<div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
  <div className="h-full bg-error" style={{ width: `${percentage}%` }} />
</div>

// Enhanced with glow
<div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden border border-error/10">
  <div className="h-full bg-gradient-to-r from-error to-red-400 rounded-full shadow-glow-error" 
    style={{ width: `${percentage}%` }} />
</div>
```

#### **D. Delete Button Visibility**
```tsx
// Current - too subtle
className="p-2 -mr-2 bg-transparent opacity-40 hover:text-error"

// Enhanced - more visible
className="p-2 -mr-2 rounded-full bg-error/10 text-error/50 hover:bg-error/20 
  hover:text-error transition-all active:scale-95"
```

---

## 5️⃣ Stats/Analytics Page (`src/pages/Stats.tsx`)

### Current Issues:
- ❌ Chart bars lack contrast
- ❌ Category cards blend together
- ❌ Progress indicators unclear
- ❌ No color differentiation

### Proposed Changes:

#### **A. Chart Bar Enhancement**
```tsx
// Current
<div className="w-full bg-primary/10 rounded-t-xl">
  <div className="w-full bg-primary rounded-t-xl" style={{ height: `${height}%` }} />
</div>

// Enhanced with gradient and glow
<div className="w-full bg-primary/5 rounded-t-xl border border-primary/10 overflow-hidden">
  <div className="w-full rounded-t-xl shadow-glow-primary transition-all duration-300 
    bg-gradient-to-t from-primary to-blue-400" 
    style={{ height: `${height}%` }} />
</div>
```

#### **B. Category Cards**
```tsx
// Current
className="bg-surface-container-lowest p-4 rounded-2xl"

// Enhanced
className="glass rounded-2xl p-4 border-l-4 hover:shadow-glow-primary 
  transition-all transform hover:scale-105 hover:-translate-y-1 
  group cursor-pointer"

// Add color-coded left border
style={{
  borderLeftColor: categoryColor,
  borderLeftWidth: '4px'
}}
```

---

## 6️⃣ Categories Page (`src/features/categories/pages/Categories.tsx`)

### Current Issues:
- ❌ Category icons not prominent
- ❌ Cards lack visual hierarchy
- ❌ No interactive feedback
- ❌ Colors too subtle

### Proposed Changes:

#### **A. Category Card Full Redesign**
```tsx
// Old card structure:
// New enhanced structure
<div className="group glass rounded-[2rem] p-6 border-2 border-primary/10 
  hover:border-primary/40 hover:shadow-glow-primary transition-all 
  transform hover:scale-105 hover:-translate-y-2 cursor-pointer 
  dark:bg-gradient-to-br dark:from-surface-container-high dark:to-surface-container">
  
  {/* Icon with glow */}
  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br 
    mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20 
    group-hover:shadow-primary/40 transition-all group-hover:scale-110" 
    style={{ background: `linear-gradient(135deg, ${colorLight}, ${colorDark})` }}>
    <span className="material-symbols-outlined text-2xl text-white">
      {icon}
    </span>
  </div>
  
  {/* Category name */}
  <h3 className="font-headline font-bold text-lg text-on-surface mb-2 
    group-hover:translate-x-1 transition-transform">
    {name}
  </h3>
  
  {/* Category type badge */}
  <span className="text-xs font-black px-3 py-1 rounded-full 
    bg-primary/10 text-primary border border-primary/20">
    {type}
  </span>
</div>
```

---

## 7️⃣ Budget Planner Page (`src/features/budget/pages/BudgetPlanner.tsx`)

### Proposed Enhancements:

#### **A. Budget Card Styling**
```tsx
// Add glass morphism with gradient
className="glass rounded-[2.5rem] p-6 border border-primary/20 
  bg-gradient-to-br from-primary/10 to-transparent 
  hover:shadow-glow-primary transition-all"
```

#### **B. Progress Ring Visualization**
```tsx
// Replace simple progress bar for better visualization
<svg className="w-24 h-24">
  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
  <circle cx="48" cy="48" r="40" fill="none" stroke="url(#gradientPrimary)" 
    strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset}
    className="transition-all duration-500" style={{filter: 'drop-shadow(0 0 8px rgba(75, 168, 244, 0.4))'}} />
</svg>
```

---

## 8️⃣ Global Component Updates

### **Modal/Dialog Overlay**
```tsx
// Enhanced dialog styling
<dialog className="dark:bg-gradient-to-br dark:from-surface-container dark:to-surface-container-low 
  dark:border dark:border-primary/20 dark:shadow-2xl dark:shadow-black/50 
  rounded-3xl p-6 backdrop:dark:bg-black/60 backdrop:dark:backdrop-blur-md">
  
  {/* Content */}
</dialog>
```

### **Loading State**
```tsx
// Loading spinner with glow
<div className="flex items-center justify-center">
  <div className="w-12 h-12 rounded-full border-4 border-surface-container-high 
    border-t-primary animate-spin shadow-glow-primary" />
</div>
```

### **Empty State**
```tsx
// Enhanced empty state card
<div className="glass rounded-[2.5rem] p-12 text-center 
  border-2 border-dashed border-primary/10 hover:border-primary/30 
  transition-all group cursor-pointer">
  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center 
    justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
    <Inbox className="w-10 h-10 text-primary/50" />
  </div>
  <p className="text-on-surface-variant font-black text-sm uppercase tracking-widest">
    Không có dữ liệu
  </p>
</div>
```

---

## Implementation Checklist

- [ ] Update Home page hero card styling
- [ ] Enhance Settings page profile card and items
- [ ] Improve Transactions list styling
- [ ] Update Wallet card designs
- [ ] Enhance Stats page charts
- [ ] Redesign Categories page cards
- [ ] Improve Budget Planner page
- [ ] Update all modals/dialogs
- [ ] Test on mobile devices
- [ ] Test on various dark modes
- [ ] Test performance
- [ ] Run npm build

---

**Tips for Implementation:**
1. Start with color palette updates (CSS variables)
2. Move to global utilities (glass, glow, shadows)
3. Update each page component by component
4. Test after each change
5. Use Tailwind's `dark:` prefix for dark-specific styles
6. Consider performance impact of animations

**Performance Optimization:**
- Use `will-change` sparingly
- Prefer `transform` over other CSS properties for animations
- Limit blur effects on multiple elements
- Test on lower-end devices

---

**Estimated Implementation Time:**
- Color changes: 30 minutes
- Global CSS updates: 1 hour
- Page-by-page updates: 4-6 hours
- Testing & refinement: 2-3 hours
- **Total: 7-10 hours**

