import { Liveblocks } from "@liveblocks/node";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ratelimit = await checkRateLimit(user.id, "realtime");
    if (!ratelimit.success) {
      return NextResponse.json(
        { error: "Too many requests, please wait a moment" },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((ratelimit.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const liveblocks = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY || "",
    });

    const json = await request.json().catch(() => ({}));
    const room = json.room || "workspace-default";

    // Prepare Liveblocks session
    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Guest User",
        avatar: user.imageUrl || "",
      },
    });

    // Grant full access permissions to the room
    session.allow(room, session.FULL_ACCESS);

    const { status, body } = await session.authorize();
    return new NextResponse(body, { status });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
