import type { Meta, StoryObj } from '@storybook/svelte-vite';
import KeypadBlock from '../KeypadBlock.svelte';

const meta = {
  title: 'KeypadBlock',
  component: KeypadBlock,
  tags: ['autodocs'],
  args: {
    handleCall: () => console.log('Call initiated'),
    handleEndCall: () => console.log('Call ended'),
    handleMicMute: () => console.log('Mic muted'),
    handleHold: () => console.log('Call held'),
    handlePressKey: (key: string) => console.log('Key pressed:', key),
    activeChanel: {
      id: 1,
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
} satisfies Meta<typeof KeypadBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveCall: Story = {};
