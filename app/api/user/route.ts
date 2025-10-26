import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/backend/user';

export async function POST(request: NextRequest)
{
  const { githubUsername, name, avatarUrl, clashRoyaleTag } = await request.json();

  const dbError = await dbConnect()
    .then(() => null)
    .catch(() => true);

  if(dbError)
    return NextResponse.json({ error: 'Database connection error' }, { status: 500 });

  const user = await User.findOne({ githubUsername })
    .catch(() => null);

  if(!user)
  {
    const newUser = new User({
      id: githubUsername,
      githubUsername,
      name: name || '',
      avatarUrl: avatarUrl || '',
      clashRoyaleTag: clashRoyaleTag || '',
      groups: [],
      pendingInvitations: [],
    });
    
    await newUser.save();

    return NextResponse.json({
      name: newUser.name,
      avatarUrl: newUser.avatarUrl,
      githubUsername: newUser.githubUsername,
      clashRoyaleTag: newUser.clashRoyaleTag,
      groups: [],
    });
  }

  user.clashRoyaleTag = clashRoyaleTag || user.clashRoyaleTag;
  user.avatarUrl = avatarUrl || user.avatarUrl;
  user.name = name || user.name;
  
  await user.save();

  return NextResponse.json({
    name: user.name,
    avatarUrl: user.avatarUrl,
    githubUsername: user.githubUsername,
    clashRoyaleTag: user.clashRoyaleTag,
    groups: user.groups || [],
  });
};
