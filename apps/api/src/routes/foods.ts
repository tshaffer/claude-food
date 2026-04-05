import { Router, type IRouter } from 'express';
import { FoodModel } from '../models/Food.js';
import { LogEntryModel } from '../models/LogEntry.js';
import { TemplateItemModel } from '../models/TemplateItem.js';
import type { CreateFoodRequest, UpdateFoodRequest } from '@claude-food/domain';

const router: IRouter = Router();

// GET /api/foods
router.get('/', async (_req, res) => {
  const foods = await FoodModel.find().sort({ name: 1 }).lean();
  res.json(foods.map(f => ({
    id: f._id, name: f.name,
    unitQuantity: f.unitQuantity, unitType: f.unitType,
    caloriesPerUnit: f.caloriesPerUnit, proteinPerUnit: f.proteinPerUnit,
    fiberPerUnit: f.fiberPerUnit,
  })));
});

// POST /api/foods
router.post('/', async (req, res) => {
  const body = req.body as CreateFoodRequest;
  const food = await FoodModel.create(body);
  res.status(201).json({ id: food._id, ...body });
});

// PUT /api/foods/:id
router.put('/:id', async (req, res) => {
  const body = req.body as UpdateFoodRequest;
  const food = await FoodModel.findByIdAndUpdate(req.params.id, body, { new: true }).lean();
  if (!food) { res.status(404).json({ error: 'Food not found' }); return; }
  res.json({ id: food._id, name: food.name,
    unitQuantity: food.unitQuantity, unitType: food.unitType,
    caloriesPerUnit: food.caloriesPerUnit, proteinPerUnit: food.proteinPerUnit,
    fiberPerUnit: food.fiberPerUnit });
});

// DELETE /api/foods/:id
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const inLog = await LogEntryModel.exists({ foodId: id });
  if (inLog) {
    res.status(409).json({ error: 'Food is referenced by log entries and cannot be deleted' });
    return;
  }
  const inTemplate = await TemplateItemModel.exists({ foodId: id });
  if (inTemplate) {
    res.status(409).json({ error: 'Food is referenced by templates and cannot be deleted' });
    return;
  }
  await FoodModel.findByIdAndDelete(id);
  res.status(204).end();
});

export default router;
