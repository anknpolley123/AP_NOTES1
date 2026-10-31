# AP Notes Pro

**AP Notes Pro** is a note-taking and study workspace built with React, TypeScript, and Vite. It combines note editing and organization with AI-assisted writing, OCR scanning, document export, PDF utilities, and optional Firebase-powered account and collaboration features.

> **Project status:** This repository contains an actively developed application. Some screens, integrations, and actions may be experimental, incomplete, or dependent on service configuration. Test the features you need before relying on them.

## Contents
- [Highlights](#highlights)
- [Technology stack](#technology-stack)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Environment configuration](#environment-configuration)
- [Build and checks](#build-and-checks)
- [Android packaging](#android-packaging)
- [Data, privacy, and security](#data-privacy-and-security)
- [Known limitations](#known-limitations)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [Developer](#developer)

## Highlights

### Notes and organization
- Create and edit notes in a dedicated editor.
- Organize notes with folders, tags, pinning, and search.
- Use the recycle-bin flow for soft-deleted notes.
- The current storage service uses browser localStorage for ordinary notes.

### AI-assisted study and writing
The AI service includes functions for:
- Summarizing and refining text.
- Generating and formatting documents.
- Extracting action items and checking spelling.
- Translating text and suggesting tags.
- Asking questions about a note, generating quizzes, and creating study plans.

These functions use Google's Gemini API and require a correctly configured API key. AI results can be inaccurate and should be reviewed.

### OCR and scanning
- Capture an image using the device camera or select an image/file.
- Crop an image before processing.
- Extract text from images with the Gemini-powered OCR flow.
- Review extracted text before using it.

OCR quality depends on image clarity, language, layout, and the AI service.

### Documents and PDF tools
- Export note content to PDF and DOCX.
- Generate spreadsheet and presentation files through the editor's document tools.
- Merge PDF files and split a PDF into individual-page files.
- Explore notes through a visual knowledge graph.

### Accounts and cloud-related features
- Firebase Authentication and Firestore integration are included in the codebase.
- The project contains collaborative-note and cloud-storage screens.
- Actual availability depends on Firebase configuration, permissions, and the completeness of each integration. Do not assume every displayed provider or control is fully operational.

## Technology stack
- **UI:** React 19, TypeScript, Tailwind CSS
- **Development/build:** Vite
- **AI:** Google GenAI SDK (Gemini)
- **Backend services:** Firebase Authentication and Cloud Firestore
- **Android wrapper:** Capacitor
- **Document handling:** jsPDF, pdf-lib, PDF.js, docx, pptxgenjs, and xlsx
- **Progressive web app:** Vite PWA tooling

## Requirements
- Node.js and npm (use a currently supported Node.js LTS release).
- A Gemini API key for AI and OCR features.
- Firebase configuration for authentication, Firestore, and cloud-dependent features.
- Android Studio and the Android SDK if you want to open/build the native Android project.

## Run locally
1. Clone the repository:

   ```bash
   git clone https://github.com/anknpolley123/AP_NOTES1.git
   cd AP_NOTES1
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the environment variables described below.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local address printed by Vite in your terminal. The development script uses port **3000**.

## Environment configuration
The repository includes an .env.example template. Create a local .env.local file and set the values required for your development environment, for example:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

The exact variables needed depend on the features you use. Firebase settings are defined through the project's Firebase configuration file.

**Security note:** Vite variables referenced by browser-side code can become visible to users in the built JavaScript. Do not treat a key embedded in a client application as secret. Never commit real API keys, credentials, tokens, or private configuration to Git. For a public deployment, route privileged AI requests through a trusted server-side endpoint with suitable authentication, rate limits, and usage controls. Rotate any key that has been accidentally exposed.

## Build and checks
Create a production build:

```bash
npm run build
```

Run the TypeScript check configured by the project:

```bash
npm run lint
```

Preview a production build locally:

```bash
npm run preview
```

The lint script currently runs tsc --noEmit; it is a TypeScript check, not a full style-linting suite.

## Android packaging
This project uses Capacitor and sets its web build directory to dist.

After configuring the Android development environment, build the web app and synchronize it with the native project:

```bash
npm run build
npm run cap:sync
npm run cap:open
```

The last command opens the Android project in Android Studio. Building or signing a release APK/AAB may require additional Android SDK, Gradle, signing, and device-permission configuration. Review the Capacitor documentation and test on a device before distributing a build.

## Data, privacy, and security
- **Local notes:** The current storage service uses browser localStorage. Clearing site data, changing browser profiles, or uninstalling an app/web container may remove locally stored notes. Keep independent backups of important material.
- **AI requests:** Text or images submitted to AI-powered features may be sent to Google's Gemini service for processing. Avoid submitting passwords, financial details, private records, or other sensitive information.
- **Firebase:** Account and cloud features communicate with Firebase when configured. Review your Firebase Authentication setup, Firestore security rules, access controls, and privacy requirements before deployment.
- **Permissions:** Camera, file access, and other device capabilities should be granted only when needed.
- **Exports:** Files exported to your device may be accessible to other apps or people with access to that device.
- **Secrets:** Do not commit .env.local or any real credentials. Client-side configuration is not a substitute for server-side access control.

See [Disclaimer.md](./Disclaimer.md) for the full project disclaimer.

## Known limitations
- The repository is under active development; UI elements do not necessarily indicate that a related backend integration is complete.
- AI and OCR depend on network connectivity, API availability, quotas, and a valid key.
- AI-generated text, OCR, translations, study material, and document conversions may contain errors.
- Firebase/cloud collaboration features require correct service configuration and security rules.
- This project has no guarantee of compatibility with every browser, Android version, device, document, or file format.

## Contributing
Bug reports and focused pull requests are welcome. Before submitting a change:
1. Describe the problem or improvement clearly.
2. Keep credentials and personal data out of commits and screenshots.
3. Run npm run build and npm run lint when possible.
4. Include reproducible steps for reported bugs.

## Disclaimer
AP Notes Pro is provided for educational and productivity purposes and is supplied on an “as is” and “as available” basis, subject to applicable law. AI output is not guaranteed to be accurate or suitable for a particular purpose. You are responsible for reviewing outputs, protecting your data and API keys, complying with third-party service terms, and maintaining backups. Read [Disclaimer.md](./Disclaimer.md) before using or deploying the project.

## Developer
**Ankon Polley**  
GitHub: [@anknpolley123](https://github.com/anknpolley123)

---

If you find an issue, please open an issue in this repository with a clear description and steps to reproduce it.
