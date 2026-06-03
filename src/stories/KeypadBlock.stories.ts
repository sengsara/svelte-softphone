import type { Meta, StoryObj } from '@storybook/svelte-vite';
import KeypadBlock from '../KeypadBlock.svelte';

const meta: Meta<KeypadBlock> = {
  title: 'KeypadBlock',
  component: KeypadBlock,
  tags: ['autodocs'],
  args: {
    handleCall: () => console.log('Call initiated'),
    handleEndCall: () => console.log('Call ended'),
    handleMicMute: () => console.log('Mic muted'),
    handleHold: () => console.log('Call held'),
    activeChanel: {
      sessionId: '123',
      callNumber: '+1234567890',
      callInfo: 'Active Call',
      info: 'from +1234567890',
      direction: 'outgoing',
      inCall: true,
      inAnswer: true,
      hold: false,
      muted: 0
    }
  }
};

export default meta;
type Story = StoryObj<KeypadBlock>;

export const ActiveCall: Story = {};
