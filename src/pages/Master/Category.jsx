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

const Category = () => {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
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
  const API_URL = "http://localhost:5000/api/category";

  // Fetch categories on mount, page, or search change
  useEffect(() => {
    fetchCategories(currentPage, search);
    // eslint-disable-next-line
  }, [currentPage, search]);

  const fetchCategories = async (page = 1, searchValue = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(
          searchValue
        )}`
      );
      setCategories(response.data.data);
      setTotalPages(response.data.pages || 1);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // Handle create or update category
  const handleAddCat = async () => {
    if (!newCategory) {
      setError("Please fill the category field before adding.");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const response = await axios.put(`${API_URL}/${editingId}`, {
          name: newCategory,
        });
        setCategories(
          categories.map((cat) =>
            cat._id === editingId ? response.data.data : cat
          )
        );
      } else {
        await axios.post(API_URL, { name: newCategory });
        fetchCategories(currentPage, search);
      }
      setShowModal(false);
      setNewCategory("");
      setEditingId(null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEditCat = (id, name) => {
    setEditingId(id);
    setNewCategory(name);
    setShowModal(true);
    setError("");
  };

  // Handle delete button click
  const handleDeleteCat = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      // If last item on page is deleted, go to previous page if needed
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchCategories(currentPage, search);
      }
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel download (downloads all categories, not just current page)
  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}?page=1&limit=10000&search=${encodeURIComponent(search)}`
      );
      const allCategories = response.data.data;
      const ws = XLSX.utils.aoa_to_sheet([
        ["Sl.No", "Category Name", "Created Date"],
        ...allCategories.map((cat, index) => [
          index + 1,
          cat.name,
          new Date(cat.createdAt).toLocaleDateString("en-GB"),
        ]),
      ]);
      ws["!cols"] = [{ wpx: 50 }, { wpx: 200 }, { wpx: 120 }];
      ws["!rows"] = [{ hpx: 30 }, ...allCategories.map(() => ({ hpx: 20 }))];
      for (let col = 0; col < 3; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
        if (cell) {
          cell.s = { font: { bold: true } };
        }
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Categories");
      const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelFile]), "categories.xlsx");
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
                placeholder="Search Category"
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
              setNewCategory("");
              setError("");
            }}
            variant="transparent"
            className="fw-bold rounded-1 shadow bg-white"
            style={{ fontSize: "14px" }}
            disabled={loading}
          >
            + Add Category
          </Button>
          <Button
            onClick={handleDownloadExcel}
            className="fw-bold rounded-1 shadow bg-white text-dark border-0"
            style={{ fontSize: "14px" }}
            disabled={loading || categories.length === 0}
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
                  Category Name
                </th>
                <th style={{ width: "25%", fontSize: "14px" }}>Created Date</th>
                <th style={{ width: "15%", fontSize: "14px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat._id} className="text-center">
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
                    {cat.name}
                  </td>
                  <td
                    className="text-success fw-semibold"
                    style={{ fontSize: "12px" }}
                  >
                    {new Date(cat.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    <Button
                      variant="outline-gray"
                      size="sm"
                      className="me-2"
                      onClick={() => handleDeleteCat(cat._id)}
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
                      onClick={() => handleEditCat(cat._id, cat.name)}
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
          />
        </div>
      </Card>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setNewCategory("");
          setEditingId(null);
          setError("");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-black" style={{ fontSize: "18px" }}>
            {editingId !== null ? "Edit Category" : "Add New Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
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
            onClick={handleAddCat}
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
              setNewCategory("");
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

export default Category;
