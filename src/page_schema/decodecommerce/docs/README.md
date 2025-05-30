# DecodeCommerce Website Documentation

## Overview
DecodeCommerce is a professional website for a custom eCommerce solution provider specializing in NetSuite integrations. The website is built using the page schema system with a component-based architecture.

## Project Structure

```
decodecommerce/
├── components/           # Reusable components
│   ├── DecodeCommerceNavigationHeader.hjson
│   ├── DecodeCommerceHeroSection.hjson
│   ├── DecodeCommerceFeatureGrid.hjson
│   ├── DecodeCommerceROICalculator.hjson
│   ├── DecodeCommerceProcessTimeline.hjson
│   ├── DecodeCommercePricingSection.hjson
│   ├── DecodeCommerceTestimonialSlider.hjson
│   ├── DecodeCommerceFAQAccordion.hjson
│   ├── DecodeCommerceCTASection.hjson
│   └── DecodeCommerceFooter.hjson
├── pages/               # Page templates
│   ├── DecodeCommerceHome.hjson
│   ├── DecodeCommerceFeatures.hjson
│   ├── DecodeCommercePricing.hjson
│   ├── DecodeCommerceAbout.hjson
│   └── DecodeCommerceContact.hjson
└── docs/               # Documentation
    ├── README.md
    └── COMPONENT_REVIEW.md
```

## Components

### DecodeCommerceNavigationHeader
- **Purpose**: Main navigation bar with theme toggle
- **Features**:
  - Sticky navigation
  - Logo/brand name
  - Navigation links
  - Theme toggle button (light/dark mode)
  - Mobile responsive

### DecodeCommerceHeroSection
- **Purpose**: Landing hero section with main value proposition
- **Features**:
  - Animated background gradient
  - Main headline and subheadline
  - CTA button with pricing info
  - Statistics display (ROI metrics)
  - Floating preview card

### DecodeCommerceFeatureGrid
- **Purpose**: Display key features in a grid layout
- **Features**:
  - 6 main features with carbon icons
  - Hover animations
  - Responsive grid layout
  - Feature cards with descriptions

### DecodeCommerceROICalculator
- **Purpose**: Interactive calculator showing potential savings
- **Features**:
  - Revenue slider input
  - Development hours slider
  - Real-time calculation
  - Visual result display
  - Engaging user interaction

### DecodeCommerceProcessTimeline
- **Purpose**: Show the development process timeline
- **Features**:
  - 4-step process visualization
  - Slide reveal animations
  - Timeline connector on desktop
  - Icon-based steps
  - Duration information

### DecodeCommercePricingSection
- **Purpose**: Display pricing plans
- **Features**:
  - 3 pricing tiers (Starter, Professional, Enterprise)
  - Featured plan highlight
  - Feature lists with checkmarks
  - CTA buttons per plan
  - Responsive card layout

### DecodeCommerceTestimonialSlider
- **Purpose**: Customer testimonials display
- **Features**:
  - Horizontal scroll layout
  - Star ratings
  - Customer information
  - Auto-scrolling capability
  - Quote styling

### DecodeCommerceFAQAccordion
- **Purpose**: Frequently asked questions
- **Features**:
  - Expandable/collapsible items
  - Smooth animations
  - Single open item at a time
  - Icon rotation on expand

### DecodeCommerceCTASection
- **Purpose**: Final call-to-action section
- **Features**:
  - Strong headline
  - Multiple contact options
  - Trust badges
  - Background gradient
  - Prominent CTA button

### DecodeCommerceFooter
- **Purpose**: Site footer with links and info
- **Features**:
  - Company description
  - Social media links
  - Multiple link columns
  - Contact information
  - Copyright and disclaimer

## Design Features

### Theme System
- Light/dark mode toggle
- Consistent color usage via theme variables
- Automatic contrast calculation for text

### Icons
- Carbon icon set used throughout
- Consistent 20px size for UI icons
- Larger sizes for feature icons

### Animations
- Hover effects on interactive elements
- Scroll-based reveal animations
- Smooth transitions (0.2s-0.3s ease)
- Floating animations on hero elements

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 968px
- Reduced padding and font sizes on mobile
- Grid layout adjustments

## SEO Optimization

1. **Semantic HTML**: Proper use of headings, sections, and landmarks
2. **Performance**: Optimized animations and transitions
3. **Accessibility**: Proper color contrast, interactive elements
4. **Content Structure**: Clear hierarchy and navigation

## Key Messages

1. **Value Proposition**: "Custom eCommerce Solutions for NetSuite"
2. **ROI Focus**: "Save 4+ months", "80% faster deployment"
3. **Pricing**: "Starting at $5,000/month"
4. **Delivery**: "2-month delivery timeline"
5. **Trust**: "SOC 2 Certified", "256-bit SSL", "5-Star Support"

## Legal Compliance

- NetSuite disclaimer: "We are independent developers and are not affiliated with or endorsed by Oracle NetSuite."
- Placed in footer for visibility

## Color Usage

- **Primary**: Brand color for CTAs, links, highlights
- **Background**: Base background color
- **Background shades**: `_d100`, `_d200` for sections
- **Text**: Main text color
- **Text shades**: `_d300`, `_d400` for muted text
- **Success**: For positive indicators, checkmarks
- **Warning/Primary**: For star ratings

## Development Notes

1. All components use the `._id` CSS selector pattern
2. Theme variables accessed via `args.theme.var.color.*`
3. Responsive CSS using media queries
4. SolidJS reactive features for interactive components
5. Data components used for repeating patterns

## Pages Created

### DecodeCommerceHome
The main landing page that combines all components to create a comprehensive overview of DecodeCommerce services.

### DecodeCommerceFeatures
Detailed features page showcasing advanced capabilities with alternating layouts for better visual appeal.

### DecodeCommercePricing
Comprehensive pricing page with plan comparison table and FAQ section.

### DecodeCommerceAbout
Company story page with values, mission, and success metrics.

### DecodeCommerceContact
Contact page with form submission and multiple contact methods.

## Fixed Issues

1. **Component Naming**: All components now have DecodeCommerce prefix
2. **ROI Calculator**: Fixed undefined savings error by properly connecting data context
3. **Pricing Grid**: Fixed to display 3 columns on large screens with proper breakpoints
4. **FAQ Accordion**: Fixed issue where all items expanded together by adding proper indexing
5. **HomePage**: Renamed to DecodeCommerceHome with updated component references

## Future Enhancements

1. Implement actual form submission backend
2. Add more testimonials and case studies
3. Enhance ROI calculator with more variables
4. Add blog/resources section
5. Implement live chat widget
6. Add animation library for smoother transitions