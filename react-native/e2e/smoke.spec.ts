import { expect, test } from "@playwright/test";

test("アプリ起動後にホームへ到達できる", async ({ page }) => {
  await page.goto("/");

  const homeTitle = page.getByTestId("home-screen-title");
  const onboardingTitle = page.getByText("Onboarding 1");
  const startedOnHome = await homeTitle.isVisible({ timeout: 5000 }).catch(() => false);

  if (!startedOnHome) {
    await expect(onboardingTitle).toBeVisible();
    await page.getByTestId("onboarding-skip").click();
    await page.getByTestId("onboarding-consent").click();
    await page.getByTestId("onboarding-start").click();
  }

  await expect(homeTitle).toBeVisible();
  await expect(page.getByTestId("home-primary-action")).toBeVisible();
});
