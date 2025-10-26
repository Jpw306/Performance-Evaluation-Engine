import { Schema , model, models } from 'mongoose';

const UserSchema = new Schema({
    id: String,
    name: String,
    avatarUrl: String,
    githubUsername: String,
    clashRoyaleTag: String,
    groups: [String],
});

export const User = models.User || model('User', UserSchema);
