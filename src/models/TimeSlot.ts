import mongoose from 'mongoose';

export interface ITimeSlot extends mongoose.Document {
  time: string;
  available: boolean;
  maxReservations: number;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new mongoose.Schema<ITimeSlot>(
  {
    time: {
      type: String,
      required: [true, 'Please provide a time'],
      unique: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    maxReservations: {
      type: Number,
      default: 5, // Default number of tables available per time slot
    },
  },
  { timestamps: true }
);

export default mongoose.models.TimeSlot || mongoose.model<ITimeSlot>('TimeSlot', TimeSlotSchema);
