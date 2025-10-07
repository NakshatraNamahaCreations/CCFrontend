// import React, { useState, useEffect } from "react";
// import { Table, Button, Form, Card, Modal } from "react-bootstrap";
// import { FaPlus } from "react-icons/fa";
// import { IoSearch } from "react-icons/io5";
// import sortIcon from "../../assets/icons/sort.png";
// import filterIcon from "../../assets/icons/filter.png";
// import editIcon from "../../assets/icons/editIcon.png";
// import deleteIcon from "../../assets/icons/deleteIcon.png";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-hot-toast";

// const VendorManagement = () => {
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const navigate = useNavigate();
//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [vendors, setVendors] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch vendors from backend
//   useEffect(() => {
//     const fetchVendors = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get("http://localhost:5000/api/vendors");
//         const vendorArray = res.data?.vendors || [];
//         console.log("vendors", vendorArray);
//         setVendors(vendorArray);
//       } catch (err) {
//         console.error("Error fetching vendors:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVendors();
//   }, []);

//   const handleAddVendor = () => {
//     setShowCategoryModal(true);
//   };

//   const handleCategorySelect = (category) => {
//     setSelectedCategory(category);
//     localStorage.setItem("selectedCategory", category);
//   };

//   const handleDone = () => {
//     setShowCategoryModal(false);
//     navigate(`/vendors/vendor-details/new`, {
//       state: { category: selectedCategory },
//     });
//   };

//   const handleEditVendor = (vendor) => {
//     navigate(`/vendors/vendor-details/${vendor._id}`, {
//       state: {
//         category: vendor.category,
//         vendorData: vendor,
//       },
//     });
//   };

//   const handleDeleteVendor = async (vendorId) => {
//     if (window.confirm("Are you sure you want to delete this vendor?")) {
//       try {
//         const response = await axios.delete(
//           `http://localhost:5000/api/vendors/${vendorId}`
//         );
//         if (response.data.success) {
//           setVendors(vendors.filter((vendor) => vendor.id !== vendorId));
//           toast.success("Vendor deleted successfully");
//         } else {
//           toast.error("Failed to delete vendor");
//         }
//       } catch (error) {
//         console.error("Error deleting vendor:", error);
//         toast.error(error.response?.data?.message || "Failed to delete vendor");
//       }
//     }
//   };

//   const CategorySelectionModal = () => (
//     <Modal
//       show={showCategoryModal}
//       onHide={() => setShowCategoryModal(false)}
//       centered
//       backdrop="static"
//       keyboard={false}
//     >
//       <Modal.Header closeButton>
//         <Modal.Title>Select Vendor Category</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form>
//           <Form.Check
//             inline
//             label="Outsource vendors"
//             type="radio"
//             name="category"
//             checked={selectedCategory === "Outsource"}
//             onChange={() => handleCategorySelect("Outsource")}
//           />
//           <Form.Check
//             inline
//             label="In house Vendors"
//             type="radio"
//             name="category"
//             checked={selectedCategory === "In house"}
//             onChange={() => handleCategorySelect("In house")}
//           />
//         </Form>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
//           Cancel
//         </Button>
//         <Button
//           variant="dark"
//           onClick={handleDone}
//           disabled={!selectedCategory}
//         >
//           Done
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );

//   if (loading) {
//     return (
//       <div
//         className="d-flex justify-content-center align-items-center"
//         style={{ height: "80vh" }}
//       >
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <div
//       className="container py-2 rounded vh-100"
//       style={{ background: "#F4F4F4" }}
//     >
//       <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
//         <div className="d-flex gap-2 align-items-center w-50">
//           <div className="w-100 bg-white d-flex gap-2 align-items-center px-2 rounded">
//             <IoSearch size={16} className="text-muted" />
//             <Form className="d-flex flex-grow-1">
//               <Form.Group className="w-100">
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter Service name"
//                   style={{
//                     paddingLeft: "4px",
//                     border: "none",
//                     outline: "none",
//                     boxShadow: "none",
//                     fontSize: "14px",
//                   }}
//                 />
//               </Form.Group>
//             </Form>
//           </div>
//           <img
//             src={sortIcon}
//             alt="sortIcon"
//             style={{ width: "25px", cursor: "pointer" }}
//           />
//           <img
//             src={filterIcon}
//             alt="filterIcon"
//             style={{ width: "25px", cursor: "pointer" }}
//           />
//         </div>

//         <div className="d-flex gap-4 w-50">
//           <Button
//             variant="light-gray"
//             className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
//             style={{ fontSize: "14px" }}
//             onClick={handleAddVendor}
//           >
//             <FaPlus /> Add Vendor
//           </Button>
//           <Button
//             variant="light-gray"
//             className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
//             style={{ fontSize: "14px" }}
//             onClick={() => navigate(`/vendors/assigned-vendor`)}
//           >
//             Assigned Vendor
//           </Button>
//           <Button
//             variant="light-gray"
//             className="btn rounded-5 bg-white border-2 shadow-sm"
//             style={{ fontSize: "14px" }}
//           >
//             Download Excel
//           </Button>
//         </div>
//       </div>

