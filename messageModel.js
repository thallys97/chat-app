const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    type: { type: String, default: 'regular' }, // 'info' para mensagens do sistema
    timestamp: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Message', messageSchema);
