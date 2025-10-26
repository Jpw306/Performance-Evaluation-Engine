interface User {
  id: string;
  name: string;
  avatarUrl: string;
  githubUsername: string;
  clashRoyaleTag: string;
}

interface UserLogin {
  name: string;
  avatarUrl: string;
  githubUsername: string;
  clashRoyaleTag?: string;
  groups: [{
    id: string;
    name: string;
    repositoryUrl: string;
    numMembers: number;
  }]
}

export type { User, UserLogin };

