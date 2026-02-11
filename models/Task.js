const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    title : {
        type: String,
        require: true
    },
    description : {
        type: String,
        default: ""
    },
    assignedTo : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
        assignedBy : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    public : {
        type: Boolean,
        default: false
    },
    status : {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending"
    }
}, {timestamps: true});

TaskSchema.methods.isOwner = function(userId){
    let assignedBy = this.assignedBy._id || this.assignedBy;
    return String(userId) === String(assignedBy);
}

// TaskSchema.virtual('fullName').get(function(){
//    return this.first_name + " " +this.last_name;
// })

// TaskSchema.query.isOwners = function(name){
//     return this.where({assignedBy: name});
// }
//
// TaskSchema.pre('save', function(next){})

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;