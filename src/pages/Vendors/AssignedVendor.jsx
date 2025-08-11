import React, { useState, useEffect } from "react";
import { Table, Button, Form, InputGroup, Card, Modal } from "react-bootstrap";
import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";
import editIcon from "../../assets/icons/editIcon.png";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const AssignedVendor = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch finalized quotations with assigned vendors
  useEffect(() => {
    const fetchAssignedVendors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/quotations/finalized");
        if (res.data.success) {
          // Transform quotations into vendor list for table
          const vendorList = res.data.data.flatMap((quotation) =>
            quotation.packages.flatMap((pkg) =>
              pkg.services
                .filter((service) => service.vendorId && service.vendorName) // Only include services with assigned vendors
                .map((service) => ({
                  id: service._id, // Use service _id for unique identification
                  name: service.vendorName,
                  source: service.vendorId.includes("inhouse") ? "In house" : "Outsource", // Example logic for source
                  customerName: quotation.customerId.name,
                  phone: quotation.customerId.phoneNo,
                  event: pkg.packageName,
                  date: pkg.date,
                  bookingId: quotation.id, // Store bookingId for navigation
                  serviceName: service.serviceName, // Store serviceName for reassignment
                }))
            )
          );
          setVendors(vendorList);
        } else {
          toast.error("Failed to fetch assigned vendors");
        }
      } catch (error) {
        console.error("Error fetching assigned vendors:", error);
        toast.error("Failed to load vendor assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedVendors();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleDone = () => {
    setShowCategoryModal(false);
    navigate(`/vendors/vendor-details/8787878`);
  };

  const handleEditVendor = (vendor) => {
    navigate(`/vendors/vendor-assign/${vendor.bookingId}`, {
      state: {
        service: vendor.serviceName,
        bookingId: vendor.bookingId,
        returnPath: `/vendors/assigned-vendor`,
      },
    });
  };

  const handleDeleteVendor = async (vendor) => {
    if (window.confirm(`Are you sure you want to unassign ${vendor.name} from ${vendor.serviceName}?`)) {
      try {
        // Call API to unassign vendor by setting vendorId and vendorName to null
        const res = await axios.put(`http://localhost:5000/api/quotations/${vendor.bookingId}/assign-vendor`, {
          serviceName: vendor.serviceName,
          vendorId: null,
          vendorName: null,
        });
        if (res.data.success) {
          toast.success("Vendor unassigned successfully");
          // Update local state to remove the vendor
          setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
        } else {
          toast.error("Failed to unassign vendor");
        }
      } catch (error) {
        console.error("Error unassigning vendor:", error);
        toast.error("Failed to unassign vendor");
      }
    }
  };

  const CategorySelectionModal = () => (
    <Modal
      show={showCategoryModal}
      onHide={() => setShowCategoryModal(false)}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Select Vendor Category</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Check
            inline
            label="Outsource vendors"
            type="radio"
            name="category"
            checked={selectedCategory === "Outsource"}
            onChange={() => handleCategorySelect("Outsource")}
          />
          <Form.Check
            inline
            label="In house Vendors"
            type="radio"
            name="category"
            checked={selectedCategory === "In house"}
            onChange={() => handleCategorySelect("In house")}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleDone}
          disabled={!selectedCategory}
        >
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="container py-2 rounded vh-100" style={{ background: "#F4F4F4" }}>
      <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
        <div className="d-flex gap-2 align-items-center w-50">
          <div className="w-100 bg-white d-flex gap-2 align-items-center px-2 rounded">
            <IoSearch size={16} className="text-muted" />
            <Form className="d-flex flex-grow-1">
              <Form.Group className="w-100">
                <Form.Control
                  type="text"
                  placeholder="Enter Service name"
                  style={{
                    paddingLeft: "4px",
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    fontSize: "14px",
                  }}
                />
              </Form.Group>
            </Form>
          </div>
          <img
            src={sortIcon}
            alt="sortIcon"
            style={{ width: "25px", cursor: "pointer" }}
          />
          <img
            src={filterIcon}
            alt="filterIcon"
            style={{ width: "25px", cursor: "pointer" }}
          />
        </div>

        <div className="text-end">
          <Button
            variant="light-gray"
            className="btn rounded-5 bg-white border-2 shadow-sm"
            style={{ fontSize: "14px" }}
          >
            Download Excel
          </Button>
        </div>
      </div>

      <CategorySelectionModal />

      <Card className="border-0 p-3 my-3">
        <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top">
              <tr style={{ fontSize: "14px" }}>
                <th>Sl.no</th>
                <th>Name</th>
                <th>Source</th>
                <th>Customer Name</th>
                <th>Phone no</th>
                <th>Event</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, index) => (
                <tr key={vendor.id} style={{ fontSize: "12px" }} className="text-center fw-semibold">
                  <td>{String(index + 1).padStart(2, "0")}</td>
                  <td>{vendor.name}</td>
                  <td>{vendor.source}</td>
                  <td>{vendor.customerName}</td>
                  <td>{vendor.phone}</td>
                  <td>{vendor.event}</td>
                  <td>{vendor.date}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        variant="link"
                        onClick={() => handleEditVendor(vendor)}
                        className="p-0"
                        style={{ color: "#0d6efd" }}
                      >
                        <img src={editIcon} alt="editIcon" style={{ width: "20px" }} />
                      </Button>
                      <Button
                        variant="link"
                        onClick={() => handleDeleteVendor(vendor)}
                        className="p-0"
                        style={{ color: "#dc3545" }}
                      >
                        <img src={deleteIcon} alt="deleteIcon" style={{ width: "20px" }} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AssignedVendor;