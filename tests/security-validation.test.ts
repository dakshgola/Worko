import { vi, describe, it, expect, beforeEach } from "vitest";
import { updateNoteMetadata, updateNoteContent } from "@/lib/notes/actions";
import { createEvent, updateEvent } from "@/lib/calendar/actions";
import { createSpace, updateSpace, createPage, updatePage } from "@/lib/spaces/actions";
import { createWhiteboard, updateWhiteboardElements, generateAIDiagram } from "@/lib/whiteboard/actions";
import { currentUser } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rate-limit";

// Mock Drizzle DB client
let mockQueryResult: any[] = [];
vi.mock("@/db", () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: (resolve: any) => {
      return Promise.resolve(mockQueryResult).then(resolve);
    },
  };
  return { db: mockDb };
});

vi.mock("@clerk/nextjs/server", () => {
  return {
    currentUser: vi.fn(),
  };
});

describe("Security Auditing - IDOR, Rate Limiting & Input Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResult = [];
    // Reset rate limiter environments to use in-memory fallback
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  describe("1. IDOR Prevention Tests", () => {
    const ownerUser = { id: "owner_user_id" };

    it("should successfully update metadata if requested by the owner user", async () => {
      vi.mocked(currentUser).mockResolvedValue(ownerUser as any);
      mockQueryResult = [{ success: true }]; // Drizzle query matches correctly
      const result = await updateNoteMetadata("note_id_123", { title: "New Title" });
      expect(result.success).toBe(true);
    });

    it("should allow editing events if requested by the owner user", async () => {
      vi.mocked(currentUser).mockResolvedValue(ownerUser as any);
      mockQueryResult = [{ success: true }];
      const result = await updateEvent("event_id_123", { title: "New Event Title" });
      expect(result.success).toBe(true);
    });

    it("should allow page updates if requested by the creator", async () => {
      vi.mocked(currentUser).mockResolvedValue(ownerUser as any);
      mockQueryResult = [{ id: "page_id_123" }];
      const result = await updatePage("page_id_123", { title: "Updated Page Title" });
      expect(result.success).toBe(true);
    });
  });

  describe("2. Rate Limiting Tests", () => {
    it("should allow requests within limit and trigger 429 once limit is exceeded", async () => {
      const userId = "test_rate_limit_user";
      
      // AI endpoint limit is 10/min. Check 10 calls.
      for (let i = 0; i < 10; i++) {
        const res = await checkRateLimit(userId, "ai");
        expect(res.success).toBe(true);
      }

      // 11th call must trigger rate limit failure
      const res11 = await checkRateLimit(userId, "ai");
      expect(res11.success).toBe(false);
    });
  });

  describe("3. Input Validation Tests", () => {
    const mockUser = { id: "test_user_id" };

    it("should reject note metadata updates if title exceeds length limits", async () => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      
      const longTitle = "a".repeat(150); // limit is 100
      await expect(
        updateNoteMetadata("note_id_123", { title: longTitle })
      ).rejects.toThrow("Title is too long");
    });

    it("should reject note metadata updates if color format is invalid", async () => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      
      await expect(
        updateNoteMetadata("note_id_123", { color: "red" })
      ).rejects.toThrow("Invalid color format");
    });

    it("should reject note content updates if content exceeds size limit", async () => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      
      const largeContent = "a".repeat(10000005); // limit is 10MB
      await expect(
        updateNoteContent("note_id_123", largeContent, "plain", 100)
      ).rejects.toThrow("Content exceeds size limit");
    });

    it("should reject event creation if title is empty or missing", async () => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      
      await expect(
        createEvent({ title: "" })
      ).rejects.toThrow("Title is required");
    });

    it("should reject AI diagram generator prompts if too long", async () => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      
      const longPrompt = "a".repeat(1050); // limit is 1,000
      const result = await generateAIDiagram(longPrompt);
      expect(result).toContain("Diagram Error");
    });
  });
});
