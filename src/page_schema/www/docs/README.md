# DecodeUI.io Website Documentation

## Overview

DecodeUI.io is a professional drag & drop page builder platform that offers both DIY website building and custom page creation services. This documentation covers the website structure, components, and pages.

## Website Structure

### Components
All components are prefixed with "DecodeUI" for consistency.

1. **DecodeUINavHeader** - Main navigation header with theme toggle
2. **DecodeUIThemeToggle** - Dark/light mode switcher
3. **DecodeUIHeroSection** - Homepage hero with CTA
4. **DecodeUIFeatureCard** - Individual feature showcase card
5. **DecodeUIFeatureGrid** - Grid layout for features
6. **DecodeUIPricingCard** - Pricing plan card component
7. **DecodeUIPricingSection** - Complete pricing section
8. **DecodeUITestimonialCard** - Customer testimonial display
9. **DecodeUIProcessTimeline** - How it works timeline
10. **DecodeUIFooter** - Site footer with links
11. **DecodeUICTASection** - Call-to-action sections
12. **DecodeUIFAQSection** - FAQ accordion component
13. **DecodeUIContactForm** - Contact form component

### Pages

1. **HomePage** (`/`) - Landing page with all main sections
2. **FeaturesPage** (`/features`) - Detailed feature breakdown
3. **PricingPage** (`/pricing`) - Pricing plans and comparison
4. **AboutPage** (`/about`) - Company story and values
5. **ContactPage** (`/contact`) - Contact form and information

## Key Features

### Design System
- **Theme Support**: Full dark/light mode with theme toggle
- **Color System**: Using theme variables for consistency
- **Responsive**: Mobile-first design with breakpoints
- **Animations**: Smooth hover effects and micro-interactions
- **Icons**: Using Carbon icons (carbon:icon-name format)

### SEO Optimization
- Semantic HTML structure
- Proper heading hierarchy
- Meta tag support
- Fast loading times
- Mobile optimization

### Value Proposition
- **DIY Option**: Professional drag & drop builder
- **Custom Service**: $50-100 per page custom development
- **Flexibility**: "Build it yourself or let us build it for you"

## Component Variants

Components support variants for customization:
- **DecodeUIFeatureCard**: icon, title, description
- **DecodeUIPricingCard**: name, price, period, features, isPopular, ctaText
- **DecodeUITestimonialCard**: quote, author, role, rating

## Styling Guidelines

1. **Colors**: Use theme variables (e.g., `_.theme.var.color.primary`)
2. **Dark Mode**: Check mode with `_.currentMode()`
3. **Backgrounds**: Use `background_dark_*` shades for dark mode
4. **Spacing**: Use rem units for consistency
5. **Transitions**: Include smooth transitions for interactions

## Navigation Structure

```
/                 - Home
/features         - Features
/pricing          - Pricing
/docs             - Documentation
/about            - About Us
/contact          - Contact
/signup           - Sign Up
```

## Best Practices

1. **Performance**: Optimized images and lazy loading
2. **Accessibility**: Proper ARIA labels and keyboard navigation
3. **Cross-browser**: Tested on major browsers
4. **Security**: Form validation and sanitization
5. **Analytics**: Ready for tracking integration

## Future Enhancements

- Documentation pages system
- Blog functionality
- Customer portal
- API documentation
- Video tutorials
- Live chat integration

## Support

For questions or custom page requests, contact admin@decodeui.io or use the contact form.