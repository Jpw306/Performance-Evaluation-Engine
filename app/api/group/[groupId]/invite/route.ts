import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { Group } from '../../../../../models/backend/group';
import { User } from '../../../../../models/backend/user';
import { Invitation } from '../../../../../models/backend/invitation';
import dbConnect from '../../../../../lib/mongodb';

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
}

async function checkRepositoryAccess(repo: string, username: string, token: string): Promise<boolean> {
  try
  {
    const collabResponse = await fetch(`https://api.github.com/repos/${repo}/collaborators/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (collabResponse.status === 204)
        return true;
    
    const commitsResponse = await fetch(`https://api.github.com/repos/${repo}/commits?author=${username}&per_page=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (commitsResponse.ok)
    {
      const commits = await commitsResponse.json();
      if (commits.length > 0)
        return true;
    }

    const [owner] = repo.split('/');
    const orgResponse = await fetch(`https://api.github.com/orgs/${owner}/members/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return orgResponse.status === 204;

  } catch (error)
  {
    console.error('Error checking repository access:', error);
    return false;
  }
}

export async function POST(request: NextRequest, { params }: { params: { groupId: string } })
{
  try
  {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const githubUsername = (session.user as SessionUser).githubUsername;
    
    if (!githubUsername)
      return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });

    const accessToken = (session as { accessToken?: string })?.accessToken;
    
    if (!accessToken)
      return NextResponse.json({ error: 'GitHub access token not found' }, { status: 400 });

    const { groupId } = params;
    const body = await request.json();
    const { invitedUsername } = body;

    if (!invitedUsername)
      return NextResponse.json({ error: 'Invited username is required' }, { status: 400 });

    await dbConnect();

    const group = await Group.findById(groupId);
    
    if (!group)
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    if (!group.people.includes(githubUsername))
      return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });

    if (group.people.includes(invitedUsername))
      return NextResponse.json({ error: 'User is already a member of this group' }, { status: 400 });

    const hasAccess = await checkRepositoryAccess(group.repo, invitedUsername, accessToken);
    
    if (!hasAccess)
      return NextResponse.json({ error: 'Invited user does not have access to this repository' }, { status: 400 });

    const existingInvitation = await Invitation.findOne({
      groupId: groupId,
      invitedUser: invitedUsername,
      status: 'pending'
    });

    if (existingInvitation)
      return NextResponse.json({ error: 'User already has a pending invitation to this group' }, { status: 400 });

    const newInvitation = new Invitation({
      groupId: groupId,
      invitedBy: githubUsername,
      invitedUser: invitedUsername,
      status: 'pending'
    });

    const savedInvitation = await newInvitation.save();

    await User.findOneAndUpdate(
      { githubUsername: invitedUsername },
      { 
        $addToSet: { pendingInvitations: savedInvitation._id },
        $setOnInsert: {
          id: invitedUsername,
          githubUsername: invitedUsername,
          groups: [],
          pendingInvitations: []
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      id: savedInvitation._id,
      groupId: savedInvitation.groupId,
      invitedBy: savedInvitation.invitedBy,
      invitedUser: savedInvitation.invitedUser,
      status: savedInvitation.status,
      createdAt: savedInvitation.createdAt,
      expiresAt: savedInvitation.expiresAt
    });

  } catch (error)
  {
    console.error('Error creating invitation:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
