import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { User } from '../../../../models/backend/user';
import { Invite } from '../../../../models/backend/invite';
import { Group } from '../../../../models/backend/group';
import dbConnect from '../../../../lib/mongodb';

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
};

export async function POST(request: NextRequest)
{
  try
  {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = session.user as SessionUser;
    const githubUsername = user.githubUsername;
    
    if (!githubUsername)
      return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });

    const body = await request.json();
    const { invitationId, decision } = body;

    if (!invitationId || !decision)
      return NextResponse.json({ error: 'Invitation ID and decision are required' }, { status: 400 });

    if (decision !== 'accept' && decision !== 'reject')
      return NextResponse.json({ error: 'Decision must be either "accept" or "reject"' }, { status: 400 });

    await dbConnect();

    const invitation = await Invite.findById(invitationId);
    
    if (!invitation)
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });

    if (invitation.invitedGithubUsername !== githubUsername)
      return NextResponse.json({ error: 'This invitation is not for you' }, { status: 403 });

    if (new Date() > invitation.expiresAt)
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });

    if (decision === 'accept')
    {
      const group = await Group.findOne({ 
        repositoryUrl: invitation.githubRepoUrl,
        name: invitation.groupName 
      })
        .catch(() => null);

      if (!group)
        return NextResponse.json({ error: 'Group associated with this invitation not found' }, { status: 404 });

      if (!group.people.includes(githubUsername))
        group.people.push(githubUsername);

      await group.save();

      await User.findOneAndUpdate(
        { githubUsername: githubUsername },
        { $addToSet: { groups: group._id } },
        { upsert: false }
      );

      await User.findOneAndUpdate(
        { githubUsername: invitation.senderGithubUsername },
        { $addToSet: { groups: group._id } },
        { upsert: false }
      );
    }

    await Invite.findByIdAndDelete(invitationId);

    return NextResponse.json({ 
      message: decision === 'accept' ? 'Invitation accepted successfully' : 'Invitation rejected successfully' 
    });

  } catch (error) {
    console.error('Error responding to invitation:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
