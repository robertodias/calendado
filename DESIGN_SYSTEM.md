# 🎨 Calendado Design System

A sophisticated design system combining **Google's Material Design 3** principles with **Airbnb's refined aesthetics**, featuring Calendado's signature purple brand colors.

## 🎯 **Design Philosophy**

### **Core Principles**
- **Sophisticated Simplicity** - Clean, uncluttered interfaces that feel premium
- **Human-Centered** - Designed for real people with real needs
- **Consistent & Predictable** - Familiar patterns that users can learn once and apply everywhere
- **Accessible by Default** - WCAG 2.1 AA compliant colors and interactions
- **Performance-First** - Optimized for fast loading and smooth interactions

### **Visual Identity**
- **Google-inspired**: Clean typography, generous whitespace, logical information hierarchy
- **Airbnb-refined**: Warm, welcoming, and approachable with subtle premium touches
- **Calendado-branded**: Strategic use of purple gradients and sophisticated color palettes

---

## 🎨 **Color Palette**

### **Primary Brand Colors**
```css
/* Purple Gradient - Main brand identity */
primary-50:  #faf7ff  /* Lightest tint */
primary-100: #f3edff  
primary-200: #e9ddff  
primary-300: #d6c4ff  
primary-400: #bc9eff  
primary-500: #9f75ff  /* Brand purple */
primary-600: #8b5cf6  /* Primary purple (hero gradients) */
primary-700: #7c3aed  
primary-800: #6d28d9  
primary-900: #5b21b6  
primary-950: #3b0764  /* Darkest shade */
```

### **Secondary Colors**
```css
/* Pink Accent - Gradient partner */
secondary-50:  #fdf2f8
secondary-100: #fce7f3
secondary-200: #fbcfe8
secondary-300: #f9a8d4
secondary-400: #f472b6
secondary-500: #ec4899
secondary-600: #db2777  /* Secondary pink (hero gradients) */
secondary-700: #be185d
secondary-800: #9d174d
secondary-900: #831843
```

### **Neutral Palette**
```css
/* Google-inspired grays */
neutral-0:   #ffffff  /* Pure white */
neutral-50:  #fafafa  /* Background */
neutral-100: #f5f5f5  /* Light background */
neutral-200: #eeeeee  /* Borders */
neutral-300: #e0e0e0  /* Dividers */
neutral-400: #bdbdbd  /* Disabled text */
neutral-500: #9e9e9e  /* Placeholder text */
neutral-600: #757575  /* Secondary text */
neutral-700: #616161  /* Primary text light */
neutral-800: #424242  /* Primary text */
neutral-900: #212121  /* Headings */
neutral-950: #0f0f0f  /* Maximum contrast */
```

### **Semantic Colors**
- **Success**: Green palette for confirmations, success states
- **Warning**: Yellow/amber palette for warnings, pending states  
- **Error**: Red palette for errors, destructive actions
- **Info**: Blue palette for information, links

---

## 📝 **Typography System**

### **Font Stack**
```css
/* Primary: Inter (Google-style) */
font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif

/* Monospace: JetBrains Mono */
font-mono: JetBrains Mono, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace

/* Display: Cal Sans (Headlines) */
font-display: Cal Sans, Inter, system-ui, sans-serif
```

### **Type Scale** (Material Design 3)
```css
/* Display Styles - Hero sections */
display-large:  56px / 64px, -0.02em tracking
display-medium: 45px / 52px, -0.01em tracking  
display-small:  36px / 44px, 0em tracking

/* Headlines - Page titles */
headline-large:  32px / 40px, 0em tracking, 600 weight
headline-medium: 28px / 36px, 0em tracking, 600 weight
headline-small:  24px / 32px, 0em tracking, 600 weight

/* Titles - Section headers */
title-large:  22px / 28px, 0em tracking, 500 weight
title-medium: 16px / 24px, 0.01em tracking, 500 weight
title-small:  14px / 20px, 0.01em tracking, 500 weight

/* Body Text - Content */
body-large:  16px / 24px, 0.01em tracking, 400 weight
body-medium: 14px / 20px, 0.02em tracking, 400 weight
body-small:  12px / 16px, 0.04em tracking, 400 weight

/* Labels - UI elements */
label-large:  14px / 20px, 0.01em tracking, 500 weight
label-medium: 12px / 16px, 0.05em tracking, 500 weight
label-small:  11px / 16px, 0.05em tracking, 500 weight
```

---

## 🏗️ **Layout System**

### **Spacing** (8px Grid)
```css
/* Base unit: 8px */
spacing-1:  4px   (0.25rem)
spacing-2:  8px   (0.5rem)  ← Base unit
spacing-3:  12px  (0.75rem)
spacing-4:  16px  (1rem)    ← Standard padding
spacing-6:  24px  (1.5rem)  ← Card padding
spacing-8:  32px  (2rem)    ← Section spacing
spacing-12: 48px  (3rem)    ← Large spacing
spacing-16: 64px  (4rem)    ← Extra large
spacing-24: 96px  (6rem)    ← Section margins
```

### **Border Radius**
```css
/* Subtle to prominent */
radius-sm:  4px   /* Small elements */
radius-md:  8px   /* Default */
radius-lg:  12px  /* Cards, buttons */
radius-xl:  16px  /* Modals */
radius-2xl: 24px  /* Hero elements */
radius-3xl: 32px  /* Special cases */
radius-full: 9999px /* Pills, badges */
```

