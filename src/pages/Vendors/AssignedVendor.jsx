import React, { useState, useEffect } from "react";
import { Table, Button, Form, Card, Modal } from "react-bootstrap";
import { IoSearch } from "react-icons/io5";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";
import editIcon from "../../assets/icons/editIcon.png";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import DynamicPagination from "../DynamicPagination";
// import { exportToExcel, formatVendorDataForExcel } from "../../utils/excelExport"; // Adjust path as needed

import * as XLSX from 'xlsx';
import { API_URL } from "../../utils/api";

export const exportToExcel = (data, fileName = 'export') => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

// Helper function to format data for Excel export
export const formatVendorDataForExcel = (assignments) => {
  return assignments.map((assignment, index) => ({
    'Sl.No': index + 1,
    'Vendor Name': assignment.vendorName || 'N/A',
    'Date': assignment.date ? new Date(assignment.date).toLocaleDateString() : 'N/A',
    'Time Slot': assignment.slot || 'N/A',
  }));
};

const AssignedVendor = () => {
  const [vendorAssignments, setVendorAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Fetch vendor inventory data
  useEffect(() => {
    const fetchVendorInventory = async () => {
      try {
        const res = await axios.get(`${API_URL}/vendor-inventory`);
        if (res.data.success) {
          setVendorAssignments(res.data.data);
          setFilteredAssignments(res.data.data);
        } else {
          toast.error("Failed to fetch vendor assignments");
        }
      } catch (error) {
        console.error("Error fetching vendor inventory:", error);
        toast.error("Failed to load vendor assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorInventory();
  }, []);

  // Filter assignments based on search term
  useEffect(() => {
    const filtered = vendorAssignments.filter(assignment =>
      assignment.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.slot?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.date?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAssignments(filtered);
    setCurrentPage(1);
  }, [searchTerm, vendorAssignments]);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  // Handle Excel download
  const handleDownloadExcel = () => {
    if (filteredAssignments.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const excelData = formatVendorDataForExcel(filteredAssignments);
      exportToExcel(excelData, 'vendor_assignments');
      toast.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to download Excel file");
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleDone = () => {
    setShowCategoryModal(false);
    navigate(`/vendors/vendor-details/8787878`);
  };

  const handleEditVendor = (assignment) => {
    navigate(`/vendors/vendor-assign`, {
      state: {
        vendorId: assignment.vendorId,
        vendorName: assignment.vendorName,
        date: assignment.date,
        slot: assignment.slot,
        returnPath: `/vendors/assigned-vendor`,
      },
    });
  };

  const handleDeleteVendor = async (assignment) => {
    if (window.confirm(`Are you sure you want to remove ${assignment.vendorName} from ${assignment.date} (${assignment.slot})?`)) {
      try {
        const res = await axios.delete(`${API_URL}/vendor-inventory/${assignment._id}`);
        if (res.data.success) {
          toast.success("Vendor assignment removed successfully");
          setVendorAssignments(prev => prev.filter(a => a._id !== assignment._id));
        } else {
          toast.error("Failed to remove vendor assignment");
        }
      } catch (error) {
        console.error("Error removing vendor assignment:", error);
        toast.error("Failed to remove vendor assignment");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    <div className="container py-2 rounded" style={{ background: "#F4F4F4", minHeight: "100vh" }}>
      <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
        <div className="d-flex gap-2 align-items-center w-50">
          <div className="w-100 bg-white d-flex gap-2 align-items-center px-2 rounded">
            <IoSearch size={16} className="text-muted" />
            <Form className="d-flex flex-grow-1">
              <Form.Group className="w-100">
                <Form.Control
                  type="text"
                  placeholder="Search by vendor name, slot, or date"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
        </div>

        <div className="text-end">
          <Button
            variant="light-gray"
            className="btn rounded-5 bg-white border-2 shadow-sm"
            style={{ fontSize: "14px" }}
            onClick={handleDownloadExcel}
            disabled={filteredAssignments.length === 0}
          >
            Download Excel
          </Button>
        </div>
      </div>

      <CategorySelectionModal />

      <Card className="border-0 p-3 my-3">
        <div className="table-responsive bg-white" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top">
              <tr style={{ fontSize: "14px", backgroundColor: "#6c757d" }}>
                <th>Sl.no</th>
                <th>Vendor Name</th>
                <th>Date</th>
                <th>Time Slot</th>
                
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    {searchTerm ? "No matching assignments found" : "No vendor assignments found"}
                  </td>
                </tr>
              ) : (
                currentItems.map((assignment, index) => (
                  <tr key={assignment._id} style={{ fontSize: "12px" }} className="text-center fw-semibold">
                    <td>{String(indexOfFirstItem + index + 1).padStart(2, "0")}</td>
                    <td>{assignment.vendorName || "N/A"}</td>
                    <td>{formatDate(assignment.date)}</td>
                    <td>{assignment.slot || "N/A"}</td>
                   
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {filteredAssignments.length > 0 && (
          <div className="mt-3 text-muted text-center" style={{ fontSize: "12px" }}>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAssignments.length)} of {filteredAssignments.length} assignments
          </div>
        )}
      </Card>
    </div>
  );
};

export default AssignedVendor;