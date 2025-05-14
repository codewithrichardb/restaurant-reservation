import mongoose from 'mongoose';

export interface ITable extends mongoose.Document {
  tableNumber: number;
  capacity: number;
  location: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new mongoose.Schema<ITable>(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Please provide a table number'],
      unique: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide the table capacity'],
      min: [1, 'Table capacity must be at least 1'],
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
      enum: ['Window', 'Bar', 'Main', 'Outdoor', 'Private'],
      default: 'Main',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema);
