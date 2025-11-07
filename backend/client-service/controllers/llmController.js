const OpenAI = require("openai");
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

exports.parseInput = async(req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({error: "Missing text in request body"});
    }

    try {
        const response = await openai.responses.create({
            model: "gpt-4o-mini",
            input: `Extract the event name, number of tickets, and intent (book/view) from this text.
            Intent should be "book" for any booking/reservation-like request, or "view" for any info-checking request.
            Respond ONLY as JSON with keys: event, tickets, intent.
            Example: {"event":"Jazz Night","tickets":2,"intent":"book"} 
            Text: "${text}"`,
        });

        let raw = response.output[0].content[0].text;
        raw = raw.replace(/```json\s*/i, "").replace(/```/g, "").trim();


        let data;

        try {
            data = JSON.parse(raw);
        } catch {
            // Keyword-based fallback
            const lower = text.toLowerCase();
            let intent = "view";
            if (lower.includes("book") || lower.includes("purchase")) {
                intent = "book";
            }

            const ticketsMatch = text.match(/(\d+)\s*tickets?/i);
            const tickets = ticketsMatch ? parseInt(ticketsMatch[1]) : 1;

            const eventMatch = text.match(/for\s+(.+)/i);
            const event = eventMatch ? eventMatch[1].trim() : "Unknown event";

            data = {event, tickets, intent};

            return res.json({
                parsed: data,
                fallback: true,
                message: "Used keyword-based fallback because LLM parsing failed."
            });
        }

        res.json({parsed: data});
    } catch(err) {
        console.error("LLM error:", err);
        res.status(500).json({error: "Failed to process request." });
    }
};