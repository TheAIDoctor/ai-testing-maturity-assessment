# AI Testing Maturity Assessment - Design Guidelines

## Design Approach: Professional B2B SaaS System

**Selected System**: Material Design with enterprise refinements
**Rationale**: Utility-focused assessment tool requiring clarity, trust, and data visualization. Professional B2B audience expects clean, structured interface with strong information hierarchy.

---

## Core Design Elements

### A. Typography
- **Primary Font**: Inter (Google Fonts) - body, UI elements
- **Secondary Font**: Space Grotesk (Google Fonts) - headings, emphasis
- **Hierarchy**:
  - H1: 3xl (36px) / font-bold - page titles
  - H2: 2xl (24px) / font-semibold - section headers
  - H3: xl (20px) / font-semibold - card titles
  - Body: base (16px) / font-normal - default text
  - Small: sm (14px) / font-normal - metadata, captions

### B. Layout System
- **Container**: max-w-6xl centered with px-6
- **Spacing Scale**: Tailwind units of 2, 4, 6, 8, 12, 16 (e.g., p-4, gap-8, mb-12)
- **Section Padding**: py-12 mobile, py-16 desktop
- **Card Padding**: p-6 (compact), p-8 (standard)
- **Grid Systems**: 
  - Assessment cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-5
  - Area breakdown: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  - Admin table: full-width responsive

### C. Component Library

**Navigation**
- Top nav: logo left, "Privacy" link right, clean horizontal bar with subtle border-b
- Sticky on scroll with slight backdrop blur

**Progress Indicator**
- Stepped progress bar showing Area/Dimension completion
- Number badges (1-5) with connecting lines
- Active state with accent treatment, completed with checkmarks

**Answer Cards (Critical Component)**
- 5 level cards arranged horizontally (stack on mobile)
- Each card shows level number + description from JSON
- Clear borders, hover lift effect (translate-y-1)
- Selected state: prominent border, subtle background fill, checkmark badge
- Unselected: neutral border, white background

**Report Components**
- Score cards: Large number display with level badge, supporting text below
- Dimension table: Striped rows, 3 columns (Name | Score/Level | Description)
- Opportunity cards: Icon + title + description, ranked 1-3

**Forms**
- Input fields: border with focus ring, label above, helper text below
- Required indicators: asterisk in label
- Submit button: Full-width on mobile, auto-width desktop
- Checkbox: Custom styled with label inline

**Admin Table**
- Sortable headers, alternating row backgrounds
- Compact cell padding, monospace for dates/scores
- Action column: Icon buttons for view report

### D. Page-Specific Layouts

**Landing Page**
- Hero: Centered content, h1 + subtitle + time estimate badge + CTA button
- Single viewport height recommended, clean and focused
- Optional: Trust indicators (simple stat cards or logos below hero)

**Assessment Flow**
- Two-column where appropriate: Question prompt (40%) | Answer cards (60%)
- Navigation: Back/Next buttons, fixed bottom on mobile, inline on desktop
- Area transitions: Clear section headers with accordion/tab pattern

**Report Page**
- Header: User info + overall score (large centered card)
- Three-section layout:
  1. Overall score visualization (gauge or large number card)
  2. Area breakdown grid (5 cards, 2-3 columns)
  3. Dimension table (full-width)
  4. Top opportunities (3 cards in row)

**Admin Dashboard**
- Simple data table with filters
- Password gate: Centered modal-style form before content loads

---

## Images

**Hero Section Image**: No large hero image needed - this is a utility application where clarity and immediate action are prioritized. Use clean gradient backgrounds or subtle geometric patterns instead.

**Report Visualizations**: Consider simple icon illustrations for maturity levels (e.g., ascending steps/ladder metaphor) - use Heroicons or similar library for consistency.

---

## Critical UX Patterns

**Question Flow**: Single question visible at a time with clear progression. Auto-advance on selection optional.

**Validation States**: Inline error messages below inputs, disabled Next button until question answered.

**Loading States**: Skeleton loaders for report page, spinner for form submissions.

**Responsive Behavior**: 
- Cards stack vertically on mobile
- Tables scroll horizontally with sticky first column
- Fixed navigation buttons on mobile, inline on desktop

**Accessibility**: Keyboard navigation for card selection (arrow keys + enter), clear focus states, ARIA labels for progress indicator.