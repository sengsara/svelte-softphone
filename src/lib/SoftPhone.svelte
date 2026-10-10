<script lang="ts">
  import type { CallsFlowControl } from './CallsFlowControl';
  import type { AsteriskAccount, LocalStatePhone } from './types';
  import KeypadBlock from './KeypadBlock.svelte';
  import CallQueue from './CallQueue.svelte';
  import StatusBlock from './StatusBlock.svelte';
  import SwipeCarouselBlock from './SwipeCarouselBlock.svelte';
  import SwipeCarouselBodyBlock from './SwipeCarouselBodyBlock.svelte';

  type LauncherPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  type LauncherSize = 'small' | 'medium' | 'large';

  interface Props {
    flowRoute?: CallsFlowControl;
    localStatePhone: LocalStatePhone;
    activeChannel: number;
    setActiveChannel: (channel: number) => void;
    accounts?: AsteriskAccount[];
    timelocale?: string;
    dialState?: string;
    setDialState?: (value: string) => void;
    notifyMessage?: string;
    onNotifyClose?: () => void;
    softPhoneOpen?: boolean;
    setSoftPhoneOpen?: (value: boolean) => void;
    builtInLauncher?: boolean;
    launcherPosition?: LauncherPosition;
    launcherSize?: LauncherSize;
    launcherColor?: string;
    handleCall?: () => void;
    handleEndCall?: (sessionId?: unknown) => void;
    handleHold?: (sessionId?: unknown, hold?: unknown) => void;
    handleMicMute?: () => void;
    handleAnswer?: (sessionId?: unknown) => void;
    handleReject?: (sessionId?: unknown) => void;
    handleCallTransfer?: (number?: unknown) => void;
    handleCallAttendedTransfer?: (event: string, number?: unknown) => void;
    handleSettingsButton?: () => void;
    handleDarkMode?: (checked?: unknown) => void;
    handleUserPresence?: (status?: unknown) => void;
    handlePressKey?: (key?: unknown) => void;
    handleLauncherToggle?: () => void;
    handleSettingsOpen?: () => void;
    handleConnectPhone?: (connected?: unknown) => void;
    handleConnectOnStart?: (checked?: unknown) => void;
    handleNotifications?: (checked?: unknown) => void;
    handleSettingsSlider?: (type?: unknown, value?: unknown) => void;
    handleUserPresenceStatus?: (status?: unknown) => void;
  }

  let {
    flowRoute: _flowRoute,
    localStatePhone,
    activeChannel,
    setActiveChannel,
    accounts = [],
    timelocale = 'UTC',
    dialState = '',
    setDialState,
    notifyMessage = '',
    onNotifyClose,
    softPhoneOpen: propSoftPhoneOpen,
    setSoftPhoneOpen: propSetSoftPhoneOpen,
    builtInLauncher = false,
    launcherPosition = 'bottom-right',
    launcherSize = 'medium',
    launcherColor = 'primary',
    handleCall,
    handleEndCall,
    handleHold,
    handleMicMute,
    handleAnswer,
    handleReject,
    handleCallTransfer,
    handleCallAttendedTransfer,
    handleSettingsButton: _handleSettingsButton,
    handleDarkMode,
    handleUserPresence,
    handlePressKey,
    handleLauncherToggle: propHandleLauncherToggle,
    handleSettingsOpen: propHandleSettingsOpen,
    handleConnectPhone: propHandleConnectPhone,
    handleConnectOnStart: propHandleConnectOnStart,
    handleNotifications: propHandleNotifications,
    handleSettingsSlider: propHandleSettingsSlider,
    handleUserPresenceStatus: _propHandleUserPresenceStatus
  }: Props = $props();

  // Internal state for this component
  let launcherOpen = $state(false);
  let internalSoftPhoneOpen = $state(true);

  let softPhoneOpen = $derived(propSoftPhoneOpen ?? internalSoftPhoneOpen);
  let isOpen = $derived(builtInLauncher ? launcherOpen : softPhoneOpen);

  function setSoftPhoneOpen(value: boolean): void {
    if (propSetSoftPhoneOpen) {
      propSetSoftPhoneOpen(value);
    } else {
      internalSoftPhoneOpen = value;
    }
  }

  const launcherPositionClasses: Record<LauncherPosition, string> = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const launcherSizeClasses: Record<LauncherSize, string> = {
    small: 'h-10 w-10',
    medium: 'h-14 w-14',
    large: 'h-[72px] w-[72px]'
  };

  const launcherColorClasses: Record<string, string> = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-purple-500 hover:bg-purple-600',
    success: 'bg-green-500 hover:bg-green-600',
    error: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-amber-500 hover:bg-amber-600',
    info: 'bg-cyan-500 hover:bg-cyan-600'
  };

  let launcherButtonClass = $derived(
    `${launcherPositionClasses[launcherPosition]} ${launcherSizeClasses[launcherSize]} ${
      launcherColorClasses[launcherColor] ?? launcherColorClasses.primary
    }`
  );

  // Handle launcher toggle
  function handleLauncherToggle(): void {
    launcherOpen = !launcherOpen;
  }

  // Handle settings open
  function handleSettingsOpen(): void {
    // Open settings modal
  }

  function handleDialInput(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      handleCall?.();
    }
  }

  function clearDial(): void {
    setDialState?.('');
  }
