<script lang="ts">
  import type { DisplayCall } from './lib/types';

  interface Props {
    handleCall?: () => void;
    handleEndCall?: (sessionId?: unknown) => void;
    handleMicMute?: () => void;
    handleHold?: (sessionId?: unknown, hold?: unknown) => void;
    handlePressKey?: (key: string) => void;
    activeChanel?: DisplayCall;
  }

  // Props
  let { handleCall, handleEndCall, handleMicMute, handleHold, handlePressKey, activeChanel }: Props =
    $props();

  let muted = $derived(activeChanel?.muted === 1);
  let hold = $derived(activeChanel?.hold ?? false);
  let inCall = $derived(activeChanel?.inCall ?? false);
</script>

<div class="flex flex-col items-center p-4 space-y-4">
  <!-- Mute Button -->
  <button
    class={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
      inCall
        ? 'bg-red-500 hover:bg-red-600 text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
    }`}
    disabled={!inCall}
    onclick={handleMicMute}
    aria-label={muted ? 'Unmute Microphone' : 'Mute Microphone'}
  >
    {#if muted}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1V6a1 1 0 011-1h1.586l4.707-4.707C10.923 1.697 12.82 1 14.779 1h0c1.959 0 3.856.697 5.293 2.036l4.707 4.707H21a1 1 0 011 1v7a1 1 0 01-1 1h-1.586l-4.707 4.707C17.403 19.303 15.506 20 13.547 20h-1.018c-1.959 0-3.856-.697-5.293-2.036L5.586 15z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18v-6m0 0V6m0 6h.01" />
      </svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    {/if}
  </button>

  <!-- Hold Button -->
  <button
    class={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
      inCall && !hold
        ? 'bg-green-500 hover:bg-green-600 text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
    }`}
    disabled={!inCall}
    onclick={() => handleHold?.(activeChanel?.sessionId, !hold)}
    aria-label={hold ? 'Resume Call' : 'Hold Call'}
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </button>

  <!-- Keypad -->
  <div class="grid grid-cols-3 gap-4">
    {#each ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'] as key (key)}
      <button
        class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 text-2xl font-semibold text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        onclick={() => handlePressKey?.(key)}
      >
        {key}
      </button>
    {/each}
  </div>

  <!-- Call Button -->
  <button
    class={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
      !inCall
        ? 'bg-green-500 hover:bg-green-600 text-white'
        : 'bg-red-500 hover:bg-red-600 text-white'
    }`}
    onclick={() => (inCall ? handleEndCall?.(activeChanel?.sessionId) : handleCall?.())}
    aria-label={inCall ? 'End Call' : 'Make Call'}
  >
    {#if inCall}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21L5.684 4.28A1 1 0 005 3.28V3z" />
      </svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    {/if}
  </button>
</div>
