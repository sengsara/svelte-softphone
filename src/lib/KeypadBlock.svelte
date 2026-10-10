<script lang="ts">
  import type { AsteriskAccount, DisplayCall } from './types';
  import SearchList from './SearchList.svelte';

  interface Props {
    handleCall?: () => void;
    handleEndCall?: (sessionId?: unknown) => void;
    handleMicMute?: () => void;
    handleHold?: (sessionId?: unknown, hold?: unknown) => void;
    handlePressKey?: (key: string) => void;
    handleCallTransfer?: (number?: unknown) => void;
    handleCallAttendedTransfer?: (event: string, number?: unknown) => void;
    activeChanel?: DisplayCall;
    asteriskAccounts?: AsteriskAccount[];
    dialState?: string;
    setDialState?: (value: string) => void;
  }

  let {
    handleCall,
    handleEndCall,
    handleMicMute,
    handleHold,
    handlePressKey,
    handleCallTransfer,
    handleCallAttendedTransfer,
    activeChanel,
    asteriskAccounts = [],
    dialState = '',
    setDialState
  }: Props = $props();

  let muted = $derived(activeChanel?.muted === 1);
  let hold = $derived(activeChanel?.hold ?? false);
  let inCall = $derived(activeChanel?.inCall ?? false);
  let inAnswer = $derived(activeChanel?.inAnswer ?? false);
  let inAnswerTransfer = $derived(activeChanel?.inAnswerTransfer ?? false);
  let inConference = $derived(activeChanel?.inConference ?? false);
  let inTransfer = $derived(activeChanel?.inTransfer ?? false);
  let transferControl = $derived(activeChanel?.transferControl ?? false);
  let allowTransfer = $derived(activeChanel?.allowTransfer ?? true);
  let allowAttendedTransfer = $derived(activeChanel?.allowAttendedTransfer ?? true);
  let sessionId = $derived(activeChanel?.sessionId);

  let transferOpen = $state(false);
  let attendedOpen = $state(false);

  let isNumericDial = $derived(/^[0-9]+$/.test(dialState ?? ''));

  function clearDial(): void {
    setDialState?.('');
  }

  function handleClickTransfer(): void {
    if (isNumericDial) {
      handleCallTransfer?.(dialState);
      clearDial();
      return;
    }
    transferOpen = true;
    attendedOpen = false;
  }

  function transferListClick(id: string): void {
    handleCallTransfer?.(id);
  }

  function handleClickAttendedTransfer(): void {
    if (isNumericDial) {
      handleCallAttendedTransfer?.('transfer', {});
      clearDial();
      return;
    }
    attendedOpen = true;
    transferOpen = false;
  }

  function attendedTransferListClick(id: string): void {
    handleCallAttendedTransfer?.('transfer', id);
    clearDial();
  }
</script>

<div class="flex flex-col items-center p-4 space-y-4">
  <!-- Call action buttons -->
  <div class="grid w-full grid-cols-4 gap-3">
    <!-- Mute -->
    <div class="flex justify-center">
      <button
        class={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
          inCall
            ? muted
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
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
    </div>

    <!-- Hold -->
    <div class="flex justify-center">
      <button
        class={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
          inCall && inAnswer
            ? hold
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
        }`}
        disabled={!inCall || !inAnswer}
        onclick={() => handleHold?.(sessionId, !hold)}
        aria-label={hold ? 'Resume Call' : 'Hold Call'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {#if hold}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6" />
          {/if}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>

    <!-- Blind transfer -->
    <div class="relative flex justify-center">
      <button
        class={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
          inCall && inAnswer && !hold && allowTransfer
            ? 'bg-amber-500 hover:bg-amber-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
        }`}
        disabled={!inCall || !inAnswer || hold || !allowTransfer}
        onclick={handleClickTransfer}
        aria-label="Transfer Call"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M12 20v-8m0 0l-3 3m3-3l3 3M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21L5.684 4.28A1 1 0 005 3.28V3z" />
        </svg>
      </button>
      <SearchList
        accounts={asteriskAccounts}
        open={transferOpen}
        onSelect={transferListClick}
        onClose={() => (transferOpen = false)}
      />
    </div>

    <!-- Attended transfer -->
    <div class="relative flex justify-center">
      <button
        class={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
          inCall && inAnswer && !hold && allowAttendedTransfer
            ? 'bg-purple-500 hover:bg-purple-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
        }`}
        disabled={!inCall || !inAnswer || hold || !allowAttendedTransfer}
        onclick={handleClickAttendedTransfer}
        aria-label="Attended Transfer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>
      <SearchList
        accounts={asteriskAccounts}
        open={attendedOpen}
        onSelect={attendedTransferListClick}
        onClose={() => (attendedOpen = false)}
      />
    </div>
  </div>

  <!-- Attended-transfer control row -->
  {#if inAnswerTransfer && !inConference && inTransfer && transferControl}
    <div class="grid w-full grid-cols-4 gap-3">
      <button
        class="h-10 w-10 mx-auto rounded-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white"
        onclick={() => handleCallAttendedTransfer?.('merge', {})}
        aria-label="Conference"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7l4-4m0 0l4 4m-4-4v10M3 21h18" />
        </svg>
      </button>
      <button
        class="h-10 w-10 mx-auto rounded-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white"
        onclick={() => handleCallAttendedTransfer?.('swap', {})}
        aria-label="Swap Caller"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>
      <button
        class="h-10 w-10 mx-auto rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white"
        onclick={() => handleCallAttendedTransfer?.('finish', {})}
        aria-label="Pass Call"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
      <button
        class="h-10 w-10 mx-auto rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white"
        onclick={() => handleCallAttendedTransfer?.('cancel', {})}
        aria-label="Cancel Transfer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/if}

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
    onclick={() => (inCall ? handleEndCall?.(sessionId) : handleCall?.())}
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
