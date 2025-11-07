// tests/llmController.test.js

const {parseInput, parseFallback} = require("../controllers/llmController");
const httpMocks = require("node-mocks-http");

test("returns 400 if text is missing", async () => {
  const request = httpMocks.createRequest({method: "POST", body: {}})
  const response = httpMocks.createResponse();

  await parseInput(request, response);

  const data = response._getJSONData();
  expect(response.statusCode).toBe(400);
  expect(data.error).toBe("Missing text in request body");
});

test("parses text correctly using LLM response", async () => {
  const request = httpMocks.createRequest({
    method: "POST", 
    body: {text: "I want to book 2 tickets for Jazz Night"}
  });

  const response = httpMocks.createResponse();

  await parseInput(request, response);

  const data = response._getJSONData();
  expect(data.parsed).toEqual({
      "event": "Jazz Night",
      "tickets": 2,
      "intent": "book"
  });
});

test("parses text correctly using Fallback", async () => {
  const request = httpMocks.createRequest({
    method: "POST",
    body: {text: "Book 3 tickets for Rock Concert"}
  });

  const response = httpMocks.createResponse();

  await parseFallback(request, response);

  const data = response._getJSONData();

  expect(data.parsed).toEqual({
    "event": "Rock Concert",
    "tickets": 3,
    "intent": "book"
  })
});

/* The items below are too difficult to implement properly as is.
   Putting a plug in them for now.
jest.mock("openai", () => {
  return {
    OpenAI: jest.fn().mockImplementation(()=>({
      responses: {
        create: jest.fn(() => {
          throw new Error("Simulated LLM failure");
        })
      }
    }))
  };
});

test("falls back to keyword parsing if LLM fails", async() => {
  const request = httpMocks.createRequest({
    method: "POST",
    body: {text: "Book 3 tickets for Rock Concert"}
  });

  const response = httpMocks.createResponse();

  await llmController.parseInput(request, response);

  const data = response._getJSONData();

  expect(data.fallback).toBe(true);
  expect(data.parsed).toEqual({
    "event": "Rock Conert",
    "tickets": 3,
    "intent": "book"
  });
})

*/