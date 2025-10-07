// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { Table, Card, Badge, Button } from "react-bootstrap";
// import { FaEye, FaCheck  } from "react-icons/fa";
// import dayjs from "dayjs";
// const AssignedTaskList = () => {
//   const { eventId, serviceName } = useParams();
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchAssignments();
//   }, [eventId, serviceName]);

//   const fetchAssignments = async () => {
//     try {
//       const res = await axios.get(
//         `http://localhost:5000/api/sorting-task/assignments/${eventId}/${encodeURIComponent(serviceName)}`
//       );
//       if (res.data.success) {
//         console.log("ass", res.data.assignments);
//         setAssignments(res.data.assignments);
//       }
//     } catch (error) {
//       console.error("Error fetching assignments:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewDetails = (assignmentId) => {
//     navigate(`/assignment-details/${assignmentId}`);
//   };

//   const showPhotos = serviceName.toLowerCase().includes("photo");
//   const showVideos = serviceName.toLowerCase().includes("video");

//   if (loading) {
//     return <p className="text-center mt-4">Loading assignments...</p>;
//   }

//   return (
//     <div className="container py-4">
//       <Card className="shadow-sm">
//         <Card.Header className="fw-bold bg-dark text-white">
//           Assigned Task for Event - {assignments[0]?.eventName || "N/A"} ({serviceName})
//         </Card.Header>
//         <Card.Body className="p-0">
//           <Table bordered hover responsive className="mb-0" style={{ fontSize: "13px", textAlign: "center" }}>
//             <thead className="table-light">
//               <tr>
//                 <th>Sl.No</th>
//                 <th>Vendor Name</th>
//                 <th>Task Description</th>
//                 {showPhotos && <th>Photos Assigned</th>}
//                 {showVideos && <th>Videos Assigned</th>}
//                 <th>Completion Date</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {assignments.length > 0 ? (
//                 assignments.map((task, index) => (
//                   <tr key={task._id || index}>
//                     <td>{String(index + 1).padStart(2, "0")}</td>
//                     <td>{task.vendorName}</td>
//                     <td>{task.taskDescription}</td>
//                     {showPhotos && <td>{task.photosAssigned}</td>}
//                     {showVideos && <td>{task.videosAssigned}</td>}
//                     <td>{dayjs(task.completionDate).format("DD-MM-YYYY")}</td>
//                     <td>
//                       <Badge
//                         bg={
//                           task.status === "Completed"
//                             ? "success"
//                             : task.status === "InProgress"
//                               ? "warning"
//                               : "secondary"
//                         }
//                       >
//                         {task.status}
//                       </Badge>
//                     </td>
//                     <td>
//                       <Button
//                         variant="light"
//                         size="sm"
//                         onClick={() => handleViewDetails(task._id)}
//                       >
//                         <FaEye />
//                       </Button>
//                       <Button
//                         variant="success"  // Changed from "light" to "success" for better visual indication
//                         size="sm"
//                         // onClick={() => handleSubmitTask(task._id)}
//                         // disabled={task.status === "Completed"} // Disable if already completed
//                       >
//                         <FaCheck /> {/* Changed from FaEye to FaCheck for better icon representation */}
//                         <span className="ms-1">Submit</span> {/* Added text label */}
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={showPhotos && showVideos ? "8" : "7"} className="text-muted">
//                     No assignments found for this event and service.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default AssignedTaskList;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Card, Badge, Button, Modal, Form } from "react-bootstrap";
import { FaEye, FaCheck } from "react-icons/fa";
import dayjs from "dayjs";
import { API_URL } from "../../utils/api";

