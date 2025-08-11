import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Col } from "react-bootstrap";
import { toast } from "react-hot-toast";
import axios from "axios";

const PresetQuoteModal = ({ show, onHide, onSave, preset }) => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/category/all");
      setCategories(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories");
      toast.error(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [preset]); // Re-fetch services when preset changes

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/service/all");
      const fetchedServices = response.data.data.map((svc) => ({
        _id: svc._id,
        serviceName: svc.name,
        originalPrice:
          svc.price !== undefined && svc.price !== null ? Number(svc.price) : 0,
        price:
          svc.price !== undefined && svc.price !== null ? Number(svc.price) : 0,
        marginPrice:
          svc.marginPrice !== undefined && svc.marginPrice !== null
            ? Number(svc.marginPrice)
            : 0,
        originalMarginPrice:
          svc.marginPrice !== undefined && svc.marginPrice !== null
            ? Number(svc.marginPrice)
            : 0,
        qty: 1,
        checked: false,
      }));

      // If editing a preset, update services with preset data
      if (preset) {
        setSelectedCategory(preset.category || "");
        setServices(
          fetchedServices.map((svc) => {
            const presetService = preset.services.find(
              (s) => s.id.toString() === svc._id.toString()
            );
            return presetService
              ? {
                  ...svc,
                  checked: true,
                  price:
                    presetService.price !== undefined &&
                    presetService.price !== null
                      ? Number(presetService.price)
                      : svc.originalPrice,
                  marginPrice:
                    presetService.marginPrice !== undefined &&
                    presetService.marginPrice !== null
                      ? Number(presetService.marginPrice)
                      : svc.originalMarginPrice,
                  qty:
                    presetService.qty !== undefined &&
                    presetService.qty !== null
                      ? Number(presetService.qty)
                      : 1,
                }
              : { ...svc, checked: false, qty: 1 };
          })
        );
      } else {
        setServices(fetchedServices);
      }
      setError("");
    } catch (err) {
      setError("Failed to fetch services");
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && !preset) {
      setSelectedCategory("");
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          checked: false,
          price: s.originalPrice,
          marginPrice: s.originalMarginPrice,
          qty: 1,
        }))
      );
    }
  }, [show, preset]);

  const handleCheckboxChange = (id) => {
    setServices((prev) =>
      prev.map((s) => (s._id === id ? { ...s, checked: !s.checked } : s))
    );
  };

  const handlePriceChange = (id, value) => {
    const price = value === "" ? undefined : Number(value);
    setServices((prev) =>
      prev.map((s) => (s._id === id ? { ...s, price } : s))
    );
  };

  const handleMarginPriceChange = (id, value) => {
    const marginPrice = value === "" ? undefined : Number(value);
    setServices((prev) =>
      prev.map((s) => (s._id === id ? { ...s, marginPrice } : s))
    );
  };

  const handleQtyChange = (id, value) => {
    const qty = value === "" ? undefined : Number(value);
    setServices((prev) => prev.map((s) => (s._id === id ? { ...s, qty } : s)));
  };

  const areAllServicesSelected = () => {
    return services.every((service) => service.checked);
  };

  const handleSelectAll = () => {
    setServices((prev) => prev.map((s) => ({ ...s, checked: true })));
  };

  const handleDeselectAll = () => {
    setServices((prev) =>
      prev.map((s) => ({
        ...s,
        checked: false,
        price: s.originalPrice,
        marginPrice: s.originalMarginPrice,
        qty: 1,
      }))
    );
  };

  // Calculate total price and total margin price for selected services
  const totalPrice = services
    .filter((s) => s.checked)
    .reduce((sum, s) => {
      const price = s.price !== undefined ? s.price : s.originalPrice;
      const qty = s.qty !== undefined ? s.qty : 1;
      return sum + price * qty;
    }, 0);

  const totalMarginPrice = services
    .filter((s) => s.checked)
    .reduce((sum, s) => {
      const marginPrice =
        s.marginPrice !== undefined ? s.marginPrice : s.originalMarginPrice;
      const qty = s.qty !== undefined ? s.qty : 1;
      return sum + marginPrice * qty;
    }, 0);

  const handleCreatePackage = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    const selectedServices = services.filter((s) => s.checked);
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    // Validate prices and quantities
    const invalidService = selectedServices.find(
      (s) =>
        s.price === undefined ||
        s.price <= 0 ||
        s.marginPrice === undefined ||
        s.marginPrice < 0 ||
        s.qty === undefined ||
        s.qty < 1
    );
    if (invalidService) {
      toast.error(
        "All selected services must have a price > 0, margin price ≥ 0, and quantity ≥ 1"
      );
      return;
    }

    const presetPackage = {
      category: selectedCategory,
      services: selectedServices.map((s) => ({
        id: s._id,
        serviceName: s.serviceName,
        price: s.price,
        marginPrice: s.marginPrice,
        qty: s.qty,
      })),
      totalAmount: totalPrice,
      totalMarginAmount: totalMarginPrice,
    };

    try {
      if (preset) {
        await axios.put(
          `http://localhost:5000/api/preset-quotation/${preset._id}`,
          presetPackage
        );
        toast.success(`Updated preset for ${selectedCategory}`);
      } else {
        await axios.post(
          "http://localhost:5000/api/preset-quotation",
          presetPackage
        );
        toast.success(`Created new preset for ${selectedCategory}`);
      }

      if (onSave) {
        onSave(presetPackage);
      }
      onHide();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to save preset quotation"
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="text-black" style={{ fontSize: "16px" }}>
          {preset ? "Edit Package" : "Create New Package"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        className="d-flex flex-column"
        style={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        {loading && <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}
        <div className="d-flex justify-content-start gap-3">
          <Form.Group as={Col} sm={5} className="mb-3">
            <Form.Label className="fw-semibold">Select Category</Form.Label>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th className="text-center">SI.No</th>
              <th>
                <Form.Check
                  type="checkbox"
                  label="Services"
                  checked={areAllServicesSelected()}
                  onChange={() =>
                    areAllServicesSelected()
                      ? handleDeselectAll()
                      : handleSelectAll()
                  }
                />
              </th>
              <th>Price</th>
              <th>Margin Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={service._id}>
                <td className="text-center">{index + 1}</td>
                <td>
                  <Form.Check
                    type="checkbox"
                    label={service.serviceName}
                    checked={service.checked}
                    onChange={() => handleCheckboxChange(service._id)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={service.price !== undefined ? service.price : ""}
                    onChange={(e) =>
                      handlePriceChange(service._id, e.target.value)
                    }
                    disabled={!service.checked}
                    placeholder="Enter price"
                    min={0}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={
                      service.marginPrice !== undefined
                        ? service.marginPrice
                        : ""
                    }
                    onChange={(e) =>
                      handleMarginPriceChange(service._id, e.target.value)
                    }
                    disabled={!service.checked}
                    placeholder="Enter margin price"
                    min={0}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={service.qty !== undefined ? service.qty : ""}
                    onChange={(e) =>
                      handleQtyChange(service._id, e.target.value)
                    }
                    disabled={!service.checked}
                    placeholder="Enter quantity"
                    min={1}
                  />
                </td>
              </tr>
            ))}
            <tr className="fw-bold">
              <td colSpan="3" className="text-end">
                Total for Selected Services:
              </td>
              <td className="text-end" style={{ background: "#f8f9fa" }}>
                Margin: ₹ {totalMarginPrice.toLocaleString()}
              </td>
              <td className="text-end" style={{ background: "#f8f9fa" }}>
                Price: ₹ {totalPrice.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </Table>
       
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="dark"
          className="rounded-1"
          onClick={handleCreatePackage}
        >
          {preset ? "Update Package" : "Create Package"}
        </Button>
        <Button
          variant="outline-secondary"
          className="rounded-1"
          onClick={onHide}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PresetQuoteModal;
