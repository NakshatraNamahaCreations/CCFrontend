// import React, { useEffect, useState } from "react";
// import { Button, Form } from "react-bootstrap";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-hot-toast";

// const formatDateTime = (dateString) => {
//   const date = new Date(dateString);
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();
//   const hours = date.getHours() % 12 || 12;
//   const minutes = String(date.getMinutes()).padStart(2, "0");
//   const ampm = date.getHours() >= 12 ? "PM" : "AM";
//   return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
// };

// const formatDate = (dateString) => {
//   const date = new Date(dateString);
//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`;
// };

// // Function to format ISO date to yyyy-mm-dd
// const formatDatebyYear = (dateString) => {
//   const date = new Date(dateString);
//   const year = date.getFullYear();
//   const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 0-indexed months
//   const day = date.getDate().toString().padStart(2, "0");
//   return `${year}-${month}-${day}`; // Return in yyyy-mm-dd format
// };
// const LeadsDetails = () => {
//   const { leadId, queryId } = useParams();
//   const navigate = useNavigate();
//   const [lead, setLead] = useState(null);
//   const [query, setQuery] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [comment, setComment] = useState("");
//   const [callRescheduledDate, setCallRescheduledDate] = useState("");
//   const [showCommentBox, setShowCommentBox] = useState(false);

// useEffect(() => {
//   const fetchDetails = async () => {
//     try {
//       const res = await axios.get(
//         `http://localhost:5000/api/lead/lead-details/${leadId}/${queryId}`
//       );
//       const fetchedQuery = res.data.data.query;
//       setLead(res.data.data.lead);
//       setQuery(fetchedQuery);

//       if (fetchedQuery.status === "Call Later") {
//         setShowCommentBox(true);
//         setComment(fetchedQuery.comment || "");
        
//         // Convert the ISO date string to yyyy-mm-dd format for the date input
//         if (fetchedQuery.callRescheduledDate) {
//           const formattedDate = formatDatebyYear(fetchedQuery.callRescheduledDate);
//           setCallRescheduledDate(formattedDate); // Store the formatted date for date input
//         }
//       }
//     } catch (err) {
//       toast.error("Failed to fetch lead/query details");
//       navigate("/customer");
//     } finally {
//       setLoading(false);
//     }
//   };
//   fetchDetails();
// }, [leadId, queryId, navigate]);

//   const updateQueryStatus = async (statusToUpdate, commentText = "") => {
//     try {
//       if (
//         statusToUpdate === "Call Later" &&
//         (!commentText || !callRescheduledDate)
//       ) {
//         toast.error("Please provide both comment and rescheduled date.");
//         return; // Prevent status update
//       }

//       const payload = { status: statusToUpdate };
//       if (statusToUpdate === "Call Later") payload.comment = commentText;
//       if (statusToUpdate === "Call Later")
//         payload.callRescheduledDate = callRescheduledDate;

//       await axios.put(
//         `http://localhost:5000/api/lead/${queryId}/status`,
//         payload
//       );

//       toast.success("Status updated successfully");

//       if (statusToUpdate === "Call Later") {
//         setQuery((prev) => ({
//           ...prev,
//           status: statusToUpdate,
//           comment: commentText,
//           callRescheduledDate,
//         }));
//         setShowCommentBox(false);
//       } else {
//         navigate("/customer");
//       }
//     } catch (err) {
//       toast.error("Error updating status");
//     }
//   };

//   const handleStatusChange = (e) => {
//     const newStatus = e.target.value;
//     setQuery((prev) => ({ ...prev, status: newStatus }));

//     if (newStatus === "Call Later") {
//       setShowCommentBox(true);
//     } else {
//       updateQueryStatus(newStatus);
//     }
//   };

//   const handleSaveComment = () => {
//     if (!comment || !callRescheduledDate) {
//       toast.error("Both comment and rescheduled date are required.");
//       return; 
//     }

//     updateQueryStatus("Call Later", comment);
//     navigate("/customer");
//   };

