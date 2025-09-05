// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Button,
//   Form,
//   Card,
//   Table,
//   Container,
//   InputGroup,
// } from "react-bootstrap";
// import editIcon from "../../assets/icons/editIcon.png";
// import deleteIcon from "../../assets/icons/deleteIcon.png";
// import PresetQuoteModal from "./PresetQuoteModal";
// import { toast } from "react-hot-toast";
// import axios from "axios";
// import DynamicPagination from "../DynamicPagination";

// const PresetQuotation = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [presetQuotations, setPresetQuotations] = useState([]);
//   const [editingPreset, setEditingPreset] = useState(null);

//   // Pagination and search state
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;
//   const [totalPages, setTotalPages] = useState(1);
//   const [search, setSearch] = useState("");
//   const [searchInput, setSearchInput] = useState("");

//   // Load preset quotations from backend
//   useEffect(() => {
//     loadPresetQuotations(currentPage, search);
//     // eslint-disable-next-line
//   }, [currentPage, search]);

//   const loadPresetQuotations = async (page = 1, searchValue = "") => {
//     try {
//       const response = await axios.get(
//         `http://localhost:5000/api/preset-quotation?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(
//           searchValue
//         )}`
//       );
//       setPresetQuotations(response.data.data);
//       setTotalPages(response.data.pages || 1);
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message || "Failed to fetch preset quotations"
//       );
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       const presetToDelete = presetQuotations.find((p) => p._id === id);
//       await axios.delete(`http://localhost:5000/api/preset-quotation/${id}`);
//       // If last item on page is deleted, go to previous page if needed
//       if (presetQuotations.length === 1 && currentPage > 1) {
//         setCurrentPage(currentPage - 1);
//       } else {
//         loadPresetQuotations(currentPage, search);
//       }
//       toast.success(`Removed preset for ${presetToDelete.category}`);
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message || "Failed to delete preset quotation"
//       );
//     }
//   };

//   const handleEdit = (preset) => {
//     setEditingPreset(preset);
//     setShowModal(true);
//   };

//   // Handle search submit
//   const handleSearch = (e) => {
//     e.preventDefault();
//     setCurrentPage(1);
//     setSearch(searchInput.trim());
//   };

//   // Handle search clear
//   const handleClearSearch = () => {
//     setSearchInput("");
//     setSearch("");
//     setCurrentPage(1);
//   };

//   return (
//     <Container className="position-relative">
//       <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
//         {/* Search bar on the left */}
//         <div style={{ width: "350px" }}>
//           <Form onSubmit={handleSearch}>
//             <InputGroup>
//               <Form.Control
//                 type="text"
//                 placeholder="Search Category"
//                 value={searchInput}
//                 onChange={(e) => setSearchInput(e.target.value)}
//                 style={{ fontSize: "14px" }}
//                 disabled={false}
//               />
//               <Button variant="dark" type="submit" style={{ fontSize: "14px" }}>
//                 Search
//               </Button>
//               {search && (
//                 <Button
//                   variant="outline-secondary"
//                   onClick={handleClearSearch}
//                   style={{ fontSize: "14px" }}
//                 >
//                   Clear
//                 </Button>
//               )}
//             </InputGroup>
//           </Form>
//         </div>
//         {/* Add button on the right */}
//         <div className="d-flex gap-2">
//           <Button
//             onClick={() => {
//               setEditingPreset(null);
//               setShowModal(true);
//             }}
//             variant="transparent"
//             className="fw-bold rounded-1 shadow bg-white"
//             style={{ fontSize: "14px" }}
//           >
//             + Add Preset Quote
//           </Button>
//           <Button
//             onClick={handleDownloadExcel}
//             className="fw-bold rounded-1 shadow bg-white text-dark border-0"
//             style={{ fontSize: "14px" }}
//             disabled={loading || services.length === 0}
//           >
//             Download Excel
//           </Button>
//         </div>
//       </div>

