import React from "react";
import { Modal, Button, Form, Row, Col, Table } from "react-bootstrap";

const CustomPackageModal = ({
  show,
  onHide,
  modalMode,
  selectedCategory,
  eventDate,
  eventEndDate,
  selectedSlot,
  venueName,
  venueAddress,
  services,
  categoriesList,
  onCategoryChange,
  onEventDateChange,
  onEventEndDateChange,
  onSlotChange,
  onVenueNameChange,
  onVenueAddressChange,
  onPriceChange,
  onQtyChange,
  onSelectAllServices,
  onDeselectAllServices,
  onSave,
  loading,
  slotOptions = [
    "Morning (8AM - 1PM)",
    "Afternoon (12PM - 5PM)",
    "Evening (5PM - 9PM)",
    "Midnight (9PM - 12AM)"
  ],
  onCheckboxChange
}) => (
  <Modal show={show} onHide={onHide} centered size="lg">
    <Modal.Header closeButton>
      <Modal.Title className="text-black" style={{ fontSize: "16px" }}>
        {modalMode === "edit" ? `Edit Package` : "Create New Package"}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body className="d-flex flex-column" style={{ maxHeight: "70vh", overflowY: "auto" }}>
      <Form>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={selectedCategory}
                onChange={e => onCategoryChange(e.target.value)}
              >
                <option value="">Select Category</option>
                {categoriesList && categoriesList.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Slot</Form.Label>
              <Form.Select
                value={selectedSlot}
                onChange={e => onSlotChange(e.target.value)}
              >
                <option value="">Select Slot</option>
                {slotOptions.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Event Start Date</Form.Label>
              <Form.Control
                type="date"
                value={eventDate}
                onChange={e => onEventDateChange(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Event End Date</Form.Label>
              <Form.Control
                type="date"
                value={eventEndDate}
                onChange={e => onEventEndDateChange(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
        
          <Col md={6}>
            <Form.Group>
              <Form.Label>Venue Name</Form.Label>
              <Form.Control
                type="text"
                value={venueName}
                onChange={e => onVenueNameChange(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Venue Address</Form.Label>
              <Form.Control
                type="text"
                value={venueAddress}
                onChange={e => onVenueAddressChange(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
   
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Services</Form.Label>
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={services && services.length > 0 && services.every(s => s.checked)}
                        indeterminate={services && services.some(s => s.checked) && !services.every(s => s.checked)}
                        onChange={e => {
                          const checked = e.target.checked;
                          services.forEach(s => onCheckboxChange(s.id, checked));
                        }}
                      />
                    </th>
                    <th>SI.No</th>
                    <th>Service Name</th>
                    <th>Price</th>
                    <th>Margin Price</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {services && services.length > 0 ? services.map((service, idx) => (
                    <tr key={service.id || idx}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={!!service.checked}
                          onChange={() => onCheckboxChange(service.id)}
                        />
                      </td>
                      <td>{idx + 1}</td>
                      <td>{service.serviceName || service.name}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={service.price}
                          onChange={e => onPriceChange(service.id, e.target.value)}
                          min={0}
                          disabled={!service.checked}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={service.marginPrice}
                          onChange={e => onPriceChange(service.id, e.target.value, 'marginPrice')}
                          min={0}
                          disabled={!service.checked}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={service.qty}
                          onChange={e => onQtyChange(service.id, e.target.value)}
                          min={1}
                          disabled={!service.checked}
                        />
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="text-center">No services available</td></tr>
                  )}
                  {/* Totals row */}
                  {services && services.length > 0 && (
                    <tr style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
                      <td colSpan={3} className="text-end">Total</td>
                      <td>
                        {services.filter(s => s.checked).reduce((sum, s) => sum + ((parseFloat(s.price) || 0) * (parseInt(s.qty) || 0)), 0)}
                      </td>
                      <td>
                        {services.filter(s => s.checked).reduce((sum, s) => sum + ((parseFloat(s.marginPrice) || 0) * (parseInt(s.qty) || 0)), 0)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button
        variant="dark"
        className="rounded-1"
        style={{ borderColor: "black", background: "black" }}
        onClick={onSave}
        disabled={loading}
      >
        {modalMode === "edit" ? "Update Package" : "Create Package"}
      </Button>
      <Button
        variant="outline-secondary"
        className="rounded-1"
        onClick={onHide}
        disabled={loading}
      >
        Cancel
      </Button>
    </Modal.Footer>
  </Modal>
);

export default CustomPackageModal; 