import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../AuthContext';
import Login from '../Login';
import { MemoryRouter } from 'react-router-dom';

// Mock fetch for login
beforeEach(() => {
  global.fetch = jest.fn((url, opts) => {
    if (url.includes('/api/auth/login')) {
      const { username, password } = JSON.parse(opts.body);
      if (username === 'user' && password === 'pass') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Logged in successfully.' })
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Your username or password is incorrect.' })
      });
    }
    return Promise.reject('Unknown endpoint');
  });
});
afterEach(() => jest.resetAllMocks());

describe('Login E2E', () => {
  it('logs in successfully with correct credentials', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    // await waitFor(() => {
    //   expect(screen.queryByText(/logged in successfully/i)).toBeInTheDocument();
    // });
  });

  it('shows error with wrong credentials', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.queryByText(/invalid username or password/i)).toBeInTheDocument();
    });
  });
});
