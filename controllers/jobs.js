const Job = require('../models/Job.js');
const { BadRequestError, NotFoundError } = require('../errors/index.js');

const jobShowAll = async (req, res) => {
    const jobs = await Job.find({ createdBy: req.user?._id }).sort('createdAt');

    res.render('jobs', { jobs });
};

const jobShowAllError = async (req, res) => {
    const jobs = await Job.find({ createdBy: req.user?._id }).sort('createdAt');
    res.render('jobs', { jobs, errors: req.flash('error') });
};

const jobShow = async (req, res) => {
    const job = await Job.findOne({
        createdBy: req.user?._id,
        _id: req.params.id
    });

    if (!job) {
        req.flash('error', 'Job not found.');
        jobShowAllError(req, res);
        return;
    }

    res.render('job', { job });
};

const jobShowError = async (req, res) => {
    const job = await Job.findOne({
        createdBy: req.user?._id,
        _id: req.params.id
    });

    if (!job) {
        req.flash('error', 'Job not found.');
        jobShowAllError(req, res);
        return;
    }

    res.render('job', { job, errors: req.flash('error') });
};

const jobCreate = async (req, res) => {
    const newJob = { ...req.body };
    newJob.createdBy = req.user._id;
    const job = await Job.create(newJob);
    if (!job) {
        req.flash('error', 'Job creation failed.');
        jobShowCreateError(req, res);
        return;
    }

    jobShowAll(req, res);
};

const jobUpdate = async (req, res) => {
    const { company, position, status } = req.body;
    if (company === '' || position === '' || status === '') {
        req.flash('error', 'Invalid, empty field(s) provided.');
        jobShowError(req, res);
        return;
    }

    const job = await Job.findOneAndUpdate(
        {
            createdBy: req.user?._id,
            _id: req.params.id
        },
        { company, position, status },
        { new: true, runValidators: true }
    );

    if (!job) {
        req.flash('error', 'Job not found.');
        jobShowAllError(req, res);
        return;
    }

    jobShowAll(req, res);
};

const jobDelete = async (req, res) => {
    const job = await Job.findOneAndDelete({
        createdBy: req.user?._id,
        _id: req.params.id
    });

    if (!job) {
        req.flash('error', 'Job not found. You may have sent multiple requests.');
        jobShowAllError(req, res);
        return;
    }

    jobShowAll(req, res);
};

const jobShowCreate = (req, res) => {
    res.render('job', { job: null });
};

const jobShowCreateError = (req, res) => {
    res.render('job', { job: null, errors: req.flash('error') });
};

module.exports = {
    jobShowAll,
    jobShowAllError,
    jobShow,
    jobShowError,
    jobCreate,
    jobUpdate,
    jobDelete,
    jobShowCreate,
    jobShowCreateError
};
