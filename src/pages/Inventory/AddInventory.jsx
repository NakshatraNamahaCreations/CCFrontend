import React, { useState } from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import addIcon from "../../assets/icons/addImgicon.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const AddInventory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    equipmentName: "",
    sensor: "",
    image: null,
    category: "",
    model: "",
    quantity: "",
    processor: "",
    videoQuality: "",
    isoRange: "",
    autofocus: "",
  });
  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setFormData((prevState) => ({
        ...prevState,
        image: file,
      }));
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      equipmentName,
      sensor,
      image,
      category,
      model,
      quantity,
      processor,
      videoQuality,
      isoRange,
      autofocus,
    } = formData;

    if (!equipmentName || !category || !model) {
      toast.error("Equipment name, category, and model are required");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("equipmentName", equipmentName);
    formDataToSend.append("sensor", sensor);
    if (image) formDataToSend.append("image", image);
    formDataToSend.append("category", category);
    formDataToSend.append("model", model);
    formDataToSend.append("quantity", quantity);
    formDataToSend.append("processor", processor);
    formDataToSend.append("videoQuality", videoQuality);
    formDataToSend.append("isoRange", isoRange);
    formDataToSend.append("autofocus", autofocus);

    try {
      const response = await axios.post("http://localhost:5000/api/inventory", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Inventory item added successfully");
        navigate("/inventory/inventory-list");
      } else {
        toast.error(response.data.message || "Failed to add inventory item");
      }
    } catch (error) {
      console.error("Error submitting inventory:", error);
      toast.error(error.response?.data?.message || "Failed to add inventory item");
    }
  };

  const handleAddImageClick = () => {
    document.getElementById("imageInput").click();
  };

  const handleDeleteImage = () => {
    setFormData((prevState) => ({
      ...prevState,
      image: null,
    }));
    setPreviewImage(null);
    document.getElementById("imageInput").value = "";
  };

  return (
    <Container className="py-3" style={{ background: "#F4F4F4", borderRadius: "10px" }}>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col className="text-center mb-4">
            {!previewImage ? (
              <div
                className="d-flex flex-column align-items-center justify-content-center"
                onClick={handleAddImageClick}
                style={{ cursor: "pointer" }}
              >
                <img src={addIcon} alt="addIcon" className="mb-2" style={{ width: "100px", height: "100px" }} />
                <p>Add Image</p>
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center">
                <img
                  src={previewImage}
                  alt="Uploaded"
                  className="mb-2"
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                />
                <Button variant="link" onClick={handleDeleteImage}>
                  Delete Image
                </Button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              id="imageInput"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Col>
        </Row>
        <Row className="d-flex mx-4" style={{ fontSize: "14px" }}>
          <Col className="col-md-5">
            <Form.Group className="mb-3" controlId="equipmentName">
              <Form.Label>Equipment Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Equipment Name"
                name="equipmentName"
                value={formData.equipmentName}
                onChange={handleInputChange}
                style={{ fontSize: "12px" }}
              />
            </Form.Group>
          </Col>
          <Col className="col-md-5">
            <Form.Group className="mb-3" controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{ fontSize: "12px" }}
              />
            </Form.Group>
          </Col>
          <Col className="col-md-5">
            <Form.Group className="mb-3" controlId="model">
              <Form.Label>Model</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                style={{ fontSize: "12px" }}
              />
            </Form.Group>
          </Col>
          <Col className="col-md-5">
            <Form.Group className="mb-3" controlId="sensor">
              <Form.Label>Sensor</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Sensor"
                name="sensor"
                value={formData.sensor}
                onChange={handleInputChange}
                style={{ fontSize: "12px" }}
              />
            </Form.Group>
          </Col>
          <Col className="col-md-5">
            <Form.Group className="mb-3" controlId="quantity">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                style={{ fontSize: "12px" }}
              />
            </Form.Group>
          </Col>
          <Col className="col-md-5">
            <Form.Group className="mb-3" controlId="processor">
              <Form.Label>Processor</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Processor"
                name="processor"
                value={formData.processor}
                onChange={handleInputChange}
                style={{ fontSize: "12px" }}
              />
            </Form.Group>
          </Col>
          <Col className="col-md-5">
            <Form.Group className="mb-3" controlId="videoQuality">
              <Form.Label>Video Quality</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Video Quality"
                name="videoQuality"
                value={formData.videoQuality}
                onChange={handleInputChange}
                style={{ fontSize: "12px" }}
              />
            </Form.Group>
          </Col>
          <Col className="col-md-5">
            <Form.Group className="mb-3" controlId="isoRange">
              <Form.Label>ISO Range</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter ISO Range"
                name="isoRange"
                value={formData.isoRange}
                onChange={handleInputChange}
                style={{ fontSize: "12px" }}
              />
            </Form.Group>
          </Col>
          <Col className="col-md-5">
            <Form.Group className="mb-3" controlId="autofocus">
              <Form.Label>Autofocus</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Autofocus"
                name="autofocus"
                value={formData.autofocus}
                onChange={handleInputChange}
                style={{ fontSize: "12px" }}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="text-center my-2">
          <Button
            type="submit"
            className="rounded-1 bg-white text-dark border-0 shadow"
          >
            Submit
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddInventory;