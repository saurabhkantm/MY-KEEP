import express from 'express';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

router.post('/summarize', aiController.summarize);
router.post('/extract-checklist', aiController.extractChecklist);
router.post('/rewrite-tone', aiController.rewriteTone);
router.post('/auto-tags', aiController.autoTags);
router.post('/career-prep', aiController.careerPrep);
router.post('/ask-notes', aiController.askNotes);

export default router;
