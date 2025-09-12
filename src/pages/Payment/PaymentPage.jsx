// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   Form,
//   Button,
//   Card,
//   InputGroup,
//   Row,
//   Col,
//   Modal,
//   Tab,
//   Tabs,
// } from "react-bootstrap";
// import Select from "react-select";
// import { IoChevronForward } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import * as XLSX from "xlsx";
// import DynamicPagination from "../DynamicPagination";

// // ---- Date helpers: handle "DD-MM-YYYY" and ISO strings ----
// const parseMaybeDdmmyyyy = (str) => {
//   if (!str) return null;

//   // try native first (handles ISO etc.)
//   const native = new Date(str);
//   if (!Number.isNaN(native.getTime())) return native;

//   // handle DD-MM-YYYY
//   const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(str);
//   if (m) {
//     const [, dd, mm, yyyy] = m;
//     // local time to avoid timezone day-shifts
//     const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
//     return Number.isNaN(d.getTime()) ? null : d;
//   }
//   return null;
// };

// const toDisplayDate = (str) => {
//   const d = parseMaybeDdmmyyyy(str);
//   return d ? d.toLocaleDateString("en-GB") : "N/A"; // dd/mm/yyyy
// };

// // Format date for API (YYYY-MM-DD)
// const formatDateForAPI = (dateString) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   return date.toISOString().split("T")[0];
// };

// const PaymentPage = () => {
//   const navigate = useNavigate();
//   const [payments, setPayments] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [vendorOptions, setVendorOptions] = useState([]);
//   const [searchInput, setSearchInput] = useState("");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [vendorLoading, setVendorLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [vendorCurrentPage, setVendorCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [vendorTotalPages, setVendorTotalPages] = useState(1);
//   const [activeTab, setActiveTab] = useState("client");

//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   // Vendor payment modal state
//   const [showVendorModal, setShowVendorModal] = useState(false);
//   const [vendorPayment, setVendorPayment] = useState({
//     vendorName: "",
//     vendorId: "",
//     eventDate: "",
//     slot: "",
//     totalAmount: "",
//     paidAmount: "",
//     paidDate: "",
//   });

//   // Add payment modal state
//   const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
//   const [selectedVendorPayment, setSelectedVendorPayment] = useState(null);
//   const [additionalPayment, setAdditionalPayment] = useState({
//     amount: "",
//     paymentDate: "",
//     note: "",
//   });


//   // Predefined slots
//   const timeSlots = [
//     "Morning (8AM - 1PM)",
//     "Afternoon (12PM - 5PM)",
//     "Evening (5PM - 9PM)",
//     "Midnight (9PM - 12AM)",

//   ];

//   // Fetch vendor options from API
//   const fetchVendorOptions = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/vendors");
//       if (response.data.success && response.data.vendors) {
//         const options = response.data.vendors.map((vendor) => ({
//           value: vendor._id,
//           label: vendor.name,
//           data: vendor,
//         }));
//         setVendorOptions(options);
//       }
//     } catch (err) {
//       toast.error("Failed to fetch vendors");
//     }
//   };

//   // Fetch payments with pagination, search, and date filter
//   const fetchPayments = async () => {
//     setLoading(true);
//     try {
//       // Format dates for API
//       const formattedStartDate = formatDateForAPI(startDate);
//       const formattedEndDate = formatDateForAPI(endDate);

//       const url = `http://localhost:5000/api/payments/completed?page=${currentPage}&limit=10&search=${encodeURIComponent(
//         search
//       )}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

//       const response = await axios.get(url);
//       const paymentsData = response.data.data || [];

//       const paymentList = paymentsData.map((p, index) => {
//         const completed = Array.isArray(p.completedInstallments)
//           ? p.completedInstallments
//           : [];

//         const lastDue = completed.length
//           ? completed[completed.length - 1].dueDate
//           : null;

//         return {
//           id: `payment-${p.quotationId}-${index}`,
//           quoteId: p.quotationNumber,
//           quotationId: p.quotationId,
//           name: p.firstPersonName,
//           phone: p.firstPersonPhone,
//           paymentId: `INST-${p.totalCompletedInstallments}`,
//           amount: `₹${completed
//             .reduce((sum, i) => sum + (i.amount || 0), 0)
//             .toLocaleString("en-IN")}`,
//           status: p.totalCompletedInstallments > 0 ? "Completed" : "Pending",
//           date: toDisplayDate(lastDue),
//         };
//       });

