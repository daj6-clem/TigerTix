import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import {act} from 'react';
import App from '../App';
import { bookTicketViaLLM, mockFetch } from './testHelpers';

beforeEach(() => {
  jest.resetAllMocks();
});

/**
 * Integration tests for LLM-driven booking flows.
 */
describe('LLM-driven ticket booking integration tests', () => {

  test('LLM request books a ticket successfully', async () => {
    const mockEventsData = [
      { id: 1, name: 'Jazz Night', date: '2025-11-15', ticketsRemaining: 3 },
    ];

    mockFetch(mockEventsData);
    await act(async () => render(<App />));

    // Wait for event to appear
    await screen.findByText(/Jazz Night/i);

    // Simulate LLM booking
    await bookTicketViaLLM(
      'Jazz Night',
      /Ticket purchased successfully for Jazz Night/i
    );

    // Tickets remaining decremented immediately after click (optimistic update)
    expect(screen.getByText(/2 tickets remaining/i)).toBeInTheDocument();
  });

  test('Concurrent LLM bookings respect ticket limits', async () => {
    const mockEventsData = [
      { id: 4, name: 'Funk Night', date: '2025-11-25', ticketsRemaining: 1 },
    ];

    mockFetch(mockEventsData);
    await act(async () => render(<App />));
    await screen.findByText(/Funk Night/i);

    // Two near-simultaneous booking attempts
    const first = bookTicketViaLLM(
      'Funk Night',
      /Ticket purchased successfully for Funk Night/i
    );
    const second = bookTicketViaLLM('Funk Night', /Cannot purchase ticket/i);

    await Promise.allSettled([first, second]);

    // Confirm that only one succeeded
    const successMessages = screen.queryAllByText(
      /Ticket purchased successfully for Funk Night/i
    );
    expect(successMessages.length).toBe(1);

    // Verify ticket count dropped to 0
    expect(screen.getByText(/0 tickets remaining/i)).toBeInTheDocument();
  });

  test('Full LLM → backend → frontend booking flow works correctly', async () => {
    const mockEventsData = [
      { id: 5, name: 'Rock Concert', date: '2025-12-01', ticketsRemaining: 3 },
    ];

    mockFetch(mockEventsData, (body) => {
      if (body.eventName === 'Rock Concert') {
        if (mockEventsData[0].ticketsRemaining > 0) {
          mockEventsData[0].ticketsRemaining -= 1;
          return Promise.resolve({
            ok: true,
            json: async () => ({
              message: `Ticket puchased for ${mockEventsData[0].name}`,
            }),
          });
        } else {
          return Promise.resolve({
            ok: false,
            json: async () => ({ message: 'Tickets sold out' }),
          });
        }
      }
    });

    await act(async () => render(<App />));
    await screen.findByText(/Rock Concert/i);

    // Trigger the booking
    await bookTicketViaLLM(
      'Rock Concert',
      /LLM confirmed ticket booking for Rock Concert/i
    );

    // Expect the frontend to update ticket count (optimistic update + fetch)
    expect(screen.getByText(/2 tickets remaining/i)).toBeInTheDocument();

    // Confirm fetch was called for both GET /events and POST /purchase
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
