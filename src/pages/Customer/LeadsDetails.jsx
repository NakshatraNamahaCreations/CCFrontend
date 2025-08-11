// import React, { useEffect, useState } from 'react';
// import { Button, Form, Col } from "react-bootstrap";
// import { IoChevronDown } from "react-icons/io5";
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// // Helper function to format dates to DD/MM/YYYY HH:MM AM/PM
// const formatDateTime = (dateString) => {
//   const date = new Date(dateString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   const hours = date.getHours() % 12 || 12;
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
//   return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
// };

// // Helper function to format dates to DD/MM/YYYY
// const formatDate = (dateString) => {
//   const date = new Date(dateString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = date.getFullYear();
//   return `${day}/${month}/${year}`;
// };

// const LeadsDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [customer, setCustomer] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // Fetch customer details from the backend
//   useEffect(() => {
//     const fetchCustomer = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(`http://localhost:5000/api/customer/${id}`);
//         setCustomer(response.data.data);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch customer details');
//         toast.error(err.response?.data?.message || 'Failed to fetch customer details');
//         navigate("/customer");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCustomer();
//   }, [id, navigate]);

//   // Handle status update
//   const handleResponseChange = async (e) => {
//     const response = e.target.value;
//     try {
//      await axios.put(`http://localhost:5000/api/customer/${id}`, {
//   name: customer.name,
//   phoneNo: customer.phoneNo,
//   whatsappNo: customer.whatsappNo,
//   email: customer.email,
//   category: customer.category.map(cat => cat._id),
//   // Convert dates to ISO string with only date part (yyyy-mm-dd)
//   eventStartDate: new Date(customer.eventStartDate).toISOString().slice(0, 10),
//   eventEndDate: new Date(customer.eventEndDate).toISOString().slice(0, 10),
//   referenceForm: customer.referenceForm,
//   createdDate: new Date(customer.createdDate).toISOString().slice(0, 10),
//   status: response || null,
// });

//       toast.success('Status updated successfully');
//       // Refetch customer to get updated statusHistory
//       const updatedCustomer = await axios.get(`http://localhost:5000/api/customer/${id}`);
//       setCustomer(updatedCustomer.data.data);
//       setTimeout(() => {
//         navigate("/customer");
//       }, 100);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to update status');
//     }
//   };

//   // Show loading state
//   if (loading) {
//     return (
//       <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
//         <div className="text-center py-5">
//           <p>Loading customer details...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show error state
//   if (error) {
//     return (
//       <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
//         <div className="text-center py-5">
//           <p className="text-danger">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
//       <div className="d-flex px-5 py-3 gap-5">
//         <div className="card" style={{ width: "40%" }}>
//           <p className='fw-bold text-dark p-3 text-center' style={{ backgroundColor: "#D9D9D9", borderBottomLeftRadius: "10px", borderBottomRightRadius: "10px" }}>
//             Customer Details
//           </p>
//           <div className='row mx-3' style={{ fontSize: "14px" }}>
//             <div className='col-md-5 fw-semibold'>
//               <p>Enquiry Id</p>
//               <p>Name</p>
//               <p>Phone no</p>
//               <p>Email</p>
//               <p>Event</p>
//               <p>Event Start Date</p>
//               <p>Event End Date</p>
//               <p>Reference From</p>
//             </div>
//             <div className='col-md-7'>
//               <p>{customer._id}</p>
//               <p>{customer.name}</p>
//               <p>+91 {customer.phoneNo}</p>
//               <p>{customer.email || 'Not provided'}</p>
//               <p>{customer.category.map(cat => cat.name).join(', ') || 'Not specified'}</p>
//               <p>{formatDate(customer.eventStartDate)}</p>
//               <p>{formatDate(customer.eventEndDate)}</p>
//               <p>{customer.referenceForm || 'Not provided'}</p>
//             </div>
//           </div>
//           <div className='text-end px-4 py-2'>
//             <Button
//               className='fw-bold rounded-1 shadow-sm text-dark border-0'
//               onClick={() => navigate(`/customer/editleads-details/${customer._id}`)}
//               style={{ fontSize: "14px", backgroundColor: "#D9D9D9" }}
//             >
//               Edit Details
//             </Button>
//           </div>
//         </div>

//         <div className="card" style={{ width: "40%" }}>
//           <p className='fw-bold text-dark p-3 text-center' style={{ backgroundColor: "#D9D9D9", borderBottomLeftRadius: "10px", borderBottomRightRadius: "10px" }}>
//             Follow Up Details
//           </p>
//           <div className='row p-2'>
//             {customer.statusHistory && customer.statusHistory.length > 0 && (
//               <div className='col-md-6'>
//                 {customer.statusHistory.map((entry, idx) => (
//                   <p key={idx} className='fw-semibold p-2 text-center' style={{ fontSize: "14px", background: "#E8E8E8", marginBottom: "10px" }}>
//                     {entry.status || 'No Response'} - {formatDateTime(entry.timestamp)}
//                   </p>
//                 ))}
//               </div>
//             )}
//             <Form className='col-md-6'>
//               <div className="justify-content-start">
//                 <div className="">
//                   <div className="mb-3">
//                     <Form.Group>
//                       <Form.Control
//                         as="select"
//                         name="selectResponse"
//                         className="custom-dropdown"
//                         onChange={handleResponseChange}
//                         value={customer.status || ''}
//                       >
//                         <option value="">Response</option>
//                         <option value="Not Interested">Not Interested</option>
//                         <option value="Call Later">Call Later</option>
//                         <option value="Quotation">Quotation</option>
//                       </Form.Control>
//                     </Form.Group>
//                   </div>
//                 </div>
//               </div>
//             </Form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LeadsDetails;

import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
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

const LeadsDetails = () => {
  const { leadId, queryId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [query, setQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

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
      const payload = { status: statusToUpdate };
      if (statusToUpdate === "Call Later") payload.comment = commentText;

      await axios.put(
        `http://localhost:5000/api/lead/${queryId}/status`,
        payload
      );

      toast.success("Status updated successfully");

      if (statusToUpdate === "Call Later") {
        setQuery((prev) => ({
          ...prev,
          status: statusToUpdate,
          comment: commentText,
        }));
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
    updateQueryStatus("Call Later", comment);
    navigate("/customer");
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
    </div>
  );
};

export default LeadsDetails;
