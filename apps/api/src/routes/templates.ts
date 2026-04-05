import { Router, type IRouter } from 'express';
import { TemplateModel } from '../models/Template.js';
import { TemplateItemModel } from '../models/TemplateItem.js';
import type { CreateTemplateRequest, CreateTemplateItemRequest } from '@claude-food/domain';

const router: IRouter = Router();

// GET /api/users/:userId/templates  (with items populated)
router.get('/users/:userId/templates', async (req, res) => {
  const templates = await TemplateModel.find({ userId: req.params.userId }).sort({ name: 1 }).lean();
  const ids = templates.map(t => t._id);
  const items = await TemplateItemModel.find({ templateId: { $in: ids } })
    .sort({ templateId: 1, lineNumber: 1 }).lean();

  const result = templates.map(t => ({
    id: t._id,
    userId: t.userId,
    name: t.name,
    items: items
      .filter(i => String(i.templateId) === String(t._id))
      .map(i => ({
        id: i._id,
        templateId: i.templateId,
        lineNumber: i.lineNumber,
        foodId: i.foodId,
        defaultAmount: i.defaultAmount,
      })),
  }));
  res.json(result);
});

// POST /api/users/:userId/templates
router.post('/users/:userId/templates', async (req, res) => {
  const { name } = req.body as CreateTemplateRequest;
  const template = await TemplateModel.create({ userId: req.params.userId, name });
  res.status(201).json({ id: template._id, userId: template.userId, name: template.name, items: [] });
});

// PUT /api/templates/:id  — rename + replace items atomically
router.put('/templates/:id', async (req, res) => {
  const { name, items } = req.body as { name: string; items: CreateTemplateItemRequest[] };
  const template = await TemplateModel.findByIdAndUpdate(req.params.id, { name }, { new: true }).lean();
  if (!template) { res.status(404).json({ error: 'Template not found' }); return; }

  await TemplateItemModel.deleteMany({ templateId: req.params.id });
  const created = items.length
    ? await TemplateItemModel.insertMany(
        items.map((it, idx) => ({
          templateId: req.params.id,
          lineNumber: idx + 1,
          foodId: it.foodId,
          defaultAmount: it.defaultAmount,
        }))
      )
    : [];

  res.json({
    id: template._id,
    name: template.name,
    items: created.map(i => ({
      id: i._id, templateId: i.templateId,
      lineNumber: i.lineNumber, foodId: i.foodId, defaultAmount: i.defaultAmount,
    })),
  });
});

// DELETE /api/templates/:id
router.delete('/templates/:id', async (req, res) => {
  await TemplateItemModel.deleteMany({ templateId: req.params.id });
  await TemplateModel.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
