import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SoftPhone from '../lib/SoftPhone.svelte';

const meta = {
  title: 'SoftPhone',
  component: SoftPhone,
  tags: ['autodocs'],
  args: {
    localStatePhone: {
      connectedPhone: false,
      connectingPhone: false,
      connectOnStart: false,
      notifications: true,
      darkMode: false,
      callVolume: 0.5,
      ringVolume: 0.5,
      phoneCalls: [],
      callHistory: [],
      userPresence: 'available',
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
          attendedTransferOnline: '',
          inConference: false,
          callDuration: 0,
          ringDuration: 0
        }
      ]
    },
    activeChannel: 0,
    setActiveChannel: () => {},
    handleCall: () => console.log('Call initiated'),
    handleEndCall: () => console.log('Call ended'),
    handleHold: () => console.log('Call held'),
    handleMicMute: () => console.log('Mic muted'),
    handleAnswer: () => console.log('Call answered'),
    handleReject: () => console.log('Call rejected'),
    handleCallTransfer: () => console.log('Transfer initiated'),
    handleCallAttendedTransfer: () => console.log('Attended transfer'),
    handleSettingsButton: () => console.log('Settings button'),
    handleDarkMode: () => console.log('Dark mode'),
    handleUserPresence: () => console.log('User presence'),
    handlePressKey: () => {},
    handleLauncherToggle: () => console.log('Launcher toggled'),
    handleSettingsOpen: () => console.log('Settings opened'),
    handleConnectPhone: () => {},
    handleConnectOnStart: () => {},
    handleNotifications: () => {},
    handleSettingsSlider: () => {},
    handleUserPresenceStatus: () => {}
  }
} satisfies Meta<typeof SoftPhone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
