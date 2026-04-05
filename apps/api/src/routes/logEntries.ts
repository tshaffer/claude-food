import { Router, type IRouter } from 'express';
import { LogEntryModel } from '../models/LogEntry.js';
import { FoodModel } from '../models/Food.js';
import { TemplateModel } from '../models/Template.js';
import { TemplateItemModel } from '../models/TemplateItem.js';
import { calcNutrition } from '@claude-food/domain';
import type { CreateLogEntryRequest, UpdateLogEntryRequest, AddFromTemplateRequest } from '@claude-food/domain';

const router: IRouter = Router();

function serializeEntry(e: any) {
  return {
    id: e._id, userId: e.userId, date: e.date, meal: e.meal,
    templateId: e.templateId ?? null,
    templateNameSnapshot: e.templateNameSnapshot ?? null,
    foodId: e.foodId, actualAmount: e.actualAmount,
    createdAt: e.createdAt, updatedAt: e.updatedAt,
  };
}

// GET /api/users/:userId/log-entries?startDate=&endDate=
router.get('/users/:userId/log-entries', async (req, res) => {
  const { startDate, endDate } = req.query as Record<string, string>;
  const filter: Record<string, any> = { userId: req.params.userId };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = startDate;
    if (endDate)   filter.date.$lte = endDate;
  }
  const entries = await LogEntryModel.find(filter).sort({ date: -1, createdAt: 1 }).lean();
  res.json(entries.map(serializeEntry));
});

// POST /api/users/:userId/log-entries
router.post('/users/:userId/log-entries', async (req, res) => {
  const body = req.body as CreateLogEntryRequest;
  const entry = await LogEntryModel.create({ ...body, userId: req.params.userId });
  res.status(201).json(serializeEntry(entry));
});

// POST /api/users/:userId/log-entries/from-template
router.post('/users/:userId/log-entries/from-template', async (req, res) => {
  const { date, meal, templateId, multiplier } = req.body as AddFromTemplateRequest;

  const template = await TemplateModel.findById(templateId).lean();
  if (!template) { res.status(404).json({ error: 'Template not found' }); return; }

  const items = await TemplateItemModel.find({ templateId }).sort({ lineNumber: 1 }).lean();
  if (!items.length) { res.status(400).json({ error: 'Template has no items' }); return; }

  const created = await LogEntryModel.insertMany(
    items.map(item => ({
      userId: req.params.userId,
      date,
      meal,
      templateId,
      templateNameSnapshot: template.name,
      foodId: item.foodId,
      actualAmount: item.defaultAmount * multiplier,
    }))
  );
  res.status(201).json(created.map(serializeEntry));
});

// PUT /api/log-entries/:id
router.put('/log-entries/:id', async (req, res) => {
  const body = req.body as UpdateLogEntryRequest;
  const entry = await LogEntryModel.findByIdAndUpdate(req.params.id, body, { new: true }).lean();
  if (!entry) { res.status(404).json({ error: 'Log entry not found' }); return; }
  res.json(serializeEntry(entry));
});

// DELETE /api/log-entries/:id
router.delete('/log-entries/:id', async (req, res) => {
  await LogEntryModel.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
