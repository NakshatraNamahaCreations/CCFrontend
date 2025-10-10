// src/pages/PostProduction/modals/PhotoSelectionModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import { API_URL } from "../../../utils/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const PhotoSelectionModal = ({
  show,
  onClose,
  album,
  totalSortedPhotos,
  quotationId,
  onStatusUpdate,
  onAssigned, // NEW
}) => {
  const [formData, setFormData] = useState({
    photosToSelect: "",
    specialization: "",
    vendorId: "",
    taskDescription: "",
    assignedDate: dayjs().format("YYYY-MM-DD"),
  });

  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get album base photos
  const getAlbumBasePhotos = () => {
    return album?.snapshot?.basePhotos || 0;
  };

  // Fetch specialization options
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const res = await axios.get(`${API_URL}/service/all`);
        if (res.data.success) {
          const serviceOptions = res.data.data.map((service) => ({
            value: service._id,
            label: service.name,
          }));

          const staticSpecialization = [
            { value: "candid-photo-editing", label: "Candid photo editing" },
            {
              value: "traditional-video-editing",
              label: "Traditional Video editing",
            },
            {
              value: "traditional-photo-editing",
              label: "Traditional Photo editing",
            },
            { value: "candid-video-editing", label: "Candid Video editing" },
            { value: "album-designing", label: "Album Designing" },
            { value: "photo-sorting", label: "Photo sorting" },
            { value: "video-sorting", label: "Video sorting/Conversion" },
            { value: "assistant", label: "Assistant" },
            { value: "driver", label: "Driver" },
            { value: "cc-admin", label: "CC Admin" },
            { value: "cr-manager", label: "CR Manager" },
            { value: "makeup-artist", label: "Make up Artist" },
            { value: "speakers-audio", label: "Speakers & Audio arrangements" },
            {
              value: "album-final-correction",
              label: "Album final correction",
            },
            {
              value: "photo-colour-correction",
              label: "Photo colour correction",
            },
            { value: "album-photo-selection", label: "Album photo selection" },
            { value: "video-3d-editing", label: "3D Video editing" },
            { value: "vr-360-editing", label: "360 degree VR Video editing" },
            { value: "photo-slideshow", label: "Photo slideshow" },
            { value: "photo-lamination", label: "Photo lamination & Frame" },
            { value: "photo-printing-lab", label: "Photo Printing Lab" },
            { value: "storage-devices", label: "Storage devices" },
            {
              value: "marketing-printing",
              label: "Marketing collaterals Printing",
            },
            { value: "uniforms", label: "Uniforms" },
            { value: "branding-collaterals", label: "Branding collaterals" },
            {
              value: "software-hardware",
              label: "Software & Hardware service",
            },
            { value: "supervisor", label: "Supervisor" },
            { value: "marketing-team", label: "Marketing Team" },
            { value: "branding-team", label: "Branding Team" },
          ];

          setSpecializationOptions([
            ...serviceOptions,
            ...staticSpecialization,
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch specializations", err);
      }
    };

    fetchSpecializations();
  }, []);

  // Fetch vendors based on specialization
  const fetchVendorsBySpecialization = async (specializationName) => {
    if (!specializationName) {
      setVendors([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/vendors/specialization/${encodeURIComponent(
          specializationName
        )}`
      );

      if (res.data?.success && Array.isArray(res.data.data)) {
        setVendors(res.data.data);
      } else {
        setVendors([]);
        toast.error("No vendors found for this specialization");
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
      toast.error("Failed to load vendors for the selected specialization");
      setVendors([]);
    }
  };

  const handleSpecializationChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      specialization: selectedOption?.value || "",
      vendorId: "", // Reset vendor when specialization changes
    }));

    if (selectedOption) {
      fetchVendorsBySpecialization(selectedOption.label);
    } else {
      setVendors([]);
    }
  };
  const handleSubmit = async () => {
    const albumBasePhotos = getAlbumBasePhotos();

    if (
      !formData.photosToSelect ||
      !formData.specialization ||
      !formData.vendorId
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const photosToSelect = parseInt(formData.photosToSelect, 10);
    if (photosToSelect > albumBasePhotos) {
      toast.error(
        `Cannot select more than ${albumBasePhotos} photos (album capacity)`
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        quotationId,
        albumId: album._id,
        templateLabel: album?.snapshot?.templateLabel || "",
        baseSheets: album?.snapshot?.baseSheets || 0,
        basePhotos: album?.snapshot?.basePhotos || 0,
        vendorId: formData.vendorId,
        vendorName:
          vendors.find((v) => v._id === formData.vendorId)?.name || "",
        taskDescription: formData.taskDescription,
        assignedDate: formData.assignedDate,
        photosToSelect: photosToSelect,
      };

      const response = await axios.post(
        `${API_URL}/album-photoselection-task/create`,
        payload
      );

      if (response.data?.success) {
        toast.success(response.data.message || "Task assigned");
        onClose();

        // reset
        setFormData({
          photosToSelect: "",
          specialization: "",
          vendorId: "",
          taskDescription: "",
          assignedDate: dayjs().format("YYYY-MM-DD"),
        });

        // Inform parent so it can refetch the task for this album
        if (typeof onAssigned === "function") {
          onAssigned(response.data.task);
        }
      }
    } catch (err) {
      console.error("Error assigning photo selection task:", err);
      toast.error(
        err?.response?.data?.message || "Failed to assign photo selection task"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Assign Photo Selection Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="mb-3">
          <strong>Album:</strong> {album?.snapshot?.templateLabel}
          <br />
        </Alert>

        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Number of Photos to Select *</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={Math.min(getAlbumBasePhotos(), totalSortedPhotos)}
                  value={formData.photosToSelect}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      photosToSelect: e.target.value,
                    }))
                  }
                  placeholder={`Max: ${Math.min(
                    getAlbumBasePhotos(),
                    totalSortedPhotos
                  )}`}
                />
                <Form.Text className="text-muted">
                  Maximum{" "}
                  {Math.min(
                    getAlbumBasePhotos(),
                    totalSortedPhotos
                  ).toLocaleString()}{" "}
                  photos can be selected
                  <br />• Album capacity:{" "}
                  {getAlbumBasePhotos().toLocaleString()} photos
                  <br />• Available photos: {totalSortedPhotos.toLocaleString()}{" "}
                  photos
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Task Assigned Date *</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.assignedDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assignedDate: e.target.value,
                    }))
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Specialization *</Form.Label>
                <Select
                  options={specializationOptions}
                  value={specializationOptions.find(
                    (opt) => opt.value === formData.specialization
                  )}
                  onChange={handleSpecializationChange}
                  placeholder="Select specialization..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Assign Vendor *</Form.Label>
                <Select
                  options={vendors.map((vendor) => ({
                    value: vendor._id,
                    label: vendor.name,
                  }))}
                  value={vendors
                    .map((v) => ({ value: v._id, label: v.name }))
                    .find((opt) => opt.value === formData.vendorId)}
                  onChange={(selectedOption) =>
                    setFormData((prev) => ({
                      ...prev,
                      vendorId: selectedOption?.value || "",
                    }))
                  }
                  placeholder="Select vendor..."
                  isDisabled={!formData.specialization}
                />
                {!formData.specialization && (
                  <Form.Text className="text-muted">
                    Please select specialization first
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Task Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.taskDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taskDescription: e.target.value,
                    }))
                  }
                  placeholder="Enter task instructions, special requirements, etc."
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Assigning..." : "Assign Task"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PhotoSelectionModal;
