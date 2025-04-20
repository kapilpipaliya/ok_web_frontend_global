// Test file for color conversion
const colors = {
  // Color_Shade format
  primaryColor_50: '#3b82f6',
  secondaryColor_0: '#ffffff',
  accentColor_100: '#000000',
  
  // color_shade format
  primary_0: '#ffffff',
  base_5: '#f8f9fa',
  base_10: '#f1f3f5',
  base_50: '#1e293b',
  error_90: '#7f1d1d',
  
  // Function calls
  getShade1: () => getColorShade(baseColor, 70),
  getShade2: () => colorWithShade('primary', 30),
  
  // Array of shades
  shades: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
};

// Shade config
const config = {
  "0": 1.0,
  "5": 0.95,
  "10": 0.9,
  "50": 0.5,
  "90": 0.1,
  "100": 0
};

// Theme examples
const getBaseShade = (shade) => `base_${shade}`;
const getPrimaryShade = (shade) => `primary_${shade}`;

// String interpolation examples - these should be converted
console.log(getBaseShade(10));
console.log(getPrimaryShade(50));
console.log(`The base color at 30% is base_30`);
console.log(`Dark error is error_90`);

// Template example with functions
const template = `
  <div class="primary_20 base_50">
    <span class="error_80">Error message</span>
  </div>
`; 