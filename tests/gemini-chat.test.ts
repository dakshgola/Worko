import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/ai/chat/route";
import { currentUser } from "@clerk/nextjs/server";

vi.mock("@clerk/nextjs/server", () => {
  return {
    currentUser: vi.fn(),
  };
});

describe("Gemini Chat API Route Handler Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return 401 Unauthorized if user is not logged in", async () => {
    vi.mocked(currentUser).mockResolvedValue(null as any);
    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ prompt: "Hello Gemini" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 Bad Request if prompt is missing", async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: "user_123" } as any);
    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ prompt: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return simulated stream if GEMINI_API_KEY is not defined", async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: "user_123" } as any);
    delete process.env.GEMINI_API_KEY;

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ prompt: "Explain quantum mechanics" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");

    // Read the stream
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let text = "";
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
      }
    }
    expect(text).toContain("[Simulated Response to:");
  });

  it("should call real Gemini endpoint if GEMINI_API_KEY is defined", async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: "user_123" } as any);
    process.env.GEMINI_API_KEY = "dummy-api-key";

    const mockResponseData = {
      candidates: [
        {
          content: {
            parts: [{ text: "This is a real response from Gemini model" }],
          },
        },
      ],
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponseData,
    } as any);

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ prompt: "Hello real Gemini" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");

    // The handler wraps result in createSimulatedStream, which splits words with space
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let text = "";
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
      }
    }
    expect(text).toContain("This is a real response from Gemini model");
  });

  it("should include systemInstruction and pass full history to Gemini in multi-turn conversation", async () => {
    vi.mocked(currentUser).mockResolvedValue({ id: "user_123" } as any);
    process.env.GEMINI_API_KEY = "dummy-api-key";

    const mockResponseData = {
      candidates: [
        {
          content: {
            parts: [{ text: "Hi Daksh, I can help you schedule that meeting." }],
          },
        },
      ],
    };

    let fetchBody: any = null;
    vi.mocked(global.fetch).mockImplementation(async (url, init) => {
      fetchBody = JSON.parse(init?.body as string);
      return {
        ok: true,
        json: async () => mockResponseData,
      } as any;
    });

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          { role: "user", content: "My name is Daksh." },
          { role: "assistant", content: "Nice to meet you, Daksh! How can I help you today?" },
          { role: "user", content: "Can you help me schedule a meeting?" }
        ]
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verify fetch was called with the correct request body format
    expect(fetchBody).not.toBeNull();
    
    // Verify system instruction is set
    expect(fetchBody.systemInstruction).toBeDefined();
    expect(fetchBody.systemInstruction.parts[0].text).toContain("productivity assistant for Worko");
    expect(fetchBody.systemInstruction.parts[0].text).toContain("conversational");
    
    // Verify contents has full history mapped correctly
    expect(fetchBody.contents).toHaveLength(3);
    expect(fetchBody.contents[0].role).toBe("user");
    expect(fetchBody.contents[0].parts[0].text).toBe("My name is Daksh.");
    expect(fetchBody.contents[1].role).toBe("model");
    expect(fetchBody.contents[1].parts[0].text).toBe("Nice to meet you, Daksh! How can I help you today?");
    expect(fetchBody.contents[2].role).toBe("user");
    expect(fetchBody.contents[2].parts[0].text).toBe("Can you help me schedule a meeting?");
  });
});
