import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { Invitation } from '../../../../../models/backend/invitation';
import { Group } from '../../../../../models/backend/group';
import { User } from '../../../../../models/backend/user';
import dbConnect from '../../../../../lib/mongodb';

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
};

export async function POST(request: NextRequest, { params }: { params: { invitationId: string } })
{
  try
  {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const githubUsername = (session.user as SessionUser).githubUsername;
    
    if (!githubUsername)
      return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });

    const { invitationId } = params;
    const body = await request.json();
    const { action } = body;

    if (!action || !['accept', 'decline'].includes(action))
      return NextResponse.json({ error: 'Action must be "accept" or "decline"' }, { status: 400 });

    await dbConnect();

    const invitation = await Invitation.findById(invitationId);
    
    if (!invitation)
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });

    if (invitation.invitedUser !== githubUsername)
      return NextResponse.json({ error: 'You are not authorized to respond to this invitation' }, { status: 403 });

    if (invitation.status !== 'pending')
      return NextResponse.json({ error: 'Invitation is no longer pending' }, { status: 400 });

    if (invitation.expiresAt < new Date())
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });

    invitation.status = action === 'accept' ? 'accepted' : 'declined';
    await invitation.save();

    if (action === 'accept')
    {
      await Group.findByIdAndUpdate(
        invitation.groupId,
        { $addToSet: { people: githubUsername } }
      );

      await User.findOneAndUpdate(
        { githubUsername: githubUsername },
        { 
          $addToSet: { groups: invitation.groupId },
          $pull: { pendingInvitations: invitationId }
        }
      );
    }
    else
    {
      await User.findOneAndUpdate(
        { githubUsername: githubUsername },
        { $pull: { pendingInvitations: invitationId } }
      );
    }

    return NextResponse.json({
      id: invitation._id,
      groupId: invitation.groupId,
      invitedBy: invitation.invitedBy,
      invitedUser: invitation.invitedUser,
      status: invitation.status,
      action: action,
      message: `Invitation ${action}ed successfully`
    });

  } catch (error)
  {
    console.error('Error responding to invitation:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
