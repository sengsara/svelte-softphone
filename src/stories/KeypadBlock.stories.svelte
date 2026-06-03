<script lang="ts">
  import KeypadBlock from '../KeypadBlock.svelte';
  
  let mockActiveChanel = $state({
    sessionId: '123',
    callNumber: '+1234567890',
    callInfo: 'Active Call',
    info: 'from +1234567890',
    direction: 'outgoing',
    inCall: true,
    inAnswer: true,
    hold: false,
    muted: 0
  });
  
  let mockHandleCall = () => console.log('Call initiated');
  let mockHandleEndCall = () => console.log('Call ended');
  let mockHandleMicMute = () => console.log('Mic muted');
  let mockHandleHold = (sessionId: string, unhold: boolean) => console.log('Call', unhold ? 'unheld' : 'held');
</script>

<div style="height: 400px; width: 300px; margin: 20px;">
  <KeypadBlock
    handleCall={mockHandleCall}
    handleEndCall={mockHandleEndCall}
    handleMicMute={mockHandleMicMute}
    handleHold={mockHandleHold}
    activeChanel={mockActiveChanel}
  />
</div>
