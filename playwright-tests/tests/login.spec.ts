import { test as baseTest, expect } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { getLocaleText } from "../helpers/helper";
import { faker } from "@faker-js/faker";
import { Language } from "../types/types.js";

const test = baseTest.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo(selectedLanguage);
    await expect(
      loginPage.page,
      "Login page URL validation should have correct URL",
    ).toHaveURL(/login/);
    await expect(
      loginPage.emailInput,
      "Login Email input should be visible",
    ).toBeVisible();
    await use(loginPage);
  },
});

const selectedLanguage =
  (process.env.LANGUAGE?.toLowerCase() as Language) || "en";

test.describe(
  `Login Page - ${selectedLanguage.toUpperCase()}`,
  { tag: "@login" },
  () => {
    // LOG-006: Fix language persistence after login
    test("should allow user to login when valid credentials are provided", async ({
      loginPage,
    }) => {
      if (selectedLanguage === "fr") {
        test.skip(
          true,
          "Skipping test in FR until language persistence after login is fixed",
        );
      }
      const validUserEmail = "valid.user456@test.com";
      const validUserPassword = "Password1234567890";

      await loginPage.fillLoginInputs(validUserEmail, validUserPassword);
      await expect(
        loginPage.emailInput,
        "Email input should have the correct email value",
      ).toHaveValue(validUserEmail);
      await expect(
        loginPage.passwordInput,
        "Password input should have the correct password value",
      ).toHaveValue(validUserPassword);

      await loginPage.submitLogin();

      await expect(
        loginPage.page.getByTestId("new-mortgage"),
        "New mortgage section should be visible after successful login",
      ).toBeVisible();
      await expect(
        loginPage.page,
        "Url should match the expected url redirect after successful login",
      ).toHaveURL(new RegExp(loginPage.getLoggedInUrl(selectedLanguage)));
    });

    test("should not login when invalid username is provided", async ({
      loginPage,
    }) => {
      const wrongEmail = `${Date.now().toFixed()}wrong@example.com`;
      const correctPassword = "Test1234567890";
      const expectedUsernameError = await getLocaleText(
        "userPasswordError",
        "loginPage",
      );

      await loginPage.fillLoginInputs(wrongEmail, correctPassword);
      await expect(
        loginPage.emailInput,
        "Email input should have the wrong email value",
      ).toHaveValue(wrongEmail);
      await expect(
        loginPage.passwordInput,
        "Password input should have the correct password value",
      ).toHaveValue(correctPassword);
      await loginPage.submitLogin();
      await loginPage.waitsLoginRequestFails();

      const usernameErrorMessage =
        await loginPage.userPasswordError.textContent();
      await expect(
        loginPage.userPasswordError,
        "Username error message should be visible when invalid username is provided",
      ).toBeVisible();
      expect(
        usernameErrorMessage,
        "Username error message should match expected error when invalid username is provided",
      ).toContain(expectedUsernameError);
    });

    // LOG-003: Missing email format validation after "@" symbol
    // This test will fail until the email format validation is fixed
    test.skip("should show invalid email inline error when email does not have characters after @", async ({
      loginPage,
    }) => {
      const invalidEmail = `${Date.now().toFixed()}anotherwrong@.com`;
      const password = "Test1234567890";
      const expectedInvalidEmailError = await getLocaleText(
        "invalidEmailError",
        "loginPage",
      );

      await loginPage.fillLoginInputs(invalidEmail, password);
      await expect(
        loginPage.emailInput,
        "Email input should have the wrong email value",
      ).toHaveValue(invalidEmail);
      await loginPage.submitLogin();

      const errorMessage = await loginPage.invalidEmailError.textContent();
      await expect(
        loginPage.invalidEmailError,
        "Invalid email error message should be visible when email does not have characters after @",
      ).toBeVisible();
      expect(
        errorMessage,
        "Invalid email error message should match expected error when email does not have characters after @",
      ).toContain(expectedInvalidEmailError);
    });

    // LOG-004: FR text for invalid email is not matching EN version
    test("should show invalid email inline error when invalid email format is provided", async ({
      loginPage,
    }) => {
      const invalidEmail = `${Date.now().toFixed()}wrong.com`;
      const password = "Test1234567890";
      const expectedInvalidEmailError = await getLocaleText(
        "invalidEmailError",
        "loginPage",
      );

      await loginPage.fillLoginInputs(invalidEmail, password);
      await expect(
        loginPage.emailInput,
        "Email input should have the wrong email value",
      ).toHaveValue(invalidEmail);
      await loginPage.submitLogin();

      const errorMessage = await loginPage.invalidEmailError.textContent();
      await expect(
        loginPage.invalidEmailError,
        "Invalid email error message should be visible when email does not have characters after @",
      ).toBeVisible();
      expect(
        errorMessage,
        "Invalid email error message should match expected error when email does not have characters after @",
      ).toContain(expectedInvalidEmailError);
    });

    // LOG-002: FR text for empty fields is not matchin EN verion
    // This test will fail in FR until the text is fixed
    test("should show inline errors when empty fields are submitted", async ({
      loginPage,
    }) => {
      if (selectedLanguage === "fr") {
        test.skip(
          true,
          "Skipping test in FR until the empty fields error messages are fixed",
        );
      }
      await loginPage.submitLogin();

      const emailError = await loginPage.getEmailError();
      const passwordError = await loginPage.getPasswordError();
      const emailExpectedError = await getLocaleText(
        "loginBlankEmailError",
        "loginPage",
      );
      const passwordExpectedError = await getLocaleText(
        "loginBlankPasswordError",
        "loginPage",
      );

      expect(
        emailError,
        "Email error message should match expected error when empty fields are submitted",
      ).toContain(emailExpectedError);
      expect(
        passwordError,
        "Password error message should match expected error when empty fields are submitted",
      ).toContain(passwordExpectedError);
    });

    test("should allow user to reset password", async ({ loginPage }) => {
      const randomEmail = `${Date.now().toFixed()}-${faker.internet.email()}`;
      const expectedError = await getLocaleText(
        "forgotPasswordLink",
        "loginPage",
      );

      await expect(loginPage.forgotPasswordLink).toBeVisible();
      await expect(loginPage.forgotPasswordLink).toHaveText(expectedError);
      await loginPage.forgotPasswordLink.click();

      const sendEmailButton = await getLocaleText(
        "sendEmailButton",
        "loginPage",
      );
      await expect(
        loginPage.page.getByLabel(sendEmailButton),
        "Send Email button should be visible on reset password page",
      ).toBeVisible();

      await loginPage.emailInput.fill(randomEmail);
      await expect(
        loginPage.emailInput,
        "Email input should have the random email value",
      ).toHaveValue(randomEmail);
      await loginPage.page.getByLabel(sendEmailButton).click();

      const resetMessage = await loginPage.resetPasswordMessage.textContent();
      expect(
        resetMessage,
        "Reset password message should match expected text",
      ).toContain(
        await getLocaleText("resetPasswordEmailSentMessage", "loginPage"),
      );
      await expect(loginPage.resetPasswordMessage).toBeVisible();
    });

    test("should signup link have correct href", async ({ loginPage }) => {
      const linkText = await getLocaleText("signupLink", "loginPage");
      const urlPart = selectedLanguage === "fr" ? "/fr/signup" : "/signup";

      await expect(loginPage.signupLink).toHaveText(linkText);
      expect(loginPage.signupLink).toHaveAttribute("href", new RegExp(urlPart));
    });

    // Assumption:
    // "valid.user456@test.comm" user was pre-created in the system
    // Options: use /accounts endpoint to create a new user in pre-test setup
    // or inject new user in DB as part of env setup.
    // This will avoid account block due to multiple failed login attempts
    // LOG-005: Fix french text for wrong credentials error message
    // TECH-002: Currently running in CI only to avoid account lockout issues locally
    test("should not login when password provided is incorrect for an existing user", async ({
      loginPage,
    }) => {
      if (!process.env.CI) {
        test.skip(
          true,
          "Skipping test locally to avoid account lockout issues until a new user creation mechanism is implemented",
        );
      }
      const validUserEmail = "valid.user456@test.com";
      const invalidUserPassword = "Password";

      await loginPage.fillLoginInputs(validUserEmail, invalidUserPassword);
      await expect(
        loginPage.emailInput,
        "Email input should have the correct email value",
      ).toHaveValue(validUserEmail);
      await expect(
        loginPage.passwordInput,
        "Password input should have the incorrect password value",
      ).toHaveValue(invalidUserPassword);
      await loginPage.submitLogin();
      await loginPage.waitsLoginRequestFails();

      const wrongCredMessage =
        await loginPage.wrongCredentialsError.textContent();
      expect(
        wrongCredMessage,
        "Wrong credentials error message should match expected text",
      ).toContain(await getLocaleText("wrongCredentialsError", "loginPage"));
      await expect(
        loginPage.wrongCredentialsError,
        "Wrong credentials error message should be visible",
      ).toBeVisible();
    });
  },
);

