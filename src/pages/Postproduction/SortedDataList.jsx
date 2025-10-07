// // src/pages/PostProduction/SortedDataList.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import {
//   Card,
//   Table,
//   Spinner,
//   Alert,
//   Badge,
//   Button,
//   Modal,
//   Row,
//   Col,
// } from "react-bootstrap";
// import { useParams } from "react-router-dom";
// import dayjs from "dayjs";
// import Select from "react-select";
// import { API_URL } from "../../utils/api";

// const SortedDataList = () => {
//   const { quotationId } = useParams();

//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Assign modal
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showSubmitModal, setShowSubmitModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [assignData, setAssignData] = useState({
//     eventName: "",
//     serviceName: "",
//     vendorId: "",
//     taskDescription: "",
//     completionDate: "",
//   });

//   const [submitData, setSubmitData] = useState({
//     submittedDate: dayjs().format("YYYY-MM-DD"),
//     submittedNotes: "",
//   });
//   const [selectedSortedTask, setSelectedSortedTask] = useState(null);
//   const [vendors, setVendors] = useState([]);
//   const [specializationOptions, setSpecializationOptions] = useState([]);
//   const [filterStatus, setFilterStatus] = useState("All");
//   // ----------------------- Fetch Summary -----------------------
//   const fetchSummary = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const res = await axios.get(
//         `${API_URL}/sorting-task/completed/${quotationId}`
//       );
//       if (!res.data?.success) {
//         setError(res.data?.message || "Failed to fetch summary");
//         return;
//       }
//       setSummary(res.data);
//     } catch (err) {
//       console.error("Error fetching summary:", err);
//       setError(err?.response?.data?.message || "Error fetching data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchServices = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/service/all`);
//       if (res.data.success) {
//         const specialization = res.data.data.map((service) => ({
//           value: service._id,
//           label: service.name,
//         }));

//         // 🔹 Static roles
//         const staticSpecialization = [
//           { value: "candid-photo-editing", label: "Candid photo editing" },
//           {
//             value: "traditional-video-editing",
//             label: "Traditional Video editing",
//           },
//           {
//             value: "traditional-photo-editing",
//             label: "Traditional Photo editing",
//           },
//           { value: "candid-video-editing", label: "Candid Video editing" },
//           { value: "album-designing", label: "Album Designing" },
//           { value: "photo-sorting", label: "Photo sorting" },
//           { value: "video-sorting", label: "Video sorting/Conversion" },
//           { value: "assistant", label: "Assistant" },
//           { value: "driver", label: "Driver" },
//           { value: "cc-admin", label: "CC Admin" },
//           { value: "cr-manager", label: "CR Manager" },
//           { value: "makeup-artist", label: "Make up Artist" },
//           { value: "speakers-audio", label: "Speakers & Audio arrangements" },
//           { value: "album-final-correction", label: "Album final correction" },
//           {
//             value: "photo-colour-correction",
//             label: "Photo colour correction",
//           },
//           { value: "album-photo-selection", label: "Album photo selection" },
//           { value: "video-3d-editing", label: "3D Video editing" },
//           { value: "vr-360-editing", label: "360 degree VR Video editing" },
//           { value: "photo-slideshow", label: "Photo slideshow" },
//           { value: "photo-lamination", label: "Photo lamination & Frame" },
//           { value: "photo-printing-lab", label: "Photo Printing Lab" },
//           { value: "storage-devices", label: "Storage devices" },
//           {
//             value: "marketing-printing",
//             label: "Marketing collaterals Printing",
//           },
//           { value: "uniforms", label: "Uniforms" },
//           { value: "branding-collaterals", label: "Branding collaterals" },
//           { value: "software-hardware", label: "Software & Hardware service" },
//           { value: "supervisor", label: "Supervisor" },
//           { value: "marketing-team", label: "Marketing Team" },
//           { value: "branding-team", label: "Branding Team" },
//         ];

//         // Merge both lists
//         setSpecializationOptions([...specialization, ...staticSpecialization]);
//       }
//     } catch (err) {
//       console.error("Failed to fetch services", err);
//     }
//   };

//   // Fetch vendors based on specialization name
//   const fetchVendorsBySpecialization = async (specializationName) => {
//     if (!specializationName) {
//       setVendors([]);
//       return;
//     }

//     try {
//       const res = await axios.get(
//         `${API_URL}/vendors/specialization/${encodeURIComponent(
//           specializationName
//         )}`
//       );

//       if (res.data?.success && Array.isArray(res.data.data)) {
//         setVendors(res.data.data);
//       } else {
//         setVendors([]);
//         toast.error("No vendors found for this specialization");
//       }
//     } catch (err) {
//       console.error("Error fetching vendors:", err);
//       toast.error("Failed to load vendors for the selected specialization");
//       setVendors([]);
//     }
//   };

//   useEffect(() => {
//     fetchServices();
//   }, []);

//   useEffect(() => {
//     if (quotationId) fetchSummary();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [quotationId]);

//   // -----------------------
//   // Map serviceUnitId → packageName, serviceName
//   // -----------------------
//   const completedSortedTasks = useMemo(() => {
//     if (!summary?.data) return [];

//     // build a map for fallback service details
//     const unitMap = new Map();
//     summary?.collectedData?.serviceUnits?.forEach((u) => {
//       if (u._id) {
//         unitMap.set(u._id, {
//           packageName: u.packageName || "—",
//           serviceName: u.serviceName || "—",
//         });
//       }
//     });

//     // merge fallback names for completed tasks
//     return summary.data
//       .filter((t) => t.status === "Completed")
//       .map((t) => {
//         const fallback = unitMap.get(t.serviceUnitId) || {};
//         return {
//           ...t,
//           packageName: t.packageName || fallback.packageName || "—",
//           serviceName: t.serviceName || fallback.serviceName || "—",
//         };
//       });
//   }, [summary]);

//   // -----------------------
//   // Fetch vendors (optional filtering)
//   // -----------------------
//   const fetchAllVendors = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/vendors`);
//       if (res.data?.success) {
//         setVendors(res.data.data || []);
//       }
//     } catch (err) {
//       console.error("Error fetching vendors:", err);
//     }
//   };

//   // -----------------------
//   // Open Assign Editing Modal
//   // -----------------------
//   const handleAssignTaskForEditing = async (sortedTask) => {
//     try {
//       await fetchAllVendors();

//       setSelectedSortedTask(sortedTask);
//       setAssignData({
//         eventName: sortedTask.packageName || "—",
//         serviceName: sortedTask.serviceName || "—",
//         vendorId: "",
//         taskDescription: "",
//         completionDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
//       });
//       setShowAssignModal(true);
//     } catch (err) {
//       console.error("Error opening assign modal:", err);
//       alert("Failed to open assign modal");
//     }
//   };

//   // -----------------------
//   // Assign Editing Task
//   // -----------------------
//   const handleAssignEditingTask = async () => {
//     try {
//       if (!selectedSortedTask) return;

//       const payload = {
//         quotationId,
//         collectedDataId: summary?.collectedData?._id,
//         serviceUnitId: selectedSortedTask?.serviceUnitId,
//         vendorId: assignData.vendorId,
//         vendorName:
//           vendors.find((v) => v._id === assignData.vendorId)?.name || undefined,
//         taskDescription: assignData.taskDescription,
//         dueDate: assignData.completionDate,
//         packageName: selectedSortedTask?.packageName,
//         serviceName: selectedSortedTask?.serviceName,
//         packageId: selectedSortedTask?.packageId,
//       };

//       await axios.post(`${API_URL}/editing-tasks/assign`, payload);
//       setShowAssignModal(false);
//       await fetchSummary();
//     } catch (err) {
//       console.error("Error assigning editing task:", err);
//       alert(err?.response?.data?.message || "Failed to assign editing task");
//     }
//   };

//   // ----------------------- Submit Editing Task -----------------------
//   const handleOpenSubmitModal = (task) => {
//     setSelectedSortedTask(task);
//     setSubmitData({
//       submittedDate: dayjs().format("YYYY-MM-DD"),
//       submittedNotes: "",
//     });
//     setShowSubmitModal(true);
//   };

//   const handleSubmitEditingTask = async () => {
//     try {
//       const res = await axios.post(
//         `${API_URL}/editing-tasks/${selectedSortedTask._id}/submit`,
//         submitData
//       );
//       if (res.data.success) {
//         toast.success("Task submitted successfully!");
//         setShowSubmitModal(false);
//         fetchSummary();
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(err?.response?.data?.message || "Failed to submit task");
//     }
//   };

//   // ----------------------- View Task Details -----------------------
//   const handleViewTask = (task) => {
//     setSelectedSortedTask(task);
//     setShowViewModal(true);
//   };

//   // -----------------------
//   // Render
//   // -----------------------
//   if (loading) {
//     return (
//       <div className="text-center py-4">
//         <Spinner animation="border" />
//         <div className="mt-2">Loading sorted data...</div>
//       </div>
//     );
//   }

//   if (error) return <Alert variant="danger">{error}</Alert>;
//   if (!summary) return null;

//   const albums = summary?.quotation?.albums || [];

//   return (
//     <>
//       {/* ✅ Customer / Summary Header */}
//       <Card className="shadow-sm mb-4 border-0">
//         <Card.Header
//           className="bg-primary text-white fw-bold"
//           style={{ fontSize: "14px" }}
//         >
//           Customer & Summary
//         </Card.Header>
//         <Card.Body style={{ fontSize: "13px" }}>
//           <Row>
//             <Col md={3}>
//               <div className="mb-2">
//                 <span className="text-muted fw-bold">Quotation ID:</span>
//                 <div className="text-dark">
//                   {summary?.quotation?.quotationId || "—"}
//                 </div>
//               </div>
//             </Col>
//             <Col md={3}>
//               <div className="mb-2">
//                 <span className="text-muted fw-bold">Couple/Person:</span>
//                 <div className="text-dark">
//                   {summary?.collectedData?.personName || "—"}
//                 </div>
//               </div>
//             </Col>
//             <Col md={3}>
//               <div className="mb-2">
//                 <span className="text-muted fw-bold">Total Sorted Photos:</span>
//                 <div className="text-danger fw-bold">
//                   {summary?.totalSortedPhotos || 0}
//                 </div>
//               </div>
//             </Col>
//             <Col md={3}>
//               <div className="mb-2">
//                 <span className="text-muted fw-bold">Total Sorted Videos:</span>
//                 <div className="text-danger fw-bold">
//                   {summary?.totalSortedVideos || 0}
//                 </div>
//               </div>
//             </Col>
//           </Row>

//           {!!summary?.quotation?.quoteNote && (
//             <Row>
//               <Col md={12}>
//                 <span className="text-muted fw-bold">Quote Note:</span>
//                 <div className="fst-italic text-dark">
//                   {summary.quotation.quoteNote}
//                 </div>
//               </Col>
//             </Row>
//           )}
//         </Card.Body>
//       </Card>

//       {/* ✅ Albums Section */}
//       {albums.length > 0 && (
//         <Card className="shadow-sm mb-4 border-0">
//           <Card.Header
//             className="bg-info text-white fw-bold d-flex justify-content-between align-items-center"
//             style={{ fontSize: "14px" }}
//           >
//             <span>Albums Details</span>
//             <Badge bg="light" text="dark" style={{ fontSize: "11px" }}>
//               {albums.length} Album{albums.length > 1 ? "s" : ""}
//             </Badge>
//           </Card.Header>
//           <Card.Body className="p-0">
//             <Table
//               bordered
//               hover
//               responsive
//               className="mb-0"
//               style={{ fontSize: "12px" }}
//             >
//               <thead className="table-light">
//                 <tr>
//                   <th>#</th>
//                   <th>Template</th>
//                   <th>Box</th>
//                   <th className="text-center">Qty</th>
//                   <th className="text-center">Album Unit Price</th>
//                   <th className="text-center">Box / Unit</th>
//                   <th>Extras</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {albums.map((a, idx) => (
//                   <tr key={a._id || idx}>
//                     <td className="text-center">
//                       {String(idx + 1).padStart(2, "0")}
//                     </td>
//                     <td>
//                       {(a?.snapshot?.templateLabel || "Custom") +
//                         ` (${a?.snapshot?.baseSheets || 0} Sheets, ${
//                           a?.snapshot?.basePhotos || 0
//                         } Photos)`}
//                     </td>
//                     <td>{a?.snapshot?.boxLabel || "Without Box"}</td>
//                     <td className="text-center">{a?.qty || 0}</td>
//                     <td className="text-center">
//                       ₹{(a?.unitPrice || 0).toLocaleString()}
//                     </td>
//                     <td className="text-center">
//                       ₹{a?.snapshot?.boxSurchargeAtSave || 0}
//                     </td>
//                     <td style={{ fontSize: "11px" }}>
//                       {a?.extras?.shared
//                         ? `Shared extras: Standard ${a.extras.shared.std}, Special ${a.extras.shared.special}, Embossed ${a.extras.shared.embossed}`
//                         : "No extras"}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           </Card.Body>
//         </Card>
//       )}

//       {/* ✅ Sorted Data (Completed) */}
//       <Card className="shadow-sm mb-4">
//         <Card.Header
//           className="fw-bold bg-dark text-white"
//           style={{ fontSize: "14px" }}
//         >
//           Sorted Data (Completed)
//         </Card.Header>
//         <Card.Body className="p-0">
//           {completedSortedTasks.length > 0 ? (
//             <Table
//               bordered
//               hover
//               responsive
//               className="mb-0"
//               style={{ fontSize: "12px" }}
//             >
//               <thead className="table-light">
//                 <tr>
//                   <th>#</th>
//                   <th>Event</th>
//                   <th>Service</th>
//                   <th className="text-center">Sorted Photos</th>
//                   <th className="text-center">Sorted Videos</th>
//                   <th>Submitted Notes</th>
//                   <th>Vendor</th>
//                   <th>Editing Status</th>
//                   <th className="text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {completedSortedTasks.map((t, idx) => (
//                   <tr key={t._id}>
//                     <td>{String(idx + 1).padStart(2, "0")}</td>
//                     <td>{t.packageName || "—"}</td>
//                     <td>{t.serviceName || "—"}</td>
//                     <td className="text-center text-success fw-bold">
//                       {t.submittedPhotos || 0}
//                     </td>
//                     <td className="text-center text-info fw-bold">
//                       {t.submittedVideos || 0}
//                     </td>
//                     <td style={{ maxWidth: 240 }}>
//                       <small>{t.submittedNotes || "—"}</small>
//                     </td>
//                     <td>{t.vendorName || "—"}</td>
//                     <td>Pending</td>
//                     <td className="text-center">
//                       <Button
//                         variant="outline-secondary"
//                         size="sm"
//                         style={{ fontSize: "11px" }}
//                         onClick={() => handleAssignTaskForEditing(t)}
//                       >
//                         Assign for Editing
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           ) : (
//             <div className="text-center text-muted py-4">
//               No completed sorted tasks yet.
//             </div>
//           )}
//         </Card.Body>
//       </Card>

//       {/* 🧩 Assign Editing Modal */}
//       <Modal
//         show={showAssignModal}
//         onHide={() => setShowAssignModal(false)}
//         centered
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title style={{ fontSize: "16px" }}>
//             Assign Task for Editing
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body style={{ fontSize: "13px" }}>
//           {selectedSortedTask && (
//             <>
//               <Row>
//                 <Col md={6} className="mb-3">
//                   <label className="form-label">Package</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={selectedSortedTask.packageName || "—"}
//                     disabled
//                   />
//                 </Col>
//                 <Col md={6} className="mb-3">
//                   <label className="form-label">Service</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={selectedSortedTask.serviceName || "—"}
//                     disabled
//                   />
//                 </Col>
//                 {selectedSortedTask.submittedPhotos > 0 && (
//                   <Col className="mb-3">
//                     <label className="form-label">Photos</label>
//                     <input
//                       type="number"
//                       className="form-control"
//                       value={selectedSortedTask.submittedPhotos}
//                       disabled
//                     />
//                   </Col>
//                 )}
//                 {selectedSortedTask.submittedVideos > 0 && (
//                   <Col className="mb-3">
//                     <label className="form-label">Photos</label>
//                     <input
//                       type="number"
//                       className="form-control"
//                       value={selectedSortedTask.submittedVideos}
//                       disabled
//                     />
//                   </Col>
//                 )}
//               </Row>

//               {/* <div className="alert alert-info p-2 mb-3">
//                 <small>
//                   <strong>Sorted Data:</strong>{" "}
//                   {selectedSortedTask.submittedPhotos || 0} photos,{" "}
//                   {selectedSortedTask.submittedVideos || 0} videos
//                 </small>
//               </div> */}
//             </>
//           )}

//           <div className="mb-3">
//             <label className="form-label">Select Specialization</label>
//             <Select
//               options={specializationOptions}
//               value={
//                 specializationOptions.find(
//                   (opt) => opt.value === assignData.taskType
//                 ) || null
//               }
//               onChange={async (selected) => {
//                 if (selected) {
//                   // set both value and label for clarity
//                   setAssignData((prev) => ({
//                     ...prev,
//                     taskType: selected.value,
//                     vendorId: "",
//                   }));
//                   // fetch vendors using readable name (label)
//                   await fetchVendorsBySpecialization(selected.label);
//                 } else {
//                   // clear when specialization is removed
//                   setAssignData((prev) => ({
//                     ...prev,
//                     taskType: "",
//                     vendorId: "",
//                   }));
//                   setVendors([]);
//                 }
//               }}
//               placeholder="Select Specialization"
//               isClearable
//             />
//           </div>

//           <div className="mb-3">
//             <label className="form-label">Select Vendor</label>
//             <Select
//               options={vendors.map((v) => ({
//                 value: v._id,
//                 label: v.name,
//               }))}
//               value={
//                 vendors
//                   .map((v) => ({ value: v._id, label: v.name }))
//                   .find((opt) => opt.value === assignData.vendorId) || null
//               }
//               onChange={(selected) =>
//                 setAssignData((prev) => ({
//                   ...prev,
//                   vendorId: selected?.value || "",
//                 }))
//               }
//               placeholder={
//                 assignData.taskType
//                   ? vendors.length
//                     ? "Select Vendor"
//                     : "No vendors found"
//                   : "Select specialization first"
//               }
//               isClearable
//               isDisabled={!assignData.taskType}
//             />
//           </div>

//           {/* <div className="mb-3">
//             <label className="form-label">Select Vendor</label>
//             <Select
//               options={vendors.map((v) => ({ value: v._id, label: v.name }))}
//               value={
//                 vendors
//                   .map((v) => ({ value: v._id, label: v.name }))
//                   .find((opt) => opt.value === assignData.vendorId) || null
//               }
//               onChange={(selected) =>
//                 setAssignData((prev) => ({
//                   ...prev,
//                   vendorId: selected?.value || "",
//                 }))
//               }
//               placeholder="Select Vendor"
//               isClearable
//             />
//           </div> */}

//           <div className="mb-3">
//             <label className="form-label">Editing Task Description</label>
//             <textarea
//               className="form-control"
//               rows="2"
//               value={assignData.taskDescription}
//               onChange={(e) =>
//                 setAssignData((prev) => ({
//                   ...prev,
//                   taskDescription: e.target.value,
//                 }))
//               }
//               placeholder="Describe the editing requirements..."
//             />
//           </div>

//           <div className="mb-3">
//             <label className="form-label">Editing Completion Date</label>
//             <input
//               type="date"
//               className="form-control"
//               value={assignData.completionDate}
//               onChange={(e) =>
//                 setAssignData((prev) => ({
//                   ...prev,
//                   completionDate: e.target.value,
//                 }))
//               }
//               min={dayjs().format("YYYY-MM-DD")}
//             />
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowAssignModal(false)}
//             style={{ fontSize: "13px" }}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="success"
//             onClick={handleAssignEditingTask}
//             style={{ fontSize: "13px" }}
//             disabled={!assignData.vendorId}
//           >
//             Assign for Editing
//           </Button>
//         </Modal.Footer>
//       </Modal>

//             {/* ✅ Submit Modal */}
//       <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Submit Editing Task</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="mb-3">
//             <label>Submitted Date</label>
//             <input
//               type="date"
//               className="form-control"
//               value={submitData.submittedDate}
//               onChange={(e) =>
//                 setSubmitData((prev) => ({ ...prev, submittedDate: e.target.value }))
//               }
//             />
//           </div>
//           <div className="mb-3">
//             <label>Submission Notes</label>
//             <textarea
//               rows={3}
//               className="form-control"
//               value={submitData.submittedNotes}
//               onChange={(e) =>
//                 setSubmitData((prev) => ({ ...prev, submittedNotes: e.target.value }))
//               }
//               placeholder="Add remarks or notes..."
//             />
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmitEditingTask}>
//             Submit
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* ✅ View Modal */}
//       <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>View Completed Task</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedSortedTask && (
//             <>
//               <p><b>Package:</b> {selectedSortedTask.packageName}</p>
//               <p><b>Service:</b> {selectedSortedTask.serviceName}</p>
//               <p><b>Vendor:</b> {selectedSortedTask.editingVendor}</p>
//               <p>
//                 <b>Submitted Date:</b>{" "}
//                 {selectedSortedTask.submittedDate
//                   ? dayjs(selectedSortedTask.submittedDate).format("DD MMM YYYY")
//                   : "—"}
//               </p>
//               <p><b>Notes:</b> {selectedSortedTask.submittedNotes || "No notes available"}</p>
//             </>
//           )}
//         </Modal.Body>
//       </Modal>
//     </>
//   );
// };

