const express = require('express');
const router = express.Router();
const {
  createLabTest,
  getMyLabTests,
  getLabTest,
  updateLabTest,
  analyzeLabTest,
  compareLabTests
} = require('../controllers/labTestController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createLabTest)
  .get(getMyLabTests);

router.route('/:id')
  .get(getLabTest)
  .put(updateLabTest);

router.post('/:id/analyze', analyzeLabTest);
router.post('/compare', compareLabTests);

module.exports = router;
