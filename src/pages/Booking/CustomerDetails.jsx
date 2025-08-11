import React from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const CustomerDetails = () => {
    const navigate = useNavigate();
    return (
        <div className="container py-2 rounded vh-100" style={{ background: "#F4F4F4" }}>
            <div className="container my-4">
                <Card className='border-0 shadow-sm'>
                    <Card.Body>
                        <Card.Title>Customer Details</Card.Title>
                        <Card.Text className='d-flex m-4' style={{ fontSize: "14px" }}>
                            <div className="row w-50">
                                <div className="col-md-3 fw-semibold">
                                    <p>Enquire ID</p>
                                    <p>Name</p>
                                    <p>Phone no</p>
                                    <p>Email</p>
                                    <p>Date</p>
                                </div>
                                <div className="col-md-9">
                                    <p>125454323</p>
                                    <p>Navya Singh</p>
                                    <p>956775688</p>
                                    <p>demo@gmail.com</p>
                                    <p>15/03/2024</p>
                                </div>
                            </div>
                            <div className="row w-50">
                                <div className="col-md-3 fw-semibold">
                                    <p>Event</p>
                                    <p>Event Start Date</p>
                                    <p>Event End Date</p>
                                    <p>Venue</p>
                                    <p>Venue Address</p>
                                    <p>Whatsapp no</p>
                                </div>
                                <div className="col-md-9">
                                    <p>Marriage</p>
                                    <p>20/03/2025</p>
                                    <p>22/03/2025</p>
                                    <p>Grand Hotel</p>
                                    <p>123 Main Street, City</p>
                                    <p>956775688</p>
                                </div>
                            </div>
                        </Card.Text>
                    </Card.Body>
                </Card>

                <div className="d-flex justify-content-end">
                    <Link to={`/booking`}>
                        <Button variant="dark" style={{ fontSize: '14px' }}>Done</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails; 