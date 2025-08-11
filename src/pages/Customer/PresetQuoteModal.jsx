import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Col, Table } from "react-bootstrap";

const PresetQuoteModal = ({ show, onHide, onApplyPreset }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [presetQuotations, setPresetQuotations] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  // Load all available preset quotations
  useEffect(() => {
    if (show) {
      const savedPresets = JSON.parse(localStorage.getItem('presetQuotations') || '[]');
      setPresetQuotations(savedPresets);
      
      // Reset form when modal opens
      setSelectedCategory("");
      setEventDate("");
      setSelectedSlot("");
      setVenueName("");
      setVenueAddress("");
      setSelectedPreset(null);
    }
  }, [show]);
  
  // When category changes, find and set the matching preset
  useEffect(() => {
    if (selectedCategory) {
      const matchingPreset = presetQuotations.find(p => p.category === selectedCategory);
      setSelectedPreset(matchingPreset || null);
    } else {
      setSelectedPreset(null);
    }
  }, [selectedCategory, presetQuotations]);

  // Get unique categories from saved presets
  const categoryOptions = [...new Set(presetQuotations.map(p => p.category))];
  
  const slotOptions = ["8AM - 1PM", "12PM - 5PM", "7PM - 12PM"];

  const handleApplyPackage = () => {
    if (!selectedPreset) return;
    
    // Create object with venue, date, time details along with the preset
    const presetWithDetails = {
      ...selectedPreset,
      eventDate,
      selectedSlot,
      venueName,
      venueAddress
    };
    
    // Pass the selected preset back to parent component
    onApplyPreset(presetWithDetails);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="text-black" style={{ fontSize: "16px" }}>Apply Preset Package</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {presetQuotations.length === 0 ? (
          <div className="alert alert-info">
            No preset quotations available. Please create presets in the Master section first.
          </div>
        ) : (
          <>
            {/* Category Dropdown */}
            <Form.Group as={Col} md={6} className="mb-3">
              <Form.Label className="fw-semibold">Select Category</Form.Label>
              <Form.Control
                as="select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select</option>
                {categoryOptions.map((category, i) => (
                  <option key={i} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {selectedPreset && (
              <>
                {/* Date & Slot */}
                <div className="d-flex justify-content-between">
                  <Form.Group as={Col} md={5} className="mb-3">
                    <Form.Label className="fw-semibold">Event Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group as={Col} md={5} className="mb-3">
                    <Form.Label className="fw-semibold">Select Slot</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      required
                    >
                      <option value="">Select</option>
                      {slotOptions.map((slot, i) => (
                        <option key={i} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </div>

                {/* Venue Info */}
                <div className="d-flex justify-content-between">
                  <Form.Group as={Col} md={5} className="mb-3">
                    <Form.Label className="fw-semibold">Venue Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="Enter venue name"
                      required
                    />
                  </Form.Group>

                  <Form.Group as={Col} md={5} className="mb-3">
                    <Form.Label className="fw-semibold">Venue Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      placeholder="Enter address"
                      required
                    />
                  </Form.Group>
                </div>

                {/* Services Table */}
                <h5 className="fw-semibold mt-3">Included Services</h5>
                <p className="text-muted small">These services will be added to your quotation.</p>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>SI No</th>
                      <th>Service</th>
                      <th>Price</th>
                      <th>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPreset.services.map((s, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{s.serviceName}</td>
                        <td>₹{s.price.toLocaleString()}</td>
                        <td>{s.quantity || 1}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold">
                      <td colSpan="2" className="text-end">
                        Total
                      </td>
                      <td colSpan="2" className="text-end">
                        ₹{selectedPreset.totalAmount.toLocaleString()}
                        {/* {selectedPreset.discount > 0 && (
                          <span className="text-success"> (Discount: {selectedPreset.discount}%)</span>
                        )} */}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="dark" 
          className="btn-sm" 
          onClick={handleApplyPackage}
          disabled={!selectedPreset || !eventDate || !selectedSlot || !venueName}
        >
          Apply Package
        </Button>
        <Button variant="outline-secondary" className="btn-sm" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PresetQuoteModal;
