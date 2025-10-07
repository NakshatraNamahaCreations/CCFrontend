import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Table,
  Container,
  Form,
  InputGroup,
  Dropdown,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import DynamicPagination from "../DynamicPagination";
import { FaDownload } from "react-icons/fa";
import { API_URL } from "../../utils/api";

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
};

const Newleads = () => {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("");
  const [eventDate, setEventDate] = useState(""); // 🔹 new

  // Normal fetch
  const fetchQueries = async (page = 1, searchValue = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/lead/paginated?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(
          searchValue
        )}&status=${encodeURIComponent(
          statusFilter
        )}&eventCategory=${encodeURIComponent(eventCategoryFilter)}`
      );

      setQueries(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leads");
      toast.error(err.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  // Fetch by event-date
  const fetchByEventDate = async (date) => {
    if (!date) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/lead/event-date/${date}`
      );

      const leads = response.data.leads || [];
      // 🔹 Flatten leads → queries for table
      const normalized = leads.flatMap((lead) =>
        (lead.queries || []).map((q) => ({
          leadId: lead.leadId,
          leadName: lead.persons?.[0]?.name || "-",
          leadPhone: lead.persons?.[0]?.phoneNo || "-",
          query: q,
        }))
      );

      setQueries(normalized);
      setTotalPages(1);
      setCurrentPage(1);
      setError("");
    } catch (err) {
      setError("Failed to fetch by event date");
      toast.error("Failed to fetch by event date");
    } finally {
      setLoading(false);
    }
  };

  // Watchers
  useEffect(() => {
    if (eventDate) {
      fetchByEventDate(eventDate);
    } else {
      fetchQueries(currentPage, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, statusFilter, eventCategoryFilter, eventDate]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setQueries([]);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  // CSV Export
  const downloadCSV = () => {
    if (queries.length === 0) {
      toast.error("No data to download");
      return;
    }

    const headers = [
      "Sl.No",
      "Query ID",
      "Name",
      "Phone",
      "Query Created",
      "Events",
      "Status",
    ];
    let csvContent = headers.join(",") + "\n";

    queries.forEach((item, index) => {
      const { leadName, leadPhone, query } = item;
      const events =
        query.eventDetails
          ?.map((ev) => `${ev.category} - ${formatDate(ev.eventStartDate)}`)
          .join("; ") || "-";

      const row = [
        index + 1,
        query.queryId || "-",
        `"${leadName || "-"}"`,
        leadPhone || "-",
        formatDate(query.createdAt),
        `"${events}"`,
        query.status || "-",
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `leads_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Data downloaded successfully");
  };

  return (
    <Container className="position-relative">
      {/* Search + Filters */}
      <div
        className="d-flex gap-2 align-items-center justify-content-between p-2 rounded mb-3"
        style={{ flexWrap: "wrap", zIndex: 1000000 }}
      >
        {/* Search */}
        <Form onSubmit={handleSearch} style={{ width: "350px" }}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by name, phone, or query ID"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ fontSize: "14px" }}
              disabled={loading}
            />
            <Button
              variant="dark"
              type="submit"
              disabled={loading}
              style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}
            >
              Search
            </Button>
            {search && (
              <Button
                variant="outline-secondary"
                onClick={handleClearSearch}
                disabled={loading}
                style={{ fontSize: "14px", color: "#888" }}
              >
                Clear
              </Button>
            )}
          </InputGroup>
        </Form>

        <div className="d-flex gap-2 ">
          {/* Status Filter */}
          <Dropdown style={{ zIndex: "99999" }}>
            <Dropdown.Toggle variant="outline-dark" size="sm">
              {statusFilter || "Filter by Status"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setStatusFilter("")}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter("Created")}>Created</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter("Call Later")}>Call Later</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter("Quotation")}>Quotation</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter("Booked")}>Booked</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter("Not Interested")}>
                Not Interested
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Event Category Filter */}
          <Form.Control
            type="text"
            placeholder="Filter by Event Category"
            value={eventCategoryFilter}
            onChange={(e) => {
              setEventCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: "14px", width: "200px" }}
          />

          {/* 🔹 Event Date Filter */}
          <Form.Control
            type="date"
            value={eventDate}
            onChange={(e) => {
              setEventDate(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: "14px", width: "200px" }}
          />
          {eventDate && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setEventDate("")}
            >
              Clear Date
            </Button>
          )}

          {/* Export */}
          <Button
            variant="success"
            size="sm"
            onClick={downloadCSV}
            disabled={queries.length === 0}
            className="d-flex align-items-center gap-1"
          >
            <FaDownload /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 p-3 pb-0">
        {error && <p className="text-danger">{error}</p>}
        <div
          className="table-responsive bg-white"
          style={{ maxHeight: "65vh", overflowY: "auto" }}
        >
          <Table className="table table-hover align-middle">
            <thead
              className="text-white sticky-top"
              style={{ backgroundColor: "#343a40" }}
            >
              <tr>
                <th style={{ fontSize: "12px" }}>Sl.No</th>
                <th style={{ fontSize: "12px" }}>Query Id</th>
                <th style={{ fontSize: "12px" }}>Name</th>
                <th style={{ fontSize: "12px" }}>Phone</th>
                <th style={{ fontSize: "12px" }}>Query Created</th>
                <th style={{ fontSize: "12px" }}>Events</th>
                <th style={{ fontSize: "12px" }}>Remarks</th>
                <th style={{ fontSize: "12px" }}>Status</th>
                <th style={{ fontSize: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <Spinner animation="border" role="status" size="sm" />
                    <span className="ms-2">Loading...</span>
                  </td>
                </tr>
              )}
              {!loading && queries.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center">
                    No leads found
                  </td>
                </tr>
              )}
              {!loading &&
                queries.map((item, i) => {
                  const { leadName, leadPhone, leadId, query } = item;
                  const status = query.status;
                  const isBooked = status === "Booked";

                  return (
                    <tr
                      className=""
                      style={{ fontSize: "12px" }}
                      key={query._id}
                    >
                      <td>
                        {String(
                          (currentPage - 1) * ITEMS_PER_PAGE + i + 1
                        ).padStart(2, "0")}
                      </td>
                      <td>{query.queryId}</td>
                      <td>{leadName || "-"}</td>
                      <td>{leadPhone || "-"}</td>
                      <td>{formatDate(query.createdAt)}</td>
                      <td>
                        {query.eventDetails?.map((ev, idx) => (
                          <div key={idx} className="text-dark fw-semibold">
                            {ev.category} -{" "}
                            <small className="text-dark">
                              {formatDate(ev.eventStartDate)}
                            </small>
                          </div>
                        ))}
                      </td>
                      <td>{query.comment}</td>
                      <td>
                        {isBooked ? (
                          <span
                            style={{
                              backgroundColor: "#e6f4ea",
                              color: "#1a7f37",
                              padding: "4px 2px",
                              borderRadius: "6px",
                              display: "inline-block",
                            }}
                          >
                            Booked
                          </span>
                        ) : (
                          status
                        )}
                      </td>
                      <td>
                        {!isBooked &&
                          ["Created", "Call Later"].includes(status) && (
                            <Button
                              variant="link"
                              size="sm"
                              className="text-black fw-bold"
                              style={{ fontSize: "14px" }}
                              onClick={() =>
                                navigate(
                                  `/customer/leadsDetails/${leadId}/${query._id}`
                                )
                              }
                            >
                              Update
                            </Button>
                          )}

                        {!isBooked && status === "Quotation" && (
                          <Button
                            variant="dark"
                            className="btn-sm fw-semibold"
                            style={{ fontSize: "12px" }}
                            onClick={() =>
                              navigate(
                                `/customer/create-quote/${leadId}/${query._id}`
                              )
                            }
                          >
                            Create Quote
                          </Button>
                        )}

                        {!isBooked &&
                          (status === "Not Interested" ||
                            status === "Not Intrested") && (
                            <span className="text-muted">—</span>
                          )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Pagination (disabled when date filter applied) */}
      {!eventDate && (
        <DynamicPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </Container>
  );
};

export default Newleads;
