import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Card,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FaTasks, FaEye } from "react-icons/fa";

const EventServicesTable = () => {
  const location = useLocation();
  const { eventId, eventName, totalPhotos, totalVideos, quotationId } =
    location.state || {};
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [taskDetails, setTaskDetails] = useState({
    vendorId: "",
    taskDescription: "",
    completionDate: "",
    numPhotos: "",
    numVideos: "",
  });

  const [assignedCounts, setAssignedCounts] = useState({
    assignedPhotos: 0,
    assignedVideos: 0,
  });

  // ✅ Fetch vendors
  const fetchVendors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/vendors/inhouse/available"
      );
      if (res.data.success) setVendors(res.data.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  // ✅ Fetch assigned counts
  const fetchAssignedCounts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/task/assigned-counts",
        {
          params: {
            quotationId,
            eventId,
          },
        }
      );
      if (res.data.success) {
        setAssignedCounts(res.data.data);
      } else {
        setAssignedCounts({ assignedPhotos: 0, assignedVideos: 0 });
      }
    } catch (error) {
      console.error("Error fetching assigned counts:", error);
      setAssignedCounts({ assignedPhotos: 0, assignedVideos: 0 });
    }
  };

  useEffect(() => {
    if (quotationId && eventId) {
      fetchAssignedCounts();
    }
  }, [quotationId, eventId]);

  const handleOpenModal = (serviceType) => {
    setSelectedService(serviceType);
    setShowModal(true);
    fetchVendors();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTaskDetails({
      vendorId: "",
      taskDescription: "",
      completionDate: "",
      numPhotos: "",
      numVideos: "",
    });
  };

  // ✅ Assign task
  const handleAssignTask = async () => {
    const vendorObj = vendors.find((v) => v._id === taskDetails.vendorId);

    const payload = {
      quotationId,
      eventId,
      eventName,
      totalPhotos,
      totalVideos,
      assignments: [
        {
          serviceName: selectedService,
          vendorId: taskDetails.vendorId,
          vendorName: vendorObj?.name || "",
          taskDescription: taskDetails.taskDescription,
          completionDate: taskDetails.completionDate,
          photosAssigned:
            selectedService !== "Video Editing"
              ? Number(taskDetails.numPhotos) || 0
              : 0,
          videosAssigned:
            selectedService !== "Photo Editing"
              ? Number(taskDetails.numVideos) || 0
              : 0,
        },
      ],
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/task/assign-task",
        payload
      );
      if (res.data.success) {
        alert("Task assigned successfully!");
        handleCloseModal();
        fetchAssignedCounts(); // ✅ Refresh counts
      } else {
        alert(res.data.message || "Failed to assign task");
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to assign task"
      );
    }
  };

  return (
    <div className="container py-4" style={{ fontSize: "13px" }}>
      {eventName && (
        <div className="mb-3">
          <h5>
            Event: <strong>{eventName}</strong>
          </h5>
          <div style={{ fontSize: "14px", marginTop: "5px" }}>
            📷 <strong>Total Photos:</strong> {totalPhotos} | Assigned:{" "}
            {assignedCounts.assignedPhotos || 0} || Remaining : { totalPhotos - assignedCounts.assignedPhotos || 0 }
            <br />
            🎥 <strong>Total Videos:</strong> {totalVideos} | Assigned:{" "}
            {assignedCounts.assignedVideos || 0} || Remaining : { totalVideos - assignedCounts.assignedVideos || 0 }
          </div>
        </div>
      )}

      <Card className="shadow-sm">
        <Card.Header className="fw-bold bg-dark text-white">
          Editing Options
        </Card.Header>
        <Card.Body className="p-0">
          <Table
            bordered
            hover
            responsive
            className="mb-0"
            style={{ textAlign: "center" }}
          >
            <thead className="table-light">
              <tr>
                <th>Sl.No</th>
                <th>Editing Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {["Photo Editing", "Video Editing", "Photo & Video Editing"].map(
                (type, idx) => (
                  <tr key={type}>
                    <td>{String(idx + 1).padStart(2, "0")}</td>
                    <td>{type}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-assign-${idx}`}>
                              Assign Task
                            </Tooltip>
                          }
                        >
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => handleOpenModal(type)}
                          >
                            <FaTasks />
                          </Button>
                        </OverlayTrigger>

                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-view-${idx}`}>
                              View Tasks
                            </Tooltip>
                          }
                        >
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() =>
                              navigate(`/assignments/${eventId}/${type}`)
                            }
                          >
                            <FaEye />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Assign Task Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Assign Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex gap-4">
            <div className="flex-fill">
              <Form.Group className="mb-3">
                <Form.Label>Event Name</Form.Label>
                <Form.Control value={eventName} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Select Vendor</Form.Label>
                <Form.Select
                  value={taskDetails.vendorId}
                  onChange={(e) =>
                    setTaskDetails({ ...taskDetails, vendorId: e.target.value })
                  }
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="flex-fill">
              <Form.Group className="mb-3">
                <Form.Label>Task Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={taskDetails.taskDescription}
                  onChange={(e) =>
                    setTaskDetails({
                      ...taskDetails,
                      taskDescription: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Completion Date</Form.Label>
                <Form.Control
                  type="date"
                  value={taskDetails.completionDate}
                  onChange={(e) =>
                    setTaskDetails({
                      ...taskDetails,
                      completionDate: e.target.value,
                    })
                  }
                />
              </Form.Group>
              {selectedService !== "Video Editing" && (
                <Form.Group className="mb-3">
                  <Form.Label>No. of Photos to Edit</Form.Label>
                  <Form.Control
                    type="number"
                    value={taskDetails.numPhotos}
                    onChange={(e) =>
                      setTaskDetails({
                        ...taskDetails,
                        numPhotos: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              )}
              {selectedService !== "Photo Editing" && (
                <Form.Group className="mb-3">
                  <Form.Label>No. of Videos to Edit</Form.Label>
                  <Form.Control
                    type="number"
                    value={taskDetails.numVideos}
                    onChange={(e) =>
                      setTaskDetails({
                        ...taskDetails,
                        numVideos: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAssignTask}>
            Assign
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EventServicesTable;



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   Table,
//   Button,
//   Card,
//   Modal,
//   Form,
//   OverlayTrigger,
//   Tooltip,
// } from "react-bootstrap";
// import { FaTasks, FaEye } from "react-icons/fa";

// const EventServicesTable = () => {
//   const location = useLocation();
//   const { eventId, eventName, totalPhotos, totalVideos, quotationId } =
//     location.state || {};
//   const navigate = useNavigate();
//   const [vendors, setVendors] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedService, setSelectedService] = useState("");
//   const [taskDetails, setTaskDetails] = useState({
//     vendorId: "",
//     taskDescription: "",
//     completionDate: "",
//     numPhotos: "",
//     numVideos: "",
//   });
//   console.log("quotationId",quotationId)
//   console.log("eventId",eventId)

//   // ✅ Fetch vendors
//   const fetchVendors = async () => {
//     try {
//       const res = await axios.get(
//         "http://localhost:5000/api/vendors/inhouse/available"
//       );
//       if (res.data.success) setVendors(res.data.data);
//     } catch (error) {
//       console.error("Error fetching vendors:", error);
//     }
//   };

//   const handleOpenModal = (serviceType) => {
//     setSelectedService(serviceType);
//     setShowModal(true);
//     fetchVendors();
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setTaskDetails({
//       vendorId: "",
//       taskDescription: "",
//       completionDate: "",
//       numPhotos: "",
//       numVideos: "",
//     });
//   };

//   // ✅ Assign task
//   const handleAssignTask = async () => {
//     const vendorObj = vendors.find((v) => v._id === taskDetails.vendorId);

//     const payload = {
//       quotationId,
//       eventId,
//       eventName,
//       totalPhotos,
//       totalVideos,
//       assignments: [
//         {
//           serviceName: selectedService,
//           vendorId: taskDetails.vendorId,
//           vendorName: vendorObj?.name || "",
//           taskDescription: taskDetails.taskDescription,
//           completionDate: taskDetails.completionDate,
//           photosAssigned:
//             selectedService !== "Video Editing"
//               ? Number(taskDetails.numPhotos) || 0
//               : 0,
//           videosAssigned:
//             selectedService !== "Photo Editing"
//               ? Number(taskDetails.numVideos) || 0
//               : 0,
//         },
//       ],
//     };

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/task/assign-task",
//         payload
//       );
//       if (res.data.success) {
//         alert("Task assigned successfully!");
//         handleCloseModal();
     
//       } else {
//         alert(res.data.message || "Failed to assign task");
//       }
//     } catch (error) {
//       console.error("Error assigning task:", error);

//       // ✅ Show backend error message
//       alert(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to assign task"
//       );
//     }
//   };

//   const handleViewTasks = () => {};

//   return (
//     <div className="container py-4" style={{ fontSize: "13px" }}>
//       {eventName && (
//         <div className="mb-3">
//           <h5>
//             Event: <strong>{eventName}</strong>
//           </h5>
//           <div style={{ fontSize: "14px", marginTop: "5px" }}>
//             📷 <strong>Total Photos:</strong> {totalPhotos}
//             <br />
//             🎥 <strong>Total Videos:</strong> {totalVideos}
//           </div>
//         </div>
//       )}

//       <Card className="shadow-sm">
//         <Card.Header className="fw-bold bg-dark text-white">
//           Editing Options
//         </Card.Header>
//         <Card.Body className="p-0">
//           <Table
//             bordered
//             hover
//             responsive
//             className="mb-0"
//             style={{ textAlign: "center" }}
//           >
//             <thead className="table-light">
//               <tr>
//                 <th>Sl.No</th>
//                 <th>Editing Type</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {["Photo Editing", "Video Editing", "Photo & Video Editing"].map(
//                 (type, idx) => (
//                   <tr key={type}>
//                     <td>{String(idx + 1).padStart(2, "0")}</td>
//                     <td>{type}</td>
//                     <td>
//                       <div className="d-flex justify-content-center gap-2">
//                         <OverlayTrigger
//                           placement="top"
//                           overlay={
//                             <Tooltip id={`tooltip-assign-${idx}`}>
//                               Assign Task
//                             </Tooltip>
//                           }
//                         >
//                           <Button
//                             variant="light"
//                             size="sm"
//                             onClick={() => handleOpenModal(type)}
//                           >
//                             <FaTasks />
//                           </Button>
//                         </OverlayTrigger>

//                         <OverlayTrigger
//                           placement="top"
//                           overlay={
//                             <Tooltip id={`tooltip-view-${idx}`}>
//                               View Tasks
//                             </Tooltip>
//                           }
//                         >
//                           <Button
//                             variant="light"
//                             size="sm"
//                             onClick={() =>
//                               navigate(`/assignments/${eventId}/${type}`)
//                             }
//                           >
//                             <FaEye />
//                           </Button>
//                         </OverlayTrigger>
//                       </div>
//                     </td>
//                   </tr>
//                 )
//               )}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>

//       {/* Assign Task Modal */}
//       <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Assign Task</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="d-flex gap-4">
//             <div className="flex-fill">
//               <Form.Group className="mb-3">
//                 <Form.Label>Event Name</Form.Label>
//                 <Form.Control value={eventName} disabled />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Select Vendor</Form.Label>
//                 <Form.Select
//                   value={taskDetails.vendorId}
//                   onChange={(e) =>
//                     setTaskDetails({ ...taskDetails, vendorId: e.target.value })
//                   }
//                 >
//                   <option value="">Select Vendor</option>
//                   {vendors.map((vendor) => (
//                     <option key={vendor._id} value={vendor._id}>
//                       {vendor.name}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>
//             </div>
//             <div className="flex-fill">
//               <Form.Group className="mb-3">
//                 <Form.Label>Task Description</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={2}
//                   value={taskDetails.taskDescription}
//                   onChange={(e) =>
//                     setTaskDetails({
//                       ...taskDetails,
//                       taskDescription: e.target.value,
//                     })
//                   }
//                 />
//               </Form.Group>
//               <Form.Group className="mb-3">
//                 <Form.Label>Completion Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={taskDetails.completionDate}
//                   onChange={(e) =>
//                     setTaskDetails({
//                       ...taskDetails,
//                       completionDate: e.target.value,
//                     })
//                   }
//                 />
//               </Form.Group>
//               {selectedService !== "Video Editing" && (
//                 <Form.Group className="mb-3">
//                   <Form.Label>No. of Photos to Edit</Form.Label>
//                   <Form.Control
//                     type="number"
//                     value={taskDetails.numPhotos}
//                     onChange={(e) =>
//                       setTaskDetails({
//                         ...taskDetails,
//                         numPhotos: e.target.value,
//                       })
//                     }
//                   />
//                 </Form.Group>
//               )}
//               {selectedService !== "Photo Editing" && (
//                 <Form.Group className="mb-3">
//                   <Form.Label>No. of Videos to Edit</Form.Label>
//                   <Form.Control
//                     type="number"
//                     value={taskDetails.numVideos}
//                     onChange={(e) =>
//                       setTaskDetails({
//                         ...taskDetails,
//                         numVideos: e.target.value,
//                       })
//                     }
//                   />
//                 </Form.Group>
//               )}
//             </div>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleAssignTask}>
//             Assign
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default EventServicesTable;
