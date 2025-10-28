# Design Guidelines: Multi-Step Business Onboarding Flow

## Design Approach
**Reference-Based Approach**: Zoho Bookings-inspired SaaS onboarding interface
- Clean, professional B2B SaaS aesthetic
- Focus on clarity, progressive disclosure, and guided user experience
- Form-centric design with minimal distractions

## Core Design Elements

### Typography
**Font Family**: Inter or similar modern sans-serif via Google Fonts
- Headings: Font weight 600-700, sizes from text-2xl (page titles) to text-lg (section headers)
- Body text: Font weight 400-500, text-base for labels, text-sm for helper text
- Input fields: Font weight 400, text-base
- Button text: Font weight 500-600, text-sm to text-base

### Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Consistent form field spacing: mb-6 between fields
- Section padding: p-8 to p-12 for main content areas
- Card/panel spacing: p-6 for side panels
- Button spacing: px-6 py-3 for primary actions

**Grid Structure**:
- Two-column layout on desktop (lg): Main form area (60-65%) + Side panel (35-40%)
- Single column on mobile: Stack form above preview/info panel
- Container: max-w-7xl mx-auto px-4

### Component Library

**Progress Stepper** (Top or Sidebar):
- Numbered circles (1-4) with connecting lines
- Active step: Filled circle with primary color
- Completed steps: Checkmark icon in filled circle
- Future steps: Outlined circle with light fill
- Step labels below numbers (Step 1: Business Details, etc.)

**Form Inputs**:
- Text fields: border-2 with rounded-lg, focus state with primary color ring
- Labels: text-sm font-medium mb-2, required indicator with asterisk
- Placeholder text: text-gray-400 with examples ("Acme Consultancy")
- Validation states: Red border for errors, green for valid, helper text below field
- Dropdowns: Custom styled select with chevron icon, matching text input height

**Multi-Select Chips**:
- Unselected: White background, gray-300 border, rounded-full px-4 py-2
- Selected/Active: Primary color background, white text, no border
- Hover state: Subtle background color shift
- Layout: Flex wrap with gap-3, allowing multiple rows

**Buttons**:
- Primary (Next/Create): Solid primary color background, white text, rounded-lg px-6 py-3
- Secondary (Back): Outlined or ghost style, primary color text
- Disabled state: Opacity-50, cursor-not-allowed
- Active state only when validation passes

**Preview Panels** (Right sidebar):
- Light background (gray-50 or primary-50)
- Border or subtle shadow for separation
- Padding p-6
- Real-time content updates matching form selections
- Calendar grid for availability preview
- Label preview showing before/after rename

**Day Selector Grid**:
- 7 buttons in row (Mon-Sun)
- Toggle behavior: Selected days with primary background, unselected with border only
- Abbreviated text (Mon, Tue, Wed) for compact display
- Equal width buttons with gap-2

**Time Range Selectors**:
- Dual dropdowns for start/end time (09:00 AM - 06:00 PM)
- 30-minute or hourly increments
- Clear labels: "From" and "To"

**Navigation**:
- Fixed bottom bar or inline at form bottom
- Back button (left-aligned), Next/Create button (right-aligned)
- Consistent spacing: py-4 px-8
- Sticky positioning on scroll if form is long

### Visual Hierarchy
- Page titles: text-2xl to text-3xl font-semibold mb-2
- Page descriptions: text-gray-600 text-base mb-8
- Section headers within forms: text-lg font-medium mb-4
- Generous whitespace between form sections (mb-8 to mb-12)

### Accessibility
- All form fields with proper labels and aria-attributes
- Keyboard navigation support for all interactive elements
- Focus indicators on all interactive elements (ring-2 ring-primary)
- Error messages announced to screen readers
- Sufficient color contrast ratios (WCAG AA minimum)

## Page-Specific Layouts

**Page 1 - Business Details**:
- Vertical form layout with fields stacked
- Right sidebar: Step information and helpful tips about setup
- 3 fields with clear spacing, labels above inputs
- Next button disabled until all required fields valid

**Page 2 - Industry & Needs**:
- Two sections: Industries (top), Business Needs (bottom)
- Chips flow horizontally with wrap, 8-12 options per section
- Right sidebar: Explanation of why this information helps
- Selected count indicator: "3 selected" below each section

**Page 3 - Availability**:
- Timezone dropdown at top
- Day selector grid below
- Time range selectors (start/end)
- Right sidebar: Live calendar preview showing selected availability with visual blocks

**Page 4 - Custom Labels**:
- Two input fields with suggestions below each
- Labels: "What do you call your..." with examples in lighter text
- Right sidebar: Real-time preview panel showing how labels appear in UI mockup
- Final "Create Account" button more prominent than previous Next buttons

### Design Consistency
- Maintain consistent border radius: rounded-lg (8px) for cards/inputs, rounded-full for chips
- Consistent shadow usage: shadow-sm for subtle elevation on cards
- Uniform transition timing: transition-all duration-200 for interactive states
- Primary color used consistently for: active states, CTAs, focus rings, selected items

**No images required** for this form-focused onboarding flow. All visual interest comes from clean layout, thoughtful spacing, and interactive elements.