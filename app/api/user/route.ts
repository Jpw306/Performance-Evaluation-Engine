import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/backend/user';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { githubUsername, name, photoIcon, clashRoyaleTag } = await request.json();
    
    if (!githubUsername || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ githubUsername });
    
    if (user) {
      user.name = name;
      user.photoIcon = photoIcon;
      // Only update clashRoyaleTag if it's provided in the request
      if (clashRoyaleTag !== undefined) {
        user.clashRoyaleTag = clashRoyaleTag;
      }
      await user.save();
    } else {
      // Create new user
      user = new User({
        id: githubUsername, // id is same as githubUsername
        githubUsername,
        name,
        photoIcon,
        clashRoyaleTag: clashRoyaleTag || '', // Default empty if not provided
        groups: [], // Initialize empty groups array
        pendingInvitations: [], // Initialize empty pending invitations array
      });
      await user.save();
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      photoIcon: user.photoIcon,
      githubUsername: user.githubUsername,
      clashRoyaleTag: user.clashRoyaleTag,
      groups: user.groups || [], // Include groups in response
      pendingInvitations: user.pendingInvitations || [], // Include pending invitations
    });
    
  } catch (error) {
    console.error('Error managing user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const githubUsername = searchParams.get('githubUsername');
    
    if (!githubUsername) {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ githubUsername });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      photoIcon: user.photoIcon,
      githubUsername: user.githubUsername,
      clashRoyaleTag: user.clashRoyaleTag,
      groups: user.groups || [], // Include groups in response
      pendingInvitations: user.pendingInvitations || [], // Include pending invitations
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}