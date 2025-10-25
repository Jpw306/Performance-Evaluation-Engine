interface User {
  id: string,             // global user id
  name: string;           // user's real name
  photoIcon: string;      // link to user's github icon
  githubId: string;       // user's github username 
  clashRoyaleTag: string; // user's clash royal tag (#CRTAG)
}

export type { User };
