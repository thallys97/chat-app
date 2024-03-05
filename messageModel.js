const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: String,
    text: String, // Mensagem de texto
    image: String, // URL da imagem
    video: String, // URL do vídeo
    link: String, // URL do link
    gif: String, // URL do GIF
    type: { type: String, default: 'regular' }, // Tipo de mensagem: 'regular', 'info', 'image', 'video', 'link'
    timestamp: { type: Date, default: Date.now },
    senderID: String, // ID do usuário que envia a mensagem
    receiverID: String, // ID do usuário que recebe a mensagem (se for uma mensagem privada)
    roomID: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // Referência à sala
    channelID: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' } // Associar mensagem a um canal
});


module.exports = mongoose.model('Message', messageSchema);
