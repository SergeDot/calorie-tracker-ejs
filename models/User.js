import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
  // field validations
  name: {
    type: String,
    required: [true, 'Please provide the name'],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Please provide the email'],
    match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide a valid email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide the password'],
    minlength: 6
  },
  height: {
    feet: {
      type: Number,
      required: [false],
    },
    inches: {
      type: Number,
      required: [false],
    }
  },
  birthYear: {
    type: Number,
    required: [false],
  },
  goal: {
    type: String,
    enum: {
      values: ['lose_weight', 'maintain_weight', 'gain_weight'],
      message: '{VALUE} not supported'
    },
    required: [false],
  },
  weight: {
    type: Number,
    required: [false],
  },
  sex: {
    type: Number,
    enum: {
      values: [1, 2],
      message: '{VALUE} not supported'
    },
    required: [false],
  },
  gender: {
    type: String,
    required: [false],
  },
  lifestyle: {
    type: String,
    enum: {
      values: [1, 2, 3, 4],
      message: '{VALUE} not supported'
    }
  },
  newUser: {
    type: Boolean,
    required: [true, 'Must have new user indicator'],
  },
  dailyCaloriesGoal: {
    type: Number
  }
});

UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// UserSchema.methods.getName = function () {
//   return this.name;
// };

// UserSchema.methods.createJWT = function () {
//   return jwt.sign({ userID: this._id, name: this.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
// };

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model('User', UserSchema);
