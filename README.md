# Svelte Softphone

[![Svelte 5](https://img.shields.io/badge/Svelte-5-blue.svg)](https://svelte.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4.svg)](https://tailwindcss.com)
[![Storybook](https://img.shields.io/badge/Storybook-10-FF4785.svg)](https://storybook.js.org)

A modern, self-contained SIP softphone component built with **Svelte 5** and **JSSIP** for reliable VoIP/WebRTC calling. Features a clean, responsive UI with multi-channel call support, dark mode, and optional floating launcher.

> Converted from the original [React Softphone](https://github.com/chamuridis/react-softphone) to Svelte 5.

## 📱 Interface Preview

![Softphone Interface](docs/images/softphone-interface.png)

*Clean interface with call controls, settings panel, and multi-channel support*

## ✨ Features

- ⚡ **Svelte 5 Runes** — Built with `$state`, `$derived`, `$effect`, and `$props`
- 🔌 **Self-Contained** — JSSIP is the only runtime dependency; no UI framework bloat
- 📦 **Vite Powered** — Lightning-fast HMR and production builds
- 🎨 **Tailwind CSS 4** — Utility-first styling with dark mode support
- 📞 **WebRTC VoIP** — Real SIP calling via JSSIP (JsSIP)
- 🧪 **Storybook v10** — Component-level stories with Vitest + Playwright testing
- 🎯 **Call Management** — Hold, transfer, mute, and attended transfer
- 🖥️ **Modular Components** — Keypad, Call Queue, Status, Settings, Swipe Carousel
- 🌙 **Dark Mode** — Toggle between light and dark themes

## 📦 Project Structure

```
svelte-softphone/
├── src/
│   ├── App.svelte              # Root app with SIP config and call routing
│   ├── SoftPhone.svelte         # Main softphone panel & launcher
│   ├── KeypadBlock.svelte       # Dial pad with call controls
│   ├── CallQueue.svelte         # Incoming/pending call queue
│   ├── StatusBlock.svelte       # Connection status indicator
│   ├── SettingsBlock.svelte     # Volume, notifications, dark mode
│   ├── SwipeCarouselBlock.svelte # Swipeable call tab carousel
│   ├── stories/                 # Storybook component stories
│   ├── lib/
│   │   ├── CallsFlowControl.ts  # JSSIP engine — call lifecycle & state
│   │   ├── constants.ts         # Debug logging utilities
│   │   └── types.ts             # Shared types + global type declarations
│   ├── main.ts                  # App entry point
│   └── app.css                  # Global styles
├── .storybook/                  # Storybook configuration
├── vite.config.ts               # Vite + Vitest + Storybook test config
├── tailwind.config.js           # Tailwind CSS 4 config
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A SIP/VoIP server (Asterisk, FreeSWITCH, etc.) with WebSocket transport

### Installation

```bash
# Clone the repository
git clone https://github.com/wijayadi/svelte-softphone.git
cd svelte-softphone

# Install dependencies
npm install

# Start the development server
npm run dev

# Open Storybook for component exploration
npm run storybook

# Build for production
npm run build
```

### Basic Usage

```svelte
<script>
  import SoftPhone from 'svelte-softphone';
  import { CallsFlowControl } from 'svelte-softphone/lib/CallsFlowControl';

  const flowRoute = new CallsFlowControl();
  let localStatePhone = $state({
    displayCalls: [],
    connectedPhone: false,
    darkMode: false,
    notifications: true,
    callVolume: 0.8,
    ringVolume: 0.8,
    connectOnStart: false
  });
  let activeChannel = $state(0);
  let dialState = $state('');

  let config = $state({
    domain: 'your-sip-server.com',
    port: 5060,
    wsUrl: 'wss://your-sip-server.com:8089/ws',
    secret: 'your-sip-secret',
    debug: false
  });

  function connect() {
    flowRoute.config = config;
    flowRoute.init();
    flowRoute.start();
  }
</script>

<SoftPhone
  flowRoute={flowRoute}
  localStatePhone={localStatePhone}
  activeChannel={activeChannel}
  setActiveChannel={(v) => activeChannel = v}
  handleCall={(number) => flowRoute.call(number)}
  handleEndCall={(id) => flowRoute.hungup(id)}
  handleHold={(id, h) => flowRoute.hold(id, h)}
  handleMicMute={() => flowRoute.setMicMuted()}
  handleAnswer={(id) => flowRoute.answer(id)}
  handleReject={(id) => flowRoute.hungup(id)}
/>

<button onclick={connect}>Connect to SIP</button>
```

## 🔧 Props Reference

### SoftPhone Component

| Prop | Type | Description |
|------|------|-------------|
| `flowRoute` | `CallsFlowControl` | JSSIP engine instance |
| `localStatePhone` | `object` | Phone state object (see below) |
| `activeChannel` | `number` | Index of the currently active call |
| `setActiveChannel` | `(v: number) => void` | Callback to set active channel |
| `handleCall` | `(number: string) => void` | Initiate an outgoing call |
| `handleEndCall` | `(sessionId: string) => void` | End a call by session ID |
| `handleHold` | `(sessionId: string, hold: boolean) => void` | Hold or resume a call |
| `handleMicMute` | `() => void` | Toggle microphone mute |
| `handleAnswer` | `(sessionId: string) => void` | Answer an incoming call |
| `handleReject` | `(sessionId: string) => void` | Reject an incoming call |
| `handleCallTransfer` | `(number: string) => void` | Blind transfer a call |
| `handleCallAttendedTransfer` | `(event, number) => void` | Attended transfer control |
| `handleDarkMode` | `(checked: boolean) => void` | Toggle dark mode |
| `handlePressKey` | `(key: string) => void` | Dial pad key press handler |
| `builtInLauncher` | `boolean` | Show floating launcher button |

### Local State Phone Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `displayCalls` | `Call[]` | `[]` | Array of displayed calls |
| `connectedPhone` | `boolean` | `false` | SIP connection status |
| `darkMode` | `boolean` | `false` | Dark theme toggle |
| `notifications` | `boolean` | `true` | Browser notifications |
| `callVolume` | `number` | `0.8` | Call audio volume (0–1) |
| `ringVolume` | `number` | `0.8` | Ring tone volume (0–1) |
| `connectOnStart` | `boolean` | `false` | Auto-connect on mount |

### CallsFlowControl (JSSIP Engine)

| Method | Params | Description |
|--------|--------|-------------|
| `init()` | — | Initialize the SIP user agent |
| `start()` | — | Start the SIP stack |
| `stop()` | — | Stop the SIP stack |
| `call(number)` | `string` | Place an outgoing call |
| `answer(sessionId)` | `string` | Answer an incoming call |
| `hungup(sessionId)` | `string` | Terminate a call |
| `hold(sessionId, hold)` | `string, boolean` | Hold/resume a call |
| `setMicMuted()` | — | Toggle microphone mute |
| `sendDTMF(code)` | `string` | Send DTMF tone |
| `config` | `object` | SIP configuration setter |

## 🎵 Audio Files

Place these audio files in your project assets for call sounds:

- `ringing.ogg` — Incoming call ringtone
- `ringback.ogg` — Outgoing call ringback tone

## 🧪 Testing

```bash
# Run Storybook with Vitest browser tests
npm run build-storybook

# Run linting
npm run lint
npm run lint:fix

# Run type checking
npm run check
```

## 🌐 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 60+ |
| Firefox | 55+ |
| Safari | 11+ (with WebRTC) |
| Edge | 79+ |

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Svelte | 5 | UI framework with runes |
| Vite | 5 | Build tool & dev server |
| Tailwind CSS | 4 | Utility-first CSS |
| JSSIP | 3.13 | SIP/WebRTC engine |
| Storybook | 10 | Component playground |
| Vitest | 4 | Testing framework |
| Playwright | 1.60 | Browser testing |
| TypeScript | 5 | Type safety |
| ESLint | 10 | Code linting |

## 📄 License

ISC © [chamuridis](https://github.com/chamuridis) → Converted by [wijayadi](https://github.com/wijayadi)
