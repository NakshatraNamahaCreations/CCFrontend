// src/components/Albums/LocalAddAlbumModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col, Collapse } from "react-bootstrap";

// Reuse the same constants (safe & DRY). If you prefer to avoid importing
// from the API-based modal file, copy them here instead.
import {
    ALBUM_TEMPLATES,
    BOX_TYPES,
    SHEET_TYPES,
} from "./AddAlbumModal";

// ---------- Helpers ----------
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

const templateBasePrice = (templateId) =>
    findTemplate(templateId)?.basePrice || 0;

const boxSurcharge = (boxTypeId) => findBox(boxTypeId)?.surcharge || 0;

const toPlain = (x) => {
    if (!x) return {};
    if (x instanceof Map) return Object.fromEntries(x);
    if (Array.isArray(x)) return Object.fromEntries(x);
    if (typeof x === "object") return { ...x };
    return {};
};

export default function LocalAddAlbumModal({
    show,
    onClose,
    onAdd,           // (albumObj) => void
    onUpdate,        // (albumObj, idx) => void
    mode = "add",    // "add" | "edit"
    initialData = null,
    editIndex = null, // which album index in the list is being edited
    albumType = "quote", // keep for tagging
}) {
    const isEdit = mode === "edit";

    const initFromData = (data) => {
        if (!data) {
            const firstTpl = ALBUM_TEMPLATES[0]?.id || "";
            return {
                templateId: firstTpl,
                boxTypeId: "none",
                qty: "1",
                unitPrice: templateBasePrice(firstTpl), // album-only price
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
            unitPrice: Number(data.unitPrice) || 0,
            showCustomize: !!data.customizePerUnit,
            customizePerUnit,
            extrasShared: !customizePerUnit
                ? data.extras?.shared ?? emptyExtras()
                : emptyExtras(),
            extrasPerUnit: customizePerUnit
                ? (Array.isArray(data.extras?.perUnit) && data.extras.perUnit.length
                    ? data.extras.perUnit.map((m) => ({ ...emptyExtras(), ...toPlain(m) }))
                    : [emptyExtras()])
                : [emptyExtras()],
        };
    };

    const [form, setForm] = useState(initFromData(initialData));

    useEffect(() => {
        if (!show) return;
        setForm(initFromData(initialData));
    }, [show, initialData]);

    const qtyNum = Math.max(1, parseInt(form.qty || "0", 10) || 1);
    const boxPerUnit = boxSurcharge(form.boxTypeId);

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
      

    // Pricing totals for live preview
    const calculatePrices = useMemo(() => {
        const qty = Math.max(1, parseInt(form.qty || "0", 10) || 1);
        const basePrice = Number(form.unitPrice) || 0;

        if (!form.customizePerUnit) {
            const sharedExtrasCost = calcExtrasCost(form.extrasShared);
            const unitPrice = basePrice + sharedExtrasCost;
            const unitTotal = unitPrice + boxPerUnit;
            const finalTotal = unitTotal * qty;
            return {
                unitPrice,
                unitTotal,
                finalTotal,
                perUnitPrices: Array(qty).fill({ unitPrice, unitTotal }),
            };
        } else {
            const perUnitPrices = form.extrasPerUnit.map((extras) => {
                const extrasCost = calcExtrasCost(extras);
                const unitPrice = basePrice + extrasCost;
                const unitTotal = unitPrice + boxPerUnit;
                return { unitPrice, unitTotal };
            });
            const finalTotal = perUnitPrices.reduce((s, p) => s + p.unitTotal, 0);
            return {
                unitPrice: basePrice,
                unitTotal: basePrice + boxPerUnit,
                finalTotal,
                perUnitPrices,
            };
        }
    }, [form.unitPrice, form.qty, form.customizePerUnit, form.extrasShared, form.extrasPerUnit, boxPerUnit]);

    const handleQtyChange = (e) => {
        const v = e.target.value;
        setForm((f) => ({ ...f, qty: v === "" ? "" : v.replace(/[^\d]/g, "") }));
    };
    const normalizeQtyOnBlur = () =>
        setForm((f) => ({
            ...f,
            qty: String(Math.max(1, parseInt(f.qty || "0", 10) || 1)),
        }));

    const handleConfirm = () => {
        // Build an object that MATCHES your AlbumSchema
        const qty = Math.max(1, parseInt(form.qty || "0", 10) || 1);

        // Map extras to schema shapes
        // Keep everything as plain JSON objects. Much safer for UI + JSON serialization.
        const extras =
            form.customizePerUnit
                ? { perUnit: form.extrasPerUnit.map((e) => ({ ...e })) }
                : { shared: { ...form.extrasShared } };
        const snapshot = {
            templateLabel: findTemplate(form.templateId)?.label || "",
            baseSheets: findTemplate(form.templateId)?.baseSheets || 30,
            basePhotos: findTemplate(form.templateId)?.basePhotos || 0,
            boxLabel: findBox(form.boxTypeId)?.label || "",
            boxSurchargeAtSave: boxPerUnit,
            sheetTypes: SHEET_TYPES, // stored for future reference
        };

        const albumObj = {
            // no _id until saved in backend
            templateId: form.templateId,
            boxTypeId: form.boxTypeId,
            qty,
            unitPrice: Number(form.unitPrice) || 0,
            extraSheets: 0, // legacy (kept as 0)
            customizePerUnit: !!form.customizePerUnit,
            extras,
            suggested: {
                albumOnlyPerUnit: calculatePrices.perUnitPrices.map((p) => p.unitPrice),
                boxPerUnit: boxPerUnit,
                finalPerUnit: calculatePrices.perUnitPrices.map((p) => p.unitTotal),
                finalTotal: calculatePrices.finalTotal,
            },
            snapshot,
            type: albumType, // "quote" or whatever tag you want
        };

        if (isEdit) {
            onUpdate?.(albumObj, editIndex);
        } else {
            onAdd?.(albumObj);
        }
        onClose?.();
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
                                    unitPrice: templateBasePrice(e.target.value), // reset album-only price
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
                                    onChange={(e) => setForm((f) => ({ ...f, boxTypeId: e.target.value }))}
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
                                <Form.Label className="fw-semibold">Unit Price (album only)</Form.Label>
                                <Form.Control
                                    size="sm"
                                    type="number"
                                    min="0"
                                    value={form.unitPrice}
                                    onChange={(e) => setForm((f) => ({ ...f, unitPrice: Number(e.target.value) || 0 }))}
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
                            onChange={(e) => setForm((f) => ({ ...f, showCustomize: e.target.checked }))}
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
                                    <div className="fw-semibold mb-2">Extra sheets (applies to every unit)</div>
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
                                                                [s.id]: Math.max(0, (f.extrasShared[s.id] || 0) - 1),
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
                                                                [s.id]: Math.max(0, Number(e.target.value) || 0),
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
                                        Album-only per unit: ₹{calculatePrices.unitPrice.toLocaleString()}
                                        <br />
                                        Final per unit (incl. box): ₹{calculatePrices.unitTotal.toLocaleString()}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-2 border rounded mt-2">
                                    <div className="fw-semibold mb-2">Extra sheets per unit</div>
                                    {Array.from({ length: qtyNum }).map((_, i) => (
                                        <div key={i} className="border rounded p-2 mb-2">
                                            <div className="fw-semibold mb-1">Unit {String(i + 1).padStart(2, "0")}</div>
                                            {SHEET_TYPES.map((s) => (
                                                <Row key={s.id} className="g-2 align-items-center mb-1">
                                                    <Col xs={7}>{s.label} (₹{s.price} / sheet)</Col>
                                                    <Col xs={5} className="d-flex align-items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="light"
                                                            onClick={() =>
                                                                setForm((f) => {
                                                                    const arr = [...f.extrasPerUnit];
                                                                    const cur = arr[i] || {};
                                                                    arr[i] = { ...cur, [s.id]: Math.max(0, (cur[s.id] || 0) - 1) };
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
                                                                        [s.id]: Math.max(0, Number(e.target.value) || 0),
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
                                                                    arr[i] = { ...cur, [s.id]: (cur[s.id] || 0) + 1 };
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
                                                Album-only for this unit: ₹{calculatePrices.perUnitPrices[i]?.unitPrice.toLocaleString()}
                                                <br />
                                                Final for this unit (incl. box): ₹{calculatePrices.perUnitPrices[i]?.unitTotal.toLocaleString()}
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
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="dark" onClick={handleConfirm}>
                    {isEdit ? "Save changes" : "Add"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
