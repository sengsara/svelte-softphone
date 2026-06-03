<script>
  import { onMount } from 'svelte';
  
  // Simple class for call flow control
  class CallsFlowControl {
    constructor() {
      this.activeChanel = null;
      this.connectedPhone = false;
      this.engineEvent = null;
      this.player = null;
      this.ringer = null;
      this.ringbackTone = null;
      this.config = null;
      this.onCallActionConnection = null;
    }
    
    init() {
      console.log('CallsFlowControl initialized');
    }
    
    start() {
      console.log('Starting softphone connection...');
    }
    
    stop() {
      console.log('Stopping softphone connection...');
    }
    
    call(number) {
      console.log(`Making call to: ${number}`);
    }
    
    hungup(sessionId) {
      console.log(`Ending call: ${sessionId}`);
    }
    
    hold(sessionId) {
      console.log(`Holding call: ${sessionId}`);
    }
    
    unhold(sessionId) {
      console.log(`Resuming call: ${sessionId}`);
    }
    
    setMicMuted() {
      console.log('Toggling microphone mute');
    }
    
    answer(sessionId) {
      console.log(`Answering call: ${sessionId}`);
    }
    
    sendDTMF(code) {
      console.log(`Sending DTMF: ${code}`);
    }
    
    tmpEvent() {
      console.log('Temporary event triggered');
    }
  }
  
  // Props - use $props() with defaults as function call
  let {
    timelocale = 'utc',
    setConnectOnStartToLocalStorage = () => {},
    connectOnStart = false,
    asteriskAccounts = [],
    setNotifications = () => {},
    notifications = false,
    setCallVolume = () => {},
    setRingVolume = () => {},
    callVolume = 0.5,
    ringVolume = 0.5,
    config = {
      ws_servers: ['wss://example.com/ws']
    },
    builtInLauncher = false,
    launcherPosition = 'bottom-right',
    launcherSize = 'medium',
    launcherColor = 'primary',
    softPhoneOpen = true,
    setSoftPhoneOpen = () => {}
  } = $props();
  
  let player = null;
  let ringer = null;
  let launcherOpen = $state(false);
  let drawerOpen = $state(false);
  let dialState = $state('');
  let activeChannel = $state(0);
  let localStatePhone = $state({
    displayCalls: [
      {
        id: 0,
        info: 'Ch 1',
        hold: false,
        muted: 0,
        inCall: false,
        inAnswer: false,
        callInfo: 'Ready',
        callNumber: '',
        duration: 0,
        sessionId: ''
      },
      {
        id: 1,
        info: 'Ch 2',
        hold: false,
        muted: 0,
        inCall: false,
        inAnswer: false,
        callInfo: 'Ready',
        callNumber: '',
        duration: 0,
        sessionId: ''
      },
      {
        id: 2,
        info: 'Ch 3',
        hold: false,
        muted: 0,
        inCall: false,
        inAnswer: false,
        callInfo: 'Ready',
        callNumber: '',
        duration: 0,
        sessionId: ''
      }
    ],
    connectOnStart: false,
    notifications: false,
    phoneCalls: [],
    connectedPhone: false,
    connectingPhone: false,
    callVolume: 0.5,
    ringVolume: 0.5
  });
  let notificationState = $state({ open: false, message: '' });
  let calls = $state([]);
  let flowRoute = null;
  
  // Sync drawerOpen with softPhoneOpen
  $effect(() => {
    drawerOpen = softPhoneOpen;
  });
  
  // Methods - no bindable, just regular exports
  
  let notify = (message) => {
    notificationState.open = true;
    notificationState.message = message;
  };
  
  let requestNotificationPermission = () => {
    if (window.Notification) {
      window.Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  };
  
  let handleClose = () => {
    notificationState.open = false;
  };
  
  // Initialize on mount
  onMount(() => {
    flowRoute = new CallsFlowControl();
    
    // Set up media elements
    try {
      if (player) {
        player.defaultMuted = false;
        player.autoplay = true;
        player.volume = localStatePhone.callVolume;
      }
      
      if (ringer) {
        ringer.src = '/sound/ringing.ogg';
        ringer.loop = true;
        ringer.volume = localStatePhone.ringVolume;
      }
      
      if (flowRoute) {
        flowRoute.player = player;
        flowRoute.ringer = ringer;
      }
    } catch (e) {
      console.error('Media session error:', e);
    }
    
    // Initialize if connectOnStart is true
    if (localStatePhone.connectOnStart) {
      handleConnectPhone(null, true);
    }
  });
  
  // Handle launcher toggle
  let handleLauncherToggle = () => {
    if (builtInLauncher) {
      launcherOpen = !launcherOpen;
      softPhoneOpen = !launcherOpen;
    }
  };
  
  // Expose methods
  export {
    notify,
    requestNotificationPermission,
    handleClose,
    handleConnectPhone,
    handleSettingsSlider,
    handleConnectOnStart,
    handleNotifications,
    handleDarkMode,
    handleUserPresence,
    handlePressKey,
    handleCall,
    handleEndCall,
    handleHold,
    handleAnswer,
    handleReject,
    handleMicMute,
    handleCallTransfer,
    handleCallAttendedTransfer,
    handleSettingsButton
  };
  
  // Get current open state
  let isOpen = $derived(builtInLauncher ? launcherOpen : softPhoneOpen);
</script>

<div class="min-h-screen font-sans">
  {#if builtInLauncher}
    <div class="fixed bottom-6 right-6 z-50">
      <button
        class={`fixed z-50 shadow-lg rounded-full p-4 text-white ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        }`}
        onclick={handleLauncherToggle}
        aria-label="Toggle Softphone"
      >
        {#if isOpen}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        {/if}
      </button>
    </div>
  {/if}
  
  <div class={`fixed ${builtInLauncher ? 'right-0' : 'w-full'} h-full`} 
       style="${builtInLauncher ? 'right: 0;' : 'width: 100%;'}">
    <div class="flex flex-col h-full bg-white dark:bg-gray-900">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h1 class="text-lg font-medium text-gray-900 dark:text-white">Softphone</h1>
        <button
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          onclick={() => builtInLauncher ? setLauncherOpen(false) : setSoftPhoneOpen(false)}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <!-- Placeholder for components -->
        <div class="flex-1 overflow-auto p-4">
          <div class="text-center text-gray-500 dark:text-gray-400 py-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p class="text-lg font-medium">Softphone Application</p>
            <p class="text-sm mt-2">This is a placeholder component. The full application would include call controls, keypad, and settings.</p>
          </div>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-600 dark:text-gray-400">Internet: <span class={navigator.onLine ? 'text-green-500' : 'text-red-500'}>{navigator.onLine ? 'Online' : 'Offline'}</span></span>
          <span class="text-gray-600 dark:text-gray-400">Status: <span class={localStatePhone.connectedPhone ? 'text-green-500' : 'text-gray-400'}>{localStatePhone.connectedPhone ? 'Connected' : 'Disconnected'}</span></span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Hidden audio elements -->
  <div style="display: none;">
    <audio preload="auto" bind:this={player}></audio>
  </div>
  <div style="display: none;">
    <audio preload="auto" bind:this={ringer}></audio>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
