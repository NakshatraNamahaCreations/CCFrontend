import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Card, Table, Container, InputGroup } from "react-bootstrap";
import editIcon from "../../assets/icons/editIcon.png";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import DynamicPagination from "../DynamicPagination";

const Complementary = () => {
  const [showModal, setShowModal] = useState(false);
  const [complementaries, setComplementaries] = useState([]);
  const [newComp, setNewComp] = useState({
    serviceName: "",
    marginPrice: "",
  });
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const API_URL = "http://localhost:5000/api/complementary";

  // Fetch complementary items on mount, page, or search change
  useEffect(() => {
    fetchComplementaries(currentPage, search);
    // eslint-disable-next-line
  }, [currentPage, search]);

  const fetchComplementaries = async (page = 1, searchValue = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(searchValue)}`
      );
      setComplementaries(
        response.data.data.map((comp) => ({
          _id: comp._id,
          serviceName: comp.name,
          marginPrice: comp.marginPrice || "",
        }))
      );
      setTotalPages(response.data.pages || 1);
      setError("");
    } catch (err) {
      setError("Failed to fetch complementary items");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewComp((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create or Update complementary
  const handleAddComplementary = async () => {
    if (!newComp.serviceName || newComp.marginPrice === "") {
      setError("Please fill in all fields.");
      return;
    }

    // Convert marginPrice to number and validate
    const marginPriceNum = Number(newComp.marginPrice);
    if (isNaN(marginPriceNum) || marginPriceNum < 0) {
      setError("Margin Price should be a valid non-negative number.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && editingId) {
        // Update complementary API call
        const response = await axios.put(`${API_URL}/${editingId}`, {
          name: newComp.serviceName,
          marginPrice: marginPriceNum,
        });
        setComplementaries((prev) =>
          prev.map((comp) =>
            comp._id === editingId
              ? {
                  _id: response.data.data._id,
                  serviceName: response.data.data.name,
                  marginPrice: response.data.data.marginPrice,
                }
              : comp
          )
        );
      } else {
        // Create new complementary API call
        await axios.post(API_URL, {
          name: newComp.serviceName,
          marginPrice: marginPriceNum,
        });
        fetchComplementaries(currentPage, search);
      }

      setShowModal(false);
      setNewComp({ serviceName: "", marginPrice: "" });
      setIsEditing(false);
      setEditingId(null);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save complementary. Margin Price should be a valid number."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditComplementary = (index) => {
    setIsEditing(true);
    setEditingId(complementaries[index]._id);
    setNewComp({
      serviceName: complementaries[index].serviceName,
      marginPrice: complementaries[index].marginPrice,
    });
    setShowModal(true);
    setError("");
  };

  const handleDeleteComplementary = async (index) => {
    const id = complementaries[index]._id;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      // If last item on page is deleted, go to previous page if needed
      if (complementaries.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchComplementaries(currentPage, search);
      }
      setError("");
    } catch (err) {
      setError("Failed to delete complementary");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}?page=1&limit=10000&search=${encodeURIComponent(search)}`
      );
      const allComplementaries = response.data.data.map((comp) => ({
        serviceName: comp.name,
        marginPrice: comp.marginPrice || "",
      }));
      const ws = XLSX.utils.aoa_to_sheet([
        ["Sl.No", "Complementary Name", "Margin Price"],
        ...allComplementaries.map((comp, index) => [
          index + 1,
          comp.serviceName,
          comp.marginPrice,
        ]),
      ]);
      ws["!cols"] = [{ wpx: 50 }, { wpx: 200 }, { wpx: 120 }];
      ws["!rows"] = [{ hpx: 30 }, ...allComplementaries.map(() => ({ hpx: 20 }))];
      for (let col = 0; col < 3; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
        if (cell) {
          cell.s = { font: { bold: true } };
        }
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Complementary");
      const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelFile]), "complementary.xlsx");
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
                placeholder="Search Complementary"
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
              setIsEditing(false);
              setNewComp({ serviceName: "", marginPrice: "" });
              setError("");
            }}
            variant="transparent"
            className="fw-bold rounded-1 shadow bg-white"
            style={{ fontSize: "14px" }}
            disabled={loading}
          >
            + Add Complementary
          </Button>
          <Button
            onClick={handleDownloadExcel}
            className="fw-bold rounded-1 shadow bg-white text-dark border-0"
            style={{ fontSize: "14px" }}
            disabled={loading || complementaries.length === 0}
          >
            Download Excel
          </Button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="text-center">Loading...</div>}

      <Card className="border-0 p-3">
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
                  style={{ width: "60%", fontSize: "14px" }}
                  className="text-start"
                >
                  Complementary Name
                </th>
                <th
                  style={{ width: "20%", fontSize: "14px" }}
                  className="text-start"
                >
                  Margin Price
                </th>
                <th
                  style={{ width: "10%", fontSize: "14px" }}
                  className="text-center"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {complementaries.map((comp, index) => (
                <tr key={comp._id} className="text-center">
                  <td
                    className="fw-semibold text-start"
                    style={{ fontSize: "12px" }}
                  >
                    {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                  </td>
                  <td
                    className="fw-semibold text-start"
                    style={{ fontSize: "12px" }}
                  >
                    {comp.serviceName}
                  </td>
                  <td
                    className="text-primary text-start fw-semibold"
                    style={{ fontSize: "12px" }}
                  >
                    {comp.marginPrice}
                  </td>
                  <td className="d-flex justify-content-center">
                    <Button
                      variant="outline-gray"
                      size="sm"
                      className="me-2"
                      onClick={() => handleDeleteComplementary(index)}
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
                      onClick={() => handleEditComplementary(index)}
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

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px" }}>
            {isEditing ? "Edit Complementary" : "Add Complementary"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">{error}</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Complementary Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Complementary name"
                value={newComp.serviceName}
                onChange={handleChange}
                className="shadow-sm"
                name="serviceName"
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Margin Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Margin Price"
                value={newComp.marginPrice}
                onChange={handleChange}
                className="shadow-sm"
                name="marginPrice"
                disabled={loading}
                min={0}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="dark"
            className="rounded-1"
            onClick={handleAddComplementary}
            style={{ borderColor: "black", background: "black" }}
            disabled={loading}
          >
            {isEditing ? "Update" : "Add"}
          </Button>
          <Button
            variant="outline-secondary"
            className="rounded-1"
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Complementary;