//   if (loading) return <div className="text-center py-5">Loading...</div>;
//   if (!lead || !query)
//     return (
//       <div className="text-center py-5 text-danger">Error loading data</div>
//     );

//   const firstPerson = lead.persons?.[0];

//   return (
//     <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
//       <div className="d-flex px-5 py-3 gap-5">
//         {/* Customer Details */}
//         <div className="card" style={{ width: "40%" }}>
//           <p
//             className="fw-bold text-dark p-3 text-center"
//             style={{
//               backgroundColor: "#D9D9D9",
//               borderBottomLeftRadius: "10px",
//               borderBottomRightRadius: "10px",
//             }}
//           >
//             Customer Details
//           </p>
//           <div className="row mx-3" style={{ fontSize: "14px" }}>
//             <div className="col-md-5 fw-semibold">
//               <p>Enquiry Id</p>
//               <p>Name</p>
//               <p>Phone no</p>
//               <p>Email</p>
//               <p>Reference From</p>
//               <p>Created At</p>
//             </div>
//             <div className="col-md-7">
//               <p>{lead.leadId}</p>
//               <p>{firstPerson?.name}</p>
//               <p>+91 {firstPerson?.phoneNo}</p>
//               <p>{firstPerson?.email || "Not provided"}</p>
//               <p>{lead.referenceForm || "Not provided"}</p>
//               <p>{formatDateTime(lead.createdAt)}</p>
//             </div>
//             <div className="col-12 text-end mt-3">
//               <Button
//                 variant="dark"
//                 onClick={() =>
//                   navigate(`/customer/edit-details/${leadId}/${queryId}`)
//                 }
//               >
//                 Edit Details
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Query Details */}
//         <div className="card" style={{ width: "40%" }}>
//           <p
//             className="fw-bold text-dark p-3 text-center"
//             style={{
//               backgroundColor: "#D9D9D9",
//               borderBottomLeftRadius: "10px",
//               borderBottomRightRadius: "10px",
//             }}
//           >
//             Follow Up Details
//           </p>

//           <div className="row p-3" style={{ fontSize: "14px" }}>
//             <div className="col-12 mb-3">
//               <div className="d-flex justify-content-between">
//                 <div>
//                   <strong>Query ID:</strong> {query.queryId}
//                 </div>
//                 <div>
//                   <strong>Status:</strong> {query.status}
//                 </div>
//               </div>
//             </div>

//             <div className="col-12 mb-2">
//               <p>
//                 <strong>Created:</strong> {formatDate(query.createdAt)}
//               </p>
//             </div>

//             <div className="col-12 mb-2">
//               <p>
//                 <strong>Events:</strong>
//               </p>
//               {query.eventDetails.map((e, idx) => (
//                 <div key={idx}>
//                   - {e.category}: {formatDate(e.eventStartDate)} to{" "}
//                   {formatDate(e.eventEndDate)}
//                 </div>
//               ))}
//             </div>

//             {/* Status Dropdown */}
//             <div className="col-12 mt-3">
//               <Form.Group>
//                 <Form.Label className="fw-semibold mb-1">
//                   Update Status
//                 </Form.Label>
//                 <Form.Control
//                   as="select"
//                   onChange={handleStatusChange}
//                   value={query.status}
//                 >
//                   <option value="Created">Created</option>
//                   <option value="Call Later">Call Later</option>
//                   <option value="Quotation">Quotation</option>
//                   <option value="Not Interested">Not Interested</option>
//                 </Form.Control>
//               </Form.Group>
//             </div>

//             {/* Comment Box */}
//             {showCommentBox && (
//               <>
//                 <div className="col-12 mt-3">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">
//                       Reason / Comment
//                     </Form.Label>
//                     <Form.Control
//                       as="textarea"
//                       rows={3}
//                       value={comment}
//                       onChange={(e) => setComment(e.target.value)}
//                       placeholder="Write your reason here..."
//                       required
//                     />
//                   </Form.Group>
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">
//                       Call Rescheduled Date
//                     </Form.Label>
//                     <Form.Control
//                       type="date" // Make sure it's type="date"
//                       value={callRescheduledDate}
//                       onChange={(e) => setCallRescheduledDate(e.target.value)} // Set date value
//                       placeholder="Select a date"
//                       required
//                       // min={new Date().toISOString().split("T")[0]} // Prevent past dates from being selected
//                     />
//                   </Form.Group>
//                 </div>
//                 <div className="col-12 text-end mt-2">
//                   <Button variant="dark" size="sm" onClick={handleSaveComment}>
//                     Save Comment
//                   </Button>
//                 </div>
//               </>
//             )}

