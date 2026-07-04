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
});