//       setPayments(paymentList);
//       setTotalPages(response.data.totalPages || 1);
//       setError("");
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to fetch payments";
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };
//   // Fetch vendor payments
//   const fetchVendorPayments = async () => {
//     setVendorLoading(true);
//     try {
//       const url = `http://localhost:5000/api/vendor-payments?page=${vendorCurrentPage}&limit=10`;
//       const response = await axios.get(url);
//       setVendors(response.data.data || []);
//       setVendorTotalPages(response.data.pagination?.totalPages || 1);
//     } catch (err) {
//       toast.error("Failed to fetch vendor payments");
//     } finally {
//       setVendorLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "client") {
//       fetchPayments();
//     }
//   }, [currentPage, search, startDate, endDate, activeTab]);

//   useEffect(() => {
//     if (activeTab === "vendor") {
//       fetchVendorPayments();
//       fetchVendorOptions();
//     }
//   }, [vendorCurrentPage, activeTab]);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     setSearch(searchInput);
//     setCurrentPage(1);
//   };

//   const handleClearSearch = () => {
//     setSearchInput("");
//     setSearch("");
//     setCurrentPage(1);
//   };

//   // Handle vendor selection
//   const handleVendorSelect = (selectedOption) => {
//     if (selectedOption) {
//       setVendorPayment({
//         ...vendorPayment,
//         vendorName: selectedOption.label,
//         vendorId: selectedOption.value,
//       });
//     } else {
//       setVendorPayment({
//         ...vendorPayment,
//         vendorName: "",
//         vendorId: "",
//       });
//     }
//   };

//   // Handle vendor payment form submission
//   const handleVendorPaymentSubmit = async () => {
//     try {
//       // Validate form
//       if (
//         !vendorPayment.vendorId ||
//         !vendorPayment.eventDate ||
//         !vendorPayment.slot ||
//         !vendorPayment.totalAmount ||
//         !vendorPayment.paidAmount ||
//         !vendorPayment.paidDate
//       ) {
//         toast.error("Please fill all fields");
//         return;
//       }

//       // Convert amounts to numbers
//       const payload = {
//         ...vendorPayment,
//         totalAmount: parseFloat(vendorPayment.totalAmount),
//         paidAmount: parseFloat(vendorPayment.paidAmount),
//       };

//       await axios.post("http://localhost:5000/api/vendor-payments", payload);
//       toast.success("Vendor payment added successfully");
//       setShowVendorModal(false);
//       setVendorPayment({
//         vendorName: "",
//         vendorId: "",
//         eventDate: "",
//         slot: "",
//         totalAmount: "",
//         paidAmount: "",
//         paidDate: "",
//       });

//       // Refresh vendor payments list
//       fetchVendorPayments();
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message || "Failed to add vendor payment"
//       );
//     }
//   };

//   // Handle add payment to existing vendor payment
//   const handleAddPayment = async () => {
//     try {
//       if (!additionalPayment.amount || !additionalPayment.paymentDate) {
//         toast.error("Please fill amount and payment date");
//         return;
//       }

//       await axios.post(
//         `http://localhost:5000/api/vendor-payments/${selectedVendorPayment._id}/payments`,
//         {
//           amount: parseFloat(additionalPayment.amount),
//           paymentDate: additionalPayment.paymentDate,
//           note: additionalPayment.note || "Additional payment",
//         }
//       );
//       toast.success("Payment added successfully");
//       setShowAddPaymentModal(false);
//       setAdditionalPayment({ amount: "", paymentDate: "", note: "" });
//       setSelectedVendorPayment(null);

//       // Refresh vendor payments list
//       fetchVendorPayments();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to add payment");
//     }
//   };

//   // Open add payment modal
//   const openAddPaymentModal = (vendor) => {
//     setSelectedVendorPayment(vendor);
//     setAdditionalPayment({
//       amount: "",
//       paymentDate: new Date().toISOString().split("T")[0],
//       note: "",
//     });
//     setShowAddPaymentModal(true);
//   };

//   // Fetch full report for Excel download
//   const handleDownloadExcel = async () => {
//     try {
//       // Format dates for API
//       const formattedStartDate = formatDateForAPI(startDate);
//       const formattedEndDate = formatDateForAPI(endDate);

