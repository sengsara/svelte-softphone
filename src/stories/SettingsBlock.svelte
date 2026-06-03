<script lang="ts">
  import SettingsBlock from '../SettingsBlock.svelte';
  
  let mockLocalStatePhone = $state({
    connectedPhone: false,
    connectOnStart: false,
    notifications: true,
    callVolume: 50,
    ringVolume: 50
  });
  
  let mockHandleConnectPhone = (_: unknown, connected: boolean) => { mockLocalStatePhone.connectedPhone = connected; };
  let mockHandleConnectOnStart = (checked: boolean) => { mockLocalStatePhone.connectOnStart = checked; };
  let mockHandleNotifications = (checked: boolean) => { mockLocalStatePhone.notifications = checked; };
  let mockHandleSettingsSlider = (type: string, value: number) => {
    if (type === 'callVolume') mockLocalStatePhone.callVolume = value;
    else if (type === 'ringVolume') mockLocalStatePhone.ringVolume = value;
  };
  let mockHandleDarkMode = (checked: boolean) => console.log('Dark mode:', checked);
  let mockHandleUserPresence = () => {};
</script>

<div style="height: 400px; width: 300px; margin: 20px;">
  <SettingsBlock
    localStatePhone={mockLocalStatePhone}
    handleConnectPhone={mockHandleConnectPhone}
    handleSettingsSlider={mockHandleSettingsSlider}
    handleConnectOnStart={mockHandleConnectOnStart}
    handleNotifications={mockHandleNotifications}
    handleDarkMode={mockHandleDarkMode}
    handleUserPresence={mockHandleUserPresence}
  />
</div>
