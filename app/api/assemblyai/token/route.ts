import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AssemblyAI API key is missing" }, { status: 500 });
    }

    const response = await fetch("https://streaming.assemblyai.com/v3/token?expires_in_seconds=600", {
      method: "GET",
      headers: {
        "Authorization": apiKey,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AssemblyAI token retrieval failed:", errText);
      return NextResponse.json({ error: "Failed to generate token" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("AssemblyAI token route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