const AssignedTaskList = () => {
  const { eventId, serviceName } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    photosEdited: 0,
    videosEdited: 0,
    comment: "",
    submissionDate: dayjs().format("YYYY-MM-DD")
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, [eventId, serviceName]);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/sorting-task/assignments/${eventId}/${encodeURIComponent(serviceName)}`
      );
      if (res.data.success) {
        setAssignments(res.data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (assignmentId) => {
    navigate(`/assignment-details/${assignmentId}`);
  };

  const handleOpenSubmitModal = (task) => {
    setCurrentTask(task);
    setSubmissionData({
      photosEdited: 0,
      videosEdited: 0,
      comment: "",
      submissionDate: dayjs().format("YYYY-MM-DD")
    });
    setShowSubmitModal(true);
  };

  const handleCloseSubmitModal = () => {
    setShowSubmitModal(false);
    setCurrentTask(null);
  };

  const handleSubmitTask = async () => {
    if (!currentTask) return;

    // Validate at least photos or videos are submitted
    if (submissionData.photosEdited === 0 && submissionData.videosEdited === 0) {
      alert("Please enter either photos or videos count");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        assignmentId: currentTask._id,
        vendorId: currentTask.vendorId,
        vendorName: currentTask.vendorName,
        photosEdited: Number(submissionData.photosEdited),
        videosEdited: Number(submissionData.videosEdited),
        comment: submissionData.comment
      };

      const response = await axios.post(
        `${API_URL}/task-submission/submit-vendor-progress`,
        payload
      );

      if (response.data.success) {
        alert("Task submitted successfully!");
        fetchAssignments(); // Refresh the assignments list
        handleCloseSubmitModal();
      } else {
        alert(response.data.message || "Failed to submit task");
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      alert(
        error.response?.data?.message ||
        "An error occurred while submitting the task"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPhotos = serviceName.toLowerCase().includes("photo");
  const showVideos = serviceName.toLowerCase().includes("video");

  if (loading) {
    return <p className="text-center mt-4">Loading assignments...</p>;
  }

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Header className="fw-bold bg-dark text-white">
          Assigned Task for Event - {assignments[0]?.eventName || "N/A"} ({serviceName})
        </Card.Header>
        <Card.Body className="p-0">
          <Table bordered hover responsive className="mb-0" style={{ fontSize: "13px", textAlign: "center" }}>
            <thead className="table-light">
              <tr>
                <th>Sl.No</th>
                <th>Vendor Name</th>
                <th>Task Description</th>
                {showPhotos && <th>Photos Assigned</th>}
                {showVideos && <th>Videos Assigned</th>}
                <th>Completion Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? (
                assignments.map((task, index) => (
                  <tr key={task._id || index}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{task.vendorName}</td>
                    <td>{task.taskDescription}</td>
                    {showPhotos && <td>{task.photosAssigned}</td>}
                    {showVideos && <td>{task.videosAssigned}</td>}
                    <td>{dayjs(task.completionDate).format("DD-MM-YYYY")}</td>
                    <td>
                      <Badge
                        bg={
                          task.status === "Completed"
                            ? "success"
                            : task.status === "InProgress"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {task.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => handleViewDetails(task._id)}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant={task.status === "Completed" ? "outline-success" : "success"}
                          size="sm"
                          onClick={() => handleOpenSubmitModal(task)}
                          disabled={task.status === "Completed"}
                        >
                          <FaCheck />
                          <span className="ms-1 d-none d-sm-inline">Submit</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showPhotos && showVideos ? "8" : "7"} className="text-muted">
                    No assignments found for this event and service.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Submission Modal */}
      <Modal show={showSubmitModal} onHide={handleCloseSubmitModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Submit Task Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Vendor Name</Form.Label>
              <Form.Control 
                type="text" 
                value={currentTask?.vendorName || ""} 
                readOnly 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Submission Date</Form.Label>
              <Form.Control
                type="date"
                value={submissionData.submissionDate}
                onChange={(e) => 
                  setSubmissionData({...submissionData, submissionDate: e.target.value})
                }
              />
            </Form.Group>

            {showPhotos && (
              <Form.Group className="mb-3">
                <Form.Label>Number of Photos Edited</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max={currentTask?.photosAssigned || 0}
                  value={submissionData.photosEdited}
                  onChange={(e) => 
                    setSubmissionData({...submissionData, photosEdited: e.target.value})
                  }
                />
                <Form.Text className="text-muted">
                  Assigned: {currentTask?.photosAssigned || 0}
                </Form.Text>
              </Form.Group>
            )}

            {showVideos && (
              <Form.Group className="mb-3">
                <Form.Label>Number of Videos Edited</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max={currentTask?.videosAssigned || 0}
                  value={submissionData.videosEdited}
                  onChange={(e) => 
                    setSubmissionData({...submissionData, videosEdited: e.target.value})
                  }
                />
                <Form.Text className="text-muted">
                  Assigned: {currentTask?.videosAssigned || 0}
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={submissionData.comment}
                onChange={(e) => 
                  setSubmissionData({...submissionData, comment: e.target.value})
                }
                placeholder="Any additional comments about the submission..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSubmitModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitTask}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Progress"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssignedTaskList;