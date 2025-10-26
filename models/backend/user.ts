import { Schema , model, models } from 'mongoose';

const UserSchema = new Schema({
    id: String,
    name: String,
    photoIcon: String,
    githubUsername: String,
    clashRoyaleTag: String,
});

export const User = models.User || model('User', UserSchema);
