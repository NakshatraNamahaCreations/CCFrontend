import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Card,
  Modal,
  Row,
  Col,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaSave,
  FaTimes,
  FaExchangeAlt,
  FaClipboardList,
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import axios from "axios";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingdetailsPage = () => {
  const [quotationData, setQuotationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [installments, setInstallments] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [startFilter, setStartFilter] = useState(null);
  const [endFilter, setEndFilter] = useState(null);
  const [newInstruction, setNewInstruction] = useState("");
  const [showCollectDataModal, setShowCollectDataModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [collectedDataList, setCollectedDataList] = useState(null); // For fetched collected data
  const [editMode, setEditMode] = useState(false); // Track if editing

  const [collectData, setCollectData] = useState({
    personName: "",
    cameraName: "",
    totalDriveSize: "",
    filledSize: "",
    copyingPerson: "",
    systemNumber: "",
    copiedLocation: "",
    noOfPhotos: "",
    noOfVideos: "",
    submissionDate: "",
    notes: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();

  const handleAddInstruction = async () => {
    if (!newInstruction.trim()) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/quotations/${id}/instruction/add`,
        {
          instruction: newInstruction.trim(),
        }
      );

      setQuotationData((prev) => ({
        ...prev,
        clientInstructions: res.data.clientInstructions,
      }));

      setNewInstruction(""); // clear input
      toast.success("Instruction added");
    } catch (error) {
      console.error("Add instruction error:", error);
      toast.error("Failed to add instruction");
    }
  };

  const handleRemoveInstruction = async (instructionToDelete) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/quotations/${id}/instruction/delete`,
        {
          data: { instruction: instructionToDelete },
        }
      );

      setQuotationData((prev) => ({
        ...prev,
        clientInstructions: res.data.clientInstructions,
      }));

      toast.success("Instruction deleted");
    } catch (error) {
      console.error("Delete instruction error:", error);
      toast.error("Failed to delete instruction");
    }
  };

  // Fetch collected data for this quotation
  useEffect(() => {
    const fetchCollectedData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/collected-data/${id}`
        );
        setCollectedDataList(res.data.data); // .data is the CollectedData doc
      } catch (err) {
        setCollectedDataList(null);
      }
    };
    if (id) fetchCollectedData();
  }, [id, showCollectDataModal]); // refetch after modal closes

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/quotations/${id}`
        );
        setQuotationData(res.data.quotation);
        setInstallments(res.data.quotation.installments || []);
        console.log("quote", res.data.quotation);
      } catch (err) {
        console.error("Failed to fetch quotation", err);
        toast.error("Error loading quotation");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchQuotation();
  }, [id]);

  const totalAmount = quotationData?.totalAmount || 0;
  const discount = quotationData?.discountValue || 0;
  const gst = quotationData?.gstValue || 0;
  const grandTotal = totalAmount - discount + gst;

  const filteredPackages = quotationData?.packages?.filter((pkg) => {
    const startDate = dayjs(pkg.eventStartDate, "DD-MM-YYYY").toDate();
    const endDate = dayjs(pkg.eventEndDate, "DD-MM-YYYY").toDate();

    const afterStart = !startFilter || startDate >= startFilter;
    const beforeEnd = !endFilter || endDate <= endFilter;

    return afterStart && beforeEnd;
  });

  const getTotalAllocatedPercentage = (customList = installments) => {
    return customList.reduce(
      (sum, i) => sum + (Number(i.paymentPercentage) || 0),
      0
    );
  };

  const handleEditToggle = (index) => {
    if (editIndex === index) {
      setEditIndex(null);
    } else {
      setEditIndex(index);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...installments];
    updated[index][field] = value;

    // recalculate amount if percentage changes
    if (field === "paymentPercentage") {
      const raw = value.replace(/[^0-9.]/g, "");
      if (raw === "") {
        updated[index].paymentPercentage = "";
      } else {
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          updated[index].paymentPercentage = parsed;
          updated[index].paymentAmount = Math.round(
            (totalAmount * parsed) / 100
          );
        }
      }
    }
    setInstallments(updated);
  };

  const handleEditCollectedEvent = (event) => {
    setSelectedVendor({
      eventId: event.eventId,
      eventName: event.eventName,
    });
    setCollectData({
      personName: collectedDataList.personName,
      cameraName: event.cameraName || "",
      totalDriveSize: event.totalDriveSize || "",
      filledSize: event.filledSize || "",
      copyingPerson: event.copyingPerson || "",
      systemNumber: collectedDataList.systemNumber,
      copiedLocation: event.copiedLocation || "",
      noOfPhotos: event.noOfPhotos || "",
      noOfVideos: event.noOfVideos || "",
      submissionDate: event.submissionDate
        ? dayjs(event.submissionDate).format("YYYY-MM-DD")
        : "",
      notes: event.notes || "",
    });
    setEditMode(true);
    setShowCollectDataModal(true);
  };

  // Open modal for new event
  const handleCollectDataClick = (vendor) => {
    setSelectedVendor(vendor);
    setCollectData({
      personName: collectedDataList?.personName || "",
      cameraName: "",
      totalDriveSize: "",
      filledSize: "",
      copyingPerson: "",
      systemNumber: collectedDataList?.systemNumber || "",
      copiedLocation: "",
      noOfPhotos: "",
      noOfVideos: "",
      submissionDate: "",
      notes: "",
    });
    setEditMode(false);
    setShowCollectDataModal(true);
  };

  const handleCollectDataChange = (e) => {
    const { name, value } = e.target;
    setCollectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCollectDataSubmit = async () => {
    try {
      const payload = {
        quotationId: id,
        quotationUniqueId: quotationData?.quotationId,
        personName: collectData.personName,
        systemNumber: collectData.systemNumber,
        eventId: selectedVendor?.eventId,
        eventName: selectedVendor?.eventName,
        cameraName: collectData.cameraName,
        totalDriveSize: collectData.totalDriveSize,
        filledSize: collectData.filledSize,
        copyingPerson: collectData.copyingPerson,
        copiedLocation: collectData.copiedLocation,
        noOfPhotos: collectData.noOfPhotos,
        noOfVideos: collectData.noOfVideos,
        submissionDate: collectData.submissionDate,
        notes: collectData.notes,
      };

      await axios.post("http://localhost:5000/api/collected-data/", payload);
      toast.success(
        editMode ? "Data updated successfully" : "Data collected successfully"
      );
      setShowCollectDataModal(false);
      setSelectedVendor(null);
      setEditMode(false);
      setCollectData({
        personName: "",
        cameraName: "",
        totalDriveSize: "",
        filledSize: "",
        copyingPerson: "",
        systemNumber: "",
        copiedLocation: "",
        noOfPhotos: "",
        noOfVideos: "",
        submissionDate: "",
        notes: "",
      });
    } catch (err) {
      toast.error("Failed to collect data");
    }
  };

  const handleSaveInstallment = async (index) => {
    const inst = installments[index];
    const newTotal = getTotalAllocatedPercentage();

    if (newTotal > 100) {
      toast.error("Total percentage exceeds 100%");
      return;
    }

    const payload = {
      paymentPercentage: inst.paymentPercentage,
      paymentAmount: inst.paymentAmount,
      dueDate: inst.dueDate,
      paymentMode: inst.paymentMode,
    };

    try {
      let response;

      if (inst._id) {
        // 🔁 Update existing installment
        response = await axios.put(
          `http://localhost:5000/api/quotations/${id}/installment/${inst._id}`,
          payload
        );
      } else {
        // 🆕 Create new installment (use `new` as dummy ID)
        response = await axios.put(
          `http://localhost:5000/api/quotations/${id}/installment/new`,
          payload
        );
      }

      // ✅ Update frontend list from latest response
      const updatedList = response.data.quotation.installments;
      setInstallments(updatedList);
      setEditIndex(null);
      toast.success("Installment saved");
    } catch (err) {
      console.error("Save error", err);
      toast.error("Save failed");
    }
  };

  const handleDeleteInstallment = async (index) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this installment?"
    );
    if (!confirm) return;

    const inst = installments[index];

    try {
      await axios.delete(
        `http://localhost:5000/api/quotations/${id}/installment/${inst._id}`
      );
      toast.success("Installment deleted successfully");

      const updated = [...installments];
      updated.splice(index, 1);
      setInstallments(updated);
    } catch (err) {
      toast.error("Failed to delete installment");
      console.error(err);
    }
  };

  const handleAddInstallment = () => {
    const total = getTotalAllocatedPercentage();
    if (total >= 100) {
      toast.error("Total percentage already 100%");
      return;
    }
    const newInstallment = {
      installmentNumber: installments.length + 1,
      paymentPercentage: 0,
      paymentAmount: 0,
      dueDate: "",
      paymentMode: "",
      status: "Pending",
    };
    setInstallments([...installments, newInstallment]);
  };

  const handleChangeVendor = (serviceName, packageId) => {
    console.log("Navigating to:", serviceName); // Debug

    navigate(`/vendors/available-vendors/${serviceName}`, {
      state: {
        quotationId: id,
        packageId,
        returnPath: `/booking/booking-details/${id}`,
      },
    });
  };

  return (
    <div className="container py-2">
      {/* Customer Details */}
      <Card className="mb-4 shadow-sm border-0">
        <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
          <h6 className="fw-bold mb-0">Customer Details</h6>
        </div>
        {isLoading ? (
          <div className="px-3 py-4">Loading...</div>
        ) : (
          <div className="px-3 py-3">
            <div className="row mb-3" style={{ fontSize: "12px" }}>
              <div className="col-md-4">
                <strong>Lead ID:</strong>{" "}
                <span className="text-primary">
                  {quotationData?.leadId?.leadId}
                </span>
              </div>
              <div className="col-md-4">
                <strong>Query ID:</strong>{" "}
                <span>{quotationData?.quotationId}</span>
              </div>
              <div className="col-md-4">
                <strong>Reference:</strong>{" "}
                <span>{quotationData?.leadId?.referenceForm}</span>
              </div>
            </div>
            <div>
              <h6 className="fw-bold">Persons</h6>
              <div className="row g-3">
                {quotationData?.leadId?.persons?.map((person) => (
                  <div className="col-md-6" key={person._id}>
                    <div className="d-flex align-items-center px-2 py-2 bg-white rounded shadow-sm border">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      >
                        {person.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-semibold">{person.name}</div>
                        <div style={{ fontSize: "13px", color: "#555" }}>
                          {person.phoneNo} | {person.email}
                        </div>
                        <span
                          className="badge bg-light text-dark"
                          style={{ fontSize: "10px" }}
                        >
                          {person.profession}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="my-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>Assigned Vendors</strong>
        </Card.Header>

        {/* Client Instructions Inline Add */}
        <Card.Body>
          <div style={{ fontSize: "12px" }}>
            <strong>Client Instructions:</strong>
            <ul className="mt-2 ps-3">
              {quotationData?.clientInstructions?.map((item) => (
                <li
                  key={item}
                  className="d-flex justify-content-between align-items-center mb-1"
                >
                  <span>{item}</span>
                  <FaTimes
                    onClick={() => handleRemoveInstruction(item)}
                    style={{
                      cursor: "pointer",
                      fontSize: "10px",
                      color: "red",
                    }}
                  />
                </li>
              ))}
            </ul>

            {/* Add Instruction Input */}
            <div className="d-flex gap-2 mt-2">
              <Form.Control
                type="text"
                size="sm"
                placeholder="Write instruction..."
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
              />
              <Button
                variant="dark"
                size="sm"
                onClick={handleAddInstruction}
                className="d-flex align-items-center"
              >
                <FaPlus /> Add
              </Button>
            </div>
          </div>
        </Card.Body>

        {/* Vendors Table */}
        <Card.Body>
          <div style={{ fontSize: "12px" }}>
            <div className="d-flex gap-3 align-items-center mb-3 ">
              <div>
                <label className="me-2 fw-semibold">Start Date:</label>
                <DatePicker
                  selected={startFilter}
                  onChange={(date) => setStartFilter(date)}
                  className="form-control form-control-sm"
                  placeholderText="Select start date"
                  dateFormat="dd-MM-yyyy"
                />
              </div>

              <div>
                <label className=" fw-semibold">End Date:</label>
                <DatePicker
                  selected={endFilter}
                  onChange={(date) => setEndFilter(date)}
                  className="form-control form-control-sm"
                  placeholderText="Select end date"
                  dateFormat="dd-MM-yyyy"
                />
              </div>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => {
                  setStartFilter(null);
                  setEndFilter(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
            <div style={{ fontSize: "12px" }}>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Source</th>
                    <th>Service</th>
                    <th>Event</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPackages?.map((pkg, pkgIndex) =>
                    pkg.services.map((service, svcIndex) => {
                      const vendor = service.assignedVendor;
                      return (
                        <tr key={pkg._id}>
                          <td>{vendor?.vendorName || "N/A"}</td>
                          <td>{vendor?.category || "N/A"}</td>
                          <td>{service.serviceName}</td>
                          <td>{pkg.categoryName || "N/A"}</td>
                          <td>
                            {dayjs(pkg.eventStartDate).format("DD-MM-YYYY") ||
                              "N/A"}
                          </td>
                          <td>
                            {dayjs(pkg.eventEndDate).format("DD-MM-YYYY") ||
                              "N/A"}
                          </td>
                          <td className="d-flex gap-2">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-change">
                                  Change Vendor
                                </Tooltip>
                              }
                            >
                              <Button
                                variant="light"
                                size="sm"
                                onClick={() =>
                                  handleChangeVendor(
                                    service.serviceName,
                                    pkg?._id
                                  )
                                }
                              >
                                <FaExchangeAlt style={{ fontSize: "12px" }} />
                              </Button>
                            </OverlayTrigger>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </Card.Body>

        {/* Collect Data Modal */}
       <Modal
  show={showCollectDataModal} // <-- FIXED typo here
  onHide={() => {
    setShowCollectDataModal(false);
    setSelectedVendor(null);
    setEditMode(false);
  }}
  centered
  size="lg"
>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold" style={{ fontSize: "16px" }}>
              {editMode ? "Edit Collected Data" : "Collect Data"} -{" "}
              {selectedVendor?.eventName || "Event"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form style={{ fontSize: "14px" }}>
              <Row className="g-3">
                {/* Person Name */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Person Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="personName"
                      value={collectData.personName}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Person Name"
                      readOnly={!!editMode || !!collectedDataList?.personName}
                    />
                  </Form.Group>
                </Col>

                {/* Camera Name */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Camera Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="cameraName"
                      value={collectData.cameraName}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Camera Name"
                    />
                  </Form.Group>
                </Col>

                {/* Total Drive Size */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Total Card/Drive/Pendrive Size</Form.Label>
                    <Form.Control
                      type="text"
                      name="totalDriveSize"
                      value={collectData.totalDriveSize}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Total Size"
                    />
                  </Form.Group>
                </Col>

                {/* Filled Size */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Filled Size</Form.Label>
                    <Form.Control
                      type="text"
                      name="filledSize"
                      value={collectData.filledSize}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Filled Size"
                    />
                  </Form.Group>
                </Col>

                {/* Copying Person */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Person Copying Data</Form.Label>
                    <Form.Control
                      type="text"
                      name="copyingPerson"
                      value={collectData.copyingPerson}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Name of Person Copying"
                    />
                  </Form.Group>
                </Col>

                {/* System Number */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>System Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="systemNumber"
                      value={collectData.systemNumber}
                      onChange={handleCollectDataChange}
                      placeholder="Enter System Number"
                      readOnly={!!editMode || !!collectedDataList?.systemNumber}
                    />
                  </Form.Group>
                </Col>

                {/* Copied Location */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Copied Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="copiedLocation"
                      value={collectData.copiedLocation}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Copied Location"
                    />
                  </Form.Group>
                </Col>

                {/* No. of Photos */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>No. of Photos</Form.Label>
                    <Form.Control
                      type="number"
                      name="noOfPhotos"
                      value={collectData.noOfPhotos}
                      onChange={handleCollectDataChange}
                      placeholder="Enter No. of Photos"
                    />
                  </Form.Group>
                </Col>

                {/* No. of Videos */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>No. of Videos</Form.Label>
                    <Form.Control
                      type="number"
                      name="noOfVideos"
                      value={collectData.noOfVideos}
                      onChange={handleCollectDataChange}
                      placeholder="Enter No. of Videos"
                    />
                  </Form.Group>
                </Col>

                {/* Submission Date */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Submission Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="submissionDate"
                      value={collectData.submissionDate}
                      onChange={handleCollectDataChange}
                    />
                  </Form.Group>
                </Col>

                {/* Notes */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      type="text"
                      name="notes"
                      value={collectData.notes}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Notes"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer className="justify-content-center">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCollectDataModal(false);
                setSelectedVendor(null);
                setEditMode(false);
              }}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              variant="dark"
              onClick={handleCollectDataSubmit}
              className="px-4"
            >
              {editMode ? "Update" : "Submit"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>

      {/* Package Details */}
      {!isLoading && quotationData?.packages?.length > 0 && (
        <div className="mb-4">
          <h5 className="fw-bold mb-3">PACKAGE DETAILS</h5>
          {quotationData.packages.map((pkg, index) => {
            const packageTotal = pkg.services.reduce(
              (sum, srv) => sum + srv.qty * srv.price,
              0
            );
            // Find if collected data exists for this package/event
            const collectedEvent = collectedDataList?.events?.find(
              (ev) =>
                ev.eventId === pkg._id || ev.eventId === pkg._id?.toString()
            );

            return (
              <Card className="mb-4 border" key={pkg._id}>
                <Card.Header
                  className="bg-light py-2 px-3 d-flex justify-content-between align-items-center"
                  style={{ fontSize: "13px" }}
                >
                  <div>
                    <h6 className="fw-bold mb-1">{pkg.categoryName}</h6>
                    <small className="text-muted d-block">
                      {dayjs(pkg.eventStartDate).format("DD-MM-YYYY")} -{" "}
                      {dayjs(pkg.eventEndDate).format("DD-MM-YYYY")}, {pkg.slot}
                    </small>
                    <div className="mt-1">
                      <small className="d-block">
                        <strong>Venue:</strong> {pkg.venueName}
                      </small>
                      <small className="d-block">
                        <strong>Address:</strong> {pkg.venueAddress}
                      </small>
                    </div>
                  </div>
                  {collectedEvent ? (
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleEditCollectedEvent(collectedEvent)}
                    >
                      Edit Collected Data
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="dark"
                      onClick={() => {
                        setSelectedVendor({
                          eventId: pkg._id,
                          eventName: pkg.categoryName,
                        });
                        setEditMode(false);
                        setShowCollectDataModal(true);
                        setCollectData({
                          personName: collectedDataList?.personName || "",
                          cameraName: "",
                          totalDriveSize: "",
                          filledSize: "",
                          copyingPerson: "",
                          systemNumber: collectedDataList?.systemNumber || "",
                          copiedLocation: "",
                          noOfPhotos: "",
                          noOfVideos: "",
                          submissionDate: "",
                          notes: "",
                        });
                      }}
                    >
                      Collect Data
                    </Button>
                  )}
                </Card.Header>
                <Card.Body className="p-0">
                  <Table bordered responsive className="mb-0">
                    <thead className="table-light" style={{ fontSize: "12px" }}>
                      <tr>
                        <th style={{ width: "5%" }}>No</th>
                        <th style={{ width: "45%" }}>Service</th>
                        <th className="text-center" style={{ width: "10%" }}>
                          Qty
                        </th>
                        <th className="text-center" style={{ width: "20%" }}>
                          Unit Price
                        </th>
                        <th className="text-end" style={{ width: "20%" }}>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: "12px" }}>
                      {pkg.services.map((srv, idx) => (
                        <tr key={srv._id}>
                          <td className="text-center">{idx + 1}</td>
                          <td>{srv.serviceName}</td>
                          <td className="text-center">{srv.qty}</td>
                          <td className="text-center">
                            ₹{srv.price.toLocaleString()}
                          </td>
                          <td className="text-end">
                            ₹{(srv.qty * srv.price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="fw-bold">
                        <td colSpan="4" className="text-end">
                          Package Total:
                        </td>
                        <td className="text-end">
                          ₹{packageTotal.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            );
          })}

          <div className="p-3 border rounded bg-light text-end">
            <div className="d-flex justify-content-between mb-2">
              <strong>Total:</strong>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <strong>Discount:</strong>
              <span>- ₹{discount.toLocaleString()}</span>
            </div>
            {quotationData?.gstApplied && (
              <div className="d-flex justify-content-between mb-2">
                <strong>GST 5%:</strong>
                <span>₹{gst.toLocaleString()}</span>
              </div>
            )}
            <hr />
            <div className="d-flex justify-content-between text-success fw-bold">
              <h6 className="mb-0">Grand Total:</h6>
              <h6 className="mb-0">₹{grandTotal.toLocaleString()}</h6>
            </div>
          </div>
        </div>
      )}

      {/* Installments */}
      <Card className="mb-4 shadow-sm border-0">
        <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
          <h6 className="fw-bold mb-0">Installment Details</h6>
          <Button
            variant="outline-dark"
            size="sm"
            onClick={handleAddInstallment}
            disabled={getTotalAllocatedPercentage() >= 100}
          >
            <FaPlus className="me-2" /> Add Installment
          </Button>
        </div>
        <div className="table-responsive">
          <Table
            className="mb-0"
            bordered
            hover
            size="sm"
            style={{ fontSize: "12px" }}
          >
            <thead className="table-light">
              <tr>
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
            <tbody>
              {installments.map((inst, index) => (
                <tr key={index}>
                  <td>{String(index + 1).padStart(2, "0")}</td>
                  <td>Installment {index + 1}</td>
                  <td>₹{inst.paymentAmount?.toLocaleString()}</td>
                  <td>
                    {editIndex === index && inst.status !== "Completed" ? (
                      <Form.Control
                        type="number"
                        min="0"
                        max="100"
                        value={inst.paymentPercentage}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "paymentPercentage",
                            e.target.value
                          )
                        }
                        style={{ fontSize: "13px", width: "80px" }}
                      />
                    ) : (
                      `${inst.paymentPercentage}%`
                    )}
                  </td>
                  <td>
                    {editIndex === index && inst.status !== "Completed" ? (
                      <Form.Control
                        type="date"
                        value={inst.dueDate || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "dueDate", e.target.value)
                        }
                        style={{ fontSize: "13px" }}
                      />
                    ) : (
                      inst.dueDate
                    )}
                  </td>
                  <td>
                    {editIndex === index && inst.status !== "Completed" ? (
                      <Form.Select
                        value={inst.paymentMode || "-"}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            "paymentMode",
                            e.target.value
                          )
                        }
                        style={{ fontSize: "13px" }}
                      >
                        <option value="-">-</option>
                        <option value="Online">Online</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                      </Form.Select>
                    ) : (
                      inst.paymentMode || "-"
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        inst.status === "Completed" ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {inst.status}
                    </span>
                  </td>
                  <td>
                    {inst.status !== "Completed" &&
                      (editIndex === index ? (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleSaveInstallment(index)}
                          >
                            <FaSave />
                          </Button>{" "}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditIndex(null)}
                          >
                            <FaTimes />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant=""
                          onClick={() => handleEditToggle(index)}
                        >
                          <FaEdit />
                        </Button>
                      ))}
                    {inst.status !== "Completed" && (
                      <Button
                        variant=""
                        size="sm"
                        onClick={() => handleDeleteInstallment(index)}
                      >
                        <img
                          src={deleteIcon}
                          alt="delete"
                          width="14"
                          height="14"
                        />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="text-end px-3 py-2">
            <strong>Total Allocated: </strong>
            {getTotalAllocatedPercentage()}%
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BookingdetailsPage;
