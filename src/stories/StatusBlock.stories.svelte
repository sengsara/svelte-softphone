<script lang="ts">
  import StatusBlock from '../StatusBlock.svelte';
  
  let mockConnectingPhone = $state(false);
  let mockConnectedPhone = $state(false);
</script>

<div style="height: 200px; width: 300px; margin: 20px;">
  <StatusBlock
    connectingPhone={mockConnectingPhone}
    connectedPhone={mockConnectedPhone}
  />
</div>
