import mongoose from 'mongoose';

const FoodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the food item name'],
      maxlength: 50
    },
    brand: {
      type: String,
      maxlength: 50,
      default: "unknown"
    },
    mealTime: {
      type: String,
      enum: {
        values: ['breakfast', 'second_breakfast', 'lunch', 'after_lunch', 'dinner', 'late_dinner', 'midnight_crave'],
        message: '{VALUE} not supported'
      },
      default: 'breakfast'
    },
    calories: {
      type: Number,
      required: [true, 'Please provide the calories number']
    },
    amount: {
      quantity: {
        type: Number,
        required: [true, 'Please provide the amount']
      },
      unit: {
        type: String,
        required: [true, 'please provide the serving size'],
        enum: {
          values: ['oz', 'g', 'lb', 'glass', 'qt', 'gal', 'cup', 'fl_oz', 'teaspoonful', 'small_bowl', 'large_bowl', 'just_a_pinch_it_doesnt_count'],
          message: '{VALUE} not supported'
        }
      }
    },
    consumeDate: {
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

export default mongoose.model('Food-Item', FoodItemSchema);
