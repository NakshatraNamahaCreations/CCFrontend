// src/pages/PostProduction/modals/SubmitEditingTaskModal.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";

const SubmitEditingTaskModal = ({
  show,
  onClose,
  selectedSortedTask,
  submitData,
  setSubmitData,
  handleSubmitEditingTask,
}) => (
  <Modal show={show} onHide={onClose} centered>
    <Modal.Header closeButton>
      <Modal.Title>Submit Editing Task</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {selectedSortedTask?.editingTask && (
        <div className="border rounded p-2 mb-3 bg-light">
          {selectedSortedTask.taskType === "photo" ? (
            <p>
              <strong>Assigned Photos:</strong>{" "}
              {selectedSortedTask.editingTask.assignedPhotosToEdit || 0}
            </p>
          ) : (
            <>
              <p>
                <strong>Assigned Videos:</strong>{" "}
                {selectedSortedTask.editingTask.totalClipsAssigned || 0}
              </p>
              {selectedSortedTask.editingTask.finalVideoDuration && (
                <p>
                  <strong>Final Duration:</strong>{" "}
                  {selectedSortedTask.editingTask.finalVideoDuration}
                </p>
              )}
            </>
          )}
        </div>
      )}

      <div className="mb-3">
        <label className="fw-bold">Submitted Date</label>
        <input
          type="date"
          className="form-control"
          value={submitData.submittedDate}
          onChange={(e) =>
            setSubmitData((prev) => ({
              ...prev,
              submittedDate: e.target.value,
            }))
          }
        />
      </div>

      <div className="mb-3">
        <label className="fw-bold">Submission Notes</label>
        <textarea
          rows={4}
          className="form-control"
          placeholder="Add remarks or notes..."
          value={submitData.submittedNotes}
          onChange={(e) =>
            setSubmitData((prev) => ({
              ...prev,
              submittedNotes: e.target.value,
            }))
          }
        />
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="success" onClick={handleSubmitEditingTask}>
        Submit
      </Button>
    </Modal.Footer>
  </Modal>
);

export default SubmitEditingTaskModal;
