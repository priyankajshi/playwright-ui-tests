# Nesto Test Automation Project

## Overview

This is an end-to-end test automation project for Nesto using Playwright and TypeScript. The project includes comprehensive test suites for login, signup, and consent functionalities with multi-language support (English and French), parallel test execution, and detailed reporting.

## Features

- ✅ **Multi-language testing** (English & French)
- ✅ **Page Object Model** architecture
- ✅ **Parallel test execution**
- ✅ **Automated code quality checks** (ESLint & Prettier)
- ✅ **Pre-commit hooks** for code quality enforcement
- ✅ **Comprehensive test reporting** (HTML & Allure)
- ✅ **CI/CD integration** with GitHub Actions
- ✅ **Type-safe** with TypeScript

## Prerequisites

- **Node.js**: LTS version (v18 or higher recommended)
- **npm**: v10 or higher
- **Git**: For version control

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/marisouza/nesto-assessment
   cd nesto-assessment
   ```

2. **Install dependencies**

   ```bash
   npm ci
   ```

3. **Install Playwright browsers** (if not automatically installed)

   ```bash
   npx playwright install --with-deps
   ```
   _Note: This step may not be necessary if browsers were installed during `npm ci`. Run this if you encounter browser-related errors._

4. **Set values to .env file**

   Rename `.env.sample` file in the root directory to `.env.demo`, then add proper URL information as shown below.

   ```bash
   # .env file
   BASE_URL="https://app.qa.nesto.ca"
   LOGIN_URL="https://auth.nesto.ca"
   ```

5. **Install allurectl**

Follow [allurectl](https://docs.qameta.io/allure-testops/ecosystem/allurectl/) documentation for installation steps.

## Project Structure

```bash
nesto/
├── .github/workflows/      # CI/CD workflows
├── .husky/                 # Git hooks (pre-commit)
├── allure-report/          # Generated Allure reports
├── allure-results/         # Test execution results
├── helpers/                # Helper utilities
├── locales/                # Multi-language support files
├── pages/                  # Page Object Models
├── playwright/             # Playwright configuration files
├── playwright-report/      # HTML test reports
├── setup/                  # Test setup files
├── test-results/           # Test execution artifacts
├── tests/                  # Test suites
│   ├── consent.spec.ts     # Consent functionality tests
│   ├── login.spec.ts       # Login/authentication tests
│   └── signup.spec.ts      # User registration tests
├── .prettierrc             # Prettier configuration
├── eslint.config.js        # ESLint configuration
├── fixtures.ts             # Custom test fixtures
├── playwright.config.ts    # Playwright configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies and scripts
```

## Running Tests

### Language Support

Tests support both English and French. Set the language using the `LANGUAGE` environment variable:

```bash
# Run tests in French
LANGUAGE=fr npm run test:headed

