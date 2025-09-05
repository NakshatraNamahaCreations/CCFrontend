import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col, Collapse } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";

/** ---------- Config (keep yours or adjust) ---------- */
export const BOX_TYPES = [
  { id: "none", label: "Without Box", surcharge: 0 },
  { id: "simple", label: "Simple Box", surcharge: 500 },
  { id: "premium", label: "Premium Box", surcharge: 1500 },
];

export const ALBUM_TEMPLATES = [
  {
    id: "small_9x12",
    label: `Small 9" x 12" (30 Sheets, 100 Photos)`,
    baseSheets: 30,
    basePhotos: 100,
    basePrice: 6000,
    extraSheetPrice: 120,
  },
  {
    id: "standard_15x24",
    label: `Standard 15" x 24" (30 Sheets, 200 Photos)`,
    baseSheets: 30,
    basePhotos: 200,
    basePrice: 12000,
    extraSheetPrice: 180,
  },
  {
    id: "premium_18x24_box",
    label: `Premium 18" x 24" with Box (30 Sheets, 200 Photos)`,
    baseSheets: 30,
    basePhotos: 200,
    basePrice: 18000,
    extraSheetPrice: 220,
  },
  {
    id: "luxury_18x24_special",
    label: `Luxury 18" x 24" with Special Box (30 Sheets, 200 Photos)`,
    baseSheets: 30,
    basePhotos: 200,
    basePrice: 24000,
    extraSheetPrice: 260,
  },
];

export const SHEET_TYPES = [
  { id: "std", label: "Additional Standard Sheet", price: 120 },
  { id: "special", label: "Additional/Replacement Special Sheet", price: 180 },
  {
    id: "embossed",
    label: "Additional/Replacement Embossed Sheet",
    price: 260,
  },
];

/** ---------- Helpers ---------- */
const findTemplate = (id) => ALBUM_TEMPLATES.find((t) => t.id === id);
const findBox = (id) => BOX_TYPES.find((b) => b.id === id) || BOX_TYPES[0];

const emptyExtras = () =>
  SHEET_TYPES.reduce((acc, s) => {
    acc[s.id] = 0;
    return acc;
  }, {});

const calcExtrasCost = (extrasObj) =>
  SHEET_TYPES.reduce(
    (sum, s) => sum + (Number(extrasObj?.[s.id]) || 0) * s.price,
    0
  );

// album base price only (no box)
const templateBasePrice = (templateId) =>
  findTemplate(templateId)?.basePrice || 0;
// box surcharge per unit
const boxSurcharge = (boxTypeId) => findBox(boxTypeId)?.surcharge || 0;

const API_BASE = "http://localhost:5000/api/quotations";

