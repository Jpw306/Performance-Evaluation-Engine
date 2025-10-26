/* eslint-disable @typescript-eslint/no-explicit-any */
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

  // console.log('Database connection state:', mongoose.connection.readyState);
  // console.log('Connected to database:', mongoose.connection.db?.databaseName);
  
  console.log('About to query groups...');
  console.log('Group model:', Group);
  console.log('Group collection name:', Group.collection.name);
  
  let groups: any[] = await Group.find({}).lean();
  console.log('All groups in database:', groups);
  console.log('Number of groups found:', groups.length);
  
  // Let's also try a count to see if there's a difference
  const groupCount = await Group.countDocuments({});
  console.log('Group count from countDocuments:', groupCount);
  
  groups = groups.filter(g => g.people.includes(githubUsername));
  console.log('Filtered groups for user:', githubUsername, groups);

  const formattedGroups = groups.map(g => ({
    id: g._id,
    name: g.name,
    repositoryUrl: g.repositoryUrl,
    numMembers: g.people.length,
    createdBy: g.createdBy,
    createdAt: g.createdAt
  }));

  user.groups = groups.map(g => g._id.toString());
  
  await user.save();

  return NextResponse.json({
    name: user.name,
    avatarUrl: user.avatarUrl,
    githubUsername: user.githubUsername,
    clashRoyaleTag: user.clashRoyaleTag,
    groups: formattedGroups,
  });
};
