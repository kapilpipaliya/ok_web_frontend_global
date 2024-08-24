import fs from 'fs';
import path from 'path';

export function generateIndexFile(pathArray: string[]) {
    const dirPath = path.join(...pathArray);
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.ts') && file !== 'index.ts');

    let indexContent = '';
    let componentsObject = '';

    files.forEach(file => {
        const componentName = path.basename(file, '.ts');
        indexContent += `import * as ${componentName} from './${componentName}';\n`;
        componentsObject += `  ...${componentName},\n`;
    });

    indexContent += '\nconst components = {\n' + componentsObject + '};\n\nexport default components;\n';

    const indexPath = path.join(dirPath, 'index.ts');
    fs.writeFileSync(indexPath, indexContent);
    console.log(`Index file created: ${indexPath}`);
}
