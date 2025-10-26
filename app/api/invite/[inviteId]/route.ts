import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { User } from '../../../../models/backend/user';
import { Invite } from '../../../../models/backend/invite';
import { Group } from '../../../../models/backend/group';
import dbConnect from '../../../../lib/mongodb';
import authOptions from '@/lib/auth';

interface SessionUser {
    githubUsername?: string;
    name?: string;
    email?: string;
    image?: string;
};

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ inviteId: string }> }
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

        const { inviteId } = await context.params; // Await params
        const invite = await Invite.findById(inviteId);
        
        if (!invite)
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

        if (invite.invitedGithubUsername !== githubUsername)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        await Invite.findByIdAndDelete(inviteId);
        
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
    context: { params: Promise<{ inviteId: string }> }
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

        const { inviteId } = await context.params; // Await params
        const invite = await Invite.findById(inviteId);
        
        if (!invite)
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

        if (invite.invitedGithubUsername !== githubUsername)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const invitedUser = await User.findOne({ githubUsername });
        
        if (!invitedUser)
            return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Ensure groups is an array of objects
        if (!invitedUser.groups || !Array.isArray(invitedUser.groups)) {
            invitedUser.groups = [];
        } else if (invitedUser.groups.length > 0 && typeof invitedUser.groups[0] === 'string') {
            // Migrate old string groups to objects if needed
            invitedUser.groups = [];
        }

        // Find the group in the database based on name and repo URL
        const group = await Group.findOne({
            name: invite.groupName,
            repositoryUrl: invite.githubRepoUrl
        });

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Add the user to the group's members
        if (!group.people)
            group.people = [];

        group.people.push(githubUsername);

        // Ensure proper structure for groups
        invitedUser.groups.push({
            id: group._id.toString(), // Convert ObjectId to string
            name: group.name,
            repositoryUrl: group.repositoryUrl,
            numMembers: group.people.length
        });

        // Mark groups as modified for Mongoose
        invitedUser.markModified('groups');

        // Save both documents
        await Promise.all([
            invitedUser.save(),
            group.save(),
            Invite.findByIdAndDelete(inviteId)
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