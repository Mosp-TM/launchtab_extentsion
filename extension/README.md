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

## Development

```bash
bun run dev
```

Reload the extension in `chrome://extensions` after changes.

## Features (local-only)

- Shortcuts, notes, themes, wallpapers, clock
- AI sidebar via your own OpenRouter/DeepSeek API keys (stored locally)
- No backend server required
