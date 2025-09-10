// import React, { useState, useEffect } from "react";
// import { Table, Button, Modal } from "react-bootstrap";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import { useLocation } from "react-router-dom";

// const CallFollowUpsByDate = () => {
//   const location = useLocation();
//   const [callLaterData, setCallLaterData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [selectedDate, setSelectedDate] = useState("");

//   // Extract the date from the URL query parameters
//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search);
//     const date = queryParams.get("date");
//     if (date) {
//       setSelectedDate(date);
//     }
//   }, [location.search]);

//   // Fetch the data from the API with the selected date
//   useEffect(() => {
//     if (!selectedDate) return;

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(
//           `http://localhost:5000/api/lead/call-later-by-date?date=${selectedDate}`
//         );
//         if (response.data.success) {
//           setCallLaterData(response.data.data);
//           console.log("response.data.data", response.data.data);
//         }
//       } catch (err) {
//         toast.error("Error fetching data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [selectedDate]);

//   // Handle modal open
//   const handleOpenModal = (lead) => {
//     setSelectedLead(lead);
//     setShowModal(true);
//   };

//   // Handle modal close
//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedLead(null);
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h5>Call Later Queries for {selectedDate}</h5>

//       {/* Table to display Call Later queries */}
//       <Table
//         striped
//         bordered
//         hover
//         responsive
//         style={{ fontSize: "12px", marginTop: "20px" }}
//       >
//         <thead>
//           <tr>
//             <th>Lead ID</th>
//             <th>Query ID</th>
//             {/* <th>Event Category</th> */}
//             <th>Person Name</th>
//             <th>Phone Number</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {callLaterData.length === 0 ? (
//             <tr>
//               <td colSpan="6" className="text-center">
//                 No data available
//               </td>
//             </tr>
//           ) : (
//             callLaterData.map((leadData, index) => (
//               <tr key={index}>
//                 <td>{leadData?.leadId || "N/A"}</td>
//                 <td>{leadData?.queryId || "N/A"}</td>
//                 {/* <td>{leadData?.eventDetails?.category || 'N/A'}</td> */}
//                 <td>{leadData?.persons[0]?.name || "N/A"}</td>
//                 <td>{leadData?.persons[0]?.phoneNo || "N/A"}</td>
//                 <td>
//                   <Button
//                     variant="info"
//                     size="sm"
//                     onClick={() => handleOpenModal(leadData)}
//                   >
//                     View Details
//                   </Button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </Table>

//       {/* Modal to show lead and query details */}
//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         style={{ fontSize: "12px" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title style={{ fontSize: "16px" }}>
//             Lead & Query Details
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedLead ? (
//             <>
//               {console.log("selectedLead", selectedLead)}
//               <h6>Lead Details</h6>
//               <p>
//                 <strong>Lead ID:</strong>{" "}
//                 {selectedLead?.leadId || "N/A"}
//               </p>
//               <p>
//                 <strong>Person Name:</strong>{" "}
//                 {selectedLead?.leadDetails?.[0]?.firstPerson?.[0]?.name ||
//                   "N/A"}
//               </p>
//               <p>
//                 <strong>Phone Number:</strong>{" "}
//                 {selectedLead?.leadDetails?.[0]?.firstPerson?.[0]?.phoneNo ||
//                   "N/A"}
//               </p>
//               <p>
//                 <strong>Email:</strong>{" "}
//                 {selectedLead?.leadDetails?.[0]?.firstPerson?.[0]?.email ||
//                   "N/A"}
//               </p>
//               <p>
//                 <strong>Profession:</strong>{" "}
//                 {selectedLead?.leadDetails?.[0]?.firstPerson?.[0]?.profession ||
//                   "N/A"}
//               </p>

//               <h6>Query Details</h6>
//               <p>
//                 <strong>Query ID:</strong> {selectedLead?.queryId || "N/A"}
//               </p>
//               <p>
//                 <strong>Status:</strong> {selectedLead?.status || "N/A"}
//               </p>
//               <p>
//                 <strong>Comment:</strong> {selectedLead?.comment || "N/A"}
//               </p>

//               <h6>Event Details</h6>
//               <p>
//                 <strong>Category:</strong>{" "}
//                 {selectedLead?.eventDetails?.[0]?.category || "N/A"}
//               </p>
//               <p>
//                 <strong>Start Date:</strong>{" "}
//                 {selectedLead?.eventDetails?.[0]?.eventStartDate
//                   ? new Date(
//                       selectedLead?.eventDetails?.[0]?.eventStartDate
//                     ).toLocaleDateString()
//                   : "N/A"}
//               </p>
//               <p>
//                 <strong>End Date:</strong>{" "}
//                 {selectedLead?.eventDetails?.[0]?.eventEndDate
//                   ? new Date(
//                       selectedLead?.eventDetails?.[0]?.eventEndDate
//                     ).toLocaleDateString()
//                   : "N/A"}
//               </p>
//             </>
//           ) : (
//             <p>No details available.</p>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default CallFollowUpsByDate;


import React, { useState, useEffect } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB") : "N/A"; // DD/MM/YYYY

const CallFollowUpsByDate = () => {
  const location = useLocation();
  const [callLaterData, setCallLaterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  // read date from query string
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const date = qs.get("date");
    if (date) setSelectedDate(date);
  }, [location.search]);

  // fetch list
  useEffect(() => {
    if (!selectedDate) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/lead/call-later-by-date?date=${selectedDate}`
        );
        if (res.data?.success) {
          setCallLaterData(res.data.data || []);
        }
      } catch (err) {
        toast.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  const handleOpenModal = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h5>Call Later Queries for {selectedDate}</h5>

      <Table striped bordered hover responsive style={{ fontSize: "12px", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Lead ID</th>
            <th>Query ID</th>
            <th>Person Name</th>
            <th>Phone Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {callLaterData.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No data available</td>
            </tr>
          ) : (
            callLaterData.map((row, idx) => (
              <tr key={row._id || idx}>
                <td>{row?.leadId || "N/A"}</td>
                <td>{row?.queryId || "N/A"}</td>
                <td>{row?.persons?.[0]?.name || "N/A"}</td>
                <td>{row?.persons?.[0]?.phoneNo || "N/A"}</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => handleOpenModal(row)}>
                    View Details
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} style={{ fontSize: "12px" }}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "16px" }}>Lead &amp; Query Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLead ? (
            <>
              {/* Lead */}
              <h6 className="mb-2">Lead Details</h6>
              <p className="mb-1"><strong>Lead ID:</strong> {selectedLead.leadId || "N/A"}</p>

              {/* People list */}
              <div className="mb-2">
                <strong>Persons:</strong>

                {Array.isArray(selectedLead.persons) && selectedLead.persons.length > 0 ? (
                  <ul className="mb-2 mt-1 d-flex gap-5 " style={{listStyle:"none"}}>
                    {selectedLead.persons.map((p) => (
                      <li key={p._id}>
                        <div><strong>Name:</strong> {p.name || "N/A"}</div>
                        <div><strong>Phone:</strong> {p.phoneNo || "N/A"}</div>
                        <div><strong>Email:</strong> {p.email || "N/A"}</div>
                        <div><strong>Profession:</strong> {p.profession || "N/A"}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted">No person records.</div>
                )}
              </div>

              {/* Query */}
              <h6 className="mb-2">Query Details</h6>
              <p className="mb-1"><strong>Query ID:</strong> {selectedLead.queryId || "N/A"}</p>
              <p className="mb-1"><strong>Status:</strong> {selectedLead.status || "N/A"}</p>
              <p className="mb-1"><strong>Comment:</strong> {selectedLead.comment || "N/A"}</p>
              <p className="mb-3">
                <strong>Rescheduled For:</strong> {formatDate(selectedLead.callRescheduledDate)}
              </p>

              {/* Events */}
              <h6 className="mb-2">Event Details</h6>
              {Array.isArray(selectedLead.eventDetails) && selectedLead.eventDetails.length > 0 ? (
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLead.eventDetails.map((ev) => (
                      <tr key={ev._id}>
                        <td>{ev.category || "N/A"}</td>
                        <td>{formatDate(ev.eventStartDate)}</td>
                        <td>{formatDate(ev.eventEndDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-muted">No events.</div>
              )}
            </>
          ) : (
            <p>No details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CallFollowUpsByDate;
