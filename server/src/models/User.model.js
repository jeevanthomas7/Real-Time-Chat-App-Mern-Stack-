import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
