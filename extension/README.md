# LaunchTab Chrome Extension

## Build

```bash
bun install
bun run build
```

Output: `dist-extension/`

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist-extension` folder

## Optional backend

Cloud auth, sync, analytics, and Muradian AI session APIs need a deployed backend.

Copy `.env.example` to `.env` and set:

```
VITE_API_BASE_URL=https://your-backend-url.com
```

Without this, local features still work: shortcuts, notes, themes, direct AI provider calls.

## Development

```bash
bun run dev
```

Then reload the extension in `chrome://extensions` after code changes.

## Web version (legacy)

```bash
bun run dev:web
bun run build:web
```
