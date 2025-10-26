import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { User } from '../../../models/backend/user';
import { Invite } from '../../../models/backend/invite';
import dbConnect from '../../../lib/mongodb';

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
};

async function checkRepositoryAccess(githubRepoUrl: string, username: string, token: string): Promise<boolean> {
  try
  { 
    const url = new URL(githubRepoUrl);
    if (url.hostname !== 'github.com') 
      return false;
    
    let repoPath = url.pathname.slice(1);
    if (repoPath.endsWith('.git'))
      repoPath = repoPath.slice(0, -4);
    
    const collabResponse = await fetch(`https://api.github.com/repos/${repoPath}/collaborators/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (collabResponse.status === 204)
      return true;
    
    const commitsResponse = await fetch(`https://api.github.com/repos/${repoPath}/commits?author=${username}&per_page=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (commitsResponse.ok)
    {
      const commits = await commitsResponse.json();
      if (commits.length > 0)
        return true;
    }
    
    const [owner] = repoPath.split('/');
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

export async function POST(request: NextRequest)
{
  try
  {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const senderUser = session.user as SessionUser;

    if (!senderUser.githubUsername)
      return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });

    const accessToken = (session as { accessToken?: string })?.accessToken;
    
    if (!accessToken)
      return NextResponse.json({ error: 'GitHub access token not found' }, { status: 400 });

    const body = await request.json();
    console.log('Invite API received body:', body);
    
    const { githubUsername: invitedGithubUsername, githubUrl, groupName } = body;
    
    console.log('Extracted values:', {
      invitedGithubUsername,
      githubUrl,
      groupName
    });

    if (!invitedGithubUsername || !githubUrl || !groupName)
      return NextResponse.json({ error: 'GitHub username, repository URL, and group name are required' }, { status: 400 });

    await dbConnect();

    const invitedUser = await User.findOne({ githubUsername: invitedGithubUsername });
    
    if (!invitedUser)
      return NextResponse.json({ error: 'User not found in our system' }, { status: 404 });

    const hasAccess = await checkRepositoryAccess(githubUrl, invitedGithubUsername, accessToken);
    
    if (!hasAccess)
      return NextResponse.json({ error: 'Invited user does not have access to this repository' }, { status: 400 });

    const existingInvitation = await Invite.findOne({
      invitedGithubUsername,
      githubRepoUrl: githubUrl,
      groupName
    });

    if (existingInvitation)
      return NextResponse.json({ error: 'An invitation to this user for this repository already exists' }, { status: 400 });

    const newInvitation = new Invite({
      invitedGithubUsername,
      githubRepoUrl: githubUrl,
      groupName
    });

    await newInvitation.save();

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Error creating invitation:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET()
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

        await dbConnect();

        const currentDate = new Date();
        await Invite.deleteMany({ 
            invitedGithubUsername: githubUsername,
            expiresAt: { $lt: currentDate }
        });

        const invites = await Invite.find({ invitedGithubUsername: githubUsername })
            .sort({ createdAt: -1 })
            .lean();

        const formatted = invites.map((inv) => ({
            inviteId: String(inv._id),
            groupName: inv.groupName
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Error fetching invites:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}