//             {!showCommentBox && query.comment && (
//               <div className="col-12 mt-3">
//                 <p>
//                   <strong>Saved Comment:</strong> {query.comment}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LeadsDetails;

import React, { useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDatebyYear = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const LeadsDetails = () => {
  const { leadId, queryId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [query, setQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [callRescheduledDate, setCallRescheduledDate] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [calledTo, setCalledTo] = useState(""); // <-- New input for calledTo

  
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/lead/lead-details/${leadId}/${queryId}`
        );
        const fetchedQuery = res.data.data.query;
        setLead(res.data.data.lead);
        setQuery(fetchedQuery);

        if (fetchedQuery.status === "Call Later") {
          setShowCommentBox(true);
          setComment(fetchedQuery.comment || "");
          if (fetchedQuery.callRescheduledDate) {
            setCallRescheduledDate(formatDatebyYear(fetchedQuery.callRescheduledDate));
          }
        }
      } catch (err) {
        toast.error("Failed to fetch lead/query details");
        navigate("/customer");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [leadId, queryId, navigate]);

  const updateQueryStatus = async (statusToUpdate, commentText = "") => {
    try {
      if (
        statusToUpdate === "Call Later" &&
        (!commentText || !callRescheduledDate || !calledTo)
      ) {
        toast.error("Please provide comment, rescheduled date, and person called to.");
        return;
      }

      const payload = {
        status: statusToUpdate,
        calledTo: calledTo || (lead?.persons?.[0]?.name || "Customer"),
        comment: statusToUpdate === "Call Later" ? commentText : "",
        callRescheduledDate: statusToUpdate === "Call Later" ? callRescheduledDate : "",
      };

      const res = await axios.put(
        `http://localhost:5000/api/lead/${queryId}/status`,
        payload
      );

      toast.success("Status updated successfully");

      setQuery((prev) => ({
        ...prev,
        status: statusToUpdate,
        comment: payload.comment,
        callRescheduledDate: payload.callRescheduledDate,
        callHistory: res.data.data.callHistory,
      }));

      if (statusToUpdate === "Call Later") {
        setShowCommentBox(false);
      } else {
        navigate("/customer");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setQuery((prev) => ({ ...prev, status: newStatus }));

    if (newStatus === "Call Later") {
      setShowCommentBox(true);
    } else {
      updateQueryStatus(newStatus);
    }
  };

  const handleSaveComment = () => {
    if (!comment || !callRescheduledDate || !calledTo) {
      toast.error("Comment, rescheduled date, and person called to are required.");
      return;
    }
    updateQueryStatus("Call Later", comment);
    // Do not navigate away immediately, let user see the update
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!lead || !query)
    return (
      <div className="text-center py-5 text-danger">Error loading data</div>
    );

  const firstPerson = lead.persons?.[0];

  return (
    <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
      <div className="d-flex px-5 py-3 gap-5">
        {/* Customer Details */}
        <div className="card" style={{ width: "40%" }}>
          <p
            className="fw-bold text-dark p-3 text-center"
            style={{
              backgroundColor: "#D9D9D9",
              borderBottomLeftRadius: "10px",
              borderBottomRightRadius: "10px",
            }}
          >
            Customer Details
          </p>
          <div className="row mx-3" style={{ fontSize: "14px" }}>
            <div className="col-md-5 fw-semibold">
              <p>Enquiry Id</p>
              <p>Name</p>
              <p>Phone no</p>
              <p>Email</p>
              <p>Reference From</p>
              <p>Created At</p>
            </div>
            <div className="col-md-7">
              <p>{lead.leadId}</p>
              <p>{firstPerson?.name}</p>
              <p>+91 {firstPerson?.phoneNo}</p>
              <p>{firstPerson?.email || "Not provided"}</p>
              <p>{lead.referenceForm || "Not provided"}</p>
              <p>{formatDateTime(lead.createdAt)}</p>
            </div>
            <div className="col-12 text-end mt-3">
              <Button
                variant="dark"
                onClick={() =>
                  navigate(`/customer/edit-details/${leadId}/${queryId}`)
                }
              >
                Edit Details
              </Button>
            </div>
          </div>
        </div>

        {/* Query Details */}
        <div className="card" style={{ width: "40%" }}>
          <p
            className="fw-bold text-dark p-3 text-center"
            style={{
              backgroundColor: "#D9D9D9",
              borderBottomLeftRadius: "10px",
              borderBottomRightRadius: "10px",
            }}
          >
            Follow Up Details
          </p>

          <div className="row p-3" style={{ fontSize: "14px" }}>
            <div className="col-12 mb-3">
              <div className="d-flex justify-content-between">
                <div>
                  <strong>Query ID:</strong> {query.queryId}
                </div>
                <div>
                  <strong>Status:</strong> {query.status}
                </div>
              </div>
            </div>

            <div className="col-12 mb-2">
              <p>
                <strong>Created:</strong> {formatDate(query.createdAt)}
              </p>
            </div>

            <div className="col-12 mb-2">
              <p>
                <strong>Events:</strong>
              </p>
              {query.eventDetails.map((e, idx) => (
                <div key={idx}>
                  - {e.category}: {formatDate(e.eventStartDate)} to{" "}
                  {formatDate(e.eventEndDate)}
                </div>
              ))}
            </div>

            {/* Status Dropdown */}
            <div className="col-12 mt-3">
              <Form.Group>
                <Form.Label className="fw-semibold mb-1">
                  Update Status
                </Form.Label>
                <Form.Control
                  as="select"
                  onChange={handleStatusChange}
                  value={query.status}
                >
                  <option value="Created">Created</option>
                  <option value="Call Later">Call Later</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Not Interested">Not Interested</option>
                </Form.Control>
              </Form.Group>
            </div>

            {/* Comment Box */}
            {showCommentBox && (
              <>
                <div className="col-12 mt-3">
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Reason / Comment
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your reason here..."
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mt-2">
                    <Form.Label className="fw-semibold">
                      Call Rescheduled Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={callRescheduledDate}
                      onChange={(e) => setCallRescheduledDate(e.target.value)}
                      placeholder="Select a date"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mt-2">
                    <Form.Label className="fw-semibold">
                      Person Called To
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={calledTo}
                      onChange={(e) => setCalledTo(e.target.value)}
                      placeholder="Enter person name"
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-12 text-end mt-2">
                  <Button variant="dark" size="sm" onClick={handleSaveComment}>
                    Save Comment
                  </Button>
                </div>
              </>
            )}

            {!showCommentBox && query.comment && (
              <div className="col-12 mt-3">
                <p>
                  <strong>Saved Comment:</strong> {query.comment}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call History Table */}
      <div className="mt-4 px-5">
        <h5 className="fw-bold mb-3">Call History</h5>
        {query.callHistory && query.callHistory.length > 0 ? (
          <Table striped bordered hover size="sm" style={{ fontSize: "14px" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Called To</th>
                <th>Date</th>
                <th>Remarks</th>
                <th>Rescheduled Date</th>
              </tr>
            </thead>
            <tbody>
              {query.callHistory.map((ch, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{ch.calledTo}</td>
                  <td>{formatDateTime(ch.callDate)}</td>
                  <td>{ch.remarks || "-"}</td>
                  <td>
                    {ch.rescheduledDate
                      ? formatDate(ch.rescheduledDate)
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-muted">No call history available.</div>
        )}
      </div>
    </div>
  );
};

export default LeadsDetails;