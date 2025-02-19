import type { Transaction } from "neo4j-driver";
import type { Session } from "neo4j-driver";

import { type BrowserContext, chromium, type Page } from "playwright";

import { isDev } from "~/routes/constants/constants";
import { uploadFiles } from "~/server/upload/uploadFile";

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

export async function renderPageAsMHtml({
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

    const snapshotData = await capturePageSnapshot(
      browserSetup.page,
      browserSetup.context,
    );
    const fileName = `${pageName}.mhtml`;

    const { result } = await uploadFiles(
      [
        {
          data: snapshotData as unknown as Buffer,
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

async function capturePageSnapshot(
  page: Page,
  context: BrowserContext,
): Promise<string> {
  const cdpSession = await context.newCDPSession(page);
  const { data } = await cdpSession.send("Page.captureSnapshot", {
    format: "mhtml",
  });
  return data;
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
    ? `${baseUrl}/api/auth/autoLogin?${queryString}`
    : `${baseUrl}${redirectUrl}${queryString ? `?${queryString}` : ""}`;

  await page.goto(url);
  await page.waitForLoadState("networkidle");

  return { browser, context, page };
}
