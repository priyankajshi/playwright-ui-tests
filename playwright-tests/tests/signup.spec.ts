import { test as baseTest, expect } from "@playwright/test";
import { SignupPage } from "../pages/signupPage";
import { faker } from "@faker-js/faker";
import * as helper from "../helpers/helper";
import { Language } from "../types/types.js";

const test = baseTest.extend<{ signupPage: SignupPage }>({
  signupPage: async ({ page }, use) => {
    const language = selectedLanguage;
    const signupPage = new SignupPage(page, language);
    await signupPage.goTo();
    await expect(
      signupPage.page,
      "Signup url validation should have correct URL",
    ).toHaveURL(helper.getSignupUrl(language));
    await use(signupPage);
  },
});

const selectedLanguage =
  (process.env.LANGUAGE?.toLowerCase() as Language) || "en";

test.describe(
  `Signup Page - ${selectedLanguage.toUpperCase()}`,
  { tag: "@signup" },
  () => {
    test.describe(`Form Validation - ${selectedLanguage.toUpperCase()}`, () => {
      test("should not submit form and show inline errors when mandatory fields are empty", async ({
        signupPage,
      }) => {
        const listener = signupPage.accountCreationRequestMonitor();
        const expectedUrl = helper.getSignupUrl(selectedLanguage);

        await signupPage.submitSignupForm();

        const inlineErrors = await signupPage.getErrorMessages();

        // 5 inline errors for 5 mandatory fields
        expect(
          inlineErrors.length,
          "There should be 5 inline error messages for mandatory fields when form is submitted empty",
        ).toBe(5);
        expect(
          inlineErrors,
          "Inline error messages should match expected texts",
        ).toEqual([
          helper.getLocaleText("mandatoryFieldError"),
          helper.getLocaleText("mandatoryFieldError"),
          helper.getLocaleText("invalidPhoneNumberError"),
          helper.getLocaleText("invalidEmailError"),
          helper.getLocaleText("passwordMinRequirementError"),
        ]);

        await expect(
          signupPage.page,
          "Signup page URL should be correct",
        ).toHaveURL(expectedUrl);
        expect(
          listener.wasTriggered(),
          "No account creation request should be triggered when mandatory fields are empty",
        ).toBe(false);
      });

      // SU-003: Validate phone number based on country code selected
      test.skip("should show inline error when phone number and country selection are different", async ({
        signupPage,
      }) => {
        const invalidPhone = "558132456789"; // country code should be BR (55)
        const expectedErrorText = helper.getLocaleText(
          "invalidPhoneNumberError",
        );
        const phoneNumberLocator = signupPage.page.getByText(expectedErrorText);

        await signupPage.fillInputField(signupPage.phoneInput, invalidPhone);
        await signupPage.submitSignupForm();

        await expect(
          signupPage.phoneInput,
          "Phone input should retain the invalid phone number value",
        ).toHaveValue(invalidPhone);
        await expect(
          phoneNumberLocator,
          "Invalid phone number error message should be visible",
        ).toBeVisible();
        await expect(
          phoneNumberLocator,
          "Invalid phone number error message should have correct text",
        ).toHaveText(expectedErrorText);
      });

      test("should show invalid phone number inline error ", async ({
        signupPage,
      }) => {
        const invalidPhone = faker.phone
          .number({ style: "national" })
          .slice(0, 7);
        const invalidPhoneErrorMessage = helper.getLocaleText(
          "invalidPhoneNumberError",
        );
        const phoneNumberErrorLocator = signupPage.page.getByText(
          invalidPhoneErrorMessage,
        );

        await signupPage.fillInputField(signupPage.phoneInput, invalidPhone);
        await signupPage.submitSignupForm();
        await signupPage.phoneInput.waitFor({ state: "visible" });

        await expect(
          signupPage.phoneInput,
          "Phone input should retain have phone number value",
        ).toHaveValue(invalidPhone);
        await expect(
          phoneNumberErrorLocator,
          "Invalid phone number error message should be visible",
        ).toBeVisible();
        await expect(
          phoneNumberErrorLocator,
          "Invalid phone number error message should have correct text",
        ).toHaveText(invalidPhoneErrorMessage);
      });

      test("should show invalid email address inline error", async ({
        signupPage,
      }) => {
        const invalidEmail = "invalid-email@test";
        const expectedErrorText = helper.getLocaleText("invalidEmailError");

        await signupPage.fillInputField(signupPage.emailInput, invalidEmail);
        await signupPage.submitSignupForm();
        await signupPage.emailInput.waitFor({ state: "visible" });
        await expect(
          signupPage.emailInput,
          "Email input should retain the invalid email value",
        ).toHaveValue(invalidEmail);

        const emailErrorMessage = await signupPage.getErrorMessageByTestId(
          "email-error-message-typography",
        );

        expect(
          emailErrorMessage,
          "Invalid email error message should contain the expected text",
        ).toContain(expectedErrorText);
      });

      test("should show password mismatch inline error", async ({
        signupPage,
      }) => {
        await signupPage.fillInputField(
          signupPage.passwordInput,
          "Password1234",
        );
        await signupPage.fillInputField(
          signupPage.confirmPasswordInput,
          "Different123",
        );
        await signupPage.submitSignupForm();

        const mismatchErrorMessage = await signupPage.getErrorMessageByTestId(
          "passwordConfirmation-error-message-typography",
        );
        const expectedErrorText = helper.getLocaleText(
          "passwordsMismatchError",
        );
        expect(
          mismatchErrorMessage,
          "Password mismatch error message should contain the expected text",
        ).toEqual(expectedErrorText);
      });

      test("should show password below minimum length inline error", async ({
        signupPage,
      }) => {
        const expectedErrorText = helper.getLocaleText(
          "passwordMinRequirementError",
        );

        await signupPage.fillInputField(signupPage.passwordInput, "Pass1");
        await signupPage.submitSignupForm();

        const minLengthErrorMessage = await signupPage.getErrorMessageByTestId(
          "password-error-message-typography",
        );
        expect(
          minLengthErrorMessage,
          "Password below minimum length error message should contain the expected text",
        ).toEqual(expectedErrorText);
      });

      test("should show password above maximum length inline error", async ({
        signupPage,
      }) => {
        const invalidPassword = "A".repeat(31) + "1a";
        const expectedErrorText = helper.getLocaleText(
          "passwordMaxRequirementError",
        );

        await signupPage.fillInputField(
          signupPage.passwordInput,
          invalidPassword,
        );
        await signupPage.submitSignupForm();

        expect(
          await signupPage.getErrorMessageByTestId(
            "password-error-message-typography",
          ),
          "Password above maximum length error message should show expected error text",
        ).toEqual(expectedErrorText);
      });

      test("should not show password minimum chars length inline error", async ({
        signupPage,
      }) => {
        await signupPage.fillInputField(
          signupPage.passwordInput,
          "Password1234",
        );
        await signupPage.submitSignupForm();
        await expect(
          await signupPage.getLocatorByTestId(
            "password-error-message-typography",
          ),
          "Password minimum length error message should be hidden when password has minimum length required",
        ).toBeHidden();
      });

      test("should not show password maximum chars length inline error", async ({
        signupPage,
      }) => {
        const longPassword = "A".repeat(30) + "1a";

        await signupPage.fillInputField(signupPage.passwordInput, longPassword);
        await signupPage.submitSignupForm();
        await expect(
          await signupPage.getLocatorByTestId(
            "password-error-message-typography",
          ),
          "Password maximum length error message should be hidden when password has maximum length permitted",
        ).toBeHidden();
      });

      // password requirements: one uppercase letter, one lowercase letter and one number
      test("should show password does not match requirements inline error", async ({
        signupPage,
      }) => {
        const expectedErrorText = helper.getLocaleText(
          "passwordRequirementsError",
        );

        await signupPage.fillInputField(
          signupPage.passwordInput,
          "password1234",
        );
        await signupPage.submitSignupForm();

        const requirementError = await signupPage.page
          .getByText(expectedErrorText)
          .textContent();
        expect(
          requirementError,
          "Password requirements error message should contain the expected text",
        ).toEqual(expectedErrorText);
      });

      test("should not show error when password contains special chars(?!#_- ) but meets all requirements", async ({
        signupPage,
      }) => {
        await signupPage.fillInputField(
          signupPage.passwordInput,
          "Password123?!#_",
        );
        await signupPage.submitSignupForm();

        await expect(
          await signupPage.getLocatorByTestId(
            "password-error-message-typography",
          ),
          "Password with special characters should not display error message when password meets all requirements",
        ).toBeHidden();
      });
    });

    test.describe(`Links and Navigation - ${selectedLanguage.toUpperCase()}`, () => {
      test("should switch language when clicking the language toggle", async ({
        signupPage,
      }) => {
        const { targetLanguage, expectedUrlPath, headerText } =
          helper.switchSignupLanguage(selectedLanguage);
        await signupPage.languageSelector.click();
        await signupPage.page.waitForResponse(
          (resp) =>
            resp.url().includes(`/${targetLanguage}/signup.json`) &&
            resp.request().method() === "GET" &&
            resp.status() === 200,
        );
        await expect(
          signupPage.page,
          `Signup page URL should have been updated to ${expectedUrlPath} after language switch`,
        ).toHaveURL(new RegExp(expectedUrlPath));
        expect(
          signupPage.page.getByText(headerText),
          `Signup page header should have been updated to target language ${targetLanguage.toUpperCase()} after language switch`,
        ).toHaveText(headerText);
      });

      test("should redirect to login page when clicking the login link", async ({
        signupPage,
      }) => {
        const expectedText = helper.getLocaleText("logInButton");

        await signupPage.clickLoginHref();
        await expect(
          signupPage.page,
          "Signup page URL should have been updated to /login after clicking the login link",
        ).toHaveURL(/\/login/);
        await expect(
          signupPage.page.getByRole("button", { name: expectedText }),
          "Login button should be visible on login page after redirection",
        ).toBeVisible();
      });

      test("should have correct link for terms of service", async ({
        signupPage,
      }) => {
        const termsLocator = signupPage.page.getByText(
          helper.getLocaleText("termsOfService"),
        );
        const expectedUrl = helper.getLocaleText("termsOfServiceLink");

        await expect(
          termsLocator,
          "Terms of Service link should have correct link value",
        ).toHaveAttribute("href", new RegExp(expectedUrl));
        await expect(
          termsLocator,
          "Terms of Service link should have the correct text",
        ).toHaveText(helper.getLocaleText("termsOfService"));
      });

      // SU-006: Test is skipped until the privacy policy link is for EN users is fixed
      test.skip("should have correct link for privacy policy", async ({
        signupPage,
      }) => {
        const privacyLocator = signupPage.page.getByText(
          helper.getLocaleText("privacyPolicy"),
        );
        const expectedUrl = helper.getLocaleText("privacyPolicyLink");

        await expect(
          privacyLocator,
          "Privacy Policy link shoulg have correct link value",
        ).toHaveAttribute("href", new RegExp(expectedUrl));
        await expect(
          privacyLocator,
          "Privacy Policy link should have the correct text",
        ).toHaveText(helper.getLocaleText("privacyPolicy"));
      });

      // Assumption:
      // "valid.user123@test.com" user was pre-created in the system
      // Options: use /accounts endpoint to create a new user in pre-test setup
      // or inject new user in DB as part of env setup.
      test("should display toast error when signup using email from existing user", async ({
        signupPage,
      }) => {
        const expectedToastText = helper.getLocaleText("toastError");
        const toastMessageLocator =
          signupPage.page.getByText(expectedToastText);
        const listener = signupPage.setupAccountCreationMonitor();

        await signupPage.fillSignupForm({
          firstName: "John",
          lastName: "Doe",
          phoneNumber: "5149087654",
          email: "valid.user123@test.com",
          password: "Password1234",
          region: "AB",
        });

        await signupPage.submitSignupForm();
        await listener.waitForResponse();

        const statusCode = listener.getStatusCode();

        await signupPage.page.waitForSelector(".Toastify", {
          state: "attached",
        });
        await expect(
          toastMessageLocator,
          "Toast error message should have correct text when using signup email from existing user",
        ).toHaveText(expectedToastText);
        expect(
          statusCode,
          "Account creation response status code should be 400 when using signup email from existing user",
        ).toBe(400);
      });

      test("should not allow signup with malicious strings", async ({
        signupPage,
      }) => {
        const malicious = "<script>alert('XSS')</script>";
        await signupPage.fillSignupForm({
          firstName: malicious,
          lastName: malicious,
          phoneNumber: "3332342345",
          email: malicious,
          password: "Password1234",
          region: "AB",
        });
        const listener = signupPage.accountCreationRequestMonitor();

        await signupPage.submitSignupForm();

        const errors = await signupPage.getErrorMessages();
        // 3 inline errors for first name, last name and invalid email
        expect(
          errors.length,
          "There should be 3 inline errors when 3 malicious input are provided",
        ).toBe(3);
        expect(
          errors,
          "Error messages should match expected errors for malicious inputs",
        ).toEqual([
          helper.getLocaleText("mandatoryFieldError"),
          helper.getLocaleText("mandatoryFieldError"),
          helper.getLocaleText("invalidEmailError"),
        ]);
        expect(
          listener.wasTriggered(),
          "No account creation request should be triggered when malicious inputs are provided",
        ).toBe(false);
      });
    });

    test.describe(`Account Creation - ${selectedLanguage.toUpperCase()}`, () => {
      // phone number is not from region of purchase
      test("should create account when valid inputs are provided and phone number is not from region of purchase", async ({
        signupPage,
      }) => {
        const randomUserFirstName = faker.person.firstName();
        const randomUserLastName = faker.person.lastName();
        const randomEmail = faker.internet.email({
          firstName: randomUserFirstName,
          lastName: `${randomUserLastName}${Date.now().toFixed()}`,
        });
        const phoneNumber = "+15141234567";
        const pwd = "PPassword1234";
        const region = "AB";
        const { loggedInUrl, accountResponse } =
          signupPage.waitAndCheckAccountRequest(selectedLanguage);

        await signupPage.fillSignupForm({
          firstName: randomUserFirstName,
          lastName: randomUserLastName,
          phoneNumber: phoneNumber,
          email: randomEmail,
          password: pwd,
          region: region,
        });
        await signupPage.submitSignupForm();
        const accountResponseBody = await (await accountResponse).json();

        expect(
          accountResponseBody.account.firstName,
          "First name to match the input provided in the signup form",
        ).toEqual(randomUserFirstName);
        expect(
          accountResponseBody.account.lastName,
          "Last name to match the input provided in the signup form",
        ).toEqual(randomUserLastName);
        expect(
          accountResponseBody.account.email,
          "Email to match the input provided in the signup form",
        ).toEqual(randomEmail);
        expect(
          accountResponseBody.account.phone,
          "Phone number to match the input provided in the signup form",
        ).toEqual(phoneNumber);
        expect(
          accountResponseBody.account.region,
          "Region to match the input provided in the signup form",
        ).toEqual(region);

        await signupPage.waitForLoginPageRedirect();
        await expect(
          signupPage.page,
          "Url to match the expected url redirect after successful signup",
        ).toHaveURL(loggedInUrl);
        await expect(
          signupPage.page.getByTestId("new-mortgage"),
          "New mortgage section to be visible after signup",
        ).toBeVisible();
      });

      // phone number is from region of purchase ( default: QC )
      test("should create account when valid inputs are provided", async ({
        signupPage,
      }) => {
        const randomUserFirstName = faker.person.firstName();
        const randomUserLastName = faker.person.lastName();
        const randomEmail = faker.internet.email({
          firstName: randomUserFirstName,
          lastName: `${randomUserLastName}${Date.now().toFixed()}`,
        });
        const phoneNumber = "+15141234564";
        const pwd = "PPassword1234";
        const { loggedInUrl, accountResponse } =
          signupPage.waitAndCheckAccountRequest(selectedLanguage);

        await signupPage.fillSignupForm({
          firstName: randomUserFirstName,
          lastName: randomUserLastName,
          phoneNumber: phoneNumber,
          email: randomEmail,
          password: pwd,
        });
        await signupPage.submitSignupForm();
        const accountResponseBody = await (await accountResponse).json();

        expect(
          accountResponseBody.account.firstName,
          "First name to match the input provided in the signup form",
        ).toEqual(randomUserFirstName);
        expect(
          accountResponseBody.account.lastName,
          "Last name to match the input provided in the signup form",
        ).toEqual(randomUserLastName);
        expect(
          accountResponseBody.account.email,
          "Email to match the input provided in the signup form",
        ).toEqual(randomEmail);
        expect(
          accountResponseBody.account.phone,
          "Phone number to match the input provided in the signup form",
        ).toEqual(phoneNumber);
        expect(
          accountResponseBody.account.region,
          "Region to match the input provided in the signup form",
        ).toEqual("QC");

        await signupPage.waitForLoginPageRedirect();
        await expect(
          signupPage.page,
          "Url to match the expected url redirect after successful signup",
        ).toHaveURL(loggedInUrl);
        await expect(
          signupPage.page.getByTestId("new-mortgage"),
          "New mortgage section to be visible after signup",
        ).toBeVisible();
      });

      // SU-001: Signup allows non-Canadian phone numbers
      // Test will fail as the account creation endpoint should return a 400 error
      test.skip("should not allow account creation for non-Canadian phone numbers", async ({
        signupPage,
      }) => {
        const randomUserFirstName = faker.person.firstName();
        const randomUserLastName = faker.person.lastName();
        const randomEmail = faker.internet.email({
          firstName: randomUserFirstName,
          lastName: `${randomUserLastName}${Date.now().toFixed()}`,
        });
        const phoneNumber = faker.phone.number({ style: "international" });
        const pwd = "PPassword1234";
        const region = "AB";
        const { loggedInUrl, accountResponse } =
          signupPage.waitAndCheckAccountRequest(selectedLanguage, 400);

        // Submit the form and wait for the response
        await signupPage.fillSignupForm({
          firstName: randomUserFirstName,
          lastName: randomUserLastName,
          phoneNumber: phoneNumber,
          email: randomEmail,
          password: pwd,
          region: region,
        });

        await signupPage.submitSignupForm();
        const accountResponseBody = await (await accountResponse).json();
        expect(
          accountResponseBody,
          "Account request response body should contain creation account error when non-Canadian phone number is used",
        ).toEqual(
          "Unsupported phone number region. Only Canadian phone numbers are allowed.",
        );

        await expect(
          signupPage.page,
          "Url should not match the expected url redirect after failed signup",
        ).not.toHaveURL(loggedInUrl);
        await expect(
          signupPage.page.getByTestId("new-mortgage"),
          "New mortgage section should not be visible after failed signup",
        ).not.toBeVisible();
      });
    });
  },
);
