import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/backend/user';
import { Group } from '@/models/backend/group';

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

  let groups = await Group.find({ people: { $in: [githubUsername] } }).catch(() => []);
  groups = groups.map(g => ({
    id: g._id,
    name: g.name,
    repositoryUrl: g.repo,
    numMembers: g.people.length,
    createdBy: g.createdBy,
    createdAt: g.createdAt
  }));

  user.groups = groups;
  
  await user.save();

  return NextResponse.json({
    name: user.name,
    avatarUrl: user.avatarUrl,
    githubUsername: user.githubUsername,
    clashRoyaleTag: user.clashRoyaleTag,
    groups: user.groups || [],
  });
};
