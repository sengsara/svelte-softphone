# @sengsara/svelte-softphone

[![Svelte 5](https://img.shields.io/badge/Svelte-5-blue.svg)](https://svelte.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4.svg)](https://tailwindcss.com)
[![Storybook](https://img.shields.io/badge/Storybook-10-FF4785.svg)](https://storybook.js.org)

A modern, self-contained **Svelte 5 softphone component package** built on
[JsSIP](https://jssip.net/) for reliable WebRTC/VoIP calling. It ships a clean,
responsive UI with multi-channel call support, dark mode, and an optional
floating launcher.

> Converted from the original [React Softphone](https://github.com/chamuridis/react-softphone)
> to Svelte 5 and packaged as a reusable component library.

## 📱 Interface Preview

![Softphone Interface](docs/images/softphone-interface.png)

*Clean interface with call controls, settings panel, and multi-channel support*

## ✨ Features

- ⚡ **Svelte 5 runes** — `$state`, `$derived`, `$effect`, `$props`
- 📦 **Tree-shakeable package** — built with `svelte-package`, ships `.svelte` + `.d.ts`
- 📞 **WebRTC VoIP** — real SIP calling via JsSIP
- 🎯 **Call management** — hold, mute, blind & attended transfer, conference/swap/pass, multi-channel
- 🔔 **Incoming-call notifications** and ring/ringback audio
- 🕓 **Call history** with timezone-aware timestamps
- ⚙️ **Settings** — auto-connect, notifications, call & ring volume (persistable)
- 🎨 **Tailwind CSS 4** — styles compiled to a single importable stylesheet
- 🖥️ **Modular components** — keypad, call queue, status, settings/history, carousel
- 🌙 **Dark mode** and a configurable built-in launcher (position/size/color)

## 📦 Installation

```bash
pnpm add @sengsara/svelte-softphone
```

`jssip` and `svelte` are peer dependencies:

```bash
pnpm add jssip
```

## 🚀 Usage

Import the components, the JsSIP engine, and the compiled stylesheet:

```svelte
<script lang="ts">
  import {
    SoftPhone,
    CallsFlowControl,
    type SipConfig,
    type LocalStatePhone
  } from '@sengsara/svelte-softphone';
  import '@sengsara/svelte-softphone/style.css';

  const config: SipConfig = {
    domain: 'your-sip-server.com',
    port: 5060,
    wsUrl: 'wss://your-sip-server.com:8089/ws',
    secret: 'your-sip-secret',
    debug: false
  };

  const flowRoute = new CallsFlowControl();

  let localStatePhone = $state<LocalStatePhone>({
    displayCalls: [],
    connectedPhone: false,
    darkMode: false,
    notifications: true,
    callVolume: 0.8,
    ringVolume: 0.8,
    connectOnStart: false
  });

  let activeChannel = $state(0);
</script>

<SoftPhone
  {flowRoute}
  {localStatePhone}
  {activeChannel}
  setActiveChannel={(v) => (activeChannel = v)}
  handleCall={(n) => flowRoute.call(String(n))}
  handleEndCall={(id) => flowRoute.hungup(String(id))}
  handleMicMute={() => flowRoute.setMicMuted()}
  handleAnswer={(id) => flowRoute.answer(String(id))}
  handleReject={(id) => flowRoute.hungup(String(id))}
/>
```

### Styling

The package ships a pre-compiled Tailwind stylesheet. Import it once:

```ts
import '@sengsara/svelte-softphone/style.css';
```

Prefer generating styles yourself? Skip the stylesheet and add the package to
your Tailwind source scan instead:

```css
@import 'tailwindcss';
@source '../node_modules/@sengsara/svelte-softphone/dist';
```

## 🧩 Exports

| Export | Description |
|--------|-------------|
| `SoftPhone` | Main softphone panel + optional launcher |
| `KeypadBlock` | Dial pad, call controls, blind/attended transfer |
| `CallQueue` | Incoming/pending call queue |
| `StatusBlock` | Internet + softphone connection status |
| `SettingsBlock` | Volume, notifications, connection settings |
| `SwipeCarouselBlock` | Swipeable multi-channel carousel |
| `SwipeCarouselBodyBlock` | Settings / call-history tabs |
| `SearchList` | Asterisk account picker for transfers |
| `CallsFlowControl` | JsSIP engine (call lifecycle & audio & state) |
| `style.css` | Compiled component styles |

### `SoftPhone` props

| Prop | Type | Description |
|------|------|-------------|
| `flowRoute` | `CallsFlowControl` | JsSIP engine instance |
| `localStatePhone` | `LocalStatePhone` | Phone state object |
| `activeChannel` | `number` | Active channel index |
| `setActiveChannel` | `(v: number) => void` | Set active channel |
| `accounts` | `AsteriskAccount[]` | Accounts offered in the transfer picker |
| `timelocale` | `string` | Timezone for call-history timestamps |
| `dialState` / `setDialState` | `string` / `(v: string) => void` | Dial-number input (two-way) |
| `notifyMessage` / `onNotifyClose` | `string` / `() => void` | Toast message + dismiss |
| `softPhoneOpen` / `setSoftPhoneOpen` | `boolean` / `(v: boolean) => void` | Panel visibility |
| `builtInLauncher` | `boolean` | Show the floating launcher |
| `launcherPosition` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | Launcher position |
| `launcherSize` | `'small' \| 'medium' \| 'large'` | Launcher size |
| `launcherColor` | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info'` | Launcher color |
| `handleCall` | `() => void` | Place an outgoing call |
| `handleEndCall` | `(sessionId) => void` | End a call |
| `handleHold` | `(sessionId, hold) => void` | Hold/resume |
| `handleMicMute` | `() => void` | Toggle microphone mute |
| `handleAnswer` / `handleReject` | `(sessionId) => void` | Answer/reject an incoming call |
| `handleCallTransfer` / `handleCallAttendedTransfer` | `(number) => void` / `(event, number) => void` | Blind / attended transfer |
| `handleConnectPhone` | `(connected: boolean) => void` | Connect/disconnect the SIP stack |
| `handleConnectOnStart` / `handleNotifications` | `(value: boolean) => void` | Persisted settings |
| `handleSettingsSlider` | `(type, value) => void` | Volume sliders |
| `handleDarkMode` / `handleUserPresence` | `(value) => void` | Theme / presence |

### `CallsFlowControl` (engine)

| Method | Description |
|--------|-------------|
| `init()` / `start()` / `stop()` | Initialize and control the SIP stack |
| `call(number)` | Place an outgoing call |
| `answer(sessionId)` / `hungup(sessionId)` | Answer / terminate a call |
| `hold(sessionId, hold)` | Hold or resume |
| `setMicMuted()` / `sendDTMF(code)` | Mute toggle / DTMF tones |
| `playRing()` / `stopRing()` / `startRingback()` / `stopRingback()` | Ring/ringback audio |
| `player` / `ringer` / `ringbackTone` | Audio elements assigned by the app |
| `onCallActionConnection` / `onEngineEvent` | Callbacks for UI state wiring |

## 📁 Repository structure

```
.
├── src/lib/                # The published component package
│   ├── index.ts            # Public API
│   ├── SoftPhone.svelte    # ... and the other components
│   ├── CallsFlowControl.ts # JsSIP engine
│   ├── types.ts            # Shared types
│   └── tailwind.css        # Tailwind entry compiled to dist/style.css
├── src/stories/            # Storybook stories
├── examples/
│   ├── svelte/             # Vite + Svelte example app
│   └── sveltekit/          # SvelteKit example app
├── e2e/                    # Playwright specs + `app/` harness + JsSIP mock
├── .github/workflows/      # ci.yml (build/lint/test) + publish.yml (npm)
├── svelte.config.js        # svelte-package config
└── playwright.config.ts
```

## 🛠 Development

```bash
pnpm install

# Build the package (svelte-package + Tailwind CSS)
pnpm run build

# Storybook (component docs)
pnpm run storybook

# Static checks
pnpm run check
pnpm run lint

# End-to-end tests (builds the package, boots e2e/app)
pnpm run e2e
```

Examples live in pnpm workspaces and consume the built package:

```bash
pnpm run build
pnpm --filter @sengsara/svelte-softphone-example-svelte dev
pnpm --filter @sengsara/svelte-softphone-example-sveltekit dev
```

## 🧪 Testing

The Playwright suite runs the real components in Chromium with the JsSIP layer
replaced by a controllable mock (`e2e/mocks/jssip.ts`) via the harness app in
`e2e/app`, so call flows are exercised without a SIP server. Coverage includes
the app shell, connection lifecycle, incoming/outgoing calls, answer/reject,
mute, hold/resume, blind and attended transfer, settings, status indicators, and
the channel carousel.

```bash
pnpm run e2e:install   # one-time: install Chromium
pnpm run e2e           # run the suite
pnpm run e2e:ui        # interactive mode
```

## 🚢 Releasing

Publishing is automated via `.github/workflows/publish.yml`:

1. Bump the version in `package.json` and push a tag: `git tag v1.0.1 && git push --tags`.
2. The workflow verifies (lint, types, e2e), builds, validates with
   [`publint`](https://publint.dev/), and publishes `@sengsara/svelte-softphone`
   to npm using the `NPM_TOKEN` repository secret.

The package is published with `--access public` (see `publishConfig`).

## 📄 License

ISC
