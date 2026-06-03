<script>
  // Props
  let {
    localStatePhone,
    handleConnectPhone,
    handleSettingsSlider,
    handleConnectOnStart,
    handleNotifications,
    handleDarkMode
  } = $props();
</script>

<div class="p-3 space-y-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
  <!-- Connection Settings -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
    <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Connection</h3>
    
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span class="text-sm text-gray-700 dark:text-gray-300">Auto-Connect</span>
      </div>
      <input
        type="checkbox"
        class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        bind:checked={localStatePhone.connectOnStart}
        oncheckedchange={handleConnectOnStart}
      />
    </div>
    
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span class="text-sm text-gray-700 dark:text-gray-300">
          {localStatePhone.connectedPhone ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <input
        type="checkbox"
        class="w-5 h-5 text-green-500 rounded focus:ring-green-500"
        bind:checked={localStatePhone.connectedPhone}
        oncheckedchange={() => handleConnectPhone(null, true)}
      />
    </div>
  </div>

  <!-- Notifications Settings -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
    <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Notifications</h3>
    
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span class="text-sm text-gray-700 dark:text-gray-300">Notifications</span>
      </div>
      <input
        type="checkbox"
        class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        bind:checked={localStatePhone.notifications}
        oncheckedchange={handleNotifications}
      />
    </div>
  </div>

  <!-- Volume Settings -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
    <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Volume</h3>
    
    <!-- Call Audio Volume -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.929a5 5 0 01-7.072 0m-5.828-9.929a5 5 0 017.072 0M6 7h12" />
          </svg>
          <span class="text-sm text-gray-700 dark:text-gray-300">Call Audio</span>
        </div>
        <span class="text-xs text-gray-500">{Math.round(localStatePhone.callVolume * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        bind:value={localStatePhone.callVolume}
        oninput={(e) => handleSettingsSlider('callVolume', parseFloat(e.target.value))}
      />
    </div>
    
    <!-- Ringtone Volume -->
    <div>
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.929a5 5 0 01-7.072 0m-5.828-9.929a5 5 0 017.072 0M6 7h12" />
          </svg>
          <span class="text-sm text-gray-700 dark:text-gray-300">Ringtone</span>
        </div>
        <span class="text-xs text-gray-500">{Math.round(localStatePhone.ringVolume * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        bind:value={localStatePhone.ringVolume}
        oninput={(e) => handleSettingsSlider('ringVolume', parseFloat(e.target.value))}
      />
    </div>
  </div>
</div>