// export default SortedDataList;


// src/pages/PostProduction/SortedDataList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Card,
  Table,
  Spinner,
  Alert,
  Badge,
  Button,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import Select from "react-select";
import { API_URL } from "../../utils/api";
import { toast } from "react-toastify";

const SortedDataList = () => {
  const { quotationId } = useParams();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [assignData, setAssignData] = useState({
    eventName: "",
    serviceName: "",
    vendorId: "",
    taskDescription: "",
    completionDate: "",
  });

  const [submitData, setSubmitData] = useState({
    submittedDate: dayjs().format("YYYY-MM-DD"),
    submittedNotes: "",
  });
  const [selectedSortedTask, setSelectedSortedTask] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [editingTasks, setEditingTasks] = useState([]);

  // ----------------------- Fetch Summary -----------------------
  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `${API_URL}/sorting-task/completed/${quotationId}`
      );
      if (!res.data?.success) {
        setError(res.data?.message || "Failed to fetch summary");
        return;
      }
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError(err?.response?.data?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------- Fetch Editing Tasks -----------------------
  const fetchEditingTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/editing-tasks/quotation/${quotationId}`);
      if (res.data?.success) {
        setEditingTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error("Error fetching editing tasks:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/service/all`);
      if (res.data.success) {
        const specialization = res.data.data.map((service) => ({
          value: service._id,
          label: service.name,
        }));

        const staticSpecialization = [
          { value: "candid-photo-editing", label: "Candid photo editing" },
          { value: "traditional-video-editing", label: "Traditional Video editing" },
          { value: "traditional-photo-editing", label: "Traditional Photo editing" },
          { value: "candid-video-editing", label: "Candid Video editing" },
          { value: "album-designing", label: "Album Designing" },
          { value: "photo-sorting", label: "Photo sorting" },
          { value: "video-sorting", label: "Video sorting/Conversion" },
          { value: "assistant", label: "Assistant" },
          { value: "driver", label: "Driver" },
          { value: "cc-admin", label: "CC Admin" },
          { value: "cr-manager", label: "CR Manager" },
          { value: "makeup-artist", label: "Make up Artist" },
          { value: "speakers-audio", label: "Speakers & Audio arrangements" },
          { value: "album-final-correction", label: "Album final correction" },
          { value: "photo-colour-correction", label: "Photo colour correction" },
          { value: "album-photo-selection", label: "Album photo selection" },
          { value: "video-3d-editing", label: "3D Video editing" },
          { value: "vr-360-editing", label: "360 degree VR Video editing" },
          { value: "photo-slideshow", label: "Photo slideshow" },
          { value: "photo-lamination", label: "Photo lamination & Frame" },
          { value: "photo-printing-lab", label: "Photo Printing Lab" },
          { value: "storage-devices", label: "Storage devices" },
          { value: "marketing-printing", label: "Marketing collaterals Printing" },
          { value: "uniforms", label: "Uniforms" },
          { value: "branding-collaterals", label: "Branding collaterals" },
          { value: "software-hardware", label: "Software & Hardware service" },
          { value: "supervisor", label: "Supervisor" },
          { value: "marketing-team", label: "Marketing Team" },
          { value: "branding-team", label: "Branding Team" },
        ];

        setSpecializationOptions([...specialization, ...staticSpecialization]);
      }
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  const fetchVendorsBySpecialization = async (specializationName) => {
    if (!specializationName) {
      setVendors([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/vendors/specialization/${encodeURIComponent(
          specializationName
        )}`
      );

      if (res.data?.success && Array.isArray(res.data.data)) {
        setVendors(res.data.data);
      } else {
        setVendors([]);
        toast.error("No vendors found for this specialization");
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
      toast.error("Failed to load vendors for the selected specialization");
      setVendors([]);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (quotationId) {
      fetchSummary();
      fetchEditingTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId]);

  // ----------------------- Get Editing Status for Sorted Task -----------------------
  const getEditingStatus = (serviceUnitId) => {
    const editingTask = editingTasks.find(task => task.serviceUnitId === serviceUnitId);
    if (!editingTask) return { status: "Not Assigned", task: null };
    return { 
      status: editingTask.status, 
      task: editingTask,
      isCompleted: editingTask.status === "Completed"
    };
  };

  // ----------------------- Completed Sorted Tasks with Editing Status -----------------------
  const completedSortedTasks = useMemo(() => {
    if (!summary?.data) return [];

    const unitMap = new Map();
    summary?.collectedData?.serviceUnits?.forEach((u) => {
      if (u._id) {
        unitMap.set(u._id, {
          packageName: u.packageName || "—",
          serviceName: u.serviceName || "—",
        });
      }
    });

    return summary.data
      .filter((t) => t.status === "Completed")
      .map((t) => {
        const fallback = unitMap.get(t.serviceUnitId) || {};
        const editingStatus = getEditingStatus(t.serviceUnitId);
        
        return {
          ...t,
          packageName: t.packageName || fallback.packageName || "—",
          serviceName: t.serviceName || fallback.serviceName || "—",
          editingStatus: editingStatus.status,
          editingTask: editingStatus.task,
          isEditingCompleted: editingStatus.isCompleted
        };
      });
  }, [summary, editingTasks]);

  // ----------------------- Fetch All Vendors -----------------------
  const fetchAllVendors = async () => {
    try {
      const res = await axios.get(`${API_URL}/vendors`);
      if (res.data?.success) {
        setVendors(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  // ----------------------- Open Assign Modal -----------------------
  const handleAssignTaskForEditing = async (sortedTask) => {
    try {
      await fetchAllVendors();

      setSelectedSortedTask(sortedTask);
      setAssignData({
        eventName: sortedTask.packageName || "—",
        serviceName: sortedTask.serviceName || "—",
        vendorId: "",
        taskDescription: "",
        completionDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
      });
      setShowAssignModal(true);
    } catch (err) {
      console.error("Error opening assign modal:", err);
      alert("Failed to open assign modal");
    }
  };

  // ----------------------- Assign Editing Task -----------------------
  const handleAssignEditingTask = async () => {
    try {
      if (!selectedSortedTask) return;

      const payload = {
        quotationId,
        collectedDataId: summary?.collectedData?._id,
        serviceUnitId: selectedSortedTask?.serviceUnitId,
        vendorId: assignData.vendorId,
        vendorName:
          vendors.find((v) => v._id === assignData.vendorId)?.name || undefined,
        taskDescription: assignData.taskDescription,
        dueDate: assignData.completionDate,
        packageName: selectedSortedTask?.packageName,
        serviceName: selectedSortedTask?.serviceName,
        packageId: selectedSortedTask?.packageId,
        noOfPhotos: selectedSortedTask?.submittedPhotos || 0,
        noOfVideos: selectedSortedTask?.submittedVideos || 0,
      };

      await axios.post(`${API_URL}/editing-tasks/assign`, payload);
      setShowAssignModal(false);
      toast.success("Editing task assigned successfully!");
      await fetchEditingTasks(); // Refresh editing tasks
    } catch (err) {
      console.error("Error assigning editing task:", err);
      toast.error(err?.response?.data?.message || "Failed to assign editing task");
    }
  };

  // ----------------------- Open Submit Modal -----------------------
  const handleOpenSubmitModal = (task) => {
    setSelectedSortedTask(task);
    setSubmitData({
      submittedDate: dayjs().format("YYYY-MM-DD"),
      submittedNotes: task.editingTask?.submittedNotes || "",
    });
    setShowSubmitModal(true);
  };

  // ----------------------- Submit Editing Task -----------------------
  const handleSubmitEditingTask = async () => {
    try {
      if (!selectedSortedTask?.editingTask?._id) {
        toast.error("No editing task found to submit");
        return;
      }

      const res = await axios.post(
        `${API_URL}/editing-tasks/${selectedSortedTask.editingTask._id}/submit`,
        submitData
      );
      if (res.data.success) {
        toast.success("Editing task submitted successfully!");
        setShowSubmitModal(false);
        await fetchEditingTasks(); // Refresh editing tasks
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to submit task");
    }
  };

  // ----------------------- View Editing Task Details -----------------------
  const handleViewTask = async (task) => {
    try {
      if (!task.editingTask?._id) {
        toast.error("No editing task details found");
        return;
      }

      // Fetch full task details
      const res = await axios.get(`${API_URL}/editing-tasks/${task.editingTask._id}`);
      if (res.data.success) {
        setSelectedSortedTask({
          ...task,
          editingTask: res.data.task
        });
        setShowViewModal(true);
      }
    } catch (err) {
      console.error("Error fetching task details:", err);
      toast.error("Failed to load task details");
    }
  };

  // ----------------------- Render Editing Status Badge -----------------------
  const renderEditingStatus = (status) => {
    const statusConfig = {
      "Not Assigned": { variant: "secondary", text: "Not Assigned" },
      "Assigned": { variant: "warning", text: "Assigned" },
      "Completed": { variant: "success", text: "Completed" }
    };

    const config = statusConfig[status] || statusConfig["Not Assigned"];
    
    return (
      <Badge bg={config.variant} className="fw-normal">
        {config.text}
      </Badge>
    );
  };

  // ----------------------- Render Actions -----------------------
  const renderActions = (task) => {
    if (task.editingStatus === "Not Assigned") {
      return (
        <Button
          variant="outline-primary"
          size="sm"
          style={{ fontSize: "11px" }}
          onClick={() => handleAssignTaskForEditing(task)}
        >
          Assign for Editing
        </Button>
      );
    }

    return (
      <div className="d-flex gap-1 justify-content-center">
        {task.editingStatus === "Assigned" && (
          <Button
            variant="outline-success"
            size="sm"
            style={{ fontSize: "11px" }}
            onClick={() => handleOpenSubmitModal(task)}
          >
            Submit Task
          </Button>
        )}
        <Button
          variant="outline-info"
          size="sm"
          style={{ fontSize: "11px" }}
          onClick={() => handleViewTask(task)}
        >
          View Details
        </Button>
      </div>
    );
  };

  // ----------------------- Render -----------------------
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <div className="mt-2">Loading sorted data...</div>
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!summary) return null;

  const albums = summary?.quotation?.albums || [];

  return (
    <>
      {/* Customer / Summary Header */}
      <Card className="shadow-sm mb-4 border-0">
        <Card.Header className="bg-primary text-white fw-bold" style={{ fontSize: "14px" }}>
          Customer & Summary
        </Card.Header>
        <Card.Body style={{ fontSize: "13px" }}>
          <Row>
            <Col md={3}>
              <div className="mb-2">
                <span className="text-muted fw-bold">Quotation ID:</span>
                <div className="text-dark">
                  {summary?.quotation?.quotationId || "—"}
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="mb-2">
                <span className="text-muted fw-bold">Couple/Person:</span>
                <div className="text-dark">
                  {summary?.collectedData?.personName || "—"}
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="mb-2">
                <span className="text-muted fw-bold">Total Sorted Photos:</span>
                <div className="text-danger fw-bold">
                  {summary?.totalSortedPhotos || 0}
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="mb-2">
                <span className="text-muted fw-bold">Total Sorted Videos:</span>
                <div className="text-danger fw-bold">
                  {summary?.totalSortedVideos || 0}
                </div>
              </div>
            </Col>
          </Row>

          {!!summary?.quotation?.quoteNote && (
            <Row>
              <Col md={12}>
                <span className="text-muted fw-bold">Quote Note:</span>
                <div className="fst-italic text-dark">
                  {summary.quotation.quoteNote}
                </div>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Albums Section */}
      {albums.length > 0 && (
        <Card className="shadow-sm mb-4 border-0">
          <Card.Header
            className="bg-info text-white fw-bold d-flex justify-content-between align-items-center"
            style={{ fontSize: "14px" }}
          >
            <span>Albums Details</span>
            <Badge bg="light" text="dark" style={{ fontSize: "11px" }}>
              {albums.length} Album{albums.length > 1 ? "s" : ""}
            </Badge>
          </Card.Header>
          <Card.Body className="p-0">
            <Table bordered hover responsive className="mb-0" style={{ fontSize: "12px" }}>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Template</th>
                  <th>Box</th>
                  <th className="text-center">Qty</th>
                  <th className="text-center">Album Unit Price</th>
                  <th className="text-center">Box / Unit</th>
                  <th>Extras</th>
                </tr>
              </thead>
              <tbody>
                {albums.map((a, idx) => (
                  <tr key={a._id || idx}>
                    <td className="text-center">{String(idx + 1).padStart(2, "0")}</td>
                    <td>
                      {(a?.snapshot?.templateLabel || "Custom") +
                        ` (${a?.snapshot?.baseSheets || 0} Sheets, ${
                          a?.snapshot?.basePhotos || 0
                        } Photos)`}
                    </td>
                    <td>{a?.snapshot?.boxLabel || "Without Box"}</td>
                    <td className="text-center">{a?.qty || 0}</td>
                    <td className="text-center">₹{(a?.unitPrice || 0).toLocaleString()}</td>
                    <td className="text-center">₹{a?.snapshot?.boxSurchargeAtSave || 0}</td>
                    <td style={{ fontSize: "11px" }}>
                      {a?.extras?.shared
                        ? `Shared extras: Standard ${a.extras.shared.std}, Special ${a.extras.shared.special}, Embossed ${a.extras.shared.embossed}`
                        : "No extras"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Sorted Data (Completed) */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="fw-bold bg-dark text-white" style={{ fontSize: "14px" }}>
          Sorted Data (Completed)
        </Card.Header>
        <Card.Body className="p-0">
          {completedSortedTasks.length > 0 ? (
            <Table bordered hover responsive className="mb-0" style={{ fontSize: "12px" }}>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Event</th>
                  <th>Service</th>
                  <th className="text-center">Sorted Photos</th>
                  <th className="text-center">Sorted Videos</th>
                  <th>Submitted Notes</th>
                  <th>Vendor</th>
                  <th>Editing Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedSortedTasks.map((t, idx) => (
                  <tr key={t._id}>
                    <td>{String(idx + 1).padStart(2, "0")}</td>
                    <td>{t.packageName || "—"}</td>
                    <td>{t.serviceName || "—"}</td>
                    <td className="text-center text-success fw-bold">
                      {t.submittedPhotos || 0}
                    </td>
                    <td className="text-center text-info fw-bold">
                      {t.submittedVideos || 0}
                    </td>
                    <td style={{ maxWidth: 240 }}>
                      <small>{t.submittedNotes || "—"}</small>
                    </td>
                    <td>{t.vendorName || "—"}</td>
                    <td>{renderEditingStatus(t.editingStatus)}</td>
                    <td className="text-center">{renderActions(t)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted py-4">No completed sorted tasks yet.</div>
          )}
        </Card.Body>
      </Card>

      {/* Assign Editing Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "16px" }}>Assign Task for Editing</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px" }}>
          {selectedSortedTask && (
            <>
              <Row>
                <Col md={6} className="mb-3">
                  <label className="form-label">Package</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedSortedTask.packageName || "—"}
                    disabled
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label">Service</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedSortedTask.serviceName || "—"}
                    disabled
                  />
                </Col>
                {selectedSortedTask.submittedPhotos > 0 && (
                  <Col className="mb-3">
                    <label className="form-label">Photos</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedSortedTask.submittedPhotos}
                      disabled
                    />
                  </Col>
                )}
                {selectedSortedTask.submittedVideos > 0 && (
                  <Col className="mb-3">
                    <label className="form-label">Videos</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedSortedTask.submittedVideos}
                      disabled
                    />
                  </Col>
                )}
              </Row>
            </>
          )}

          <div className="mb-3">
            <label className="form-label">Select Specialization</label>
            <Select
              options={specializationOptions}
              value={specializationOptions.find((opt) => opt.value === assignData.taskType) || null}
              onChange={async (selected) => {
                if (selected) {
                  setAssignData((prev) => ({
                    ...prev,
                    taskType: selected.value,
                    vendorId: "",
                  }));
                  await fetchVendorsBySpecialization(selected.label);
                } else {
                  setAssignData((prev) => ({
                    ...prev,
                    taskType: "",
                    vendorId: "",
                  }));
                  setVendors([]);
                }
              }}
              placeholder="Select Specialization"
              isClearable
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Select Vendor</label>
            <Select
              options={vendors.map((v) => ({
                value: v._id,
                label: v.name,
              }))}
              value={vendors
                .map((v) => ({ value: v._id, label: v.name }))
                .find((opt) => opt.value === assignData.vendorId) || null}
              onChange={(selected) =>
                setAssignData((prev) => ({
                  ...prev,
                  vendorId: selected?.value || "",
                }))
              }
              placeholder={
                assignData.taskType
                  ? vendors.length
                    ? "Select Vendor"
                    : "No vendors found"
                  : "Select specialization first"
              }
              isClearable
              isDisabled={!assignData.taskType}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Editing Task Description</label>
            <textarea
              className="form-control"
              rows="2"
              value={assignData.taskDescription}
              onChange={(e) =>
                setAssignData((prev) => ({
                  ...prev,
                  taskDescription: e.target.value,
                }))
              }
              placeholder="Describe the editing requirements..."
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Editing Completion Date</label>
            <input
              type="date"
              className="form-control"
              value={assignData.completionDate}
              onChange={(e) =>
                setAssignData((prev) => ({
                  ...prev,
                  completionDate: e.target.value,
                }))
              }
              min={dayjs().format("YYYY-MM-DD")}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)} style={{ fontSize: "13px" }}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleAssignEditingTask}
            style={{ fontSize: "13px" }}
            disabled={!assignData.vendorId}
          >
            Assign for Editing
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Submit Editing Task Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Submit Editing Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSortedTask && (
            <div className="mb-3">
              <p><strong>Package:</strong> {selectedSortedTask.packageName}</p>
              <p><strong>Service:</strong> {selectedSortedTask.serviceName}</p>
              <p><strong>Vendor:</strong> {selectedSortedTask.editingTask?.vendorName}</p>
              <p><strong>Task Description:</strong> {selectedSortedTask.editingTask?.taskDescription}</p>
            </div>
          )}
          <div className="mb-3">
            <label>Submitted Date</label>
            <input
              type="date"
              className="form-control"
              value={submitData.submittedDate}
              onChange={(e) =>
                setSubmitData((prev) => ({ ...prev, submittedDate: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label>Submission Notes</label>
            <textarea
              rows={3}
              className="form-control"
              value={submitData.submittedNotes}
              onChange={(e) =>
                setSubmitData((prev) => ({ ...prev, submittedNotes: e.target.value }))
              }
              placeholder="Add remarks or notes..."
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmitEditingTask}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Editing Task Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editing Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSortedTask?.editingTask && (
            <Row>
              <Col md={6}>
                <p><strong>Package:</strong> {selectedSortedTask.packageName}</p>
                <p><strong>Service:</strong> {selectedSortedTask.serviceName}</p>
                <p><strong>Vendor:</strong> {selectedSortedTask.editingTask.vendorName}</p>
                <p><strong>Status:</strong> 
                  <Badge 
                    bg={selectedSortedTask.editingTask.status === "Completed" ? "success" : "warning"} 
                    className="ms-2"
                  >
                    {selectedSortedTask.editingTask.status}
                  </Badge>
                </p>
              </Col>
              <Col md={6}>
                <p><strong>Assigned Date:</strong> {dayjs(selectedSortedTask.editingTask.assignedDate).format("DD MMM YYYY")}</p>
                <p><strong>Completion Date:</strong> {dayjs(selectedSortedTask.editingTask.completionDate).format("DD MMM YYYY")}</p>
                {selectedSortedTask.editingTask.submittedDate && (
                  <p><strong>Submitted Date:</strong> {dayjs(selectedSortedTask.editingTask.submittedDate).format("DD MMM YYYY")}</p>
                )}
              </Col>
              <Col md={12} className="mt-3">
                <p><strong>Task Description:</strong></p>
                <div className="border p-2 rounded bg-light">
                  {selectedSortedTask.editingTask.taskDescription || "No description provided"}
                </div>
              </Col>
              <Col md={12} className="mt-3">
                <p><strong>Media Count:</strong></p>
                <div className="d-flex gap-3">
                  {selectedSortedTask.editingTask.noOfPhotos > 0 && (
                    <span className="text-success fw-bold">{selectedSortedTask.editingTask.noOfPhotos} Photos</span>
                  )}
                  {selectedSortedTask.editingTask.noOfVideos > 0 && (
                    <span className="text-info fw-bold">{selectedSortedTask.editingTask.noOfVideos} Videos</span>
                  )}
                </div>
              </Col>
              {selectedSortedTask.editingTask.submittedNotes && (
                <Col md={12} className="mt-3">
                  <p><strong>Submission Notes:</strong></p>
                  <div className="border p-2 rounded bg-light">
                    {selectedSortedTask.editingTask.submittedNotes}
                  </div>
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SortedDataList;