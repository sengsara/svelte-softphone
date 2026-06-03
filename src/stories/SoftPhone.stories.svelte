<script lang="ts">
  import SoftPhone from '../SoftPhone.svelte';
  
  // Mock localStatePhone
  let mockLocalStatePhone = $state({
    connectedPhone: false,
    connectOnStart: false,
    notifications: true,
    callVolume: 50,
    ringVolume: 50,
    displayCalls: [
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
        muted: 0,
        inTransfer: false,
        transferNumber: '',
        attendedTransferOnline: [],
        inConference: false,
        callDuration: 0,
        ringDuration: 0
      }
    ]
  });
  
  let mockActiveChannel = $state(0);
  let mockSetActiveChannel = (channel: number) => { mockActiveChannel = channel; };
  
  // Mock handlers
  let mockHandleCall = () => console.log('Call initiated');
  let mockHandleEndCall = () => console.log('Call ended');
  let mockHandleHold = () => console.log('Call held');
  let mockHandleMicMute = () => console.log('Mic muted');
  let mockHandleAnswer = () => console.log('Call answered');
  let mockHandleReject = () => console.log('Call rejected');
  let mockHandleCallTransfer = () => console.log('Transfer initiated');
  let mockHandleCallAttendedTransfer = () => console.log('Attended transfer');
  let mockHandleSettingsButton = () => console.log('Settings button');
  let mockHandleDarkMode = (checked: boolean) => console.log('Dark mode:', checked);
  let mockHandleUserPresence = () => console.log('User presence');
  let mockHandlePressKey = () => {};
  let mockHandleLauncherToggle = () => console.log('Launcher toggled');
  let mockHandleSettingsOpen = () => console.log('Settings opened');
  let mockHandleConnectPhone = (connected: boolean) => { mockLocalStatePhone.connectedPhone = connected; };
  let mockHandleConnectOnStart = (checked: boolean) => { mockLocalStatePhone.connectOnStart = checked; };
  let mockHandleNotifications = (checked: boolean) => { mockLocalStatePhone.notifications = checked; };
  let mockHandleSettingsSlider = (type: string, value: number) => {
    if (type === 'callVolume') mockLocalStatePhone.callVolume = value;
    else if (type === 'ringVolume') mockLocalStatePhone.ringVolume = value;
  };
  let mockHandleUserPresenceStatus = () => {};
</script>

<div style="height: 100vh; width: 100%;">
  <SoftPhone
    flowRoute={null}
    localStatePhone={mockLocalStatePhone}
    activeChannel={mockActiveChannel}
    setActiveChannel={mockSetActiveChannel}
    handleCall={mockHandleCall}
    handleEndCall={mockHandleEndCall}
    handleHold={mockHandleHold}
    handleMicMute={mockHandleMicMute}
    handleAnswer={mockHandleAnswer}
    handleReject={mockHandleReject}
    handleCallTransfer={mockHandleCallTransfer}
    handleCallAttendedTransfer={mockHandleCallAttendedTransfer}
    handleSettingsButton={mockHandleSettingsButton}
    handleDarkMode={mockHandleDarkMode}
    handleUserPresence={mockHandleUserPresence}
    handlePressKey={mockHandlePressKey}
    handleLauncherToggle={mockHandleLauncherToggle}
    handleSettingsOpen={mockHandleSettingsOpen}
    handleConnectPhone={mockHandleConnectPhone}
    handleConnectOnStart={mockHandleConnectOnStart}
    handleNotifications={mockHandleNotifications}
    handleSettingsSlider={mockHandleSettingsSlider}
    handleUserPresenceStatus={mockHandleUserPresenceStatus}
  />
</div>
