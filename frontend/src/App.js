//src/App.js

import React, { useEffect, useState, useCallback, useContext } from 'react';
import VoiceChat from './VoiceChat';
import useTextToSpeech from './useTextToSpeech';
import './App.css';
import {AuthContext} from "./AuthContext";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";
import {API_URL} from './api';

export default function App() {
  const [events, setEvents] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const { speak, stop } = useTextToSpeech();
  const [statusMessage, setStatusMessage] = useState('');
  const {user, logout} = useContext(AuthContext);
  const navigate = useNavigate();

  // LLM Parsing state
  const [llmInput, setLlmInput] = useState('');
  const [llmResponse, setLlmResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      const res = await fetch('${API_URL}/api/events', {
        method: 'GET',
        credentials: 'include',
      });
      console.log('Reponse received.');
      const data = await res.json();
      console.log('data got');
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const buyTicket = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/events/${id}/purchase`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const event = events.find((e) => e.id === id);
        const message = `Ticket purchased successfully for ${event?.name || 'the event'}.`;
        setStatusMessage(message);
        speak(message);
        fetchEvents();
      } else {
        const errorData = await res.json();
        const message = `Error: ${errorData.message}`;
        setStatusMessage(message);
        speak(message);
      }
    } catch (err) {
      console.error('Error purchasing ticket:', err);
      const message = 'Error purchasing ticket. Please try again.';
      setStatusMessage(message);
      speak(message);
    }
  };

const handleLLMParse = async () => {
  if (!llmInput.trim()) return;

  setLoading(true);
  setStatusMessage('');
  setLlmResponse(null);
  setPendingBooking(null);

  try {
    const res = await fetch('${API_URL}/api/llm/parse', {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ text: llmInput }),
    });

    const data = await res.json();
    setLlmResponse(data);

    // If LLM returned properly, show confirmation
    if (data.parsed?.event && data.parsed?.tickets) {
      const match = events.find(
        (e) => e.name.toLowerCase() === data.parsed.event.toLowerCase()
      );

      if (match) {
        const requestedTickets = Number(data.parsed.tickets);

        // Check if enough tickets are available
        if (requestedTickets > match.tickets) {
          setStatusMessage(
            `Cannot book ${requestedTickets} ticket(s) for "${match.name}". Only ${match.tickets} remaining.`
          );
          return; // stop here
        }

        // Otherwise, set pending booking
        setPendingBooking({
          id: Number(match.id),
          name: match.name,
          tickets: requestedTickets,
        });
        setStatusMessage(`Found event "${match.name}". Ready to confirm booking.`);
      } else {
        setStatusMessage(`Couldn't find an event named "${data.parsed.event}".`);
      }
    } else {
      setStatusMessage('Sorry, I could not understand that request.');
    }
  } catch (err) {
    console.error('Error parsing LLM input:', err);
    setStatusMessage('Error contacting LLM service.');
  } finally {
    setLoading(false);
  }
};

