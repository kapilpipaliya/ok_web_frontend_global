import { Page } from "@playwright/test";
import { SignUpData } from "./signup_admin.spec";

export async function fillSignUpForm(page: Page, data: SignUpData): Promise<void> {
  await page.getByPlaceholder('Enter SubDomain').fill(data.subDomain);
  await page.getByPlaceholder('Enter Name').fill(data.name);
  await page.getByPlaceholder('Enter Email').fill(data.email);
  await page.getByPlaceholder('Enter Password').fill(data.password);
}
