import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SwipeCarouselBlock from '../lib/SwipeCarouselBlock.svelte';

const meta = {
  title: 'SwipeCarouselBlock',
  component: SwipeCarouselBlock,
  tags: ['autodocs'],
  args: {
    localStatePhone: {
      connectedPhone: true,
      connectOnStart: false,
      notifications: true,
      darkMode: false,
      callVolume: 0.5,
      ringVolume: 0.5,
      displayCalls: [
        {
          id: 1,
          sessionId: '123',
          callNumber: '+1234567890',
          callInfo: 'Active Call',
          info: 'from +1234567890',
          direction: 'outgoing',
          inCall: true,
          inAnswer: true,
          hold: false,
          muted: 0,
          inTransfer: false,
          transferNumber: '',
          attendedTransferOnline: '',
          inConference: false,
          callDuration: 120,
          ringDuration: 0
        }
      ]
    },
    activeChannel: 0,
    setActiveChannel: () => {}
  }
} satisfies Meta<typeof SwipeCarouselBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
