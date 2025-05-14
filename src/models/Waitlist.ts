import mongoose from 'mongoose';

export interface IWaitlist extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  partySize: number;
  estimatedWaitTime?: number; // in minutes
  status: 'waiting' | 'seated' | 'left' | 'cancelled';
  notified: boolean;
  user?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistSchema = new mongoose.Schema<IWaitlist>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
    },
    partySize: {
      type: Number,
      required: [true, 'Please provide party size'],
      min: [1, 'Party size must be at least 1'],
      max: [20, 'Party size cannot exceed 20'],
    },
    estimatedWaitTime: {
      type: Number,
      min: [0, 'Wait time cannot be negative'],
    },
    status: {
      type: String,
      enum: ['waiting', 'seated', 'left', 'cancelled'],
      default: 'waiting',
    },
    notified: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Waitlist || mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);
