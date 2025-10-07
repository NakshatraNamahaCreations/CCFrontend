import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Container, Row, Col, Card, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import { API_URL } from '../../utils/api';

const PaymentFollowUpsByDate = () => {
    const { date } = useParams();
    const navigate = useNavigate();
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFollowUp, setSelectedFollowUp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState('Pending');
    const [notes, setNotes] = useState('');
    const [contactedBy, setContactedBy] = useState('');
    const [validationErrors, setValidationErrors] = useState({
        notes: false,
        contactedBy: false
    });
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        const fetchFollowUps = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_URL}/follow-up/date/${date}`);
                if (response.data?.success) {
                    setFollowUps(response.data.data || []);
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch follow-ups');
            } finally {
                setLoading(false);
            }
        };

        fetchFollowUps();
    }, [date]);

    const handleViewDetails = (followUp) => {
        setSelectedFollowUp(followUp);
        const latestStatus = followUp.followUpHistory?.length > 0
            ? followUp.followUpHistory[followUp.followUpHistory.length - 1].status
            : 'Pending';
        setStatus(latestStatus);
        setNotes('');
        setContactedBy('');
        setValidationErrors({ notes: false, contactedBy: false });
        setApiError(null);
        setShowModal(true);
    };

    const validateForm = () => {
        const errors = {
            notes: status !== 'Pending' && !notes.trim(),
            contactedBy: status !== 'Pending' && !contactedBy.trim()
        };
        setValidationErrors(errors);
        return !Object.values(errors).some(Boolean);
    };

    const handleStatusUpdate = async () => {
        if (!validateForm()) {
            return;
            
        }

        console.log("selcted", selectedFollowUp)

        try {
            setApiError(null);
            const response = await axios.put(
                `${API_URL}/follow-up/${selectedFollowUp.quotationId}/status`,
                {
                    status,
                    notes: notes.trim(),
                    contactedBy: contactedBy.trim()
                }
            );

            if (response.data.success) {
                const updatedFollowUps = followUps.map(f =>
                    f.quotationId === selectedFollowUp.quotationId
                        ? {
                            ...f,
                            followUpHistory: [
                                ...(f.followUpHistory || []),
                                {
                                    status,
                                    notes: notes.trim(),
                                    contactedBy: contactedBy.trim(),
                                    date: new Date().toISOString()
                                }
                            ]
                        }
                        : f
                );

                setFollowUps(updatedFollowUps);
                setShowModal(false);
            }
        } catch (error) {
            console.error('Error updating follow-up status:', error);
            setApiError(error.response?.data?.message || 'Failed to update follow-up status');
        }
    };

    if (loading) return <div className="text-center my-5">Loading follow-ups...</div>;
    if (error) return <Alert variant="danger" className="m-3">Error: {error}</Alert>;

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5>Follow-Ups for {moment(date).format('MMMM D, YYYY')}</h5>
                <Button variant="secondary" onClick={() => navigate('/follow-ups/calendar')}>
                    Back to Calendar
                </Button>
            </div>

            {followUps.length === 0 ? (
                <Alert variant="info">No follow-ups found for this date.</Alert>
            ) : (
                <Row>
                    {followUps.map(followUp => (
                        <Col md={6} lg={4} key={followUp._id} className="mb-3" style={{fontSize:"12px"}}>
                            <Card className="h-100">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="d-flex justify-content-between align-items-start">
                                        <div style={{fontSize:"14px"}}>
                                          <span style={{fontWeight:"bold"}}>  {followUp.quoteId} - {followUp.leadName}</span>
                                            {followUp.isOverdue && (
                                                <Badge bg="danger" className="ms-2 py-1">Overdue</Badge>
                                            )}
                                        </div>
                                    </Card.Title>
                                    <Card.Text className="mb-2">
                                        <strong>Event:</strong> {followUp.eventType} on {moment(followUp.eventDate).format('MMM D')}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Pending:</strong> ₹{followUp.firstInstallment?.pendingAmount?.toLocaleString() || '0'}
                                    </Card.Text>
                                    <div className="mt-auto">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleViewDetails(followUp)}
                                            className="w-100"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Follow-up Details: {selectedFollowUp?.leadName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFollowUp && (
                        <>
                            {apiError && <Alert variant="danger">{apiError}</Alert>}
                            
                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="mb-2"><strong>Quotation ID:</strong> {selectedFollowUp.quoteId}</div>
                                    <div className="mb-2"><strong>Phone:</strong> {selectedFollowUp.clientPhone || 'N/A'}</div>
                                    <div className="mb-2"><strong>Event Type:</strong> {selectedFollowUp.eventType}</div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-2"><strong>Event Date:</strong> {moment(selectedFollowUp.eventDate).format('MMMM D, YYYY')}</div>
                                    <div className="mb-2"><strong>Total Amount:</strong> ₹{selectedFollowUp.totalAmount?.toLocaleString() || '0'}</div>
                                    <div className="mb-2"><strong>Pending Amount:</strong> ₹{selectedFollowUp.firstInstallment?.pendingAmount?.toLocaleString() || '0'}</div>
                                </Col>
                            </Row>

                            <hr />

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Follow-up Status</Form.Label>
                                        <Form.Select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Contacted">Contacted</option>
                                            <option value="Payment Received">Payment Received</option>
                                        </Form.Select>
                                    </Form.Group>

                                    {status !== 'Pending' && (
                                        <Form.Group className="mb-3">
                                            <Form.Label>Contacted By <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={contactedBy}
                                                onChange={(e) => setContactedBy(e.target.value)}
                                                isInvalid={validationErrors.contactedBy}
                                                placeholder="Who made contact?"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please specify who made contact
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    )}
                                </Col>
                                <Col md={6}>
                                    {status !== 'Pending' && (
                                        <Form.Group className="mb-3">
                                            <Form.Label>Notes <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                isInvalid={validationErrors.notes}
                                                placeholder="Details about the follow-up..."
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please add notes about the follow-up
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    )}
                                </Col>
                            </Row>

                            <div className="mt-3">
                                <h5>Follow-up History</h5>
                                {selectedFollowUp.followUpHistory?.length > 0 ? (
                                    <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {selectedFollowUp.followUpHistory.map((history, index) => (
                                            <div key={index} className="mb-2 pb-2 border-bottom">
                                                <div className="d-flex justify-content-between">
                                                    <strong>{history.status}</strong>
                                                    <small>{moment(history.date).format('MMM D, h:mm A')}</small>
                                                </div>
                                                {history.contactedBy && <div>By: {history.contactedBy}</div>}
                                                {history.notes && <div className="text-muted">{history.notes}</div>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted">No follow-up history yet</div>
                                )}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleStatusUpdate}>
                        Update Status
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default PaymentFollowUpsByDate;