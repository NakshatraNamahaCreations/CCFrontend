// // src/pages/PostProduction/modals/ViewEditingTaskModal.jsx
// import React from "react";
// import { Modal, Row, Col, Badge } from "react-bootstrap";
// import dayjs from "dayjs";

// const ViewEditingTaskModal = ({ show, onClose, selectedSortedTask }) => {
//   const task = selectedSortedTask?.editingTask;

//   return (
//     <Modal show={show} onHide={onClose} centered size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title>Editing Task Details</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {task ? (
//           <Row>
//             <Col md={6}>
//               <p>
//                 <strong>Package:</strong> {selectedSortedTask.event || "—"}
//               </p>
//               <p>
//                 <strong>Service:</strong> {selectedSortedTask.service || "—"}
//               </p>
//               <p>
//                 <strong>Vendor:</strong> {task.vendorName || "—"}
//               </p>
//               <p>
//                 <strong>Status:</strong>{" "}
//                 <Badge bg={task.status === "Completed" ? "success" : "warning"}>
//                   {task.status}
//                 </Badge>
//               </p>
//             </Col>

//             <Col md={6}>
//               <p>
//                 <strong>Assigned Date:</strong>{" "}
//                 {dayjs(task.assignedDate).format("DD MMM YYYY")}
//               </p>
//               <p>
//                 <strong>Completion Date:</strong>{" "}
//                 {dayjs(task.completionDate).format("DD MMM YYYY")}
//               </p>
//               {task.submittedDate && (
//                 <p>
//                   <strong>Submitted Date:</strong>{" "}
//                   {dayjs(task.submittedDate).format("DD MMM YYYY")}
//                 </p>
//               )}
//             </Col>

//             <Col md={12} className="mt-3">
//               <p>
//                 <strong>Task Description:</strong>
//               </p>
//               <div className="border p-2 rounded bg-light">{task.taskDescription || "—"}</div>
//             </Col>

//             <Col md={12} className="mt-3">
//               <p>
//                 <strong>Assigned Work:</strong>
//               </p>
//               <div className="border p-2 rounded bg-light">
//                 {selectedSortedTask.taskType === "photo" ? (
//                   <span className="text-success fw-bold">
//                     {task.assignedPhotosToEdit} Photos
//                   </span>
//                 ) : (
//                   <>
//                     <span className="text-info fw-bold">
//                       {task.totalClipsAssigned} Clips
//                     </span>
//                     {task.finalVideoDuration && (
//                       <span className="ms-3 text-primary fw-bold">
//                         Duration: {task.finalVideoDuration}
//                       </span>
//                     )}
//                   </>
//                 )}
//               </div>
//             </Col>

//             {task.submittedNotes && (
//               <Col md={12} className="mt-3">
//                 <p>
//                   <strong>Submission Notes:</strong>
//                 </p>
//                 <div className="border p-2 rounded bg-light">{task.submittedNotes}</div>
//               </Col>
//             )}
//           </Row>
//         ) : (
//           <div className="text-center text-muted py-3">No task details available.</div>
//         )}
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default ViewEditingTaskModal;


// src/pages/PostProduction/modals/ViewEditingTaskModal.jsx

import React, { useMemo } from "react";
import { Modal, Row, Col, Badge } from "react-bootstrap";
import dayjs from "dayjs";