# Run tests in English (default)
npm run test:headed
```

### Interactive Mode (UI)

Run all tests with Playwright UI:

```bash
npm run test:ui
```

### Headed Mode

Run all tests in headed mode (browser visible):

```bash
npm run test:headed
```

### Test Suites by Tag

Run specific test suites using tags:

```bash
npm run test:consent      # Consent tests (@consent tag)
npm run test:login        # Login tests (@login tag)
npm run test:signup       # Signup tests (@signup tag)
```

## Test Reports

### HTML Report

View Playwright HTML report:

```bash
npm run report:show
```

### Allure Report

Generate and view Allure report:

```bash
npm run report:allure
```

Reports are generated in:

- `playwright-report/` - HTML reports
- `allure-results/` - Allure test results
- `allure-report/` - Generated Allure reports

CI Reports available at [github-pages](https://github.com/marisouza/nesto-assessment/deployments/github-pages) by clicking on **Latest deployments** link

_Note: You must have signed in to github to be able to access the page._

## Code Quality

The project enforces code quality through ESLint and Prettier with automated pre-commit hooks.

### Pre-commit Hooks

Git hooks are managed by **Husky** and **lint-staged**:

- **Automatic linting**: ESLint runs with `--fix` on staged `.ts` and `.js` files
- **Automatic formatting**: Prettier formats staged files before commit
- **Type checking**: TypeScript compilation checks ensure type safety

The pre-commit hook runs automatically when you commit. To bypass (not recommended):

```bash
git commit --no-verify
```

### Manual Code Quality Checks

#### Linting

Check for linting errors:

```bash
npm run lint              # Run ESLint and TypeScript type checking
npm run lint:ci           # Run TypeScript type checking only (CI mode)
```

#### Code Formatting

Check and fix code formatting:

```bash
npm run format:check      # Check if files are formatted
npm run format:fix        # Auto-fix formatting issues
```

### Supported File Types

- **Linting**: `.ts`, `.js` files
- **Formatting**: `.ts`, `.js`, `.json`, `.md` files

## Configuration

### Playwright Configuration

Test configuration is managed in [playwright.config.ts](playwright.config.ts):

- **Test directory**: `./tests`
- **Timeout**: 30 seconds per test
- **Retries**: 1 (CI), 0 (local)
- **Base URL**: Configured for test environment
- **Screenshots**: On failure
- **Trace**: On first retry
- **Reporters**: HTML and Allure

### Environment Variables

The project supports the following environment variables:

- **`LANGUAGE`**: Set test language (`en` or `fr`, default: `en`)
- **`CI`**: Indicates CI environment (automatically set by GitHub Actions)

Example:

```bash
LANGUAGE=fr npx playwright test
```

### Locales Configuration

Multi-language support is managed through locale files in the [`locales/`](locales/) directory. Each page has its own locale file with translations for both English and French.

### Project-Specific Settings

## CI/CD

The project uses GitHub Actions for continuous integration and deployment with multiple workflows:

- **Test Workflow**: [.github/workflows/docker-playwright.yaml](.github/workflows/docker-playwright.yaml)
- **Security Audit**: [.github/workflows/npm-audit.yaml](.github/workflows/npm-audit.yaml)

### Workflow Triggers

Tests run on:

- **Push** to `main` branch
- **Pull requests** to `main` branch

### Test Workflow Steps

1. **Setup**
   - Checkout code
   - Setup Node.js environment
   - Install dependencies

2. **Code Quality**
   - Run ESLint checks
   - Run TypeScript type checking
   - Run Prettier formatting checks

3. **Test Execution**
   - Run tests in parallel across multiple browsers
   - Execute separate jobs for login, signup, and consent suites
   - Generate test reports

4. **Reporting**
   - Upload Playwright HTML reports
   - Upload Allure results
   - Generate and publish reports to GitHub Pages
   - Upload test artifacts for download

### NPM Audit Workflow

The npm audit workflow automatically scans for security vulnerabilities:

- **Trigger**: Runs on push to `main` and on pull requests
- **Audit Level**: Moderate (checks for moderate and higher severity vulnerabilities)
- **Action**: Scans all dependencies for known security issues
- **Failure**: Workflow fails if vulnerabilities at moderate level or higher are found

You can also run npm audit locally:

```bash
npm audit                    # View all vulnerabilities
npm audit --audit-level=moderate   # Only show moderate and above
npm audit fix                # Automatically fix vulnerabilities
```

### CI Reports

View CI reports at: [GitHub Pages](https://github.com/marisouza/nesto-assessment/deployments/github-pages)

### Artifacts

Test reports and screenshots are available as downloadable artifacts in the GitHub Actions run summary.

## Development

### TypeScript Configuration

TypeScript settings are defined in [tsconfig.json](tsconfig.json):

- **Target**: ES2020
- **Module**: ESNext
- **Strict mode**: Enabled
- **Type checking**: Enforced during linting

### ESLint Configuration

Linting rules are defined in [eslint.config.js](eslint.config.js):

- Based on recommended ESLint and TypeScript ESLint rules
- Custom rules for code quality and consistency

### Prettier Configuration

Code formatting settings in [.prettierrc](.prettierrc):

- Consistent code style across the project

### Adding New Tests

1. Create test file in `tests/` directory
2. Import required fixtures and page objects
3. Follow existing test patterns and naming conventions
4. Add appropriate test tags for categorization
5. Ensure multi-language support if applicable
6. Run tests locally before committing

### Adding New Page Objects

1. Create page class in `pages/` directory
2. Extend from base page if needed
3. Define locators and methods
4. Support multi-language if applicable
5. Follow naming conventions

## Available Scripts

| Script                | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `test:ui`             | Open Playwright UI mode to run test                    |
| `test:headed`         | Run all tests in headed mode (browser visible)         |
| `test:docker`         | Run all tests in headless mode for docker              |
| `test:docker:signup`  | Run signup tests in headless mode for docker           |
| `test:docker:login`   | Run login tests in headless mode for docker            |
| `test:docker:consent` | Run consent tests in headless mode for docker          |
| `test:signup`         | Run signup tests with @signup tag                      |
| `test:login`          | Run login tests with @login tag                        |
| `test:consent`        | Run consent tests with @consent tag                    |
| `report:show`         | Open Playwright HTML report                            |
| `report:allure`       | Generate and open Allure report                        |
| `lint`                | Run ESLint and TypeScript type checking                |
| `lint:ci`             | Run TypeScript type checking (CI mode)                 |
| `format:check`        | Check code formatting                                  |
| `format:fix`          | Auto-fix code formatting issues                        |
| `prepare`             | Set up Husky git hooks (runs automatically on install) |

## Test Suites

The project includes three main test suites with comprehensive coverage:

### 1. Login Tests (@login tag)

**Location**: [tests/login.spec.ts](tests/login.spec.ts)

**Coverage**:

- Invalid username/password validation
- Email format validation
- Empty field validation
- Password reset functionality
- Signup link navigation
- Account lockout after multiple failed attempts

**Multi-language support**: English & French

### 2. Signup Tests (@signup tag)

**Location**: [tests/signup.spec.ts](tests/signup.spec.ts)

**Coverage**:

- Form validation (email, password, phone, postal code)
- Password strength requirements
- Phone number country validation
- Account creation flow
- Terms of service and privacy policy links
- Login link navigation

**Multi-language support**: English & French

### 3. Consent Tests (@consent tag)

**Location**: [tests/consent.spec.ts](tests/consent.spec.ts)

**Coverage**:

- Cookie consent banner functionality
- First visit behavior
- Returning user preferences
- Consent acceptance flow

**Multi-language support**: English & French

### Test Execution

Each suite:

- Runs independently and can be executed in parallel
- Includes both positive and negative test scenarios
- Uses Page Object Model for maintainability
- Provides detailed assertions with custom error messages
- Supports multi-language testing

## Technologies & Tools

### Core Technologies

- **[Playwright](https://playwright.dev/)**: Modern end-to-end testing framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[Node.js](https://nodejs.org/)**: JavaScript runtime

### Testing Tools

- **[@playwright/test](https://playwright.dev/docs/test-components)**: Playwright test runner
- **[@faker-js/faker](https://fakerjs.dev/)**: Generate fake data for testing
- **Allure**: Advanced test reporting

### Development Tools

- **[dotenv](https://github.com/motdotla/dotenv)**: Environment variable management
- **TypeScript ESLint**: TypeScript-specific linting rules

### Quality Tools

The project uses several tools to maintain code quality:

- **ESLint**: Enforces coding standards
- **Prettier**: Maintains consistent formatting
- **Husky**: Manages git hooks
- **lint-staged**: Runs checks on staged files

## Future Enhancements

- Add API testing capabilities
- Implement visual regression testing
- Add performance testing
- Expand test coverage for edge cases
- Improve consent for CI

### Commit Convention

Follow conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test-related changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

## Docker Support

Pre-requisit have [docker](https://www.docker.com/) installed and running locally

Build docker image based on Dockerfile

```bash
   docker build -t pw-test .
```

List docker images:

```bash
   docker images
```

Run docker image:

```bash
   docker run -it pw-test
   npm run test:docker
```

### Docker-compose

Another option to use docker-compose which will save reports into local test results folders.

To build a new docker image and run docker-compose:

```bash
   docker-compose up --build
```

To run docker-compose out of existing built image:

```bash
   docker-compose up
```
