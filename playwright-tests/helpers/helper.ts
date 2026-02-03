import * as path from "path";
import * as fs from "fs";
import { Language } from "../types/types.js";

const selectedLanguage =
  (process.env.LANGUAGE?.toLowerCase() as Language) || "en";

export function getLocaleData(language: Language = selectedLanguage) {
  const localeMap = {
    en: "en-EN.json",
    fr: "fr-FR.json",
  };

  const localeFile = localeMap[language];
  const localePath = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    "..",
    "locales",
    localeFile,
  );
  const data = fs.readFileSync(localePath, "utf-8");
  return JSON.parse(data);
}

export function getLocaleText(key: string, pageLocale: string = "signupPage") {
  const localeData = getLocaleData()[pageLocale];
  return localeData[key];
}

export function switchSignupLanguage(currentLanguage: string) {
  const targetLanguage = currentLanguage === "en" ? "fr" : "en";
  const expectedUrlPath = targetLanguage === "fr" ? "/fr/signup" : "/signup";
  const localeData = getLocaleData(targetLanguage as Language);
  const headerText = localeData.signupPage.formHeader;

  return { targetLanguage, expectedUrlPath, headerText };
}

export function switchPortfolioLanguage(currentLanguage: string) {
  const targetLanguage = currentLanguage === "en" ? "fr" : "en";
  const expectedUrlPart = targetLanguage === "fr" ? "/fr" : "/";
  const localeData = getLocaleData(targetLanguage as Language);
  const portfolioText = localeData.signupPage.myPortfolio;

  return { targetLanguage, expectedUrlPart, portfolioText };
}

export function getSignupUrl(currentLanguage: string) {
  const signUpUrl = currentLanguage === "fr" ? "/fr/signup" : "/signup";
  return signUpUrl;
}
