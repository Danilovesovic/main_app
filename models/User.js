const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        maxlength: 20,
        minlength: 3,
        required: true
    },
    password: {
        type: String,
        maxlength: 100,
        minlength: 5,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    profileImage: {
        type: String,
        default: '/assets/profiles/default.png'
    },
    role : {
        type: String,
        enum: ["admin", "superadmin"],
        default: "admin"
    },
    favoritePosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    main: {
        type: Boolean,
        default: false
    },
    flag: {
        type: String,
        enum: ["green", "orange", "red"],
        default: "green"
    }
})


const User = mongoose.model('User', UserSchema);


module.exports = User;