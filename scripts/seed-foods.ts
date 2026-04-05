// Run with: npx tsx scripts/seed-foods.ts
// Requires the API server to be running on localhost:3001

const API = 'http://localhost:3001/api/foods';

const foods = [
  // Proteins
  { name: 'Chicken Breast',                unitQuantity: 100,  unitType: 'grams',       caloriesPerUnit: 165,   proteinPerUnit: 31,   fiberPerUnit: 0    },
  { name: 'Thighs',                         unitQuantity: 112,  unitType: 'grams',       caloriesPerUnit: 160,   proteinPerUnit: 22,   fiberPerUnit: 0    },
  { name: 'Ground Turkey',                  unitQuantity: 112,  unitType: 'grams',       caloriesPerUnit: 150,   proteinPerUnit: 19,   fiberPerUnit: 0    },
  { name: 'Trout',                          unitQuantity: 100,  unitType: 'grams',       caloriesPerUnit: 179,   proteinPerUnit: 20,   fiberPerUnit: 0    },
  { name: 'Skirt Steak',                    unitQuantity: 85,   unitType: 'grams',       caloriesPerUnit: 202,   proteinPerUnit: 21,   fiberPerUnit: 0    },
  { name: 'Deli Turkey',                    unitQuantity: 49,   unitType: 'grams',       caloriesPerUnit: 45,    proteinPerUnit: 10,   fiberPerUnit: 0    },
  { name: 'Shrimp',                         unitQuantity: 113,  unitType: 'grams',       caloriesPerUnit: 90,    proteinPerUnit: 17,   fiberPerUnit: 0    },

  // Dairy / Milk
  { name: 'Whole Milk',                     unitQuantity: 240,  unitType: 'milliliters', caloriesPerUnit: 170,   proteinPerUnit: 8,    fiberPerUnit: 0    },
  { name: '1% Milk',                        unitQuantity: 240,  unitType: 'milliliters', caloriesPerUnit: 120,   proteinPerUnit: 10,   fiberPerUnit: 0    },
  { name: 'Cottage Cheese',                 unitQuantity: 115,  unitType: 'grams',       caloriesPerUnit: 90,    proteinPerUnit: 10,   fiberPerUnit: 0    },
  { name: 'Sown',                           unitQuantity: 15,   unitType: 'milliliters', caloriesPerUnit: 20,    proteinPerUnit: 0,    fiberPerUnit: 0    },
  { name: 'Elmhurst Oat Milk',              unitQuantity: 240,  unitType: 'milliliters', caloriesPerUnit: 100,   proteinPerUnit: 3,    fiberPerUnit: 3    },
  { name: 'Whole Milk Latte',               unitQuantity: 100,  unitType: 'milliliters', caloriesPerUnit: 70.83, proteinPerUnit: 3.33, fiberPerUnit: 0    },
  { name: '1% Milk Latte',                  unitQuantity: 100,  unitType: 'milliliters', caloriesPerUnit: 50,    proteinPerUnit: 4.17, fiberPerUnit: 0    },
  { name: 'Califia',                        unitQuantity: 240,  unitType: 'milliliters', caloriesPerUnit: 130,   proteinPerUnit: 2,    fiberPerUnit: 0    },
  { name: 'Egg',                            unitQuantity: 1,    unitType: 'piece',       caloriesPerUnit: 72,    proteinPerUnit: 6,    fiberPerUnit: 0    },
  { name: 'Egg Whites',                     unitQuantity: 46,   unitType: 'grams',       caloriesPerUnit: 25,    proteinPerUnit: 5,    fiberPerUnit: 0    },
  { name: 'Fage 2% Greek Yogurt',           unitQuantity: 170,  unitType: 'grams',       caloriesPerUnit: 120,   proteinPerUnit: 17,   fiberPerUnit: 0    },
  { name: 'Fage 0% Greek Yogurt',           unitQuantity: 170,  unitType: 'grams',       caloriesPerUnit: 90,    proteinPerUnit: 18,   fiberPerUnit: 0    },
  { name: 'Chobani Zero Sugar Greek Yogurt',unitQuantity: 150,  unitType: 'grams',       caloriesPerUnit: 60,    proteinPerUnit: 12,   fiberPerUnit: 0    },
  { name: 'Goat Cheese',                    unitQuantity: 28,   unitType: 'grams',       caloriesPerUnit: 80,    proteinPerUnit: 5,    fiberPerUnit: 0    },
  { name: 'Mexican Shredded Cheese',        unitQuantity: 28,   unitType: 'grams',       caloriesPerUnit: 110,   proteinPerUnit: 6,    fiberPerUnit: 0    },
  { name: 'Dill Havarti Cheese',            unitQuantity: 28,   unitType: 'grams',       caloriesPerUnit: 110,   proteinPerUnit: 6,    fiberPerUnit: 0    },

  // Produce
  { name: 'Broccoli',                       unitQuantity: 100,  unitType: 'grams',       caloriesPerUnit: 38.5,  proteinPerUnit: 2.54, fiberPerUnit: 2.43 },
  { name: 'Spinach',                        unitQuantity: 100,  unitType: 'grams',       caloriesPerUnit: 23.3,  proteinPerUnit: 3,    fiberPerUnit: 2.33 },
  { name: 'Apple',                          unitQuantity: 200,  unitType: 'grams',       caloriesPerUnit: 104,   proteinPerUnit: 0,    fiberPerUnit: 5    },
  { name: 'Kiwi',                           unitQuantity: 75,   unitType: 'grams',       caloriesPerUnit: 44,    proteinPerUnit: 0.8,  fiberPerUnit: 2    },
  { name: 'Orange',                         unitQuantity: 140,  unitType: 'grams',       caloriesPerUnit: 66,    proteinPerUnit: 1.3,  fiberPerUnit: 2.8  },
  { name: 'Blackberries',                   unitQuantity: 144,  unitType: 'grams',       caloriesPerUnit: 62,    proteinPerUnit: 2,    fiberPerUnit: 8    },
  { name: 'Blueberries',                    unitQuantity: 100,  unitType: 'grams',       caloriesPerUnit: 57,    proteinPerUnit: 0.74, fiberPerUnit: 2.4  },
  { name: 'Strawberries',                   unitQuantity: 100,  unitType: 'grams',       caloriesPerUnit: 32,    proteinPerUnit: 0.7,  fiberPerUnit: 2    },
  { name: 'Avocado',                        unitQuantity: 50,   unitType: 'grams',       caloriesPerUnit: 80,    proteinPerUnit: 1,    fiberPerUnit: 3    },
  { name: 'Carrots',                        unitQuantity: 100,  unitType: 'grams',       caloriesPerUnit: 41,    proteinPerUnit: 0.9,  fiberPerUnit: 2.8  },
  { name: 'Caesar Dressing',                unitQuantity: 31,   unitType: 'grams',       caloriesPerUnit: 80,    proteinPerUnit: 0,    fiberPerUnit: 0    },
  { name: 'Salsa',                          unitQuantity: 30,   unitType: 'grams',       caloriesPerUnit: 5,     proteinPerUnit: 0,    fiberPerUnit: 0    },
  { name: 'Olive Oil',                      unitQuantity: 14,   unitType: 'grams',       caloriesPerUnit: 130,   proteinPerUnit: 0,    fiberPerUnit: 0    },
  { name: 'Buitoni/Homemade Pesto',         unitQuantity: 62,   unitType: 'grams',       caloriesPerUnit: 300,   proteinPerUnit: 7,    fiberPerUnit: 0    },

  // Beans & Grains
  { name: 'Black Beans',                    unitQuantity: 130,  unitType: 'grams',       caloriesPerUnit: 110,   proteinPerUnit: 7,    fiberPerUnit: 9    },
  { name: 'Garbanzo Beans',                 unitQuantity: 130,  unitType: 'grams',       caloriesPerUnit: 120,   proteinPerUnit: 6,    fiberPerUnit: 6    },
  { name: "Hummus (Trader Joe's)",          unitQuantity: 28,   unitType: 'grams',       caloriesPerUnit: 70,    proteinPerUnit: 2,    fiberPerUnit: 1    },
  { name: 'Quinoa',                         unitQuantity: 45,   unitType: 'grams',       caloriesPerUnit: 170,   proteinPerUnit: 6,    fiberPerUnit: 3    },
  { name: 'Farro',                          unitQuantity: 52,   unitType: 'grams',       caloriesPerUnit: 190,   proteinPerUnit: 6,    fiberPerUnit: 5    },
  { name: 'Lentils',                        unitQuantity: 100,  unitType: 'grams',       caloriesPerUnit: 120,   proteinPerUnit: 10,   fiberPerUnit: 6    },
  { name: 'Heritage Flakes',                unitQuantity: 40,   unitType: 'grams',       caloriesPerUnit: 160,   proteinPerUnit: 5,    fiberPerUnit: 7    },
  { name: 'Shredded Wheat',                 unitQuantity: 61,   unitType: 'grams',       caloriesPerUnit: 230,   proteinPerUnit: 6,    fiberPerUnit: 6    },

  // Snacks & Nuts
  { name: 'Almonds',                        unitQuantity: 30,   unitType: 'grams',       caloriesPerUnit: 170,   proteinPerUnit: 6,    fiberPerUnit: 4    },
  { name: 'Cashews',                        unitQuantity: 30,   unitType: 'grams',       caloriesPerUnit: 170,   proteinPerUnit: 5,    fiberPerUnit: 0    },
  { name: 'Pecans',                         unitQuantity: 31,   unitType: 'grams',       caloriesPerUnit: 210,   proteinPerUnit: 3,    fiberPerUnit: 3    },
  { name: "Mary's Gone Crackers - Jalapeno",unitQuantity: 30,   unitType: 'grams',       caloriesPerUnit: 150,   proteinPerUnit: 5,    fiberPerUnit: 3    },
  { name: 'Chips',                          unitQuantity: 28,   unitType: 'grams',       caloriesPerUnit: 140,   proteinPerUnit: 2,    fiberPerUnit: 3    },
  { name: 'Clif Bar',                       unitQuantity: 68,   unitType: 'grams',       caloriesPerUnit: 250,   proteinPerUnit: 10,   fiberPerUnit: 5    },

  // Bread
  { name: 'Sourdough Bread',                unitQuantity: 100,  unitType: 'grams',       caloriesPerUnit: 230,   proteinPerUnit: 7.5,  fiberPerUnit: 1.2  },

  // Misc
  { name: 'Monin Vanilla Syrup',            unitQuantity: 30,   unitType: 'milliliters', caloriesPerUnit: 100,   proteinPerUnit: 0,    fiberPerUnit: 0    },
  { name: 'Fever Tree Ginger Beer',         unitQuantity: 1,    unitType: 'bottle',      caloriesPerUnit: 35,    proteinPerUnit: 0,    fiberPerUnit: 0    },
  { name: 'Almond Cake',                    unitQuantity: 1,    unitType: 'cake',        caloriesPerUnit: 3300,  proteinPerUnit: 15,   fiberPerUnit: 0    },
];

async function main() {
  let added = 0;
  let skipped = 0;

  for (const food of foods) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(food),
    });
    if (res.ok) {
      console.log(`  + ${food.name}`);
      added++;
    } else {
      const err = await res.json().catch(() => ({}));
      console.warn(`  ! ${food.name}: ${res.status} ${JSON.stringify(err)}`);
      skipped++;
    }
  }

  console.log(`\nDone: ${added} added, ${skipped} failed`);
}

main();
