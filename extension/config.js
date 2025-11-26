// YSaar Chrome Extension Configuration
// Centralized configuration file for easy domain and settings management

const EXTENSION_CONFIG = {
  // Domain Configuration
  // Change this to your production domain or localhost for development
  // DOMAIN: "https://ysaar.com",
  DOMAIN: "https://ytorganizer.localhost.com:3001",

  // Alternative domains for different environments
  // Uncomment the one you want to use:
  // DOMAIN: "http://localhost:3000",
  // DOMAIN: "https://staging.ysaar.com",
  // DOMAIN: "https://dev.ysaar.com",

  // Extension Routes
  ROUTES: {
    HOME: "/home",
    CONTENT: "/content",
    FAVOURITES: "/content?type=favourites",
    ACCOUNTS: "/accounts"
  }
};

// Helper function to build full URLs
EXTENSION_CONFIG.getUrl = function(route) {
  return `${this.DOMAIN}${route}`;
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EXTENSION_CONFIG;
}
