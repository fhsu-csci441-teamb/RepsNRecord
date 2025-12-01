import { Schema, models, model } from "mongoose";

const photoSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    fileUrl: { type: String, required: true }, // Firebase Storage URL for full image
    thumbUrl: { type: String, required: true }, // Firebase Storage URL for thumbnail
    mimeType: { type: String },
    bytes: { type: Number },
    width: { type: Number },
    height: { type: Number },
    takenAt: { type: Date }, // When the photo was taken
    description: { type: String },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for querying by userId and date
photoSchema.index({ userId: 1, takenAt: -1 });

export const Photo = models.Photo || model("Photo", photoSchema);
