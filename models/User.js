import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter your Name"]
    },
    email: {
        type: String,
        required: [true, "Please Enter your Email"],
        unique: true,
        validate: validator.isEmail
    },
    password: {
        type: String,
        required: [true, "Please Enter your Password"],
        minLength: [6, "Password must be atleast 6 characters long"],
        select: false
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'user'],
        default: 'user'
    },
    subscription: {
        id: String,
        status: String
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true
        }
    },
    playlist: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        },
        poster: {
            type: String
        }
    }],

    createdAt: {
        type: Date,
        default: Date.now,
    },

    ResetPasswordToken: String,
    ResetPasswordExpire: String,
})


UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
})

UserSchema.methods.getToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.SECRET, {
        expiresIn: "15d"
    });
    return token;
}

UserSchema.methods.comparePassword = async function (password) {
    const val = await bcrypt.compare(password, this.password);
    return val;
}

UserSchema.methods.getResetToken = async function () {
    // to create reset password token we need to import crypto

    // using this generating token(it will generate a token of 20 bytes in which characters are from 0-9 or a-f)
    const resetToken = crypto.randomBytes(20).toString("hex");

    // crypto.createHash("sha256") helps to create a hashobject then .update(resetToken) is used to update the hex with the given reset token then .digest method is used to retrieve the final string and then "hex" is provided inside bracket to tell the output will be in hexadecimal format
    this.ResetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.ResetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
}

export const userSchema = mongoose.model('User', UserSchema); 