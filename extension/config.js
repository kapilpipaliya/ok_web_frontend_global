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
    QUICK_ADD: "/extension/quick-add",
    HOME: "/home",
    CONTENT: "/content",
    FAVOURITES: "/content?type=favourites",
    ACCOUNTS: "/accounts"
  },

  // Badge Configuration
  BADGE: {
    LOGGED_IN: {
      text: "",
      color: "#27ae60"
    },
    LOGGED_OUT: {
      text: "!",
      color: "#e74c3c"
    }
  },

  // Update Intervals (in milliseconds)
  INTERVALS: {
    BADGE_UPDATE: 5 * 60 * 1000  // 5 minutes
  },

  // Cookie Names (for authentication check)
  COOKIE_PATTERNS: ["session", "auth", "token"],

  // Floating Button Configuration
  FLOATING_BUTTON: {
    POSITION: {
      bottom: "80px",
      right: "24px"
    },
    TEXT: "Save to YSaar",
    COLORS: {
      primary: "#3498db",
      hover: "#2980b9",
      text: "#ffffff"
    }
  },

  // Notification Configuration
  NOTIFICATION: {
    DURATION: 3000,  // 3 seconds
    POSITION: {
      bottom: "24px",
      right: "24px"
    }
  },

  // Auto-close Configuration
  QUICK_ADD: {
    SUCCESS_AUTO_CLOSE_DELAY: 2000  // 2 seconds
  }
};

// Helper function to build full URLs
EXTENSION_CONFIG.getUrl = function(route) {
  return `${this.DOMAIN}${route}`;
};

// Helper function to get quick-add URL with parameters
EXTENSION_CONFIG.getQuickAddUrl = function(type, url, id) {
  const route = this.ROUTES.QUICK_ADD;
  return `${this.DOMAIN}${route}?type=${type}&url=${encodeURIComponent(url)}&id=${id}`;
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EXTENSION_CONFIG;
}
