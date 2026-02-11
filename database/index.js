const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dslack')
    .then(() => console.log('MongoDB Connected'))



module.exports = mongoose.connection;