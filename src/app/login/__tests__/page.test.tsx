import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(() => Promise.resolve()),
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: { uid: 'test-uid' } },
  googleProvider: { setCustomParameters: jest.fn() },
}));

jest.mock('@/lib/useAuth', () => ({
  useAuth: jest.fn(() => ({ user: null, loading: false, role: 'user' })),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}));

import LoginPage from '@/app/login/page';
import { signInWithPopup, signOut } from 'firebase/auth';

describe('LoginPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: async () => ({}) })) as any;
    jest.clearAllMocks();
  });

  it('posts pending role when selected and signed in', async () => {
    render(<LoginPage />);
    const trainerBtn = screen.getByText('Trainer');
    userEvent.click(trainerBtn);
    const continueBtn = screen.getByText(/Continue with Google/i);
    await act(async () => {
      userEvent.click(continueBtn);
    });

    await waitFor(() => expect(signInWithPopup).toHaveBeenCalled());
    expect(global.fetch).toHaveBeenCalledWith('/api/roles', expect.objectContaining({ method: 'POST' }));
  });
});
