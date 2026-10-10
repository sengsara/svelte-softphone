import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SettingsBlock from '../lib/SettingsBlock.svelte';

const meta = {
  title: 'SettingsBlock',
  component: SettingsBlock,
  tags: ['autodocs'],
  args: {
    localStatePhone: {
      displayCalls: [],
      phoneCalls: [],
      callHistory: [],
      connectedPhone: false,
      connectingPhone: false,
      connectOnStart: false,
      notifications: true,
      darkMode: false,
      callVolume: 0.5,
      ringVolume: 0.5,
      userPresence: 'available'
    },
    handleConnectPhone: () => {},
    handleSettingsSlider: () => {},
    handleConnectOnStart: () => {},
    handleNotifications: () => {},
    handleDarkMode: () => console.log('Dark mode'),
    handleUserPresence: () => {}
  }
} satisfies Meta<typeof SettingsBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
