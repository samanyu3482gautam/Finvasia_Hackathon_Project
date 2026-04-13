import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Backend Tools Logic ───────────────────────────────────────────────────────
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const tools = [
  {
    type: "function",
    function: {
      name: "get_portfolio",
      description: "Get the user's current investment portfolio (stocks, mutual funds, etc.)",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "The Auth0 sub (ID) of the user" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_stock_details",
      description: "Get real-time price, quote, and profile information for a specific stock symbol (e.g. TCS.NS, AAPL)",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "The ticker symbol, e.g. INFY.NS" },
        },
        required: ["symbol"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_stock_news",
      description: "Get the latest market news and updates for a specific stock symbol",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string", description: "The ticker symbol" },
        },
        required: ["symbol"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_sandbox_dashboard",
      description: "Get the user's sandbox trading status, including level, credit score, and current strategy",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "The user's ID" },
        },
        required: ["userId"],
      },
    },
  },
];

async function callTool(name, args) {
  try {
    if (name === "get_portfolio") {
      const r = await fetch(`${BACKEND_URL}/api/portfolio/${args.userId}`);
      return r.ok ? await r.json() : { error: "Failed to fetch portfolio" };
    }
    if (name === "get_stock_details") {
      const [q, p] = await Promise.all([
        fetch(`${BACKEND_URL}/api/stock/quote/${args.symbol}`).then(r => r.json()),
        fetch(`${BACKEND_URL}/api/stock/profile/${args.symbol}`).then(r => r.json()),
      ]);
      return { quote: q, profile: p };
    }
    if (name === "get_stock_news") {
      const r = await fetch(`${BACKEND_URL}/api/stock/news/${args.symbol}`);
      return r.ok ? await r.json() : { error: "Failed to fetch news" };
    }
    if (name === "get_sandbox_dashboard") {
      const r = await fetch(`${BACKEND_URL}/api/tradeverse/dashboard/${args.userId}`);
      return r.ok ? await r.json() : { error: "Failed to fetch sandbox data" };
    }
  } catch (err) {
    console.error(`Tool call error [${name}]:`, err);
    return { error: err.message };
  }
}

// ── API Route Handler ────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { messages, userId, lang = "en" } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const systemPrompt = `
      You are "AI Dost", a friendly, expert financial assistant for the WealthPulse platform.
      
      ROLE:
      - You help users manage their portfolio, understand stocks, and play in the Sandbox trading terminal.
      - Be conversational, warm, and professional. Think of yourself as a knowledgeable friend.
      - ALWAYS answer in the requested language: ${lang === 'hi' ? 'HINDI' : 'ENGLISH'}.
      
      CAPABILITIES:
      - You can access the user's REAL-TIME data using tools.
      - If a user asks "What do I own?" or "My portfolio", call 'get_portfolio'.
      - If they ask about a stock like TCS or RELIANCE, call 'get_stock_details'.
      - If they ask about their progress or level, call 'get_sandbox_dashboard'.
      
      CONSTRAINTS:
      - DO NOT give direct buy/sell financial advice. Use terms like "This might be interesting" or "Analysis shows".
      - Keep text responses concise (under 150 words).
      - STRICT: No emojis, no markdown (no # or **), just clean conversational text.
    `;

    // 1. Initial Call to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // High fidelity agent
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      tools,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;

    // 2. Handle Tool Calls if any
    if (responseMessage.tool_calls) {
      const toolMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        responseMessage
      ];

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        // Inject userId if the tool needs it and it's missing
        if ((functionName === "get_portfolio" || functionName === "get_sandbox_dashboard") && !functionArgs.userId) {
          functionArgs.userId = userId;
        }

        const toolResult = await callTool(functionName, functionArgs);

        toolMessages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(toolResult),
        });
      }

      // Final completion after tools
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: toolMessages,
      });

      return NextResponse.json(finalResponse.choices[0].message);
    }

    // Default simple response
    return NextResponse.json(responseMessage);

  } catch (error) {
    console.error("AI Dost Agent Error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
