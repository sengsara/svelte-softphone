import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SwipeCarouselBlock from '../SwipeCarouselBlock.svelte';

const meta: Meta<SwipeCarouselBlock> = {
  title: 'SwipeCarouselBlock',
  component: SwipeCarouselBlock,
  tags: ['autodocs'],
  args: {
    localStatePhone: {
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
          attendedTransferOnline: [],
          inConference: false,
          callDuration: 120,
          ringDuration: 0
        }
      ]
    },
    activeChannel: 0,
    setActiveChannel: () => {}
  }
};

export default meta;
type Story = StoryObj<SwipeCarouselBlock>;

export const Default: Story = {};
