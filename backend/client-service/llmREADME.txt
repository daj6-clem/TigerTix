## Natural Language Query (LLM Integration)
The server uses OpenAI's GPT-4o-mini model to parse generalized ticket requests.
To use/test, create a '.env' file in 'backend/client-service/' containing:

OPENAI_API_KEY=your_api_key_here

An API Key can be obtained by creating a free account at
https://platform.openai.com/api-keys

Then run:
npm install
node server.js




Endpoint: POST http://localhost:6001/api/llm/parse
Body example:
{
  "text": "Book two tickets for Jazz Night"
}
