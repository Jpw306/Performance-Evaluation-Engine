import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { Group } from '../../../../models/backend/group';
import dbConnect from '../../../../lib/mongodb';

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
};

export async function GET(request: NextRequest, { params }: { params: { groupId: string } })
{
  try
  {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const githubUsername = (session.user as SessionUser).githubUsername;
    
    if (!githubUsername)
      return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });

    const { groupId } = params;

    if (!groupId)
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });

    await dbConnect();

    const group = await Group.findById(groupId);

    if (!group)
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    if (!group.people.includes(githubUsername))
      return NextResponse.json({ error: 'Access denied. You are not a member of this group.' }, { status: 403 });

    return NextResponse.json({
      id: group._id,
      name: group.name,
      people: group.people,
      repositoryUrl: group.repositoryUrl,
      createdBy: group.createdBy,
      createdAt: group.createdAt
    });

  } catch (error)
  {
    console.error('Error fetching group:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}