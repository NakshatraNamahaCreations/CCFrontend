// // src/pages/PostProduction/modals/SubmitEditingTaskModal.jsx
// import React from "react";
// import { Modal, Button } from "react-bootstrap";

// const SubmitEditingTaskModal = ({
//   show,
//   onClose,
//   selectedSortedTask,
//   submitData,
//   setSubmitData,
//   handleSubmitEditingTask,
// }) => (
//   <Modal show={show} onHide={onClose} centered>
//     <Modal.Header closeButton>
//       <Modal.Title>Submit Editing Task</Modal.Title>
//     </Modal.Header>
//     <Modal.Body>
//       {selectedSortedTask?.editingTask && (
//         <div className="border rounded p-2 mb-3 bg-light">
//           {selectedSortedTask.taskType === "photo" ? (
//             <p>
//               <strong>Assigned Photos:</strong>{" "}
//               {selectedSortedTask.editingTask.assignedPhotosToEdit || 0}
//             </p>
//           ) : (
//             <>
//               <p>
//                 <strong>Assigned Videos:</strong>{" "}
//                 {selectedSortedTask.editingTask.totalClipsAssigned || 0}
//               </p>
//               {selectedSortedTask.editingTask.finalVideoDuration && (
//                 <p>
//                   <strong>Final Duration:</strong>{" "}
//                   {selectedSortedTask.editingTask.finalVideoDuration}
//                 </p>
//               )}
//             </>
//           )}
//         </div>
//       )}

//       <div className="mb-3">
//         <label className="fw-bold">Submitted Date</label>
//         <input
//           type="date"
//           className="form-control"
//           value={submitData.submittedDate}
//           onChange={(e) =>
//             setSubmitData((prev) => ({
//               ...prev,
//               submittedDate: e.target.value,
//             }))
//           }
//         />
//       </div>

//       <div className="mb-3">
//         <label className="fw-bold">Submission Notes</label>
//         <textarea
//           rows={4}
//           className="form-control"
//           placeholder="Add remarks or notes..."
//           value={submitData.submittedNotes}
//           onChange={(e) =>
//             setSubmitData((prev) => ({
//               ...prev,
//               submittedNotes: e.target.value,
//             }))
//           }
//         />
//       </div>
//     </Modal.Body>
//     <Modal.Footer>
//       <Button variant="secondary" onClick={onClose}>
//         Cancel
//       </Button>
//       <Button variant="success" onClick={handleSubmitEditingTask}>
//         Submit
//       </Button>
//     </Modal.Footer>
//   </Modal>
// );

// export default SubmitEditingTaskModal;

// src/pages/PostProduction/modals/SubmitEditingTaskModal.jsx
import React, { useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const asNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const SubmitEditingTaskModal = ({
  show,
  onClose,
  selectedSortedTask,
  submitData,
  setSubmitData,
  handleSubmitEditingTask,
}) => {
  const task = selectedSortedTask?.editingTask;
  const isPhoto = selectedSortedTask?.taskType === "photo";

  // ✅ Prefill submitting count when modal opens / task changes
  useEffect(() => {
    try {
      if (!show || !task) return;

      if (isPhoto) {
        const assigned = asNum(task.assignedPhotosToEdit || 0);
        setSubmitData((p) => ({
          ...p,
          submittingCount:
            p?.submittingCount === undefined || p?.submittingCount === ""
              ? assigned
              : p.submittingCount,
        }));
      } else {
        const assigned = asNum(task.totalClipsAssigned || 0);
        setSubmitData((p) => ({
          ...p,
          submittingCount:
            p?.submittingCount === undefined || p?.submittingCount === ""
              ? assigned
              : p.submittingCount,
        }));
      }
    } catch (e) {
      // no-op
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, task?._id, isPhoto]);

  return (
    <Modal show={show} onHide={onClose} centered size="md">
      <Modal.Header closeButton style={{ padding: "10px 14px" }}>
        <Modal.Title style={{ fontSize: "15px", fontWeight: 600 }}>
          Submit Editing Task
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ fontSize: "13px", padding: "12px 14px" }}>
        {task ? (
          <div className="border rounded bg-light p-2 mb-3">
          { isPhoto &&  <div className="d-flex align-items-center justify-content-between gap-2">
              <div style={{ width: 180 }}>
                <Form.Label className="fw-bold mb-1">
                  {" "}
                  Submitting Photos
                </Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  min={0}
                  value={submitData?.submittingCount ?? ""}
                  onChange={(e) =>
                    setSubmitData((prev) => ({
                      ...prev,
                      submittingCount: e.target.value,
                    }))
                  }
                />
                <div className="form-text" style={{ fontSize: "11px" }}>
                  Assigned:{" "}
                  <strong>
                    { asNum(task.assignedPhotosToEdit || 0)}
                  </strong>
                </div>
              </div>
            </div>}

            {!isPhoto && task.finalVideoDuration && (
              <div className="mt-2">
                <strong>Final Duration:</strong> {task.finalVideoDuration}
              </div>
            )}
          </div>
        ) : null}

        <div className="mb-3">
          <Form.Label className="fw-bold mb-1">Submitted Date</Form.Label>
          <Form.Control
            type="date"
            size="sm"
            value={submitData.submittedDate}
            onChange={(e) =>
              setSubmitData((prev) => ({
                ...prev,
                submittedDate: e.target.value,
              }))
            }
          />
        </div>

        <div className="mb-2">
          <Form.Label className="fw-bold mb-1">Submission Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
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

      <Modal.Footer style={{ padding: "10px 14px" }}>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" variant="success" onClick={handleSubmitEditingTask}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubmitEditingTaskModal;
