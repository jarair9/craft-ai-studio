# Craft AI Studio - Design System

## Design Philosophy

The Craft AI Studio UI follows a **Modern Gradient Minimalism** aesthetic inspired by Lovable's design language. The design emphasizes clarity, depth, and a vibrant gradient foundation that conveys innovation and energy.

## Color Palette

### Primary Gradient (Hero Background)
- **Start**: `#0066FF` (Vibrant Blue)
- **Mid**: `#FF1493` (Deep Pink)
- **End**: `#FF6B35` (Warm Orange)
- **Angle**: 135 degrees (diagonal from top-left to bottom-right)

### Semantic Colors
- **Primary**: `#0066FF` (Blue) - Primary actions, links
- **Secondary**: `#FF1493` (Pink) - Accents, highlights
- **Accent**: `#FF6B35` (Orange) - Warnings, emphasis
- **Success**: `#10B981` (Emerald)
- **Error**: `#EF4444` (Red)
- **Neutral**: `#1F2937` (Dark Gray) - Text, backgrounds

### Neutral Palette
- **Background**: `#FFFFFF` (White)
- **Surface**: `#F9FAFB` (Light Gray)
- **Border**: `#E5E7EB` (Medium Gray)
- **Text Primary**: `#111827` (Near Black)
- **Text Secondary**: `#6B7280` (Medium Gray)

## Typography

### Font Stack
- **Display**: `"Sora", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Body**: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Type Scale
- **Display XL**: 48px, 600 weight, 1.2 line-height
- **Display L**: 36px, 600 weight, 1.2 line-height
- **Heading L**: 28px, 600 weight, 1.3 line-height
- **Heading M**: 20px, 600 weight, 1.4 line-height
- **Heading S**: 16px, 600 weight, 1.5 line-height
- **Body L**: 16px, 400 weight, 1.6 line-height
- **Body M**: 14px, 400 weight, 1.5 line-height
- **Body S**: 12px, 400 weight, 1.4 line-height
- **Caption**: 11px, 500 weight, 1.4 line-height

## Spacing System

Based on 4px grid:
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 48px
- **4xl**: 64px

## Shadows & Depth

### Shadow Levels
- **Subtle**: `0 1px 2px rgba(0, 0, 0, 0.05)`
- **Small**: `0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)`
- **Medium**: `0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)`
- **Large**: `0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)`
- **Extra Large**: `0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)`

## Border Radius

- **None**: 0px
- **Sm**: 4px
- **Md**: 8px
- **Lg**: 12px
- **Xl**: 16px
- **Full**: 9999px

## Component Patterns

### Input Fields
- Background: `#FFFFFF`
- Border: `1px solid #E5E7EB`
- Border Radius: `12px`
- Padding: `12px 16px`
- Focus: `2px solid #0066FF` outline
- Placeholder: `#9CA3AF` text color

### Buttons
- **Primary**: Blue background, white text, rounded corners
- **Secondary**: Gray background, dark text
- **Ghost**: Transparent background, blue text
- **Gradient**: Gradient background (blue to pink), white text
- Padding: `12px 24px`
- Border Radius: `8px`
- Transition: `all 200ms ease`

### Cards
- Background: `#FFFFFF`
- Border: `1px solid #E5E7EB`
- Border Radius: `12px`
- Padding: `24px`
- Shadow: Medium shadow
- Hover: Subtle shadow increase

### Navigation
- Background: `#FFFFFF`
- Border Bottom: `1px solid #E5E7EB`
- Height: `64px`
- Sticky positioning
- Logo on left, menu items center, actions right

## Animations & Transitions

### Timing Functions
- **Entrance**: `cubic-bezier(0.16, 1, 0.3, 1)` - 300ms
- **Exit**: `cubic-bezier(0.7, 0, 0.84, 0)` - 200ms
- **Interaction**: `cubic-bezier(0.4, 0, 0.2, 1)` - 150ms

### Common Animations
- **Fade In**: Opacity 0 → 1, 300ms
- **Slide Up**: Transform translateY(20px) → 0, 300ms
- **Scale**: Transform scale(0.95) → 1, 200ms
- **Pulse**: Opacity oscillation, infinite

## Responsive Breakpoints

- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px - 1279px
- **Wide**: 1280px+

## Accessibility

### Color Contrast
- All text must meet WCAG AA standards (4.5:1 for normal text)
- Focus states must be visible (minimum 2px outline)
- Interactive elements must be at least 44x44px

### Keyboard Navigation
- Tab order follows visual flow
- Focus indicators always visible
- Escape key closes modals/dropdowns
- Enter/Space activates buttons

### ARIA Labels
- All interactive elements have descriptive labels
- Form fields have associated labels
- Images have alt text
- Icons have aria-label or title

## Implementation Notes

### CSS Variables
All colors, spacing, and typography should use CSS custom properties for consistency and maintainability.

### Dark Mode Support
Design system supports both light and dark modes with appropriate color adjustments.

### Performance
- Use CSS Grid and Flexbox for layouts
- Minimize animations on mobile devices
- Optimize images and use modern formats (WebP)
- Lazy load non-critical components

## Component Library

All UI components should follow this design system and be built using shadcn/ui as the base, customized with the above specifications.
