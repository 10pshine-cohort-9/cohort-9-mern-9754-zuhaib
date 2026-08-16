const express = require('express');
const noteController = require('../controllers/noteController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.post('/', noteController.createNote);
router.get('/', noteController.listNotes);
router.get('/:id', noteController.getNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
