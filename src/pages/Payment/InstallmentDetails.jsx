// import React, { useState, useEffect } from "react";
// import { Table, Form, Button, Modal, Card, Alert } from "react-bootstrap";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import cashPay from "../../assets/icons/cashPay.png";
// import onlinePay from "../../assets/icons/onlinePay.png";


// const paymentModes = [
//   { value: '', label: '-' },
//   { value: 'Online', label: 'Online' },
//   { value: 'Cash', label: 'Cash' },
//   { value: 'Cheque', label: 'Cheque' },
//   { value: 'Other', label: 'Other' },
// ];

// const InstallmentDetails = () => {
//   const { quotationId } = useParams();
//   const navigate = useNavigate();
//   const [showModal, setShowModal] = useState(false);
//   const [selectedInstallment, setSelectedInstallment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [customerId, setCustomerId] = useState(null);
//   const [error, setError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [quotation, setQuotation] = useState(null);
//   const [installments, setInstallments] = useState([]);
//   const [generatingInvoice, setGeneratingInvoice] = useState(false);

//   const fetchQuotation = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`http://localhost:5000/api/quotations/${quotationId}`);
//       const data = await res.json();
//       if (data?.success) {
//         setQuotation(data.quotation);
//         setCustomerId(data.quotation.leadId?._id?.toString() || null);
//         setError("");
//         setInstallments(data.quotation.installments || []);
//       } else {
//         setError("Quotation not found.");
//       }
//     } catch (err) {
//       setError("Failed to load quotation. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchQuotation();
//   }, [quotationId]);

//   // const installments = installmentsState;

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "-";
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return dateStr;
//     return date.toLocaleDateString("en-GB");
//   };

//   const handleInstallmentFieldChange = async (index, field, value) => {
//     const updated = [...installments];
//     const inst = updated[index];
//     const oldValue = inst[field];
//     updated[index] = { ...inst, [field]: value };
//     setInstallments(updated);

//     // Backend update logic
//     try {
//       const payload = { [field]: value };
//       const res = await axios.put(
//         `http://localhost:5000/api/quotations/${quotationId}/installment/${inst._id}`,
//         payload
//       );
//       if (res.data && res.data.success) {
//         toast.success("Installment updated successfully!");
//         fetchQuotation()
//       } else {
//         throw new Error(res.data?.message || "Update failed");
//       }

//     } catch (err) {
//       // Rollback local state if backend update fails
//       const rollback = [...installments];
//       rollback[index] = { ...inst, [field]: oldValue };
//       setInstallments(rollback);
//       toast.error("Failed to update installment. Please try again.");
//     }
//   };

//   // Handler for Generate Invoice
//   const handleGenerateInvoice = async () => {
//     const firstCompleted = installments.find(inst => inst.status === 'Completed');
//     if (!firstCompleted) return;
//     setGeneratingInvoice(true);
//     try {
//       const res = await axios.post(`http://localhost:5000/api/quotations/${quotation._id}/generate-invoice`);
//       if (res.data && res.data.success) {
//         toast.success('Invoice generated!');
//         navigate(`/invoice/${quotation._id}`, { state: { quotationId, customerId, installment: firstCompleted } });
//       } else {
//         toast.error(res.data?.message || 'Failed to generate invoice.');
//       }
//     } catch (err) {
//       toast.error('Failed to generate invoice.');
//     } finally {
//       setGeneratingInvoice(false);
//     }
//   };

//   if (loading) {
//     return <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>Loading...</div>;
//   }

//   if (error) {
//     return (
//       <div className="container py-5">
//         <Alert variant="warning">
//           <Alert.Heading>Error</Alert.Heading>
//           <p>{error}</p>
//           <Button variant="primary" onClick={() => navigate("/payments")}>Go Back to Payments</Button>
//         </Alert>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
//       <Card className="border-0 p-3 my-3 mb-5">
//         {installments.some(inst => inst.status === 'Completed') && (
//           <div className="mb-3 d-flex justify-content-end">
//             <Button
//               variant="dark"
//               disabled={generatingInvoice}
//               onClick={handleGenerateInvoice}
//             >
//               {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
//             </Button>
//           </div>
//         )}

