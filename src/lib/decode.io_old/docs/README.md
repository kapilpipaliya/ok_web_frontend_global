# decode.io Website Schema Documentation

## Overview

The decode.io website is a landing page for a visual page builder application that enables users to create dynamic web applications without coding. This schema collection provides all the components and pages needed to showcase the product's features, benefits, and capabilities through a modern, responsive design.

## Architecture

The decode.io schema follows the standard page schema structure:
- **Components**: Reusable UI elements with variants and customization options
- **Pages**: Pre-built page templates composed of components
- **Theme Integration**: Full support for light/dark modes with automatic color adaptation

## Components

### 1. **DecodeNav** - Navigation Component
- **Purpose**: Main navigation bar with responsive mobile menu
- **Features**:
  - Logo display with link to home
  - Desktop navigation links
  - Mobile hamburger menu with slide-out drawer
  - Smooth scroll to sections
- **Customization**: Logo image, navigation items, styling

### 2. **HeroSection** - Hero Landing Section
- **Purpose**: Eye-catching landing section with call-to-action
- **Features**:
  - Large title and subtitle
  - Two CTA buttons (primary and secondary)
  - Feature highlights grid
  - Responsive layout with background effects
- **Customization**: Title, subtitle, button text, features array

### 3. **FeatureCard** - Feature Display Card
- **Purpose**: Showcase individual features with icons
- **Features**:
  - Icon display (emoji or iconify)
  - Title and description
  - Optional "Learn more" link
  - Hover effects
- **Customization**: Icon, title, description, showLink, linkText

### 4. **TestimonialCard** - Customer Testimonial
- **Purpose**: Display customer reviews and social proof
- **Features**:
  - Star rating display
  - Quote text
  - Customer name and role
  - Avatar emoji
  - Card styling with hover effects
- **Customization**: Rating, quote, name, role, avatarEmoji

### 5. **PricingCard** - Pricing Plan Card
- **Purpose**: Display pricing tiers and features
- **Features**:
  - Plan name and description
  - Price with period
  - Featured plan highlighting
  - Feature list with checkmarks
  - CTA button
- **Customization**: Name, description, price, period, featured, features array, buttonText

### 6. **CTASection** - Call-to-Action Section
- **Purpose**: Conversion-focused section with prominent CTAs
- **Features**:
  - Centered layout with gradient background
  - Title and subtitle
  - Primary and optional secondary buttons
  - Responsive design
- **Customization**: Title, subtitle, primaryButtonText, secondaryButtonText, showSecondaryButton

### 7. **Footer** - Site Footer
- **Purpose**: Comprehensive footer with links and information
- **Features**:
  - Multi-column layout
  - Company branding
  - Product, company, and resource links
  - Social media links
  - Newsletter signup
  - Copyright notice
- **Customization**: Currently uses static content, can be extended for dynamic links

### 7. **FAQSection** - Frequently Asked Questions
- **Purpose**: Interactive FAQ accordion component
- **Features**:
  - Expandable/collapsible question items
  - Smooth animations and transitions
  - Interactive state management
  - Responsive design
  - Rotating arrow indicator
- **Customization**: 
  - Title text
  - Questions array with question/answer pairs
  - Styling and animations

## Pages

### 1. **DecodeLandingPage** / **HomePage**
The main landing page that combines all components in a logical flow:
1. Navigation (navbar with custom implementation)
2. Hero section (HeroSection)
3. Features showcase (FeatureCard components in grid)
4. Customer testimonials (TestimonialCard components)
5. Call to action (CTASection)
6. Pricing options (PricingCard components)
7. FAQ section (FAQSection)
8. Footer (Footer)

## Technical Implementation

### Component Structure
Each component follows the standard schema format:
```hjson
{
  vertexes: [
    {
      id: "unique_id",
      L: "Attr",
      P: {
        displayOrder: number,
        componentName: "ComponentType",
        props: "function body returning props",
        css: "function body returning styles"
      }
    }
  ],
  edges: [
    {
      id: "edge_id",
      T: "Attr",
      S: "parent_id",
      E: "child_id"
    }
  ]
}
```

