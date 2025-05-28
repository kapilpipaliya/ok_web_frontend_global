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

### 2. **DecodeHero** - Hero Section
- **Purpose**: Eye-catching landing section with call-to-action
- **Features**:
  - Main headline and subheadline
  - Descriptive text
  - Two CTA buttons (primary and secondary)
  - Responsive layout
- **Customization**: Text content, button actions, colors

### 3. **DecodeFeatures** - Features Grid
- **Purpose**: Showcase product features in an organized grid
- **Features**:
  - Icon support for each feature
  - Title and description for each item
  - Responsive 3-column grid (stacks on mobile)
  - Hover effects
- **Customization**: Feature list, icons, content

### 4. **DecodeVideoSection** - Video Demonstration
- **Purpose**: Embed product demo or promotional video
- **Features**:
  - YouTube video embedding
  - Responsive aspect ratio (16:9)
  - Section title and description
- **Customization**: Video ID, surrounding text

### 5. **DecodePricing** - Pricing Table
- **Purpose**: Display pricing tiers and plans
- **Features**:
  - Multiple pricing cards
  - Feature lists with checkmarks
  - Highlighted "popular" plan
  - CTA buttons for each plan
- **Customization**: Plans, features, pricing, styling

### 6. **DecodeTestimonials** - Customer Testimonials
- **Purpose**: Build trust with social proof
- **Features**:
  - Grid layout for multiple testimonials
  - Customer name, role, and company
  - Quote formatting
  - Responsive design
- **Customization**: Testimonial content, layout

### 7. **DecodeCTA** - Call-to-Action Section
- **Purpose**: Final conversion push before footer
- **Features**:
  - Centered layout with emphasis
  - Headline and description
  - Primary action button
- **Customization**: Text, button action, colors

### 8. **DecodeFooter** - Footer Component
- **Purpose**: Site footer with links and information
- **Features**:
  - Multi-column layout
  - Company info and links
  - Social media icons
  - Copyright notice
- **Customization**: Links, social profiles, content

## Pages

### 1. **DecodeLandingPage**
The main landing page that combines all components in a logical flow:
1. Navigation (DecodeNav)
2. Hero section (DecodeHero)
3. Features showcase (DecodeFeatures)
4. Video demonstration (DecodeVideoSection)
5. Pricing options (DecodePricing)
6. Customer testimonials (DecodeTestimonials)
7. Final CTA (DecodeCTA)
8. Footer (DecodeFooter)

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
const decodeSchemas = getWebsiteSchemas('decode.io');
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