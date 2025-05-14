import mongoose from 'mongoose';

export interface IReservation extends mongoose.Document {
  date: string;
  timeSlot: string;
  partySize: number;
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
  specialOccasion?: 'Birthday' | 'Anniversary' | 'Business' | 'Other' | '';
  occasionDetails?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  user?: mongoose.Types.ObjectId;
  table?: mongoose.Types.ObjectId;
  preOrders?: {
    item: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  feedback?: {
    rating: number;
    comment?: string;
    submittedAt: Date;
  };
  loyaltyPoints?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new mongoose.Schema<IReservation>(
  {
    date: {
      type: String,
      required: [true, 'Please provide a date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please provide a time slot'],
    },
    partySize: {
      type: Number,
      required: [true, 'Please provide party size'],
      min: [1, 'Party size must be at least 1'],
      max: [20, 'Party size cannot exceed 20'],
    },
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
    specialRequests: {
      type: String,
      maxlength: [500, 'Special requests cannot be more than 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    },
    specialOccasion: {
      type: String,
      enum: ['Birthday', 'Anniversary', 'Business', 'Other', ''],
      default: '',
    },
    occasionDetails: {
      type: String,
      maxlength: [200, 'Occasion details cannot be more than 200 characters'],
    },
    preOrders: [
      {
        item: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        specialInstructions: {
          type: String,
          maxlength: [200, 'Special instructions cannot be more than 200 characters'],
        },
      },
    ],
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: [500, 'Feedback comment cannot be more than 500 characters'],
      },
      submittedAt: {
        type: Date,
      },
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);
