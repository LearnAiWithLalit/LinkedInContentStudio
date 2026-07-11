# Signal — LinkedIn Content Studio

A privacy-first, human-in-the-loop workspace for planning and writing thoughtful LinkedIn content.

## What it does

- Turns an original idea into a structured draft
- Provides four reusable writing frameworks
- Offers an editable LinkedIn-style preview
- Checks basic readability signals
- Saves drafts locally in the browser
- Includes a lightweight content calendar
- Opens LinkedIn for final manual review and publishing
- Creates animated 4:5 visuals and exports GIFs entirely in the browser
- Supports an optional user-provided OpenRouter key for free image models

It does **not** automate LinkedIn, scrape profiles, store credentials, or create inauthentic engagement.

## Run locally

```bash
npm install
npm run dev
```

## Privacy

Drafts use browser `localStorage`. No account, backend, token, or LinkedIn credential is required.

OpenRouter keys are optional and kept only in the current tab's memory. The project does not provide a shared key or automatically fall back to paid models.
