// // src/pages/PostProduction/modals/AssignVideoEditingModal.jsx
// import React from "react";
// import { Modal, Row, Col, Button } from "react-bootstrap";
// import Select from "react-select";

// const AssignVideoEditingModal = ({
//   show,
//   onClose,
//   assignData,
//   setAssignData,
//   specializationOptions,
//   vendors,
//   fetchVendorsBySpecialization,
//   handleAssignEditingTask,
//   selectedSortedTask, // ✅ new prop for showing video count
// }) => {
//   const totalVideos =
//     selectedSortedTask?.sortedVideos ||
//     selectedSortedTask?.submittedVideos ||
//     0;

//   return (
//     <Modal show={show} onHide={onClose} centered size="md">
//       <Modal.Header closeButton>
//         <Modal.Title>Assign Video Editing Task</Modal.Title>
//       </Modal.Header>

//       <Modal.Body>
//         {/* ✅ Summary Section */}
//         <div className="border rounded p-2 mb-3 bg-light">
//           <p className="mb-1">
//             <strong>Package:</strong> {assignData.eventName || "—"}
//           </p>
//           <p className="mb-1">
//             <strong>Service:</strong> {assignData.serviceName || "—"}
//           </p>
//           <p className="mb-0 text-info fw-bold">
//             <strong>Videos to Assign:</strong> {totalVideos}
//           </p>
//         </div>

//         <Row>
//           <Col md={6}>
//             <label>Specialization</label>
//             <Select
//               options={specializationOptions}
//               value={
//                 specializationOptions.find(
//                   (x) => x.value === assignData.specialization
//                 ) || null
//               }
//               onChange={(s) => {
//                 setAssignData((p) => ({ ...p, specialization: s?.value || "" }));
//                 fetchVendorsBySpecialization(s?.label);
//               }}
//               isClearable
//             />
//           </Col>
//           <Col md={6}>
//             <label>Vendor</label>
//             <Select
//               options={vendors.map((v) => ({ value: v._id, label: v.name }))}
//               value={
//                 vendors.find((v) => v._id === assignData.vendorId)
//                   ? {
//                       value: assignData.vendorId,
//                       label: vendors.find(
//                         (v) => v._id === assignData.vendorId
//                       )?.name,
//                     }
//                   : null
//               }
//               onChange={(s) =>
//                 setAssignData((p) => ({ ...p, vendorId: s?.value || "" }))
//               }
//             />
//           </Col>
//         </Row>

//         <div className="mt-3">
//           <label>Task Description</label>
//           <textarea
//             className="form-control"
//             rows={2}
//             value={assignData.taskDescription}
//             onChange={(e) =>
//               setAssignData((p) => ({
//                 ...p,
//                 taskDescription: e.target.value,
//               }))
//             }
//           />
//         </div>

//         <div className="mt-3">
//           <label>Final Video Duration</label>
//           <input
//             className="form-control"
//             placeholder="e.g., 3–5 mins"
//             value={assignData.finalVideoDuration}
//             onChange={(e) =>
//               setAssignData((p) => ({
//                 ...p,
//                 finalVideoDuration: e.target.value,
//               }))
//             }
//           />
//         </div>

//         <div className="mt-3">
//           <label>Completion Date</label>
//           <input
//             type="date"
//             className="form-control"
//             value={assignData.completionDate}
//             onChange={(e) =>
//               setAssignData((p) => ({
//                 ...p,
//                 completionDate: e.target.value,
//               }))
//             }
//           />
//         </div>
//       </Modal.Body>

//       <Modal.Footer>
//         <Button variant="secondary" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button variant="success" onClick={() => handleAssignEditingTask(false)}>
//           Assign
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default AssignVideoEditingModal;

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
  selectedSortedTask,
}) => {
  const totalVideos =
    selectedSortedTask?.sortedVideos ||
    selectedSortedTask?.submittedVideos ||
    0;

  // ✅ compact react-select styles
  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "32px",
      height: "32px",
      fontSize: "12px",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 8px",
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      fontSize: "12px",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "12px",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "12px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "32px",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "0 6px",
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: "0 6px",
    }),

    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // ✅ IMPORTANT
    menu: (base) => ({ ...base, fontSize: "12px", zIndex: 9999 }),

    option: (base) => ({
      ...base,
      fontSize: "12px",
      padding: "6px 10px",
    }),
  };

  return (
    <Modal show={show} onHide={onClose} centered size="md">
      <Modal.Header closeButton style={{ padding: "10px 14px" }}>
        <Modal.Title style={{ fontSize: "15px", fontWeight: 600 }}>
          Assign Video Editing Task
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ fontSize: "12px", padding: "12px 14px", overflow: "visible" }} >
        {/* ✅ Summary Section */}
        <div
          className="border rounded bg-light mb-3"
          style={{ padding: "10px" }}
        >
          <p className="mb-1" style={{ fontSize: "12px" }}>
            <strong>Package:</strong> {assignData.eventName || "—"}
          </p>
          <p className="mb-1" style={{ fontSize: "12px" }}>
            <strong>Service:</strong> {assignData.serviceName || "—"}
          </p>
          <p className="mb-0 text-info fw-bold" style={{ fontSize: "12px" }}>
            <strong>Videos to Assign:</strong> {totalVideos}
          </p>
        </div>

        <Row className="g-2">
          <Col md={6}>
            <label style={{ fontSize: "12px", fontWeight: 600 }}>
              Specialization
            </label>
            <Select
              options={specializationOptions}
              value={
                specializationOptions.find(
                  (x) => x.value === assignData.specialization,
                ) || null
              }
              onChange={(s) => {
                setAssignData((p) => ({
                  ...p,
                  specialization: s?.value || "",
                }));
                fetchVendorsBySpecialization(s?.label);
              }}
              isClearable
              styles={selectStyles}
            menuPortalTarget={document.body}     // ✅ render outside modal
  menuPosition="fixed"                
            />
          </Col>

          <Col md={6}>
            <label style={{ fontSize: "12px", fontWeight: 600 }}>Vendor</label>
            <Select
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
              styles={selectStyles}
            menuPortalTarget={document.body}
  menuPosition="fixed"
            />
          </Col>
        </Row>

        <div className="mt-3">
          <label style={{ fontSize: "12px", fontWeight: 600 }}>
            Task Description
          </label>
          <textarea
            className="form-control"
            rows={2}
            style={{ fontSize: "12px" }}
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
          <label style={{ fontSize: "12px", fontWeight: 600 }}>
            Final Video Duration
          </label>
          <input
            className="form-control"
            style={{ fontSize: "12px" }}
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
          <label style={{ fontSize: "12px", fontWeight: 600 }}>
            Completion Date
          </label>
          <input
            type="date"
            className="form-control"
            style={{ fontSize: "12px" }}
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
          onClick={() => handleAssignEditingTask(false)}
        >
          Assign
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignVideoEditingModal;
