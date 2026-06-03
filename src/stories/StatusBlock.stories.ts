import type { Meta, StoryObj } from '@storybook/svelte-vite';
import StatusBlock from '../StatusBlock.svelte';

const meta: Meta<StatusBlock> = {
  title: 'StatusBlock',
  component: StatusBlock,
  tags: ['autodocs'],
  args: {
    connectingPhone: false,
    connectedPhone: false
  }
};

export default meta;
type Story = StoryObj<StatusBlock>;

export const Connected: Story = {
  args: {
    connectingPhone: false,
    connectedPhone: true
  }
};

export const Connecting: Story = {
  args: {
    connectingPhone: true,
    connectedPhone: false
  }
};

export const Disconnected: Story = {
  args: {
    connectingPhone: false,
    connectedPhone: false
  }
};
