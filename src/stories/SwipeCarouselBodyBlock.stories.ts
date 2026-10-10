import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SwipeCarouselBodyBlock from '../lib/SwipeCarouselBodyBlock.svelte';

const meta = {
  title: 'SwipeCarouselBodyBlock',
  component: SwipeCarouselBodyBlock,
  tags: ['autodocs'],
  args: {
    localStatePhone: {
      displayCalls: [],
      phoneCalls: [],
      callHistory: [],
      connectedPhone: true,
      connectingPhone: false,
      connectOnStart: false,
      notifications: true,
      darkMode: false,
      callVolume: 0.5,
      ringVolume: 0.5,
      userPresence: 'available'
    },
    calls: [
      {
        status: 'answered',
        sessionId: '1',
        direction: 'outgoing',
        number: '+1234567890',
        time: Date.now()
      },
      {
        status: 'missed',
        sessionId: '2',
        direction: 'incoming',
        number: '+0987654321',
        time: Date.now()
      }
    ],
    timelocale: 'UTC'
  }
} satisfies Meta<typeof SwipeCarouselBodyBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
