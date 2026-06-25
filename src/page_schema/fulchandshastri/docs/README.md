# Fulchand Shastri Website Documentation

This is the official website for Fulchand Shastri (fulchandshastri.in), an enlightened master who has devoted his life to spreading the teachings of his spiritual guru, Shrimad Rajchandra.

## Overview

The website provides a comprehensive platform for:
- Accessing spiritual texts and books
- Watching thousands of hours of discourses
- Viewing upcoming events and schedules
- Exploring photo and video galleries
- Connecting with the spiritual community
- Learning about Fulchand Shastri's mission and teachings

## Website Structure

### Pages

Page schemas are grouped in subfolders under `pages/` (organization only; page keys are unchanged):

| Folder | Pages |
|--------|-------|
| `pages/` | **Home** — Landing page with hero section, mission overview, and feature highlights |
| `pages/about/` | **About** dropdown: About Fulchand, His Inspiration, About ASK Umarala, Atma Siddhi Shastra Mission, Gyaan Deepak ! Prajwalan, Atma Sadhana Nitya Kram |
| `pages/content/` | **Books**, **Discourses**, **Bhakti**, **Schedule** |
| `pages/gallery/` | **Photos**, **Videos** |
| `pages/contact/` | **Contact**, **Donation** |
| `pages/portal/` | **PortalTable**, **Settings** (admin/portal UI) |

### Components

#### Core Components
- **Header** - Navigation header with logo, menu, social links, and music player
- **Footer** - Footer with copyright and credits
- **ThemeToggle** - Dark/light theme switcher

#### Content Components
- **HeroSection** - Homepage hero with book-style display
- **BookCard** - Book display card with download/read options
- **FeatureCard** - Reusable feature/content card
- **QuoteSection** - Inspirational quote display
- **ContactForm** - Contact form with validation

#### Planned Components (To be implemented)
- **DiscourseRow** - Table row for discourse listings
- **ScheduleRow** - Event schedule table row
- **PhotoGallery** - Photo gallery with lightbox
- **VideoGallery** - Video gallery grid
- **LanguageSelector** - Language picker (English/Hindi/Gujarati)
- **MusicPlayer** - Background music player

## Design Guidelines

### Color Scheme
- Primary: Gold/beige gradient (`#d4a574` to `#c8956d`)
- Text: Dark brown (`#3a2317`)
- Background: Light beige (`#f5e6d3`, `#e8d5b7`)
- Uses theme-aware colors for dark mode support

### Typography
- Headers: Bold, traditional serif style
- Body: Clean, readable sans-serif
- Special fonts: 'Noto Sans Devanagari' for Hindi/Sanskrit text

### Layout Principles
- Maximum content width: 1200px
- Responsive design with mobile breakpoints
- Consistent padding and spacing
- Card-based design for content sections

## Features

### Multi-language Support
The website is designed to support three languages:
- English (default)
- Hindi
- Gujarati

Language preferences are saved in user settings.

### Background Music
- Spiritual background music player in header
- Play/stop controls
- Audio continues across page navigation

### Theme Support
- Light/dark mode toggle
- Theme preference saved in user settings
- Automatic color adjustments for accessibility

### Content Management
- Books with download links from fulchandshastri.com
- Discourse videos embedded from YouTube
- Dynamic event schedules
- Photo/video galleries

## External Resources

All media assets (images, videos, PDFs, audio) are hosted on the original website:
- Base URL: https://www.fulchandshastri.com
- Book PDFs: `/books/`
- Images: `/wp-content/uploads/`
- Audio files: `/wp-content/uploads/music/`

## Development Notes

### Data Components
The website uses Data components with loops for dynamic content:
- Books listing
- Discourses table
- Event schedules
- Photo/video galleries

### Accessibility
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- ARIA labels where needed
- High contrast text

### Performance
- Lazy loading for images
- Optimized component rendering
- Minimal external dependencies
- Efficient data fetching

## Future Enhancements

1. **Search Functionality** - Global search across all content
2. **User Accounts** - Personal profiles and saved content
3. **Online Library** - Advanced book reader with bookmarks
4. **Live Streaming** - For discourses and events
5. **Mobile App** - Native mobile experience
6. **Donation Gateway** - Integrated payment system
7. **Newsletter** - Email subscription system
8. **Forum** - Community discussion platform

## Contact

For technical inquiries about the website:
- Email: info@fulchandshastri.com
- Phone: +91 98252 42501

Website designed by ASK Umarala.