//         <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
//           <Table className="table table-hover align-middle">
//             <thead className="text-white text-center sticky-top" style={{ backgroundColor: "#333a40" }}>
//               <tr style={{ fontSize: "14px" }}>
//                 <th>Sl.No</th>
//                 <th>Installment</th>
//                 <th>Amount</th>
//                 <th>Percentage</th>
//                 <th>Date</th>
//                 <th>Mode</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody style={{ fontSize: "12px", textAlign: "center" }} className="fw-semibold">
//               {installments.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="text-center">No installments found for this quotation</td>
//                 </tr>
//               ) : (
//                 installments.map((inst, index) => (
//                   <tr key={inst._id || inst.id || index}>
//                     <td>{String(index + 1).padStart(2, "0")}</td>
//                     <td>{`Installment ${inst.installmentNumber || index + 1}`}</td>
//                     <td>₹{inst.paymentAmount !== undefined && inst.paymentAmount !== null ? inst.paymentAmount.toLocaleString() : '-'}</td>
//                     <td>{inst.paymentPercentage !== undefined && inst.paymentPercentage !== null ? `${inst.paymentPercentage}%` : '-'}</td>
//                     <td>
//                       <Form.Control
//                         type="date"
//                         value={inst.dueDate ? inst.dueDate.slice(0, 10) : ''}
//                         onChange={e => handleInstallmentFieldChange(index, 'dueDate', e.target.value)}
//                         size="sm"
//                       />
//                     </td>
//                     <td>
//                       <Form.Select
//                         value={inst.paymentMode || ''}
//                         onChange={e => handleInstallmentFieldChange(index, 'paymentMode', e.target.value)}
//                         size="sm"
//                       >
//                         {paymentModes.map(opt => (
//                           <option key={opt.value} value={opt.value}>{opt.label}</option>
//                         ))}
//                       </Form.Select>
//                     </td>
//                     <td>
//                       {inst.status === 'Completed' ? (
//                         <span style={{ background: '#d4edda', color: '#155724', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
//                           Completed
//                         </span>
//                       ) : (
//                         <span style={{ background: '#f8d7da', color: '#721c24', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
//                           {inst.status || 'Pending'}
//                         </span>
//                       )}
//                     </td>

//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </Table>
//         </div>
//         {quotation && (
//           <div className="mb-3 d-flex justify-content-end">
//             <span className="fw-bold" style={{ fontSize: "16px" }}>
//               Total Amount:&nbsp;
//               <span className="text-success">₹{quotation.totalAmount?.toLocaleString() || '-'}</span>
//             </span>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default InstallmentDetails;

import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal, Card, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

const paymentModes = [
  { value: '', label: '-' },
  { value: 'Online', label: 'Online' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Other', label: 'Other' },
];

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  // { value: 'Partial Paid', label: 'Partial Paid' },
  { value: 'Completed', label: 'Completed' },
];