// Account lockout test - to run in isolation to avoid affecting other tests
// TECH-003: Currently running in CI only to avoid account lockout issues locally
test.describe(
  `Account Security - ${selectedLanguage.toUpperCase()}`,
  { tag: "@smoke" },
  () => {
    test("should block user after multiple failed login attempts", async ({
      loginPage,
    }) => {
      if (!process.env.CI) {
        test.skip(
          true,
          "Skipping test locally to avoid account lockout issues",
        );
      }

      const randomEmail = `${Date.now().toFixed()}-${faker.internet.email()}`;
      const password = "Test1234567890";
      const expectedUsernameError = await getLocaleText(
        "userPasswordError",
        "loginPage",
      );
      const expectedBlockAccountMessage = await getLocaleText(
        "accountBlockedMessage",
        "loginPage",
      );

      await loginPage.fillLoginInputs(randomEmail, password);
      await expect(
        loginPage.emailInput,
        "Email input should have the wrong email value",
      ).toHaveValue(randomEmail);
      await expect(
        loginPage.passwordInput,
        "Password input should have the correct password value",
      ).toHaveValue(password);

      // First 5 failed attempts should show username/password error
      for (let attempt = 0; attempt < 5; attempt++) {
        await loginPage.submitLogin();
        await loginPage.waitsLoginRequestFails();
        expect(
          await loginPage.userPasswordError.textContent(),
          "Username error message should match expected error when invalid username is provided",
        ).toContain(expectedUsernameError);
      }

      // 6th attempt should block the account
      await loginPage.submitLogin();
      await loginPage.waitsLoginRequestFails(429);
      await expect(
        loginPage.blockAccountMessage,
        "Block account message should be visible after multiple failed login attempts",
      ).toBeVisible();
      expect(
        await loginPage.blockAccountMessage.textContent(),
        "Blocked account message should match expected text after multiple failed login attempts",
      ).toContain(expectedBlockAccountMessage);
    });
  },
);
