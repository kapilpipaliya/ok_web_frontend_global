import type { Transaction } from "neo4j-driver";
import type { Session } from "neo4j-driver";

import { type BrowserContext, chromium, type Page } from "playwright";

import { isDev } from "~/routes/constants/constants";
import { uploadFiles } from "~/server/upload/uploadFile";

import { API } from "../api/endpoints";

interface BrowserSetup {
  browser: Awaited<ReturnType<typeof chromium.launch>>;
  context: BrowserContext;
  page: Page;
}

interface RenderResult {
  error?: string;
  result?: any[];
  success: boolean;
}

interface SendPageOptions {
  neo4jSession: Session | Transaction;
  pageName: string;
  queryParams?: Record<string, string>;
  secureToken?: string;
  subDomain: string;
}

export async function renderPageAsHtml({
  neo4jSession,
  pageName,
  queryParams = {},
  secureToken,
  subDomain,
}: SendPageOptions): Promise<RenderResult> {
  let browser;

  try {
    const browserSetup = await setupBrowserAndPage(
      pageName,
      queryParams,
      subDomain,
      secureToken,
    );
    browser = browserSetup.browser;

    // Wait for master CSS to be applied
    await browserSetup.page.waitForSelector("style#master", {
      state: "attached",
    });

    // Get the computed styles
    const masterStyles = await browserSetup.page.evaluate(() => {
      const masterStyleEl = document.querySelector("style#master");
      if (!masterStyleEl?.sheet) {
        return "";
      }

      const cssRules = Array.from(masterStyleEl.sheet.cssRules);
      return cssRules.map((rule) => rule.cssText).join("\n");
    });

    // Get page content
    let html = await browserSetup.page.content();

    // Replace empty master style tag with computed styles
    html = html.replace(
      /<style id="master"><\/style>/,
      `<style id="master">${masterStyles}</style>`,
    );

    const fileName = `${pageName}.html`;

    const { result } = await uploadFiles(
      [
        {
          data: Buffer.from(html),
          filename: fileName,
          label: "Email",
        },
      ],
      subDomain,
      neo4jSession,
    );

    if (!result?.length) {
      throw new Error("Failed to upload file");
    }

    return { result, success: true };
  } catch (error) {
    console.error("Error rendering page:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      success: false,
    };
  } finally {
    await browser?.close();
  }
}

async function setupBrowserAndPage(
  pageName: string,
  queryParams: Record<string, string>,
  subDomain: string,
  token?: string,
): Promise<BrowserSetup> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const searchParams = new URLSearchParams(queryParams);
  const redirectUrl = `/email-templates/${pageName}`;

  if (token) {
    searchParams.set("token", token);
    searchParams.set("redirect", redirectUrl);
  }

  const protocol = isDev ? "http" : "https";
  const domainPort = process.env.DOMAIN_PORT
    ? `:${process.env.DOMAIN_PORT}`
    : "";
  const subDomainPart =
    subDomain && subDomain !== "super" ? `${subDomain}.` : "";

  const baseUrl = `${protocol}://${subDomainPart}${process.env.DOMAIN}${domainPort}`;
  const queryString = searchParams.toString();

  const url = token
    ? `${baseUrl}${API.auth.autoLoginUrl}?${queryString}`
    : `${baseUrl}${redirectUrl}${queryString ? `?${queryString}` : ""}`;

  await page.goto(url);
  await page.waitForLoadState("networkidle");

  return { browser, context, page };
}
