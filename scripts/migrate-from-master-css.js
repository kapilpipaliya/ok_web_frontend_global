#!/usr/bin/env node

/**
 * This script helps migrate from Master CSS to CSS-in-JS
 * 
 * Usage:
 * node scripts/migrate-from-master-css.js <target-directory>
 */

import fs from 'fs';
import path from 'path';

// Configuration
const targetDir = process.argv[2] || 'src';
const fileExtensions = ['.tsx', '.jsx', '.ts', '.js'];
const ignoreDirs = ['node_modules', 'dist', 'build', '.git'];

// Common CSS properties that should be handled directly
const cssProperties = [
  'width', 'height', 'padding', 'margin', 'display', 'position', 'top', 
  'right', 'bottom', 'left', 'z-index', 'flex', 'gap', 'border', 'color',
  'background-color', 'font-size', 'font-weight', 'text-align', 'opacity',
  'transform', 'transition', 'cursor', 'overflow', 'border-radius'
];

// Convert Master CSS class to direct CSS string
function masterCssToCssString(masterCssClass) {
  const properties = [];
  
  // Split by spaces to get individual class parts
  const classParts = masterCssClass.split(/\s+/);
  
  classParts.forEach(part => {
    // Parse the Master CSS class part
    if (part.includes(':')) {
      const [property, value] = part.split(':');
      
      // Replace pipe characters with spaces in all values
      const cleanValue = value.replace(/\|/g, ' ');
      
      switch (property) {
        // Layout
        case 'p': properties.push(`padding: ${value}px;`); break;
        case 'px': properties.push(`padding-left: ${value}px; padding-right: ${value}px;`); break;
        case 'py': properties.push(`padding-top: ${value}px; padding-bottom: ${value}px;`); break;
        case 'm': properties.push(`margin: ${value}px;`); break;
        case 'mx': properties.push(`margin-left: ${value}px; margin-right: ${value}px;`); break;
        case 'my': properties.push(`margin-top: ${value}px; margin-bottom: ${value}px;`); break;
        case 'w': properties.push(`width: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'h': properties.push(`height: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'min-w': properties.push(`min-width: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'min-h': properties.push(`min-height: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'max-w': properties.push(`max-width: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'max-h': properties.push(`max-height: ${value.includes('%') ? value : `${value}px`};`); break;
        
        // Display & Position
        case 'display': properties.push(`display: ${cleanValue};`); break;
        case 'd': properties.push(`display: ${cleanValue};`); break;
        case 'position': properties.push(`position: ${cleanValue};`); break;
        case 'top': properties.push(`top: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'right': properties.push(`right: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'bottom': properties.push(`bottom: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'left': properties.push(`left: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'z': 
        case 'z-index': properties.push(`z-index: ${value};`); break;
        
        // Flexbox
        case 'flex': properties.push('display: flex;'); break;
        case 'flex-direction': properties.push(`flex-direction: ${cleanValue};`); break;
        case 'jc': 
          switch(value) {
            case 'center': properties.push('justify-content: center;'); break;
            case 'space-between': properties.push('justify-content: space-between;'); break;
            case 'space-around': properties.push('justify-content: space-around;'); break;
            case 'flex-start': properties.push('justify-content: flex-start;'); break;
            case 'flex-end': properties.push('justify-content: flex-end;'); break;
            default: properties.push(`justify-content: ${cleanValue};`);
          }
          break;
        case 'ai':
          switch(value) {
            case 'center': properties.push('align-items: center;'); break;
            case 'flex-start': properties.push('align-items: flex-start;'); break;
            case 'flex-end': properties.push('align-items: flex-end;'); break;
            case 'baseline': properties.push('align-items: baseline;'); break;
            case 'stretch': properties.push('align-items: stretch;'); break;
            default: properties.push(`align-items: ${cleanValue};`);
          }
          break;
          
        // Grid
        case 'grid': properties.push('display: grid;'); break;
        case 'grid-cols': properties.push(`grid-template-columns: repeat(${value}, 1fr);`); break;
        case 'grid-template-cols': properties.push(`grid-template-columns: ${cleanValue.replace(/\|/g, ' ')};`); break;
        case 'gap': 
          if (value.includes('|')) {
            const [rowGap, columnGap] = value.split('|');
            properties.push(`gap: ${rowGap}px ${columnGap}px;`);
          } else {
            properties.push(`gap: ${value}px;`);
          }
          break;
        case 'gap-x': properties.push(`column-gap: ${value}px;`); break;
        case 'gap-y': properties.push(`row-gap: ${value}px;`); break;
        
        // Typography
        case 'color': 
        case 'fg': 
          if (value.includes('-')) {
            const [colorName, shadePart] = value.split('-');
            properties.push(`color: ${colorName === 'base' ? '#1e293b' : '#3b82f6'};`);
          } else {
            properties.push(`color: ${cleanValue};`);
          }
          break;
        case 'bg': 
          if (value.includes('-')) {
            const [colorName, shadePart] = value.split('-');
            properties.push(`background-color: ${colorName === 'base' ? '#1e293b' : '#3b82f6'};`);
          } else {
            properties.push(`background-color: ${cleanValue};`);
          }
          break;
        case 'font-weight': properties.push(`font-weight: ${cleanValue};`); break;
        case 'font-size': properties.push(`font-size: ${value}px;`); break;
        case 'f': properties.push(`font-size: ${value}px;`); break;
        case 'font': properties.push(`font-size: ${value}px;`); break;
        case 'text-align': properties.push(`text-align: ${cleanValue};`); break;
        case 'text': properties.push(`white-space: ${cleanValue};`); break;
        
        // Borders & Radius
        case 'r': properties.push(`border-radius: ${value}px;`); break;
        case 'border-radius': properties.push(`border-radius: ${cleanValue};`); break;
        case 'border': 
          if (value.includes('|')) {
            const parts = value.split('|');
            if (parts.length === 3) {
              properties.push(`border: ${parts[0]} ${parts[1]} #3b82f6;`);
            } else {
              properties.push(`border: ${cleanValue};`);
            }
          } else {
            properties.push(`border: ${value}px solid;`);
          }
          break;
        case 'bl': // border-left
          if (value.includes('|')) {
            const parts = value.split('|');
            if (parts.length === 3) {
              properties.push(`border-left: ${parts[0]} ${parts[1]} ${parts[2]};`);
            } else {
              properties.push(`border-left: ${cleanValue};`);
            }
          } else if (value === 'none') {
            properties.push('border-left: none;');
          } else {
            properties.push(`border-left: ${value}px solid;`);
          }
          break;
        case 'br': // border-right
          if (value.includes('|')) {
            const parts = value.split('|');
            if (parts.length === 3) {
              properties.push(`border-right: ${parts[0]} ${parts[1]} ${parts[2]};`);
            } else {
              properties.push(`border-right: ${cleanValue};`);
            }
          } else if (value === 'none') {
            properties.push('border-right: none;');
          } else {
            properties.push(`border-right: ${value}px solid;`);
          }
          break;
        case 'b': 
          if (value.includes('|')) {
            const parts = value.split('|');
            if (parts.length === 3) {
              properties.push(`border: ${parts[0]} ${parts[1]} #3b82f6;`);
            } else {
              properties.push(`border: ${cleanValue};`);
            }
          } else {
            properties.push(`border: ${value}px solid;`);
          }
          break;
        case 'border-top': 
          if (value.includes('|')) {
            const parts = value.split('|');
            if (parts.length === 3) {
              properties.push(`border-top: ${parts[0]} ${parts[1]} #3b82f6;`);
            } else {
              properties.push(`border-top: ${cleanValue};`);
            }
          } else {
            properties.push(`border-top: ${value}px solid;`);
          }
          break;
          
        // Other
        case 'cursor': properties.push(`cursor: ${cleanValue};`); break;
        case 'opacity': properties.push(`opacity: ${cleanValue};`); break;
        case 'box-shadow': properties.push(`box-shadow: ${cleanValue};`); break;
        case 'transform': properties.push(`transform: ${cleanValue};`); break;
        case 'transition': properties.push(`transition: ${cleanValue};`); break;
        case 'overflow': properties.push(`overflow: ${cleanValue};`); break;
        case 'mt': properties.push(`margin-top: ${value}px;`); break;
        case 'mb': properties.push(`margin-bottom: ${value}px;`); break;
        case 'ml': properties.push(`margin-left: ${value}px;`); break;
        case 'mr': properties.push(`margin-right: ${value}px;`); break;
        case 'pt': properties.push(`padding-top: ${value}px;`); break;
        case 'pb': properties.push(`padding-bottom: ${value}px;`); break;
        case 'pl': properties.push(`padding-left: ${value}px;`); break;
        case 'pr': properties.push(`padding-right: ${value}px;`); break;
        
        default:
          // Check if it's a common CSS property
          if (cssProperties.includes(property)) {
            properties.push(`${property}: ${cleanValue};`);
          } else {
            // For unknown properties, add a comment
            properties.push(`/* ${property}: ${cleanValue}; */`);
          }
      }
    } else if (part === 'hidden') {
      properties.push('display: none;');
    } else if (part === 'block') {
      properties.push('display: block;');
    } else if (part === 'flex') {
      properties.push('display: flex;');
    } else if (part === 'grid') {
      properties.push('display: grid;');
    } else if (part === 'inline') {
      properties.push('display: inline;');
    } else if (part === 'inline-block') {
      properties.push('display: inline-block;');
    } else if (part === 'inline-flex') {
      properties.push('display: inline-flex;');
    } else if (part === 'none') {
      properties.push('display: none;');
    } else if (part !== '') {
      // For unknown single properties, add a comment
      properties.push(`/* ${part} */`);
    }
  });
  
  // Create the CSS string with template literals
  return `\`
  ${properties.join('\n  ')}
\``;
}

// Patterns to identify and replace
const patterns = [
  // Replace className and class attributes with css using template literals
  {
    regex: /\s(class|className)=\{`([^`]+)`\}/g,
    replacement: (match, attrName, classValue) => ` css={css${masterCssToCssString(classValue)}}`
  },
  {
    regex: /\s(class|className)="([^"]+)"/g,
    replacement: (match, attrName, classValue) => ` css={css${masterCssToCssString(classValue)}}`
  },
  {
    regex: /\s(class|className)=\{([^{}]+)\}/g,
    replacement: (match, attrName, classValue) => {
      // For dynamic class values, we need a different approach
      // For now, just add a comment to manually fix these
      return ` /* TODO: Manually convert this dynamic class: ${match} */ ${match}`;
    }
  },
  
  // Convert HTML elements with class to As components while preserving the original tag
  {
    regex: /<(div|span|button|input|h1|h2|h3|h4|h5|h6|p|a|ul|ol|li|table|tr|td|th|thead|tbody|form|label|select|option|textarea|img|video|audio|iframe|nav|header|footer|main|section|article|aside|canvas|figure|figcaption)([^>]*?)(class|className)=["']([^"']+)["']([^>]*?)>/g,
    replacement: (match, tag, beforeAttr, attrName, className, afterAttr) => 
      `<As as="${tag}"${beforeAttr}${afterAttr} css={css${masterCssToCssString(className)}}>`
  },
  
  // Handle dynamic class expressions
  {
    regex: /<(div|span|button|input|h1|h2|h3|h4|h5|h6|p|a|ul|ol|li|table|tr|td|th|thead|tbody|form|label|select|option|textarea|img|video|audio|iframe|nav|header|footer|main|section|article|aside|canvas|figure|figcaption)([^>]*?)(class|className)=\{`([^`]+)`\}([^>]*?)>/g,
    replacement: (match, tag, beforeAttr, attrName, className, afterAttr) => 
      `<As as="${tag}"${beforeAttr}${afterAttr} css={css${masterCssToCssString(className)}}>`
  },
  
  // Replace closing tags with As closing tags - only if they match an opening As tag
  {
    regex: /<\/(div|span|button|input|h1|h2|h3|h4|h5|h6|p|a|ul|ol|li|table|tr|td|th|thead|tbody|form|label|select|option|textarea|img|video|audio|iframe|nav|header|footer|main|section|article|aside|canvas|figure|figcaption)>/g,
    replacement: (match, tag) => `</As>` 
  },
  
  // Replace schema class properties with css using template literals
  {
    regex: /class:\s*['"]([^'"]+)['"]/g,
    replacement: (match, p1) => `css: () => css${masterCssToCssString(p1)}`
  },
  
  // Replace schema class properties that reference constants with css functions
  {
    regex: /class:\s*([A-Za-z0-9_.]+)/g,
    replacement: (match, p1) => {
      // Replace CLASS with CSS in constant references (e.g., STYLES.button.CLASS -> STYLES.button.CSS)
      const newRef = p1.replace(/\.CLASS$/, '.CSS')
                       .replace(/CLASS/g, 'CSS');
      return `css: () => ${newRef}`;
    }
  }
];

// Missing imports to add
const imports = {
  'As': 'import { As } from "~/components/As";',
  'css': 'import { css } from "~/lib/styles";'
};

// Find all files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !ignoreDirs.includes(file)) {
      findFiles(filePath, fileList);
    } else if (stat.isFile() && fileExtensions.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Process a file
function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Apply all patterns
  patterns.forEach(pattern => {
    content = content.replace(pattern.regex, pattern.replacement);
  });
  
  // Check if file needs imports added
  let needsAsImport = content.includes('<As ') && !content.includes('import { As }');
  let needsCssImport = content.includes('css={css`') && !content.includes('import { css }');
  
  // Add imports if needed
  if (needsAsImport || needsCssImport) {
    // Find a good place to add imports
    const importStatements = [];
    if (needsAsImport) importStatements.push(imports.As);
    if (needsCssImport) importStatements.push(imports.css);
    
    // Find last import
    const lastImportMatch = content.match(/^import.*?from.*?;/gms);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
      content = content.slice(0, lastImportIndex) + '\n' + importStatements.join('\n') + content.slice(lastImportIndex);
    } else {
      // No imports found, add at top
      content = importStatements.join('\n') + '\n\n' + content;
    }
  }
  
  // Write back if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
    return true;
  }
  
  return false;
}

// Main function
function main() {
  console.log(`Starting migration from Master CSS to CSS-in-JS in ${targetDir}...`);
  
  // Find all matching files
  const files = findFiles(path.resolve(targetDir));
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
  
  console.log(`Migration complete. Updated ${filesUpdated} files.`);
  
  // Print next steps
  console.log('\nNext steps:');
  console.log('1. Run "npm uninstall @master/css @master/css-runtime @master/css-server @master/eslint-plugin-css"');
  console.log('2. Check for any remaining references to Master CSS');
  console.log('3. Run your tests and fix any styling issues');
  console.log('4. Check for "TODO" comments added to complex dynamic classes that need manual conversion');
}

main(); 

// node scripts/migrate-from-master-css.js src