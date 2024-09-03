import { expect, Locator, Page, test } from '@playwright/test';
import { capitalize, toPascal } from "case-switcher-js";
import fs from 'fs';
import path from 'path';

import { generateIndexFile } from '../functions/generateIndexFile';

async function getNextSiblingDiv(locator: Locator): Promise<Locator> {
    await locator.click();
    const nextSiblingLocator = locator.locator('xpath=./following-sibling::div[1]');

    // Validate that the next sibling is a div
    await expect(nextSiblingLocator).toHaveJSProperty('tagName', 'DIV', {});

    return nextSiblingLocator;
}

test('save corvu properties', async ({ page }) => {
    await page.goto('https://corvu.dev/docs/');
    const componentDetails = await page.getByText('Primitives', { exact: true });
    const componentsDiv = await getNextSiblingDiv(componentDetails);
    const componentLinks = await componentsDiv.locator('a').all();

    const componentNameToUrlMap: Record<string, string> = {};

    for (const link of componentLinks) {
        const linkText = await link.textContent();
        console.log(`Component: ${linkText}`);

        const componentUrl = await link.getAttribute('href');
        const urlParts = componentUrl!.split('/').filter(Boolean);
        const lastPart = urlParts[urlParts.length - 1];
        const componentName = toPascal(capitalize(linkText!.trim()));
        componentNameToUrlMap[componentName] = lastPart;

        await link.click();
        await expect(page.getByRole('heading', { exact: true, name: linkText?.trim() })).toBeVisible();
        await extractComponentData(page, componentName);
    }

    // Save the componentName to URL map to a separate file
    const urlMapFilePath = path.join('src', 'cypher', 'mutate', 'sync', 'component_properties', 'corvu-components.ts');
    const urlMapContent = `export const corvuComponentUrls = ${JSON.stringify(componentNameToUrlMap, null, 2)};\n`;
    fs.writeFileSync(urlMapFilePath, urlMapContent.trim());
    console.log(`Component name to URL map created: ${urlMapFilePath}`);

    generateIndexFile(['src', 'cypher', 'mutate', 'sync', 'component_properties', 'corvu']);
});

async function extractComponentData(page: Page, name: string) {
    const tables = await page.locator('table:has(th:has-text("Property") + th:has-text("Default") + th:has-text("Type/Description"))').all();

    let fileContent = '';
    const componentDetailsMap = new Map();

    for (const table of tables) {
        const tableHeader = await table.locator('xpath=./ancestor::*[4]//h3');
        await tableHeader.click();
        const tableHeaderText = await tableHeader.textContent();

        const secondSibling = await tableHeader.locator('xpath=./following-sibling::*[2]');
        const tableHeaderLink = await secondSibling.evaluate((el) => el.getAttribute('href'));
        const tableHeaderHashText = tableHeaderLink ? tableHeaderLink.split('#')[1] : '';
        const cleanedTableHeaderText = tableHeaderText ? tableHeaderText.replace(/[</>]/g, '').trim() : '';
        const rows = table.locator('tr');
        const componentDetails = await rows.evaluateAll((rows) => {
            return rows.slice(1).map(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length === 3) {
                    const typeNode = cells[2].querySelector('.font-mono');
                    const descriptionNode = cells[2].querySelector('.prose');
                    return {
                        componentName: typeNode ? typeNode.textContent?.trim() || '' : '',
                        default: cells[1].textContent?.trim() || '',
                        description: descriptionNode ? descriptionNode.textContent?.trim() || '' : '',
                        key: cells[0].textContent?.trim() || ''
                    };
                }
                return null;
            }).filter(Boolean);
        });

        let variableName = name;
        if (cleanedTableHeaderText && name !== cleanedTableHeaderText) {
            const cleanedHeaderText = cleanedTableHeaderText.replace(/Root$/, '');
            if (cleanedHeaderText) {
                variableName += cleanedHeaderText;
            }
        }

        const componentDetailsModified = componentDetails.map(item => ({
            ...item,
            corvu: true,
            hashName: tableHeaderHashText,
        }));
        if (componentDetailsMap.has(variableName)) {
            componentDetailsMap.set(variableName, [...componentDetailsMap.get(variableName), ...componentDetailsModified]);
        } else {
            componentDetailsMap.set(variableName, componentDetailsModified);
        }
    }

    for (const [variableName, componentDetails] of componentDetailsMap) {
        fileContent += `export const ${variableName} = ${JSON.stringify(componentDetails, null, 2)};\n\n`;
    }

    const fileName = `${name}.ts`;
    const dirPath = path.join('src', 'cypher', 'mutate', 'sync', 'component_properties', 'corvu');

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, fileName);
    fs.writeFileSync(filePath, fileContent.trim());
    console.log(`File created: ${filePath}`);
}
