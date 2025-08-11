import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Image } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import logo from "../../assets/icons/logo.png";

const Invoice = () => {
  const { quotationId } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuotation = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/quotations/${quotationId}`);
        const data = await res.json();
        if (data?.success) {
          setQuotation(data.quotation);
          setError("");
        } else {
          setError("Quotation not found.");
        }
      } catch (err) {
        setError("Failed to load quotation. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [quotationId]);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>Loading...</div>;
  }
  if (error || !quotation) {
    return <div className="container py-5 text-center text-danger">{error || "Failed to load invoice data."}</div>;
  }

  // Map backend data to UI fields
  const invoiceData = {
    invoiceNo: quotation.invoiceNumber || quotation.quotationId || quotation._id?.slice(-6).toUpperCase() || '-',
    date: quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString("en-GB") : '-',
    company: {
      name: 'Classy Captures',
      address: '#232, XYZ, BHEL Layout, RR Nagar, Bangalore',
      gst: '1234NT6566TH88',
      state: 'Karnataka',
      stateCode: '29',
      email: 'contact@classycaptures.com',
      phone: '+91 98765 43210',
      bank: {
        bankName: 'HDFC Bank',
        accountHolder: 'Classy Captures',
        accountNumber: '12345678901234',
        ifsc: 'HDFC0001234',
        branch: 'RR Nagar, Bangalore',
      }
    },
    client: {
      name: quotation.leadId?.persons?.[0]?.name || '-',
      // address: quotation.leadId?.persons?.[0]?.address || '-',
      phone: quotation.leadId?.persons?.[0]?.phoneNo || '-',
      email: quotation.leadId?.persons?.[0]?.email || '-',
      state: 'Karnataka',
      stateCode: '29',
    },
    services: quotation.packages?.map((pkg, idx) => ({
      name: pkg.categoryName || pkg.packageType || `Package ${idx + 1}`,
      hsn: '998391',
      amount: pkg.services?.reduce((sum, srv) => sum + (srv.price || 0), 0) || 0,
    })) || [],
    payment: {
      paid: quotation.installments?.filter(i => i.status === 'Completed').reduce((sum, i) => sum + (i.paymentAmount || 0), 0) || 0,
      installment: (() => {
        const paid = quotation.installments?.filter(i => i.status === 'Completed');
        if (paid && paid.length > 0) {
          const last = paid[paid.length - 1];
          return {
            number: last.installmentNumber || '-',
            of: quotation.installments?.length || '-',
            amountPaid: last.paymentAmount || 0,
            date: last.dueDate ? new Date(last.dueDate).toLocaleDateString("en-GB") : '-',
          };
        } else {
          return {
            number: '-',
            of: quotation.installments?.length || '-',
            amountPaid: 0,
            date: '-',
          };
        }
      })()
    }
  };

  // Use backend values for all totals
  const subtotal = invoiceData.services.reduce((sum, item) => sum + item.amount, 0);
  const discountPercent = quotation.discountPercent || 0;
  const discountValue = quotation.discountValue || 0;
  const gstValue = quotation.gstValue || 0;
  const grandTotal = quotation.totalAmount || 0;
  const amountDue = grandTotal - invoiceData.payment.paid;
  const gstApplied = quotation.gstApplied;

  return (
    <Container className="my-4">
      <h4 className='text-center mb-4'>{gstApplied ? 'Tax Invoice' : 'Performa Invoice'}</h4>
      <Card className="border-0 p-4 shadow-sm">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Image src={logo} alt="Logo" height={50} className="mb-2" />
            <h5 className="fw-bold mb-1">{invoiceData.company.name}</h5>
            <p className="mb-1">{invoiceData.company.address}</p>
            <p className="mb-1">GSTIN: {invoiceData.company.gst}</p>
            <p className="mb-1">State: {invoiceData.company.state}, Code: {invoiceData.company.stateCode}</p>
            <p className="mb-0">📧 {invoiceData.company.email} | 📞 {invoiceData.company.phone}</p>
          </div>
          <div className="text-end">
            <h4 className="fw-bold">INVOICE</h4>
            <p><strong>Invoice No:</strong> {invoiceData.invoiceNo}</p>
            <p><strong>Date:</strong> {invoiceData.date}</p>
          </div>
        </div>

        <hr />

        {/* Bill To */}
        <div className="mb-4">
          <h6 className="fw-bold">Bill To:</h6>
          <p className="mb-1"><strong>{invoiceData.client.name}</strong></p>
          {/* <p className="mb-1">{invoiceData.client.address}</p> */}
          <p className="mb-1">📞 {invoiceData.client.phone}</p>
          <p className="mb-1">📧 {invoiceData.client.email}</p>
          <p className="mb-0">State: {invoiceData.client.state}, Code: {invoiceData.client.stateCode}</p>
        </div>

        {/* Services Table */}
        <Table bordered responsive>
          <thead className="text-center table-light">
            <tr>
              <th>SI No.</th>
              <th>Particulars</th>
              <th>HSN/SAC</th>
              <th className="text-end">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.services.map((service, index) => (
              <tr key={index}>
                <td className="text-center">{index + 1}</td>
                <td>{service.name}</td>
                <td className="text-center">{service.hsn}</td>
                <td className="text-end">{service.amount.toLocaleString()}</td>
              </tr>
            ))}
            {(discountValue > 0 || gstValue > 0) ? (
              <>
                <tr>
                  <td colSpan={2}></td>
                  <td className="text-end fw-bold">Subtotal</td>
                  <td className="text-end">₹{subtotal.toLocaleString()}</td>
                </tr>
                {discountValue > 0 && (
                  <tr>
                    <td colSpan={2}></td>
                    <td className="text-end fw-bold">Discount ({discountPercent}%)</td>
                    <td className="text-end text-danger">- ₹{discountValue.toLocaleString()}</td>
                  </tr>
                )}
                {gstValue > 0 && (
                  <tr>
                    <td colSpan={2}></td>
                    <td className="text-end fw-bold">GST</td>
                    <td className="text-end">₹{gstValue.toLocaleString()}</td>
                  </tr>
                )}
                <tr className="table-light">
                  <td colSpan={2}></td>
                  <td className="text-end fw-bold">Grand Total</td>
                  <td className="text-end fw-bold">₹{grandTotal.toLocaleString()}</td>
                </tr>
              </>
            ) : (
              <tr className="table-light">
                <td colSpan={2}></td>
                <td className="text-end fw-bold">Total</td>
                <td className="text-end fw-bold">₹{grandTotal.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Payment Summary */}
        <div className="mt-4">
          <h6 className="fw-bold">Payment Summary</h6>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td>Amount Paid</td>
                <td className="text-end">₹{invoiceData.payment.paid.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Balance Due</td>
                <td className="text-end">₹{amountDue.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Installment Info</td>
                <td className="text-end">
                  Installment {invoiceData.payment.installment.number} of {invoiceData.payment.installment.of} <br />
                  ₹{invoiceData.payment.installment.amountPaid.toLocaleString()} paid on {invoiceData.payment.installment.date}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>

        {/* Bank Details (Simple UI) */}
        <div className="mt-4">
          <h6 className="fw-bold">Bank Details</h6>
          <div className="small ps-2">
            <p className="mb-1"><strong>Bank Name:</strong> {invoiceData.company.bank.bankName}</p>
            <p className="mb-1"><strong>Account Holder:</strong> {invoiceData.company.bank.accountHolder}</p>
            <p className="mb-1"><strong>Account Number:</strong> {invoiceData.company.bank.accountNumber}</p>
            <p className="mb-1"><strong>IFSC Code:</strong> {invoiceData.company.bank.ifsc}</p>
            <p className="mb-0"><strong>Branch:</strong> {invoiceData.company.bank.branch}</p>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mt-5">
          <h6 className="fw-bold">Terms & Conditions</h6>
          <ul className="small ps-3">
            <li>Payment is due within 7 days unless otherwise stated.</li>
            <li>All services are subject to applicable GST.</li>
            <li>No refunds are provided once the services commence.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center text-muted small">
          <p>Thank you for choosing <strong>{invoiceData.company.name}</strong>!</p>
          <p>This is a computer-generated invoice. No signature is required.</p>
        </div>
      </Card>
    </Container>
  );
};

export default Invoice;
