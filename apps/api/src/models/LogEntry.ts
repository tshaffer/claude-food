import mongoose, { Schema, Document } from 'mongoose';

export interface LogEntryDoc extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  meal: string;
  templateId?: mongoose.Types.ObjectId | null;
  templateNameSnapshot?: string | null;
  foodId: mongoose.Types.ObjectId;
  actualAmount: number;
}

const LogEntrySchema = new Schema<LogEntryDoc>(
  {
    userId:               { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date:                 { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    meal:                 { type: String, required: true, trim: true },
    templateId:           { type: Schema.Types.ObjectId, ref: 'Template', default: null },
    templateNameSnapshot: { type: String, default: null },
    foodId:               { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    actualAmount:         { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

LogEntrySchema.index({ userId: 1, date: 1 });

export const LogEntryModel = mongoose.model<LogEntryDoc>('LogEntry', LogEntrySchema);
