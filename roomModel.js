// Room.js (novo arquivo)
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
