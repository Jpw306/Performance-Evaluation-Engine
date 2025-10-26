/*
    GET Request
    Takes global userId as a parameter
    Fetches ClashID from Atlas
    Gets match history from past 10 matches
    Sends as prompt to Gemini and requests deck advice
    Returns gemini response
*/

import { NextResponse } from "next/server";
import { CLASH_API_BASE_URL } from "@/lib/constants";
import { GoogleGenAI } from "@google/genai";
import { sliceAndTransform, transformBattleLogs } from "@/lib/clash_api_helper_functions";

const ai = new GoogleGenAI({});

export async function GET(request : Request) {

    // get user id from url
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({error: "Missing userId in parameters!"}, {status: 400});

    // get clash id from database
    const tempClashId = process.env.TEMP_CLASH_ID; // TODO: replace this with permanent solution
    if (!tempClashId) return NextResponse.json({error: "Missing ClashID Tag!"}, {status: 400});

    // forward to clash api - get user battlelog
    const res = await fetch(`${CLASH_API_BASE_URL}/players/${encodeURIComponent(tempClashId)}/battlelog`, {
        headers: { Authorization: `Bearer ${process.env.CLASH_API_TOKEN}`}
    });

    const data = await res.json();

    // make json array of last 5 matches
    // get only matches, card names, opponent card names, outcome
    const parsedData = sliceAndTransform(data, tempClashId); 
    const dataAsText = JSON.stringify(parsedData);

    const promptQuestion : string = 
    "The json provided below represents the past 5 matches of Clash Royale played by the user.\n"
    + "The user wants advice for improving their deck to perform better against their opponent's deck.\n"
    + "Please provide a full deck recommendation for the user, and explain how they can use it\n";

    const fullPrompt = promptQuestion + dataAsText;

    // ask gemini for suggestions
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt, 
    });

    return NextResponse.json({response: response.text}, {status: 200});
}