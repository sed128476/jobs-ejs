import Payment from '../models/Payment.js';
import { BadRequestError, NotFoundError } from '../errors/index.js';

export const paymentShowAll = async (req, res) => {
    const payments = await Payment.find({ createdBy: req.user?._id }).sort('createdAt');
    res.render('payments', { payments });
};

const paymentShowAllError = async (req, res) => {
    const payments = await Payment.find({ createdBy: req.user?._id }).sort('createdAt');
    res.render('payments', { payments, errors: req.flash('error') });
};

export const paymentShow = async (req, res) => {
    const payment = await Payment.findOne({
        createdBy: req.user?._id,
        _id: req.params.id
    });

    if (!payment) {
        req.flash('error', 'Payment method not found.');
        paymentShowAllError(req, res);
        return;
    }

    res.render('payment', { payment });
};

const paymentShowError = async (req, res) => {
    const payment = await Payment.findOne({
        createdBy: req.user?._id,
        _id: req.params.id
    });

    if (!payment) {
        req.flash('error', 'Payment method not found.');
        paymentShowAllError(req, res);
        return;
    }

    res.render('payment', { payment, errors: req.flash('error') });
};

export const paymentCreate = async (req, res) => {
    const newPayment = { ...req.body };
    newPayment.createdBy = req.user._id;
    const payment = await Payment.create(newPayment);
    if (!payment) {
        req.flash('error', 'Payment method creation failed.');
        paymentShowCreateError(req, res);
        return;
    }

    paymentShowAll(req, res);
};

export const paymentUpdate = async (req, res) => {
    const { cardNumber, securityCode, expireDate, zipCode } = req.body;
    if (cardNumber === '' || securityCode === '' || expireDate === '' || zipCode === '') {
        req.flash('error', 'Invalid, empty field(s) provided.');
        paymentShowError(req, res);
        return;
    }

    const payment = await Payment.findOneAndUpdate(
        {
            createdBy: req.user?._id,
            _id: req.params.id
        },
        { cardNumber, securityCode, expireDate, zipCode },
        { new: true, runValidators: true }
    );

    if (!payment) {
        req.flash('error', 'Payment method not found.');
        paymentShowAllError(req, res);
        return;
    }

    paymentShowAll(req, res);
};

export const paymentDelete = async (req, res) => {
    const payment = await Payment.findOneAndDelete({
        createdBy: req.user?._id,
        _id: req.params.id
    });

    if (!payment) {
        req.flash('error', 'Payment method not found. You may have sent multiple requests.');
        paymentShowAllError(req, res);
        return;
    }

    paymentShowAll(req, res);
};

export const paymentShowCreate = (req, res) => {
    res.render('payment', { payment: null });
};

const paymentShowCreateError = (req, res) => {
    res.render('payment', { payment: null, errors: req.flash('error') });
};
