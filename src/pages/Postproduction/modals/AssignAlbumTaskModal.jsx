import React from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import Select from "react-select";

const AssignAlbumTaskModal = ({
  show,
  onClose,
  vendors,
  stage,
  setStage,
  assignData,
  setAssignData,
  handleAssign,
}) => {
  const stages = [
    { value: "Selection", label: "Photo Selection" },
    { value: "Editing", label: "Album Editing" },
    { value: "Printing", label: "Printing" },
  ];

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign Album Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Label>Stage</Form.Label>
            <Select
              options={stages}
              value={stages.find((s) => s.value === stage)}
              onChange={(opt) => setStage(opt.value)}
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Label>Vendor</Form.Label>
            <Select
              options={vendors.map((v) => ({
                value: v._id,
                label: v.name,
              }))}
              onChange={(opt) =>
                setAssignData({ ...assignData, vendorId: opt.value })
              }
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Label>Task Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={assignData.taskDescription}
              onChange={(e) =>
                setAssignData({
                  ...assignData,
                  taskDescription: e.target.value,
                })
              }
            />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Form.Label>Assigned Date</Form.Label>
            <Form.Control
              type="date"
              value={assignData.assignedDate}
              onChange={(e) =>
                setAssignData({
                  ...assignData,
                  assignedDate: e.target.value,
                })
              }
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAssign}>
          Assign Task
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignAlbumTaskModal;
