import mongoose, { Schema , model, models } from 'mongoose';

const UserSchema = new Schema({
    id: String,             // global user id
    name: String,           // user's real name
    photoIcon: String,      // link to user's github icon
    githubId: String,      // user's github username 
    clashRoyaleTag: String // user's clash royal tag (#CRTAG)
});

export const User = models.User || model('User', UserSchema);