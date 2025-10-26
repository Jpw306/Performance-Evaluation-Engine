'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/useUser';
import CompassGrid from '@/components/CompassGrid';
import Leaderboard from '@/components/LeaderboardTable';
import NavBar from '@/components/NavBar';
import { dangerZone } from '@/lib/clash_helper_functions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';
import { GroupContext } from '@/lib/types';

interface GroupData {
  name: string;
  repositoryUrl: string;
  people: string[];
}

interface GroupMember {
  id: string;
  name: string;
  photoIcon: string;
  githubUsername: string;
  commits: number;
  winRate: number;
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const params = useParams<{ groupId?: string }>();
  const router = useRouter();
  const groupId = params?.groupId;
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupContext, setGroupContext] = useState<GroupContext | null>(null);
  const [dangerMessage, setDangerMessage] = useState(0);

  // Funny messages for the danger button
  const dangerMessages = [
    "Click here to not get fired! 🔥",
    "You kinda suck... Let's fix that! 💪",
    "Need help? Click me! 🆘",
    "Git gud or git gone! 🎮",
    "Your performance is sus! 👻",
    "Time to level up! ⬆️"
  ];


  
  // Invite dialog state
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [groupData, setGroupData] = useState<GroupData | null>(null);

  useEffect(() => {
  const fetchGroup = async () => {
    if (!groupId) return;
    try {
      const res = await fetch(`/api/group/${groupId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch group');
      const data = await res.json();
      setMembers(data.members || []);
      setGroupData(data);

      // Initialize group context when all data is loaded
      if (data.members?.length > 0) {
        const context: GroupContext = {
          groupId,
          users: new Map(data.members.map((member: GroupMember) => [
            member.githubUsername,
            {
              githubUsername: member.githubUsername,
              commits: member.commits,
              winRate: member.winRate,
              score: member.commits + member.winRate, // Basic scoring formula - adjust as needed
              position: {
                rank: 0, // Will be calculated after initialization
                percentile: 0,
                trend: 'stable'
              },
              historicalData: {
                commits: [member.commits],
                winRates: [member.winRate],
                timestamps: [new Date().toISOString()]
              }
            }
          ])),
          stats: {
            avgCommits: data.members.reduce((sum: number, m: GroupMember) => sum + m.commits, 0) / data.members.length,
            avgWinRate: data.members.reduce((sum: number, m: GroupMember) => sum + m.winRate, 0) / data.members.length,
            totalCommits: data.members.reduce((sum: number, m: GroupMember) => sum + m.commits, 0),
            activeUsers: data.members.length
          },
          thresholds: {
            dangerZone: 50, // Adjust these thresholds based on your requirements
            highPerformer: 150
          },
          timeframe: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
            end: new Date().toISOString()
          }
        };
        
        setGroupContext(context);
      }
    } catch (err) {
      console.error('Error fetching group data:', err);
    } finally {
      setLoading(false);
    }
  };

    fetchGroup();
  }, [groupId]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteUsername.trim()) {
      toast.error('Please enter a GitHub username');
      return;
    }
    
    if (!groupData) {
      toast.error('Group data not available');
      return;
    }
    setIsInviting(true);
    
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: inviteUsername.trim(),
          githubUrl: groupData.repositoryUrl,
          groupName: groupData.name
        }),
      });
      if (response.ok) {
        setInviteUsername('');
        setIsInviteDialogOpen(false);
        toast.success('Invitation sent successfully!');
      } else {
        const error = await response.json();
        toast.error(`Failed to send invitation: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  // Effect to rotate danger messages
  useEffect(() => {
    if (groupContext && user?.githubUsername && dangerZone(groupContext).includes(user.githubUsername)) {
      const interval = setInterval(() => {
        setDangerMessage((prev) => (prev + 1) % dangerMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [groupContext, user?.githubUsername]);

  // Function to handle deck tutor navigation
  const goToDeckTutor = () => {
    router.push('/deck_tutor');
  };

  if (loading || userLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-clash-light font-clash text-lg">
        Loading group data...
      </div>
    );

  const isUserInDanger = groupContext && user?.githubUsername && dangerZone(groupContext).includes(user.githubUsername);

  return (
    <>
      <Toaster position="top-right" />
      <NavBar />
      {isUserInDanger && (
        <div 
          className="fixed bottom-8 right-8 z-50 animate-bounce"
          style={{
            animation: "bounce 2s infinite, shake 0.5s infinite"
          }}
        >
          <button
            onClick={goToDeckTutor}
            className="clash-button relative group transform hover:scale-105 transition-all"
            style={{
              backgroundColor: '#ef4444',
              borderColor: '#dc2626',
              boxShadow: '0 8px 0 #991b1b, 0 10px 16px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 68, 68, 0.5)',
              maxWidth: '300px',
              fontSize: '1.5rem',
              height: '70px'
            }}
          >
            {dangerMessages[dangerMessage]}
            <div className="absolute -inset-1 bg-red-500 opacity-30 rounded-lg blur-lg group-hover:opacity-50 transition-opacity"></div>
          </button>
        </div>
      )}
      <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] bg-cover bg-center text-clash-white p-8 font-text flex flex-col items-center">
        <h1 className="font-clash text-4xl uppercase tracking-tightest text-clash-gold mb-6">
          {user?.name}&apos;s Group Dashboard
        </h1>        
        <div className="mb-8">
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <button className="clash-button max-w-md">
                Invite Member
              </button>
            </DialogTrigger>
            <DialogContent className='w-3/4 bg-clash-dark border-clash-blue'>
              <DialogHeader>
                <DialogTitle className='text-clash-white'>Invite New Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInviteSubmit} className='space-y-4'>
                <div>
                  <Label htmlFor='githubUsername' className='text-clash-white'>
                    GitHub Username
                  </Label>
                  <Input
                    id='githubUsername'
                    type='text'
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    placeholder='Enter GitHub username'
                    className='bg-clash-dark border-clash-blue text-clash-white'
                    required
                  />
                </div>
                <div className='flex justify-end space-x-2'>
                  <Button 
                    type='button' 
                    onClick={() => setIsInviteDialogOpen(false)}
                    className='bg-clash-blue hover:bg-clash-blue/80 text-white'
                    disabled={isInviting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type='submit'
                    className='bg-clash-blue hover:bg-clash-blue/80 text-white'
                    disabled={isInviting}
                  >
                    {isInviting ? 'Sending...' : 'Send Invite'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <section className="flex flex-col gap-16 w-full max-w-5xl items-center">
          <CompassGrid members={members} groupContext={groupContext} />
          <Leaderboard members={members} groupContext={groupContext} />
        </section>
      </main>
    </>
  );
}
