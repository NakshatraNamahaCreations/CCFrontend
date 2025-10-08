// src/pages/PostProduction/modals/ViewEditingTaskModal.jsx
import React from "react";
import { Modal, Row, Col, Badge } from "react-bootstrap";
import dayjs from "dayjs";

const ViewEditingTaskModal = ({ show, onClose, selectedSortedTask }) => {
  const task = selectedSortedTask?.editingTask;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editing Task Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {task ? (
          <Row>
            <Col md={6}>
              <p>
                <strong>Package:</strong> {selectedSortedTask.event || "—"}
              </p>
              <p>
                <strong>Service:</strong> {selectedSortedTask.service || "—"}
              </p>
              <p>
                <strong>Vendor:</strong> {task.vendorName || "—"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge bg={task.status === "Completed" ? "success" : "warning"}>
                  {task.status}
                </Badge>
              </p>
            </Col>

            <Col md={6}>
              <p>
                <strong>Assigned Date:</strong>{" "}
                {dayjs(task.assignedDate).format("DD MMM YYYY")}
              </p>
              <p>
                <strong>Completion Date:</strong>{" "}
                {dayjs(task.completionDate).format("DD MMM YYYY")}
              </p>
              {task.submittedDate && (
                <p>
                  <strong>Submitted Date:</strong>{" "}
                  {dayjs(task.submittedDate).format("DD MMM YYYY")}
                </p>
              )}
            </Col>

            <Col md={12} className="mt-3">
              <p>
                <strong>Task Description:</strong>
              </p>
              <div className="border p-2 rounded bg-light">{task.taskDescription || "—"}</div>
            </Col>

            <Col md={12} className="mt-3">
              <p>
                <strong>Assigned Work:</strong>
              </p>
              <div className="border p-2 rounded bg-light">
                {selectedSortedTask.taskType === "photo" ? (
                  <span className="text-success fw-bold">
                    {task.assignedPhotosToEdit} Photos
                  </span>
                ) : (
                  <>
                    <span className="text-info fw-bold">
                      {task.totalClipsAssigned} Clips
                    </span>
                    {task.finalVideoDuration && (
                      <span className="ms-3 text-primary fw-bold">
                        Duration: {task.finalVideoDuration}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Col>

            {task.submittedNotes && (
              <Col md={12} className="mt-3">
                <p>
                  <strong>Submission Notes:</strong>
                </p>
                <div className="border p-2 rounded bg-light">{task.submittedNotes}</div>
              </Col>
            )}
          </Row>
        ) : (
          <div className="text-center text-muted py-3">No task details available.</div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ViewEditingTaskModal;
