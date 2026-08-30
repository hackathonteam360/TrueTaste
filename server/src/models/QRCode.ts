import mongoose, { Schema, model, Types } from 'mongoose';

export interface IQRCode {
  restaurantId: Types.ObjectId;
  tableNumber: number;
  code: string;
  active: boolean;
  createdAt: Date;
}

const qrCodeSchema = new Schema<IQRCode>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableNumber: { type: Number, required: true },
    code: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const QRCode = mongoose.models.QRCode || model<IQRCode>('QRCode', qrCodeSchema);