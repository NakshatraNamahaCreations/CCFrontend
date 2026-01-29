// src/pages/PostProduction/modals/AssignPhotoEditingModal.jsx
import React from "react";
import { Modal, Row, Col, Button, Form } from "react-bootstrap";
import Select from "react-select";

const AssignPhotoEditingModal = ({
  show,
  onClose,
  assignData,
  setAssignData,
  specializationOptions,
  vendors,
  fetchVendorsBySpecialization,
  handleAssignEditingTask,
  selectedSortedTask,
}) => {
  const totalPhotos =
    selectedSortedTask?.sortedPhotos ||
    selectedSortedTask?.submittedPhotos ||
    0;

  // ✅ Smaller react-select style
  const smallSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 34,
      height: 34,
      fontSize: 13,
      borderColor: state.isFocused ? base.borderColor : base.borderColor,
      boxShadow: "none",
    }),
    valueContainer: (base) => ({
      ...base,
      height: 34,
      padding: "0 10px",
    }),
    input: (base) => ({ ...base, margin: 0, padding: 0 }),
    indicatorsContainer: (base) => ({ ...base, height: 34 }),
    option: (base) => ({ ...base, fontSize: 13, padding: "8px 10px" }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <Modal show={show} onHide={onClose} centered size="md">
      <Modal.Header closeButton style={{ padding: "10px 14px" }}>
        <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>
          Assign Photo Editing Task
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "12px 14px" }}>
        {/* ✅ Compact Summary */}
        <div
          className="border rounded bg-light"
          style={{ padding: "8px 10px", marginBottom: 10, fontSize: 13 }}
        >
          <div className="d-flex justify-content-between gap-2">
            <div className="text-truncate">
              <strong>Package:</strong> {assignData.eventName || "—"}
            </div>
            <div className="text-success fw-bold">
              <strong>Photos:</strong> {totalPhotos}
            </div>
          </div>
          <div className="text-truncate mt-1">
            <strong>Service:</strong> {assignData.serviceName || "—"}
          </div>
        </div>

        <Row className="g-2">
          <Col md={6}>
            <Form.Label className="mb-1" style={{ fontSize: 12 }}>
              Specialization
            </Form.Label>
            <Select
              styles={smallSelectStyles}
              options={specializationOptions}
              value={
                specializationOptions.find(
                  (x) => x.value === assignData.specialization
                ) || null
              }
              onChange={(s) => {
                setAssignData((p) => ({ ...p, specialization: s?.value || "" }));
                fetchVendorsBySpecialization(s?.label);
              }}
              isClearable
            />
          </Col>

          <Col md={6}>
            <Form.Label className="mb-1" style={{ fontSize: 12 }}>
              Vendor
            </Form.Label>
            <Select
              styles={smallSelectStyles}
              options={vendors.map((v) => ({ value: v._id, label: v.name }))}
              value={
                vendors.find((v) => v._id === assignData.vendorId)
                  ? {
                      value: assignData.vendorId,
                      label: vendors.find((v) => v._id === assignData.vendorId)
                        ?.name,
                    }
                  : null
              }
              onChange={(s) =>
                setAssignData((p) => ({ ...p, vendorId: s?.value || "" }))
              }
            />
          </Col>
        </Row>

        <div className="mt-2">
          <Form.Label className="mb-1" style={{ fontSize: 12 }}>
            Task Description
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            style={{ fontSize: 13, padding: "8px 10px" }}
            value={assignData.taskDescription}
            onChange={(e) =>
              setAssignData((p) => ({
                ...p,
                taskDescription: e.target.value,
              }))
            }
          />
        </div>

        <div className="mt-2">
          <Form.Label className="mb-1" style={{ fontSize: 12 }}>
            Completion Date
          </Form.Label>
          <Form.Control
            type="date"
            size="sm"
            style={{ fontSize: 13, padding: "6px 10px" }}
            value={assignData.completionDate}
            onChange={(e) =>
              setAssignData((p) => ({
                ...p,
                completionDate: e.target.value,
              }))
            }
          />
        </div>
      </Modal.Body>

      <Modal.Footer style={{ padding: "10px 14px" }}>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          variant="success"
          onClick={() => handleAssignEditingTask(true)}
        >
          Assign
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignPhotoEditingModal;
