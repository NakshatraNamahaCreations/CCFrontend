// src/components/Albums/LocalAlbumDetailsModal.jsx
import React, { useMemo } from "react";
import { Modal, Row, Col, Table } from "react-bootstrap";
import {
  ALBUM_TEMPLATES,
  BOX_TYPES,
  SHEET_TYPES,
} from "./AddAlbumModal";


/** ---------- tiny helpers ---------- */
const money = (n) => `₹${(Number(n) || 0).toLocaleString()}`;

const findTpl = (id) => ALBUM_TEMPLATES.find((t) => t.id === id);
const findBox = (id) => BOX_TYPES.find((b) => b.id === id) || BOX_TYPES[0];

/** Turn Map or plain object into a plain object */
const toPlainObject = (m) => {
  if (!m) return {};
  if (m instanceof Map) return Object.fromEntries(m);
  return m;
};

/** Prefer constants; fall back to snapshot.sheetTypes if present */
const getSheetCatalog = (album) => {
  const snapSheets = album?.snapshot?.sheetTypes;
  if (Array.isArray(snapSheets) && snapSheets.length > 0) return snapSheets;
  return SHEET_TYPES;
};

/** extras cost using the chosen sheet catalog */
const calcExtrasCost = (extrasObj, catalog) =>
  (catalog || []).reduce(
    (sum, s) => sum + (Number(extrasObj?.[s.id]) || 0) * (Number(s.price) || 0),
    0
  );

/** Keep only entries with qty > 0 for display */
const entriesWithQty = (obj) =>
  Object.entries(obj || {}).filter(([, v]) => (Number(v) || 0) > 0);

