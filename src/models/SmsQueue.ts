import mongoose, { Schema, Document } from "mongoose";

export interface ISms extends Document {
  mobileNumber: string;
  message: string;
  status: "pending" | "processing" | "sent" | "failed";
  createdAt: Date;
  sentAt?: Date;
}

const SmsQueueSchema = new Schema<ISms>(
  {
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "sent", "failed"],
      default: "pending",
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SmsQueue || mongoose.model<ISms>("SmsQueue", SmsQueueSchema);