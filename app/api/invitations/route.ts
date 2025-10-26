import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { Invitation } from '../../../models/backend/invitation';
import { Group } from '../../../models/backend/group';
import dbConnect from '../../../lib/mongodb';

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
};

export async function GET()
{
  try
  {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const githubUsername = (session.user as SessionUser).githubUsername;
    
    if (!githubUsername)
      return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });

    await dbConnect();

    const invitations = await Invitation.find({
      invitedUser: githubUsername,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    const invitationsWithGroups = await Promise.all(
      invitations.map(async invitation => {
        const group = await Group.findById(invitation.groupId);
        return {
          id: invitation._id,
          groupId: invitation.groupId,
          groupName: group?.repo || 'Unknown Group',
          repo: group?.repo,
          invitedBy: invitation.invitedBy,
          invitedUser: invitation.invitedUser,
          status: invitation.status,
          createdAt: invitation.createdAt,
          expiresAt: invitation.expiresAt
        };
      })
    );

    return NextResponse.json(invitationsWithGroups);

  } catch (error)
  {
    console.error('Error fetching invitations:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
