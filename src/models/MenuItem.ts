import mongoose from 'mongoose';

export interface IMenuItem extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
  imageUrl?: string;
  isAvailable: boolean;
  isPopular?: boolean;
  allergens?: string[];
  dietaryInfo?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new mongoose.Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage'],
    },
    imageUrl: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    allergens: {
      type: [String],
      default: [],
    },
    dietaryInfo: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
