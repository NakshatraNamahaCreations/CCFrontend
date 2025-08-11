import React from "react";
import {   Form,  Table } from "react-bootstrap";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";
import { IoSearch } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";


const maintenanceList = [
    { code: "051478", vendor: "Chandan", date: "06/10/24", checkOutTime: "10:00 AM" },
    { code: "045634", vendor: "Rahul", date: "06/10/24", checkOutTime: "15:00 PM" },
    { code: "042343", vendor: "Raj", date: "06/10/24", checkOutTime: "13:00 PM" },
    { code: "034562", vendor: "Satyam", date: "06/10/24", checkOutTime: "09:00 AM" },
    { code: "065432", vendor: "Sumit", date: "06/10/24", checkOutTime: "10:40 AM" },
    { code: "076543", vendor: "Suraj", date: "06/10/24", checkOutTime: "11:00 AM" },
];

const AssigndInventory = () => {

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
            <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
                <div className="d-flex gap-2 align-items-center w-50">
                    <div className="w-100 bg-white d-flex gap-2 align-items-center px-2 rounded">
                        <IoSearch size={16} className="text-muted" />
                        <Form className="d-flex flex-grow-1">
                            <Form.Group className="w-100">
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Service name"
                                    style={{
                                        paddingLeft: "4px",
                                        border: "none",
                                        outline: "none",
                                        boxShadow: "none",
                                        fontSize: "14px",
                                    }}
                                />
                            </Form.Group>
                        </Form>
                    </div>
                    <img
                        src={sortIcon}
                        alt="sortIcon"
                        style={{ width: "25px", cursor: "pointer" }}
                    />
                    <img
                        src={filterIcon}
                        alt="filterIcon"
                        style={{ width: "25px", cursor: "pointer" }}
                    />
                </div>
            </div>

            <div className="table-responsive bg-white mt-3" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                <Table className="table table-hover align-middle">
                    <thead className="text-white text-center sticky-top">
                        <tr style={{ fontSize: "14px" }}>
                            <th>Sl.No</th>
                            <th>Product Code</th>
                            <th>Vendor</th>
                            <th>Date</th>
                            <th>Check out Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            maintenanceList.map((item, idx) => (
                                <tr key={idx} style={{ fontSize: "12px" }} className="fw-semibold">
                                    <td className="text-center">{String(idx + 1).padStart(2, "0")}</td>
                                    <td className="text-center">{item.code}</td>
                                    <td className="text-center">{item.vendor}</td>
                                    <td className="text-center">{item.date}</td>
                                    <td className="text-center">{item.checkOutTime}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default AssigndInventory;
