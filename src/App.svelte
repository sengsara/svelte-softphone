<script>
  import SoftPhone from './SoftPhone.svelte';
  import CallsFlowControl from './CallsFlowControl.svelte';
  
  // JSSIP configuration
  let config = $state({
    domain: 'localhost',
    port: 5060,
    wsUrl: 'ws://localhost:5060',
    secret: 'your-secret-here',
    debug: false
  });
  
  // Create flow route instance
  let flowRoute = $state(new CallsFlowControl());
  
  // Local state phone (will be managed by parent or external store)
  let localStatePhone = $state({
    displayCalls: [],
    connectedPhone: false,
    darkMode: false,
    notifications: true,
    callVolume: 0.8,
    ringVolume: 0.8,
    connectOnStart: false
  });
  
  // Active channel
  let activeChannel = $state(0);
  
  // Connect to server
  function connectToServer() {
    if (config.domain && config.secret) {
      flowRoute.config = config;
      flowRoute.init();
      flowRoute.start();
    }
  }
  
  // Handle call
  function handleCall(event) {
    const target = event?.target || event;
    const number = target?.value || target?.currentTarget?.value || '';
    if (number) {
      flowRoute.call(number);
    }
  }
  
  // Handle end call
  function handleEndCall(sessionId) {
    if (sessionId) {
      flowRoute.hungup(sessionId);
    }
  }
  
  // Handle hold
  function handleHold(sessionId, hold) {
    if (sessionId) {
      flowRoute.hold(sessionId, hold);
    }
  }
  
  // Handle mic mute
  function handleMicMute() {
    flowRoute.setMicMuted();
  }
  
  // Handle answer
  function handleAnswer(sessionId) {
    if (sessionId) {
      flowRoute.answer(sessionId);
    }
  }
  
  // Handle reject
  function handleReject(sessionId) {
    if (sessionId) {
      flowRoute.hungup(sessionId);
    }
  }
  
  // Handle call transfer
  function handleCallTransfer(transferedNumber) {
    if (!dialState && !transferedNumber) return;
    
    const newCallTransferDisplayCalls = localStatePhone.displayCalls.map(a => 
      a.id === activeChannel 
        ? {
            ...a,
            transferNumber: dialState || transferedNumber,
            inTransfer: true,
            allowAttendedTransfer: false,
            allowFinishTransfer: false,
            allowTransfer: false,
            callInfo: 'Transferring...'
          }
        : a
    );
    
    localStatePhone.displayCalls = newCallTransferDisplayCalls;
    
    if (flowRoute?.activeCall) {
      flowRoute.activeCall.sendDTMF(`##${dialState || transferedNumber}`);
    }
  }
  
  // Handle attended transfer
  function handleCallAttendedTransfer(event, number) {
    switch (event) {
      case 'transfer':
        const newCallTransferDisplayCalls = localStatePhone.displayCalls.map(a => 
          a.id === activeChannel 
            ? {
                ...a,
                transferNumber: dialState || number,
                allowAttendedTransfer: false,
                allowTransfer: false,
                transferControl: true,
                allowFinishTransfer: false,
                callInfo: 'Attended Transfer',
                inTransfer: true
              }
            : a
        );
        localStatePhone.displayCalls = newCallTransferDisplayCalls;
        
        if (flowRoute?.activeCall) {
          flowRoute.activeCall.sendDTMF(`*2${dialState || number}`);
        }
        break;
      case 'merge':
        const newCallMergeAttendedTransferDisplayCalls = localStatePhone.displayCalls.map(
          a => a.sessionId === localStatePhone.displayCalls[activeChannel].sessionId
            ? {
                ...a,
                inTransfer: false,
                attendedTransferOnline: ''
              }
            : a
        );
        localStatePhone.displayCalls = newCallMergeAttendedTransferDisplayCalls;
        
        if (flowRoute?.activeCall) {
          flowRoute.activeCall.sendDTMF('*5');
        }
        break;
      case 'swap':
        if (flowRoute?.activeCall) {
          flowRoute.activeCall.sendDTMF('*6');
        }
        break;
      case 'finish':
        if (flowRoute?.activeCall) {
          flowRoute.activeCall.sendDTMF('*4');
        }
        break;
      case 'cancel':
        const newCallCancelAttendedTransferDisplayCalls = localStatePhone.displayCalls.map(
          a => a.sessionId === localStatePhone.displayCalls[activeChannel].sessionId
            ? {
                ...a,
                inTransfer: false,
                attendedTransferOnline: '',
                transferControl: false,
                allowTransfer: true,
                allowAttendedTransfer: true
              }
            : a
        );
        localStatePhone.displayCalls = newCallCancelAttendedTransferDisplayCalls;
        
        if (flowRoute?.activeCall) {
          flowRoute.activeCall.sendDTMF('*3');
        }
        break;
      default:
        break;
    }
  }
  
  // Handle settings button
  function handleSettingsButton() {
    if (flowRoute) {
      flowRoute.tmpEvent();
    }
  }
  
  // Handle dark mode
  function handleDarkMode(checked) {
    localStatePhone = {
      ...localStatePhone,
      darkMode: checked
    };
  }
  
  // Handle user presence
  function handleUserPresence(status) {
    // Placeholder for user presence
  }
  
  // Handle press key (dial pad)
  function handlePressKey(key) {
    if (dialState.length < 15) {
      dialState += key;
    }
  }
  
  // Handle launcher toggle
  function handleLauncherToggle() {
    // Toggle softphone visibility
  }
  
  // Handle settings open
  function handleSettingsOpen() {
    // Open settings
  }
  
  // Handle connect phone
  function handleConnectPhone(connected) {
    localStatePhone.connectedPhone = connected;
  }
  
  // Handle connect on start
  function handleConnectOnStart(checked) {
    localStatePhone.connectOnStart = checked;
  }
  
  // Handle notifications
  function handleNotifications(checked) {
    localStatePhone.notifications = checked;
  }
  
  // Handle settings slider (volume)
  function handleSettingsSlider(type, value) {
    if (type === 'callVolume') {
      localStatePhone.callVolume = value;
    } else if (type === 'ringVolume') {
      localStatePhone.ringVolume = value;
    }
  }
  
  // Handle user presence status
  function handleUserPresenceStatus(status) {
    // Update presence status
  }
  
  // Dial state
  let dialState = $state('');
</script>

<SoftPhone 
  flowRoute={flowRoute}
  localStatePhone={localStatePhone}
  activeChannel={activeChannel}
  setActiveChannel={setActiveChannel}
  handleCall={handleCall}
  handleEndCall={handleEndCall}
  handleHold={handleHold}
  handleMicMute={handleMicMute}
  handleAnswer={handleAnswer}
  handleReject={handleReject}
  handleCallTransfer={handleCallTransfer}
  handleCallAttendedTransfer={handleCallAttendedTransfer}
  handleSettingsButton={handleSettingsButton}
  handleDarkMode={handleDarkMode}
  handleUserPresence={handleUserPresence}
  handlePressKey={handlePressKey}
  handleLauncherToggle={handleLauncherToggle}
  handleSettingsOpen={handleSettingsOpen}
  handleConnectPhone={handleConnectPhone}
  handleConnectOnStart={handleConnectOnStart}
  handleNotifications={handleNotifications}
  handleSettingsSlider={handleSettingsSlider}
  handleUserPresenceStatus={handleUserPresenceStatus}
/>
