import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Image, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import logo from "../../assets/icons/logo.png";
import { API_URL } from '../../utils/api';

const Invoice = () => {
  const { quotationId } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuotation = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/quotations/${quotationId}`);
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

  // Helper function to format album details
  const formatAlbumDetails = (album) => {
    const details = [];
    const { snapshot, extras, qty, customizePerUnit } = album;

    // Basic album info
    details.push(`Box: ${snapshot?.boxLabel || 'None'}`);

    // Additional sheets info
    if (snapshot?.sheetTypes?.length > 0) {
      if (customizePerUnit && extras?.perUnit) {
        // Per-unit customization
        extras.perUnit.forEach((unit, index) => {
          snapshot.sheetTypes.forEach(sheetType => {
            // Handle both Map and plain object formats
            const sheetQty = unit instanceof Map ?
              unit.get(sheetType.id) || 0 :
              unit[sheetType.id] || 0;

            if (sheetQty > 0) {
              details.push(
                `Unit ${index + 1}: ${sheetQty} ${sheetType.label} sheets`
              );
            }
          });
        });
      } else if (extras?.shared) {
        // Shared customization
        snapshot.sheetTypes.forEach(sheetType => {
          // Handle both Map and plain object formats
          const sheetQty = extras.shared instanceof Map ?
            extras.shared.get(sheetType.id) || 0 :
            extras.shared[sheetType.id] || 0;

          if (sheetQty > 0) {
            details.push(
              `${sheetQty} ${sheetType.label} sheets`
            );
          }
        });
      }
    }

    return details;
  };

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
      phone: quotation.leadId?.persons?.[0]?.phoneNo || '-',
      email: quotation.leadId?.persons?.[0]?.email || '-',
      state: 'Karnataka',
      stateCode: '29',
    },
    services: quotation.packages
      ?.map((pkg, idx) => ({
        name: pkg.categoryName || pkg.packageType || `Package ${idx + 1}`,
        hsn: '998391',
        amount: pkg.services?.reduce((sum, srv) => sum + (srv.price || 0), 0) || 0,
      }))
      .filter(service => service.amount > 0) || [],
    albums: quotation.albums?.map(album => ({
      name: album.snapshot?.templateLabel || 'Album',
      qty: album.qty || 1,
      total: album.suggested?.finalTotal || 0,
      details: formatAlbumDetails(album)
    })) || [],

    payment: {
      paid: quotation.installments?.reduce((sum, i) => sum + (i.paidAmount || 0), 0) || 0,
      pending: quotation.installments?.reduce((sum, i) => sum + (i.pendingAmount || 0), 0) || 0,
    }

  };

  // Calculate totals
  const packageSubtotal = invoiceData.services.reduce((sum, item) => sum + item.amount, 0);
  const albumSubtotal = invoiceData.albums.reduce((sum, item) => sum + item.total, 0);
  const subtotal = packageSubtotal + albumSubtotal;
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
          <p className="mb-1">📞 {invoiceData.client.phone}</p>
          <p className="mb-1">📧 {invoiceData.client.email}</p>
          <p className="mb-0">State: {invoiceData.client.state}, Code: {invoiceData.client.stateCode}</p>
        </div>

        {/* Services Table */}
        <Table bordered responsive className="mb-4">
          <thead className="text-center table-light">
            <tr>
              <th>SI No.</th>
              <th>Particulars</th>
              <th>HSN/SAC</th>
              <th className="text-end">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {/* Package Services */}
            {invoiceData.services.map((service, index) => (
              <tr key={`pkg-${index}`}>
                <td className="text-center">{index + 1}</td>
                <td>{service.name}</td>
                <td className="text-center">{service.hsn}</td>
                <td className="text-end">{service.amount.toLocaleString()}</td>
              </tr>
            ))}

            {/* Album Services */}
            {invoiceData.albums.map((album, index) => (
              <React.Fragment key={`album-${index}`}>
                <tr>
                  <td className="text-center">{invoiceData.services.length + index + 1}</td>
                  <td>
                    <div>Album - {album.name}</div>
                    <div className="small text-muted">Quantity: {album.qty}</div>
                    {album.details.map((detail, i) => (
                      <div key={`album-detail-${i}`} className="small text-muted ps-3">
                        {detail}
                      </div>
                    ))}
                  </td>
                  <td className="text-center">998391</td>
                  <td className="text-end">₹{album.total.toLocaleString()}</td>
                </tr>
              </React.Fragment>
            ))}

            {/* Totals */}
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

            {gstApplied && gstValue > 0 && (
              <tr>
                <td colSpan={2}></td>
                <td className="text-end fw-bold">GST 18%</td>
                <td className="text-end">₹{gstValue.toLocaleString()}</td>
              </tr>
            )}

            <tr className="table-light">
              <td colSpan={2}></td>
              <td className="text-end fw-bold">Grand Total</td>
              <td className="text-end fw-bold">₹{grandTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </Table>

        {/* Payment Summary */}
        <div className="mt-4">
          <h6 className="fw-bold">Payment Summary</h6>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td>Total Amount</td>
                <td className="text-end">₹{grandTotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Amount Paid</td>
                <td className="text-end">₹{invoiceData.payment.paid.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Balance Due</td>
                <td className="text-end">₹{invoiceData.payment.pending.toLocaleString()}</td>
              </tr>
            </tbody>
          </Table>
        </div>

        {/* Bank Details - Only show if GST is applied */}
        {gstApplied && (
          <div className="mt-4">
            <h6 className="fw-bold">Bank Details</h6>
            <Row>
              <Col md={6}>
                <div className="small ps-2">
                  <p className="mb-1"><strong>Bank Name:</strong> {invoiceData.company.bank.bankName}</p>
                  <p className="mb-1"><strong>Account Holder:</strong> {invoiceData.company.bank.accountHolder}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="small ps-2">
                  <p className="mb-1"><strong>Account Number:</strong> {invoiceData.company.bank.accountNumber}</p>
                  <p className="mb-1"><strong>IFSC Code:</strong> {invoiceData.company.bank.ifsc}</p>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="mt-5">
          <h6 className="fw-bold">Terms & Conditions</h6>
          <ul className="small ps-3">
            <li>Payment is due within 7 days unless otherwise stated.</li>
            {gstApplied && <li>All services are subject to applicable GST.</li>}
            <li>No refunds are provided once the services commence.</li>
            <li>Album delivery timelines will be communicated separately.</li>
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