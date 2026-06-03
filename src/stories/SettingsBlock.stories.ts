import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SettingsBlock from '../SettingsBlock.svelte';

const meta: Meta<SettingsBlock> = {
  title: 'SettingsBlock',
  component: SettingsBlock,
  tags: ['autodocs'],
  args: {
    localStatePhone: {
      connectedPhone: false,
      connectOnStart: false,
      notifications: true,
      callVolume: 50,
      ringVolume: 50
    },
    handleConnectPhone: () => {},
    handleSettingsSlider: () => {},
    handleConnectOnStart: () => {},
    handleNotifications: () => {},
    handleDarkMode: () => console.log('Dark mode'),
    handleUserPresence: () => {}
  }
};

export default meta;
type Story = StoryObj<SettingsBlock>;

export const Default: Story = {};
