<script>
  // Props
  let {
    connectingPhone,
    connectedPhone
  } = $props();
  
  // Internet connection state
  let internetConnected = $state(navigator.onLine);
  
  // Monitor internet connection
  $effect(() => {
    const handleOnline = () => { internetConnected = true; };
    const handleOffline = () => { internetConnected = false; };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
  
  // Get softphone status chip
  let getSoftphoneStatusChip = () => {
    if (!internetConnected) {
      return {
        icon: 'offline-icon',
        label: 'Offline',
        color: 'red'
      };
    }
    
    if (connectingPhone) {
      return {
        icon: 'connecting-icon',
        label: 'Connecting',
        color: 'blue'
      };
    }
    
    return {
      icon: connectedPhone ? 'online-icon' : 'offline-icon',
      label: connectedPhone ? 'Online' : 'Offline',
      color: connectedPhone ? 'green' : 'red'
    };
  };
  
  // Get internet status chip
  let getInternetStatusChip = () => {
    return {
      icon: internetConnected ? 'online-icon' : 'offline-icon',
      label: internetConnected ? 'Online' : 'Offline',
      color: internetConnected ? 'green' : 'red'
    };
  };
</script>

<div class="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
  <div class="flex flex-col space-y-2">
    <!-- Internet Status -->
    <div class="flex justify-between items-center">
      <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Internet</span>
      <div
        data-testid="status-internet"
        class={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          internetConnected
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>{getInternetStatusChip().label}</span>
      </div>
    </div>
    
    <!-- Softphone Status -->
    <div class="flex justify-between items-center">
      <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Softphone Connection</span>
      <div
        data-testid="status-softphone"
        class={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          getSoftphoneStatusChip().color === 'red'
            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
            : getSoftphoneStatusChip().color === 'green'
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
        }`}
      >
        {#if getSoftphoneStatusChip().icon === 'online-icon'}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        {:else if getSoftphoneStatusChip().icon === 'offline-icon'}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        {/if}
        <span>{getSoftphoneStatusChip().label}</span>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
