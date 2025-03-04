const  express = require('express');
const  { getWord, postWord }  = require('../controllers/secretWord.js');

const router = express.Router();
router.route('/').get(getWord).post(postWord);

module.exports = router;