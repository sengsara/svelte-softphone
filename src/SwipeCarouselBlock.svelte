<script lang="ts">
  import type { LocalStatePhone } from './lib/types';

  interface DurationState {
    callDuration: number;
    callDurationIntrId: number;
    callDurationActive: boolean;
    ringDuration: number;
    ringDurationIntrId: number;
    ringDurationActive: boolean;
  }

  interface Props {
    localStatePhone: LocalStatePhone;
    activeChannel: number;
    setActiveChannel: (channel: number) => void;
  }

  // Props
  let { localStatePhone, activeChannel, setActiveChannel }: Props = $props();
  
  // Duration tracking state
  let durations = $state<DurationState[]>([
    {
      callDuration: 0,
      callDurationIntrId: 0,
      callDurationActive: false,
      ringDuration: 0,
      ringDurationIntrId: 0,
      ringDurationActive: false
    },
    {
      callDuration: 0,
      callDurationIntrId: 0,
      callDurationActive: false,
      ringDuration: 0,
      ringDurationIntrId: 0,
      ringDurationActive: false
    },
    {
      callDuration: 0,
      callDurationIntrId: 0,
      callDurationActive: false,
      ringDuration: 0,
      ringDurationIntrId: 0,
      ringDurationActive: false
    }
  ]);
  
  const ONE_SECOND = 1000;
  
  // Timer effect for tracking call durations
  $effect(() => {
    const displayCalls = localStatePhone.displayCalls || [];
    const interval = setInterval(() => {
      for (let i = 0; i < displayCalls.length; i++) {
        const displayCall = displayCalls[i];
        const duration = durations[i];
        if (!duration) continue;
        if (displayCall.inCall) {
          if (!displayCall.inAnswer && !durations[i].ringDurationActive) {
            durations[i].ringDuration += 1;
          } else if (displayCall.inAnswer && !durations[i].callDurationActive) {
            durations[i].callDuration += 1;
            durations[i].ringDurationActive = false;
          }
        } else {
          if (durations[i].callDuration !== 0 || durations[i].ringDuration !== 0) {
            durations[i].callDuration = 0;
            durations[i].callDurationActive = false;
            durations[i].ringDuration = 0;
            durations[i].ringDurationActive = false;
          }
        }
      }
    }, ONE_SECOND);
    
    return () => clearInterval(interval);
  });
  
  function formatTime(seconds?: number): string {
    if (seconds === 0 || seconds === undefined) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<div class="w-full">
  <!-- Tabs Navigation -->
  <div class="bg-gray-100 dark:bg-gray-800 px-2 pt-2">
    <div class="flex space-x-0" role="tablist">
      <button
        role="tab"
        aria-selected={activeChannel === 0}
        aria-controls="full-width-tabpanel-0"
        id="full-width-tab-0"
        class={`px-6 py-3 text-sm font-medium transition-colors ${
          activeChannel === 0
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        onclick={() => setActiveChannel(0)}
      >
        Ch 1
      </button>
      <button
        role="tab"
        aria-selected={activeChannel === 1}
        aria-controls="full-width-tabpanel-1"
        id="full-width-tab-1"
        class={`px-6 py-3 text-sm font-medium transition-colors ${
          activeChannel === 1
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        onclick={() => setActiveChannel(1)}
      >
        Ch 2
      </button>
      <button
        role="tab"
        aria-selected={activeChannel === 2}
        aria-controls="full-width-tabpanel-2"
        id="full-width-tab-2"
        class={`px-6 py-3 text-sm font-medium transition-colors ${
          activeChannel === 2
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        onclick={() => setActiveChannel(2)}
      >
        Ch 3
      </button>
    </div>
  </div>
  
  <!-- Tab Content with Horizontal Scroll -->
  <div class="overflow-x-auto overflow-y-hidden no-scrollbar" style="scroll-snap-type: x mandatory;">
    <div class="flex space-x-0 min-w-max">
{#each Array.from({ length: 3 }).map((_, i) => i) as index (index)}
        <div
          id={`full-width-tabpanel-${index}`}
          role="tabpanel"
          data-testid={`carousel-panel-${index}`}
          aria-labelledby={`full-width-tab-${index}`}
          class={`w-full min-w-[300px] p-3 border-b-2 ${
            activeChannel === index
              ? 'border-blue-600 dark:border-blue-400'
              : 'border-transparent'
          }`}
          style="scroll-snap-align: start;"
        >
          {#if Object.hasOwn(localStatePhone.displayCalls || {}, index)}
            {#if localStatePhone.displayCalls[index].inCall === true}
              {#if localStatePhone.displayCalls[index].inAnswer === true}
                {#if localStatePhone.displayCalls[index].hold === true}
                  <!-- Hold Call Info -->
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-2">
                    <div class="flex items-center space-x-2 mb-2">
                      <div class="w-4 h-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span class="text-sm font-medium text-yellow-600 dark:text-yellow-400">On Hold</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Status</span>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {localStatePhone.displayCalls[index].callInfo}
                        </p>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Direction</span>
                        <div class="flex items-center mt-0.5">
                          {#if localStatePhone.displayCalls[index].direction === 'outgoing'}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.5 3-4.5 3M19 10a2 2 0 01-2 2H9a2 2 0 01-2-2V8a2 2 0 012-2h4a2 2 0 012 2v2z" />
                            </svg>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Outgoing</span>
                          {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l-4.5-3-4.5 3M3 8a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                            </svg>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Incoming</span>
                          {/if}
                        </div>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Ring Duration</span>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatTime(durations[index].ringDuration)}
                        </p>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Call Duration</span>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatTime(durations[index].callDuration)}
                        </p>
                      </div>
                      <div class="col-span-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400">Number</span>
                        <div class="flex items-center mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span class="text-sm font-semibold text-gray-900 dark:text-white">
                            {localStatePhone.displayCalls[index].callNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                {:else if localStatePhone.displayCalls[index].inTransfer === true}
                  <!-- In Transfer Info -->
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-2">
                    <div class="flex items-center space-x-2 mb-2">
                      <div class="w-4 h-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <span class="text-sm font-medium text-blue-600 dark:text-blue-400">In Transfer</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Status</span>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {localStatePhone.displayCalls[index].callInfo}
                        </p>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Direction</span>
                        <div class="flex items-center mt-0.5">
                          {#if localStatePhone.displayCalls[index].direction === 'outgoing'}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.5 3-4.5 3M19 10a2 2 0 01-2 2H9a2 2 0 01-2-2V8a2 2 0 012-2h4a2 2 0 012 2v2z" />
                            </svg>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Outgoing</span>
                          {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l-4.5-3-4.5 3M3 8a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                            </svg>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Incoming</span>
                          {/if}
                        </div>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Ring Duration</span>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatTime(durations[index].ringDuration)}
                        </p>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Call Duration</span>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatTime(durations[index].callDuration)}
                        </p>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Number</span>
                        <div class="flex items-center mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span class="text-sm font-semibold text-gray-900 dark:text-white">
                            {localStatePhone.displayCalls[index].callNumber}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Transfer To</span>
                        <p class="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {localStatePhone.displayCalls[index].transferNumber}
                        </p>
                      </div>
                      {#if localStatePhone.displayCalls[index].attendedTransferOnline && localStatePhone.displayCalls[index].attendedTransferOnline.length > 1 && !localStatePhone.displayCalls[index].inConference}
                        <div class="col-span-2">
                          <span class="text-xs text-gray-500 dark:text-gray-400">Talking With</span>
                          <p class="text-sm font-semibold text-green-600 dark:text-green-400">
                            {localStatePhone.displayCalls[index].attendedTransferOnline}
                          </p>
                        </div>
                      {/if}
                    </div>
                  </div>
                {:else}
                  <!-- Active Call Info -->
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-2">
                    <div class="flex items-center space-x-2 mb-2">
                      <div class="w-4 h-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span class="text-sm font-medium text-green-600 dark:text-green-400">Active Call</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Status</span>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {localStatePhone.displayCalls[index].callInfo}
                        </p>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Direction</span>
                        <div class="flex items-center mt-0.5">
                          {#if localStatePhone.displayCalls[index].direction === 'outgoing'}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.5 3-4.5 3M19 10a2 2 0 01-2 2H9a2 2 0 01-2-2V8a2 2 0 012-2h4a2 2 0 012 2v2z" />
                            </svg>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Outgoing</span>
                          {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l-4.5-3-4.5 3M3 8a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                            </svg>
                            <span class="text-sm text-gray-700 dark:text-gray-300">Incoming</span>
                          {/if}
                        </div>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Ring Duration</span>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatTime(durations[index].ringDuration)}
                        </p>
                      </div>
                      <div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Call Duration</span>
                        <p class="text-sm font-semibold text-green-600 dark:text-green-400">
                          {formatTime(durations[index].callDuration)}
                        </p>
                      </div>
                      <div class="col-span-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400">Number</span>
                        <div class="flex items-center mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span class="text-sm font-semibold text-gray-900 dark:text-white">
                            {localStatePhone.displayCalls[index].callNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                {/if}
              {:else}
                <!-- Calling/Ringing Info -->
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-2">
                  <div class="flex items-center space-x-2 mb-2">
                    <div class="w-4 h-4 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m3-4h.01M4.636 6.364l14.126-14.126M19.293 7.707l-9.636 9.636M15.707 19.293l-14.126 14.126" />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-yellow-600 dark:text-yellow-400">Ringing</span>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span class="text-xs text-gray-500 dark:text-gray-400">Status</span>
                      <p class="text-sm font-semibold text-gray-900 dark:text-white">
                        {localStatePhone.displayCalls[index].callInfo} {localStatePhone.displayCalls[index].info}
                      </p>
                    </div>
                    <div>
                      <span class="text-xs text-gray-500 dark:text-gray-400">Direction</span>
                      <div class="flex items-center mt-0.5">
                        {#if localStatePhone.displayCalls[index].direction === 'outgoing'}
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.5 3-4.5 3M19 10a2 2 0 01-2 2H9a2 2 0 01-2-2V8a2 2 0 012-2h4a2 2 0 012 2v2z" />
                          </svg>
                          <span class="text-sm text-gray-700 dark:text-gray-300">Outgoing</span>
                        {:else}
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l-4.5-3-4.5 3M3 8a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                          <span class="text-sm text-gray-700 dark:text-gray-300">Incoming</span>
                        {/if}
                      </div>
                    </div>
                    <div>
                      <span class="text-xs text-gray-500 dark:text-gray-400">Ring Duration</span>
                      <p class="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                        {formatTime(durations[index].ringDuration)}
                      </p>
                    </div>
                    <div class="col-span-2">
                      <span class="text-xs text-gray-500 dark:text-gray-400">Number</span>
                      <div class="flex items-center mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span class="text-sm font-semibold text-gray-900 dark:text-white">
                          {localStatePhone.displayCalls[index].callNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
            {:else}
              <!-- Ready Info -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-2">
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-4 h-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Ready</span>
                </div>
                
                <div class="mt-2">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Status</span>
                  <p class="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {localStatePhone.displayCalls[index].callInfo} {localStatePhone.displayCalls[index].info}
                  </p>
                </div>
              </div>
            {/if}
          {:else}
            <!-- No Call Info Placeholder -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-2">
              <div class="text-center text-gray-400 dark:text-gray-500 py-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm">No active call</p>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
  
  <style>
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  </style>
</div>