### Styling Approach
- **CSS-in-JS**: All styles use the `._id` selector pattern
- **Theme Variables**: Extensive use of `args.theme.var.color.*` for consistency
- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 1024px
- **Dark Mode**: Automatic color adaptation using theme's shade swapping
- **Animations**: Subtle transitions for better UX

### Color Usage
- **Primary Colors**: Used for CTAs and important actions
- **Background Shades**: Light shades (_l50, _l100, _l200) for sections
- **Text Colors**: Automatic contrast calculation with `_text` suffix
- **Hover States**: Darker shades (_d200) for interactive elements

## Usage Instructions

### 1. Loading the Schema
The schema is automatically loaded when the application starts:
```javascript
// Loaded via src/page_schema/loader.ts
const schemas = await loadWebsiteSchemas();
const decodeSchemas = getWebsiteSchemasSync('decode.io_old');
```

### 2. Using Components
Components can be referenced by name without the website prefix:
```javascript
// In page designer
componentName: "DecodeHero"
```

### 3. Customizing Components
Components accept props for customization:
```javascript
props: '''
return {
  title: "Your Custom Title",
  description: "Your custom description",
  primaryButton: {
    text: "Get Started",
    href: "/signup"
  }
};
'''
```

## Component Customization Guide

### Navigation Customization
```hjson
// Modify navigation items
navItems: [
  { text: "Features", href: "#features" },
  { text: "Pricing", href: "#pricing" },
  { text: "About", href: "#about" }
]
```

### Feature Grid Customization
```hjson
// Add or modify features
features: [
  {
    icon: "layers",
    title: "Visual Builder",
    description: "Drag and drop interface"
  },
  // Add more features...
]
```

### Pricing Customization
```hjson
// Define pricing tiers
plans: [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    features: ["Feature 1", "Feature 2"],
    popular: false
  },
  // Add more plans...
]
```

### FAQ Customization
```hjson
// Define FAQ items
props: '''
return {
  title: "Frequently Asked Questions",
  questions: [
    {
      question: "How does it work?",
      answer: "Our platform provides an intuitive interface..."
    },
    {
      question: "What features are included?",
      answer: "All plans include core features..."
    }
    // Add more questions...
  ]
};
'''
```

## Best Practices

1. **Consistent Spacing**: Use rem units for predictable scaling
2. **Semantic HTML**: Use appropriate tags (h1, h2, nav, section)
3. **Accessibility**: Include alt text, ARIA labels where needed
4. **Performance**: Lazy load images, optimize video embeds
5. **SEO**: Use semantic markup and proper heading hierarchy

## Potential Improvements

### Short-term Enhancements
1. **Animation Library**: Add scroll-triggered animations
2. **Form Components**: Newsletter signup, contact forms
3. **Image Optimization**: Lazy loading and responsive images
4. **A/B Testing**: Component variants for testing

### Long-term Enhancements
1. **Internationalization**: Multi-language support
2. **Analytics Integration**: Track conversions and user behavior
3. **Advanced Interactions**: Parallax effects, interactive demos
4. **Component Library**: Additional specialized components
5. **Performance Monitoring**: Core Web Vitals optimization

## Troubleshooting

### Common Issues

1. **Component Not Rendering**
   - Verify schema syntax (valid HJSON)
   - Check component registration
   - Ensure proper edge relationships

2. **Styling Issues**
   - Confirm `._id` selector usage
   - Check theme variable syntax
   - Verify responsive breakpoints

3. **Dark Mode Problems**
   - Use theme variables instead of hard-coded colors
   - Test shade swapping behavior
   - Ensure proper contrast ratios

## Development Workflow

1. **Create Component Schema**: Define in `/components/` directory
2. **Test Component**: Use in a test page
3. **Iterate Design**: Adjust props and styles
4. **Document Changes**: Update this README
5. **Create Variants**: Add component variants if needed

## Contributing

When adding new components:
1. Follow existing naming conventions (DecodeComponentName)
2. Ensure responsive design
3. Support light/dark modes
4. Add comprehensive props for customization
5. Document the component in this README

## Resources

- [Page Schema System Documentation](../../CLAUDE.md#page-schema-system)
- [Theme System Guide](../../CLAUDE.md#theme-system)
- [Component Development Guide](../../docs/DEVELOPMENT.md)
- [CSS Styling Guidelines](../../docs/STYLING.md)