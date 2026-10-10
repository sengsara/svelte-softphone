<script lang="ts">
  import '../app.css';
  import '@sengsara/svelte-softphone/style.css';

  let { children } = $props();
</script>

{@render children()}
