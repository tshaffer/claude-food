import mongoose, { Schema, Document } from 'mongoose';

export interface UserDoc extends Document {
  name: string;
}

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDoc>('User', UserSchema);
