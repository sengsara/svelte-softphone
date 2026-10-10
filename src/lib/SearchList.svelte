<script lang="ts">
  import type { AsteriskAccount } from './types';

  interface Props {
    accounts?: AsteriskAccount[];
    open?: boolean;
    onSelect?: (accountId: string) => void;
    onClose?: () => void;
  }

  let { accounts = [], open = false, onSelect, onClose }: Props = $props();

  let query = $state('');

  let filtered = $derived(
    accounts.filter((account) =>
      `${account.accountId} ${account.label ?? ''}`.toLowerCase().includes(query.toLowerCase())
    )
  );

  function choose(accountId: string): void {
    onSelect?.(accountId);
    query = '';
    onClose?.();
  }
</script>

{#if open}
  <div
    data-testid="search-list"
    class="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
  >
    <div class="border-b border-gray-200 p-2 dark:border-gray-700">
      <input
        type="text"
        bind:value={query}
        placeholder="Search"
        aria-label="Search accounts"
        class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      />
    </div>
    <ul role="listbox" class="max-h-56 overflow-auto py-1">
      {#each filtered as account (account.accountId)}
        <li>
          <button
            type="button"
            role="option"
            aria-selected="false"
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            onclick={() => choose(account.accountId)}
          >
            <span class="font-medium">{account.accountId}</span>
            <span class="flex-1 truncate">{account.label}</span>
            <span
              class="h-2 w-2 shrink-0 rounded-full"
              class:bg-green-500={Number(account.online) === 1}
              class:bg-red-500={Number(account.online) !== 1}
              aria-hidden="true"
            ></span>
          </button>
        </li>
      {:else}
        <li class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No accounts</li>
      {/each}
    </ul>
  </div>
{/if}
