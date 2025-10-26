'use client';

import MainLayout from '../layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useUser } from '@/lib/useUser';
import { useRouter } from 'next/navigation';

export default function DeckTutorPage() {
  const router = useRouter();
  const { user, session } = useUser();
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


  const getDeckRecommendation = async () => {
    if (!user || !user.githubUsername) {
      setTutorResponse(`# Error
Please make sure you have set up your Clash Royale account in your profile first.`);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/get-recommended-deck');
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
    <MainLayout>
      <div className="p-8">
        <div className="deck-tutor-container">
          <h1 className="text-5xl font-headline mb-12 text-center text-clash-gold-border drop-shadow-lg">
            Deck Tutor
          </h1>
        
        <Card className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-clash-gold-border/30 p-8 lg:p-12 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="prose prose-invert prose-h1:text-4xl prose-h1:font-headline prose-h1:text-clash-gold-border prose-h1:drop-shadow-lg prose-p:bg-clash-dark/50 prose-p:p-6 prose-p:rounded-lg prose-headings:drop-shadow-lg prose-li:bg-clash-dark/50 prose-li:p-4 prose-li:rounded-md max-w-none">
            <ReactMarkdown>
              {tutorResponse}
            </ReactMarkdown>
          </div>
          <div className="mt-12 flex justify-center">
            <button
              onClick={getDeckRecommendation}
              disabled={isLoading}
              className="clash-button max-w-md"
            >
              {isLoading ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-8 h-8">
                    <div className="animate-spin h-8 w-8 border-4 border-clash-gold-border/30 border-t-clash-gold-border rounded-full"></div>
                    <div className="absolute inset-0 animate-pulse flex items-center justify-center">
                      <div className="w-3 h-3 bg-clash-blue rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    </div>
                  </div>
                  Analyzing...
                </div>
              ) : (
                'Let\'s Go!'
              )}
            </button>
          </div>
        </Card>
      </div>
      </div>
    </MainLayout>
  );
}
