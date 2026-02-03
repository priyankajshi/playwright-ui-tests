import { test as baseTest, expect } from "@playwright/test";
import { ConsentPage } from "../pages/consentPage";
import * as helper from "../helpers/helper";
import { Language } from "../types/types.js";

const test = baseTest.extend<{ consentPage: ConsentPage }>({
  consentPage: async ({ page }, use) => {
    const language = selectedLanguage;
    const consentPage = new ConsentPage(page, language);
    await consentPage.goTo();
    await use(consentPage);
  },
});

const selectedLanguage =
  (process.env.LANGUAGE?.toLowerCase() as Language) || "en";

test.describe(
  `Consent Page - ${selectedLanguage.toUpperCase()}`,
  { tag: "@consent" },
  () => {
    // TECH-001: Skipping first visit tests in CI
    test.describe("First Visit", () => {
      test.skip(
        !!process.env.CI,
        "Consent modal tests skipped in CI (Didomi blocks datacenter IPs)",
      );
      test.use({ storageState: { cookies: [], origins: [] } });

      test("should show consent on first visit", async ({ consentPage }) => {
        const expectedAcceptText = helper.getLocaleText("consentAcceptButton");
        const expectedLearnMoreText = helper.getLocaleText(
          "consentLearnMoreButton",
        );
        const expectedPartnersText = helper.getLocaleText(
          "consentPartnersButton",
        );

        await expect(
          consentPage.consentModal,
          "Consent modal should be visible on first visit",
        ).toBeVisible();
        await expect(
          consentPage.agreeButton,
          "Agree button should have correct text",
        ).toContainText(expectedAcceptText);
        await expect(
          consentPage.learnMoreButton,
          "Learn More button should have correct text",
        ).toContainText(expectedLearnMoreText);
        await expect(
          consentPage.partners,
          "Partners link should have correct text",
        ).toContainText(expectedPartnersText);
      });
    });

    test.describe("Returning User", () => {
      test("should not show consent to a user that already accepted it", async ({
        consentPage,
      }) => {
        await expect(
          consentPage.consentModal,
          "Consent modal should not be visible for returning users",
        ).toBeHidden();
      });
    });
  },
);
