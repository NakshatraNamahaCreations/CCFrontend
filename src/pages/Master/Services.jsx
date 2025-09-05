import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Card, Table, Container, InputGroup } from "react-bootstrap";
import editIcon from "../../assets/icons/editIcon.png";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import DynamicPagination from "../DynamicPagination";

const Services = () => {
  const [showModal, setShowModal] = useState(false);
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    serviceName: "",
    price: "",
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

  const API_URL = "http://localhost:5000/api/service";

  // Fetch services on mount, page, or search change
  useEffect(() => {
    fetchServices(currentPage, search);
    // eslint-disable-next-line
  }, [currentPage, search]);

  const fetchServices = async (page = 1, searchValue = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(searchValue)}`
      );
      setServices(
        response.data.data.map((svc) => ({
          _id: svc._id,
          serviceName: svc.name,
          price: svc.price,
          marginPrice: svc.marginPrice || "",
        }))
      );
      setTotalPages(response.data.pages || 1);
      setError("");
    } catch (err) {
      setError("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewService((prevService) => ({
      ...prevService,
      [name]: value,
    }));
  };

  // Create or Update service
  const handleAddService = async () => {
    if (
      !newService.serviceName ||
      !newService.price ||
      !newService.marginPrice
    ) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && editingId) {
        // Update service API call
        const response = await axios.put(`${API_URL}/${editingId}`, {
          name: newService.serviceName,
          price: Number(newService.price),
          marginPrice: Number(newService.marginPrice),
        });
        setServices((prevServices) =>
          prevServices.map((svc) =>
            svc._id === editingId
              ? {
                  _id: response.data.data._id,
                  serviceName: response.data.data.name,
                  price: response.data.data.price,
                  marginPrice: response.data.data.marginPrice,
                }
              : svc
          )
        );
      } else {
        // Create new service API call
        const response = await axios.post(API_URL, {
          name: newService.serviceName,
          price: Number(newService.price),
          marginPrice: Number(newService.marginPrice),
        });
        // Refetch current page to get updated data
        fetchServices(currentPage, search);
      }

      setShowModal(false);
      setNewService({ serviceName: "", price: "", marginPrice: "" });
      setIsEditing(false);
      setEditingId(null);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save service. Price and Margin Price should be valid numbers."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = (index) => {
    setIsEditing(true);
    setEditingId(services[index]._id);
    setNewService({
      serviceName: services[index].serviceName,
      price: services[index].price,
      marginPrice: services[index].marginPrice,
    });
    setShowModal(true);
    setError("");
  };

  const handleDeleteService = async (index) => {
    const id = services[index]._id;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      // If last item on page is deleted, go to previous page if needed
      if (services.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchServices(currentPage, search);
      }
      setError("");
    } catch (err) {
      setError("Failed to delete service");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}?search=${encodeURIComponent(search)}`
      );
      const allServices = response.data.data.map((svc) => ({
        serviceName: svc.name,
        price: svc.price,
        marginPrice: svc.marginPrice || "",
      }));
      const ws = XLSX.utils.aoa_to_sheet([
        ["Sl.No", "Service Name", "Price", "Margin Price"],
        ...allServices.map((service, index) => [
          index + 1,
          service.serviceName,
          service.price,
          service.marginPrice,
        ]),
      ]);
      ws["!cols"] = [
        { wpx: 50 },
        { wpx: 200 },
        { wpx: 120 },
        { wpx: 120 },
      ];
      ws["!rows"] = [{ hpx: 30 }, ...allServices.map(() => ({ hpx: 20 }))];
      for (let col = 0; col < 4; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
        if (cell) {
          cell.s = { font: { bold: true } };
        }
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Services");
      const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelFile]), "services.xlsx");
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
                placeholder="Search Service"
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
              setNewService({ serviceName: "", price: "", marginPrice: "" });
              setError("");
            }}
            variant="transparent"
            className="fw-bold rounded-1 shadow bg-white"
            style={{ fontSize: "14px" }}
            disabled={loading}
          >
            + Add Service
          </Button>
          <Button
            onClick={handleDownloadExcel}
            className="fw-bold rounded-1 shadow bg-white text-dark border-0"
            style={{ fontSize: "14px" }}
            disabled={loading || services.length === 0}
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
                  style={{ width: "30%", fontSize: "14px" }}
                  className="text-start"
                >
                  Service Name
                </th>
                <th
                  style={{ width: "20%", fontSize: "14px" }}
                  className="text-start"
                >
                  Service Price
                </th>
                <th
                  style={{ width: "20%", fontSize: "14px" }}
                  className="text-start"
                >
                  Margin Price
                </th>
                <th
                  style={{ width: "15%", fontSize: "14px" }}
                  className="text-center"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((serviceItem, index) => (
                <tr key={serviceItem._id} className="text-center">
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
                    {serviceItem.serviceName}
                  </td>
                  <td
                    className="text-success text-start fw-semibold"
                    style={{ fontSize: "12px" }}
                  >
                    {serviceItem.price}
                  </td>
                  <td
                    className="text-primary text-start fw-semibold"
                    style={{ fontSize: "12px" }}
                  >
                    {serviceItem.marginPrice}
                  </td>
                  <td>
                    <Button
                      variant="outline-gray"
                      size="sm"
                      className="me-2"
                      onClick={() => handleDeleteService(index)}
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
                      onClick={() => handleEditService(index)}
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
            {isEditing ? "Edit Service" : "Add Service"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">{error}</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Service Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Service name"
                value={newService.serviceName}
                onChange={handleChange}
                className="shadow-sm"
                name="serviceName"
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Price"
                value={newService.price}
                onChange={handleChange}
                className="shadow-sm"
                name="price"
                disabled={loading}
                min={0}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Margin Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Margin Price"
                value={newService.marginPrice}
                onChange={handleChange}
                className="shadow-sm"
                name="marginPrice"
                disabled={loading}
                min={0}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="dark"
            className="rounded-1"
            onClick={handleAddService}
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

export default Services;