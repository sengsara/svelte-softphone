import type { Meta, StoryObj } from '@storybook/svelte-vite';
import CallQueue from '../CallQueue.svelte';

const meta: Meta<CallQueue> = {
  title: 'CallQueue',
  component: CallQueue,
  tags: ['autodocs'],
  args: {
    calls: [
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
    ],
    handleAnswer: (sessionId: string) => console.log('Answered:', sessionId),
    handleReject: (sessionId: string) => console.log('Rejected:', sessionId)
  }
};

export default meta;
type Story = StoryObj<CallQueue>;

export const Default: Story = {};
