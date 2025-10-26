/*
    GET Request
    Takes global userId as a parameter
    Fetches ClashID from Atlas
    Gets match history from past 5 matches
    Sends as prompt to Gemini and requests deck advice
    Returns gemini response
*/

import { NextResponse } from 'next/server';
import { CLASH_API_BASE_URL } from '@/lib/constants';
import { GoogleGenAI } from '@google/genai';
import { sliceAndTransform, transformBattleLogs } from '@/lib/clash_api_helper_functions';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/backend/user';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
};

const ai = new GoogleGenAI({});

export async function GET(request : Request) {

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user)
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const githubUsername = (session.user as SessionUser).githubUsername;

    if (!githubUsername)
            return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });

    // get clash id from database
    let clashId;

    try {
        await dbConnect();

        const user = await User.findOne({ githubUsername: githubUsername });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        clashId = user.clashRoyaleTag;
    } catch (error) {
        console.error('Err fetching user:', error);
        return NextResponse.json(
              { error: 'Internal server error' },
              { status: 500 }
        );
    }

    if (!clashId) return NextResponse.json({error: 'Missing ClashID Tag!'}, {status: 400});

    // forward to clash api - get user battlelog
    const res = await fetch(`${CLASH_API_BASE_URL}/players/${encodeURIComponent(clashId)}/battlelog`, {
        headers: { Authorization: `Bearer ${process.env.CLASH_API_TOKEN}`}
    });

    const data = await res.json();

    // make json array of last 5 matches
    // get only matches, card names, opponent card names, outcome
    const parsedData = sliceAndTransform(data, clashId); 
    const dataAsText = JSON.stringify(parsedData);

    const promptQuestion : string = 
    'The json provided below represents the past 5 matches of Clash Royale played by the user.\n'
    + 'The user wants advice for improving their deck to perform better against their opponent\'s deck.\n'
    + 'Please provide a full deck recommendation for the user, and explain how they can use it\n'
    + 'Don\'t mention the json data in your response, just provide the deck advice.\n'
    + 'Be like a strict, goofy boss if you\'re falling behind, but jovial if doing well.\n'
    + 'Yo\'re talking to one person.';

    const fullPrompt = promptQuestion + dataAsText;
    
    // ask gemini for suggestions
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt, 
    });
    

    return NextResponse.json({response: response.text}, {status: 200});
}