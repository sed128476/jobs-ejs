import express from 'express';
import {
    paymentShowAll,
    paymentShow,
    paymentCreate,
    paymentUpdate,
    paymentDelete,
    paymentShowCreate
} from '../controllers/payment.js';

const router = express.Router();
router.route('/').get(paymentShowAll).post(paymentCreate);
router.get('/new', paymentShowCreate);
router.get('/edit/:id', paymentShow);
router.post('/update/:id', paymentUpdate);
router.post('/delete/:id', paymentDelete);

export default router;
