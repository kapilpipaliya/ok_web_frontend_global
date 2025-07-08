import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Get all TypeScript and TSX files
const findFiles = () => {
  const cmd =
    "find src -type f -name '*.ts*' | grep -v 'node_modules' | xargs grep -l 'SETTINGS_CONSTANTS\\|STYLES\\|PROPERTIES\\.Css'";
  const files = execSync(cmd).toString().trim().split("\n");
  return files;
};

// Patterns to match
const patterns = [
  // Fix: css: (args: FunctionArgumentType) => SETTINGS_CONSTANTS.XXX_CSS(args)
  {
    pattern:
      /(css\s*:\s*)\(\s*(?:args|options)(?::\s*\w+)?\s*\)\s*=>\s*(\w+(?:\.\w+)*?)\.(\w+(?:\.\w+)*?)(?:\(\s*(?:args|options)\s*\))/g,
    replacement: "$1$2.$3",
  },
  // Fix: css={args => STYLES.XXX(args)}
  {
    pattern:
      /(css\s*=\s*{\s*)(?:args|options)(?::\s*\w+)?\s*=>\s*(\w+(?:\.\w+)*?)\.(\w+(?:\.\w+)*?)(?:\(\s*(?:args|options)\s*\))/g,
    replacement: "$1$2.$3",
  },
  // Fix CSS in array: css={[args => STYLES.XXX(args), ...]}
  {
    pattern:
      /(css\s*=\s*\[\s*)(?:args|options)(?::\s*\w+)?\s*=>\s*(\w+(?:\.\w+)*?)\.(\w+(?:\.\w+)*?)(?:\(\s*(?:args|options)\s*\))/g,
    replacement: "$1$2.$3",
  },
  // Fix CSS in array in attribute: css: (args) => [STYLES.XXX(args), ...]
  {
    pattern:
      /(css\s*:\s*)\(\s*(?:args|options)(?::\s*\w+)?\s*\)\s*=>\s*\[\s*(\w+(?:\.\w+)*?)\.(\w+(?:\.\w+)*?)(?:\(\s*(?:args|options)\s*\))/g,
    replacement: "$1[$2.$3",
  },
  // Fix attributes like arrowCss={args => STYLES.tooltip.arrowCss(args)}
  {
    pattern:
      /(\w+Css\s*=\s*{\s*)(?:args|options)(?::\s*\w+)?\s*=>\s*(\w+(?:\.\w+)*?)\.(\w+(?:\.\w+)*?)(?:\(\s*(?:args|options)\s*\))/g,
    replacement: "$1$2.$3",
  },
  // Fix STYLES.iconButtonCss() with no args
  {
    pattern: /(\w+(?:\.\w+)*?)\.(\w+(?:\.\w+)*?)\(\)/g,
    replacement: "$1.$2",
  },
  // Fix prop patterns like triggerCss={[...ensureArray(local.css), local.noCenter ? "" : STYLES.iconButtonCss()]}
  {
    pattern:
      /(triggerCss\s*=\s*\[\s*.*?\s*:\s*""?\s*:\s*)(\w+(?:\.\w+)*?)\.(\w+(?:\.\w+)*?)\(\)/g,
    replacement: "$1$2.$3",
  },
  // Fix more complex array patterns
  {
    pattern:
      /(css\s*=\s*\[\s*.*?,\s*)(?:args|options)(?::\s*\w+)?\s*=>\s*(\w+(?:\.\w+)*?)\.(\w+(?:\.\w+)*?)(?:\(\s*(?:args|options)\s*\))/g,
    replacement: "$1$2.$3",
  },
  // Fix function calls in arrays with ...ensureArray pattern
  {
    pattern:
      /(css\s*=\s*\[\s*\.\.\.ensureArray\(\w+\.\w+\),\s*)(?:args|options)(?::\s*\w+)?\s*=>\s*(\w+(?:\.\w+)*?)\.(\w+(?:\.\w+)*?)(?:\(\s*(?:args|options)\s*\))/g,
    replacement: "$1$2.$3",
  },
  // Fix ${PROPERTIES.Css.TextFieldCss(args)} inside template literals
  {
    pattern: /\$\{(\w+(?:\.\w+)*?)\.(\w+(?:\.\w+)*?)\((?:args|options)\)\}/g,
    replacement: "${$1.$2}",
  },
  // Fix css={(args) => css` with theme interpolations
  {
    pattern:
      /(css\s*=\s*\{)(?:\s*\((?:args|options)(?::\s*[^)]+)?\)\s*=>\s*css)(`[\s\S]+?\$\{)(?:args|options)\.theme/g,
    replacement: "$1css$2\\${args.theme",
  },
  // Fix css: (args) => css` with theme interpolations
  {
    pattern:
      /(css\s*:\s*)(?:\s*\((?:args|options)(?::\s*[^)]+)?\)\s*=>\s*css)(`[\s\S]+?\$\{)(?:args|options)\.theme/g,
    replacement: "$1css$2\\${args.theme",
  },
  // Fix other args calls inside curly props
  {
    pattern:
      /(\w+\s*:\s*\((?:args|options)[^\)]*\)\s*=>\s*)(\w+(?:\.\w+)*?)\.(\w+(?:\.\w+)*?)(?:\(\s*(?:args|options)\s*\))/g,
    replacement: "$1$2.$3",
  },
  // Fix raw template literals with args references
  {
    pattern:
      /(css\s*=\s*\{)(?:\(args\)\s*=>\s*\[)?css(`[\s\S]*?\$\{)(args\.theme\.var\.color\.[^}]+?)(\}[\s\S]*?`)/g,
    replacement: "$1css$2\\${$3}$4",
  },
  // Fix template literals with missing escape for args.theme
  {
    pattern: /(css\s*=\s*css`[\s\S]*?)\$\{args\.theme/g,
    replacement: "$1\\${args.theme",
  },
  // Fix template literals in div properties
  {
    pattern: /(css\s*=\s*\{)(?:\(args\)\s*=>\s*)css(`[\s\S]*?`)/g,
    replacement: "$1css$2",
  },
];

// Process each file
const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let hasChanges = false;

  // Apply all patterns
  patterns.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      hasChanges = true;
      content = newContent;
    }
  });

  // Write changes if needed
  if (hasChanges) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated: ${filePath}`);
    return 1;
  }
  return 0;
};

// Main execution
try {
  const files = findFiles();
  console.log(`Found ${files.length} files to process`);

  let updatedCount = 0;
  files.forEach((file) => {
    try {
      updatedCount += processFile(file);
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });

  console.log(`Updated ${updatedCount} files out of ${files.length}`);
} catch (error) {
  console.error("Error:", error.message);
}
