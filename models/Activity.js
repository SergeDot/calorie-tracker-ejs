import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Please provide the activity type'],
      maxlength: 50
    },
    duration: {      
      number: {
        type: Number,
        required: [true, 'Please provide the amount']
      },
      unit: {
        type: String,
        required: [true, 'please provide the time unit'],
        enum: {
          values: ['seconds', 'minutes', 'hours', 'steps', 'yards', 'miles'],
          message: '{VALUE} not supported'
        }
      }
    },
    calories: {
      type: Number,
      required: [true, 'Please provide the calories number']
    },
    activityDate: {
      type: Date,
      required: [true, 'Please provide the date']
    },
    comments: {
      type: String,
      maxlength: 200,
      default: null
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the user']
    }
  },
  { timestamps: true }
);

export default mongoose.model('Activity', ActivitySchema);
