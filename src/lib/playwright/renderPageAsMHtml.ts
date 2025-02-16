import { Session } from "neo4j-driver";
import { BrowserContext, chromium, Page } from "playwright";

import { uploadFiles } from "~/server/upload/uploadFile";


export interface SendPageOptions {
  neo4jSession: Session;
  pageName: string;
  queryParams?: Record<string, string>;
  subDomain: string;
}

export async function renderPageAsMHtml({
  neo4jSession,
  pageName,
  queryParams = {},
  subDomain,
}: SendPageOptions) {
  let browser;

  try {
    const { browser: newBrowser, context, page } = await setupBrowserAndPage(pageName, queryParams, subDomain);
    browser = newBrowser;

    const snapshotData = await capturePageSnapshot(page, context);
    const fileName = `${pageName}.mhtml`;

    const { result } = await uploadFiles([{ data: snapshotData as unknown as Buffer, filename: fileName, label: "Email" }], subDomain, neo4jSession);
    if (result.length === 0) {
      throw new Error("Failed to send email");
    }
    return { result, success: true };
  } catch (error) {
    console.error("Error rendering page and sending email:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      success: false,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function capturePageSnapshot(page: Page, context: BrowserContext) {
  const cdpSession = await context.newCDPSession(page);
  const { data } = await cdpSession.send("Page.captureSnapshot", {
    format: "mhtml",
  });
  return data;
}

async function setupBrowserAndPage(pageName: string, queryParams: Record<string, string>, subDomain: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const queryString = new URLSearchParams(queryParams).toString();
  const url = process.env.NODE_ENV === "development" ? 'https://google.com' : `https://${subDomain}.${process.env.DOMAIN}/${pageName}${queryString ? `?${queryString}` : ""}`;
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  return { browser, context, page };
}
