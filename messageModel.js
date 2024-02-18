const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: String,
    text: String, // Mensagem de texto
    image: String, // URL da imagem
    video: String, // URL do vídeo
    link: String, // URL do link
    type: { type: String, default: 'regular' }, // Tipo de mensagem: 'regular', 'info', 'image', 'video', 'link'
    timestamp: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Message', messageSchema);
