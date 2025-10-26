import { Schema, model, models } from 'mongoose';

const GroupSchema = new Schema({
  people: [String],
  repositoryUrl: String,
  createdBy: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Group = models.Group || model('Group', GroupSchema);