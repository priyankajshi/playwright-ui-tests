import { type Locator, type Page } from "@playwright/test";
import { getLocaleData } from "../helpers/helper.js";
import { Language } from "@/types/types.js";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signupLink: Locator;
  readonly blankEmailError: Locator;
  readonly invalidEmailError: Locator;
  readonly passwordError: Locator;
  readonly userPasswordError: Locator;
  readonly resetPasswordMessage: Locator;
  readonly blockAccountMessage: Locator;
  readonly wrongCredentialsError: Locator;

  constructor(page: Page) {
    this.page = page;
    const localeData = getLocaleData().loginPage;
    this.emailInput = page.getByRole("textbox", { name: "email" });
    this.passwordInput = page.getByRole("textbox", { name: "password" });
    this.loginButton = page.getByLabel(localeData.logInButton);
    this.forgotPasswordLink = page.getByText(localeData.forgotPasswordLink, {
      exact: true,
    });
    this.signupLink = page.getByText(localeData.signupLink, { exact: true });
    this.blankEmailError = page.getByText(localeData.loginBlankEmailError, {
      exact: true,
    });
    this.invalidEmailError = page.getByText(localeData.invalidEmailError, {
      exact: true,
    });
    this.passwordError = page.getByText(localeData.loginBlankPasswordError, {
      exact: true,
    });
    this.userPasswordError = page.getByText(localeData.userPasswordError);
    this.resetPasswordMessage = page.getByText(
      localeData.resetPasswordEmailSentMessage,
    );
    this.blockAccountMessage = page.getByText(localeData.accountBlockedMessage);
    this.wrongCredentialsError = page.getByText(
      localeData.wrongCredentialsError,
    );
  }

  async goTo(language: Language) {
    await this.page.goto(this.getLoggedInUrl(language));
  }

  async fillLoginInputs(email: string, password?: string) {
    await this.emailInput.fill(email);
    if (password !== undefined) {
      await this.passwordInput.fill(password);
    }
  }

  async submitLogin() {
    await this.loginButton.click();
  }

  async getSignupHref() {
    return this.signupLink.getAttribute("href");
  }

  async getEmailError() {
    return this.blankEmailError.textContent();
  }

  async getPasswordError() {
    return this.passwordError.textContent();
  }

  async waitsLoginRequestFails(statusCode: number = 401) {
    await this.page.waitForResponse(
      (resp) =>
        resp.url().includes("/usernamepassword/login") &&
        resp.request().method() === "POST" &&
        resp.status() === statusCode,
    );
  }

  getLoggedInUrl(selectedLanguage: string) {
    const loggedInUrl = selectedLanguage === "fr" ? "/fr" : "/";

    return loggedInUrl;
  }
}
