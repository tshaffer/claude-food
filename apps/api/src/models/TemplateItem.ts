import mongoose, { Schema, Document } from 'mongoose';

export interface TemplateItemDoc extends Document {
  templateId: mongoose.Types.ObjectId;
  lineNumber: number;
  foodId: mongoose.Types.ObjectId;
  defaultAmount: number;
}

const TemplateItemSchema = new Schema<TemplateItemDoc>(
  {
    templateId:    { type: Schema.Types.ObjectId, ref: 'Template', required: true },
    lineNumber:    { type: Number, required: true },
    foodId:        { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    defaultAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

TemplateItemSchema.index({ templateId: 1, lineNumber: 1 });

export const TemplateItemModel = mongoose.model<TemplateItemDoc>('TemplateItem', TemplateItemSchema);