//       <CategorySelectionModal />

//       <Card className="border-0 p-3 my-3">
//         <div
//           className="table-responsive bg-white"
//           style={{ maxHeight: "65vh", overflowY: "auto" }}
//         >
//           <Table className="table table-hover align-middle">
//             <thead
//               className="text-white text-center sticky-top"
//               style={{ backgroundColor: "#333a40" }}
//             >
//               <tr style={{ fontSize: "14px" }}>
//                 <th>Sl.no</th>
//                 <th>Name</th>
//                 <th>Category</th>
//                 <th>Phone No</th>
//                 <th>Field</th>
//                 <th>Level</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {vendors.length === 0 ? (
//                 <tr>
//                   <td colSpan="7" className="text-center">
//                     No vendors found
//                   </td>
//                 </tr>
//               ) : (
//                 vendors.map((vendor, index) => (
//                   <tr
//                     key={vendor.id}
//                     style={{ fontSize: "12px" }}
//                     className="text-center fw-semibold"
//                   >
//                     <td>{String(index + 1).padStart(2, "0")}</td>
//                     <td>{vendor.name}</td>
//                     <td>
//                       {vendor.category === "Inhouse Vendor"
//                         ? "In house"
//                         : "Outsource"}
//                     </td>
//                     <td>{vendor.phoneNo}</td>
//                     <td>
//                       {Array.isArray(vendor.specialization) &&
//                       vendor.specialization.length > 0
//                         ? vendor.specialization.map((s, i, arr) => (
//                             <React.Fragment
//                               key={s.serviceId || s.id || s._id || i}
//                             >
//                               {s.name}
//                               {i < arr.length - 1 ? ", " : ""}
//                               {i < arr.length - 1 ? <br /> : null}
//                             </React.Fragment>
//                           ))
//                         : "N/A"}
//                     </td>
//                     <td>
//                       <strong>{vendor.expertiseLevel || "N/A"}</strong>
//                     </td>
//                     <td>
//                       <div className="d-flex justify-content-center gap-2">
//                         <Button
//                           variant="link"
//                           onClick={() => handleEditVendor(vendor)}
//                           className="p-0"
//                           style={{ color: "#0d6efd" }}
//                         >
//                           <img
//                             src={editIcon}
//                             alt="editIcon"
//                             style={{ width: "20px" }}
//                           />
//                         </Button>
//                         <Button
//                           variant="link"
//                           onClick={() => handleDeleteVendor(vendor.id)}
//                           className="p-0"
//                           style={{ color: "#dc3545" }}
//                         >
//                           <img
//                             src={deleteIcon}
//                             alt="deleteIcon"
//                             style={{ width: "20px" }}
//                           />
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </Table>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default VendorManagement;

import React, { useState, useEffect } from "react";
import { Table, Button, Form, Card, Modal, InputGroup } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";
import editIcon from "../../assets/icons/editIcon.png";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import DynamicPagination from "../DynamicPagination";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { API_URL } from "../../utils/api";

