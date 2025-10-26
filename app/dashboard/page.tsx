/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import MainLayout from '../layouts/MainLayout';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/lib/useUser';
import { GroupLogin } from '@/models/user';
import React, { useEffect, useState } from 'react';
import InviteCard from '@/components/InviteCard';

interface GroupCardProps {
    group: GroupLogin;
};

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {

    const handleClick = () => {
        window.location.href = '/dashboard/' + group.id;
    };

    return (
        <div className="clash-group-card" onClick={handleClick}>
            <h3 className="clash-group-title">{group.name || 'Unnamed Group'}</h3>
            <p className="clash-group-text">Members: {group.numMembers || 0}</p>
        </div>
    );
};

const DashTemp = () => {
    const { user, refetchUser, session, accessToken } = useUser();
    
    const [githubData, setGithubData] = React.useState<any>(null);
    const [clashData, setClashData] = React.useState<any>(null);
    
    const [githubLoading, setGithubLoading] = React.useState(false);
    const [clashLoading, setClashLoading] = React.useState(false);
    
    // Create Group Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isInvitesDialogOpen, setIsInvitesDialogOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [invites, setInvites] = useState<{ inviteId: string; groupName: string; }[]>([]);
    const [invitesLoading, setInvitesLoading] = useState(false);

    const fetchCommits = async () => {
        if(user?.githubUsername && accessToken) {
            setGithubLoading(true);
            try {
                const response = await fetch('/api/github-stats', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if(response.ok) {
                    const data = await response.json();
                    setGithubData(data);
                }
                else {
                    console.error('Failed to fetch GitHub stats:', response.status, response.statusText);
                    setGithubData(null);
                }
            }
            catch(error) {
                setGithubData(null);
            }
            finally {
                setGithubLoading(false);
            }
        }
    };    const fetchClashData = async () => {
        if(user?.clashRoyaleTag) {
            setClashLoading(true);
            try {
                const response = await fetch('/api/get-player?userId=' + user.clashRoyaleTag, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if(response.ok) {
                    const data = await response.json();
                    setClashData(data);
                }
                else {
                    console.error('Failed to fetch clash data');
                    setClashData(null); // Explicitly set to null on failure
                }
            }
            catch (error) {
                console.error('Error fetching clash data:', error);
                setClashData(null); // Explicitly set to null on error
            }
            finally {
                setClashLoading(false);
            }
        }
    };

    // Helper functions to determine display text
    const getGithubDisplayText = () => {
        if (githubLoading) return 'Loading...';
        if (githubData && githubData.commits !== undefined) {
            let displayText = `${githubData.commits} commits`;
            if (githubData.period) {
                displayText += `\n(${githubData.period})`;
            }
            if (githubData.totalRepos !== undefined) {
                displayText += `\n${githubData.totalRepos} public repos`;
            }
            return displayText;
        }
        return 'Data not found';
    };

    const getClashDisplayText = () => {
        if (clashLoading) return 'Loading...';
        
        if (clashData && clashData !== null) {
            let returnString = '';
            if (clashData.trophies !== undefined) {
                returnString += clashData.trophies + ' trophies\n';
            }
            if (clashData.wins !== undefined) {
                returnString += clashData.wins + ' wins\n';
            }
            if (clashData.losses !== undefined) {
                returnString += clashData.losses + ' losses\n';
            }
            if (clashData.battleCount !== undefined) {
                returnString += clashData.battleCount + ' total battles\n';
            }
            return returnString.trim() || 'Stats Unavailable';
        }
        
        return 'Data not found';
    };

    const fetchInvites = async () => {
        setInvitesLoading(true);
        try {
            const response = await fetch('/api/invite', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setInvites(data);
            } else {
                console.error('Failed to fetch invites');
                setInvites([]);
            }
        } catch (error) {
            console.error('Error fetching invites:', error);
            setInvites([]);
        } finally {
            setInvitesLoading(false);
        }
    };

    const handleAcceptInvite = async (inviteId: string) => {
        try {
            const response = await fetch(`/api/invite/${inviteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                await refetchUser();
                await fetchInvites();
            } else {
                console.error('Failed to accept invite');
                alert('Failed to accept invite. Please try again.');
            }
        } catch (error) {
            console.error('Error accepting invite:', error);
            alert('Error accepting invite. Please try again.');
        }
    };

    const handleDeclineInvite = async (inviteId: string) => {
        try {
            const response = await fetch(`/api/invite/${inviteId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                await fetchInvites();
            } else {
                console.error('Failed to decline invite');
                alert('Failed to decline invite. Please try again.');
            }
        } catch (error) {
            console.error('Error declining invite:', error);
            alert('Error declining invite. Please try again.');
        }
    };
        
    // Handle create group form submission
    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!groupName.trim() || !repoUrl.trim()) {
            alert('Please fill in all fields');
            return;
        }
        
        try {
            const response = await fetch('/api/group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: groupName.trim(),
                    repositoryUrl: repoUrl.trim(),
                }),
            });
            
            if (response.ok) {
                // Reset form and close dialog
                setGroupName('');
                setRepoUrl('');
                setIsDialogOpen(false);
                // Refetch user data to get updated groups
                await refetchUser();
            } else {
                console.error('Failed to create group');
                alert('Failed to create group. Please try again.');
            }
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Error creating group. Please try again.');
        }
    };
        
    useEffect(() => {
        if (user && !user.clashRoyaleTag) {
            window.location.href = '/profile';
            return;
        }
        fetchCommits();
        fetchClashData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <MainLayout>
            <div className='p-8'>
                <div className='max-w-7xl mx-auto p-8'>
                <div className='flex flex-row items-start gap-12'>
                    {/* Profile Picture Section - 1/3 width */}
                    <div className='w-1/3 flex flex-col items-center gap-4 bg-clash-dark rounded-2xl border-4 border-clash-gold p-6'>
                        <Avatar className="w-64 h-64 rounded-full">
                            {
                                user?.avatarUrl ? (
                                    <AvatarImage src={user.avatarUrl} alt={user?.name} className="w-full h-full" />
                                ) : (
                                    <AvatarFallback className="text-4xl">{user?.name?.[0] ?? ''}</AvatarFallback>
                                )
                            }
                        </Avatar>
                        <div>
                            <br></br>
                            {user?.name}
                        </div>
                        <div className="text-center">
                            <h3>GitHub Stats</h3>
                            <p className="text-clash-white whitespace-pre-line">
                                {getGithubDisplayText()}
                            </p>
                            <h3>Clash Stats</h3>
                            <p className="text-clash-white whitespace-pre-line">
                                {getClashDisplayText()}
                            </p>
                        </div>
                        <div className="flex flex-row justify-center gap-4 w-full p-4">
                            <button
                                className="clash-button-small"
                                style={{ height: '50px', fontSize: '1.25rem', minWidth: '120px' }}
                                onClick={() => setIsDialogOpen(true)}
                            >
                                Create Group
                            </button>
                            <button
                                className="clash-button-small"
                                style={{ height: '50px', fontSize: '1.25rem', minWidth: '40px' }}
                                onClick={() => {
                                    setIsInvitesDialogOpen(true);
                                    fetchInvites();
                                }}
                            >
                                View Invites
                            </button>
                        </div>
                    </div>
                    
                    {/* Group Cards Section - 2/3 width */}
                    <div className='w-2/3 ml-8'>
                        {/* Invites Dialog */}
                        <Dialog open={isInvitesDialogOpen} onOpenChange={setIsInvitesDialogOpen}>
                            <DialogContent className='clash-dialog'>
                                <DialogHeader className='clash-dialog-header'>
                                    <DialogTitle className='clash-dialog-title'>Group Invites</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto">
                                    {invitesLoading ? (
                                        <p className="text-clash-white text-center">Loading invites...</p>
                                    ) : invites.length > 0 ? (
                                        invites.map((invite) => (
                                            <InviteCard
                                                key={invite.inviteId}
                                                inviteId={invite.inviteId}
                                                groupName={invite.groupName}
                                                onAccept={handleAcceptInvite}
                                                onDecline={handleDeclineInvite}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-clash-white text-center">No pending invites</p>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Create Group Dialog */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogContent className='clash-dialog'>
                                <DialogHeader className='clash-dialog-header'>
                                    <DialogTitle className='clash-dialog-title'>Create New Group</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateGroup} className='space-y-4'>
                                    <div>
                                        <Label htmlFor='groupName' className='text-clash-white'>
                                            Group Name
                                        </Label>
                                        <Input
                                            id='groupName'
                                            type='text'
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                            placeholder='Enter group name'
                                            className='bg-clash-dark border-clash-blue text-clash-white'
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor='repoUrl' className='text-clash-white'>
                                            Repository URL
                                        </Label>
                                        <Input
                                            id='repoUrl'
                                            type='url'
                                            value={repoUrl}
                                            onChange={(e) => setRepoUrl(e.target.value)}
                                            placeholder='https://github.com/username/repository'
                                            className='bg-clash-dark border-clash-blue text-clash-white'
                                            required
                                        />
                                    </div>
                                    <div className='flex justify-end space-x-2'>
                                        <Button 
                                            type='button' 
                                            variant='outline' 
                                            onClick={() => setIsDialogOpen(false)}
                                            className='border-clash-blue text-clash-white hover:bg-clash-blue/20'
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type='submit'
                                            className='bg-clash-blue hover:bg-clash-blue/80 text-white'
                                        >
                                            Create Group
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <div className="clash-leaderboard">
                            <h2 className="clash-group-title mb-6">Your Groups</h2>
                            {user?.groups.length || 0 > 0 ? (
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                    {user?.groups.map((group, index) => (
                                        <GroupCard key={index} group={group} />
                                    ))}
                                </div>
                            ) : (
                                <div className='flex items-center justify-center h-64'>
                                    <p className='clash-group-text text-lg text-center'>
                                        You are currently not in any groups
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </MainLayout>
    );
};

export default DashTemp;
