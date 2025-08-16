// AlbumDetailsModal.jsx
import React from "react";
import { Modal, Row, Col, Table } from "react-bootstrap";
import { SHEET_TYPES, ALBUM_TEMPLATES, BOX_TYPES } from "./AddAlbumModal";

const money = (n) => `₹${(Number(n) || 0).toLocaleString()}`;
const findSheet = (id) => SHEET_TYPES.find((s) => s.id === id);
const findBox = (id) => BOX_TYPES.find((b) => b.id === id) || BOX_TYPES[0];
const findTpl = (id) => ALBUM_TEMPLATES.find((t) => t.id === id);

const calcExtrasCost = (extrasObj) =>
  SHEET_TYPES.reduce(
    (sum, s) => sum + (Number(extrasObj?.[s.id]) || 0) * s.price,
    0
  );

export default function AlbumDetailsModal({ show, onClose, album }) {
  if (!album) return null;

  const tpl = findTpl(album.templateId);
  const box = findBox(album.boxTypeId);

  const qty = Math.max(1, Number(album.qty) || 1);
  const unitAlbumPrice = Number(album.unitPrice) || 0; // album-only price
  const boxPerUnit = box?.surcharge || 0;

  const extrasShared = album.extras?.shared || {};
  const extrasPerUnit = album.extras?.perUnit || [];
  const isPerUnit =
    !!album.customizePerUnit && Array.isArray(extrasPerUnit) && extrasPerUnit.length > 0;

  // pricing
  let finalUnitPrice = unitAlbumPrice + boxPerUnit; // used when shared
  let grandTotal = 0;

  if (isPerUnit) {
    const perUnitTotals = Array.from({ length: qty }, (_, i) => {
      const extraCost = calcExtrasCost(extrasPerUnit[i] || {});
      return unitAlbumPrice + extraCost + boxPerUnit;
    });
    grandTotal = perUnitTotals.reduce((a, b) => a + b, 0);
  } else {
    const sharedExtrasCost = calcExtrasCost(extrasShared);
    finalUnitPrice = unitAlbumPrice + sharedExtrasCost + boxPerUnit;
    grandTotal = finalUnitPrice * qty;
  }

  // helpers to filter only selected sheets (> 0)
  const entriesWithQty = (obj) =>
    Object.entries(obj || {}).filter(([, v]) => (Number(v) || 0) > 0);

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Album Details</Modal.Title>
      </Modal.Header>

      {/* small font everywhere */}
      <Modal.Body className="small">
        <Row className="mb-3">
          <Col md={6}>
            <div><strong>Album:</strong> {album.snapshot?.templateLabel || tpl?.label}</div>
            <div>
              <strong>Box:</strong>{" "}
              {(album.snapshot?.boxLabel || box?.label) + ` × ${qty}`}
            </div>
            <div><strong>Base Sheets:</strong> {album.snapshot?.baseSheets}</div>
            <div><strong>Base Photos:</strong> {album.snapshot?.basePhotos}</div>
          </Col>
          <Col md={6}>
            <div><strong>Quantity:</strong> {qty}</div>
            <div><strong>Album Unit (without box/extras):</strong> {money(unitAlbumPrice)}</div>
            <div><strong>Box Surcharge / unit:</strong> {money(boxPerUnit)}</div>
            {!isPerUnit ? (
              <>
                <div><strong>Final Unit (incl. extras + box):</strong> {money(finalUnitPrice)}</div>
                <div><strong>Total:</strong> {money(grandTotal)}</div>
              </>
            ) : (
              <div><strong>Total (all units):</strong> {money(grandTotal)}</div>
            )}
          </Col>
        </Row>

        {isPerUnit && (
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
                  const extraCost = calcExtrasCost(extrasPerUnit[i] || {});
                  const albumPlusExtras = unitAlbumPrice + extraCost;
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

        <hr />

        {/* Extras breakdown */}
        {!isPerUnit && (
          <>
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
                    const sheet = findSheet(k);
                    const price = sheet?.price || 0;
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

        {isPerUnit && (
          <>
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
                        const sheet = findSheet(k);
                        const price = sheet?.price || 0;
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
              <td>{(album.snapshot?.boxLabel || box?.label) + ` × ${qty}`}</td>
              <td>{money(boxPerUnit)}</td>
              <td>{money(boxPerUnit * qty)}</td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
}
