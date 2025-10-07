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
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import axios from "axios";
import editIcon from "../../assets/icons/editIcon.png";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import DynamicPagination from "../DynamicPagination";
import { API_URL } from "../../utils/api";

const Reference = () => {
  const [showModal, setShowModal] = useState(false);
  const [references, setReferences] = useState([]);
  const [newReference, setNewReference] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Base URL for API
  // const API_URL = `${API_URL}/reference`;

  // Fetch references on mount, page, or search change
  useEffect(() => {
    fetchReferences(currentPage, search);
    // eslint-disable-next-line
  }, [currentPage, search]);

  const fetchReferences = async (page = 1, searchValue = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/reference?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(
          searchValue
        )}`
      );
      setReferences(response.data.data);
      setTotalPages(response.data.pages || 1);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch references");
    } finally {
      setLoading(false);
    }
  };

  // Handle create or update reference
  const handleAddReference = async () => {
    if (!newReference) {
      setError("Please fill the reference field before adding.");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const response = await axios.put(`${API_URL}/reference/${editingId}`, {
          name: newReference,
        });
        setReferences(
          references.map((ref) =>
            ref._id === editingId ? response.data.data : ref
          )
        );
      } else {
        await axios.post(`${API_URL}/reference`, { name: newReference });
        fetchReferences(currentPage, search);
      }
      setShowModal(false);
      setNewReference("");
      setEditingId(null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save reference");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEditReference = (id, name) => {
    setEditingId(id);
    setNewReference(name);
    setShowModal(true);
    setError("");
  };

  // Handle delete button click
  const handleDeleteReference = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/reference/${id}`);
      // If last item on page is deleted, go to previous page if needed
      if (references.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchReferences(currentPage, search);
      }
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete reference");
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel download (downloads all references, not just current page)
  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/reference?page=1&limit=10000&search=${encodeURIComponent(search)}`
      );
      const allReferences = response.data.data;
      const ws = XLSX.utils.aoa_to_sheet([
        ["Sl.No", "Reference Name", "Created Date"],
        ...allReferences.map((ref, index) => [
          index + 1,
          ref.name,
          new Date(ref.createdAt).toLocaleDateString("en-GB"),
        ]),
      ]);
      ws["!cols"] = [{ wpx: 50 }, { wpx: 200 }, { wpx: 120 }];
      ws["!rows"] = [{ hpx: 30 }, ...allReferences.map(() => ({ hpx: 20 }))];
      for (let col = 0; col < 3; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
        if (cell) {
          cell.s = { font: { bold: true } };
        }
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "References");
      const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelFile]), "references.xlsx");
    } catch (err) {
      setError("Failed to download Excel");
    } finally {
      setLoading(false);
    }
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

  return (
    <Container className="position-relative">
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
        {/* Search bar on the left */}
        <div style={{ width: "350px" }}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search Reference"
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
        {/* Add and Download buttons on the right */}
        <div className="d-flex gap-2">
          <Button
            onClick={() => {
              setShowModal(true);
              setEditingId(null);
              setNewReference("");
              setError("");
            }}
            variant="transparent"
            className="fw-bold rounded-1 shadow bg-white"
            style={{ fontSize: "14px" }}
            disabled={loading}
          >
            + Add Reference
          </Button>
          <Button
            onClick={handleDownloadExcel}
            className="fw-bold rounded-1 shadow bg-white text-dark border-0"
            style={{ fontSize: "14px" }}
            disabled={loading || references.length === 0}
          >
            Download Excel
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading && <div className="text-center">Loading...</div>}

      <Card className="border-0 p-3 pb-0">
        <div
          className="table-responsive bg-white"
          style={{ maxHeight: "65vh", overflowY: "auto" }}
        >
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top">
              <tr>
                <th
                  style={{ width: "10%", fontSize: "14px" }}
                  className="text-start"
                >
                  Sl.No
                </th>
                <th
                  style={{ width: "40%", fontSize: "14px" }}
                  className="text-start"
                >
                  Reference Name
                </th>
                <th style={{ width: "25%", fontSize: "14px" }}>Created Date</th>
                <th style={{ width: "15%", fontSize: "14px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {references.map((ref, index) => (
                <tr key={ref._id} className="text-center">
                  <td
                    className="fw-semibold text-start"
                    style={{ fontSize: "12px" }}
                  >
                    {String(
                      (currentPage - 1) * itemsPerPage + index + 1
                    ).padStart(2, "0")}
                  </td>
                  <td
                    className="fw-semibold text-start"
                    style={{ fontSize: "12px" }}
                  >
                    {ref.name}
                  </td>
                  <td
                    className="text-success fw-semibold"
                    style={{ fontSize: "12px" }}
                  >
                    {new Date(ref.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    <Button
                      variant="outline-gray"
                      size="sm"
                      className="me-2"
                      onClick={() => handleDeleteReference(ref._id)}
                      disabled={loading}
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
                      onClick={() => handleEditReference(ref._id, ref.name)}
                      disabled={loading}
                    >
                      <img
                        src={editIcon}
                        alt="Edit"
                        style={{ width: "20px" }}
                      />
                    </Button>
                  </td>
                </tr>
              ))}
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

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setNewReference("");
          setEditingId(null);
          setError("");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-black" style={{ fontSize: "18px" }}>
            {editingId !== null ? "Edit Reference" : "Add New Reference"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Reference Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Reference name"
                value={newReference}
                onChange={(e) => setNewReference(e.target.value)}
                className="shadow-sm"
                disabled={loading}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="dark"
            className="rounded-1"
            onClick={handleAddReference}
            style={{ borderColor: "black", background: "black" }}
            disabled={loading}
          >
            {editingId !== null ? "Save" : "Add"}
          </Button>
          <Button
            variant="outline-secondary"
            className="rounded-1"
            onClick={() => {
              setShowModal(false);
              setNewReference("");
              setEditingId(null);
              setError("");
            }}
            disabled={loading}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Reference;