//       const url = `http://localhost:5000/api/payments/completed?search=${encodeURIComponent(
//         search
//       )}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&all=true`;

//       const response = await axios.get(url);
//       const fullData = response.data.data || [];

//       const worksheetData = fullData.map((p) => {
//         const completed = Array.isArray(p.completedInstallments)
//           ? p.completedInstallments
//           : [];
//         const lastDue = completed.length
//           ? completed[completed.length - 1].dueDate
//           : null;

//         return {
//           "Quotation ID": p.quotationId,
//           "Lead ID": p.leadId,
//           "Query ID": p.queryId,
//           "Customer Name": p.firstPersonName,
//           Phone: p.firstPersonPhone,
//           "Total Installments Completed": p.totalCompletedInstallments,
//           "Total Amount Paid": completed.reduce(
//             (sum, i) => sum + (i.amount || 0),
//             0
//           ),
//           "Last Payment Date": toDisplayDate(lastDue),
//         };
//       });

//       const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
//       XLSX.writeFile(workbook, "CompletedPaymentsReport.xlsx");

//       toast.success("Excel downloaded successfully");
//     } catch (err) {
//       toast.error("Failed to download Excel");
//     }
//   };

//   // Clear date filters
//   const handleClearDates = () => {
//     setStartDate("");
//     setEndDate("");
//     setCurrentPage(1);
//   };
//   return (
//     <div
//       className="container py-2 rounded vh-100"
//       style={{ background: "#F4F4F4" }}
//     >
//       {/* Tabs for Client and Vendor Payments */}
//       <Tabs
//         activeKey={activeTab}
//         onSelect={(tab) => setActiveTab(tab)}
//         className="mb-3"
//       >
//         <Tab eventKey="client" title="Client Payments">
//           {/* Search and Date Filters */}
//           <div className="mb-3 d-flex flex-wrap justify-content-between">
//             <Form
//               onSubmit={handleSearch}
//               className="mb-2"
//               style={{ width: "350px" }}
//             >
//               <InputGroup>
//                 <Form.Control
//                   type="text"
//                   placeholder="Search by name or phone"
//                   value={searchInput}
//                   onChange={(e) => setSearchInput(e.target.value)}
//                   disabled={loading}
//                 />
//                 <Button variant="dark" type="submit" disabled={loading}>
//                   Search
//                 </Button>
//                 {search && (
//                   <Button
//                     variant="outline-secondary"
//                     onClick={handleClearSearch}
//                     disabled={loading}
//                   >
//                     Clear
//                   </Button>
//                 )}
//               </InputGroup>
//             </Form>

//             {/* Date Filter
//             <Row className="align-items-center">
//               <Col md={4}>
//                 <Form.Group className="mb-2">
//                   <Form.Label className="mb-0" style={{ fontSize: "12px" }}>
//                     From Date
//                   </Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                     style={{ fontSize: "12px" }}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Form.Group className="mb-2">
//                   <Form.Label className="mb-0" style={{ fontSize: "12px" }}>
//                     To Date
//                   </Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                     style={{ fontSize: "12px" }}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={4}>
//                 <Button
//                   variant="secondary"
//                   onClick={handleClearDates}
//                   style={{ fontSize: "12px", marginTop: "24px" }}
//                 >
//                   Clear Dates
//                 </Button>
//               </Col>
//             </Row> */}
//           </div>

//           {/* Top Right Actions */}
//           <div className="d-flex justify-content-end mb-2 gap-2">
//             <Button
//               variant="light-gray"
//               className="btn rounded-5 bg-white border-2 shadow-sm"
//               style={{ fontSize: "14px" }}
//               onClick={handleDownloadExcel}
//             >
//               Download Excel
//             </Button>
//           </div>

