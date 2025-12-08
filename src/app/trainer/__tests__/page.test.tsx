import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/lib/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock AuthGuard to avoid router usage in tests
jest.mock('@/components/AuthGuard', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

import { useAuth } from '@/lib/useAuth';
import TrainerDashboardPage from '@/app/trainer/page';

describe('TrainerDashboardPage', () => {
  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = global.fetch || (() => Promise.reject(new Error('fetch unmocked')));
  });

  it('renders find & invite UI for trainer', async () => {
    // @ts-ignore
    useAuth.mockReturnValue({ user: { uid: 'trainer-1' }, loading: false, role: 'trainer' });

    // Mock calls for clients, sharedExports, etc.
    global.fetch = jest.fn((url: string) => {
      if (url.includes('/api/trainer/clients')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url.includes('/api/trainer/share')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url.includes('/api/connections?userId=')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }) as any;

    render(<TrainerDashboardPage />);

    // The 'Find & Invite Clients' label is present
    await waitFor(() => expect(screen.getByLabelText(/Find & Invite Clients/i)).toBeInTheDocument());
    expect(screen.getByPlaceholderText(/Search by user ID or email/i)).toBeInTheDocument();
  });

  it('can search and invite a user', async () => {
    // @ts-ignore
    useAuth.mockReturnValue({ user: { uid: 'trainer-1' }, loading: false, role: 'trainer' });

    // Mock search returning a user
    global.fetch = jest.fn((url: string, opts?: any) => {
      if (url.includes('/api/users/search')) {
        return Promise.resolve({ ok: true, json: async () => [{ id: 'client-1', displayId: 'client-1...' }] });
      }
      if (url.includes('/api/connections')) {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      // default
      return Promise.resolve({ ok: true, json: async () => [] });
    }) as any;

    render(<TrainerDashboardPage />);

    const searchInput = await screen.findByPlaceholderText('Search by user ID or email...');
    // Type query and hit Enter
    await userEvent.type(searchInput, 'client');
    const searchBtn = screen.getByLabelText('Search users');
    await userEvent.click(searchBtn);

    // Wait for results and invite button
    const inviteBtn = await screen.findByText('Invite');
    expect(inviteBtn).toBeInTheDocument();

    await userEvent.click(inviteBtn);
    // Confirm fetch POST to /api/connections occurred
    expect(global.fetch).toHaveBeenCalledWith('/api/connections', expect.objectContaining({ method: 'POST' }));
  });

  it('demo: renders clients list with sample data', async () => {
    // @ts-ignore
    useAuth.mockReturnValue({ 
      user: { uid: 'trainer-demo', getIdToken: async () => 'mock-token' }, 
      loading: false, 
      role: 'trainer' 
    });

    // Mock sample clients for demo
    const demoClients = [
      { clientId: 'alice-demo-101', displayName: 'Alice Demo', email: 'alice@demo.com' },
      { clientId: 'bob-demo-102', displayName: 'Bob Demo', email: 'bob@demo.com' },
      { clientId: 'charlie-demo-103', displayName: 'Charlie Demo', email: 'charlie@demo.com' },
    ];

    global.fetch = jest.fn((url: string) => {
      if (url.includes('/api/trainer/clients')) {
        return Promise.resolve({ ok: true, json: async () => demoClients });
      }
      if (url.includes('/api/trainer/share')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url.includes('/api/connections')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    }) as any;

    render(<TrainerDashboardPage />);

    // Wait for demo clients to load and render
    await waitFor(
      () => {
        // clientId.slice(0, 8) + '...' format
        expect(screen.getByText('alice-de...')).toBeInTheDocument();
        expect(screen.getByText('bob-demo...')).toBeInTheDocument();
        expect(screen.getByText('charlie-...')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify client list is rendered with aria-label
    const clientList = screen.getByRole('list', { name: 'Client list' });
    expect(clientList).toBeInTheDocument();

    // Verify Remove buttons (rendered as X icons) are present for each client
    const removeButtons = screen.getAllByLabelText(/Remove client/);
    expect(removeButtons.length).toBe(3);
  });
});
