import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { inviteId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user)
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const user = session.user as SessionUser;
        const githubUsername = user.githubUsername;
        
        if (!githubUsername)
            return NextResponse.json({ error: 'GitHub username not found' }, { status: 400 });

        await dbConnect();

        const invite = await Invite.findById(params.inviteId);
        
        if (!invite)
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

        if (invite.invitedGithubUsername !== githubUsername)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        await Invite.findByIdAndDelete(params.inviteId);
        
        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('Error declining invite:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { inviteId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user)
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const user = session.user as SessionUser;
        const githubUsername = user.githubUsername;
        
        if (!githubUsername)
            return NextResponse.json({ error: 'GitHub username not found' }, { status: 400 });

        await dbConnect();

        const invite = await Invite.findById(params.inviteId);
        
        if (!invite)
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

        if (invite.invitedGithubUsername !== githubUsername)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // Accept the invite logic here
        const invitedUser = await User.findOne({ githubUsername });
        
        if (!invitedUser)
            return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Add user to the group
        if (!invitedUser.groups) invitedUser.groups = [];

        // Find the group in the database based on name and repo URL
        const group = await Group.findOne({
            name: invite.groupName,
            repositoryUrl: invite.githubRepoUrl
        });

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Add the user to the group's members
        if (!group.members) group.members = [];
        group.members.push({
            githubUsername,
            avatarUrl: user.image || '',
            name: user.name || ''
        });

        // Add the group reference to the user's groups
        invitedUser.groups.push({
            id: group._id,
            name: group.name,
            repositoryUrl: group.repositoryUrl,
            numMembers: group.members.length
        });

        // Save both documents
        await Promise.all([
            invitedUser.save(),
            group.save(),
            Invite.findByIdAndDelete(params.inviteId)
        ]);

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('Error accepting invite:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}