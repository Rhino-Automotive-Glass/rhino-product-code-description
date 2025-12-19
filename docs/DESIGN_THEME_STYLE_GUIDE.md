# 🎨 Rhino Automotive Glass - Design Theme & Style Guide

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Framework:** Next.js 15 + Tailwind CSS 4.x

---

## 📋 Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Backgrounds & Gradients](#backgrounds--gradients)
5. [Component Styles](#component-styles)
6. [Spacing & Layout](#spacing--layout)
7. [Shadows & Elevation](#shadows--elevation)
8. [Animation & Transitions](#animation--transitions)
9. [Responsive Design](#responsive-design)
10. [Accessibility](#accessibility)
11. [Design Principles](#design-principles)
12. [Implementation Guide](#implementation-guide)

---

## 🎯 Brand Identity

### Overview
- **Company:** Professional automotive glass service
- **Experience:** 15+ years in the industry
- **Market:** Mexican automotive customers (Ciudad de México)
- **Primary Language:** Spanish (Mexico)
- **Brand Tone:** Professional, trustworthy, modern, clean

### Core Values
- **Professionalism:** Established expertise and reliability
- **Quality:** Premium service and materials
- **Trust:** Long-standing reputation
- **Modern:** Contemporary approach to traditional service

### Visual Personality
- **Clean:** Minimalist design with generous white space
- **Professional:** Blue color scheme for trust and reliability
- **Accessible:** Easy to read and navigate
- **Warm:** Orange accents for approachability

---

## 🎨 Color Palette

### Primary Colors (Professional Blue)

**Main Brand Blue**
```css
blue-500: #3b82f6  /* Main brand color */
blue-600: #2563eb  /* Primary buttons, links */
blue-700: #1d4ed8  /* Hover states */
blue-800: #1e40af  /* Dark accents */
```

**Light Blues (Backgrounds)**
```css
blue-50:  #eff6ff  /* Lightest background tints */
blue-100: #dbeafe  /* Light background sections */
blue-200: #bfdbfe  /* Subtle highlights */
```

**Dark Blues (Text & Emphasis)**
```css
blue-900: #1e3a8a  /* Deep blue text */
blue-950: #172554  /* Darkest blue accents */
```

### Secondary Colors (Clean Grays)

**Slate Palette**
```css
slate-50:  #f8fafc  /* Page backgrounds */
slate-100: #f1f5f9  /* Card backgrounds, secondary fills */
slate-200: #e2e8f0  /* Borders, dividers */
slate-300: #cbd5e1  /* Disabled states */
slate-400: #94a3b8  /* Placeholder text */
slate-500: #64748b  /* Secondary text, icons */
slate-600: #475569  /* Body text alternative */
slate-700: #334155  /* Emphasized text */
slate-800: #1e293b  /* Headings alternative */
slate-900: #0f172a  /* Primary text, headings */
slate-950: #020617  /* Maximum contrast text */
```

### Accent Colors (Call-to-Action Orange)

**Orange Palette**
```css
orange-50:  #fff7ed  /* Light backgrounds */
orange-100: #ffedd5  /* Subtle highlights */
orange-500: #f97316  /* Primary CTA buttons */
orange-600: #ea580c  /* CTA hover states */
orange-700: #c2410c  /* CTA active/pressed */
orange-800: #9a3412  /* Dark CTA text */
```

### Supporting Colors

**Success (Positive Actions)**
```css
green-50:  #f0fdf4  /* Success backgrounds */
green-500: #22c55e  /* Success states */
green-600: #16a34a  /* Success hover */
```

**Warning (Caution)**
```css
amber-50:  #fffbeb  /* Warning backgrounds */
amber-500: #f59e0b  /* Warning states */
amber-600: #d97706  /* Warning hover */
```

**Error (Danger)**
```css
red-50:  #fef2f2  /* Error backgrounds */
red-500: #ef4444  /* Error states */
red-600: #dc2626  /* Error hover */
```

### Usage Guidelines

**Primary Blue (`blue-600`):**
- Primary action buttons
- Main navigation links
- Brand elements
- Interactive elements

**Accent Orange (`orange-500`):**
- Call-to-action buttons (Contact, Call Now, Get Quote)
- Important notifications
- Conversion-focused elements

**Slate Grays:**
- Body text: `slate-900` or `slate-800`
- Secondary text: `slate-500` or `slate-600`
- Borders: `slate-200` or `slate-300`
- Backgrounds: `slate-50` or `slate-100`

---

## 📝 Typography

### Font Family

**Primary Font: Inter**
```css
font-family: 'Inter', sans-serif;
```

**Characteristics:**
- Clean, modern sans-serif
- Excellent screen readability
- Professional appearance
- Wide range of weights
- Open-source (Google Fonts)

**Implementation:**
```tsx
// In Next.js
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

### Type Scale

**Display Text (Hero Headlines)**
```css
text-5xl   /* 48px - Hero headlines */
text-4xl   /* 36px - Major section titles */
text-3xl   /* 30px - Page titles */
```

**Headings**
```css
text-2xl   /* 24px - H1, Section headings */
text-xl    /* 20px - H2, Card titles */
text-lg    /* 18px - H3, Emphasized text */
```

**Body Text**
```css
text-base  /* 16px - Primary body text */
text-sm    /* 14px - Secondary text, captions */
text-xs    /* 12px - Labels, metadata */
```

### Font Weights

```css
font-light      /* 300 - Subtle text */
font-normal     /* 400 - Body text */
font-medium     /* 500 - Emphasis, buttons */
font-semibold   /* 600 - Headings, labels */
font-bold       /* 700 - Strong emphasis */
font-extrabold  /* 800 - Hero text */
```

### Line Heights

```css
leading-tight    /* 1.25 - Headlines */
leading-snug     /* 1.375 - Subheadings */
leading-normal   /* 1.5 - Body text (default) */
leading-relaxed  /* 1.625 - Long-form content */
```

### Letter Spacing

```css
tracking-tight   /* -0.025em - Large headlines */
tracking-normal  /* 0 - Body text (default) */
tracking-wide    /* 0.025em - Buttons, labels */
```

### Typography Examples

**Hero Headline**
```tsx
<h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
  Especialistas en Cristales Automotrices
</h1>
```

**Section Title**
```tsx
<h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
  Nuestros Servicios
</h2>
```

**Body Text**
```tsx
<p className="text-base text-slate-600 leading-relaxed">
  Con más de 15 años de experiencia...
</p>
```

**Button Text**
```tsx
<button className="text-base font-medium tracking-wide">
  Contactar Ahora
</button>
```

---

## 🌈 Backgrounds & Gradients

### Solid Backgrounds

**Light Backgrounds (Main Pages)**
```css
bg-white           /* Pure white cards, modals */
bg-slate-50        /* Page background */
bg-slate-100       /* Secondary sections */
bg-blue-50         /* Highlighted sections */
```

**Dark Backgrounds (Headers, Footers)**
```css
bg-slate-900       /* Dark headers, footers */
bg-slate-800       /* Dark cards */
bg-blue-900        /* Dark branded sections */
```

### Gradient Backgrounds

**Hero Gradient (Primary)**
```css
/* Professional blue gradient */
bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800
```

**Light Page Gradient**
```css
/* Subtle background for main pages */
bg-gradient-to-br from-blue-50 to-gray-100

/* Alternative soft gradient */
bg-gradient-to-br from-blue-50 via-white to-gray-50
```

**Card Gradient (Subtle)**
```css
/* For emphasized cards */
bg-gradient-to-br from-white to-slate-50
```

**Accent Gradient (CTAs)**
```css
/* For call-to-action buttons */
bg-gradient-to-r from-orange-500 to-orange-600
```

### Text Gradients

**Brand Text Gradient**
```css
/* For headlines and emphasis */
bg-gradient-to-r from-blue-600 to-blue-800 
bg-clip-text text-transparent
```

**Usage Example:**
```tsx
<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
  Rhino Automotive Glass
</h1>
```

### Glass Morphism (Modern Effect)

```css
/* Semi-transparent background with blur */
className="bg-white/10 backdrop-blur-md border border-white/20"
```

**Usage Example:**
```tsx
<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
  {/* Glass card content */}
</div>
```

---

## 🧩 Component Styles

### Buttons

#### Button Variants

**Primary Button** (Main actions)
```tsx
<button className="btn btn-primary btn-md">
  Contactar
</button>

/* Expanded classes: */
className="inline-flex items-center justify-center rounded-lg font-medium 
           bg-blue-600 text-white hover:bg-blue-700 
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
           shadow-sm transition-all duration-200 
           disabled:opacity-50 disabled:pointer-events-none
           px-4 py-2.5 text-base"
```

**Accent Button** (CTAs - Call-to-action)
```tsx
<button className="btn btn-accent btn-md">
  Llamar Ahora
</button>

/* Expanded classes: */
className="inline-flex items-center justify-center rounded-lg font-medium 
           bg-orange-500 text-white hover:bg-orange-600 
           focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 
           shadow-sm transition-all duration-200 
           px-4 py-2.5 text-base"
```

**Secondary Button**
```tsx
<button className="btn btn-secondary btn-md">
  Ver Más
</button>

/* Expanded classes: */
className="inline-flex items-center justify-center rounded-lg font-medium 
           bg-slate-100 text-slate-900 hover:bg-slate-200 
           border border-slate-300
           focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 
           transition-all duration-200 
           px-4 py-2.5 text-base"
```

**Ghost Button** (Minimal)
```tsx
<button className="btn btn-ghost btn-md">
  Cancelar
</button>

/* Expanded classes: */
className="inline-flex items-center justify-center rounded-lg font-medium 
           bg-transparent text-slate-700 hover:bg-slate-100 
           focus:outline-none focus:ring-2 focus:ring-slate-500 
           transition-all duration-200 
           px-4 py-2.5 text-base"
```

#### Button Sizes

```css
btn-sm   /* Small: px-3 py-2 text-sm */
btn-md   /* Medium: px-4 py-2.5 text-base (default) */
btn-lg   /* Large: px-6 py-3 text-lg */
btn-xl   /* Extra Large: px-8 py-4 text-xl */
```

**Size Examples:**
```tsx
<button className="btn btn-primary btn-sm">Pequeño</button>
<button className="btn btn-primary btn-md">Mediano</button>
<button className="btn btn-primary btn-lg">Grande</button>
<button className="btn btn-primary btn-xl">Extra Grande</button>
```

#### Icon Buttons

```tsx
<button className="btn btn-primary btn-md">
  <Phone className="w-5 h-5" />
  <span>Llamar Ahora</span>
</button>

/* With icon only */
<button className="btn btn-ghost p-2.5 rounded-full">
  <Phone className="w-5 h-5" />
</button>
```

### Cards

#### Standard Card

```tsx
<div className="card">
  {/* Card content */}
</div>

/* Expanded classes: */
className="bg-white rounded-xl border border-slate-200 shadow-soft"
```

#### Interactive Card (with hover)

```tsx
<div className="card card-hover">
  {/* Card content */}
</div>

/* Expanded classes: */
className="bg-white rounded-xl border border-slate-200 shadow-soft 
           transition-all duration-300 
           hover:shadow-lg hover:-translate-y-1"
```

#### Card Variants

**Emphasized Card** (with gradient)
```tsx
<div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg p-8">
  {/* Content */}
</div>
```

**Glass Card** (modern)
```tsx
<div className="glass rounded-xl p-6 shadow-glass">
  {/* Content */}
</div>
```

**Featured Card** (with colored accent)
```tsx
<div className="bg-white rounded-xl border-l-4 border-blue-600 shadow-md p-6">
  {/* Content */}
</div>
```

### Forms & Inputs

#### Text Input

```tsx
<input 
  type="text"
  className="w-full px-4 py-2.5 text-base
             bg-white border border-slate-300 rounded-lg
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
             placeholder:text-slate-400
             disabled:bg-slate-50 disabled:text-slate-500"
  placeholder="Ingresa tu nombre"
/>
```

#### Text Area

```tsx
<textarea 
  className="w-full px-4 py-2.5 text-base
             bg-white border border-slate-300 rounded-lg
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
             placeholder:text-slate-400
             resize-none"
  rows={4}
  placeholder="Escribe tu mensaje"
/>
```

#### Select Dropdown

```tsx
<select 
  className="w-full px-4 py-2.5 text-base
             bg-white border border-slate-300 rounded-lg
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
             cursor-pointer"
>
  <option>Selecciona una opción</option>
</select>
```

#### Label

```tsx
<label className="block text-sm font-medium text-slate-700 mb-2">
  Nombre Completo
</label>
```

### Badges & Tags

```tsx
/* Success badge */
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                 text-xs font-medium bg-green-100 text-green-800">
  Disponible
</span>

/* Info badge */
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                 text-xs font-medium bg-blue-100 text-blue-800">
  Nuevo
</span>

/* Warning badge */
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                 text-xs font-medium bg-amber-100 text-amber-800">
  Limitado
</span>
```

### Dividers

```tsx
/* Horizontal divider */
<div className="border-t border-slate-200 my-8" />

/* With text */
<div className="relative my-8">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-slate-200" />
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-2 bg-white text-slate-500">O</span>
  </div>
</div>
```

---

## 📐 Spacing & Layout

### Container Widths

```css
max-w-sm    /* 384px - Small modals, cards */
max-w-md    /* 448px - Forms, narrow content */
max-w-lg    /* 512px - Standard modals */
max-w-xl    /* 576px - Wide modals */
max-w-2xl   /* 672px - Article content */
max-w-4xl   /* 896px - Standard page content */
max-w-6xl   /* 1152px - Wide page content */
max-w-7xl   /* 1280px - Maximum page width */
```

**Centered Container:**
```tsx
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Padding & Margin

**Standard Spacing Scale:**
```css
p-0     /* 0px */
p-1     /* 4px */
p-2     /* 8px */
p-3     /* 12px */
p-4     /* 16px */
p-5     /* 20px */
p-6     /* 24px */
p-8     /* 32px */
p-10    /* 40px */
p-12    /* 48px */
p-16    /* 64px */
p-20    /* 80px */
p-24    /* 96px */
```

**Container Padding (Responsive):**
```css
/* Mobile-first responsive padding */
className="px-4 sm:px-6 lg:px-8"
/* 16px mobile, 24px tablet, 32px desktop */
```

**Section Spacing:**
```css
/* Standard section padding */
className="section-padding"
/* Expands to: py-16 lg:py-24 */
/* 64px mobile, 96px desktop */
```

### Grid Layouts

**Two Column Grid:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Grid items */}
</div>
```

**Three Column Grid:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

**Four Column Grid:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Grid items */}
</div>
```

**Auto-fit Grid (Responsive):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Grid items */}
</div>
```

### Flexbox Layouts

**Centered Content:**
```tsx
<div className="flex items-center justify-center min-h-screen">
  {/* Vertically and horizontally centered */}
</div>
```

**Space Between:**
```tsx
<div className="flex items-center justify-between">
  {/* Items pushed to edges */}
</div>
```

**Responsive Flex Direction:**
```tsx
<div className="flex flex-col lg:flex-row gap-6">
  {/* Vertical on mobile, horizontal on desktop */}
</div>
```

### Gap Spacing

```css
gap-2   /* 8px */
gap-4   /* 16px */
gap-6   /* 24px */
gap-8   /* 32px */
gap-12  /* 48px */
```

---

## 🌟 Shadows & Elevation

### Shadow Scale

**Soft Shadow** (Default for cards)
```css
shadow-soft
/* Custom: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 
           0 10px 20px -2px rgba(0, 0, 0, 0.04) */
```

**Standard Shadows** (Tailwind defaults)
```css
shadow-sm   /* Subtle shadow */
shadow      /* Default shadow */
shadow-md   /* Medium shadow */
shadow-lg   /* Large shadow */
shadow-xl   /* Extra large shadow */
shadow-2xl  /* Maximum shadow */
```

**Glass Shadow** (For glass morphism)
```css
shadow-glass
/* Custom: 0 8px 32px 0 rgba(31, 38, 135, 0.37) */
```

**No Shadow:**
```css
shadow-none
```

### Shadow Usage

**Cards:**
```tsx
/* Resting state */
<div className="shadow-soft">

/* Hover state */
<div className="shadow-soft hover:shadow-lg transition-shadow">

/* Interactive elevation */
<div className="shadow-md hover:shadow-xl transition-all">
```

**Buttons:**
```tsx
/* Primary buttons */
className="shadow-sm hover:shadow-md"

/* Elevated buttons */
className="shadow-md hover:shadow-lg active:shadow-sm"
```

**Modals & Overlays:**
```tsx
/* Modal backdrop */
<div className="shadow-2xl">

/* Dropdown menus */
<div className="shadow-xl">
```

### Drop Shadow (For Images/Icons)

```css
drop-shadow-sm
drop-shadow
drop-shadow-md
drop-shadow-lg
drop-shadow-xl
```

---

## 🎬 Animation & Transitions

### Transition Properties

**All Properties:**
```css
transition-all duration-200  /* Quick interactions */
transition-all duration-300  /* Standard hover effects */
transition-all duration-500  /* Smooth, noticeable changes */
```

**Specific Properties:**
```css
transition-colors duration-200    /* Color changes only */
transition-transform duration-300 /* Transform changes only */
transition-opacity duration-200   /* Opacity changes only */
transition-shadow duration-300    /* Shadow changes only */
```

### Hover Effects

**Button Hover:**
```tsx
<button className="bg-blue-600 hover:bg-blue-700 
                   transform hover:scale-105 
                   transition-all duration-200">
  Hover Me
</button>
```

**Card Hover:**
```tsx
<div className="hover:shadow-lg hover:-translate-y-1 
                transition-all duration-300">
  {/* Card content */}
</div>
```

**Link Hover:**
```tsx
<a className="text-blue-600 hover:text-blue-800 
              hover:underline transition-colors duration-200">
  Learn More
</a>
```

### Custom Animations

**Fade In:**
```css
.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Slide Up:**
```css
.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Usage:**
```tsx
<div className="animate-fade-in">
  {/* Fades in on mount */}
</div>

<div className="animate-slide-up">
  {/* Slides up on mount */}
</div>
```

### Transform Effects

**Scale:**
```css
hover:scale-105    /* Slightly larger */
hover:scale-110    /* Noticeably larger */
active:scale-95    /* Pressed effect */
```

**Translate:**
```css
hover:-translate-y-1   /* Lift up */
hover:-translate-y-2   /* Lift up more */
hover:translate-x-1    /* Slide right */
```

**Rotate:**
```css
hover:rotate-3     /* Slight tilt */
hover:rotate-6     /* More tilt */
hover:-rotate-3    /* Tilt opposite */
```

---

## 📱 Responsive Design

### Breakpoint System

```css
/* Mobile First - No prefix */
default: 0px - 639px

/* Tablet - sm: */
sm: 640px and up

/* Desktop - md: */
md: 768px and up

/* Large Desktop - lg: */
lg: 1024px and up

/* Extra Large - xl: */
xl: 1280px and up

/* 2XL - 2xl: */
2xl: 1536px and up
```

### Responsive Patterns

**Typography:**
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
  Responsive Heading
</h1>
```

**Spacing:**
```tsx
<div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
  {/* Responsive padding */}
</div>
```

**Layout:**
```tsx
/* Stack on mobile, side-by-side on desktop */
<div className="flex flex-col lg:flex-row gap-6">
  <div className="flex-1">{/* Content 1 */}</div>
  <div className="flex-1">{/* Content 2 */}</div>
</div>
```

**Grid:**
```tsx
/* 1 column mobile, 2 tablet, 3 desktop */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

**Visibility:**
```tsx
/* Hide on mobile, show on desktop */
<div className="hidden lg:block">Desktop Only</div>

/* Show on mobile, hide on desktop */
<div className="block lg:hidden">Mobile Only</div>
```

### Container Queries (Modern)

```tsx
/* Container query setup */
<div className="@container">
  <div className="@lg:flex @lg:flex-row">
    {/* Responds to container width, not viewport */}
  </div>
</div>
```

### Mobile-First Examples

**Navigation:**
```tsx
<nav className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
  {/* Vertical mobile, horizontal desktop */}
</nav>
```

**Hero Section:**
```tsx
<section className="min-h-screen flex items-center 
                    px-4 sm:px-6 lg:px-8 
                    py-12 lg:py-20">
  <div className="max-w-7xl mx-auto">
    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold">
      {/* Responsive hero text */}
    </h1>
  </div>
</section>
```

---

## ♿ Accessibility

### Focus States

**Standard Focus Ring:**
```css
focus:outline-none 
focus:ring-2 
focus:ring-blue-500 
focus:ring-offset-2
```

**Usage:**
```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Accessible Button
</button>

<input className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
```

### Focus Visible (Keyboard Only)

```css
/* Shows focus only for keyboard navigation */
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-blue-500
```

### Color Contrast

**WCAG AA Compliant Combinations:**
```css
/* Text on white backgrounds */
text-slate-900 on bg-white      /* ✓ AAA */
text-slate-800 on bg-white      /* ✓ AAA */
text-slate-700 on bg-white      /* ✓ AA */
text-slate-600 on bg-white      /* ✓ AA */

/* White text on dark backgrounds */
text-white on bg-slate-900      /* ✓ AAA */
text-white on bg-slate-800      /* ✓ AAA */
text-white on bg-blue-600       /* ✓ AA */
```

### Screen Reader Text

```tsx
/* Visually hidden but accessible to screen readers */
<span className="sr-only">
  This text is only for screen readers
</span>

/* Implementation */
<button>
  <span className="sr-only">Close menu</span>
  <XIcon className="w-5 h-5" />
</button>
```

### Semantic HTML

```tsx
/* Use proper heading hierarchy */
<h1>Main Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

/* Use semantic elements */
<nav>Navigation</nav>
<main>Main Content</main>
<article>Article Content</article>
<aside>Sidebar</aside>
<footer>Footer</footer>
```

### ARIA Labels

```tsx
/* Button with icon only */
<button aria-label="Close dialog">
  <XIcon />
</button>

/* Navigation */
<nav aria-label="Main navigation">
  {/* Nav items */}
</nav>

/* Form inputs */
<input 
  type="text" 
  id="email"
  aria-describedby="email-help"
  aria-required="true"
/>
<p id="email-help" className="text-sm text-slate-600">
  We'll never share your email
</p>
```

### Keyboard Navigation

```css
/* Interactive elements must be keyboard accessible */
tabIndex={0}  /* Focusable */
tabIndex={-1} /* Focusable programmatically only */
```

**Example:**
```tsx
<div 
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom Interactive Element
</div>
```

### Font Rendering

```css
/* In globals.css */
body {
  font-feature-settings: "rlig" 1, "calt" 1;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 🎯 Design Principles

### 1. Mobile-First Approach
- Design for mobile screens first (320px+)
- Progressively enhance for larger screens
- Touch-friendly targets (minimum 44x44px)
- Thumb-reachable navigation zones

### 2. Clarity & Simplicity
- Clear visual hierarchy
- Generous white space
- One primary action per screen
- Remove unnecessary elements

### 3. Consistency
- Reuse components and patterns
- Maintain consistent spacing
- Use established color meanings
- Keep interaction patterns familiar

### 4. Performance
- Optimize images (WebP, proper sizing)
- Lazy load below-the-fold content
- Minimize CSS/JS bundle size
- Use system fonts when possible

### 5. Accessibility First
- WCAG AA minimum compliance
- Keyboard navigation support
- Proper focus indicators
- Semantic HTML structure

### 6. Visual Hierarchy
- Size indicates importance
- Color draws attention
- White space creates focus
- Proximity shows relationships

### 7. Professional Trust
- Blue color scheme (reliability)
- Clean, minimalist design
- High-quality images
- Professional typography

### 8. User-Centric
- Fast, responsive interactions
- Clear call-to-actions
- Helpful error messages
- Loading states for all actions

---

## 🛠️ Implementation Guide

### Setting Up Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
    },
  },
  plugins: [],
}

export default config
```

### Global CSS Setup

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS Custom Properties */
:root {
  --color-background: 248 250 252;
  --color-foreground: 15 23 42;
  --color-primary: 59 130 246;
  --color-accent: 249 115 22;
}

/* Base Styles */
* {
  border-color: rgb(226 232 240);
}

html {
  scroll-behavior: smooth;
}

body {
  color: rgb(var(--color-foreground));
  background-color: rgb(var(--color-background));
  font-feature-settings: "rlig" 1, "calt" 1;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Component Utilities */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-lg font-medium 
           transition-all duration-200 focus:outline-none focus:ring-2 
           focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm;
  }
  
  .btn-accent {
    @apply bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-sm;
  }
  
  .btn-sm {
    @apply px-3 py-2 text-sm;
  }
  
  .btn-md {
    @apply px-4 py-2.5 text-base;
  }
  
  .btn-lg {
    @apply px-6 py-3 text-lg;
  }
  
  .card {
    @apply bg-white rounded-xl border border-slate-200 shadow-soft;
  }
  
  .card-hover {
    @apply transition-all duration-300 hover:shadow-lg hover:-translate-y-1;
  }
}

@layer utilities {
  .animate-fade-in {
    animation: fadeIn 0.6s ease-in-out;
  }
  
  .animate-slide-up {
    animation: slideUp 0.6s ease-out;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Next.js Layout Setup

```tsx
// layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Rhino Automotive Glass',
    template: '%s | Rhino Automotive Glass'
  },
  description: 'Especialistas en cristales automotrices',
  metadataBase: new URL('https://rhinoautomotive.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

### Component Examples

**Button Component:**
```tsx
// components/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'btn',
  {
    variants: {
      variant: {
        primary: 'btn-primary',
        accent: 'btn-accent',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
      },
      size: {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg',
        xl: 'btn-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
```

**Card Component:**
```tsx
// components/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = false, ...props }, ref) => {
    const hoverClass = hover ? 'card-hover' : ''
    return (
      <div
        ref={ref}
        className={`card ${hoverClass} ${className}`}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export { Card }
```

---

## 📋 Quick Reference

### Color Quick Reference
```
Primary:    blue-600 (#2563eb)
Accent:     orange-500 (#f97316)
Text:       slate-900 (#0f172a)
Background: slate-50 (#f8fafc)
Border:     slate-200 (#e2e8f0)
```

### Spacing Quick Reference
```
xs:  gap-2  (8px)
sm:  gap-4  (16px)
md:  gap-6  (24px)
lg:  gap-8  (32px)
xl:  gap-12 (48px)
```

### Typography Quick Reference
```
Hero:     text-4xl lg:text-5xl font-extrabold
Heading:  text-2xl lg:text-3xl font-bold
Body:     text-base text-slate-600
Small:    text-sm text-slate-500
```

### Button Quick Reference
```
Primary:   btn btn-primary btn-md
Accent:    btn btn-accent btn-md
Secondary: btn btn-secondary btn-md
Ghost:     btn btn-ghost btn-md
```

---

## 📦 Export for Reuse

To use this theme in another project:

1. **Copy Tailwind Config** → `tailwind.config.ts`
2. **Copy Global CSS** → `globals.css`
3. **Copy Layout Setup** → `layout.tsx`
4. **Install Inter Font** → `next/font/google`
5. **Copy Component Utilities** → Create `components/ui/` folder

---

## 🔄 Version History

**v1.0.0** - December 2024
- Initial design system
- Professional blue theme
- Mobile-first responsive design
- Accessibility-focused components
- Comprehensive component library

---

## 📞 Support & Questions

For questions about implementing this design system or adapting it to your needs:
- Review component examples in this guide
- Check Tailwind CSS documentation: https://tailwindcss.com
- Refer to Next.js documentation: https://nextjs.org

---

**Design System Created:** December 2024  
**Framework:** Next.js 15 + Tailwind CSS 4.x  
**Font:** Inter (Google Fonts)  
**License:** Internal Use - Rhino Automotive Glass