/** ---------- Component ---------- */
export default function LocalAlbumDetailsModal({ show, onClose, album }) {
  // If no album selected, render nothing (keeps animations clean)
  if (!album) return null;

  const sheetCatalog = useMemo(() => getSheetCatalog(album), [album]);
  const tpl = findTpl(album.templateId);
  const box = findBox(album.boxTypeId);

  const qty = Math.max(1, Number(album.qty) || 1);
  const unitAlbumPrice = Number(album.unitPrice) || 0;

  // box surcharge: prefer current BOX_TYPES; fallback to snapshot at save time; lastly 0
  const boxPerUnit =
    Number(box?.surcharge) ||
    Number(album?.snapshot?.boxSurchargeAtSave) ||
    Number(album?.suggested?.boxPerUnit) ||
    0;

  const customizePerUnit = !!album.customizePerUnit;

  // Normalize extras
  const extrasShared = toPlainObject(album?.extras?.shared);
  const extrasPerUnitRaw = Array.isArray(album?.extras?.perUnit)
    ? album.extras.perUnit
    : [];
  const extrasPerUnit = extrasPerUnitRaw.map(toPlainObject);

  // Pricing
  let finalUnitPrice = unitAlbumPrice + boxPerUnit; // for "shared" path
  let grandTotal = 0;

  if (customizePerUnit && extrasPerUnit.length > 0) {
    // per-unit: sum of (album+extras+box) for each unit
    const totals = Array.from({ length: qty }).map((_, i) => {
      const perExtras = extrasPerUnit[i] || {};
      const extrasCost = calcExtrasCost(perExtras, sheetCatalog);
      const albumPlusExtras = unitAlbumPrice + extrasCost;
      return albumPlusExtras + boxPerUnit;
    });
    grandTotal = totals.reduce((a, b) => a + b, 0);
  } else {
    // shared extras for every unit
    const sharedExtrasCost = calcExtrasCost(extrasShared, sheetCatalog);
    finalUnitPrice = unitAlbumPrice + sharedExtrasCost + boxPerUnit;
    grandTotal = finalUnitPrice * qty;
  }

  // Safe labels with snapshot fallback
  const albumLabel = album?.snapshot?.templateLabel || tpl?.label || "Album";
  const boxLabel = album?.snapshot?.boxLabel || box?.label || "Without Box";
  const baseSheets = album?.snapshot?.baseSheets ?? findTpl(album.templateId)?.baseSheets ?? "-";
  const basePhotos = album?.snapshot?.basePhotos ?? findTpl(album.templateId)?.basePhotos ?? "-";

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Album Details</Modal.Title>
      </Modal.Header>

      <Modal.Body className="small">
        <Row className="mb-3">
          <Col md={6}>
            <div><strong>Album:</strong> {albumLabel}</div>
            <div><strong>Box:</strong> {`${boxLabel} × ${qty}`}</div>
            <div><strong>Base Sheets:</strong> {baseSheets}</div>
            <div><strong>Base Photos:</strong> {basePhotos}</div>
          </Col>
          <Col md={6}>
            <div><strong>Quantity:</strong> {qty}</div>
            <div><strong>Album Unit (without box/extras):</strong> {money(unitAlbumPrice)}</div>
            <div><strong>Box Surcharge / unit:</strong> {money(boxPerUnit)}</div>

            {!customizePerUnit ? (
              <>
                <div><strong>Final Unit (incl. extras + box):</strong> {money(finalUnitPrice)}</div>
                <div><strong>Total:</strong> {money(grandTotal)}</div>
              </>
            ) : (
              <div><strong>Total (all units):</strong> {money(grandTotal)}</div>
            )}
          </Col>
        </Row>

        {customizePerUnit && extrasPerUnit.length > 0 && (
          <>
            <div className="fw-semibold mb-2">Per-unit pricing (incl. extras + box)</div>
            <Table size="sm" bordered>
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Album + Extras</th>
                  <th>Box</th>
                  <th>Final Per-unit</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: qty }).map((_, i) => {
                  const perExtras = extrasPerUnit[i] || {};
                  const extrasCost = calcExtrasCost(perExtras, sheetCatalog);
                  const albumPlusExtras = unitAlbumPrice + extrasCost;
                  const final = albumPlusExtras + boxPerUnit;
                  return (
                    <tr key={i}>
                      <td>{String(i + 1).padStart(2, "0")}</td>
                      <td>{money(albumPlusExtras)}</td>
                      <td>{money(boxPerUnit)}</td>
                      <td>{money(final)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={3} className="text-end">Grand Total</th>
                  <th>{money(grandTotal)}</th>
                </tr>
              </tfoot>
            </Table>
          </>
        )}

        {!customizePerUnit && (
          <>
            <hr />
            <div className="fw-semibold mb-2">Extra sheets (shared per unit)</div>
            {entriesWithQty(extrasShared).length > 0 ? (
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Qty / unit</th>
                    <th>Price / sheet</th>
                    <th>Cost / unit</th>
                  </tr>
                </thead>
                <tbody>
                  {entriesWithQty(extrasShared).map(([k, v]) => {
                    const sheet = sheetCatalog.find((s) => s.id === k);
                    const price = Number(sheet?.price) || 0;
                    return (
                      <tr key={k}>
                        <td>{sheet?.label || k}</td>
                        <td>{v}</td>
                        <td>{money(price)}</td>
                        <td>{money((Number(v) || 0) * price)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              <div className="text-muted">No extra sheets added.</div>
            )}
          </>
        )}

        {customizePerUnit && (
          <>
            <hr />
            <div className="fw-semibold mb-2">Extra sheets per unit</div>
            {Array.from({ length: qty }).map((_, idx) => {
              const rows = entriesWithQty(extrasPerUnit[idx] || {});
              if (rows.length === 0) {
                return (
                  <div key={idx} className="mb-2 text-muted">
                    Unit {String(idx + 1).padStart(2, "0")}: No extra sheets.
                  </div>
                );
              }
              return (
                <div key={idx} className="mb-3">
                  <div className="text-muted mb-1">
                    Unit {String(idx + 1).padStart(2, "0")}
                  </div>
                  <Table size="sm" bordered>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Price / sheet</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(([k, v]) => {
                        const sheet = sheetCatalog.find((s) => s.id === k);
                        const price = Number(sheet?.price) || 0;
                        return (
                          <tr key={k}>
                            <td>{sheet?.label || k}</td>
                            <td>{v}</td>
                            <td>{money(price)}</td>
                            <td>{money((Number(v) || 0) * price)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              );
            })}
          </>
        )}

        <hr />
        <div className="fw-semibold mb-1">Box</div>
        <Table size="sm" bordered>
          <thead>
            <tr>
              <th>Selected</th>
              <th>Surcharge / unit</th>
              <th>Total Box Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{`${boxLabel} × ${qty}`}</td>
              <td>{money(boxPerUnit)}</td>
              <td>{money(boxPerUnit * qty)}</td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
}