### **Shadows** (Material Design 3)
```css
/* Elevation levels */
shadow-sm:  0px 1px 2px rgba(0,0,0,0.05)
shadow-md:  0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px rgba(0,0,0,0.06)
shadow-lg:  0px 4px 6px rgba(0,0,0,0.1), 0px 2px 4px rgba(0,0,0,0.06)
shadow-xl:  0px 10px 15px rgba(0,0,0,0.1), 0px 4px 6px rgba(0,0,0,0.05)
shadow-2xl: 0px 20px 25px rgba(0,0,0,0.1), 0px 10px 10px rgba(0,0,0,0.04)

/* Brand shadows */
shadow-primary:    0px 4px 14px rgba(139,92,246,0.2)
shadow-primary-lg: 0px 8px 25px rgba(139,92,246,0.3)
```

---

## 🧩 **Component Library**

### **Button System**
```typescript
// Variants
primary:     Purple gradient, white text
secondary:   White background, outlined
ghost:       Transparent, minimal
destructive: Red gradient
success:     Green gradient

// Sizes
sm: 36px height, small padding
md: 44px height, standard padding  ← Default
lg: 48px height, large padding
xl: 56px height, extra large padding
icon: 44px × 44px square
```

### **Card System**
```typescript
// Variants
default:  Border + subtle shadow
elevated: No border, prominent shadow
outlined: Strong border, no shadow

// Interactive states
hover: Lift with increased shadow
active: Scale down slightly (0.98)
```

### **Input System**
```typescript
// Variants
default: Border + shadow on focus
filled:  Background fill, border on focus
outlined: Strong border, no background

// States
default: Normal state
error:   Red border + focus ring
success: Green border + focus ring
```

---

## ⚡ **Animation System**

### **Duration**
```css
fast:   150ms  /* Micro-interactions */
normal: 250ms  /* Standard transitions */
slow:   350ms  /* Complex animations */
```

### **Easing Functions**
```css
standard:   cubic-bezier(0.4, 0.0, 0.2, 1)  /* Default */
decelerate: cubic-bezier(0.0, 0.0, 0.2, 1)  /* Entering */
accelerate: cubic-bezier(0.4, 0.0, 1, 1)    /* Exiting */
sharp:      cubic-bezier(0.4, 0.0, 0.6, 1)  /* Attention */
```

### **Common Patterns**
```css
/* Hover states */
hover:scale-[1.02]     /* Subtle lift */
active:scale-[0.98]    /* Press feedback */

/* Focus states */
focus:ring-2 focus:ring-primary-600 focus:ring-offset-2

/* Loading states */
animate-spin           /* Spinners */
animate-pulse          /* Skeleton loading */
```

---

## 📱 **Responsive Design**

### **Breakpoints** (Mobile-first)
```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

### **Layout Patterns**
```css
/* Mobile: Stack vertically */
flex-col space-y-4

/* Desktop: Side by side */
lg:flex-row lg:space-y-0 lg:space-x-8

/* Container max-widths */
max-w-7xl mx-auto px-6
```

---

## ♿ **Accessibility**

### **Color Contrast**
- **AAA**: 7:1 ratio for normal text, 4.5:1 for large text
- **AA**: 4.5:1 ratio for normal text, 3:1 for large text
- All text colors meet WCAG 2.1 AA standards minimum

### **Focus Management**
```css
/* Visible focus rings */
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-primary-600 
focus-visible:ring-offset-2
```

### **Interactive Elements**
- Minimum 44px touch targets
- Clear hover/active states
- Semantic HTML structure
- ARIA labels where needed

---

## 🚀 **Implementation**

### **Usage Examples**

#### **Button Component**
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" fullWidth>
  Get Started
</Button>

<Button variant="ghost" leftIcon={<Icon />}>
  Cancel
</Button>
```

#### **Card Component**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card variant="elevated" interactive>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardContent>
    Content here...
  </CardContent>
</Card>
```

#### **Input Component**
```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email Address"
  variant="filled"
  size="lg"
  leftIcon={<EmailIcon />}
  helperText="We'll never share your email"
/>
```

### **Custom Classes**
```css
/* Brand gradients */
.bg-brand-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #db2777 100%);
}

/* Glass morphism */
.glass {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Hover lift */
.hover-lift {
  transition: transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
}
.hover-lift:hover {
  transform: translateY(-2px) scale(1.02);
}
```

---

## 📚 **Design Tokens**

All design tokens are available in:
- **TypeScript**: `src/styles/design-system.ts`
- **Tailwind Config**: `tailwind.config.js`
- **CSS Custom Properties**: Generated automatically

### **Usage in Code**
```typescript
import { designSystem } from '@/styles/design-system';

// Access colors
const primaryColor = designSystem.colors.primary[600];

// Access typography
const headlineStyle = designSystem.typography.fontSize['headline-large'];

// Access spacing
const cardPadding = designSystem.spacing[6];
```

---

## 🎯 **Best Practices**

### **Do's**
✅ Use the 8px spacing grid consistently  
✅ Stick to the defined color palette  
✅ Apply proper semantic hierarchy  
✅ Test on mobile devices first  
✅ Ensure adequate color contrast  
✅ Use consistent border radius values  
✅ Apply smooth, purposeful animations  

### **Don'ts**
❌ Create custom colors outside the palette  
❌ Mix different border radius styles  
❌ Use arbitrary spacing values  
❌ Ignore responsive breakpoints  
❌ Forget focus states for interactive elements  
❌ Overuse animations or make them too slow  
❌ Use more than 3 font weights in one design  

---

## 🔄 **Updates & Maintenance**

### **Version History**
- **v1.0** - Initial design system with Material Design 3 + Airbnb influences
- **v1.1** - Enhanced component library with accessibility improvements

### **Contributing**
1. Follow the established patterns
2. Test across all breakpoints
3. Verify accessibility compliance
4. Update documentation for any changes
5. Get design review before implementation

---

*This design system creates a cohesive, sophisticated, and accessible user experience that reflects Calendado's premium brand positioning while maintaining the usability standards users expect from modern applications.*
