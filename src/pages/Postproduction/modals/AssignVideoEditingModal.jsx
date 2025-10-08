// src/pages/PostProduction/modals/AssignVideoEditingModal.jsx
import React from "react";
import { Modal, Row, Col, Button } from "react-bootstrap";
import Select from "react-select";

const AssignVideoEditingModal = ({
  show,
  onClose,
  assignData,
  setAssignData,
  specializationOptions,
  vendors,
  fetchVendorsBySpecialization,
  handleAssignEditingTask,
  selectedSortedTask, // ✅ new prop for showing video count
}) => {
  const totalVideos =
    selectedSortedTask?.sortedVideos ||
    selectedSortedTask?.submittedVideos ||
    0;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Assign Video Editing Task</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* ✅ Summary Section */}
        <div className="border rounded p-2 mb-3 bg-light">
          <p className="mb-1">
            <strong>Package:</strong> {assignData.eventName || "—"}
          </p>
          <p className="mb-1">
            <strong>Service:</strong> {assignData.serviceName || "—"}
          </p>
          <p className="mb-0 text-info fw-bold">
            <strong>Videos to Assign:</strong> {totalVideos}
          </p>
        </div>

        <Row>
          <Col md={6}>
            <label>Specialization</label>
            <Select
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
            <label>Vendor</label>
            <Select
              options={vendors.map((v) => ({ value: v._id, label: v.name }))}
              value={
                vendors.find((v) => v._id === assignData.vendorId)
                  ? {
                      value: assignData.vendorId,
                      label: vendors.find(
                        (v) => v._id === assignData.vendorId
                      )?.name,
                    }
                  : null
              }
              onChange={(s) =>
                setAssignData((p) => ({ ...p, vendorId: s?.value || "" }))
              }
            />
          </Col>
        </Row>

        <div className="mt-3">
          <label>Task Description</label>
          <textarea
            className="form-control"
            rows={2}
            value={assignData.taskDescription}
            onChange={(e) =>
              setAssignData((p) => ({
                ...p,
                taskDescription: e.target.value,
              }))
            }
          />
        </div>

        <div className="mt-3">
          <label>Final Video Duration</label>
          <input
            className="form-control"
            placeholder="e.g., 3–5 mins"
            value={assignData.finalVideoDuration}
            onChange={(e) =>
              setAssignData((p) => ({
                ...p,
                finalVideoDuration: e.target.value,
              }))
            }
          />
        </div>

        <div className="mt-3">
          <label>Completion Date</label>
          <input
            type="date"
            className="form-control"
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

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="success" onClick={() => handleAssignEditingTask(false)}>
          Assign
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignVideoEditingModal;
