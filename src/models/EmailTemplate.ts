import mongoose, { Schema, Document } from 'mongoose';

export interface EmailTemplateDocument extends Document {
  type: 'confirmation' | 'reminder' | 'cancellation' | 'welcome';
  subject: string;
  body: string;
  isActive: boolean;
  lastUpdated?: Date;
  createdAt: Date;
}

const EmailTemplateSchema = new Schema<EmailTemplateDocument>(
  {
    type: {
      type: String,
      required: true,
      enum: ['confirmation', 'reminder', 'cancellation', 'welcome'],
      unique: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.EmailTemplate || 
  mongoose.model<EmailTemplateDocument>('EmailTemplate', EmailTemplateSchema);