const handleSpeechResult = async (transcript) => {
    // Add user's speech to chat
    setChatMessages(prev => [...prev, { text: transcript, type: 'user' }]);
    speak('Processing your request...');

    try {
      // Send to LLM service
      const response = await fetch('${API_URL}/api/llm/parse', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcript }),
      });

      const data = await response.json();
      
      if (data.parsed) {
        const { event: eventName, tickets: ticketCount, intent } = data.parsed;
        
        // Find matching event
        const matchingEvent = events.find(e => 
          e.name.toLowerCase().includes(eventName.toLowerCase())
        );

        let responseMessage;
        if (matchingEvent) {
          if (intent === 'view') {
            responseMessage = `${matchingEvent.name} has ${matchingEvent.tickets} tickets available for ${matchingEvent.date}.`;
          } else if (intent === 'book') {
            responseMessage = `I found ${matchingEvent.name} on ${matchingEvent.date}. Would you like me to book ${ticketCount} ticket${ticketCount > 1 ? 's' : ''}? Please confirm by clicking the buy ticket button.`;
          }
        } else {
          responseMessage = `I couldn't find an event matching "${eventName}". Please try again with a different event name.`;
        }

        setChatMessages(prev => [...prev, { text: responseMessage, type: 'llm' }]);
        speak(responseMessage);
      }
    } catch (error) {
      console.error('Error processing speech:', error);
      const errorMessage = 'Sorry, I had trouble processing your request. Please try again.';
      setChatMessages(prev => [...prev, { text: errorMessage, type: 'llm' }]);
      speak(errorMessage);
    }
  };

  const handleSpeechError = useCallback((error) => {
    const errorMessage = `Speech recognition error: ${error}. Please try again.`;
    setStatusMessage(errorMessage);
    speak(errorMessage);
  }, [speak]);

  return (
    <div className="App">
      <header className="App-header">
        <a className="skip-link" href="#main">Skip to main content</a>
        <h1>Clemson Campus Events</h1>
      </header>

      <main id="main" tabIndex={-1}>
        <div style={{
          textAlign: "right",
          marginBottom: "1rem",
          fontSize: "1rem"
        }}>
          {user && (
            <>
              <span>Logged in as <strong>{user.username}</strong></span>
              <button
                onClick={logout}
                style={{marginLeft: "1rem"}}
              >
                Logout
              </button>
            </>
          )}
        </div>

        <div className="status-wrapper">
          {statusMessage && (
            <p className="status-visible" role="status">{statusMessage}</p>
          )}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {statusMessage}
          </div>
        </div>

        {chatMessages.length > 0 && (
          <div className="chat-window" role="log" aria-label="Chat messages">
            {chatMessages.map((message, index) => (
              <div 
                key={index} 
                className={`chat-message ${message.type}-message`}
                role="article"
              >
                {message.text}
              </div>
            ))}
          </div>
        )}
        <ul className="event-list">
          {events.map((event) => (
            <li key={event.id} className="event-item">
              <section aria-labelledby={`event-${event.id}-title`}>
                <h2 id={`event-${event.id}-title`}>{event.name}</h2>
                <p>
                  <time dateTime={event.date}>{event.date}</time>
                  {' '}— <span aria-live="polite">{event.tickets} tickets remaining</span>
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => buyTicket(event.id)}
                    disabled={event.tickets <= 0}
                    aria-disabled={event.tickets <= 0}
                    aria-label={`Buy a ticket for ${event.name} on ${event.date}. ${event.tickets} tickets remaining.`}
                  >
                    Buy ticket
                  </button>
                </div>
              </section>
            </li>
          ))}
        </ul>

        {/* LLM Parsing Interface */}
        <section className="llm-section" style={{ marginTop: "2rem", textAlign: "center" }}>
          <h2>LLM Command Parser</h2>
          <input
            type="text"
            placeholder='Type something like "Book 2 tickets for Jazz Night"'
            value={llmInput}
            onChange={(e) => setLlmInput(e.target.value)}
            style={{ width: "60%", padding: "0.5rem", marginRight: "0.5rem" }}
          />
          <button onClick={handleLLMParse} disabled={loading}>
            {loading ? 'Parsing...' : 'Parse'}
          </button>

          {llmResponse && (
            <div style={{ marginTop: "1rem", textAlign: "left", display: "inline-block" }}>
              <h3>Response:</h3>
              <pre>{JSON.stringify(llmResponse, null, 2)}</pre>
            </div>
          )}
        </section>

        {/* Booking Confirmation Prompt */}
              {pendingBooking && (
        <div style={{
          marginTop: "1rem",
          background: "#f8f9fa",
          padding: "1rem",
          borderRadius: "8px",
          width: "60%",
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "center"
        }}>
          <p>
            Do you want to confirm booking{" "}
            <strong>{pendingBooking.tickets}</strong> ticket(s) for{" "}
            <strong>{pendingBooking.name}</strong>?
          </p>
          <button
            onClick={async () => {
              if (!pendingBooking) return;

              try {
                // Step 1: Prepare the booking on the backend
                const prepareRes = await fetch("${API_URL}/api/prepare-booking", {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    eventId: pendingBooking.id,
                    eventName: pendingBooking.name,
                    tickets: pendingBooking.tickets,
                  }),
                });
                const prepareData = await prepareRes.json();

                if (!prepareRes.ok) {
                  setStatusMessage(`❌ ${prepareData.error || "Failed to prepare booking."}`);
                  return;
                }

                // Step 2: Confirm the booking
                const confirmRes = await fetch("${API_URL}/api/confirm-booking", {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    eventId: pendingBooking.id,
                    eventName: pendingBooking.name,
                    tickets: pendingBooking.tickets,
                  }),
                });
                const confirmData = await confirmRes.json();

                if (confirmRes.ok) {
                  setStatusMessage(`✅ Booking confirmed for ${pendingBooking.name}!`);
                  setPendingBooking(null);
                  fetchEvents(); // refresh available tickets
                } else {
                  setStatusMessage(`❌ ${confirmData.error || "Booking failed."}`);
                }
              } catch (err) {
                console.error(err);
                setStatusMessage("❌ Network error during booking.");
              }
            }}
          >
            Confirm Booking
          </button>
          <button
            onClick={() => setPendingBooking(null)}
            style={{ marginLeft: "1rem" }}
          >
            Cancel
          </button>
        </div>
      )}
      </main>


      <footer>
        <p className="visually-hidden-helper">Use Tab to navigate and Enter/Space to activate buttons.</p>
      </footer>
      
      <VoiceChat 
        onSpeechResult={handleSpeechResult}
        onError={handleSpeechError}
      />
      
    </div>
  );
}