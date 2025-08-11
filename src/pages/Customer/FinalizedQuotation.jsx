import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Table,
    Button,
    Card,
    Row,
    Col,
    Badge,
    Spinner,
    Alert,
} from "react-bootstrap";
import {
    FaWhatsapp,
    FaDownload,
    FaEdit,
    FaPrint,
    FaArrowLeft,
    FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const FinalizedQuotation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const pdfRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [quotation, setQuotation] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchQuotation = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/quotations/${id}`);
                const data = await res.json();
                if (data?.success) {
                    setQuotation(data.quotation);
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
    }, [id]);

    const handleDownloadPDF = async () => {
        if (!pdfRef.current) return;
        try {
            toast.promise(
                (async () => {
                    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF("p", "mm", "a4");
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgWidth = canvas.width;
                    const imgHeight = canvas.height;
                    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                    const imgX = (pdfWidth - imgWidth * ratio) / 2;
                    const imgY = 30;
                    pdf.setFontSize(20);
                    pdf.text("Quotation", pdfWidth / 2, 20, { align: "center" });
                    pdf.addImage(
                        imgData,
                        "PNG",
                        imgX,
                        imgY,
                        imgWidth * ratio,
                        imgHeight * ratio
                    );
                    pdf.save(`ClassyCaptures_Quotation_${quotation?.quotationId}.pdf`);
                })(),
                {
                    loading: "Generating PDF...",
                    success: "PDF downloaded successfully!",
                    error: "Failed to generate PDF.",
                }
            );
        } catch (err) {
            toast.error("Error generating PDF");
        }
    };

    const handleShareWhatsApp = () => {
        const totalAmount = (quotation.packages || []).reduce(
            (sum, pkg) => sum + (pkg.totalAmount || 0),
            0
        );
        let message = `*Quotation from Classy Captures*\n\n`;
        message += `*Customer:* ${quotation.leadId?.persons?.[0]?.name || "N/A"}\n`;
        message += `*Phone:* ${quotation.leadId?.persons?.[0]?.phoneNo || "N/A"}\n`;
        message += `*Event:* ${quotation.packages?.[0]?.categoryName || "N/A"}\n`;
        message += `*Date:* ${quotation.packages?.[0]?.eventStartDate || "N/A"}\n\n`;
        message += `*Package Details:*\n`;
        (quotation.packages || []).forEach((pkg, index) => {
            message += `\n${index + 1}. *${pkg.categoryName}*\n`;
            message += `   Date: ${pkg.eventStartDate}, Time: ${pkg.slot}\n`;
            message += `   Services: ${pkg.services.map((s) => s.serviceName).join(", ")}\n`;
        });
        message += `\n*Total Amount:* ₹${typeof totalAmount === 'number' ? totalAmount.toLocaleString() : '-'}`;
        message += `\n\n*Payment Plan:*\n`;
        (quotation.installments || []).forEach((inst, index) => {
            message += `Installment ${index + 1}: ${inst.paymentPercentage}% (₹${inst.paymentAmount !== undefined && inst.paymentAmount !== null ? inst.paymentAmount.toLocaleString() : '-'})\n`;
        });
        message += `\nThank you for choosing Classy Captures!`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappLink = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappLink, "_blank");
    };

    const handlePrint = () => {
        if (!pdfRef.current) return;
        const printWindow = window.open('', '_blank');
        const content = pdfRef.current.innerHTML;
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(`
              <html>
                <head>
                  <title>Quotation Print</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; border: 1px solid #ddd; }
                    th { background-color: #f4f4f4; }
                  </style>
                </head>
                <body>${content}</body>
              </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                <Spinner animation="border" role="status" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </div>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const { packages = [], installments = [], leadId } = quotation;
    const totalAmount = quotation.totalAmount || 0;
    const discount = quotation.discountValue || 0;
    const gst = quotation.gstValue || 0;
    const grandTotal = quotation.totalAfterDiscount || totalAmount;


    console.log("packages", packages)
    console.log("installments", installments)

    return (
        <div className="container py-4">
            {/* PDF Download/Share Controls */}
            <div className="d-flex gap-3 mb-4 position-sticky top-0 bg-white py-2" style={{ zIndex: 1000 }}>
                <Button
                    variant="light"
                    className="d-flex align-items-center gap-2 shadow-sm border rounded-3 px-3"
                    style={{ background: '#f4f4f4', fontWeight: 500 }}
                    onClick={handleShareWhatsApp}
                >
                    <FaWhatsapp className="text-success" /> Share
                </Button>
                <Button
                    variant="light"
                    className="d-flex align-items-center gap-2 shadow-sm border rounded-3 px-3"
                    style={{ background: '#fff', fontWeight: 500 }}
                    onClick={handleDownloadPDF}
                >
                    <FaDownload /> Download PDF
                </Button>
                <Button
                    variant="light"
                    className="d-flex align-items-center gap-2 shadow-sm border rounded-3 px-3"
                    style={{ background: '#fff', fontWeight: 500 }}
                    onClick={handlePrint}
                >
                    <FaPrint /> Print
                </Button>
                <Button
                    variant="light"
                    className="d-flex align-items-center gap-2 shadow-sm border rounded-3 px-3"
                    style={{ background: '#fff', fontWeight: 500 }}
                    onClick={() => navigate(`/customer/create-quote/${quotation.leadId?._id || ''}/${quotation.queryId}`, { state: { selectQuotationId: quotation._id } })}
                >
                    <FaEdit /> Edit Quotation
                </Button>
            </div>

            {quotation.bookingStatus === 'Booked' && (
                <div className="text-end mb-3">
                    <span className="fw-bold text-success fs-5">Status: Booked</span>
                </div>
            )}

            {/* Quotation Content (PDF-like format) */}
            <div ref={pdfRef}>
                {/* Letterhead */}
                <div className="text-center mb-4">
                    <h2 className="fw-bold">Classy Captures</h2>
                    <p className="text-muted mb-0">Professional Photography & Videography</p>
                    <p className="text-muted mb-0">123 Photography Lane, Bangalore - 560001</p>
                    <p className="text-muted">+91 98765 43210 | info@classycaptures.com</p>
                </div>
                <hr className="my-4" />
                {/* Quotation Header */}
                <div className="mb-4">
                    <h5 className="fw-bold text-center mb-4">QUOTATION</h5>
                    <Row>
                        <Col md={6}>
                            <h6 className="fw-bold mb-3">CLIENT DETAILS</h6>
                            <p className="mb-1"><strong>Name:</strong> {leadId?.persons?.[0]?.name || "N/A"}</p>
                            <p className="mb-1"><strong>Phone:</strong> {leadId?.persons?.[0]?.phoneNo || "N/A"}</p>
                            <p className="mb-1"><strong>Email:</strong> {leadId?.persons?.[0]?.email || "N/A"}</p>
                            <p className="mb-1"><strong>Whatsapp:</strong> {leadId?.persons?.[0]?.whatsappNo || leadId?.persons?.[0]?.phoneNo || "N/A"}</p>
                            <p className="mb-1"><strong>Reference:</strong> {leadId?.referenceForm || "N/A"}</p>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <h6 className="fw-bold mb-3">QUOTATION DETAILS</h6>
                            <p className="mb-1"><strong>Quotation ID:</strong> {quotation.quotationId}</p>
                            <p className="mb-1"><strong>Title:</strong> {quotation.quoteTitle}</p>
                            <p className="mb-1"><strong>Description:</strong> {quotation.quoteDescription}</p>
                            <p className="mb-1"><strong>Date:</strong> {formatDate(quotation.createdAt)}</p>
                        </Col>
                    </Row>
                </div>
                {/* Package Details */}
                <div className="mb-4">
                    <h5 className="fw-bold mb-3">PACKAGE DETAILS</h5>
                    {packages.map((pkg, index) => {
                        const pkgTotal = (pkg.services || []).reduce((sum, s) => sum + (parseFloat(s.price) || 0) * (parseInt(s.qty) || 1), 0);
                        return (
                            <Card className="mb-3 border" key={pkg._id || index}>
                                <Card.Header className="bg-light">
                                    <h6 className="fw-bold mb-0">{pkg.categoryName && pkg.categoryName.includes(' - ') ? pkg.categoryName.split(' - ')[0] : pkg.categoryName}</h6>
                                    <small className="text-muted d-block">
                                        {formatDate(pkg.eventStartDate)} to {formatDate(pkg.eventEndDate)} | {pkg.slot}
                                    </small>
                                    {(pkg.venueName || pkg.venueAddress) && (
                                        <div className="mt-2">
                                            {pkg.venueName && (
                                                <small className=" d-block"><strong>Venue:</strong> {pkg.venueName}</small>
                                            )}
                                            {pkg.venueAddress && (
                                                <small className=" d-block"><strong>Address:</strong> {pkg.venueAddress}</small>
                                            )}
                                        </div>
                                    )}
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <Table bordered hover responsive className="mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="py-2" style={{ width: "5%" }}>No</th>
                                                <th className="py-2" style={{ width: "55%" }}>Service</th>
                                                <th className="py-2 text-center" style={{ width: "10%" }}>Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pkg.services && pkg.services.map((service, idx) => (
                                                <tr key={service._id || idx}>
                                                    <td className="py-2 text-center">{idx + 1}</td>
                                                    <td className="py-2">{service.serviceName}</td>
                                                    <td className="py-2 text-center">{service.qty}</td>
                                                </tr>
                                            ))}
                                            <tr className="fw-bold">
                                                <td colSpan="2" className="text-left py-2">Package Total:</td>
                                                <td className="text-left py-2">₹{typeof pkgTotal === 'number' ? pkgTotal.toLocaleString() : '-'}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        );
                    })}
                    {/* Grand Total */}
                    <div className="bg-light p-3 text-end fw-bold border">
                        <div className="mb-0 d-flex justify-content-between">
                            <h5>Total:</h5>
                            <h5>₹{typeof totalAmount === 'number' ? totalAmount.toLocaleString() : '-'}</h5>
                        </div>
                        <div className="mb-0 d-flex justify-content-between">
                            <h5>Discount:</h5>
                            <h5>- ₹{typeof discount === 'number' ? discount.toLocaleString() : '-'}</h5>
                        </div>
                        <div className="mb-0 d-flex justify-content-between">
                            <h5 className="mb-0" style={{ fontSize: "18px" }}>GST <span className="" style={{ fontSize: "16px" }}>5%</span></h5>
                            <h5>₹{typeof gst === 'number' ? gst.toLocaleString() : '-'}</h5>
                        </div>
                        <hr />
                        <div className="mb-0 text-success d-flex justify-content-between">
                            <h5>Grand Total:</h5>
                            <h5>₹{typeof grandTotal === 'number' ? grandTotal.toLocaleString() : '-'}</h5>
                        </div>
                    </div>
                </div>
                {/* Payment Terms */}
                <div className="mb-4">
                    <h5 className="fw-bold mb-3">PAYMENT SCHEDULE</h5>
                    <Table bordered responsive>
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "5%" }}>No</th>
                                <th style={{ width: "40%" }}>Installment</th>
                                <th style={{ width: "15%" }}>Percentage</th>
                                <th style={{ width: "20%" }}>Amount</th>
                                <th style={{ width: "20%" }}>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(installments || []).map((inst, idx) => (
                                <tr key={inst._id || idx}>
                                    <td>{idx + 1}</td>
                                    <td>Installment {inst.installmentNumber || idx + 1}</td>
                                    <td>{inst.paymentPercentage}%</td>
                                    <td>₹{inst.paymentAmount !== undefined && inst.paymentAmount !== null ? inst.paymentAmount.toLocaleString() : '-'}</td>
                                    <td>{inst.dueDate ? formatDate(inst.dueDate) : '-'}</td>
                                </tr>
                            ))}
                            <tr className="fw-bold">
                                <td colSpan="2" className="text-end">Total:</td>
                                <td>{(installments || []).reduce((sum, inst) => sum + (inst.paymentPercentage || 0), 0)}%</td>
                                <td colSpan="2">₹{typeof totalAmount === 'number' ? totalAmount.toLocaleString() : '-'}</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
                {/* Terms and Conditions */}
                <div className="mb-4">
                    <h5 className="fw-bold mb-3">TERMS AND CONDITIONS</h5>
                    <ol className="ps-3">
                        <li className="mb-2">This quotation is valid for 30 days from the date of issue.</li>
                        <li className="mb-2">A booking fee of {(installments[0]?.paymentPercentage || 30)}% is required to confirm the booking.</li>
                        <li className="mb-2">All payments are non-refundable.</li>
                        <li className="mb-2">Any additional hours or services will be charged separately.</li>
                        <li className="mb-2">Delivery of final products will be within 45-60 days after the event.</li>
                        <li className="mb-2">Travel outside of city limits may incur additional charges.</li>
                    </ol>
                </div>
                {/* Footer */}
                <div className="mt-5 pt-4">
                    <Row>
                        <Col md={6}>
                            <p className="mb-0 fw-bold">Client Signature</p>
                            <p className="text-muted">________________</p>
                        </Col>
                        <Col md={6} className="text-end">
                            <p className="mb-0 fw-bold">For Classy Captures</p>
                            <p className="text-muted">________________</p>
                        </Col>
                    </Row>
                </div>
                <div className="text-center mt-5 pt-4 text-muted">
                    <p>Thank you for choosing Classy Captures!</p>
                    <p className="small">© {new Date().getFullYear()} Classy Captures. All rights reserved.</p>
                </div>
            </div>
            {/* Action Buttons */}
            <div className="d-flex justify-content-end mt-4">
                {quotation?.finalized && quotation?.bookingStatus !== "Booked" && (
                    <Button variant="success" className="px-4" onClick={() => navigate(`/payment/installment-details/${quotation._id}`)}>
                        Confirm Booking
                    </Button>
                )}
            </div>
        </div>
    );
};

export default FinalizedQuotation;
