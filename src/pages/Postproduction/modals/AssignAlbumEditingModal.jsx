// src/pages/PostProduction/modals/AssignAlbumEditingModal.jsx
import React, { useMemo, useState } from "react";
import { Modal, Row, Col, Button } from "react-bootstrap";
import Select from "react-select";

const AssignAlbumEditingModal = ({
  show,
  onClose,
  album,                // album object from quotation.albums[]
  selectedPhotos,       // number
  specializationOptions,
  vendors,
  fetchVendorsBySpecialization,
  onAssign,             // (payload) => Promise<void>
}) => {
  const [form, setForm] = useState({
    specialization: "",
    vendorId: "",
    taskDescription: "",
  });
  const [busy, setBusy] = useState(false);

  const albumDetails = useMemo(
    () => ({
      templateLabel: album?.snapshot?.templateLabel || "",
      baseSheets: album?.snapshot?.baseSheets || 0,
      basePhotos: album?.snapshot?.basePhotos || 0,
      boxLabel: album?.snapshot?.boxLabel || "",
      qty: album?.qty || 0,
      unitPrice: album?.unitPrice || 0,
    }),
    [album]
  );

  const handleAssign = async () => {
    if (!album?._id) return;
    if (!form.vendorId) return alert("Please select a vendor.");

    const payload = {
      albumId: album._id,
      albumDetails,
      selectedPhotos: Number(selectedPhotos) || 0,
      specialization: form.specialization || "",
      vendorId: form.vendorId,
      taskDescription: form.taskDescription || "",
    };

    try {
      setBusy(true);
      await onAssign(payload);
      onClose();
    } catch (e) {
      // surface any error thrown by onAssign
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to assign album editing task"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Assign Album Editing</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Summary */}
        <div className="border rounded p-2 mb-3 bg-light">
          <p className="mb-1">
            <strong>Album:</strong> {albumDetails.templateLabel || "—"}
          </p>
          <p className="mb-1">
            <strong>Capacity:</strong> {albumDetails.basePhotos} photos •{" "}
            {albumDetails.baseSheets} sheets
          </p>
          <p className="mb-1">
            <strong>Box:</strong> {albumDetails.boxLabel || "Without Box"}
          </p>
          <p className="mb-0 text-success fw-bold">
            <strong>Selected Photos:</strong> {Number(selectedPhotos) || 0}
          </p>
        </div>

        <Row>
          <Col md={6}>
            <label>Specialization</label>
            <Select
              options={specializationOptions}
              value={
                specializationOptions.find(
                  (x) => x.value === form.specialization
                ) || null
              }
              onChange={(s) => {
                const specialization = s?.value || "";
                setForm((p) => ({ ...p, specialization }));
                if (s?.label) fetchVendorsBySpecialization(s.label);
              }}
              isClearable
            />
          </Col>

          <Col md={6}>
            <label>Vendor</label>
            <Select
              options={vendors.map((v) => ({ value: v._id, label: v.name }))}
              value={
                vendors.find((v) => v._id === form.vendorId)
                  ? {
                      value: form.vendorId,
                      label: vendors.find((v) => v._id === form.vendorId)?.name,
                    }
                  : null
              }
              onChange={(s) =>
                setForm((p) => ({ ...p, vendorId: s?.value || "" }))
              }
            />
          </Col>
        </Row>

        <div className="mt-3">
          <label>Task Description</label>
          <textarea
            className="form-control"
            rows={2}
            value={form.taskDescription}
            onChange={(e) =>
              setForm((p) => ({ ...p, taskDescription: e.target.value }))
            }
            placeholder="Any guidance for the designer (styles, themes, do/don'ts)…"
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={handleAssign}
          disabled={busy || !album?._id}
        >
          {busy ? "Assigning…" : "Assign"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignAlbumEditingModal;
