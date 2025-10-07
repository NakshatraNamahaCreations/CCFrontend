
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye } from "react-icons/fa";
import DynamicPagination from "../DynamicPagination";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/api";

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
      const res = await axios.get(`${API_URL}/collected-data`, {
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
                    {(() => {
                      const names = Array.from(
                        new Set((item.serviceUnits || []).map((u) => u.packageName))
                      );
                      return `${names.join(", ")} (${names.length})`;
                    })()}
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
