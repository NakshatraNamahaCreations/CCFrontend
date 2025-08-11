// import React, { useState, useEffect } from 'react';
// import { Table, Form, Button, Card } from 'react-bootstrap';
// import sortIcon from '../../assets/icons/sort.png';
// import filterIcon from '../../assets/icons/filter.png';
// import { IoSearch, IoChevronForward } from 'react-icons/io5';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import dayjs from 'dayjs'; // Import dayjs

// const PostProductionPage = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchQuotations = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/quotations/finalized');
//         if (response.data.success) {
//           // Transform quotations into the format needed for the table
//           const transformedData = response.data.data.map((quotation, idx) => ({
//             id: idx + 1,
//             bookingId: quotation.id,
//             // Show only the first package name to avoid combining multiple events
//             event: quotation.packages[0]?.packageName || 'N/A', // Updated to show only one event
//             eventstartdate: quotation.customerId?.eventStartDate
//               ? dayjs(quotation.customerId.eventStartDate).format('DD/MM/YYYY')
//               : 'N/A',
//             eventEndDate: quotation.customerId?.eventEndDate
//               ? dayjs(quotation.customerId.eventEndDate).format('DD/MM/YYYY')
//               : 'N/A',
//           }));
//           setData(transformedData);
//         } else {
//           toast.error('Failed to fetch quotations');
//         }
//       } catch (error) {
//         console.error('Error fetching quotations:', error);
//         toast.error(error.response?.data?.message || 'Failed to fetch quotations');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchQuotations();
//   }, []);

//   if (loading) {
//     return <div className="text-center">Loading...</div>;
//   }

//   return (
//     <div className="container py-2 rounded vh-100" style={{ background: '#F4F4F4' }}>
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
//                     paddingLeft: '4px',
//                     border: 'none',
//                     outline: 'none',
//                     boxShadow: 'none',
//                     fontSize: '14px',
//                   }}
//                 />
//               </Form.Group>
//             </Form>
//           </div>
//           <img src={sortIcon} alt="sortIcon" style={{ width: '25px', cursor: 'pointer' }} />
//           <img src={filterIcon} alt="filterIcon" style={{ width: '25px', cursor: 'pointer' }} />
//         </div>
//         <div className="text-end">
//           <Button
//             variant="light-gray"
//             className="btn rounded-5 bg-white border-2 shadow-sm"
//             style={{ fontSize: '14px' }}
//           >
//             Download Excel
//           </Button>
//         </div>
//       </div>
//       <Card className="border-0 p-3 my-3">
//         <div className="table-responsive bg-white" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
//           <Table className="table table-hover align-middle">
//             <thead className="text-white text-center sticky-top">
//               <tr style={{ fontSize: '14px' }}>
//                 <th>Sl.no</th>
//                 <th>Booking Id</th>
//                 <th>Event Name</th>
//                 <th>Event Start Date</th>
//                 <th>Event End Date</th>
//                 <th></th>
//               </tr>
//             </thead>
//             <tbody style={{ fontSize: '12px', textAlign: 'center' }} className="fw-semibold">
//               {data.map((item, idx) => (
//                 <tr
//                   key={item.id}
//                   onClick={() => navigate(`/post-production/post-production-detail/${item.bookingId}`)}
//                 >
//                   <td>{String(idx + 1).padStart(2, '0')}</td>
//                   <td>{item.bookingId}</td>
//                   <td>{item.event}</td>
//                   <td>{item.eventstartdate}</td>
//                   <td>{item.eventEndDate}</td>
//                   <td style={{ cursor: 'pointer' }}>
//                     <IoChevronForward size={20} className="text-muted" />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default PostProductionPage;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye } from "react-icons/fa";
import DynamicPagination from "../DynamicPagination";
import { useNavigate } from "react-router-dom";

const PostProductionPage = () => {
  const navigate = useNavigate();
  const [collectedData, setCollectedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search states
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchCollectedData();
  }, [currentPage, search]);

  const fetchCollectedData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/collected-data", {
        params: { page: currentPage, limit: 10, search },
      });

      if (res.data.success) {
        setCollectedData(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching collected data list:", error);
    }
  };

  const handleSearchClick = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="container py-4" style={{ fontSize: "13px" }}>
      {/* Search Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group" style={{ width: "320px" }}>
          <input
            type="text"
            placeholder="Search Quote ID / Person"
            className="form-control"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ fontSize: "13px" }}
          />
          <button
            className="btn btn-dark"
            style={{ fontSize: "13px" }}
            onClick={handleSearchClick}
          >
            Search
          </button>
          {searchInput && ( // 👈 Show Clear only when there's text
            <button
              className="btn btn-outline-secondary"
              style={{ fontSize: "13px" }}
              onClick={handleClearSearch}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table
          className="table table-striped table-hover align-middle shadow-sm"
          style={{ fontSize: "13px" }}
        >
          <thead
            style={{
              backgroundColor: "#f8f9fa",
              fontWeight: "600",
              fontSize: "13px",
            }}
          >
            <tr>
              <th style={{ width: "6%" }}>Sl.No</th>
              <th style={{ width: "12%" }}>Quote ID</th>
              <th style={{ width: "15%" }}>Person Name</th>
              <th>Events</th>
              <th style={{ width: "10%" }}>Photos</th>
              <th style={{ width: "10%" }}>Videos</th>
              <th style={{ width: "8%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {collectedData.length > 0 ? (
              collectedData.map((item, index) => (
                <tr key={item._id}>
                  <td>
                    {String((currentPage - 1) * 10 + index + 1).padStart(
                      2,
                      "0"
                    )}
                  </td>
                  <td className="fw-semibold text-dark">
                    {item.quotationUniqueId}
                  </td>
                  <td>{item.personName}</td>
                  <td className="text-muted">
                    {item.events.map((ev) => ev.eventName).join(", ")}
                  </td>
                  <td className="text-center">{item.totalPhotos}</td>
                  <td className="text-center">{item.totalVideos}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-light border"
                      title="View Details"
                      onClick={() => navigate(`/post-production/post-production-detail/${item?._id}`)}
                    >
                      <FaEye size={13} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted py-3">
                  No collected data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <DynamicPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default PostProductionPage;
