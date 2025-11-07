import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test('fetches and displays events', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [
      { id: 1, name: 'Jazz Night', date: '2025-11-15', tickets: 5 },
      { id: 2, name: 'Rock Concert', date: '2025-12-01', tickets: 0 },
    ],
  });

  render(<App />);

  expect(await screen.findByText(/Jazz Night/i)).toBeInTheDocument();
  expect(screen.getByText(/Rock Concert/i)).toBeInTheDocument();
});

test('buyTicket triggers API call and updates status', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [{ id: 1, name: 'Jazz Night', date: '2025-11-15', tickets: 5 }],
  });

  render(<App />);

  const buyButton = await screen.findByRole('button', {
    name: /Buy a ticket for Jazz Night/i,
  });

  // Mock purchase API call
  fetch.mockResolvedValueOnce({ ok: true });

  fireEvent.click(buyButton);

  const statusMessage = await screen.findByRole('status');
  expect(statusMessage).toHaveTextContent(/Ticket purchased successfully for Jazz Night/i);
});

test('disables buy button when tickets are 0', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [{ id: 2, name: 'Rock Concert', date: '2025-12-01', tickets: 0 }],
  });

  render(<App />);

  const buyButton = await screen.findByRole('button', { name: /Buy a ticket for Rock Concert/i });
  expect(buyButton).toBeDisabled();
  expect(buyButton).toHaveAttribute('aria-disabled', 'true');
});

test('handles fetch errors gracefully', async () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  fetch.mockRejectedValueOnce(new Error('Network error'));

  render(<App />);

  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching events:',
      expect.any(Error)
    );
  });

  consoleSpy.mockRestore();
});
