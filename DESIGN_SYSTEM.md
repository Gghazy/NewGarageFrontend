# Design System Guide

This document outlines the unified design system applied across the Garage Management Frontend application.

## Color Palette

All colors are defined as CSS variables in `:root` and can be used throughout the application.

### Primary Colors (Login-inspired)
- **Primary Dark**: `--primary-dark` (#1e3a5f) - Main brand color
- **Primary Darker**: `--primary-darker` (#0f4c75) - Darker variant
- **Primary Gradient**: `--primary-gradient` - Linear gradient from dark to darker

### Neutral Colors
- **Light Background**: `--light-bg` (#f8fafc) - Page and component backgrounds
- **Light Border**: `--light-border` (#e2e8f0) - Borders and dividers
- **Light Text**: `--light-text` (#94a3b8) - Secondary text

### Text Colors
- **Text Gray**: `--text-gray` (#64748b) - Tertiary text, in-actives
- **Text Dark**: `--text-dark` (#1e293b) - Primary text content
- **Text Label**: `--text-label` (#374151) - Form labels
- **White Text**: `--white-text` (#fff) - Text on dark backgrounds

### Status Colors
- **Error Background**: `--error-bg` (#fef2f2) - Error alert background
- **Error Text**: `--error-text` (#b91c1c) - Error message color

## Component Styling

### Cards
```html
<div class="card">
  <div class="card-header">Header Title</div>
  <div class="card-body">Card content here</div>
  <div class="card-footer">Optional footer</div>
</div>
```

**Features:**
- Rounded corners (12px)
- Subtle shadow
- Gradient header with primary colors
- Hover effect with elevated shadow

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">Click Me</button>
```

#### Secondary Button
```html
<button class="btn btn-secondary">Click Me</button>
```

#### Outline Button
```html
<button class="btn btn-outline-primary">Click Me</button>
```

#### Button Sizes
```html
<button class="btn btn-primary btn-small">Small</button>
<button class="btn btn-primary">Regular</button>
<button class="btn btn-primary btn-large">Large</button>
```

**Features:**
- Gradient background for primary buttons
- Smooth transitions and hover effects
- Disabled state handling
- Active state feedback

### Form Controls

#### Input Field
```html
<div class="form-group">
  <label for="input1" class="form-label">Label</label>
  <input type="text" class="form-control" id="input1" placeholder="Placeholder">
</div>
```

#### Select/Dropdown
```html
<div class="form-group">
  <label for="select1" class="form-label">Choose Option</label>
  <select class="form-select" id="select1">
    <option>Option 1</option>
    <option>Option 2</option>
  </select>
</div>
```

#### Validation
```html
<input type="email" class="form-control is-invalid">
<div class="invalid-feedback">Please enter a valid email</div>
```

**Features:**
- Consistent borders and focus states
- Clear validation feedback
- Accessible focus states with box-shadow

### Tables

```html
<table class="table">
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

**Features:**
- Gradient header with primary colors
- Hover effects on rows
- Striped rows available with `.table-striped`
- Rounded corners and shadow

### Navigation Bar (Topbar)

The topbar component automatically uses the primary gradient background. It includes:
- Brand name/logo
- Navigation items
- Dropdown menus
- Mobile-responsive behavior

**Usage in templates:**
The topbar is a shared component and is typically included once in the main layout.

### Modals

```html
<div class="modal">
  <div class="modal-content">
    <div class="modal-header">Modal Title</div>
    <div class="modal-body">Modal content</div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

**Features:**
- Gradient header matching primary colors
- Rounded corners and shadow
- Proper footer styling with button layout

### Alerts

```html
<!-- Primary Alert -->
<div class="alert alert-primary">Primary message</div>

<!-- Success Alert -->
<div class="alert alert-success">Success message</div>

<!-- Warning Alert -->
<div class="alert alert-warning">Warning message</div>

<!-- Danger Alert -->
<div class="alert alert-danger">Error message</div>

<!-- Info Alert -->
<div class="alert alert-info">Info message</div>
```

### Badges

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-secondary">Secondary</span>
```

## Typography

### Headings
```html
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
```

**Size scale:**
- h1: 2rem
- h2: 1.75rem
- h3: 1.5rem
- h4: 1.25rem
- h5: 1.1rem
- h6: 1rem

All headings use `--text-dark` color and 600-700 font-weight.

### Text
```html
<p>Paragraph text</p>
<small>Small text</small>
<a href="#">Link</a>
```

## Spacing

Spacing utilities are available for consistent margin/padding:

```html
<div class="spacing-sm">Small spacing (0.5rem)</div>
<div class="spacing-md">Medium spacing (1rem)</div>
<div class="spacing-lg">Large spacing (1.5rem)</div>
<div class="spacing-xl">Extra large spacing (2rem)</div>
<div class="spacing-2xl">2X large spacing (3rem)</div>
```

## Responsive Design

The design system includes responsive breakpoints:

### Medium Devices (≤ 768px)
- Reduced padding on cards and modals
- Smaller font sizes
- Adjusted table layout

### Small Devices (≤ 576px)
- Further reduced padding
- Optimized typography
- Mobile-friendly table display

## Implementation Notes

### CSS Variables
All color variables are defined in the `:root` selector in `styles.css` and can be used in any stylesheet:

```css
.my-element {
  background: var(--primary-dark);
  color: var(--white-text);
  border-color: var(--light-border);
}
```

### Importing Styles
The shared design system is imported globally in `styles.css`:
```css
@import 'app/shared/shared-styles.css';
```

### Component-Specific Overrides
If a component needs custom styling, it should extend the base design system rather than redefine it:

```css
/* Good: Extend design system */
.my-card {
  /* Inherits card base styles */
  color: var(--text-dark);
  border-radius: 12px;
}

/* Avoid: Redefining colors */
.my-card {
  color: #1e293b; /* Don't hardcode - use variables */
}
```

## Best Practices

1. **Use CSS Variables**: Always use `--variable-name` instead of hardcoding colors
2. **Maintain Consistency**: Use provided button, card, and form classes
3. **Responsive Design**: Test components on mobile, tablet, and desktop
4. **Accessibility**: Ensure sufficient contrast ratios and focus states
5. **Hover States**: Always provide visual feedback on interactive elements
6. **Spacing**: Use consistent padding and margins for cohesive layouts

## Troubleshooting

### Colors not applying?
- Ensure `shared-styles.css` is imported in `styles.css`
- Check that you're using `var(--variable-name)` syntax correctly
- Verify CSS specificity isn't being overridden

### Components look different?
- Ensure the component's CSS isn't conflicting with shared styles
- Check for inline styles that might override classes
- Verify Bootstrap classes are correctly applied

## Future Enhancements

- [ ] Dark mode support
- [ ] Custom theme configuration
- [ ] Accessibility audit and improvements
- [ ] Additional component variants
- [ ] Animation and transition consistency guidelines
