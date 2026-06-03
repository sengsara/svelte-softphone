<script>
  import { onMount } from 'svelte';
  import CallsFlowControl from './CallsFlowControl.svelte';
  import KeypadBlock from './KeypadBlock.svelte';
  import CallQueue from './CallQueue.svelte';
  import StatusBlock from './StatusBlock.svelte';
  import SettingsBlock from './SettingsBlock.svelte';
  import SwipeCarouselBlock from './SwipeCarouselBlock.svelte';
  
  // Props
  let {
    flowRoute,
    localStatePhone,
    activeChannel,
    setActiveChannel,
    handleCall,
    handleEndCall,
    handleHold,
    handleMicMute,
    handleAnswer,
    handleReject,
    handleCallTransfer,
    handleCallAttendedTransfer,
    handleSettingsButton,
    handleDarkMode,
    handleUserPresence,
    handlePressKey,
    handleLauncherToggle: propHandleLauncherToggle,
    handleSettingsOpen: propHandleSettingsOpen,
    handleConnectPhone: propHandleConnectPhone,
    handleConnectOnStart: propHandleConnectOnStart,
    handleNotifications: propHandleNotifications,
    handleSettingsSlider: propHandleSettingsSlider,
    handleUserPresenceStatus: propHandleUserPresenceStatus
  } = $props();
  
  // Internal state for this component
  let builtInLauncher = $state(false);
  let launcherOpen = $state(false);
  let softPhoneOpen = $state(false);
  
  // Get current open state
  let isOpen = $derived(builtInLauncher ? launcherOpen : softPhoneOpen);
  
  // Initialize CallsFlowControl if not provided
  $effect(() => {
    if (!flowRoute && !builtInLauncher) {
      const flow = new CallsFlowControl();
      flowRoute = flow;
    }
  });
  
  // Handle launcher toggle
  function handleLauncherToggle() {
    if (builtInLauncher) {
      setLauncherOpen(!launcherOpen);
    } else {
      setSoftPhoneOpen(!softPhoneOpen);
    }
  }
  
  // Handle settings open
  function handleSettingsOpen() {
    // Open settings modal
  }
  
  // Handle connect phone
  function handleConnectPhone(connected) {
    localStatePhone.connectedPhone = connected;
  }
  
  // Handle connect on start
  function handleConnectOnStart(checked) {
    localStatePhone.connectOnStart = checked;
  }
  
  // Handle notifications
  function handleNotifications(checked) {
    localStatePhone.notifications = checked;
  }
  
  // Handle settings slider (volume)
  function handleSettingsSlider(type, value) {
    if (type === 'callVolume') {
      localStatePhone.callVolume = value;
    } else if (type === 'ringVolume') {
      localStatePhone.ringVolume = value;
    }
  }
  
  // Handle user presence status
  function handleUserPresenceStatus(status) {
    // Update presence status
  }
</script>

<div class="relative w-full h-full">
  <!-- Launcher Button (Built-in) -->
  {#if builtInLauncher}
    <div class:open={isOpen} class:hidden={!isOpen} class="fixed z-50 inset-0 bg-black/50">
      <button
        class="fixed z-50 shadow-lg rounded-full p-4 text-white bg-green-500 hover:bg-green-600"
        onclick={() => propHandleLauncherToggle?.() || handleLauncherToggle()}
        aria-label="Toggle Softphone"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- Launcher Menu -->
      {#if isOpen}
        <div class="fixed left-1/2 -translate-x-1/2 bottom-20 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h1 class="text-lg font-medium text-gray-900 dark:text-white">Softphone</h1>
            <button
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onclick={() => builtInLauncher ? setLauncherOpen(false) : setSoftPhoneOpen(false)}
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
              <div class:connected={localStatePhone.connectedPhone} class:disconnected={!localStatePhone.connectedPhone} class="flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{localStatePhone.connectedPhone ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
            
            <!-- Connect Button -->
            <button
              class:connected={localStatePhone.connectedPhone} class:disconnected={!localStatePhone.connectedPhone} class="w-full py-2 rounded-lg font-medium transition-colors bg-green-500 hover:bg-green-600 text-white"
              onclick={() => propHandleConnectPhone?.(!localStatePhone.connectedPhone) || handleConnectPhone(!localStatePhone.connectedPhone)}
            >
              {localStatePhone.connectedPhone ? 'Disconnect' : 'Connect'}
            </button>
            
            <!-- Settings Toggle -->
            <button
              class="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              onclick={propHandleSettingsOpen?.() || handleSettingsOpen()}
            >
              Settings
            </button>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <!-- Softphone Panel -->
    <div class:open={isOpen} class:hidden={!isOpen} class="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 transition-transform">
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h1 class="text-lg font-medium text-gray-900 dark:text-white">Softphone</h1>
          <button
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onclick={() => softPhoneOpen = false}
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
            localStatePhone={localStatePhone}
            activeChannel={activeChannel}
            setActiveChannel={setActiveChannel}
          />
          
          <CallQueue
            calls={localStatePhone.displayCalls.filter(c => !c.inCall)}
            handleAnswer={handleAnswer}
            handleReject={handleReject}
          />
          
          <StatusBlock
            connectingPhone={localStatePhone.displayCalls.some(c => c.direction === 'incoming' && !c.inCall)}
            connectedPhone={localStatePhone.connectedPhone}
          />
          
          <SettingsBlock
            localStatePhone={localStatePhone}
            handleConnectPhone={handleConnectPhone}
            handleSettingsSlider={handleSettingsSlider}
            handleConnectOnStart={handleConnectOnStart}
            handleNotifications={handleNotifications}
            handleDarkMode={handleDarkMode}
            handleUserPresence={handleUserPresence}
          />
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Keypad Block -->
{#if softPhoneOpen}
  <KeypadBlock
    handleCall={handleCall}
    handleEndCall={handleEndCall}
    handleMicMute={handleMicMute}
    handleHold={handleHold}
    activeChanel={localStatePhone.displayCalls[activeChannel]}
  />
{/if}
