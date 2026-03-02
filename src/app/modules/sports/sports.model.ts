import { Schema, model, Document } from "mongoose";

export interface SportsDocument extends Document {
  title: string;
  description: string;
  thumbnail?: string;
  type: string;
  src: string;
  order: number;
}

const sportsSchema = new Schema<SportsDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    type: {
      type: String,
      required: true,
      enum: [
        "basketball",
        "soccer",
        "volleyball",
        "lacrosse",
        "football",
        "highlight",
        "recruiting",
      ],
    },
    src: { type: String, required: true },

    // 🔥 ordering field
    order: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Sports = model<SportsDocument>("Sports", sportsSchema);
