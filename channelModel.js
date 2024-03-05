

const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    topic: { type: String, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] // Adicionando campo de mensagens
});

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
