import mongoose from 'mongoose';

const connectDB = (url, callback) => {
  callback;
  return mongoose.connect(url);
};

export default connectDB;
