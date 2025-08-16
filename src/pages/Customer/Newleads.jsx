import React, { useState, useEffect } from "react";
import { Button, Card, Table, Container, Form, InputGroup, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import DynamicPagination from "../DynamicPagination";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
};

const ITEMS_PER_PAGE = 100;

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

  const fetchQueries = async (page = 1, searchValue = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/lead/paginated?page=${page}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(searchValue)}`
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

  useEffect(() => {
    fetchQueries(currentPage, search);
  }, [currentPage, search]);

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

  const filteredQueries = queries.filter(({ query }) =>
    statusFilter ? query.status?.toLowerCase() === statusFilter.toLowerCase() : true
  );

  return (
    <Container className="position-relative">
      {/* Search Bar & Filter */}
      <div className="d-flex gap-2 align-items-center justify-content-between p-2 rounded mb-3" style={{ flexWrap: "wrap", zIndex: 1000000 }}>
        <Form onSubmit={handleSearch} style={{ width: "350px" }}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by name or phone"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ fontSize: "14px" }}
              disabled={loading}
            />
            <Button variant="dark" type="submit" disabled={loading} style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}>Search</Button>
            {search && (
              <Button variant="outline-secondary" onClick={handleClearSearch} disabled={loading} style={{ fontSize: "14px", color: "#888" }}>Clear</Button>
            )}
          </InputGroup>
        </Form>

        <Dropdown style={{ zIndex: 10000 }}>
          <Dropdown.Toggle variant="outline-dark" size="sm">
            {statusFilter || "Filter by Status"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setStatusFilter("")}>All</Dropdown.Item>
            <Dropdown.Item onClick={() => setStatusFilter("Created")}>Created</Dropdown.Item>
            <Dropdown.Item onClick={() => setStatusFilter("Call Later")}>Call Later</Dropdown.Item>
            <Dropdown.Item onClick={() => setStatusFilter("Quotation")}>Quotation</Dropdown.Item>
            <Dropdown.Item onClick={() => setStatusFilter("Booked")}>Booked</Dropdown.Item>
            <Dropdown.Item onClick={() => setStatusFilter("Not Interested")}>Not Interested</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Card className="border-0 p-3">
        {error && <p className="text-danger">{error}</p>}
        {loading && <p>Loading...</p>}
        <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top" style={{ backgroundColor: "#343a40" }}>
              <tr>
                <th style={{ fontSize: "14px" }}>Sl.No</th>
                <th style={{ fontSize: "14px" }}>Query Id</th>
                <th style={{ fontSize: "14px" }}>Name</th>
                <th style={{ fontSize: "14px" }}>Phone</th>
                <th style={{ fontSize: "14px" }}>Query Created</th>
                <th style={{ fontSize: "14px" }}>Events</th>
                <th style={{ fontSize: "14px" }}>Status</th>
                <th style={{ fontSize: "14px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center">No leads found</td>
                </tr>
              )}
              {filteredQueries.map((item, i) => {
                const { leadName, leadPhone, leadId, query } = item;
                const status = query.status;
                const isBooked = status === "Booked";
                return (
                  <tr className="text-center fw-semibold" style={{ fontSize: "12px" }} key={item._id}>
                    <td>{String((currentPage - 1) * ITEMS_PER_PAGE + i + 1).padStart(2, "0")}</td>
                    <td>{query.queryId}</td>
                    <td>{leadName || "-"}</td>
                    <td>{leadPhone || "-"}</td>
                    <td>{formatDate(query.createdAt)}</td>
                    <td>
                      {query.eventDetails?.map((ev, idx) => (
                        <div key={idx}>
                          {ev.category} - <small className="text-muted">{formatDate(ev.eventStartDate)}</small>
                        </div>
                      ))}
                    </td>
                    <td>
                      {isBooked ? (
                        <span style={{ backgroundColor: "#e6f4ea", color: "#1a7f37", padding: "4px 8px", borderRadius: "6px", display: "inline-block" }}>Booked</span>
                      ) : (
                        status
                      )}
                    </td>
                    <td>
                      {!isBooked && ["Created", "Call Later"].includes(status) && (
                        <Button
                          variant="link"
                          className="text-black fw-bold"
                          style={{ fontSize: "14px" }}
                          onClick={() => navigate(`/customer/leadsDetails/${leadId}/${query._id}`)}
                        >
                          Update
                        </Button>
                      )}

                      {!isBooked && status === "Quotation" && (
                        <Button
                          variant="dark"
                          className="btn-sm fw-semibold"
                          style={{ fontSize: "14px" }}
                          onClick={() => navigate(`/customer/create-quote/${leadId}/${query._id}`)}
                        >
                          Create Quote
                        </Button>
                      )}

                      {(!isBooked && (status === "Not Interested" || status === "Not Intrested")) && (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </Container>
  );
};

export default Newleads;
