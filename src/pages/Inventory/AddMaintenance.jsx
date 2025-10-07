import React, { useState, useEffect } from "react";
import { Button, Form, Table, Modal } from "react-bootstrap";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";
import { IoSearch } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_URL } from "../../utils/api";

const AddMaintenance = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [formData, setFormData] = useState({
    issue: "",
    damagedBy: "",
    remarks: "",
    sendDate: "",
    status: "Not Yet Sent",
  });
  const [inventoryList, setInventoryList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const fromRoute = location.state?.from || "/inventory/maintenance";

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get(`${API_URL}/inventory`);
        if (response.data.success) {
          setInventoryList(response.data.data);
          setFilteredList(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch inventory");
        }
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError(err.message || "Failed to fetch inventory");
        toast.error(err.message || "Failed to fetch inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleShowModal = (inventory) => {
    setSelectedInventory(inventory);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInventory(null);
    setFormData({
      issue: "",
      damagedBy: "",
      remarks: "",
      sendDate: "",
      status: "Not Yet Sent",
    });
  };

  const handleDone = async () => {
    try {
      if (!selectedInventory) {
        throw new Error("No inventory item selected");
      }

      // Validate required fields
      const { issue, damagedBy, sendDate, status } = formData;
      if (!issue || !damagedBy || !sendDate || !status) {
        throw new Error("Issue, Damaged By, Send Date, and Status are required");
      }

      const response = await axios.post(`${API_URL}/inventory/maintenance`, {
        inventoryId: selectedInventory.id,
        equipmentName: selectedInventory.equipmentName, // Changed from 'name' to 'equipmentName'
        model: selectedInventory.model || "Unknown",
        issue,
        damagedBy,
        sendDate,
        status,
        remarks: formData.remarks,
      });

      if (response.data.success) {
        toast.success("Maintenance record added successfully");
        navigate(fromRoute, { state: { refresh: true } });
        handleCloseModal();
      } else {
        throw new Error(response.data.message || "Failed to add maintenance record");
      }
    } catch (err) {
      console.error("Error adding maintenance:", err);
      toast.error(err.message || "Failed to add maintenance record");
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = inventoryList.filter(
      (item) => item.equipmentName.toLowerCase().includes(searchTerm) // Changed from 'name' to 'equipmentName'
    );
    setFilteredList(filtered);
  };

  const handleSort = () => {
    const sorted = [...filteredList].sort((a, b) =>
      a.equipmentName.localeCompare(b.equipmentName) // Changed from 'name' to 'equipmentName'
    );
    setFilteredList(sorted);
  };

  if (loading) {
    return <div className="container text-center py-5">Loading...</div>;
  }

  if (error) {
    return <div className="container text-center py-5 text-danger">{error}</div>;
  }

  return (
    <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
      <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
        <div className="d-flex gap-2 align-items-center w-50">
          <div className="w-100 bg-white d-flex gap-2 align-items-center px-2 rounded">
            <IoSearch size={16} className="text-muted" />
            <Form className="d-flex flex-grow-1">
              <Form.Group className="w-100">
                <Form.Control
                  type="text"
                  placeholder="Enter Equipment name"
                  style={{
                    paddingLeft: "4px",
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    fontSize: "14px",
                  }}
                  onChange={handleSearch}
                />
              </Form.Group>
            </Form>
          </div>
          <img
            src={sortIcon}
            alt="sortIcon"
            style={{ width: "25px", cursor: "pointer" }}
            onClick={handleSort}
          />
          <img
            src={filterIcon}
            alt="filterIcon"
            style={{ width: "25px", cursor: "pointer" }}
          />
        </div>
      </div>

      <div className="table-responsive bg-white mt-3" style={{ maxHeight: "65vh", overflowY: "auto" }}>
        <Table className="table table-hover align-middle">
          <thead className="text-white text-center sticky-top" style={{ background: "#343a40" }}>
            <tr className="text-start" style={{ fontSize: "14px" }}>
              <th>Sl.No</th>
              <th>Product Name</th>
              <th>Product Code</th>
              <th>Category</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, idx) => (
              <tr key={item.id} style={{ fontSize: "12px" }} className="fw-semibold">
                <td>{String(idx + 1).padStart(2, "0")}</td>
                <td className="d-flex gap-2 align-items-center">
                  <img
                    src={
                      item.image
                        ? `http://localhost:5000/${item.image.replace(/\\/g, '/')}`
                        : "https://via.placeholder.com/40?text=No+Image"
                    }
                    alt="inventory"
                    className="rounded-3 shadow"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    onError={(e) => (e.target.src = "https://via.placeholder.com/40?text=No+Image")}
                  />
                  <p>{item.equipmentName}</p> {/* Changed from 'name' to 'equipmentName' */}
                </td>
                <td>{item.id.slice(-6)}</td>
                <td>{item.category}</td>
                <td>
                  <Button
                    variant="light-gray"
                    onClick={() => handleShowModal(item)}
                    className="text-dark border-0 rounded-1 fw-bold border-2 shadow-sm"
                    style={{ fontSize: "12px", width: "200px", backgroundColor: "#f4f4f4" }}
                  >
                    Send to Maintenance
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Body>
            <p className="text-center fw-bold">Add Maintenance</p>
            <Form>
              <Form.Group className="mb-3" controlId="issue">
                <Form.Label>Issue</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter issue"
                  name="issue"
                  value={formData.issue}
                  onChange={handleInputChange}
                  style={{ fontSize: "12px" }}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="damagedBy">
                <Form.Label>Damaged By</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter damaged by"
                  name="damagedBy"
                  value={formData.damagedBy}
                  onChange={handleInputChange}
                  style={{ fontSize: "12px" }}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="remarks">
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  style={{ fontSize: "12px" }}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="sendDate">
                <Form.Label>Send Date</Form.Label>
                <Form.Control
                  type="date"
                  name="sendDate"
                  value={formData.sendDate}
                  onChange={handleInputChange}
                  style={{ fontSize: "12px" }}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{ fontSize: "12px" }}
                  required
                >
                  <option value="Not Yet Sent">Not Yet Sent</option>
                  <option value="In Process">In Process</option>
                </Form.Select>
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
    </div>
  );
};

export default AddMaintenance;