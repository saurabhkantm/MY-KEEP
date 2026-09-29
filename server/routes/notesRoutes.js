import express from 'express';
import * as notesController from '../controllers/notesController.js';

const router = express.Router();

router.get('/', notesController.getNotes);
router.post('/', notesController.createNote);
router.post('/empty-trash', notesController.emptyTrash);

router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);
router.delete('/:id/permanent', notesController.permanentDeleteNote);
router.post('/:id/restore', notesController.restoreNote);
router.post('/:id/duplicate', notesController.duplicateNote);

export default router;
