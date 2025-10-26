import { Schema, model, models } from 'mongoose';

const InviteSchema = new Schema({
  githubRepoUrl: { type: String, required: true },
  groupName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
});

export const Invite = models.Invite || model('Invite', InviteSchema);