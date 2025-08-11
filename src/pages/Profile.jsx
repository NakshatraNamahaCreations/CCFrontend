import React, { useState, useEffect } from "react";
import { Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import addIcon from "../assets/icons/addImgicon.png";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profileImage: null,
    name: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
  });

  // Load user data from localStorage when component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setFormData({
        profileImage: userData.profileImage || null,
        name: userData.name || "",
        username: userData.username || "",
        email: userData.email || "",
        mobile: userData.phonenumber || "",
        password: userData.password || "",
      });
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle file change (image selection)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prevState) => ({
        ...prevState,
        profileImage: reader.result,
      }));
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Handle add image click
  const handleAddImageClick = () => {
    document.getElementById("imageInput").click();
  };

  // Handle delete image and reset input
  const handleDeleteImage = () => {
    setFormData((prevState) => ({
      ...prevState,
      profileImage: null,
    }));
    document.getElementById("imageInput").value = "";
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);

    const { profileImage, name, username, email, mobile, password } = formData;

    if (!profileImage || !name || !username || !email || !mobile || !password) {
      alert("Please fill in all the fields.");
      return;
    }

    // Update localStorage with new form data
    localStorage.setItem("user", JSON.stringify(formData));
    alert("Profile updated successfully!");
    navigate("/dashboard");
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="mb-5">
              <Col className="text-center">
                <div className="position-relative d-inline-block">
                  {!formData.profileImage ? (
                    <div
                      className="d-flex flex-column align-items-center justify-content-center"
                      onClick={handleAddImageClick}
                      style={{
                        cursor: "pointer",
                        width: "150px",
                        height: "150px",
                        border: "2px dashed #dee2e6",
                        borderRadius: "50%",
                        padding: "20px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <img
                        src={addIcon}
                        alt="addIcon"
                        style={{ width: "50px", height: "50px" }}
                      />
                      <p className="mt-2 mb-0 text-muted">Add Photo</p>
                    </div>
                  ) : (
                    <div className="position-relative">
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "3px solid #fff",
                          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Button
                        variant="light"
                        size="sm"
                        className="position-absolute bottom-0 end-0 rounded-circle p-2"
                        onClick={handleDeleteImage}
                        style={{
                          width: "35px",
                          height: "35px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fas fa-times"></i>
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
                </div>
              </Col>
            </Row>

            {/* Form Fields */}
            <Row className="g-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="py-2"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Choose a username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="py-2"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="py-2"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Mobile Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter mobile number"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="py-2"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="py-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Action Buttons */}
            <Row className="mt-4">
              <Col className="text-center">
                <Button type="submit" className="px-5 py-2" variant="dark">
                  Save Changes
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;