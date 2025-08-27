const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    username:
    {
        type: String,
        required: true,
       
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false }

});
userSchema.pre('save', async function (next) {
    const user = this
    if (!user.isModified('password'))
        return next()
    try {

        const salt = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(user.password, salt)
        user.password = hashedpassword
        next()
    }

    catch (err) {
        return next(err)
    }
})
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        const ismatched = await bcrypt.compare(candidatePassword, this.password)
        return ismatched
    }
    catch (err) {
        throw err
    }
}
module.exports = mongoose.model('User', userSchema);