//           {/* Table */}
//           <Card className="border-0 p-3 my-3">
//             {error && <p className="text-danger">{error}</p>}
//             {loading && <p>Loading...</p>}
//             <div
//               className="table-responsive bg-white"
//               style={{ maxHeight: "65vh", overflowY: "auto" }}
//             >
//               <Table className="table table-hover align-middle">
//                 <thead
//                   className="text-white text-center sticky-top"
//                   style={{ backgroundColor: "#343a40" }}
//                 >
//                   <tr style={{ fontSize: "14px" }}>
//                     <th>Sl.No</th>
//                     <th>Quotation Id</th>
//                     <th>Name</th>
//                     <th>Phone No</th>
//                     <th>Payment ID</th>
//                     <th>Amount</th>
//                     <th>Status</th>
//                     <th>Date</th>
//                     <th></th>
//                   </tr>
//                 </thead>
//                 <tbody
//                   style={{ fontSize: "12px", textAlign: "center" }}
//                   className="fw-semibold"
//                 >
//                   {payments.length === 0 && !loading ? (
//                     <tr>
//                       <td colSpan="8" className="text-center">
//                         No payments found
//                       </td>
//                     </tr>
//                   ) : (
//                     payments.map((payment, index) => (
//                       <tr
//                         key={payment.id}
//                         style={{ cursor: "pointer" }}
//                         onClick={() =>
//                           navigate(
//                             `/payment/payment-details/${payment.quotationId}`
//                           )
//                         }
//                       >
//                         <td>{(currentPage - 1) * 10 + (index + 1)}</td>
//                         <td>{payment.quoteId}</td>
//                         <td>{payment.name}</td>
//                         <td>{payment.phone}</td>
//                         <td>{payment.paymentId}</td>
//                         <td>{payment.amount}</td>
//                         <td>
//                           <span
//                             className={`badge bg-${
//                               payment.status === "Completed"
//                                 ? "success"
//                                 : "warning"
//                             }`}
//                           >
//                             {payment.status}
//                           </span>
//                         </td>
//                         <td>{payment.date}</td>
//                         <td>
//                           <IoChevronForward size={20} />
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </Table>
//             </div>
//           </Card>

//           {/* Pagination */}
//           <DynamicPagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={setCurrentPage}
//           />
//         </Tab>

//         <Tab eventKey="vendor" title="Vendor Payments">
//           {/* Add Vendor Payment Button */}
//           <div className="d-flex justify-content-end mb-3">
//             <Button variant="dark" onClick={() => setShowVendorModal(true)}>
//               Add Vendor Payment
//             </Button>
//           </div>

//           {/* Vendor Payments Table */}
//           <Card className="border-0 p-3 my-3">
//             {vendorLoading && <p>Loading vendor payments...</p>}
//             <div
//               className="table-responsive bg-white"
//               style={{ maxHeight: "65vh", overflowY: "auto" }}
//             >
//               <Table className="table table-hover align-middle">
//                 <thead
//                   className="text-white text-center sticky-top"
//                   style={{ backgroundColor: "#343a40" }}
//                 >
//                   <tr style={{ fontSize: "14px" }}>
//                     <th>Sl.No</th>
//                     <th>Vendor Name</th>
//                     <th>Event Date</th>
//                     <th>Slot</th>
//                     <th>Total Amount</th>
//                     <th>Paid Amount</th>
//                     <th>Paid Date</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody
//                   style={{ fontSize: "12px", textAlign: "center" }}
//                   className="fw-semibold"
//                 >
//                   {vendors.length === 0 && !vendorLoading ? (
//                     <tr>
//                       <td colSpan="9" className="text-center">
//                         No vendor payments found
//                       </td>
//                     </tr>
//                   ) : (
//                     vendors.map((vendor, index) => (
//                       <tr key={vendor._id}>
//                         <td>{(vendorCurrentPage - 1) * 10 + (index + 1)}</td>
//                         <td>{vendor.vendorName}</td>
//                         <td>{toDisplayDate(vendor.eventDate)}</td>
//                         <td>{vendor.slot}</td>
//                         <td>
//                           ₹{vendor.totalAmount?.toLocaleString("en-IN") || "0"}
//                         </td>
//                         <td>
//                           ₹{vendor.paidAmount?.toLocaleString("en-IN") || "0"}
//                         </td>
//                         <td>{toDisplayDate(vendor.paidDate)}</td>
//                         <td>
//                           <span
//                             className={`badge bg-${
//                               vendor.status === "Completed"
//                                 ? "success"
//                                 : vendor.status === "Partial"
//                                 ? "warning"
//                                 : "secondary"
//                             }`}
//                           >
//                             {vendor.status}
//                           </span>
//                         </td>
//                         <td>
//                           {vendor.status !== "Completed" && (
//                             <Button
//                               variant="outline-primary"
//                               size="sm"
//                               onClick={() => openAddPaymentModal(vendor)}
//                             >
//                               Add Payment
//                             </Button>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </Table>
//             </div>
//           </Card>

