---
name: Industrial Intelligence
colors:
  surface: '#0e141a'
  surface-dim: '#0e141a'
  surface-bright: '#343a41'
  surface-container-lowest: '#090f15'
  surface-container-low: '#161c22'
  surface-container: '#1a2027'
  surface-container-high: '#252b31'
  surface-container-highest: '#2f353c'
  on-surface: '#dde3ec'
  on-surface-variant: '#d3c4b1'
  inverse-surface: '#dde3ec'
  inverse-on-surface: '#2b3138'
  outline: '#9c8f7d'
  outline-variant: '#4f4536'
  surface-tint: '#f5bd58'
  primary: '#f7bf59'
  on-primary: '#422c00'
  primary-container: '#d9a441'
  on-primary-container: '#573c00'
  inverse-primary: '#7d5700'
  secondary: '#61dd9c'
  on-secondary: '#003921'
  secondary-container: '#17a56a'
  on-secondary-container: '#00311c'
  tertiary: '#ffb6b2'
  on-tertiary: '#68000e'
  tertiary-container: '#ff8c88'
  on-tertiary-container: '#840b18'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdeaa'
  primary-fixed-dim: '#f5bd58'
  on-primary-fixed: '#271900'
  on-primary-fixed-variant: '#5f4100'
  secondary-fixed: '#7ffab7'
  secondary-fixed-dim: '#61dd9c'
  on-secondary-fixed: '#002111'
  on-secondary-fixed-variant: '#005231'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#8d131d'
  background: '#0e141a'
  on-background: '#dde3ec'
  surface-variant: '#2f353c'
typography:
  display-lg:
    fontFamily: Vazirmatn
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
  headline-lg:
    fontFamily: Vazirmatn
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Vazirmatn
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Vazirmatn
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Vazirmatn
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Vazirmatn
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Vazirmatn
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  telemetry-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Vazirmatn
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

This design system is built for high-stakes industrial environments where precision, legibility, and technical authority are paramount. The aesthetic merges **Modern Corporate** structure with **Glassmorphic** telemetry overlays, creating a "Mission Control" atmosphere. 

The personality is rugged yet sophisticated—utilizing a deep, dark palette to reduce eye strain during long shifts while employing high-visibility "Mining Gold" accents to highlight critical fleet status and operational data. The UI should evoke a sense of absolute control over heavy machinery through a refined, technical interface.

## Colors

The palette is engineered for a "Dark Industrial" environment. The base `#0B1117` provides a deep, non-distracting background for the fleet management dashboard. 

- **Primary (Mining Gold):** Used exclusively for high-priority actions, active states, and brand-critical indicators.
- **Surface Tiers:** Layering is achieved through slight shifts in luminosity (`#111A23` to `#16222D`) rather than heavy shadows.
- **Functional Colors:** Success, Warning, and Danger colors follow industrial safety standards, optimized for high contrast against the dark base.
- **Borders:** Thin, low-contrast borders (`#24313D`) define the technical grid without creating visual noise.

## Typography

The typography system is dual-pronged. **Vazirmatn** handles all RTL Persian linguistic content, providing a modern and highly legible humanist sans-serif feel. 

For technical data, telemetry, and fleet IDs, **JetBrains Mono** is employed. The monospaced nature of the label font ensures that fluctuating numerical values (speed, fuel levels, coordinates) do not cause layout shifts and remain readable at a glance.

- **RTL Support:** All Vazirmatn styles must account for proper Persian line-height and character spacing.
- **Telemetry:** Use `label-mono` for all units and sensor data.

## Layout & Spacing

The system follows a strict **8px grid** (with a 4px minor increment for micro-adjustments). The layout is a **Fluid-Fixed hybrid**:

- **Sidebar:** Fixed width (280px) for navigation and global fleet status.
- **Main Content:** Fluid 12-column grid that expands to fill the viewport.
- **Telemetry Overlays:** Positioned using absolute coordinates or pinned to a 4x4 dash grid.
- **Gutters:** Standard 16px gutter between cards to maintain a dense, information-rich environment typical of industrial software.

On mobile devices, the 12-column grid collapses to a 4-column layout with 16px side margins.

## Elevation & Depth

Depth is communicated through **Tonal Layering** and **Glassmorphism**. 

1. **Base Layer:** `#0B1117` (Deep Graphite) is the "ground" of the application.
2. **Surface Layer:** Dashboard cards and containers use `#111A23` with a 1px border of `#24313D`.
3. **Glass Tiers:** Overlays (such as map popovers or technical tooltips) use a semi-transparent version of `#16222D` (80% opacity) with a `blur(12px)` backdrop filter to simulate frosted glass.
4. **Highlights:** Elevation is reinforced with a subtle top-inner-shadow (white at 5% opacity) on primary buttons and active cards to create a "tactile" machined edge.

## Shapes

The shape language is **Soft-Industrial**. We avoid sharp corners to prevent the UI from feeling aggressive, but maintain a low radius (4px to 12px) to preserve a professional, technical look.

- **Small elements (Checkboxes, Tags):** 4px (Soft)
- **Standard Components (Buttons, Inputs):** 8px (Rounded-lg)
- **Large Containers (Cards, Modals):** 12px (Rounded-xl)

## Components

### Buttons
- **Primary:** Background `Mining Gold`, Text `Black`. Sharp 8px corners. Subtle gradient from top (lighter) to bottom (darker).
- **Secondary/Ghost:** Border `Border-Strong`, Text `Primary`. No fill.

### Technical Cards
- Background: `Surface`.
- Border: 1px solid `Border-Subtle`.
- Header: Separated by a thin horizontal line; uses `label-mono` for card titles.

### Status Badges
- Used for fleet status (Active, Idle, Down).
- Style: Pill-shaped, low-opacity background of the status color with a high-contrast dot indicator.

### Inputs
- Background: `Base` (Darker than card background).
- Border: `Border-Subtle`. On focus: Border `Primary` with a 2px outer glow.

### Technical Charts
- Line charts should use a 2px stroke width.
- Areas should use a vertical gradient from the status color (e.g., Success Emerald) at 20% opacity to 0% at the baseline.
- Grid lines in charts should use `Border-Subtle` with a dashed pattern.