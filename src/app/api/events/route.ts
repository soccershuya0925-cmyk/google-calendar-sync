import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // @ts-ignore
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, dates, startTime, endTime, description, colorId } = await req.json();

    if (!title || !dates || dates.length === 0 || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // @ts-ignore
    auth.setCredentials({ access_token: session.accessToken });

    const calendar = google.calendar({ version: "v3", auth });

    const insertPromises = dates.map(async (dateStr: string) => {
      const event: any = {
        summary: title,
        description: description,
        start: {
          dateTime: `${dateStr}T${startTime}:00`,
          timeZone: 'Asia/Tokyo',
        },
        end: {
          dateTime: `${dateStr}T${endTime}:00`,
          timeZone: 'Asia/Tokyo',
        },
      };

      if (colorId) {
        event.colorId = colorId;
      }

      return calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
    });

    const responses = await Promise.all(insertPromises);

    return NextResponse.json({ message: `${dates.length} Events created`, events: responses.map(r => r.data) }, { status: 200 });
  } catch (error: any) {
    console.error("Calendar insert error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
