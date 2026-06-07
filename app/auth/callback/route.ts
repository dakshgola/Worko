import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { MissingPrimaryEmailError, syncUser } from "@/lib/sync-user";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  try {
    await syncUser(user);
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    if (error instanceof MissingPrimaryEmailError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    console.error("Failed to synchronize authenticated user", error);
    return NextResponse.json(
      { error: "Failed to synchronize authenticated user." },
      { status: 500 },
    );
  }
}
