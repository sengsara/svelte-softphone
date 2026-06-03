<script>
  import { onMount, onDestroy } from 'svelte';
  import { UA, WebSocketInterface } from 'jssip';
  import { debugLog, debugError, debugWarn } from './lib/constants';

  // Props
  let {
    flowRoute,
    localStatePhone,
    activeChannel,
    setActiveChannel,
    handleCall,
    handleEndCall,
    handleHold,
    handleMicMute,
    handleAnswer,
    handleReject,
    handleCallTransfer,
    handleCallAttendedTransfer,
    handleSettingsButton,
    handleDarkMode,
    handleUserPresence,
    handlePressKey,
    handleLauncherToggle,
    handleSettingsOpen,
    handleConnectPhone,
    handleConnectOnStart,
    handleNotifications,
    handleSettingsSlider,
    handleUserPresenceStatus
  } = $props();

  // JSSIP state
  let phone = $state(null);
  let activeCall = $state(null);
  let callsQueue = $state([]);
  let holdCallsQueue = $state([]);
  let micMuted = $state(false);
  let connectedPhone = $state(false);
  let initiated = $state(false);
  let ringbackTone = $state(null);
  let ringer = $state(null);
  let player = $state(null);
  let config = $state({});
  let activeChanel = $state(null);
  let dialState = $state('');

  // Duration tracking
  let durations = $state([
    { callDuration: 0, callDurationIntrId: 0, callDurationActive: false, ringDuration: 0, ringDurationIntrId: 0, ringDurationActive: false },
    { callDuration: 0, callDurationIntrId: 0, callDurationActive: false, ringDuration: 0, ringDurationIntrId: 0, ringDurationActive: false },
    { callDuration: 0, callDurationIntrId: 0, callDurationActive: false, ringDuration: 0, ringDurationIntrId: 0, ringDurationActive: false }
  ]);

  // One second interval
  const ONE_SECOND = 1000;

  // Initialize JSSIP
  $effect(() => {
    if (!config.domain || !config.secret) {
      debugLog('JSSIP: Missing configuration');
      return;
    }

    try {
      // Create WebSocket interface for real-time events
      const wsInterface = new WebSocketInterface(config.wsUrl || `ws://${config.domain}:${config.port || 5060}`);
      
      // Create User Agent with WebSocket
      phone = new UA(config, wsInterface);
      
      // Register event handlers
      phone.on('newRTCSession', handleNewRTCSession);
      
      const binds = ['connected', 'disconnected', 'registered', 'unregistered', 'registrationFailed', 'invite', 'message', 'connecting'];
      binds.forEach(value => {
        phone.on(value, (e) => {
          if (flowRoute) flowRoute.engineEvent(value, e);
        });
      });
      
      initiated = true;
      connectedPhone = phone.registered;
      
      debugLog('JSSIP initialized successfully');
    } catch (e) {
      debugError('JSSIP initialization error:', e);
    }
  });

  // Monitor connection state
  $effect(() => {
    if (phone) {
      phone.on('connected', () => {
        connectedPhone = true;
        if (flowRoute) flowRoute.engineEvent('connected', {});
      });
      
      phone.on('disconnected', () => {
        connectedPhone = false;
        if (flowRoute) flowRoute.engineEvent('disconnected', {});
      });
    }
  });

  // Timer effect for tracking call durations
  $effect(() => {
    const displayCalls = localStatePhoneRef.displayCalls || [];
    const interval = setInterval(() => {
      for (const [key, displayCall] of displayCalls.entries()) {
        if (displayCall.inCall) {
          if (!displayCall.inAnswer && !durations[key].ringDurationActive) {
            setDurations((oldDurations) => ({
              ...oldDurations,
              [key]: {
                ...oldDurations[key],
                ringDuration: oldDurations[key].ringDuration + 1
              }
            }));
          } else if (displayCall.inAnswer && !durations[key].callDurationActive) {
            setDurations((oldDurations) => ({
              ...oldDurations,
              [key]: {
                ...oldDurations[key],
                callDuration: oldDurations[key].callDuration + 1,
                ringDurationActive: false
              }
            }));
          }
        } else {
          if (durations[key].callDuration !== 0 || durations[key].ringDuration !== 0) {
            setDurations((oldDurations) => ({
              ...oldDurations,
              [key]: {
                ...oldDurations[key],
                callDuration: 0,
                callDurationActive: false,
                ringDuration: 0,
                ringDurationActive: false
              }
            }));
          }
        }
      }
    }, ONE_SECOND);
    
    return () => clearInterval(interval);
  });

  // Call handler
  function call(to) {
    if (!connectedPhone) {
      if (flowRoute) flowRoute.notify('Please connect to VoIP server first');
      debugLog('User agent not registered yet');
      return;
    }
    if (activeCall) {
      if (flowRoute) flowRoute.notify('Active call already exists');
      debugLog('Already has active call');
      return;
    }
    
    phone.call(`sip:${to}@${config.domain}`, {
      extraHeaders: ['First: first', 'Second: second'],
      RTCConstraints: {
        optional: [{ DtlsSrtpKeyAgreement: 'true' }]
      },
      mediaConstraints: {
        audio: true
      },
      sessionTimersExpires: 600
    });
  }

  // Answer handler
  function answer(sessionId) {
    if (activeCall) {
      debugLog('Already has active call');
      return;
    }
    try {
      stopRing();
      const call = callsQueue.find(c => c.id === sessionId);
      if (call) {
        call.customPayload = activeChanel?.id;
        call.answer({
          mediaConstraints: { audio: true }
        });
        connectAudio();
      }
    } catch (err) {
      debugError('Error answering call:', err);
      if (flowRoute) flowRoute.notify('Error answering call');
    }
  }

  // Hangup handler
  function hungup(sessionId) {
    try {
      if (phone?._sessions) {
        phone._sessions[sessionId]?.terminate();
      }
    } catch (s) {
      debugLog(s);
      debugLog('Call already terminated');
    }
  }

  // Hold handler
  function hold(sessionId, hold = true) {
    if (!phone) return;
    
    if (hold === false) {
      unhold(sessionId);
    } else if (hold === true) {
      if (activeCall?.id === sessionId) {
        activeCall.hold();
      }
    }
  }

  // Unhold handler
  function unhold(sessionId) {
    if (!phone) return;
    
    if (!activeCall) {
      const toUnhold = holdCallsQueue.find(c => c.id === sessionId);
      if (toUnhold) {
        toUnhold.unhold();
      }
    } else {
      debugLog('Please exit from all active calls to unhold');
      if (flowRoute) flowRoute.notify('Please exit from all active calls to unhold');
    }
  }

  // Mute handler
  function setMicMuted() {
    if (micMuted && activeCall) {
      activeCall.unmute();
      micMuted = false;
      if (flowRoute) flowRoute.onCallActionConnection('unmute', activeCall.id);
    } else if (!micMuted && activeCall) {
      micMuted = true;
      activeCall.mute();
      if (flowRoute) flowRoute.onCallActionConnection('mute', activeCall.id);
    }
  }

  // DTMF handler
  function sendDTMF(code) {
    if (activeCall) {
      activeCall.sendDTMF(code);
    }
  }

  // Connect audio streams
  function connectAudio() {
    if (activeCall?.connection) {
      activeCall.connection.addEventListener('addstream', (event) => {
        if (player) {
          player.srcObject = event.stream;
        }
      });
    }
  }

  // Play ringtone
  function playRing() {
    if (ringer && ringer.current) {
      try {
        ringer.current.currentTime = 0;
        ringer.current.play().catch((err) => debugError('Ringtone play error:', err));
      } catch (err) {
        debugError('Failed to play ringtone:', err);
      }
    }
  }

  // Stop ringtone
  function stopRing() {
    if (ringer?.current) {
      ringer.current.currentTime = 0;
      ringer.current.pause();
    }
  }

  // Start ringback tone
  function startRingback() {
    if (ringbackTone) {
      try {
        ringbackTone.currentTime = 0;
        ringbackTone.play().catch((err) => debugError('Ringback tone play error:', err));
      } catch (e) {
        debugError('Failed to play ringback tone:', e);
      }
    }
  }

  // Stop ringback tone
  function stopRingback() {
    if (ringbackTone) {
      try {
        ringbackTone.pause();
        ringbackTone.currentTime = 0;
      } catch (e) {
        debugError('Failed to stop ringback tone:', e);
      }
    }
  }

  // Remove call from queue
  function removeCallFromQueue(callId) {
    callsQueue = callsQueue.filter(calls => calls.id !== callId);
  }

  // Add call to hold queue
  function addCallToHoldQueue(callId) {
    if (activeCall?.id === callId) {
      holdCallsQueue.push(activeCall);
    }
  }

  // Remove call from active
  function removeCallFromActiveCall(callId) {
    if (activeCall && callId === activeCall.id) {
      activeCall = null;
    }
  }

  // Remove call from hold queue
  function removeCallFromHoldQueue(callId) {
    holdCallsQueue = holdCallsQueue.filter(calls => calls.id !== callId);
  }

  // Handle new RTC session
  function handleNewRTCSession(rtcPayload) {
    const { session: call } = rtcPayload;
    
    if (call.direction === 'incoming') {
      callsQueue.push(call);
      if (flowRoute) flowRoute.onCallActionConnection('incomingCall', call);
      if (!activeCall) {
        playRing();
      }
    } else {
      activeCall = call;
      if (flowRoute) flowRoute.onCallActionConnection('outgoingCall', call);
      connectAudio();
    }
    
    // Attach event listeners
    const defaultCallEventsToHandle = [
      'peerconnection', 'connecting', 'sending', 'progress', 'accepted',
      'newDTMF', 'newInfo', 'hold', 'unhold', 'muted', 'unmuted',
      'reinvite', 'update', 'refer', 'replaces', 'sdp', 'icecandidate',
      'getusermediafailed', 'ended', 'failed', 'connecting', 'confirmed'
    ];
    
    defaultCallEventsToHandle.forEach(eventType => {
      call.on(eventType, (data, cause) => {
        sessionEvent(eventType, data, cause, call.id);
      });
    });
  }

  // Session event handler
  function sessionEvent(type, data, cause, callId) {
    switch (type) {
      case 'terminated':
        break;
      case 'progress':
        if (data?.originator === 'remote') {
          if (data.response?.status_code === 180) {
            startRingback();
          }
          if (data.response?.status_code === 183) {
            stopRingback();
          }
        } else {
          debugLog('Progress event for incoming call, ignoring...');
        }
        break;
      case 'accepted':
        break;
      case 'reinvite':
        if (flowRoute) flowRoute.onCallActionConnection('reinvite', callId, data);
        break;
      case 'hold':
        if (flowRoute) flowRoute.onCallActionConnection('hold', callId);
        addCallToHoldQueue(callId);
        removeCallFromActiveCall(callId);
        break;
      case 'unhold':
        if (flowRoute) flowRoute.onCallActionConnection('unhold', callId);
        activeCall = holdCallsQueue.find(c => c.id === callId);
        removeCallFromHoldQueue(callId);
        break;
      case 'dtmf':
        break;
      case 'muted':
        if (flowRoute) flowRoute.onCallActionConnection('muted', callId);
        break;
      case 'unmuted':
        break;
      case 'confirmed':
        stopRingback();
        if (!activeCall) {
          activeCall = callsQueue.find(c => c.id === callId);
        }
        removeCallFromQueue(callId);
        if (flowRoute) flowRoute.onCallActionConnection('callAccepted', callId, activeCall);
        break;
      case 'connecting':
        break;
      case 'ended':
        if (flowRoute) flowRoute.onCallActionConnection('callEnded', callId);
        removeCallFromQueue(callId);
        removeCallFromActiveCall(callId);
        removeCallFromHoldQueue(callId);
        if (callsQueue.length === 0) {
          stopRing();
        }
        break;
      case 'failed':
        stopRingback();
        if (flowRoute) flowRoute.onCallActionConnection('callEnded', callId);
        removeCallFromQueue(callId);
        removeCallFromActiveCall(callId);
        if (callsQueue.length === 0) {
          stopRing();
        }
        break;
      default:
        debugWarn(`Unhandled event: ${type}`, { data, cause, callId });
        break;
    }
  }

  // Validate config
  function validateConfig() {
    if (!config.domain) {
      debugWarn('Config error: Missing domain');
    }
  }

  // Initialize
  function init() {
    try {
      validateConfig();
      if (!phone) {
        phone = new UA(config);
        phone.on('newRTCSession', handleNewRTCSession);
        
        const binds = ['connected', 'disconnected', 'registered', 'unregistered', 'registrationFailed', 'invite', 'message', 'connecting'];
        binds.forEach(value => {
          phone.on(value, (e) => {
            if (flowRoute) flowRoute.engineEvent(value, e);
          });
        });
        initiated = true;
      }
    } catch (e) {
      debugLog(e);
    }
  }

  // Start SIP stack
  function start() {
    if (!initiated) {
      if (flowRoute) flowRoute.notify('Please initialize phone before connecting');
      debugLog('Please call .init() before connect');
      return;
    }
    
    if (config.debug) {
      // debug.enable('JsSIP:*');
    } else {
      // debug.disable();
    }
    if (phone) phone.start();
  }

  // Stop SIP stack
  function stop() {
    if (phone) phone.stop();
  }

  // Temporary event info
  function tmpEvent() {
    debugLog(activeCall);
    debugLog(callsQueue);
    debugLog(holdCallsQueue);
  }

  // Notify
  function notify(message) {
    if (flowRoute) flowRoute.onCallActionConnection('notify', message);
  }

  // On user agent action
  function onUserAgentAction() {
    // Placeholder
  }

  // On call action connection
  function onCallActionConnection(action, ...args) {
    // Forward to parent if available
    if (flowRoute) flowRoute[action](...args);
  }

  // Engine event
  function engineEvent(event, data) {
    // Forward to parent if available
    if (flowRoute) flowRoute.engineEvent(event, data);
  }

  // Play ring (React ref version)
  function playRingRef() {
    if (ringer && ringer.current) {
      try {
        ringer.current.currentTime = 0;
        ringer.current.play().catch((err) => console.error('Ringtone play error:', err));
      } catch (err) {
        console.error('Failed to play ringtone:', err);
      }
    }
  }

  // Stop ring (React ref version)
  function stopRingRef() {
    if (ringer?.current) {
      ringer.current.currentTime = 0;
      ringer.current.pause();
    }
  }

  // Format time
  function formatTime(seconds) {
    if (seconds === 0 || seconds === undefined) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Cleanup
  onDestroy(() => {
    if (phone) {
      phone.stop();
    }
    stopRing();
    stopRingback();
  });
</script>