//       <Card className="border-0 p-3">
//         <div
//           className="table-responsive bg-white"
//           style={{ maxHeight: "65vh", overflowY: "auto" }}
//         >
//           <Table className="table table-hover align-middle">
//             <thead className="text-white text-center sticky-top">
//               <tr>
//                 <th className="text-start" style={{ fontSize: "14px" }}>
//                   Sl.No
//                 </th>
//                 <th className="text-start" style={{ fontSize: "14px" }}>
//                   Category
//                 </th>
//                 <th className="text-start" style={{ fontSize: "14px" }}>
//                   Services
//                 </th>
//                 <th className="text-start" style={{ fontSize: "14px" }}>
//                   Amount
//                 </th>
//                 <th className="text-start" style={{ fontSize: "14px" }}>
//                   Margin Amount
//                 </th>
//                 <th className="text-center" style={{ fontSize: "14px" }}>
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {presetQuotations.length > 0 ? (
//                 presetQuotations.map((preset, index) => (
//                   <tr key={preset._id} className="text-center">
//                     <td className="text-start" style={{ fontSize: "12px" }}>
//                       {String(
//                         (currentPage - 1) * itemsPerPage + index + 1
//                       ).padStart(2, "0")}
//                     </td>
//                     <td className="text-start" style={{ fontSize: "12px" }}>
//                       {preset.category} - [
//                       {preset.services.map((s) => s.serviceName).join(", ")}]
//                     </td>
//                     <td className="text-start" style={{ fontSize: "12px" }}>
//                       {preset.services.map((s) => s.serviceName).join(", ")}
//                     </td>
//                     <td className="text-start" style={{ fontSize: "12px" }}>
//                       ₹{preset.totalAmount?.toLocaleString?.() ?? 0}
//                     </td>
//                     <td className="text-start" style={{ fontSize: "12px" }}>
//                       ₹{preset.totalMarginAmount?.toLocaleString?.() ?? 0}
//                     </td>
//                     <td className="d-flex justify-content-center">
//                       <Button
//                         variant="outline-gray"
//                         size="sm"
//                         className="me-2"
//                         onClick={() => handleDelete(preset._id)}
//                       >
//                         <img
//                           src={deleteIcon}
//                           alt="Delete"
//                           style={{ width: "20px" }}
//                         />
//                       </Button>
//                       <Button
//                         variant="outline-gray"
//                         size="sm"
//                         onClick={() => handleEdit(preset)}
//                       >
//                         <img
//                           src={editIcon}
//                           alt="Edit"
//                           style={{ width: "20px" }}
//                         />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="text-center py-3">
//                     No preset quotations found. Add a new preset using the
//                     button above.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>
//           <DynamicPagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={setCurrentPage}
//             maxPagesToShow={5}
//           />
//         </div>
//       </Card>

//       <PresetQuoteModal
//         show={showModal}
//         onHide={() => {
//           setShowModal(false);
//           setEditingPreset(null);
//         }}
//         onSave={() => {
//           loadPresetQuotations(currentPage, search);
//         }}
//         preset={editingPreset}
//       />
//     </Container>
//   );
// };

// export default PresetQuotation;


import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Card,
  Table,
  Container,
  InputGroup,
} from "react-bootstrap";
import editIcon from "../../assets/icons/editIcon.png";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import PresetQuoteModal from "./PresetQuoteModal";
import { toast } from "react-hot-toast";
import axios from "axios";
import DynamicPagination from "../DynamicPagination";
import * as XLSX from "xlsx"; // Import the xlsx library

const PresetQuotation = () => {
  const [showModal, setShowModal] = useState(false);
  const [presetQuotations, setPresetQuotations] = useState([]);
  const [editingPreset, setEditingPreset] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Load preset quotations from backend
  useEffect(() => {
    loadPresetQuotations(currentPage, search);
    // eslint-disable-next-line
  }, [currentPage, search]);

  const loadPresetQuotations = async (page = 1, searchValue = "") => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/preset-quotation?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(
          searchValue
        )}`
      );
      setPresetQuotations(response.data.data);
      setTotalPages(response.data.pages || 1);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to fetch preset quotations"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      const presetToDelete = presetQuotations.find((p) => p._id === id);
      await axios.delete(`http://localhost:5000/api/preset-quotation/${id}`);
      // If last item on page is deleted, go to previous page if needed
      if (presetQuotations.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        loadPresetQuotations(currentPage, search);
      }
      toast.success(`Removed preset for ${presetToDelete.category}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete preset quotation"
      );
    }
  };

  const handleEdit = (preset) => {
    setEditingPreset(preset);
    setShowModal(true);
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput.trim());
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  // Function to download Excel
  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      // Fetch all data without pagination
      const response = await axios.get(
        `http://localhost:5000/api/preset-quotation?search=${encodeURIComponent(
          search
        )}`
      );
      
      const allPresets = response.data.data || [];
      
      if (allPresets.length === 0) {
        toast.error("No data available to download");
        return;
      }

      // Prepare data for Excel
      const excelData = allPresets.map((preset, index) => {
        const servicesList = preset.services.map(s => s.serviceName).join(", ");
        const serviceAmounts = preset.services.map(s => 
          `${s.serviceName}: ₹${s.amount?.toLocaleString?.() || 0}`
        ).join("; ");
        
        const marginAmounts = preset.services.map(s => 
          `${s.serviceName}: ₹${s.marginAmount?.toLocaleString?.() || 0}`
        ).join("; ");
        
        return {
          "Sl.No": index + 1,
          "Category": preset.category,
          "Services": servicesList,
          "Service Amounts": serviceAmounts,
          "Margin Amounts": marginAmounts,
          "Total Amount": `₹${preset.totalAmount?.toLocaleString?.() || 0}`,
          "Total Margin Amount": `₹${preset.totalMarginAmount?.toLocaleString?.() || 0}`
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const colWidths = [
        { wch: 8 },  
        { wch: 20 }, 
        { wch: 40 }, 
        { wch: 50 },  
        { wch: 50 },  
        { wch: 15 },  
        { wch: 20 }   
      ];
      worksheet['!cols'] = colWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Preset Quotations");
      
      // Generate Excel file and trigger download
      const fileName = `Preset_Quotations_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success("Excel file downloaded successfully");
    } catch (err) {
      console.error("Error downloading Excel:", err);
      toast.error(
        err.response?.data?.message || "Failed to download Excel file"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="position-relative">
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
        {/* Search bar on the left */}
        <div style={{ width: "350px" }}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search Category"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ fontSize: "14px" }}
                disabled={false}
              />
              <Button variant="dark" type="submit" style={{ fontSize: "14px" }}>
                Search
              </Button>
              {search && (
                <Button
                  variant="outline-secondary"
                  onClick={handleClearSearch}
                  style={{ fontSize: "14px" }}
                >
                  Clear
                </Button>
              )}
            </InputGroup>
          </Form>
        </div>
        {/* Add button on the right */}
        <div className="d-flex gap-2">
          <Button
            onClick={() => {
              setEditingPreset(null);
              setShowModal(true);
            }}
            variant="transparent"
            className="fw-bold rounded-1 shadow bg-white"
            style={{ fontSize: "14px" }}
          >
            + Add Preset Quote
          </Button>
          <Button
            onClick={handleDownloadExcel}
            className="fw-bold rounded-1 shadow bg-white text-dark border-0"
            style={{ fontSize: "14px" }}
            disabled={loading || presetQuotations.length === 0}
          >
            {loading ? "Downloading..." : "Download Excel"}
          </Button>
        </div>
      </div>

      <Card className="border-0 p-3">
        <div
          className="table-responsive bg-white"
          style={{ maxHeight: "65vh", overflowY: "auto" }}
        >
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top">
              <tr>
                <th className="text-start" style={{ fontSize: "14px" }}>
                  Sl.No
                </th>
                <th className="text-start" style={{ fontSize: "14px" }}>
                  Category
                </th>
                <th className="text-start" style={{ fontSize: "14px" }}>
                  Services
                </th>
                <th className="text-start" style={{ fontSize: "14px" }}>
                  Amount
                </th>
                <th className="text-start" style={{ fontSize: "14px" }}>
                  Margin Amount
                </th>
                <th className="text-center" style={{ fontSize: "14px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {presetQuotations.length > 0 ? (
                presetQuotations.map((preset, index) => (
                  <tr key={preset._id} className="text-center">
                    <td className="text-start" style={{ fontSize: "12px" }}>
                      {String(
                        (currentPage - 1) * itemsPerPage + index + 1
                      ).padStart(2, "0")}
                    </td>
                    <td className="text-start" style={{ fontSize: "12px" }}>
                      {preset.category} - [
                      {preset.services.map((s) => s.serviceName).join(", ")}]
                    </td>
                    <td className="text-start" style={{ fontSize: "12px" }}>
                      {preset.services.map((s) => s.serviceName).join(", ")}
                    </td>
                    <td className="text-start" style={{ fontSize: "12px" }}>
                      ₹{preset.totalAmount?.toLocaleString?.() ?? 0}
                    </td>
                    <td className="text-start" style={{ fontSize: "12px" }}>
                      ₹{preset.totalMarginAmount?.toLocaleString?.() ?? 0}
                    </td>
                    <td className="d-flex justify-content-center">
                      <Button
                        variant="outline-gray"
                        size="sm"
                        className="me-2"
                        onClick={() => handleDelete(preset._id)}
                      >
                        <img
                          src={deleteIcon}
                          alt="Delete"
                          style={{ width: "20px" }}
                        />
                      </Button>
                      <Button
                        variant="outline-gray"
                        size="sm"
                        onClick={() => handleEdit(preset)}
                      >
                        <img
                          src={editIcon}
                          alt="Edit"
                          style={{ width: "20px" }}
                        />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-3">
                    No preset quotations found. Add a new preset using the
                    button above.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            maxPagesToShow={5}
          />
        </div>
      </Card>

      <PresetQuoteModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingPreset(null);
        }}
        onSave={() => {
          loadPresetQuotations(currentPage, search);
        }}
        preset={editingPreset}
      />
    </Container>
  );
};

export default PresetQuotation;