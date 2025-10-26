import { Schema , model, models } from 'mongoose';

// Delete existing model to force recompilation
delete models.User;

const UserSchema = new Schema({
    id: String,
    name: String,
    avatarUrl: String,
    githubUsername: String,
    clashRoyaleTag: String,
    groups: Schema.Types.Mixed, // Use Mixed to allow arrays of objects
});

export const User = models.User || model('User', UserSchema);
