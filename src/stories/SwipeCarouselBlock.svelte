<script lang="ts">
  import SwipeCarouselBlock from '../SwipeCarouselBlock.svelte';
  
  let mockLocalStatePhone = $state({
    displayCalls: [
      {
        id: 1,
        sessionId: '123',
        callNumber: '+1234567890',
        callInfo: 'Active Call',
        info: 'from +1234567890',
        direction: 'outgoing',
        inCall: true,
        inAnswer: true,
        hold: false,
        muted: 0,
        inTransfer: false,
        transferNumber: '',
        attendedTransferOnline: [],
        inConference: false,
        callDuration: 120,
        ringDuration: 0
      }
    ]
  });
  
  let mockActiveChannel = $state(0);
  let mockSetActiveChannel = (channel: number) => { mockActiveChannel = channel; };
</script>

<div style="height: 400px; width: 900px; margin: 20px;">
  <SwipeCarouselBlock
    localStatePhone={mockLocalStatePhone}
    activeChannel={mockActiveChannel}
    setActiveChannel={mockSetActiveChannel}
  />
</div>