const InstallmentDetails = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Online',
    amount: 0,
    status: 'Partial Paid'
  });
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/quotations/${quotationId}`);
      const data = await res.json();
      if (data?.success) {
        setQuotation(data.quotation);
        setCustomerId(data.quotation.leadId?._id?.toString() || null);
        setError("");
        setInstallments(data.quotation.installments || []);
      } else {
        setError("Quotation not found.");
      }
    } catch (err) {
      setError("Failed to load quotation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [quotationId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-GB");
  };

  const handlePaymentClick = (installment) => {
    setSelectedInstallment(installment);
    setPaymentData({
      paymentDate: installment.dueDate
        ? dayjs(installment.dueDate, ["DD-MM-YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"), // default today
      paymentMode: installment.paymentMode || "Online",
      amount: installment.paymentAmount || 0,
      status: installment.status || "Partial Paid"
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        dueDate: dayjs(paymentData.paymentDate, "YYYY-MM-DD").format("DD-MM-YYYY"),
        paymentMode: paymentData.paymentMode,
        paymentAmount: paymentData.amount,
        status: paymentData.status
      };
  
      const res = await axios.put(
        `http://localhost:5000/api/quotations/${quotationId}/installments/${selectedInstallment._id}/first-payment`,
        payload
      );
  
      if (res.data && res.data.success) {
        toast.success("Payment recorded successfully!");
        setShowPaymentModal(false);
        fetchQuotation();
      } else {
        throw new Error(res.data?.message || "Payment failed");
      }
    } catch (err) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGenerateInvoice = async () => {
    const firstCompleted = installments.find(inst => inst.status === 'Completed');
    if (!firstCompleted) return;
    setGeneratingInvoice(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/quotations/${quotation._id}/generate-invoice`);
      if (res.data && res.data.success) {
        toast.success('Invoice generated!');
        navigate(`/invoice/${quotation._id}`, { state: { quotationId, customerId, installment: firstCompleted } });
      } else {
        toast.error(res.data?.message || 'Failed to generate invoice.');
      }
    } catch (err) {
      toast.error('Failed to generate invoice.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>Loading...</div>;
  }

  if (error) {
    return (
      <div className="container py-5">
        <Alert variant="warning">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate("/payments")}>Go Back to Payments</Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
      <Card className="border-0 p-3 my-3 mb-5">
        {installments.some(inst => inst.status === 'Completed') && (
          <div className="mb-3 d-flex justify-content-end">
            <Button
              variant="dark"
              disabled={generatingInvoice}
              onClick={handleGenerateInvoice}
            >
              {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </div>
        )}

        <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top" style={{ backgroundColor: "#333a40" }}>
              <tr style={{ fontSize: "14px" }}>
                <th>Sl.No</th>
                <th>Installment</th>
                <th>Amount</th>
                <th>Percentage</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "12px", textAlign: "center" }} className="fw-semibold">
              {installments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">No installments found for this quotation</td>
                </tr>
              ) : (
                installments.map((inst, index) => (
                  <tr key={inst._id || inst.id || index}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{`Installment ${inst.installmentNumber || index + 1}`}</td>
                    <td>₹{inst.paymentAmount !== undefined && inst.paymentAmount !== null ? inst.paymentAmount.toLocaleString() : '-'}</td>
                    <td>{inst.paymentPercentage !== undefined && inst.paymentPercentage !== null ? `${inst.paymentPercentage}%` : '-'}</td>
                    <td>{inst.dueDate || "-"}</td>
                    <td>{inst.paymentMode || "-"}</td>
                    <td>
                      <span className={`badge ${inst.status === 'Completed' ? 'bg-success' :
                          inst.status === 'Partial Paid' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                        {inst.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handlePaymentClick(inst)}
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

        {/* Payment Modal */}
        <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Record Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Payment Date</Form.Label>
                <Form.Control
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Payment Mode</Form.Label>
                <Form.Select
                  value={paymentData.paymentMode}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                >
                  {paymentModes.filter(mode => mode.value).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={paymentData.amount}
                  readOnly // Make the amount field non-editable
                  plaintext // Makes it look like regular text
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={paymentData.status}
                  onChange={(e) => setPaymentData({ ...paymentData, status: e.target.value })}
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePaymentSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Submit Payment'}
            </Button>
          </Modal.Footer>
        </Modal>

        {quotation && (
          <div className="mb-3 d-flex justify-content-end">
            <span className="fw-bold" style={{ fontSize: "16px" }}>
              Total Amount:&nbsp;
              <span className="text-success">₹{quotation.totalAmount?.toLocaleString() || '-'}</span>
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InstallmentDetails;