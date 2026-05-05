// Patches existing Food documents with saturatedFatPerUnit and addedSugarPerUnit.
// Run with: MONGODB_URI=mongodb://localhost:27017/claude-food npx tsx scripts/migrate-add-fat-sugar.ts
// Safe to re-run — uses updateOne with $set so it won't overwrite other fields.

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/claude-food';

// Values are per the unitQuantity on each food document.
// Foods marked "verify" have uncertain values — confirm against the actual product label.
const updates: Record<string, { saturatedFatPerUnit: number; addedSugarPerUnit: number }> = {
  // Proteins
  'Chicken Breast':                { saturatedFatPerUnit: 0.7,  addedSugarPerUnit: 0   },
  'Chicken Thighs':                { saturatedFatPerUnit: 2.8,  addedSugarPerUnit: 0   },
  'Ground Turkey':                 { saturatedFatPerUnit: 2,    addedSugarPerUnit: 0   },
  'Trout':                         { saturatedFatPerUnit: 1.1,  addedSugarPerUnit: 0   },
  'Skirt Steak':                   { saturatedFatPerUnit: 5,    addedSugarPerUnit: 0   },
  'Deli Turkey':                   { saturatedFatPerUnit: 0.2,  addedSugarPerUnit: 0   },
  'Shrimp':                        { saturatedFatPerUnit: 0.2,  addedSugarPerUnit: 0   },

  // Dairy / Milk
  'Whole Milk':                    { saturatedFatPerUnit: 5,    addedSugarPerUnit: 0   },
  '1% Milk':                       { saturatedFatPerUnit: 1.5,  addedSugarPerUnit: 0   },
  'Cottage Cheese':                { saturatedFatPerUnit: 1.5,  addedSugarPerUnit: 0   },
  'Sown':                          { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   }, // verify — unknown product
  'Elmhurst Oat Milk':             { saturatedFatPerUnit: 0,    addedSugarPerUnit: 4   },
  'Whole Milk Latte':              { saturatedFatPerUnit: 1.4,  addedSugarPerUnit: 0   },
  '1% Milk Latte':                 { saturatedFatPerUnit: 0.5,  addedSugarPerUnit: 0   },
  'Califia':                       { saturatedFatPerUnit: 0,    addedSugarPerUnit: 5   }, // verify — assumed Califia Farms Oat Milk Barista Blend
  'Egg':                           { saturatedFatPerUnit: 1.6,  addedSugarPerUnit: 0   },
  'Egg Whites':                    { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Fage 2% Greek Yogurt':          { saturatedFatPerUnit: 2.5,  addedSugarPerUnit: 0   },
  'Fage 0% Greek Yogurt':          { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Chobani Zero Sugar Greek Yogurt': { saturatedFatPerUnit: 0,  addedSugarPerUnit: 0   },
  'Goat Cheese':                   { saturatedFatPerUnit: 3.5,  addedSugarPerUnit: 0   },
  'Mexican Shredded Cheese':       { saturatedFatPerUnit: 4.5,  addedSugarPerUnit: 0   },
  'Dill Havarti Cheese':           { saturatedFatPerUnit: 5,    addedSugarPerUnit: 0   },

  // Produce
  'Broccoli':                      { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Spinach':                       { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Apple':                         { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Kiwi':                          { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Orange':                        { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Blackberries':                  { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Blueberries':                   { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Strawberries':                  { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Avocado':                       { saturatedFatPerUnit: 0.5,  addedSugarPerUnit: 0   },
  'Carrots':                       { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Caesar Dressing':               { saturatedFatPerUnit: 1.5,  addedSugarPerUnit: 0   },
  'Salsa':                         { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Olive Oil':                     { saturatedFatPerUnit: 2,    addedSugarPerUnit: 0   },
  'Buitoni/Homemade Pesto':        { saturatedFatPerUnit: 4,    addedSugarPerUnit: 0   },

  // Beans & Grains
  'Black Beans':                   { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Garbanzo Beans':                { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  "Hummus (Trader Joe's)":         { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Quinoa':                        { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Farro':                         { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Lentils':                       { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Heritage Flakes':               { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },
  'Shredded Wheat':                { saturatedFatPerUnit: 0,    addedSugarPerUnit: 0   },

  // Snacks & Nuts
  'Almonds':                       { saturatedFatPerUnit: 1,    addedSugarPerUnit: 0   },
  'Cashews':                       { saturatedFatPerUnit: 2.5,  addedSugarPerUnit: 0   },
  'Pecans':                        { saturatedFatPerUnit: 2,    addedSugarPerUnit: 0   },
  "Mary's Gone Crackers - Jalapeno": { saturatedFatPerUnit: 0.5, addedSugarPerUnit: 0  },
  'Chips':                         { saturatedFatPerUnit: 1.5,  addedSugarPerUnit: 0   },
  'Clif Bar':                      { saturatedFatPerUnit: 1.5,  addedSugarPerUnit: 17  },

  // Bread
  'Sourdough Bread':               { saturatedFatPerUnit: 0.5,  addedSugarPerUnit: 1   },

  // Misc
  'Monin Vanilla Syrup':           { saturatedFatPerUnit: 0,    addedSugarPerUnit: 25  },
  'Fever Tree Ginger Beer':        { saturatedFatPerUnit: 0,    addedSugarPerUnit: 14  },
  'Almond Cake':                   { saturatedFatPerUnit: 20,   addedSugarPerUnit: 200 }, // whole-cake estimate — verify
};

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const collection = mongoose.connection.db!.collection('foods');

  let updated = 0;
  let notFound = 0;

  for (const [name, values] of Object.entries(updates)) {
    const result = await collection.updateOne(
      { name },
      { $set: values }
    );
    if (result.matchedCount === 0) {
      console.warn(`  ! not found: "${name}"`);
      notFound++;
    } else {
      console.log(`  ✓ ${name}`);
      updated++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${notFound} not found in DB`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