</script>

<div class="relative w-full h-full">
  <!-- Built-in launcher -->
  {#if builtInLauncher}
    {#if isOpen}
      <div class="fixed inset-0 z-40 bg-black/50">
        <div class="fixed bottom-20 left-1/2 w-80 -translate-x-1/2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <h1 class="text-lg font-medium text-gray-900 dark:text-white">Softphone</h1>
            <button
              class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onclick={() => (launcherOpen = false)}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-4 p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">Connection</span>
              <span class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                {localStatePhone.connectedPhone ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              class="w-full rounded-lg bg-green-500 py-2 font-medium text-white transition-colors hover:bg-green-600"
              onclick={() => (propHandleConnectPhone ?? (() => {}))(!localStatePhone.connectedPhone)}
            >
              {localStatePhone.connectedPhone ? 'Disconnect' : 'Connect'}
            </button>
            <button
              class="w-full rounded-lg bg-blue-500 py-2 font-medium text-white transition-colors hover:bg-blue-600"
              onclick={() => (propHandleSettingsOpen ?? handleSettingsOpen)()}
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    {/if}

    <button
      class={`fixed z-50 ${launcherButtonClass} flex items-center justify-center rounded-full text-white shadow-lg`}
      onclick={() => (propHandleLauncherToggle ?? handleLauncherToggle)()}
      aria-label="Toggle Softphone"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    </button>
  {:else}
    <!-- Softphone panel -->
    <div class:hidden={!isOpen} class="fixed right-0 top-0 h-full w-80 bg-white shadow-xl border-l border-gray-200 dark:border-gray-700 dark:bg-gray-800 transition-transform">
      <div class="flex h-full flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <h1 class="text-lg font-medium text-gray-900 dark:text-white">Softphone</h1>
          <button
            class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onclick={() => (builtInLauncher ? (launcherOpen = false) : setSoftPhoneOpen(false))}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          <CallQueue calls={localStatePhone.phoneCalls} {handleAnswer} {handleReject} />

          <SwipeCarouselBlock {localStatePhone} {activeChannel} {setActiveChannel} />

          <!-- Dial input -->
          <div class="px-3 pt-3">
            <div class="flex items-center rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-600 dark:bg-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <input
                type="text"
                aria-label="Phone Number"
                placeholder="Phone Number"
                class="flex-1 bg-transparent px-2 py-2 text-lg tracking-wide text-gray-900 focus:outline-none dark:text-white"
                value={dialState}
                oninput={(event) => setDialState?.(event.currentTarget.value)}
                onkeyup={handleDialInput}
              />
              {#if dialState}
                <button
                  class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  onclick={clearDial}
                  aria-label="clear number"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              {/if}
            </div>
          </div>

          <KeypadBlock
            {handleCall}
            {handleEndCall}
            {handleMicMute}
            {handleHold}
            {handlePressKey}
            {handleCallTransfer}
            {handleCallAttendedTransfer}
            {dialState}
            {setDialState}
            asteriskAccounts={accounts}
            activeChanel={localStatePhone.displayCalls[activeChannel]}
          />

          <SwipeCarouselBodyBlock
            {localStatePhone}
            calls={localStatePhone.callHistory}
            {timelocale}
            handleConnectPhone={propHandleConnectPhone}
            handleSettingsSlider={propHandleSettingsSlider}
            handleConnectOnStart={propHandleConnectOnStart}
            handleNotifications={propHandleNotifications}
            {handleDarkMode}
          />

          <StatusBlock
            connectingPhone={localStatePhone.connectingPhone}
            connectedPhone={localStatePhone.connectedPhone}
          />
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Notification toast -->
{#if notifyMessage}
  <div
    data-testid="notification"
    role="alert"
    class="fixed bottom-6 left-1/2 z-50 flex max-w-sm -translate-x-1/2 items-center gap-3 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900 shadow-lg dark:bg-amber-900 dark:text-amber-100"
  >
    <span>{notifyMessage}</span>
    <button class="ml-auto font-medium" onclick={() => onNotifyClose?.()} aria-label="Dismiss">✕</button>
  </div>
{/if}
