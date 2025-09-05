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
import { useSelector } from "react-redux";
import { selectLeadsList } from "../../store/slices/leadsSlice";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const FinalQuotationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState(null);
  const [packages, setPackages] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [error, setError] = useState("");
  const [savedQuotations, setSavedQuotations] = useState([]);
  const [customer, setCustomer] = useState(null);

  // Get customer data from Redux
  const leadsList = useSelector(selectLeadsList);
  const lead = leadsList.find((lead) => lead._id === id);


  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/customer/${id}`);
        const data = await response.json();
        if (data?.data) {
          setCustomer(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch customer via API:", error);
      }
    };

    // if lead not found from Redux, fetch it
    if (!lead) {
      fetchCustomer();
    } else {
      setCustomer(lead); // use Redux fallback
    }
  }, [id, lead]);


  useEffect(() => {
    // Get the saved quotations from local storage
    const loadQuotation = () => {
      setLoading(true);
      try {
        const savedQuotes =
          JSON.parse(localStorage.getItem(`quotations_${id}`)) || [];
        setSavedQuotations(savedQuotes);

        // Get the current quotation ID from localStorage
        const currentQuotationId = localStorage.getItem(
          `current_quotation_${id}`
        );

        if (currentQuotationId && savedQuotes.length > 0) {
          // If there's a selected quotation, use that one
          const selectedQuotation = savedQuotes.find(
            (q) => q.id === currentQuotationId || q._id === currentQuotationId || q.quoteId === currentQuotationId
          );


          if (selectedQuotation) {
            setQuotation(selectedQuotation);
            setPackages(selectedQuotation.packages || []);
            setInstallments(selectedQuotation.installments || []);
            setError("");
            return;
          }
        }

        // Fallback: Check if there's a selected quotation
        const selectedQuotation = savedQuotes.find((q) => q.isFinalized);

        if (selectedQuotation) {
          setQuotation(selectedQuotation);
          setPackages(selectedQuotation.packages || []);
          setInstallments(selectedQuotation.installments || []);
          setError("");
        } else if (savedQuotes.length > 0) {
          // No selected quotation but there are saved quotations
          setError(
            "No quotation is selected. Please go back and select a quotation from your saved list, or create a new package."
          );
        } else {
          // No quotations at all
          setError(
            "No quotations have been created yet. Please go back to create a new package and save it as a quotation."
          );
        }
      } catch (err) {
        console.error("Error loading quotation:", err);
        setError("Error loading quotation data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadQuotation();
  }, [id]);

  const handleDownloadPDF = () => {
    if (!pdfRef.current) return;

    try {
      toast.promise(
        (async () => {
          const quotationElement = pdfRef.current;
          const canvas = await html2canvas(quotationElement, { scale: 2 });
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
          pdf.save(`ClassyCaptures_Quotation_${lead?.name || "Customer"}.pdf`);
          return true;
        })(),
        {
          loading: "Generating PDF...",
          success: "PDF downloaded successfully!",
          error: "Failed to generate PDF. Please try again.",
        }
      );
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error(
        "Failed to generate PDF. Please make sure html2canvas and jsPDF are properly installed."
      );
    }
  };


  const quotationIdForNavigation = quotation?._id || quotation?.id || quotation?.quoteId;


  const handleShareWhatsApp = () => {
    // Create a simple text version of the quotation
    const totalAmount = packages.reduce(
      (sum, pkg) => sum + (pkg.totalAmount || 0),
      0
    );

    let message = `*Quotation from Classy Captures*\n\n`;
    message += `*Customer:* ${lead?.name || "N/A"}\n`;
    message += `*Phone:* ${lead?.phone || "N/A"}\n`;
    message += `*Event:* ${lead?.category || "N/A"}\n`;
    message += `*Date:* ${lead?.eventStartDate || "N/A"}\n\n`;

    message += `*Package Details:*\n`;
    packages.forEach((pkg, index) => {
      message += `\n${index + 1}. *${pkg.packageName
        }* - ₹${pkg.totalAmount.toLocaleString()}\n`;
      message += `   Date: ${pkg.date}, Time: ${pkg.timeSlot}\n`;
      message += `   Services: ${pkg.services
        .map((s) => s.serviceName)
        .join(", ")}\n`;
    });

    message += `\n*Total Amount:* ₹${totalAmount.toLocaleString()}\n\n`;

    message += `*Payment Plan:*\n`;
    installments.forEach((inst, index) => {
      message += `${inst.name}: ${inst.percentage
        }% (₹${inst.amount.toLocaleString()})\n`;
    });

    message += `\nThank you for choosing Classy Captures!`;

    // Encode the message for WhatsApp
    const encodedMessage = encodeURIComponent(message);

    // Create WhatsApp link
    const whatsappLink = `https://wa.me/?text=${encodedMessage}`;

    // Open in a new window
    window.open(whatsappLink, "_blank");
  };


  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <Alert variant="warning">
          <Alert.Heading>
            <div className="d-flex align-items-center">
              <span className="me-2">⚠️</span>
              <span>No Quotation Selected</span>
            </div>
          </Alert.Heading>
          <p className="fw-bold">{error}</p>

          <div className="my-4 p-3 border rounded bg-light">
            <h6 className="fw-bold mb-3">What would you like to do?</h6>
            <Row className="g-3">
              {savedQuotations && savedQuotations.length > 0 ? (
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>
                        <FaEdit className="me-2 text-primary" />
                        Select Existing Quotation
                      </Card.Title>
                      <Card.Text>
                        Go back and select one of your previously created
                        quotations by clicking on it in the saved quotations
                        list.
                      </Card.Text>
                      <div className="mt-auto">
                        <Button
                          variant="outline-primary"
                          className="w-100"
                          onClick={() =>
                            navigate(`/customer/create-quote/${id}`)
                          }
                        >
                          View Saved Quotations
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ) : null}
              <Col md={savedQuotations && savedQuotations.length > 0 ? 6 : 12}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>
                      <FaCheckCircle className="me-2 text-success" />
                      Create New Package
                    </Card.Title>
                    <Card.Text>
                      Create a new package, save it as a quotation, and select
                      it to generate your quotation.
                    </Card.Text>
                    <div className="mt-auto">
                      <Button
                        variant="outline-success"
                        className="w-100"
                        onClick={() => navigate(`/customer/create-quote/${id}`)}
                      >
                        Create New Package
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* PDF Download/Share Controls */}
      <div
        className="d-flex justify-content-end mb-4 position-sticky top-0 bg-white py-2"
        style={{ zIndex: 1000 }}
      >
        <Button
          variant="light"
          className="shadow-sm me-2"
          onClick={handleShareWhatsApp}
        >
          <FaWhatsapp className="me-2 text-success" /> Share
        </Button>
        <Button
          variant="light"
          className="shadow-sm me-2"
          onClick={handleDownloadPDF}
        >
          <FaDownload className="me-2" /> Download PDF
        </Button>
        <Button
          variant="light"
          className="shadow-sm me-2"
          onClick={handlePrint}
        >
          <FaPrint className="me-2" /> Print
        </Button>
        <Button
          variant="light"
          className="shadow-sm"
          onClick={() => navigate(`/customer/create-quote/${id}`)}
        >
          <FaEdit className="me-2" /> Edit Quotation
        </Button>
      </div>

      {/* Quotation Content (PDF-like format) */}
      <div ref={pdfRef} className="bg-white shadow-sm p-4 mb-4">
        {/* Letterhead */}
        <div className="text-center mb-4">
          <h2 className="fw-bold">Classy Captures</h2>
          <p className="text-muted mb-0">
            Professional Photography & Videography
          </p>
          <p className="text-muted mb-0">
            123 Photography Lane, Bangalore - 560001
          </p>
          <p className="text-muted">
            +91 98765 43210 | info@classycaptures.com
          </p>
        </div>

        <hr className="my-4" />

        {/* Quotation Header */}
        <div className="mb-4">
          <h5 className="fw-bold text-center mb-4">QUOTATION</h5>
          <Row>
            <Col md={6}>
              <h6 className="fw-bold mb-3">CLIENT DETAILS</h6>
              <p className="mb-1">
                <strong>Name:</strong> {customer?.name || "N/A"}
              </p>
              <p className="mb-1">
                <strong>Phone:</strong> {customer?.phoneNo || "N/A"}
              </p>
              <p className="mb-1">
                <strong>Email:</strong> {customer?.email || "N/A"}
              </p>
              <p className="mb-1">
                <strong>Whatsapp:</strong>{" "}
                {customer?.whatsapp || customer?.whatsappNo || "N/A"}
              </p>
            </Col>
            <Col md={6} className="text-md-end">
              <h6 className="fw-bold mb-3">EVENT DETAILS</h6>
              <p className="mb-1">
                <strong>Event Type:</strong>{" "}
                {Array.isArray(customer?.category)
                  ? customer.category.map((cat) => cat.name).join(", ")
                  : customer?.category || "N/A"}
              </p>


              <p className="mb-1">
                <strong>Start Date:</strong> {formatDate(customer?.eventStartDate)}
              </p>
              <p className="mb-1">
                <strong>End Date:</strong> {formatDate(customer?.eventEndDate)}
              </p>
            </Col>
          </Row>
        </div>

        {/* Quotation Info */}
        <div className="mb-4">
          <Row>
            <Col md={6}>
              <p className="mb-1">
                <strong>Quotation:</strong>{" "}
                {quotation?.name || "Standard Package"}
              </p>
              <p className="mb-1">

                <strong>Quotation Date:</strong> {formatDate(quotation?.date || new Date())}
              </p>
            </Col>
            <Col md={6} className="text-md-end">
              {/* <p className="mb-1">
                <strong>Valid Until:</strong>{" "}
                {formatDate(new Date(new Date().setDate(new Date().getDate() + 30)))}
              </p> */}
              {/* <p className="mb-2">
                <Badge bg="success" className="p-2">
                  QUOTATION
                </Badge>
              </p> */}
            </Col>
          </Row>
        </div>

        {/* Package Details */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3">PACKAGE DETAILS</h5>

          {packages.map((pkg, index) => (
            <Card className="mb-3 border" key={pkg.id || index}>
              <Card.Header className="bg-light">
                <h6 className="fw-bold mb-0">{pkg.packageName}</h6>
                <small className="text-muted d-block">
                  {pkg.date}, {pkg.timeSlot}
                </small>
                {(pkg.venueName || pkg.venueAddress) && (
                  <div className="mt-2">
                    {pkg.venueName && (
                      <small className=" d-block">
                        <strong>Venue:</strong> {pkg.venueName}
                      </small>
                    )}
                    {pkg.venueAddress && (
                      <small className=" d-block">
                        <strong>Address:</strong> {pkg.venueAddress}
                      </small>
                    )}
                  </div>
                )}
              </Card.Header>
              <Card.Body className="p-0">
                <Table bordered hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="py-2" style={{ width: "5%" }}>
                        No
                      </th>
                      <th className="py-2" style={{ width: "55%" }}>
                        Service
                      </th>
                      <th className="py-2 text-center" style={{ width: "10%" }}>
                        Qty
                      </th>
                      {/* <th className="py-2 text-center" style={{ width: "15%" }}>Unit Price</th>
                                            <th className="py-2 text-end" style={{ width: "15%" }}>Amount</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {pkg.services &&
                      pkg.services.map((service, idx) => (
                        <tr key={service.id || idx}>
                          <td className="py-2 text-center">{idx + 1}</td>
                          <td className="py-2">{service.serviceName}</td>
                          <td className="py-2 text-center">{service.qty}</td>
                          {/* <td className="py-2 text-center">₹{parseInt(service.price).toLocaleString()}</td>
                                                <td className="py-2 text-end">
                                                    ₹{(service.price * (parseInt(service.qty) || 1)).toLocaleString()}
                                                </td> */}
                        </tr>
                      ))}
                    <tr className="fw-bold">
                      <td colSpan="2" className="text-left py-2">
                        Package Total:
                      </td>
                      <td className="text-left py-2">
                        ₹{pkg.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}

          {/* Grand Total */}
          <div className="bg-light p-3 text-end fw-bold border">
            <div className="mb-0 d-flex justify-content-between">
              <h5>Total:</h5>
              <h5>
                ₹
                {packages
                  .reduce((sum, pkg) => sum + (pkg.totalAmount || 0), 0)
                  .toLocaleString()}
              </h5>
            </div>
            <div className="mb-0 d-flex justify-content-between">
              <h5>Discount:</h5>
              <h5>- ₹ {quotation?.discountValue?.toLocaleString() || "0"}</h5>
            </div>
            <div className="mb-0 d-flex justify-content-between">
              <h5 className="mb-0" style={{ fontSize: "18px" }}>
                GST{" "}
                <span className="" style={{ fontSize: "16px" }}>
                  5%
                </span>
              </h5>
              <h5>₹ {quotation?.gstValue?.toLocaleString() || "0"}</h5>
            </div>
            <hr />
            <div className="mb-0 text-success d-flex justify-content-between">
              <h5>Grand Total:</h5>
              <h5>₹ {quotation?.totalAfterDiscount?.toLocaleString() || "0"}</h5>
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
                <th style={{ width: "20%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((inst, idx) => (
                <tr key={inst.id || idx}>
                  <td>{idx + 1}</td>
                  <td>{inst.name}</td>
                  <td>{inst.percentage}%</td>
                  <td>₹{inst.amount.toLocaleString()}</td>
                  <td>
                    {inst.paid ? (
                      <Badge bg="success">Paid</Badge>
                    ) : idx === 0 ? (
                      <Badge bg="warning">Due Now</Badge>
                    ) : (
                      <Badge bg="secondary">Pending</Badge>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="fw-bold">
                <td colSpan="2" className="text-end">
                  Total:
                </td>
                <td>
                  {installments.reduce((sum, inst) => sum + inst.percentage, 0)}%
                </td>
                <td colSpan="2">
                  ₹{quotation?.totalAfterDiscount?.toLocaleString() || "0"}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3">TERMS AND CONDITIONS</h5>
          <ol className="ps-3">
            <li className="mb-2">
              This quotation is valid for 30 days from the date of issue.
            </li>
            <li className="mb-2">
              A booking fee of {installments[0]?.percentage || 30}% is required
              to confirm the booking.
            </li>
            <li className="mb-2">All payments are non-refundable.</li>
            <li className="mb-2">
              Any additional hours or services will be charged separately.
            </li>
            <li className="mb-2">
              Delivery of final products will be within 45-60 days after the
              event.
            </li>
            <li className="mb-2">
              Travel outside of city limits may incur additional charges.
            </li>
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
          <p className="small">
            © {new Date().getFullYear()} Classy Captures. All rights reserved.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          className="px-4"
          onClick={() => navigate(`/customer/create-quote/${id}`)}
        >
          <FaEdit className="me-2" /> Modify Quotation
        </Button>
        {quotation?.isFinalized && (
          <Button
            variant="success"
            className="px-4"
            onClick={() => {
              navigate(`/payment/installment-details/${quotationIdForNavigation}`);
            }}
            disabled={!quotation?.isFinalized}
          >
            Confirm Booking
          </Button>


        )}

      </div>
    </div>
  );
};

export default FinalQuotationPage;