//           {/* Vendor Payments Pagination */}
//           <DynamicPagination
//             currentPage={vendorCurrentPage}
//             totalPages={vendorTotalPages}
//             onPageChange={setVendorCurrentPage}
//           />
//         </Tab>
//       </Tabs>

//       {/* Vendor Payment Modal */}
//       <Modal
//         show={showVendorModal}
//         onHide={() => setShowVendorModal(false)}
//         size="lg"
//         centered
//       >
//         <Modal.Header closeButton className="px-4 pt-4">
//           <Modal.Title className="ms-2">Add Vendor Payment</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="px-4">
//           <Form>
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Vendor Name</Form.Label>
//                   <Select
//                     options={vendorOptions}
//                     onChange={handleVendorSelect}
//                     placeholder="Select a vendor"
//                     isClearable
//                     isSearchable
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Event Date</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={vendorPayment.eventDate}
//                     onChange={(e) =>
//                       setVendorPayment({
//                         ...vendorPayment,
//                         eventDate: e.target.value,
//                       })
//                     }
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Slot</Form.Label>
//                   <Form.Select
//                     value={vendorPayment.slot}
//                     onChange={(e) =>
//                       setVendorPayment({
//                         ...vendorPayment,
//                         slot: e.target.value,
//                       })
//                     }
//                   >
//                     <option value="">Select a slot</option>
//                     {timeSlots.map((slot, index) => (
//                       <option key={index} value={slot}>
//                         {slot}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Total Amount (₹)</Form.Label>
//                   <Form.Control
//                     type="number"
//                     value={vendorPayment.totalAmount}
//                     onChange={(e) =>
//                       setVendorPayment({
//                         ...vendorPayment,
//                         totalAmount: e.target.value,
//                       })
//                     }
//                     placeholder="Enter total amount"
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Paid Amount (₹)</Form.Label>
//                   <Form.Control
//                     type="number"
//                     value={vendorPayment.paidAmount}
//                     onChange={(e) =>
//                       setVendorPayment({
//                         ...vendorPayment,
//                         paidAmount: e.target.value,
//                       })
//                     }
//                     placeholder="Enter paid amount"
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Paid Date</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={vendorPayment.paidDate}
//                     onChange={(e) =>
//                       setVendorPayment({
//                         ...vendorPayment,
//                         paidDate: e.target.value,
//                       })
//                     }
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer className="justify-content-end px-4 pb-4">
//           <Button
//             variant="secondary"
//             onClick={() => setShowVendorModal(false)}
//             className="me-2"
//           >
//             Cancel
//           </Button>
//           <Button variant="dark" onClick={handleVendorPaymentSubmit}>
//             Save Payment
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Add Payment Modal */}
//       <Modal
//         show={showAddPaymentModal}
//         onHide={() => setShowAddPaymentModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Add Payment</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedVendorPayment && (
//             <>
//               <p>
//                 <strong>Vendor:</strong> {selectedVendorPayment.vendorName}
//               </p>
//               <p>
//                 <strong>Total Amount:</strong> ₹
//                 {selectedVendorPayment.totalAmount?.toLocaleString("en-IN")}
//               </p>
//               <p>
//                 <strong>Paid Amount:</strong> ₹
//                 {selectedVendorPayment.paidAmount?.toLocaleString("en-IN")}
//               </p>
//               <p>
//                 <strong>Due Amount:</strong> ₹
//                 {(
//                   selectedVendorPayment.totalAmount -
//                   selectedVendorPayment.paidAmount
//                 )?.toLocaleString("en-IN")}
//               </p>
//             </>
//           )}
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Amount to Pay (₹)</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={additionalPayment.amount}
//                 onChange={(e) =>
//                   setAdditionalPayment({
//                     ...additionalPayment,
//                     amount: e.target.value,
//                   })
//                 }
//                 placeholder="Enter amount"
//                 max={
//                   selectedVendorPayment
//                     ? selectedVendorPayment.totalAmount -
//                       selectedVendorPayment.paidAmount
//                     : undefined
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Payment Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={additionalPayment.paymentDate}
//                 onChange={(e) =>
//                   setAdditionalPayment({
//                     ...additionalPayment,
//                     paymentDate: e.target.value,
//                   })
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Note (Optional)</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 value={additionalPayment.note}
//                 onChange={(e) =>
//                   setAdditionalPayment({
//                     ...additionalPayment,
//                     note: e.target.value,
//                   })
//                 }
//                 placeholder="Add any note about this payment"
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowAddPaymentModal(false)}
//           >
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleAddPayment}>
//             Add Payment
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default PaymentPage;



