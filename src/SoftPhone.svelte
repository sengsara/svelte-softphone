<script lang="ts">
  import type { CallsFlowControl } from './lib/CallsFlowControl';
  import type { LocalStatePhone } from './lib/types';
  import KeypadBlock from './KeypadBlock.svelte';
  import CallQueue from './CallQueue.svelte';
  import StatusBlock from './StatusBlock.svelte';
  import SettingsBlock from './SettingsBlock.svelte';
  import SwipeCarouselBlock from './SwipeCarouselBlock.svelte';

  interface Props {
    flowRoute?: CallsFlowControl;
    localStatePhone: LocalStatePhone;
    activeChannel: number;
    setActiveChannel: (channel: number) => void;
    handleCall?: (event?: unknown) => void;
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

  // Props
  let {
    flowRoute: _flowRoute,
    localStatePhone,
    activeChannel,
    setActiveChannel,
    handleCall,
    handleEndCall,
    handleHold,
    handleMicMute,
    handleAnswer,
    handleReject,
    handleCallTransfer: _handleCallTransfer,
    handleCallAttendedTransfer: _handleCallAttendedTransfer,
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
  let builtInLauncher = $state(false);
  let launcherOpen = $state(false);
  let softPhoneOpen = $state(true);

  // Get current open state
  let isOpen = $derived(builtInLauncher ? launcherOpen : softPhoneOpen);

  // Setters for internal panel/launcher visibility
  function setLauncherOpen(value: boolean): void {
    launcherOpen = value;
  }

  function setSoftPhoneOpen(value: boolean): void {
    softPhoneOpen = value;
  }

  // Handle launcher toggle
  function handleLauncherToggle(): void {
    if (builtInLauncher) {
      setLauncherOpen(!launcherOpen);
    } else {
      setSoftPhoneOpen(!softPhoneOpen);
    }
  }

  // Handle settings open
  function handleSettingsOpen(): void {
    // Open settings modal
  }
</script>

<div class="relative w-full h-full">
  <!-- Launcher (built-in) -->
  {#if builtInLauncher}
    {#if isOpen}
      <div class="fixed z-50 inset-0 bg-black/50">
        <div class="fixed left-1/2 -translate-x-1/2 bottom-20 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h1 class="text-lg font-medium text-gray-900 dark:text-white">Softphone</h1>
            <button
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onclick={() => setLauncherOpen(false)}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-4 space-y-4">
            <!-- Connection Status -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">Connection</span>
              <div class="flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{localStatePhone.connectedPhone ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>

            <!-- Connect Button -->
            <button
              class="w-full py-2 rounded-lg font-medium transition-colors bg-green-500 hover:bg-green-600 text-white"
              onclick={() => propHandleConnectPhone?.(!localStatePhone.connectedPhone)}
            >
              {localStatePhone.connectedPhone ? 'Disconnect' : 'Connect'}
            </button>

            <!-- Settings Toggle -->
            <button
              class="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              onclick={() => (propHandleSettingsOpen ?? handleSettingsOpen)()}
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Floating launcher button (always visible) -->
    <button
      class="fixed z-50 bottom-6 right-6 shadow-lg rounded-full p-4 text-white bg-green-500 hover:bg-green-600"
      onclick={() => (propHandleLauncherToggle ?? handleLauncherToggle)()}
      aria-label="Toggle Softphone"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    </button>
  {:else}
    <!-- Softphone Panel -->
    <div class:hidden={!isOpen} class="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 transition-transform">
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h1 class="text-lg font-medium text-gray-900 dark:text-white">Softphone</h1>
          <button
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onclick={() => setSoftPhoneOpen(false)}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          <SwipeCarouselBlock
            {localStatePhone}
            {activeChannel}
            {setActiveChannel}
          />

          <CallQueue
            calls={localStatePhone.displayCalls.filter((c) => !c.inCall)}
            {handleAnswer}
            {handleReject}
          />

          <StatusBlock
            connectingPhone={localStatePhone.displayCalls.some((c) => c.direction === 'incoming' && !c.inCall)}
            connectedPhone={localStatePhone.connectedPhone}
          />

          <SettingsBlock
            {localStatePhone}
            handleConnectPhone={propHandleConnectPhone}
            handleSettingsSlider={propHandleSettingsSlider}
            handleConnectOnStart={propHandleConnectOnStart}
            handleNotifications={propHandleNotifications}
            {handleDarkMode}
            {handleUserPresence}
          />
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Keypad Block -->
{#if softPhoneOpen}
  <KeypadBlock
    {handleCall}
    {handleEndCall}
    {handleMicMute}
    {handleHold}
    {handlePressKey}
    activeChanel={localStatePhone.displayCalls[activeChannel]}
  />
{/if}
