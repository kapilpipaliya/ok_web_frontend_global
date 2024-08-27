import { expect, Locator, Page, test } from '@playwright/test';
import { capitalize, toPascal } from "case-switcher-js";
import fs from 'fs';
import path from 'path';

import { generateIndexFile } from './functions/generateIndexFile';

async function getNextSiblingDiv(locator: Locator): Promise<Locator> {
    await locator.click();
    const nextSiblingLocator = locator.locator('xpath=./following-sibling::ul[1]');
    
    // Validate that the next sibling is a div
    await expect(nextSiblingLocator).toHaveJSProperty('tagName', 'UL', {});
    
    return nextSiblingLocator;
}

test('save kobalte properties', async ({ page }) => {
  await page.goto('https://kobalte.dev/docs/core/overview/introduction/');
  
  const componentDetails = await page.getByRole('heading', { exact: true, name: 'Components' });
  const componentsDiv = await getNextSiblingDiv(componentDetails);
  const componentLinks = await componentsDiv.locator('a').all();
  
  const ignoredFiles = fs.readdirSync(path.join('src', 'cypher', 'mutate', 'sync', 'component_properties', 'corvu'))
                         .map(file => file.replace('.ts', ''));

  for (const link of componentLinks) {
    const linkTextContent = (await link.textContent())!.trim().replace(/new$/, '')
    const linkText = toPascal(capitalize(linkTextContent));
    if (ignoredFiles.includes(linkText!.trim())) {
      console.log(`Ignoring component: ${linkText}`);
      continue;
    }
    
    await link.click();
    await expect(page).toHaveTitle(new RegExp(`^${linkTextContent}`), { timeout: 5000 });
    await extractComponentData(page, linkText);
  }

  generateIndexFile(['src', 'cypher', 'mutate', 'sync', 'component_properties', 'kobalte']);
});

async function extractComponentData(page: Page, name: string) {
    const tables = await page.locator('table:has(th:has-text("Prop") + th:has-text("Description"))').all();
    
    let fileContent = '';
    const componentDetailsMap = new Map();

    for (const table of tables) {
        const tableHeaderText = await table.locator('xpath=./parent::*/preceding-sibling::h3[position()=1 or position()=2][1]').textContent();
        const cleanedTableHeaderText = tableHeaderText ? tableHeaderText.replace(/[<./>]/g, '').trim() : '';
        const rows = table.locator('tr');
        const componentDetails = await rows.evaluateAll((rows) => {
            return rows.slice(1).map(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length === 2) {
                    const typeNode = cells[1].querySelector('.kb-code');
                    const type = typeNode ? typeNode.textContent?.trim() || '' : '';
                    typeNode?.remove();
                    const descriptionNode = cells[1];
                    return {
                        componentName: type,
                        description: descriptionNode ? descriptionNode.textContent?.trim() || '' : '',
                        property: cells[0].textContent?.trim() || ''
                    };
                }
                return null;
            }).filter(Boolean);
        });

        const variableName = cleanedTableHeaderText;

        if (componentDetailsMap.has(variableName)) {
            componentDetailsMap.set(variableName, [...componentDetailsMap.get(variableName), ...componentDetails]);
        } else {
            componentDetailsMap.set(variableName, componentDetails);
        }
    }
    if (componentDetailsMap.size === 0) {
        fileContent += `export const ${name} = [];\n\n`;
    } else {
        for (const [variableName, componentDetails] of componentDetailsMap) {
            fileContent += `export const ${variableName} = ${JSON.stringify(componentDetails, null, 2)};\n\n`;
        }
    }

    const fileName = `${name}.ts`;
    const dirPath = path.join('src', 'cypher', 'mutate', 'sync', 'component_properties', 'kobalte');
    
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const filePath = path.join(dirPath, fileName);
    fs.writeFileSync(filePath, fileContent.trim());
    console.log(`File created: ${filePath}`);
}
