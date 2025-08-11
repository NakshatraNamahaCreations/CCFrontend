import React, { useState } from "react";
import { Button, Container, Card, Table, Modal, Form, Col, Dropdown } from "react-bootstrap";
import editIcon from "../../assets/icons/editIcon.png"
import deleteIcon from "../../assets/icons/deleteIcon.png"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


const Packages = () => {
  const [showModal, setShowModal] = useState(false);
  const [packages, setPackages] = useState([
    {
      packageName: "Photography",
      price: "50000",
      installment: "04",
      services: ["Photoshoot"],
    },
    {
      packageName: "Videography",
      price: "80000",
      installment: "04",
      services: ["Photoshoot", "Videography"],
    },
  ]);
  const [newPackage, setNewPackage] = useState({
    packageName: "",
    price: "",
    installment: "Select Option",
    services: [],
  });
  const [serviceRows, setServiceRows] = useState([{ service: "", amount: "" }]);
  const [error, setError] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const handleAddRow = () => {
    setServiceRows([...serviceRows, { service: "", amount: "" }]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...serviceRows];
    updatedRows[index][field] = value;
    setServiceRows(updatedRows);
  };

  // Handle adding a new service
  const handleAddService = () => {
    if (newPackage.packageName && newPackage.price && newPackage.installment) {
      const newPackageData = {
        ...newPackage,
        services: serviceRows.map((row) => row.service),
      };
      setPackages([...packages, newPackageData]);
      setShowModal(false); // Close modal
      resetForm(); // Reset form
    } else {
      setError("Please fill in all fields.");
    }
  };

  // Handle editing a service
  const handleEditService = () => {
    if (newPackage.packageName && newPackage.price && newPackage.installment) {
      const updatedPackages = [...packages];
      updatedPackages[editIndex] = {
        ...newPackage,
        services: serviceRows.map((row) => row.service),
      };
      setPackages(updatedPackages);
      setShowModal(false);
      resetForm();
    } else {
      setError("Please fill in all fields.");
    }
  };

  // Reset form fields
  const resetForm = () => {
    setNewPackage({ packageName: "", price: "", installment: "Select Option", services: [] });
    setServiceRows([{ service: "", amount: "" }]);
    setError("");
    setEditIndex(null); 
  };

  // Open modal in edit mode
  const handleEditClick = (index) => {
    setEditIndex(index);
    const packageToEdit = packages[index];
    setNewPackage({
      packageName: packageToEdit.packageName,
      price: packageToEdit.price,
      installment: packageToEdit.installment,
      services: packageToEdit.services,
    });
    const servicesWithAmount = packageToEdit.services.map((service) => ({
      service,
      amount: "",
    }));
    setServiceRows(servicesWithAmount);
    setShowModal(true);
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Sl.No", "Package Name", "Price", "Installment", "Services", "Created Date"], // Header row
      ...packages.map((pkg, index) => [
        index + 1, 
        pkg.packageName, 
        pkg.price, 
        pkg.installment, 
        pkg.services.join(", "), 
        "23/04/25"
      ]),
    ]);

    ws['!cols'] = [
      { wpx: 50 }, 
      { wpx: 200 }, 
      { wpx: 120 }, 
      { wpx: 100 }, 
      { wpx: 250 },  
      { wpx: 120 },  
    ];

    ws['!rows'] = [
      { hpx: 30 },
      ...packages.map(() => ({ hpx: 20 }))
    ];

    // Apply bold font to the header row
    for (let col = 0; col < 5; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) {
        cell.s = { font: { bold: true } };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Packages");

    // Generate the Excel file and trigger download
    const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelFile]), "packages.xlsx");
  };

  return (
    <Container className="position-relative">
      <div className="d-flex justify-content-end gap-2 mb-3">
        <div className="text-end ">
          <Button
            onClick={() => setShowModal(true)}
            variant="transparent"
            className="fw-bold rounded-1 shadow bg-white"
            style={{ fontSize: "14px" }}
          >
            + Add Packages
          </Button>
        </div>

        <div className="text-end ">
          <Button
            onClick={handleDownloadExcel}
            className="fw-bold rounded-1 shadow bg-white text-dark border-0"
            style={{ fontSize: "14px" }}
          >
            Download Excel
          </Button>
        </div>
      </div>
      <Card className="border-0 p-3">
        <div
          className="table-responsive bg-white"
          style={{ maxHeight: "65vh", overflowY: "auto" }}
        >
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top">
              <tr>
                <th style={{ width: "10%", fontSize: "14px" }} className="text-start">
                  Sl.No
                </th>
                <th style={{ width: "20%", fontSize: "14px" }} className="text-start">
                  Packages
                </th>
                <th style={{ width: "10%", fontSize: "14px" }} className="text-start">
                  Price
                </th>
                <th style={{ width: "10%", fontSize: "14px" }}>
                  Installment
                </th>
                <th style={{ width: "20%", fontSize: "14px" }}>
                  Services
                </th>
                <th style={{ width: "10%", fontSize: "14px" }} className="text-start">
                  Created Date
                </th>
                <th style={{ width: "10%", fontSize: "14px" }} className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg, index) => (
                <tr key={index} className="text-center">
                  <td className="fw-semibold text-start" style={{ fontSize: "12px" }}>
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="fw-semibold text-start" style={{ fontSize: "12px" }}>
                    {pkg.packageName}
                  </td>
                  <td className="text-success text-start fw-semibold" style={{ fontSize: "12px" }}>
                    {pkg.price}
                  </td>
                  <td className=" fw-semibold" style={{ fontSize: "12px" }}>
                    {pkg.installment}
                  </td>
                  <td className=" fw-semibold" style={{ fontSize: "12px" }}>
                    {pkg.services.map((service, idx) => (
                      <p key={idx}>{service},</p>
                    ))}
                  </td>
                  <td className=" text-start fw-semibold" style={{ fontSize: "12px" }}>
                    23/04/25
                  </td>
                  <td className="text-center">
                    <Button variant="outline-gray" size="sm">
                      <img src={deleteIcon} alt="Delete" style={{ width: "20px" }} />
                    </Button>
                    <Button
                      variant="outline-gray"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditClick(index)}
                    >
                      <img src={editIcon} alt="Edit" style={{ width: "20px" }} />
                    </Button>

                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>



      {/* Add/Edit Service Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="text-black" style={{ fontSize: "18px" }}>
            {editIndex !== null ? "Edit Services Category" : "Add Services Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Error message */}
          <p className="text-danger">{error}</p>

          {/* Form for service name and price */}
          <Form className="mb-4 d-flex justify-content-between gap-3">
            <Form.Group as={Col} md={4} className="mb-3">
              <Form.Label className="fw-semibold">Services Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Service name"
                className="shadow-sm"
                value={newPackage.packageName}
                onChange={(e) => setNewPackage({ ...newPackage, packageName: e.target.value })}
                disabled={editIndex !== null}
              />
            </Form.Group>
            <Form.Group as={Col} md={4} className="mb-3">
              <Form.Label className="fw-semibold">Price</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Price"
                className="shadow-sm"
                value={newPackage.price}
                onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                disabled={editIndex !== null}
              />
            </Form.Group>

            {/* Installment Dropdown */}
            <Form.Group as={Col} md={3} className="mb-3">
              <Form.Label className="fw-semibold">Installment</Form.Label>
              <Form.Control
                as="select"
                value={newPackage.installment}
                onChange={(e) => setNewPackage({ ...newPackage, installment: e.target.value })}
              >
                <option >Select Option</option>
                <option value="01">01</option>
                <option value="02">02</option>
                <option value="03">03</option>
                <option value="04">04</option>
              </Form.Control>
            </Form.Group>
          </Form>

          {/* Table for services */}
          <div className="mt-3 flex-grow-1">
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>SI.No</th>
                  <th>Service</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {serviceRows.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <Form.Control
                        type="text"
                        value={row.service}
                        onChange={(e) => handleInputChange(index, "service", e.target.value)}
                        placeholder="Enter service"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={row.amount}
                        onChange={(e) => handleInputChange(index, "amount", e.target.value)}
                        placeholder="Enter amount"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button variant="outline-success" size="sm" onClick={handleAddRow} className="mt-2">
              Add Row
            </Button>
          </div>
        </Modal.Body>

        {/* Modal Footer with Action Buttons */}
        <Modal.Footer>
          <Button
            variant="dark"
            className="rounded-1"
            style={{ borderColor: "black", background: "black" }}
            onClick={editIndex !== null ? handleEditService : handleAddService}
          >
            {editIndex !== null ? "Save Changes" : "Add"}
          </Button>
          <Button variant="outline-secondary" className="rounded-1" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Packages;