/** ---------- Component ---------- */
const AddAlbumModal = ({
  show,
  onClose,
  onAdd,
  onUpdate,
  mode = "add",
  initialData = null,
  quotationId: quotationIdProp,
  albumType = "quote", // Default to "quote", can be "addons"
  fetchQuotation,
}) => {
  const isEdit = mode === "edit";
  const { id: quotationIdFromParams } = useParams();
  const quotationId = quotationIdProp || quotationIdFromParams;

  const initFromData = (data) => {
    if (!data) {
      return {
        templateId: ALBUM_TEMPLATES[0].id,
        boxTypeId: "none",
        qty: "1",
        // album-only unit price
        unitPrice: templateBasePrice(ALBUM_TEMPLATES[0].id),
        showCustomize: false,
        customizePerUnit: false,
        extrasShared: emptyExtras(),
        extrasPerUnit: [emptyExtras()],
      };
    }
    const customizePerUnit = !!data.customizePerUnit;
    return {
      templateId: data.templateId,
      boxTypeId: data.boxTypeId,
      qty: String(data.qty ?? 1),
      unitPrice: Number(data.unitPrice) || 0, // album-only unit price stored
      showCustomize: !!data.customizePerUnit,
      customizePerUnit,
      extrasShared: !customizePerUnit
        ? data.extras?.shared ?? emptyExtras()
        : emptyExtras(),
      extrasPerUnit: customizePerUnit
        ? data.extras?.perUnit?.length
          ? data.extras.perUnit
          : [emptyExtras()]
        : [emptyExtras()],
    };
  };

  const [form, setForm] = useState(initFromData(initialData));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    setForm(initFromData(initialData));
  }, [show, initialData]);

  // album-only base, box per unit
  const baseAlbum = useMemo(
    () => templateBasePrice(form.templateId),
    [form.templateId]
  );
  const boxPerUnit = useMemo(
    () => boxSurcharge(form.boxTypeId),
    [form.boxTypeId]
  );

  const qtyNum = Math.max(1, parseInt(form.qty || "0", 10) || 1);

  // keep extras array length == qty when per-unit customization on
  useEffect(() => {
    if (!form.customizePerUnit) return;
    setForm((f) => {
      const arr = [...f.extrasPerUnit];
      if (arr.length < qtyNum) {
        for (let i = arr.length; i < qtyNum; i++) arr.push(emptyExtras());
      } else if (arr.length > qtyNum) {
        arr.length = qtyNum;
      }
      return { ...f, extrasPerUnit: arr };
    });
  }, [form.customizePerUnit, qtyNum]);

  /** Calculate prices based on current form state */
  const calculatePrices = useMemo(() => {
    const qty = Math.max(1, parseInt(form.qty || "0", 10) || 1);
    const basePrice = Number(form.unitPrice) || 0;
    const boxPrice = boxPerUnit;

    if (!form.customizePerUnit) {
      // Shared extras across all units
      const sharedExtrasCost = calcExtrasCost(form.extrasShared);
      const unitPrice = basePrice + sharedExtrasCost;
      const unitTotal = unitPrice + boxPrice;
      const finalTotal = unitTotal * qty;

      return {
        unitPrice,
        unitTotal,
        finalTotal,
        perUnitPrices: Array(qty).fill({
          unitPrice,
          unitTotal,
        }),
      };
    } else {
      // Per-unit extras
      const perUnitPrices = form.extrasPerUnit.map((extras) => {
        const extrasCost = calcExtrasCost(extras);
        const unitPrice = basePrice + extrasCost;
        const unitTotal = unitPrice + boxPrice;
        return { unitPrice, unitTotal };
      });

      const finalTotal = perUnitPrices.reduce(
        (sum, { unitTotal }) => sum + unitTotal,
        0
      );

      return {
        unitPrice: basePrice,
        unitTotal: basePrice + boxPrice,
        finalTotal,
        perUnitPrices,
      };
    }
  }, [
    form.unitPrice,
    form.qty,
    form.customizePerUnit,
    form.extrasShared,
    form.extrasPerUnit,
    boxPerUnit,
  ]);

  /** qty handlers */
  const handleQtyChange = (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, qty: v === "" ? "" : v.replace(/[^\d]/g, "") }));
  };
  const normalizeQtyOnBlur = () =>
    setForm((f) => ({
      ...f,
      qty: String(Math.max(1, parseInt(f.qty || "0", 10) || 1)),
    }));

  /** confirm -> API (create or update), then bubble result up */
  const handleConfirm = async () => {
    const finalQty = Math.max(1, parseInt(form.qty || "0", 10) || 1);

    const payload = {
      templateId: form.templateId,
      boxTypeId: form.boxTypeId,
      qty: finalQty,
      unitPrice: Number(form.unitPrice) || 0,
      customizePerUnit: form.customizePerUnit,
      extras: form.customizePerUnit
        ? { perUnit: form.extrasPerUnit }
        : { shared: form.extrasShared },
      type: albumType,
      suggested: {
        albumOnlyPerUnit: calculatePrices.perUnitPrices.map((p) => p.unitPrice),
        boxPerUnit,
        finalPerUnit: calculatePrices.perUnitPrices.map((p) => p.unitTotal),
        finalTotal: calculatePrices.finalTotal,
      },
      snapshot: {
        templateLabel: findTemplate(form.templateId)?.label || "",
        baseSheets: findTemplate(form.templateId)?.baseSheets || 30,
        basePhotos: findTemplate(form.templateId)?.basePhotos || 0,
        boxLabel: findBox(form.boxTypeId)?.label || "",
        sheetTypes: SHEET_TYPES,
      },
    };

    if (!quotationId) {
      toast.error("Missing quotation id");
      return;
    }

    try {
      setSaving(true);

      if (isEdit) {
        const albumId = initialData?._id || initialData?.id;
        if (!albumId) {
          toast.error("Missing album id");
          setSaving(false);
          return;
        }

        console.log("Updating album with:", { quotationId, albumId, payload });
        const { data } = await axios.put(
          `${API_BASE}/${quotationId}/albums/${albumId}`,
          payload
        );

        if (!data?.success) {
          throw new Error(data?.message || "Update failed");
        }

        toast.success("Album updated");
        onUpdate?.(data.album || { ...payload, _id: albumId });
      } else {
        const { data } = await axios.post(
          `${API_BASE}/${quotationId}/albums`,
          payload
        );
        toast.success("Album added");
        onAdd?.(data?.album || payload);
      }

      onClose?.();
    } catch (err) {
      console.error("Album save error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to save album"
      );
    } finally {
      setSaving(false);
      fetchQuotation();
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          {isEdit ? "Edit Album" : "Add Album"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="small">
        <Form>
          {/* Album */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Album</Form.Label>
            <Form.Select
              value={form.templateId}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  templateId: e.target.value,
                  // reset album-only unit price
                  unitPrice: templateBasePrice(e.target.value),
                }))
              }
            >
              {ALBUM_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} — Base ₹{t.basePrice.toLocaleString()}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Row className="g-3">
            {/* Box */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Box</Form.Label>
                <Form.Select
                  value={form.boxTypeId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      boxTypeId: e.target.value, // do NOT touch unitPrice here
                    }))
                  }
                >
                  {BOX_TYPES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label} {b.surcharge ? `(+₹${b.surcharge})` : ""}
                    </option>
                  ))}
                </Form.Select>
                <div className="mt-1 text-muted">
                  Box surcharge per unit: ₹{boxPerUnit.toLocaleString()}
                </div>
              </Form.Group>
            </Col>

            {/* Qty */}
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Quantity</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  min="1"
                  value={form.qty === "" ? "" : form.qty}
                  onChange={handleQtyChange}
                  onBlur={normalizeQtyOnBlur}
                />
              </Form.Group>
            </Col>

            {/* Unit Price (album only) */}
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Unit Price (album only)
                </Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  min="0"
                  value={form.unitPrice}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      unitPrice: Number(e.target.value) || 0,
                    }))
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Customization toggle */}
          <div className="d-flex align-items-center mt-3">
            <Form.Check
              type="switch"
              id="toggle-customize"
              checked={form.showCustomize}
              onChange={(e) =>
                setForm((f) => ({ ...f, showCustomize: e.target.checked }))
              }
              label="Customize extra sheets"
            />
          </div>

          <Collapse in={form.showCustomize}>
            <div>
              <div className="mt-3">
                <Form.Check
                  type="switch"
                  id="toggle-per-unit"
                  checked={form.customizePerUnit}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      customizePerUnit: e.target.checked,
                      extrasPerUnit: e.target.checked
                        ? Array.from({ length: qtyNum }, () => emptyExtras())
                        : f.extrasPerUnit,
                    }))
                  }
                  label="Customize each unit separately"
                />
              </div>

              {!form.customizePerUnit ? (
                <div className="p-2 border rounded mt-2">
                  <div className="fw-semibold mb-2">
                    Extra sheets (applies to every unit)
                  </div>
                  {SHEET_TYPES.map((s) => (
                    <Row key={s.id} className="g-2 align-items-center mb-1">
                      <Col xs={7}>
                        {s.label} (₹{s.price} / sheet)
                      </Col>
                      <Col xs={5} className="d-flex align-items-center gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              extrasShared: {
                                ...f.extrasShared,
                                [s.id]: Math.max(
                                  0,
                                  (f.extrasShared[s.id] || 0) - 1
                                ),
                              },
                            }))
                          }
                        >
                          −
                        </Button>
                        <Form.Control
                          size="sm"
                          type="number"
                          min="0"
                          value={form.extrasShared[s.id]}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              extrasShared: {
                                ...f.extrasShared,
                                [s.id]: Math.max(
                                  0,
                                  Number(e.target.value) || 0
                                ),
                              },
                            }))
                          }
                          style={{ maxWidth: 90 }}
                        />
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              extrasShared: {
                                ...f.extrasShared,
                                [s.id]: (f.extrasShared[s.id] || 0) + 1,
                              },
                            }))
                          }
                        >
                          +
                        </Button>
                      </Col>
                    </Row>
                  ))}

                  <div className="mt-2 text-muted">
                    Album-only per unit: ₹
                    {calculatePrices.unitPrice.toLocaleString()}
                    <br />
                    Final per unit (incl. box): ₹
                    {calculatePrices.unitTotal.toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="p-2 border rounded mt-2">
                  <div className="fw-semibold mb-2">Extra sheets per unit</div>

                  {Array.from({ length: qtyNum }).map((_, i) => (
                    <div key={i} className="border rounded p-2 mb-2">
                      <div className="fw-semibold mb-1">
                        Unit {String(i + 1).padStart(2, "0")}
                      </div>

                      {SHEET_TYPES.map((s) => (
                        <Row key={s.id} className="g-2 align-items-center mb-1">
                          <Col xs={7}>
                            {s.label} (₹{s.price} / sheet)
                          </Col>
                          <Col
                            xs={5}
                            className="d-flex align-items-center gap-2"
                          >
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() =>
                                setForm((f) => {
                                  const arr = [...f.extrasPerUnit];
                                  const cur = arr[i] || {};
                                  arr[i] = {
                                    ...cur,
                                    [s.id]: Math.max(0, (cur[s.id] || 0) - 1),
                                  };
                                  return { ...f, extrasPerUnit: arr };
                                })
                              }
                            >
                              −
                            </Button>
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              value={form.extrasPerUnit[i]?.[s.id] ?? 0}
                              onChange={(e) =>
                                setForm((f) => {
                                  const arr = [...f.extrasPerUnit];
                                  const cur = arr[i] || {};
                                  arr[i] = {
                                    ...cur,
                                    [s.id]: Math.max(
                                      0,
                                      Number(e.target.value) || 0
                                    ),
                                  };
                                  return { ...f, extrasPerUnit: arr };
                                })
                              }
                              style={{ maxWidth: 90 }}
                            />
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() =>
                                setForm((f) => {
                                  const arr = [...f.extrasPerUnit];
                                  const cur = arr[i] || {};
                                  arr[i] = {
                                    ...cur,
                                    [s.id]: (cur[s.id] || 0) + 1,
                                  };
                                  return { ...f, extrasPerUnit: arr };
                                })
                              }
                            >
                              +
                            </Button>
                          </Col>
                        </Row>
                      ))}

                      <div className="mt-1 text-muted">
                        Album-only for this unit: ₹
                        {calculatePrices.perUnitPrices[
                          i
                        ]?.unitPrice.toLocaleString()}
                        <br />
                        Final for this unit (incl. box): ₹
                        {calculatePrices.perUnitPrices[
                          i
                        ]?.unitTotal.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Collapse>
        </Form>

        {/* Total Price Summary */}
        <div className="mt-3 p-2 bg-light rounded">
          <div className="fw-semibold">Price Summary</div>
          <div>
            Total: ₹{calculatePrices.finalTotal.toLocaleString()}
            {qtyNum > 1 && (
              <span className="text-muted">
                {" "}
                (₹{calculatePrices.unitTotal.toLocaleString()} × {qtyNum})
              </span>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="dark" onClick={handleConfirm} disabled={saving}>
          {saving
            ? isEdit
              ? "Saving..."
              : "Adding..."
            : isEdit
            ? "Save changes"
            : "Add"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddAlbumModal;
