<script lang="ts">
  import SettingsBlock from './SettingsBlock.svelte';
  import type { CallRecord, LocalStatePhone } from './types';

  interface Props {
    localStatePhone: LocalStatePhone;
    handleConnectPhone?: (connected?: unknown) => void;
    handleSettingsSlider?: (type?: unknown, value?: unknown) => void;
    handleConnectOnStart?: (checked?: unknown) => void;
    handleNotifications?: (checked?: unknown) => void;
    handleDarkMode?: (checked?: unknown) => void;
    calls?: CallRecord[];
    timelocale?: string;
  }

  let {
    localStatePhone,
    handleConnectPhone,
    handleSettingsSlider,
    handleConnectOnStart,
    handleNotifications,
    handleDarkMode,
    calls = [],
    timelocale = 'UTC'
  }: Props = $props();

  let tab = $state(0);

  function formatTime(ms: number): string {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timelocale
      }).format(new Date(ms));
    } catch {
      return new Date(ms).toLocaleString();
    }
  }
</script>

<div class="border-t border-gray-200 dark:border-gray-700">
  <!-- Tabs -->
  <div class="flex border-b border-gray-200 dark:border-gray-700" role="tablist">
    <button
      role="tab"
      aria-selected={tab === 0}
      data-testid="tab-settings"
      class={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
        tab === 0
          ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
      onclick={() => (tab = 0)}
    >
      Settings
    </button>
    <button
      role="tab"
      aria-selected={tab === 1}
      data-testid="tab-history"
      class={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
        tab === 1
          ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
      onclick={() => (tab = 1)}
    >
      History
    </button>
  </div>

  {#if tab === 0}
    <SettingsBlock
      {localStatePhone}
      {handleConnectPhone}
      {handleSettingsSlider}
      {handleConnectOnStart}
      {handleNotifications}
      {handleDarkMode}
    />
  {:else}
    <div class="p-3" data-testid="call-history">
      {#if calls.length === 0}
        <div class="flex flex-col items-center justify-center gap-1 py-8 text-center text-gray-400 dark:text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-medium">No call history</p>
          <p class="text-xs">Your recent calls will appear here</p>
        </div>
      {:else}
        <ul class="max-h-72 space-y-2 overflow-auto">
          {#each calls as call (call.sessionId + call.time)}
            <li
              data-testid="history-item"
              class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800"
            >
              <span class="flex items-center gap-2">
                <span
                  class={`text-sm font-medium ${call.status === 'missed' ? 'text-red-500' : 'text-green-600'}`}
                >
                  {call.number}
                </span>
                {#if call.direction === 'outgoing'}
                  <span class="text-xs text-green-600" aria-label="Outgoing call">↗</span>
                {:else}
                  <span
                    class="text-xs"
                    class:text-red-500={call.status === 'missed'}
                    class:text-blue-500={call.status !== 'missed'}
                    aria-label="Incoming call"
                  >↙</span>
                {/if}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">{formatTime(call.time)}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>
