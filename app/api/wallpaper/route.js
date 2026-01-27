import { NextResponse } from "next/server";

const WALLPAPER_API =
  process.env.API_BASE?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:4500";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  try {
    const res = await fetch(`${WALLPAPER_API}/api/wallpaper`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream wallpaper API error" },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/wallpaper]", err);
    return NextResponse.json(
      { error: "Failed to fetch wallpapers" },
      { status: 502 }
    );
  }
}
