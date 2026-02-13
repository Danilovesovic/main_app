const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        maxlength: 20,
        minlength: 3,
        require: true
    },
    password: {
        type: String,
        maxlength: 100,
        minlength: 5,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true
    },
    role : {
        type: String,
        enum: ["admin", "superadmin"],
        default: "admin"
    },
    main: {
        type: Boolean,
        default: false
    },
    flag: {
        type: String,
        enum: ["green", "orange", "red"],
        default: "green"
    },

})


const User = mongoose.model('User', UserSchema);


module.exports = User;