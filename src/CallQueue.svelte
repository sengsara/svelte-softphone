<script lang="ts">
  import type { DisplayCall } from './lib/types';

  interface Props {
    calls?: DisplayCall[];
    handleAnswer?: (sessionId?: unknown) => void;
    handleReject?: (sessionId?: unknown) => void;
  }

  // Props
  let { calls = [], handleAnswer, handleReject }: Props = $props();
</script>

<div class="space-y-2">
  {#each calls as call (call.sessionId)}
    {@const parts = (call.callNumber ?? '').split('-')}
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
      <div class="mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
        {#if call.callNumber}
          <div class="flex items-center mb-1">
            <span class="text-base font-medium text-gray-900 dark:text-white">Caller:</span>
            <span class="ml-1 font-semibold text-blue-600 dark:text-blue-400">
              {parts[0]}
            </span>
          </div>
        {/if}

        {#if parts[1]}
          <div class="mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-400">Jurisdiction:</span>
            <span class="ml-0.5 font-medium">
              {parts[1]}
            </span>
          </div>
        {/if}

        {#if parts[2]}
          <div>
            <span class="text-sm text-gray-600 dark:text-gray-400">Company Number:</span>
            <span class="ml-0.5 font-medium">
              {parts[2]}
            </span>
          </div>
        {/if}
      </div>

      <div class="flex justify-between items-center mt-2">
        <button
          class="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105"
          onclick={() => handleAnswer?.(call.sessionId)}
          aria-label="Answer Call"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
        <button
          class="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105"
          onclick={() => handleReject?.(call.sessionId)}
          aria-label="Reject Call"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21L5.684 4.28A1 1 0 005 3.28V3z" />
          </svg>
        </button>
      </div>
    </div>
  {/each}

  {#if calls.length === 0}
    <div class="text-center text-gray-500 dark:text-gray-400 py-8">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm">No incoming calls</p>
    </div>
  {/if}
</div>
