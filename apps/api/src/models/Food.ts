import mongoose, { Schema, Document } from 'mongoose';

export interface FoodDoc extends Document {
  name: string;
  unitQuantity: number;
  unitType: string;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  fiberPerUnit: number;
}

const FoodSchema = new Schema<FoodDoc>(
  {
    name:            { type: String, required: true, trim: true },
    unitQuantity:    { type: Number, required: true, min: 0 },
    unitType:        { type: String, required: true, trim: true },
    caloriesPerUnit: { type: Number, required: true, min: 0 },
    proteinPerUnit:  { type: Number, required: true, min: 0 },
    fiberPerUnit:    { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

FoodSchema.index({ name: 1 });

export const FoodModel = mongoose.model<FoodDoc>('Food', FoodSchema);
