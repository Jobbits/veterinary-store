const Counter = require('../models/counter');

const getNextSequence = async function (name) {
    const doc = await Counter.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return doc.seq;
};

module.exports = getNextSequence;