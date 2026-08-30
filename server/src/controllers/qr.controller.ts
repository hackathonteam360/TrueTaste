import { Response } from 'express';
import { QRCode } from '../models/QRCode';
import { Restaurant } from '../models/Restaurant';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';

function parsePayload(payload: string): { restaurantId?: string; table?: number } {
  const s = String(payload || '').trim();

  const urlMatch = s.match(/(truetaste:\/\/\/?(?:review\/)?|https?:\/\/[^/]+\/review\/)([A-Za-z0-9]+)(?:\/(\d+))?/i);
  if (urlMatch) {
    return { restaurantId: urlMatch[2], table: urlMatch[3] ? Number(urlMatch[3]) : undefined };
  }

  const ttMatch = s.match(/^TT-([A-Za-z0-9]+)-(\d+)$/i);
  if (ttMatch) {
    return { restaurantId: ttMatch[1], table: Number(ttMatch[2]) };
  }

  const pipeMatch = s.match(/^([A-Za-z0-9]+)[|:](\d+)$/i);
  if (pipeMatch) {
    return { restaurantId: pipeMatch[1], table: Number(pipeMatch[2]) };
  }

  if (/^[A-Za-z0-9]{24}$/.test(s)) {
    return { restaurantId: s };
  }

  return {};
}

export const resolveCode = asyncHandler(async (req: AuthRequest, res: Response) => {
  const raw = req.params.code as string;
  const { restaurantId, table } = parsePayload(raw);

  let qr: any = null;
  if (restaurantId && table) {
    qr = await QRCode.findOne({ restaurantId, tableNumber: table, active: true });
  }
  if (!qr) {
    // If a QR unique code was scanned directly
    qr = await QRCode.findOne({ code: raw, active: true });
  }
  if (!qr && restaurantId) {
    qr = await QRCode.findOne({ restaurantId, active: true }).sort({ tableNumber: 1 });
  }

  if (!qr) {
    return res.status(404).json({ message: 'QR code not found or deactivated' });
  }

  const restaurant = await Restaurant.findById(qr.restaurantId).lean();
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  return res.json({
    restaurant,
    tableNumber: qr.tableNumber,
    code: qr.code,
  });
});