import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/lib/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/AuthGuard', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

import { useAuth } from '@/lib/useAuth';
import PreferencesPage from '@/app/preferences/page';

describe('PreferencesPage', () => {
  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = global.fetch || (() => Promise.reject(new Error('fetch unmocked')));
  });

  it('shows trainer permissions toggles and updates them on change', async () => {
    // @ts-ignore
    useAuth.mockReturnValue({ 
      user: { 
        uid: 'client-1',
        email: 'client@example.com',
        getIdToken: jest.fn(() => Promise.resolve('mock-token'))
      }, 
      loading: false, 
      role: 'user' 
    });

    global.fetch = jest.fn((url: string, opts?: any) => {
      if (url.includes('/api/trainer/share')) {
        return Promise.resolve({ ok: true, json: async () => ({ hasTrainer: true, trainerId: 'trainer-1' }) });
      }
      if (url.includes('/api/trainer/permissions')) {
        if (opts && opts.method === 'PUT') {
          return Promise.resolve({ ok: true, json: async () => ({ trainerId: 'trainer-1', clientId: 'client-1', allowExport: true, allowPhotos: true }) });
        }
        return Promise.resolve({ ok: true, json: async () => ([{ trainerId: 'trainer-1', allowExport: true, allowPhotos: false }]) });
      }
      if (url.includes('/api/preferences')) {
        if (opts && opts.method === 'PUT') return Promise.resolve({ ok: true, json: async () => ({}) });
        return Promise.resolve({ ok: true, json: async () => ({ theme: 'light', notificationsEnabled: true, emailReminders: false, weeklySummary: true, weightUnit: 'lbs' }) });
      }
      if (url.includes('/api/connections')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }) as any;

    render(<PreferencesPage />);

    await waitFor(() => expect(screen.getByText('Trainer Connection')).toBeInTheDocument());
    // Wait for permission toggles to appear
    await waitFor(() => expect(screen.getByText('Trainer Permissions')).toBeInTheDocument());
    const section = screen.getByText('Trainer Permissions').closest('div');
    const { getAllByRole } = within(section as Element);
    const toggles = getAllByRole('checkbox');
    const [exportToggle, photosToggle] = toggles;
    // Click the photos toggle (currently false), it should trigger a PUT
    await userEvent.click(photosToggle);
    expect(global.fetch).toHaveBeenCalledWith('/api/trainer/permissions', expect.objectContaining({ method: 'PUT' }));
  });
});
