const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauce = require('../controllers/sauce');


//GetAllSauces
router.get('/', auth, sauce.getSauces);

//create sauce
router.post('/', auth, multer, sauce.createSauce);

//Get ONE sauce
router.get('/:id', auth, sauce.getOneSauce);

//Delete sauce
router.delete('/:id', auth, sauce.deleteSauce);

// MODIFY SAUCE
router.put('/:id', auth, multer, sauce.modifySauce);

// Like/Dislike 
router.post('/:id/like', auth, sauce.likeDislikeSauce);



module.exports = router;