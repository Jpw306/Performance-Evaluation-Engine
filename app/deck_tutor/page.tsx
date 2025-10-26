'use client';

import NavBar from '@/components/NavBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useUser } from '@/lib/useUser';

export default function DeckTutorPage() {
  // All hooks must be called before any conditional returns
  const { user, loading: userLoading, session } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [tutorResponse, setTutorResponse] = useState(`
# Welcome to Deck Tutor! 🏆

I'm here to help you improve your deck and gameplay strategy.

Here's what I can do:
* Analyze your current deck
* Suggest improvements
* Provide card synergy tips
* Share meta insights

Let's get started!
  `);

  // If not logged in, show login message
  if (!userLoading && !session) {
    return (
      <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] text-clash-white p-8 font-text">
        <NavBar />
        <div className="max-w-4xl mx-auto mt-12 px-4">
          <Card className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-clash-blue/50 p-8 lg:p-10 rounded-xl shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-headline mb-4 text-clash-gold-border">Please Log In</h2>
              <p className="text-clash-white">You need to be logged in to use the Deck Tutor.</p>
            </div>
          </Card>
        </div>
      </main>
    );
  }
  const getDeckRecommendation = async () => {
    console.log('Button clicked, user:', user);
    if (!user || !user.id) {
      console.log('No user found or missing user ID');
      setTutorResponse(`# Error
Please make sure you have set up your Clash Royale account in your profile first.`);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Making API call with userId:', user.githubUsername);
      const response = await fetch(`/api/get-recommended-deck?userId=${user.githubUsername}`);
      const data = await response.json();
      
      if (response.ok) {
        setTutorResponse(data.response);
      } else {
        setTutorResponse(`# Error
Something went wrong while getting your deck recommendation.
Please try again later.`);
      }
    } catch (error) {
      setTutorResponse(`# Error
Failed to get deck recommendation.
Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] text-clash-white p-8 font-text">
      <NavBar />
      <div className="max-w-4xl mx-auto mt-12 px-4">
        <h1 className="text-4xl font-headline mb-8 text-center text-clash-gold-border drop-shadow-lg">
          Deck Tutor
        </h1>
        
        <Card className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-clash-blue/50 p-8 lg:p-10 rounded-xl shadow-lg">
          <div className="prose prose-invert prose-p:bg-slate-900/50 prose-p:p-4 prose-p:rounded-lg prose-headings:drop-shadow-lg prose-li:bg-slate-900/50 prose-li:p-2 prose-li:rounded-md max-w-none">
            <ReactMarkdown>
              {tutorResponse}
            </ReactMarkdown>
          </div>
          <div className="mt-8 flex justify-center">
            <Button
              onClick={getDeckRecommendation}
              disabled={isLoading}
              className="bg-clash-blue hover:bg-clash-blue/80 text-white font-headline text-lg px-8 py-4"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                "Let's Go!"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