const VendorManagement = () => {
  const navigate = useNavigate();

  // Vendor states
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category modal states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Pagination & Search
  const [searchInput, setSearchInput] = useState(""); // input value
  const [search, setSearch] = useState(""); // applied search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Fetch vendors API
  const fetchVendors = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/vendors`, {
        params: { page, limit, search },
      });

      if (res.data.success) {
        setVendors(res.data.vendors || []);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.page || 1);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  // Load vendors whenever page or search changes
  useEffect(() => {
    fetchVendors(currentPage, search);
  }, [currentPage, search]);

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchInput("");
    setCurrentPage(1);
  };

  const handleAddVendor = () => setShowCategoryModal(true);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    localStorage.setItem("selectedCategory", category);
  };

  const handleDone = () => {
    setShowCategoryModal(false);
    navigate(`/vendors/vendor-details/new`, {
      state: { category: selectedCategory },
    });
  };

  const handleEditVendor = (vendor) => {
    navigate(`/vendors/vendor-details/${vendor._id}`, {
      state: {
        category: vendor.category,
        vendorData: vendor,
      },
    });
  };

  const handleDeleteVendor = async (vendorId) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        const response = await axios.delete(
          `${API_URL}/vendors/${vendorId}`
        );
        if (response.data.success) {
          toast.success("Vendor deleted successfully");
          fetchVendors(currentPage, search); // refresh list
        } else {
          toast.error("Failed to delete vendor");
        }
      } catch (error) {
        console.error("Error deleting vendor:", error);
        toast.error(error.response?.data?.message || "Failed to delete vendor");
      }
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading(true); // show downloading text
    try {
      const res = await axios.get(`${API_URL}/vendors`, {
        params: { page: 1, limit: 10000 }, // fetch all vendors (or create a backend endpoint for all)
      });

      if (res.data.success) {
        const vendorData = res.data.vendors || [];

        const formattedData = vendorData.map((v, i) => ({
          Sl_No: i + 1,
          Name: v.name,
          Category: v.category,
          Phone: v.phoneNo,
          Email: v.email || "N/A",
          Field: Array.isArray(v.specialization)
            ? v.specialization.map((s) => s.name).join(", ")
            : "N/A",
          Expertise_Level: v.expertiseLevel || "N/A",
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const data = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(
          data,
          `vendors_list_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
        toast.success("Excel downloaded successfully");
      } else {
        toast.error("Failed to fetch vendors for download");
      }
    } catch (err) {
      console.error("Excel download error:", err);
      toast.error("Error downloading Excel");
    } finally {
      setDownloading(false); // reset after completion
    }
  };

  // Category Selection Modal
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
          variant="dark"
          onClick={handleDone}
          disabled={!selectedCategory}
        >
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className="container py-2 rounded vh-100"
      style={{ background: "#F4F4F4" }}
    >
      <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
        {/* Search bar */}
        <div style={{ width: "350px" }}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search vendor..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ fontSize: "14px" }}
                disabled={loading}
              />
              <Button
                variant="dark"
                type="submit"
                disabled={loading}
                style={{ fontSize: "14px" }}
              >
                Search
              </Button>
              {search && (
                <Button
                  variant="outline-secondary"
                  onClick={handleClearSearch}
                  disabled={loading}
                  style={{ fontSize: "14px" }}
                >
                  Clear
                </Button>
              )}
            </InputGroup>
          </Form>
        </div>

        {/* Actions */}
        <div className="d-flex gap-4">
          <Button
            variant="light-gray"
            className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
            style={{ fontSize: "14px" }}
            onClick={handleAddVendor}
          >
            <FaPlus /> Add Vendor
          </Button>
          <Button
            variant="light-gray"
            className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
            style={{ fontSize: "14px" }}
            onClick={() => navigate(`/vendors/assigned-vendor`)}
          >
            Assigned Vendor
          </Button>
          <Button
            variant="light-gray"
            className="btn rounded-5 bg-white border-2 shadow-sm"
            style={{ fontSize: "14px", minWidth: "120px" }}
            onClick={handleDownloadExcel}
            disabled={downloading}
          >
            {downloading ? "Downloading…" : "Download Excel"}
          </Button>
        </div>
      </div>

      <CategorySelectionModal />

      {/* Vendor Table */}
      <Card className="border-0 p-3 my-3">
        <div
          className="table-responsive bg-white"
          style={{ maxHeight: "65vh", overflowY: "auto" }}
        >
          <Table className="table table-hover align-middle">
            <thead
              className="text-white text-center sticky-top"
              style={{ backgroundColor: "#333a40" }}
            >
              <tr style={{ fontSize: "14px" }}>
                <th>Sl.no</th>
                <th>Name</th>
                <th>Category</th>
                <th>Phone No</th>
                <th>Field</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No vendors found
                  </td>
                </tr>
              ) : (
                vendors.map((vendor, index) => (
                  <tr
                    key={vendor._id}
                    style={{ fontSize: "12px" }}
                    className="text-center fw-semibold"
                  >
                    <td>
                      {String((currentPage - 1) * limit + index + 1).padStart(
                        2,
                        "0"
                      )}
                    </td>
                    <td>{vendor.name}</td>
                    <td>
                      {vendor.category === "Inhouse Vendor"
                        ? "In house"
                        : "Outsource"}
                    </td>
                    <td>{vendor.phoneNo}</td>
                    <td>
                      {Array.isArray(vendor.specialization) &&
                      vendor.specialization.length > 0
                        ? vendor.specialization.map((s, i, arr) => (
                            <React.Fragment key={s._id || i}>
                              {s.name}
                              {i < arr.length - 1 ? ", " : ""}
                              {i < arr.length - 1 ? <br /> : null}
                            </React.Fragment>
                          ))
                        : "N/A"}
                    </td>
                    <td>
                      <strong>{vendor.expertiseLevel || "N/A"}</strong>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="link"
                          onClick={() => handleEditVendor(vendor)}
                          className="p-0"
                          style={{ color: "#0d6efd" }}
                        >
                          <img
                            src={editIcon}
                            alt="editIcon"
                            style={{ width: "20px" }}
                          />
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => handleDeleteVendor(vendor._id)}
                          className="p-0"
                          style={{ color: "#dc3545" }}
                        >
                          <img
                            src={deleteIcon}
                            alt="deleteIcon"
                            style={{ width: "20px" }}
                          />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <DynamicPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Card>
    </div>
  );
};

export default VendorManagement;
