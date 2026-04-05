import mongoose, { Schema, Document } from 'mongoose';

export interface TemplateDoc extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
}

const TemplateSchema = new Schema<TemplateDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name:   { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

TemplateSchema.index({ userId: 1 });

export const TemplateModel = mongoose.model<TemplateDoc>('Template', TemplateSchema);
