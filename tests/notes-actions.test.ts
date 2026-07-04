import { vi, describe, it, expect, beforeEach } from "vitest";
import { listNotes, createNote } from "@/lib/notes/actions";
import { currentUser } from "@clerk/nextjs/server";

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

describe("Notes Server Actions Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResult = [];
  });

  describe("Auth Guard Checks", () => {
    it("should reject listNotes call with Unauthorized if currentUser is null", async () => {
      vi.mocked(currentUser).mockResolvedValue(null as any);

      await expect(listNotes()).rejects.toThrow("Unauthorized");
    });

    it("should reject createNote call with Unauthorized if currentUser is null", async () => {
      vi.mocked(currentUser).mockResolvedValue(null as any);

      await expect(createNote()).rejects.toThrow("Unauthorized");
    });
  });

  describe("CRUD Cycle Tests", () => {
    const mockUser = { id: "test_user_id" };

    it("should list user notes successfully when authenticated", async () => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      const expectedNotes = [
        { id: "note_1", title: "Note 1", userId: "test_user_id" },
        { id: "note_2", title: "Note 2", userId: "test_user_id" },
      ];
      mockQueryResult = expectedNotes;

      const result = await listNotes();
      expect(result).toEqual(expectedNotes);
    });

    it("should create a new note successfully when authenticated", async () => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);

      const result = await createNote({ title: "Test Creative Title" });
      expect(result.userId).toBe(mockUser.id);
      expect(result.title).toBe("Test Creative Title");
      expect(result.color).toBe("#6c5ce7");
      expect(result.id).toContain("note_");
    });
  });
});
