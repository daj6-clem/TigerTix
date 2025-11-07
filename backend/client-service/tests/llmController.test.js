// tests/llmController.test.js

const httpMocks = require("node-mocks-http");

// Mock OpenAI client
jest.mock("openai", () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      responses: {
        create: jest.fn(({ input }) => {
          // Simulate normal LLM response if input contains "Jazz Night"
          if (input.includes("Jazz Night")) {
            return {
              output: [
                { content: [{ text: '{"event":"Jazz Night","tickets":2,"intent":"book"}' }] }
              ]
            };
          }
          // Simulate LLM failure otherwise
          throw new Error("Simulated LLM failure");
        })
      }
    }))
  };
});

const { OpenAI } = require("openai");
const llmController = require("../controllers/llmController");

describe("LLM Controller", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({ method: "POST", body: {} });
    res = httpMocks.createResponse();
  });

  test("parses text correctly using LLM response", async () => {
    req.body.text = "I want to book 2 tickets for Jazz Night";

    await llmController.parseInput(req, res);

    const data = res._getJSONData();
    expect(data.parsed).toEqual({
      event: "Jazz Night",
      tickets: 2,
      intent: "book"
    });
  });

  test("falls back to keyword parsing if LLM fails", async () => {
    req.body.text = "Book 3 tickets for Rock Concert";

    await llmController.parseInput(req, res);

    const data = res._getJSONData();

    expect(data.fallback).toBe(true);
    expect(data.parsed.event).toContain("Rock Concert");
    expect(data.parsed.tickets).toBe(3);
    expect(data.parsed.intent).toBe("book");
  });

  test("returns 400 if text is missing", async () => {
    req.body = {}; // empty body

    await llmController.parseInput(req, res);

    expect(res.statusCode).toBe(400);
    const data = res._getJSONData();
    expect(data.error).toBe("Missing text in request body");
  });
});
