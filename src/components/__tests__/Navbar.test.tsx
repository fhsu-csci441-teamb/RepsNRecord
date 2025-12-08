  it('shows sign out link when authenticated', async () => {
    // @ts-ignore
    useAuth.mockReturnValue({ user: { uid: 'user1' }, loading: false, role: null });

    render(<Navbar />);

    await waitFor(() => expect(screen.getByText('Sign out')).toBeInTheDocument());
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

// Mock useAuth hook
jest.mock('@/lib/useAuth', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/lib/useAuth';
import Navbar from '@/components/Navbar';

describe('Navbar', () => {
  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = global.fetch || (() => Promise.reject(new Error('fetch unmocked')));
  });

  it('renders Trainer link when user is a trainer', async () => {
    // @ts-ignore
    useAuth.mockReturnValue({ user: { uid: 'trainer1' }, loading: false, role: 'trainer' });

    // mock fetch for /api/trainer/clients to return 200
    global.fetch = jest.fn((url) => {
      if (url.toString().includes('/api/trainer/clients')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => [] });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    }) as any;

    render(<Navbar />);

    // trainer link should appear
    await waitFor(() => expect(screen.getByText('Trainer')).toBeInTheDocument());
  });

  it('does not render Trainer link when user is not a trainer', async () => {
    // @ts-ignore
    useAuth.mockReturnValue({ user: { uid: 'user1' }, loading: false, role: null });

    global.fetch = jest.fn((url) => {
      if (url.toString().includes('/api/trainer/clients')) {
        return Promise.resolve({ ok: false, status: 403, json: async () => ({ error: 'User is not a trainer' }) });
      }
      if (url.toString().includes('/api/trainer/share')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ hasTrainer: false }) });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    }) as any;

    render(<Navbar />);

    await waitFor(() => expect(screen.queryByText('Trainer')).not.toBeInTheDocument());
  });

  it('shows login link when not authenticated', async () => {
    // @ts-ignore
    useAuth.mockReturnValue({ user: null, loading: false, role: null });

    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => ({}) })) as any;

    render(<Navbar />);

    await waitFor(() => expect(screen.getByText('Login')).toBeInTheDocument());
    expect(screen.queryByText('Preferences')).not.toBeInTheDocument();
  });

  it('shows preferences link when authenticated', async () => {
    // @ts-ignore
    useAuth.mockReturnValue({ user: { uid: 'user1' }, loading: false, role: null });

    render(<Navbar />);

    await waitFor(() => expect(screen.getByText('Preferences')).toBeInTheDocument());
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });
});



