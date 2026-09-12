const express = require('express');
const locationController = require('../controllers/locationController');

const router = express.Router();

router.get('/', locationController.getLocations);
router.get('/nearby', locationController.getNearby);

module.exports = router;
