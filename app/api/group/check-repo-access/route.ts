import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const checkRepositoryAccess = async (repo: string, username: string, token: string): Promise<boolean> => {
  
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
};

export async function POST(request: NextRequest)
{
  try
  {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const accessToken = (session as { accessToken?: string })?.accessToken;
    
    if (!accessToken)
      return NextResponse.json({ error: 'GitHub access token not found' }, { status: 400 });

    const body = await request.json();
    const { repo, username } = body;

    if (!repo || !username)
      return NextResponse.json({ error: 'Repository and username are required' }, { status: 400 });

    const hasAccess = await checkRepositoryAccess(repo, username, accessToken);

    return NextResponse.json({ hasAccess });
  } catch (error)
  {
    console.error('Error checking repository access:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