import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Card,
  InputGroup,
  Row,
  Col,
  Modal,
  Tab,
  Tabs,
  OverlayTrigger, Tooltip
} from "react-bootstrap";
import Select from "react-select";
import { IoChevronForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import DynamicPagination from "../DynamicPagination";
import { FaEye } from "react-icons/fa";  // eye icon

// ---- Date helpers: handle "DD-MM-YYYY" and ISO strings ----
const parseMaybeDdmmyyyy = (str) => {
  if (!str) return null;

  // try native first (handles ISO etc.)
  const native = new Date(str);
  if (!Number.isNaN(native.getTime())) return native;

  // handle DD-MM-YYYY
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(str);
  if (m) {
    const [, dd, mm, yyyy] = m;
    // local time to avoid timezone day-shifts
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const toDisplayDate = (str) => {
  const d = parseMaybeDdmmyyyy(str);
  return d ? d.toLocaleDateString("en-GB") : "N/A"; // dd/mm/yyyy
};

// Format date for API (YYYY-MM-DD)
const formatDateForAPI = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [vendorCurrentPage, setVendorCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [vendorTotalPages, setVendorTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("client");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Vendor payment modal state
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorPayment, setVendorPayment] = useState({
    vendorName: "",
    vendorId: "",
    eventDate: "",
    slot: "",
    totalAmount: "",
    paidAmount: "",
    paidDate: "",
  });

  // Add payment modal state
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedVendorPayment, setSelectedVendorPayment] = useState(null);
  const [additionalPayment, setAdditionalPayment] = useState({
    amount: "",
    paymentDate: "",
    note: "",
  });


  // Predefined slots
  const timeSlots = [
    "Morning (8AM - 1PM)",
    "Afternoon (12PM - 5PM)",
    "Evening (5PM - 9PM)",
    "Midnight (9PM - 12AM)",

  ];

  // Fetch vendor options from API
  const fetchVendorOptions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/vendors");
      if (response.data.success && response.data.vendors) {
        const options = response.data.vendors.map((vendor) => ({
          value: vendor._id,
          label: vendor.name,
          data: vendor,
        }));
        setVendorOptions(options);
      }
    } catch (err) {
      toast.error("Failed to fetch vendors");
    }
  };

  // Fetch payments with pagination, search, and date filter
  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Format dates for API
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      const url = `http://localhost:5000/api/payments/completed?page=${currentPage}&limit=10&search=${encodeURIComponent(
        search
      )}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

      const response = await axios.get(url);
      const paymentsData = response.data.data || [];

      const paymentList = paymentsData.map((p, index) => {
        const completed = Array.isArray(p.completedInstallments)
          ? p.completedInstallments
          : [];

        const lastDue = completed.length
          ? completed[completed.length - 1].dueDate
          : null;

        return {
          id: `payment-${p.quotationId}-${index}`,
          quoteId: p.quotationNumber,
          quotationId: p.quotationId,
          name: p.firstPersonName,
          phone: p.firstPersonPhone,
          paymentId: `INST-${p.totalCompletedInstallments}`,
          amount: `₹${completed
            .reduce((sum, i) => sum + (i.amount || 0), 0)
            .toLocaleString("en-IN")}`,
          status: p.totalCompletedInstallments > 0 ? "Completed" : "Pending",
          date: toDisplayDate(lastDue),
        };
      });

      setPayments(paymentList);
      setTotalPages(response.data.totalPages || 1);
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch payments";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor payments
  const fetchVendorPayments = async () => {
    setVendorLoading(true);
    try {
      const url = `http://localhost:5000/api/vendors/vendor-payments`;
      const response = await axios.get(url);

      if (response.data.success && response.data.data) {
        // Convert object → array
        const vendorArray = Object.entries(response.data.data).map(
          ([vendorId, details]) => ({
            vendorId,
            ...details,
          })
        );
        setVendors(vendorArray);
      }
    } catch (err) {
      toast.error("Failed to fetch vendor payments");
    } finally {
      setVendorLoading(false);
    }
  };


  useEffect(() => {
    if (activeTab === "client") {
      fetchPayments();
    }
  }, [currentPage, search, startDate, endDate, activeTab]);

  useEffect(() => {
    if (activeTab === "vendor") {
      fetchVendorPayments();
      fetchVendorOptions();
    }
  }, [vendorCurrentPage, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  // Handle vendor selection
  const handleVendorSelect = (selectedOption) => {
    if (selectedOption) {
      setVendorPayment({
        ...vendorPayment,
        vendorName: selectedOption.label,
        vendorId: selectedOption.value,
      });
    } else {
      setVendorPayment({
        ...vendorPayment,
        vendorName: "",
        vendorId: "",
      });
    }
  };



  // Handle add payment to existing vendor payment
  const handleAddPayment = async () => {
    try {
      if (!additionalPayment.amount || !additionalPayment.paymentDate) {
        toast.error("Please fill amount and payment date");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/vendor-payments/${selectedVendorPayment._id}/payments`,
        {
          amount: parseFloat(additionalPayment.amount),
          paymentDate: additionalPayment.paymentDate,
          note: additionalPayment.note || "Additional payment",
        }
      );
      toast.success("Payment added successfully");
      setShowAddPaymentModal(false);
      setAdditionalPayment({ amount: "", paymentDate: "", note: "" });
      setSelectedVendorPayment(null);

      // Refresh vendor payments list
      fetchVendorPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add payment");
    }
  };


  // Fetch full report for Excel download
  const handleDownloadExcel = async () => {
    try {
      // Format dates for API
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      const url = `http://localhost:5000/api/payments/completed?search=${encodeURIComponent(
        search
      )}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&all=true`;

      const response = await axios.get(url);
      const fullData = response.data.data || [];

      const worksheetData = fullData.map((p) => {
        const completed = Array.isArray(p.completedInstallments)
          ? p.completedInstallments
          : [];
        const lastDue = completed.length
          ? completed[completed.length - 1].dueDate
          : null;

        return {
          "Quotation ID": p.quotationId,
          "Lead ID": p.leadId,
          "Query ID": p.queryId,
          "Customer Name": p.firstPersonName,
          Phone: p.firstPersonPhone,
          "Total Installments Completed": p.totalCompletedInstallments,
          "Total Amount Paid": completed.reduce(
            (sum, i) => sum + (i.amount || 0),
            0
          ),
          "Last Payment Date": toDisplayDate(lastDue),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
      XLSX.writeFile(workbook, "CompletedPaymentsReport.xlsx");

      toast.success("Excel downloaded successfully");
    } catch (err) {
      toast.error("Failed to download Excel");
    }
  };

  // Clear date filters
  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };
  return (
    <div
      className="container py-2 rounded vh-100"
      style={{ background: "#F4F4F4" }}
    >
      {/* Tabs for Client and Vendor Payments */}
      <Tabs
        activeKey={activeTab}
        onSelect={(tab) => setActiveTab(tab)}
        className="mb-3"
      >
        <Tab eventKey="client" title="Client Payments" >
          {/* Search and Date Filters */}
          <div className="mb-3 d-flex flex-wrap justify-content-between">
            <Form
              onSubmit={handleSearch}
              className="mb-2"
              style={{ width: "350px" }}
            >
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by name or phone"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  disabled={loading}
                />
                <Button variant="dark" type="submit" disabled={loading}>
                  Search
                </Button>
                {search && (
                  <Button
                    variant="outline-secondary"
                    onClick={handleClearSearch}
                    disabled={loading}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Form>
          </div>

          {/* Top Right Actions */}
          <div className="d-flex justify-content-end mb-2 gap-2">
            <Button
              variant="light-gray"
              className="btn rounded-5 bg-white border-2 shadow-sm"
              style={{ fontSize: "14px" }}
              onClick={handleDownloadExcel}
            >
              Download Excel
            </Button>
          </div>

          {/* Table */}
          <Card className="border-0 p-3 my-3">
            {error && <p className="text-danger">{error}</p>}
            {loading && <p>Loading...</p>}
            <div
              className="table-responsive bg-white"
              style={{ maxHeight: "65vh", overflowY: "auto" }}
            >
              <Table className="table table-hover align-middle">
                <thead
                  className="text-white text-center sticky-top"
                  style={{ backgroundColor: "#343a40" }}
                >
                  <tr style={{ fontSize: "14px" }}>
                    <th>Sl.No</th>
                    <th>Quotation Id</th>
                    <th>Name</th>
                    <th>Phone No</th>
                    <th>Payment ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody
                  style={{ fontSize: "12px", textAlign: "center" }}
                  className="fw-semibold"
                >
                  {payments.length === 0 && !loading ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment, index) => (
                      <tr
                        key={payment.id}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate(
                            `/payment/payment-details/${payment.quotationId}`
                          )
                        }
                      >
                        <td>{(currentPage - 1) * 10 + (index + 1)}</td>
                        <td>{payment.quoteId}</td>
                        <td>{payment.name}</td>
                        <td>{payment.phone}</td>
                        <td>{payment.paymentId}</td>
                        <td>{payment.amount}</td>
                        <td>
                          <span
                            className={`badge bg-${payment.status === "Completed"
                              ? "success"
                              : "warning"
                              }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td>{payment.date}</td>
                        <td>
                          <IoChevronForward size={20} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card>

          {/* Pagination */}
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Tab>

        <Tab eventKey="vendor" title="Vendor Payments">
          {/* Add Vendor Payment Button */}
          <div className="d-flex justify-content-end mb-3">
            <Button variant="dark" onClick={() => setShowVendorModal(true)}>
              Add Vendor Payment
            </Button>
          </div>

          {/* Vendor Payments Table */}
          <Card className="border-0 p-3 my-3">
            {vendorLoading && <p>Loading vendor payments...</p>}
            <div
              className="table-responsive bg-white"
              style={{ maxHeight: "65vh", overflowY: "auto" }}
            >
              <Table className="table table-hover align-middle">
                <thead
                  className="text-white text-center sticky-top"
                  style={{ backgroundColor: "#343a40" }}
                >
                  <tr style={{ fontSize: "14px" }}>
                    <th>Sl.No</th>
                    <th>Vendor Name</th>
                    <th>Total Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody
                  style={{ fontSize: "12px", textAlign: "center" }}
                  className="fw-semibold"
                >
                  {vendors.length === 0 && !vendorLoading ? (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No vendor payments found
                      </td>
                    </tr>
                  ) : (
                    vendors.map((vendor, index) => (
                      <tr key={vendor.vendorId}>
                        <td>{index + 1}</td>
                        <td>{vendor.vendorName}</td>
                        <td>₹{vendor.totalSalary?.toLocaleString("en-IN")}</td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-view-${vendor.vendorId}`}>View Details</Tooltip>}
                          >
                            <Button
                              variant="outline-dark"
                              size="sm"
                              onClick={() => {
                                setSelectedVendorPayment(vendor);
                                setShowAddPaymentModal(true);
                              }}
                            >
                              <FaEye />
                            </Button>
                          </OverlayTrigger>
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="ms-2"
                          >
                            Pay
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card>

          {/* Vendor Payments Pagination */}
          <DynamicPagination
            currentPage={vendorCurrentPage}
            totalPages={vendorTotalPages}
            onPageChange={setVendorCurrentPage}
          />
        </Tab>
      </Tabs>

      {/* Vendor Payment Modal */}
      <Modal
        show={showAddPaymentModal}
        onHide={() => {
          setShowAddPaymentModal(false);
          setSelectedVendorPayment(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "16px" }}>Vendor Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVendorPayment && (
            <div style={{ fontSize: "13px" }}>
              <div className="d-flex gap-5">
                <p>
                  <strong>Vendor:</strong> {selectedVendorPayment.vendorName}
                </p>
                <p>
                  <strong>Total Salary:</strong> ₹
                  {selectedVendorPayment.totalSalary?.toLocaleString("en-IN")}
                </p>
              </div>
              <hr />
              <h6>Events</h6>
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Quotation ID</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Slot</th>
                    <th>Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVendorPayment.events.map((e, i) => (
                    <tr key={i}>
                      <td>{e.quoteId}</td>
                      <td>{e.serviceName}</td>
                      <td>{toDisplayDate(e.eventDate)}</td>
                      <td>{e.slot}</td>
                      <td>₹{e.salary?.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddPaymentModal(false);
              setSelectedVendorPayment(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>


    </div>
  );
};

export default PaymentPage;



