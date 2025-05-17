#!/usr/bin/env node

/**
 * This script converts color shade variables from the old 0-100 system to the new 0-1000 system.
 * 
 * In the old system:
 * - 0-50: Light shades (white to base color)
 * - 50: Base color
 * - 51-100: Dark shades (base color to black)
 *
 * In the new system:
 * - 0-100: Light shades (white to base color)
 * - 100: Base color
 * - 100-1000: Dark shades (base color to black)
 * 
 * Usage:
 * node scripts/convert-color-scales.js [target-directory]
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';

// Configuration
const targetDir = process.argv[2] || 'src';
const fileExtensions = ['.tsx', '.jsx', '.ts', '.js'];
const ignoreDirs = ['node_modules', 'dist', 'build', '.git'];

// Old shade scale (0-100) to new shade scale (0-1000) mapping
function mapOldShadeToNewShade(oldShade) {
  // Convert to number if it's a string
  const shade = parseInt(oldShade, 10);
  
  // If the shade is 50, return 'base' to indicate it's the base color
  if (shade === 50) {
    return '';
  }
  
  // If the shade is already in the new scale range (>100), don't convert it again
  if (shade > 100 && shade <= 1000) {
    return shade;
  }
  
  if (shade < 50) {
    // Map 0-49 (light shades) to 0-100
    // 0 -> 0, 5 -> 10, 10 -> 20, ..., 45 -> 90
    return Math.round((shade / 50) * 100);
  } else {
    // Map 51-100 (dark shades) to 200-1000
    // 51 -> ~110, 100 -> 1000
    
    // Calculate percentage through the dark range (51-100)
    const darkRangePercentage = (shade - 50) / 50;
    
    // Map to 200-1000 range
    return Math.round(100 + darkRangePercentage * 900);
  }
}

// Get array of old and new shade numbers for reference
function getShadeMapping() {
  const mapping = [];
  for (let i = 0; i <= 100; i += 5) {
    const newShade = mapOldShadeToNewShade(i);
    mapping.push({ oldShade: i, newShade });
  }
  return mapping;
}

// Common color names to check against
const COMMON_COLOR_NAMES = [
  // Basic colors
  'primary', 'secondary', 'tertiary', 'accent', 'neutral', 'base', 
  // Status colors
  'info', 'success', 'warning', 'error', 'danger',
  // Common color names
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray', 'grey',
  'teal', 'cyan', 'magenta', 'lime', 'brown', 'indigo', 'violet'
];

// Function to check if a name is likely a color name
function isLikelyColorName(name) {
  name = name.toLowerCase();
  
  // Direct match with common color names
  if (COMMON_COLOR_NAMES.includes(name)) {
    return true;
  }
  
  // Check for color-related word endings
  if (name.endsWith('color') || name.endsWith('shade') || name.endsWith('tint') || 
      name.endsWith('tone') || name.endsWith('hue')) {
    return true;
  }
  
  // Check for color name prefixes (like lightBlue, darkRed, etc.)
  const colorPrefixes = ['light', 'dark', 'bright', 'deep', 'pale', 'vivid'];
  for (const prefix of colorPrefixes) {
    if (name.startsWith(prefix) && name.length > prefix.length) {
      const remainingPart = name.substring(prefix.length);
      // Check if the first letter of the remaining part is uppercase (camelCase)
      // or if the remaining part is a common color
      if (
        (remainingPart[0] === remainingPart[0].toUpperCase() && remainingPart[0] !== remainingPart[0].toLowerCase()) ||
        COMMON_COLOR_NAMES.some(color => remainingPart.toLowerCase() === color)
      ) {
        return true;
      }
    }
  }
  
  return false;
}

// Patterns to identify and replace
const patterns = [
  // Direct access to color_shade pattern with word boundary check
  {
    regex: /\b(\w+)_(\d+)\b/g,
    replacement: (match, colorName, shade) => {
      // Check if colorName is likely a color name to avoid replacing other _number patterns
      if (isLikelyColorName(colorName)) {
        const shadeNum = parseInt(shade, 10);
        // Only convert if it's in the old range (0-100)
        if (shadeNum <= 100) {
          const newShade = mapOldShadeToNewShade(shade);
          // If it's the base shade (50), return just the color name
          if (newShade === '') {
            return colorName;
          }
          return `${colorName}_${newShade}`;
        }
      }
      return match;
    }
  },
  
  // Replace color shade access in various formats
  // 1. Direct shade number patterns like primaryColor_50
  {
    regex: /(\w+)Color_(\d+)/g,
    replacement: (match, colorName, shade) => {
      const shadeNum = parseInt(shade, 10);
      // Only convert if it's in the old range (0-100)
      if (shadeNum <= 100) {
        const newShade = mapOldShadeToNewShade(shade);
        return `${colorName}Color_${newShade}`;
      }
      return match;
    }
  },
  
  // 2. colorWithShade function calls like colorWithShade('primary', 30)
  {
    regex: /(colorWithShade\(\s*['"]?([a-zA-Z]+)['"]?\s*,\s*)(\d+)(\s*\))/g,
    replacement: (match, prefix, colorName, shade, suffix) => {
      const shadeNum = parseInt(shade, 10);
      // Only convert if it's in the old range (0-100)
      if (shadeNum <= 100) {
        const newShade = mapOldShadeToNewShade(shade);
        return `${prefix}${newShade}${suffix}`;
      }
      return match;
    }
  },
  
  // 3. getColorShade function calls like getColorShade(baseColor, 70)
  {
    regex: /(getColorShade\(\s*[^,]+\s*,\s*)(\d+)(\s*\))/g,
    replacement: (match, prefix, shade, suffix) => {
      const shadeNum = parseInt(shade, 10);
      // Only convert if it's in the old range (0-100)
      if (shadeNum <= 100) {
        const newShade = mapOldShadeToNewShade(shade);
        return `${prefix}${newShade}${suffix}`;
      }
      return match;
    }
  },
  
  // 4. Specific shade numbers in ShadeNumbers type
  {
    regex: /(export\s+type\s+ShadeNumber\s*=\s*)([\d\s|]+)(;)/g,
    replacement: (match, prefix, oldShades, suffix) => {
      // Split by | and get all shade numbers
      const oldShadeNumbers = oldShades.split('|').map(s => s.trim()).filter(Boolean);
      const newShadeNumbers = oldShadeNumbers.map(shade => {
        if (!isNaN(parseInt(shade, 10))) {
          return mapOldShadeToNewShade(shade);
        }
        return shade;
      });
      
      // Ensure we include all important new shade numbers
      const essentialNewShades = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      essentialNewShades.forEach(shade => {
        if (!newShadeNumbers.includes(shade)) {
          newShadeNumbers.push(shade);
        }
      });
      
      // Sort numerically
      newShadeNumbers.sort((a, b) => a - b);
      
      return `${prefix}${newShadeNumbers.join(' | ')}${suffix}`;
    }
  },
  
  // 5. Array of shade numbers like [10, 20, 30, 40, 50, 60, 70, 80, 90]
  {
    regex: /\[((?:\d+,\s*)+\d+)\]/g,
    replacement: (match, shadeList) => {
      // Only replace if it looks like a list of shade numbers
      if (shadeList.split(',').length >= 5) {
        const shades = shadeList.split(',').map(s => s.trim());
        // Check if these are likely shade values in the old range
        const allAreOldShades = shades.every(s => {
          const num = parseInt(s, 10);
          return !isNaN(num) && num >= 0 && num <= 100;
        });
        
        if (allAreOldShades) {
          const newShades = shades.map(s => mapOldShadeToNewShade(s));
          return `[${newShades.join(', ')}]`;
        }
      }
      return match;
    }
  },
  
  // 6. Update the multiplier config in ShadeGenerator and other places
  {
    regex: /("?)(\d+)("?):\s*{\s*multiplier:\s*([\d.]+)/g,
    replacement: (match, quote1, shade, quote2, multiplier) => {
      const shadeNum = parseInt(shade, 10);
      if (shadeNum >= 0 && shadeNum <= 100) {
        const newShade = mapOldShadeToNewShade(shade);
        return `${quote1}${newShade}${quote2}: { multiplier: ${multiplier}`;
      }
      return match;
    }
  },
  
  // 7. Config object with shade mappings like "50": 0.5
  {
    regex: /("?)(\d+)("?):\s*([\d.]+)/g,
    replacement: (match, quote1, shade, quote2, value) => {
      // Only replace if it's in a config object with shade mappings
      const shadeNum = parseInt(shade, 10);
      if (shadeNum >= 0 && shadeNum <= 100) {
        const newShade = mapOldShadeToNewShade(shade);
        return `${quote1}${newShade}${quote2}: ${value}`;
      }
      return match;
    }
  },
  
  // 8. Function calls with direct shade numbers like getBaseShade(10)
  {
    regex: /(\w+(?:Shade|Color|Theme))\((\d+)\)/g,
    replacement: (match, funcName, shade) => {
      // Check if this looks like a shade-related function
      if (funcName.includes('Shade') || funcName.includes('Color') || funcName.includes('Theme')) {
        const shadeNum = parseInt(shade, 10);
        if (shadeNum <= 100) {
          const newShade = mapOldShadeToNewShade(shade);
          return `${funcName}(${newShade})`;
        }
      }
      return match;
    }
  },
  
  // 9. Colors in string literals like "base_30" or template literals
  {
    regex: /(["'`])([a-zA-Z]+)_(\d+)(\1)/g,
    replacement: (match, quote, colorName, shade, endQuote) => {
      // Match only for common color names inside quotes
      if (isLikelyColorName(colorName)) {
        const shadeNum = parseInt(shade, 10);
        if (shadeNum <= 100) {
          const newShade = mapOldShadeToNewShade(shade);
          // If it's the base shade (50), return just the color name
          if (newShade === '') {
            return `${quote}${colorName}${endQuote}`;
          }
          return `${quote}${colorName}_${newShade}${endQuote}`;
        }
      }
      return match;
    }
  },
  
  // 10. Colors inside template literals with surrounding text
  {
    regex: /(`[^`]*?)([a-zA-Z]+)_(\d+)([^`]*?`)/g,
    replacement: (match, prefix, colorName, shade, suffix) => {
      if (isLikelyColorName(colorName)) {
        // Make sure we're not inside a word (to avoid matching partials)
        const beforeChar = prefix.charAt(prefix.length - 1);
        const afterChar = suffix.charAt(0);
        const isBoundary = /[\s"'{}()[\],.;:+\-=<>]/.test(beforeChar) || beforeChar === '`' || 
                          /[\s"'{}()[\],.;:+\-=<>]/.test(afterChar) || afterChar === '`';
        
        if (isBoundary) {
          const shadeNum = parseInt(shade, 10);
          // Only convert if it's in the old range (0-100)
          if (shadeNum <= 100) {
            const newShade = mapOldShadeToNewShade(shade);
            // If it's the base shade (50), return just the color name
            if (newShade === '') {
              return `${prefix}${colorName}${suffix}`;
            }
            return `${prefix}${colorName}_${newShade}${suffix}`;
          }
        }
      }
      return match;
    }
  }
];

// Find all files
function findFiles(dir) {
  // If targetDir is an individual file, just return it if it has the right extension
  if (fs.existsSync(dir) && fs.statSync(dir).isFile()) {
    const ext = path.extname(dir);
    if (fileExtensions.includes(ext)) {
      return [dir];
    }
    return [];
  }
  
  // Otherwise treat it as a directory
  return glob.sync(`${dir}/**/*.{ts,tsx,js,jsx}`, {
    ignore: ignoreDirs.map(ignoreDir => `${dir}/**/${ignoreDir}/**`)
  });
}

// Process a file
function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Create a modern text processor using an array of replacements
  const { processedContent, debugInfo } = processText(content);
  
  // Write back if changed
  if (processedContent !== originalContent) {
    fs.writeFileSync(filePath, processedContent, 'utf8');
    console.log(`Updated ${filePath}`);
    
    // Print debug info
    if (debugInfo.replacements.length > 0) {
      console.log(`  Replacements made: ${debugInfo.replacements.length}`);
      console.log(`  Iterations needed: ${debugInfo.iterations}`);
      debugInfo.replacements.forEach(({ pattern, from, to }) => {
        console.log(`    - Pattern: ${pattern} | ${from} -> ${to}`);
      });
    }
    
    return true;
  }
  
  return false;
}

// Process text in a single pass to ensure all matches are converted
function processText(text) {
  // Track all replacements for debugging
  const debugInfo = {
    replacements: [],
    iterations: 0
  };
  
  // Group patterns by priority
  const prioritizedPatterns = [
    // High priority - specific function calls and patterns
    patterns.filter(p => 
      p.regex.toString().includes('colorWithShade') || 
      p.regex.toString().includes('getColorShade') || 
      p.regex.toString().includes('ShadeNumber')
    ),
    // Medium priority - specific color patterns
    patterns.filter(p => 
      p.regex.toString().includes('Color_') || 
      (p.regex.toString().includes('_\\d+') && !p.regex.toString().includes('colorWithShade'))
    ),
    // Low priority - more generic patterns
    patterns.filter(p => 
      !p.regex.toString().includes('colorWithShade') && 
      !p.regex.toString().includes('getColorShade') && 
      !p.regex.toString().includes('ShadeNumber') &&
      !p.regex.toString().includes('Color_') &&
      !p.regex.toString().includes('_\\d+')
    ),
  ].flat();
  
  // Make sure we haven't lost any patterns
  if (prioritizedPatterns.length !== patterns.length) {
    console.warn(`Warning: Some patterns might have been lost in prioritization. 
                 Original: ${patterns.length}, Prioritized: ${prioritizedPatterns.length}`);
  }
  
  // Enhanced replacer that works with multiple passes
  const findAndReplace = (input) => {
    let output = input;
    let hasChanges = false;
    
    // Apply each pattern to the entire text
    for (const pattern of prioritizedPatterns) {
      const patternName = pattern.regex.toString().substring(0, 30) + '...'; // Trim for readability
      
      const result = output.replace(pattern.regex, (...args) => {
        // Get replacement result using the pattern's replacement function
        const originalText = args[0];
        const replacement = pattern.replacement(...args);
        
        // If replacement is different from the match, track it and mark that we made changes
        if (replacement !== originalText) {
          hasChanges = true;
          debugInfo.replacements.push({
            pattern: patternName,
            from: originalText,
            to: replacement
          });
        }
        return replacement;
      });
      
      // Update the output with the current pattern's changes
      output = result;
    }
    
    return { result: output, hasChanges };
  };
  
  // Repeat the replacement process until no more changes are detected
  // This ensures that all instances are replaced, even if one replacement
  // creates a new pattern that should be matched by another pattern
  let currentText = text;
  let hasMoreChanges = true;
  let iterations = 0;
  const MAX_ITERATIONS = 5; // Prevent infinite loops
  
  while (hasMoreChanges && iterations < MAX_ITERATIONS) {
    const { result, hasChanges } = findAndReplace(currentText);
    hasMoreChanges = hasChanges;
    currentText = result;
    iterations++;
    debugInfo.iterations = iterations;
  }
  
  return { processedContent: currentText, debugInfo };
}

// Main function
function main() {
  console.log(`Starting conversion of color shade system from 0-100 to 0-1000 in ${targetDir}...`);
  
  // Print the old to new shade mapping for reference
  console.log('\nShade Mapping (Old -> New):');
  const mapping = getShadeMapping();
  mapping.forEach(({ oldShade, newShade }) => {
    console.log(`  ${oldShade.toString().padStart(3, ' ')} -> ${newShade.toString().padStart(4, ' ')}`);
  });
  console.log('');
  
  // Find all matching files
  const files = findFiles(targetDir);
  console.log(`Found ${files.length} files to process`);
  
  // Process each file
  let filesUpdated = 0;
  files.forEach(file => {
    try {
      const updated = processFile(file);
      if (updated) filesUpdated++;
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  });
  
  console.log(`\nConversion complete. Updated ${filesUpdated} files.`);
  
  // Print next steps
  console.log('\nNext steps:');
  console.log('1. Review changes in key files like:');
  console.log('   - src/lib/styles/index.ts (ShadeNumber type)');
  console.log('   - src/lib/styles/colorUtils.ts (getColorShade and generateColorPalette functions)');
  console.log('2. Update any UI components that display color shades to use the new scale');
  console.log('3. Run tests to ensure color functionality still works correctly');
  console.log('4. Visually check your application to ensure colors appear as expected');
}

main(); 

// node scripts/convert-color-scales.js
// or
// node scripts/convert-color-scales.js src/components