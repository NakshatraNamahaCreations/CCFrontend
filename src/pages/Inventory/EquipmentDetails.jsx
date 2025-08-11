import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Modal, Dropdown } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const EquipmentDetails = () => {
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("Select Status");
  const [remarks, setRemarks] = useState("");
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fromRoute = location.state?.from || "/inventory/maintenance";

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/inventory/maintenance/${id}`);
        if (response.data.success) {
          setMaintenance(response.data.data);
          setStatus(response.data.data.status || "Select Status");
        } else {
          throw new Error(response.data.message || "Failed to fetch maintenance record");
        }
      } catch (err) {
        console.error("Error fetching maintenance:", err);
        setError(err.message || "Failed to fetch maintenance record");
        toast.error(err.message || "Failed to fetch maintenance record");
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, [id]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleDropdownSelect = async (eventKey) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/inventory/maintenance/${id}`, {
        status: eventKey,
      });
      if (response.data.success) {
        setStatus(eventKey);
        setMaintenance({ ...maintenance, status: eventKey });
        toast.success("Status updated successfully");
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDone = async () => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/inventory/maintenance/${id}`, {
        remarks,
        resolved: true,
      });
      if (response.data.success) {
        toast.success("Maintenance marked as resolved");
        navigate(fromRoute, { state: { refresh: true } });
        setShowModal(false);
      } else {
        throw new Error(response.data.message || "Failed to resolve maintenance");
      }
    } catch (err) {
      console.error("Error resolving maintenance:", err);
      toast.error(err.message || "Failed to resolve maintenance");
    }
  };

  if (loading) {
    return <div className="container text-center py-5">Loading...</div>;
  }

  if (error || !maintenance) {
    return <div className="container text-center py-5 text-danger">{error || "Maintenance record not found"}</div>;
  }

  return (
    <div className="container py-2 rounded vh-100" style={{ background: "#F4F4F4" }}>
      <div className="d-flex justify-content-center align-items-center my-5">
        <Card className="border-0 p-3" style={{ width: "35%" }}>
          <h4 className="text-center text-dark fw-bold p-2 rounded" style={{ backgroundColor: "#D9D9D9", fontSize: "18px" }}>
            Equipment Details
          </h4>
          <div className="d-flex gap-4 mt-2" style={{ fontSize: "14px" }}>
            <div>
              <p><strong>Equipment Name</strong></p>
              <p><strong>Model No</strong></p>
              <p><strong>Issue</strong></p>
              <p><strong>Damaged By</strong></p>
              <p><strong>Date</strong></p>
              <p><strong>Status</strong></p>
            </div>
            <div>
              <p>{maintenance.equipmentName}</p>
              <p>{maintenance.model}</p>
              <p>{maintenance.issue}</p>
              <p>{maintenance.damagedBy}</p>
              <p>{new Date(maintenance.sendDate).toLocaleDateString()}</p>
              <p>{status}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="d-flex justify-content-between w-50 align-items-center mx-auto">
        <Dropdown onSelect={handleDropdownSelect} className="mt-3">
          <Dropdown.Toggle variant="light" id="dropdown-custom-components">
            {status} <span className="caret"></span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="In Process">In Process</Dropdown.Item>
            <Dropdown.Item eventKey="Not Yet Sent">Not Yet Sent</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Button className="mt-3 fw-bold shadow bg-white text-dark border-0" onClick={handleShowModal}>
          Resolved
        </Button>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Body>
          <p className="text-center fw-bold">Maintenance</p>
          <Form>
            <Form.Group className="mb-3" controlId="review">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <div className="text-center my-3">
          <Button className="bg-dark text-white border-0" onClick={handleDone}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EquipmentDetails;