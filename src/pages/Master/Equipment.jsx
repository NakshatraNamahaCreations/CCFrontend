import React, { useState } from "react";
import { Modal, Button, Form, Card, Table, Container } from "react-bootstrap";
import editIcon from "../../assets/icons/editIcon.png"
import deleteIcon from "../../assets/icons/deleteIcon.png"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Equipments = () => {
    const [showModal, setShowModal] = useState(false);
    const [category, setCategory] = useState([
        { categoryName: "Photography", price: "50000" },
        { categoryName: "Videography", price: "80000" },
    ]);
    const [newCategory, setNewCategory] = useState({
        categoryName: "",
        price: "",
    });
    const [error, setError] = useState("");


    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCategory((prevCat) => ({
            ...prevCat,
            [name]: value,
        }));
    };


    const handleAddCat = () => {
        if (newCategory.categoryName && newCategory.price) {
            setCategory([...category, newCategory]);
            setShowModal(false);
            setNewCategory({ categoryName: "", price: "" });
        } else {
            setError("Please fill the category fields before adding.");
        }
    };

    // Download Excel function
    const handleDownloadExcel = () => {
        const ws = XLSX.utils.aoa_to_sheet([
            ["Sl.No", "Equipment Category", "Price"], // Header row
            ...category.map((cat, index) => [
                index + 1, // Sl.No
                cat.categoryName, // Equipment Category
                cat.price, // Price
            ]),
        ]);

        ws['!cols'] = [
            { wpx: 50 }, // Sl.No column width
            { wpx: 200 }, // Equipment Category column width
            { wpx: 120 }, // Price column width
        ];

        ws['!rows'] = [
            { hpx: 30 }, // Header row height
            ...category.map(() => ({ hpx: 20 })) // Adjust row heights for categories
        ];

        // Apply bold font to the header row
        for (let col = 0; col < 3; col++) {
            const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
            if (cell) {
                cell.s = { font: { bold: true } };
            }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Equipments");

        // Generate the Excel file and trigger download
        const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelFile]), "equipments.xlsx");
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
                        + Add Equipment Category
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
                <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                    <Table className="table table-hover align-middle">
                        <thead className="text-white text-center sticky-top">
                            <tr>
                                <th style={{ width: "10%", fontSize: "14px" }} className="text-start">Sl.No</th>
                                <th style={{ width: "40%", fontSize: "14px" }} className="text-start">Equipment Category</th>
                                <th style={{ width: "25%", fontSize: "14px" }} className="text-start">Price</th>
                                <th style={{ width: "15%", fontSize: "14px" }} className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {category.map((cat, index) => (
                                <tr key={index} className="text-center">
                                    <td className="fw-semibold text-start" style={{ fontSize: "12px" }}>{String(index + 1).padStart(2, "0")}</td>
                                    <td className="fw-semibold text-start" style={{ fontSize: "12px" }}>{cat.categoryName}</td>
                                    <td className="text-success text-start fw-semibold" style={{ fontSize: "12px" }}>{cat.price}</td>
                                    <td className="">
                                        <Button variant="outline-gray" size="sm" className="me-2">
                                            <img src={deleteIcon} alt="Delete" style={{ width: "20px" }} />
                                        </Button>
                                        <Button variant="outline-gray" size="sm">
                                            <img src={editIcon} alt="Edit" style={{ width: "20px" }} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* Add Service Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-black" style={{ fontSize: '18px' }}>Add Equipment Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-danger">{error}</p>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Equipment Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Service name"
                                value={newCategory.categoryName}
                                onChange={handleChange}
                                className="shadow-sm"
                                name="categoryName"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Price</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Price"
                                value={newCategory.price}
                                onChange={handleChange}
                                className="shadow-sm"
                                name="price"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" className="rounded-1" onClick={handleAddCat} style={{ borderColor: "black", background: "black" }}>
                        Add
                    </Button>
                    <Button variant="outline-secondary" className="rounded-1" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Equipments;
