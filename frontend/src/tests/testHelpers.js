import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import App from '../App';

/**
 * Mock event data used across tests
 */
export const mockEvents = [
  { id: 1, name: 'Jazz Night', date: '2025-11-10', ticketsRemaining: 3 },
  { id: 4, name: 'Funk Night', date: '2025-11-15', ticketsRemaining: 1 },
  { id: 5, name: 'Rock Concert', date: '2025-12-01', ticketsRemaining: 0 },
];

export const updateEventAfterBooking = async (id, events, setEvents) => {
  await act(async () => {
    setEvents(prev =>
      prev.map(ev =>
        ev.id === id ? { ...ev, isBooking: false, ticketsRemaining: ev.ticketsRemaining - 1 } : ev
      )
    );
  });
};

/**
 * Setup fetch mocking for /api/events and /purchase endpoints
 */
export function mockFetch(customEvents = mockEvents) {
  global.fetch = jest.fn(async (url, options = {}) => {
    // GET events list
    if (url.endsWith('/api/events') && (!options.method || options.method === 'GET')) {
      return {
        ok: true,
        json: async () => customEvents,
      };
    }

    // POST purchase ticket
    const purchaseMatch = url.match(/\/api\/events\/(\d+)\/purchase/);
    if (purchaseMatch && options.method === 'POST') {
      const eventId = Number(purchaseMatch[1]);
      const event = customEvents.find((e) => e.id === eventId);

      if (!event) {
        return { ok: false, json: async () => ({ error: 'Event not found' }) };
      }

      if (event.ticketsRemaining > 0) {
        event.ticketsRemaining -= 1;
        return {
          ok: true,
          json: async () => ({ message: 'Ticket purchased successfully' }),
        };
      } else {
        return {
          ok: false,
          json: async () => ({ error: 'Sold out' }),
        };
      }
    }

    // Fallback (unexpected URL)
    console.error('UNEXPECTED FETCH URL:', url);
    return { ok: false, json: async () => ({ error: 'Unknown endpoint' }) };
  });
}

/**
 * Render the app with mocked backend
 */
export async function renderApp(customEvents = mockEvents) {
  mockFetch(customEvents);
  await act(async () => {
    render(<App />);
  });
  await waitFor(() => screen.getByText(/Clemson Campus Events/i));
}

/**
 * Simulate a full LLM-driven booking flow
 * @param {string} eventName - Name of the event to purchase
 * @param {string|RegExp} expectedMessage - Expected status message
 */
export async function simulateLLMBooking(eventName, expectedMessage) {
  const buyButton = await screen.findByRole('button', {
    name: new RegExp(`Buy ticket.*${eventName}`, 'i'),
  });

  await act(async () => {
    fireEvent.click(buyButton);
  });

  const status = await screen.findByRole('status');
  if (expectedMessage instanceof RegExp) {
    expect(status).toHaveTextContent(expectedMessage);
  } else {
    expect(status).toHaveTextContent(new RegExp(expectedMessage, 'i'));
  }
}

/**
 * Simulates an LLM booking flow for a given event name.
 * Clicks the buy button, waits for the expected success or failure message.
 */
export async function bookTicketViaLLM(eventName, expectedMessage) {
  const button = await screen.findByRole('button', {
    name: new RegExp(`Buy a ticket for ${eventName}`, 'i'),
  });

  await act(async () => {
    await userEvent.click(button);
  });

  const status = await screen.findByRole('status');
  if (expectedMessage instanceof RegExp) {
    expect(status).toHaveTextContent(expectedMessage);
  } else {
    expect(status).toHaveTextContent(new RegExp(expectedMessage, 'i'));
  }
}
