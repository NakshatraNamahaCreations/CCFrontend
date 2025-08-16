import { BOX_TYPES, SHEET_TYPES } from "../pages/Albums/AddAlbumModal";

const findBox = (id) => BOX_TYPES.find((b) => b.id === id) || BOX_TYPES[0];

const calcExtrasCost = (extrasObj) =>
  SHEET_TYPES.reduce(
    (sum, s) => sum + (Number(extrasObj?.[s.id]) || 0) * s.price,
    0
  );

export const computeAlbumTotal = (a) => {
  const qty = Math.max(1, Number(a.qty) || 1);
  const boxPerUnit = findBox(a.boxTypeId)?.surcharge || 0;
  const unitAlbumPrice = Number(a.unitPrice) || 0;

  if (a.customizePerUnit && Array.isArray(a.extras?.perUnit)) {
    let total = 0;
    for (let i = 0; i < qty; i++) {
      const extrasForUnit = a.extras.perUnit[i] || {};
      const perUnit = unitAlbumPrice + calcExtrasCost(extrasForUnit) + boxPerUnit;
      total += perUnit;
    }
    return total;
  }

  const shared = a.extras?.shared || {};
  const perUnit = unitAlbumPrice + calcExtrasCost(shared) + boxPerUnit;
  return perUnit * qty;
};

export const fmt = (n) => `₹${(Number(n) || 0).toLocaleString()}`;