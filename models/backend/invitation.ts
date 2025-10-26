import { Schema, model, models } from 'mongoose';

const InvitationSchema = new Schema({
  groupId: { type: String, required: true },
  invitedBy: { type: String, required: true }, // GitHub username
  invitedUser: { type: String, required: true }, // GitHub username
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
});

export const Invitation = models.Invitation || model('Invitation', InvitationSchema);