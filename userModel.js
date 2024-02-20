const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    // userID não é mais necessário, pois o mongoose cria um _id por padrão
});

// Hashing a password before saving it to the database
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
