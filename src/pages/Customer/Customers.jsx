// import React, { useState, useEffect } from "react";
// import { Button, Card, Table, Container } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import editIcon from "../../assets/icons/editIcon.png";
// import deleteIcon from "../../assets/icons/deleteIcon.png";

// const Customers = () => {
//   const navigate = useNavigate();
//   const [customersDetails, setCustomersDetails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Fetch customers from the backend
//   useEffect(() => {
//     const fetchCustomers = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get("http://localhost:5000/api/customer");
//         setCustomersDetails(response.data.data || []);
//       } catch (err) {
//         const errorMessage = err.response?.data?.message || "Failed to fetch customers";
//         setError(errorMessage);
//         toast.error(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCustomers();
//   }, []);

//   // Handle delete customer
//   const handleDelete = async (customerId) => {
//     if (!window.confirm("Are you sure you want to delete this customer?")) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/customer/${customerId}`);
//       setCustomersDetails(customersDetails.filter((customer) => customer._id !== customerId));
//       toast.success("Customer deleted successfully");
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Failed to delete customer";
//       toast.error(errorMessage);
//     }
//   };

//   // Handle edit navigation
//   const handleEdit = (customer) => {
//     navigate(`/customer/addLeads/${customer._id}`, { state: { customer } });
//   };

//   return (
//     <Container className="position-relative">
//       <Card className="border-0 p-3">
//         {error && <p className="text-danger">{error}</p>}
//         {loading && <p>Loading...</p>}
//         <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
//           <Table className="table table-hover align-middle">
//             <thead className="text-white text-center sticky-top" style={{ backgroundColor: "#343a40" }}>
//               <tr style={{ fontSize: "14px" }}>
//                 <th>Sl.No</th>
//                 <th>Name</th>
//                 <th>Phone no.</th>
//                 <th>Customer Id</th>
//                 <th>Event</th>
//                 <th>Date</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {customersDetails.length === 0 && !loading ? (
//                 <tr>
//                   <td colSpan="7" className="text-center">
//                     No customers found
//                   </td>
//                 </tr>
//               ) : (
//                 customersDetails.map((customer, index) => (
//                   <tr key={customer._id} className="text-center">
//                     <td className="fw-semibold" style={{ fontSize: "12px" }}>
//                       {String(index + 1).padStart(2, "0")}
//                     </td>
//                     <td className="fw-semibold" style={{ fontSize: "12px" }}>
//                       {customer.name}
//                     </td>
//                     <td className="text-success fw-semibold" style={{ fontSize: "12px" }}>
//                       {customer.phoneNo || "N/A"}
//                     </td>
//                     <td className="fw-semibold" style={{ fontSize: "12px" }}>
//                       {customer._id}
//                     </td>
//                     <td className="fw-semibold" style={{ fontSize: "12px" }}>
//                       {customer.category?.map((cat) => cat.name).join(", ") || "N/A"}
//                     </td>
//                     <td className="fw-semibold" style={{ fontSize: "12px" }}>
//                       {customer.eventStartDate
//                         ? new Date(customer.eventStartDate).toLocaleDateString("en-GB", {
//                             day: "2-digit",
//                             month: "2-digit",
//                             year: "2-digit",
//                           })
//                         : "N/A"}
//                     </td>
//                     <td>
//                       <Button
//                         variant="outline-gray"
//                         size="sm"
//                         className="me-2"
//                         onClick={() => handleDelete(customer._id)}
//                       >
//                         <img src={deleteIcon} alt="Delete" style={{ width: "20px" }} />
//                       </Button>
//                       <Button
//                         variant="outline-gray"
//                         size="sm"
//                         onClick={() => handleEdit(customer)}
//                       >
//                         <img src={editIcon} alt="Edit" style={{ width: "20px" }} />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </Table>
//         </div>
//       </Card>
//     </Container>
//   );
// };

// export default Customers;
import React, { useState, useEffect } from "react";
import { Button, Card, Table, Container, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import editIcon from "../../assets/icons/editIcon.png";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import DynamicPagination from "../DynamicPagination";

const Customers = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchLeads(currentPage, search);
  }, [currentPage, search]);

  const fetchLeads = async (page = 1, searchValue = "") => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/lead?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(searchValue)}`
      );
      let leads = res.data.data || [];
      leads = leads.sort((a, b) => {
        const numA = parseInt(a.leadId?.replace("CC-Cust", "") || "0");
        const numB = parseInt(b.leadId?.replace("CC-Cust", "") || "0");
        return numA - numB;
      });
      setLeads(leads);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch leads";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lead) => {
    navigate(`/customer/addLeads/${lead._id}`, { state: { lead } });
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/lead/${leadId}`);
      setLeads(leads.filter((lead) => lead._id !== leadId));
      toast.success("Lead deleted successfully");
    } catch (err) {
      toast.error("Failed to delete lead");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  return (
    <Container className="position-relative">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form onSubmit={handleSearch} style={{ width: "350px" }}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by name or phone"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={loading}
            />
            <Button variant="dark" type="submit" disabled={loading}>
              Search
            </Button>
            {search && (
              <Button variant="outline-secondary" onClick={handleClearSearch} disabled={loading}>
                Clear
              </Button>
            )}
          </InputGroup>
        </Form>
      </div>

      <Card className="border-0 p-3">
        {error && <p className="text-danger">{error}</p>}
        {loading && <p>Loading...</p>}

        <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top" style={{ backgroundColor: "#343a40" }}>
              <tr style={{ fontSize: "14px" }}>
                <th>Sl.No</th>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Phone No</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && !loading ? (
                <tr>
                  <td colSpan="7" className="text-center">No leads found</td>
                </tr>
              ) : (
                leads.map((lead, index) => {
                  const firstPerson = lead.persons?.[0] || {};
                  return (
                    <tr key={lead._id} className="text-center">
                      <td style={{ fontSize: "12px" }}>{String(index + 1).padStart(2, "0")}</td>
                      <td style={{ fontSize: "12px" }}>{lead.leadId || "N/A"}</td>
                      <td style={{ fontSize: "12px" }}>{firstPerson.name || "N/A"}</td>
                      <td className="text-success fw-semibold" style={{ fontSize: "12px" }}>
                        {firstPerson.phoneNo || "N/A"}
                      </td>
                      <td style={{ fontSize: "12px" }}>
                        {lead.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString("en-GB")
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })
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
      </Card>
    </Container>
  );
};

export default Customers;
