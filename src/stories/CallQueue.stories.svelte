<script lang="ts">
  import CallQueue from '../CallQueue.svelte';
  
  let mockCalls = $state([
    {
      id: 1,
      sessionId: '123',
      callNumber: '+1234567890',
      callInfo: 'Incoming Call',
      info: 'from +1234567890',
      direction: 'incoming',
      inCall: false,
      inAnswer: false,
      hold: false,
      muted: 0
    },
    {
      id: 2,
      sessionId: '456',
      callNumber: '+0987654321',
      callInfo: 'Incoming Call',
      info: 'from +0987654321',
      direction: 'incoming',
      inCall: false,
      inAnswer: false,
      hold: false,
      muted: 0
    }
  ]);
  
  let mockHandleAnswer = (sessionId: string) => console.log('Answered:', sessionId);
  let mockHandleReject = (sessionId: string) => console.log('Rejected:', sessionId);
</script>

<div style="height: 400px; width: 300px; margin: 20px;">
  <CallQueue
    calls={mockCalls}
    handleAnswer={mockHandleAnswer}
    handleReject={mockHandleReject}
  />
</div>
