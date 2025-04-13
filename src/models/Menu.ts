import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  mealType: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
  },
  menuItems: {
    type: [String],
    required: true,
  },
}, {
  timestamps: true,
});

// Create a compound index for date, day and mealType to ensure uniqueness
menuSchema.index({ date: 1, day: 1, mealType: 1 }, { unique: true });

// Check if the model exists before creating it to prevent overwriting
const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);

export default Menu; 