const ViewEditingTaskModal = ({ show, onClose, selectedSortedTask }) => {
  const task = selectedSortedTask?.editingTask;
  const isPhoto = selectedSortedTask?.taskType === "photo";

 const { isOnTime, statusLabel, subLabel } = useMemo(() => {
  try {
    if (!task?.completionDate || !task?.submittedDate) {
      return {
        isOnTime: false,
        statusLabel: "Deadline Status",
        subLabel: "Submitted date not available",
      };
    }

    // ✅ deadline considered till end of day
    const deadline = dayjs(task.completionDate).endOf("day");
    const submitted = dayjs(task.submittedDate).endOf("day");

    const onTime = submitted.isSame(deadline) || submitted.isBefore(deadline);

    // ✅ day difference (rounded to whole days)
    const diffDays = submitted.diff(deadline, "day"); // >0 = late, <0 = early, 0 = same day

    let sub = "On the deadline day";
    if (diffDays > 0) sub = `Late by ${diffDays} day${diffDays > 1 ? "s" : ""}`;
    if (diffDays < 0) {
      const early = Math.abs(diffDays);
      sub = `Within deadline (${early} day${early > 1 ? "s" : ""} early)`;
    }

    return {
      isOnTime: onTime,
      statusLabel: onTime ? "Submitted On Time" : "Submitted Late",
      subLabel: sub,
    };
  } catch (e) {
    return {
      isOnTime: false,
      statusLabel: "Deadline Status",
      subLabel: "Unable to calculate",
    };
  }
}, [task]);


  // ✅ submitted counts
  const assignedCount = isPhoto
    ? Number(task?.assignedPhotosToEdit || 0)
    : Number(task?.totalClipsAssigned || 0);

  const submittedCount = isPhoto
    ? Number(task?.submittedPhotosToEdit ?? task?.submittedPhotos ?? 0)
    : Number(task?.submittedVideos ?? task?.submittedClips ?? 0);

  return (
    <Modal show={show} onHide={onClose} centered size="md">
      <Modal.Header closeButton style={{ padding: "10px 14px" }}>
        <Modal.Title style={{ fontSize: "15px", fontWeight: 600 }}>
          Editing Task Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ fontSize: "13px", padding: "12px 14px" }}>
        {task ? (
          <>
            {/* ✅ On-time indicator (like your screenshot) */}
            {task?.completionDate && task?.submittedDate && (
              <div
                className="border rounded mb-3"
                style={{
                  padding: "10px 12px",
                  background: isOnTime ? "#dff3ea" : "#fde2e2",
                  borderColor: isOnTime ? "#8bd6b3" : "#f1a3a3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: isOnTime ? "#1f9d63" : "#d64545",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      lineHeight: 1,
                    }}
                  >
                    {isOnTime ? "✓" : "!"}
                  </div>

                  <div style={{ lineHeight: 1.15 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {statusLabel}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{subLabel}</div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 20,
                    background: isOnTime ? "#1f9d63" : "#d64545",
                    color: "#fff",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isOnTime ? "ON TIME" : "LATE"}
                </div>
              </div>
            )}

            <Row className="g-2">
              <Col md={6}>
                <p className="mb-1">
                  <strong>Package:</strong>{" "}
                  {selectedSortedTask.event ||
                    selectedSortedTask.packageName ||
                    "—"}
                </p>
                <p className="mb-1">
                  <strong>Service:</strong>{" "}
                  {selectedSortedTask.service ||
                    selectedSortedTask.serviceName ||
                    "—"}
                </p>
                <p className="mb-1">
                  <strong>Vendor:</strong> {task.vendorName || "—"}
                </p>
                <p className="mb-0">
                  <strong>Status:</strong>{" "}
                  <Badge bg={task.status === "Completed" ? "success" : "warning"}>
                    {task.status}
                  </Badge>
                </p>
              </Col>

              <Col md={6}>
                <p className="mb-1">
                  <strong>Assigned Date:</strong>{" "}
                  {task.assignedDate
                    ? dayjs(task.assignedDate).format("DD MMM YYYY")
                    : "—"}
                </p>
                <p className="mb-1">
                  <strong>Completion Date:</strong>{" "}
                  {task.completionDate
                    ? dayjs(task.completionDate).format("DD MMM YYYY")
                    : "—"}
                </p>
                {task.submittedDate && (
                  <p className="mb-0">
                    <strong>Submitted Date:</strong>{" "}
                    {dayjs(task.submittedDate).format("DD MMM YYYY")}
                  </p>
                )}
              </Col>

              <Col md={12} className="mt-2">
                <strong>Task Description:</strong>
                <div className="border rounded bg-light p-2 mt-1">
                  {task.taskDescription || "—"}
                </div>
              </Col>

              {/* ✅ Assigned + Submitted work */}
              <Col md={12} className="mt-2">
                <strong>Work Details:</strong>
                <div className="border rounded bg-light p-2 mt-1">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <span className="text-muted">Assigned:</span>{" "}
                      <span className={isPhoto ? "text-success fw-bold" : "text-info fw-bold"}>
                        {assignedCount} {isPhoto ? "Photos" : "Clips"}
                      </span>
                      {!isPhoto && task.finalVideoDuration && (
                        <span className="ms-2 text-primary fw-bold">
                          ({task.finalVideoDuration})
                        </span>
                      )}
                    </div>

                    {/* ✅ show submitted count only when completed OR when submitted value exists */}
                    {(task.status === "Completed" || submittedCount > 0) && isPhoto && (
                      <div>
                        <span className="text-muted">Submitted:</span>{" "}
                        <span className="fw-bold">
                          {submittedCount}  Photos
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Col>

              {task.submittedNotes && (
                <Col md={12} className="mt-2">
                  <strong>Submission Notes:</strong>
                  <div className="border rounded bg-light p-2 mt-1">
                    {task.submittedNotes}
                  </div>
                </Col>
              )}
            </Row>
          </>
        ) : (
          <div className="text-center text-muted py-3">
            No task details available.
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ViewEditingTaskModal;
