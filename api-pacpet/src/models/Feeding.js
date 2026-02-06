import mongoose from "mongoose";
import { type } from "os";

const FeedingSchema = new mongoose.Schema({
  commandId: {
    type: String,
    required: true,
    unique: true
  },

  weightTarget: {
    type: Number,
    required: false
  }, 

  weightGrams: {
    type: Number,
    required: false
  },

  openTimeMs: {
    type: Number,
    required: false
  },

  type: {
    type: String,
    enum: ["automatic", "manual"],
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "success", "error"],
    required: true,
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Feeding", FeedingSchema);