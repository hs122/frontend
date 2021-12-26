const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.post(
  '/',
  [
    check('name')
      .not()
      .isEmpty(),
    check('mobile').isLength({ min: 10 }),
    check('address')
      .not()
      .isEmpty()
  ],
  placesControllers.createDetails
);

router.patch(
  '/:pid',
  [
    check('name')
      .not()
      .isEmpty(),
    check('mobile').isLength({ min: 10 }),
    check('address')
      .not()
      .isEmpty()
  ],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
