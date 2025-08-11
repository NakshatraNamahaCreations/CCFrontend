// import React, { useEffect } from 'react';
// import { Button, Form } from "react-bootstrap";
// import { useDispatch, useSelector } from 'react-redux';
// import { setFormData, selectFormData, selectLeadsList, editLead } from '../../store/slices/leadsSlice.js';
// import { useNavigate, useParams } from 'react-router-dom';

// const EditleadsDetails = () => {
//     const { id } = useParams();
//     const dispatch = useDispatch();
//     const formData = useSelector(selectFormData);
//     const navigate = useNavigate();
//     const leadsList = useSelector(selectLeadsList);
//     const lead = leadsList.find(lead => lead.id === id);

//     useEffect(() => {
//         if (lead) {
//             dispatch(setFormData(lead));
//         }
//     }, [lead, dispatch]);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         dispatch(setFormData({ [name]: value }));
//     };

//     // Handle form submit
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         dispatch(editLead({ id, updatedData: formData }));
//         navigate(`/customer/leadsDetails/${id}`);
//     };

//     return (
//         <div className="container py-2 rounded" style={{ background: "#F4F4F4" }}>
//             <div className="p-5">
//                 <Form onSubmit={handleSubmit}>
//                     <div className="row justify-content-start">
//                         {/* Name & Phone */}
//                         <div className="col-md-5 mb-3">
//                             <Form.Group>
//                                 <Form.Label className="fw-semibold">Name</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="name"
//                                     value={formData.name}
//                                     onChange={handleInputChange}
//                                     className="shadow-sm"
//                                     required
//                                     style={{ fontSize: "14px" }}
//                                 />
//                             </Form.Group>
//                         </div>
//                         <div className="col-md-5 mb-3">
//                             <Form.Group>
//                                 <Form.Label className="fw-semibold">Phone no</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="phone"
//                                     value={formData.phone}
//                                     onChange={handleInputChange}
//                                     className="shadow-sm"
//                                     required
//                                     style={{ fontSize: "14px" }}
//                                 />
//                             </Form.Group>
//                         </div>
//                         <div className="col-md-5 mb-3">
//                             <Form.Group>
//                                 <Form.Label className="fw-semibold">Whatsapp no</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="whatsapp"
//                                     value={formData.whatsapp}
//                                     onChange={handleInputChange}
//                                     className="shadow-sm"
//                                     required
//                                     style={{ fontSize: "14px" }}
//                                 />
//                             </Form.Group>
//                         </div>
//                         <div className="col-md-5 mb-3">
//                             <Form.Group>
//                                 <Form.Label className="fw-semibold">Email</Form.Label>
//                                 <Form.Control
//                                     type="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleInputChange}
//                                     className="shadow-sm"
//                                     required
//                                     style={{ fontSize: "14px" }}
//                                 />
//                             </Form.Group>
//                         </div>
//                         <div className="col-md-5 mb-3">
//                             <Form.Group>
//                                 <Form.Label className="fw-semibold">Today's Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="creationDate"
//                                     value={formData.creationDate}
//                                     onChange={handleInputChange}
//                                     className="shadow-sm"
//                                     required
//                                     style={{ fontSize: "14px" }}
//                                 />
//                             </Form.Group>
//                         </div>

//                         <div className="col-md-5 mb-3">
//                             <Form.Group>
//                                 <Form.Label className="fw-semibold">Venue Address</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="addressLine1"
//                                     value={formData.addressLine1}
//                                     onChange={handleInputChange}
//                                     className="shadow-sm"
//                                     required
//                                     style={{ fontSize: "14px" }}
//                                 />
//                             </Form.Group>
//                         </div>

//                         {/* Venue */}
//                         <div className="col-md-5 mb-3">
//                             <Form.Group>
//                                 <Form.Label className="fw-semibold">Venue</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="venue"
//                                     value={formData.venue}
//                                     onChange={handleInputChange}
//                                     className="shadow-sm"
//                                     required
//                                     style={{ fontSize: "14px" }}
//                                 />
//                             </Form.Group>
//                         </div>

//                         {/* Category & Start Date */}
//                         <div className="col-md-5 mb-3">
//                             <Form.Group>
//                                 <Form.Label className="fw-semibold">Type of Category</Form.Label>
//                                 <Form.Control
//                                     as="select"
//                                     name="category"
//                                     value={formData.category}
//                                     onChange={handleInputChange}
//                                     className="custom-dropdown"
//                                     required
//                                     style={{ fontSize: "14px" }}
//                                 >
//                                     <option value="Engagement">Engagement</option>
//                                     <option value="Haldi">Haldi</option>
//                                     <option value="Receiving Rituals">Receiving Rituals</option>
//                                     <option value="Muhurtham">Muhurtham</option>
//                                     <option value="Reception">Reception</option>
//                                     <option value="Late Nights Rituals">Late Nights Rituals</option>
//                                     <option value="Baegara Oota">Baegara Oota</option>
//                                     <option value="Prewedding">Prewedding</option>
//                                     <option value="Albums">Albums</option>
//                                 </Form.Control>
//                             </Form.Group>
//                         </div>

//                         <div className="col-md-5 mb-3">
//                             <Form.Group>
//                                 <Form.Label className="fw-semibold">Event Start Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="eventStartDate"
//                                     value={formData.eventStartDate}
//                                     onChange={handleInputChange}
//                                     className="shadow-sm"
//                                     required
//                                     style={{ fontSize: "14px" }}
//                                 />
//                             </Form.Group>
//                         </div>

//                         {/* End Date */}
//                         <div className="col-md-5 mb-3">
//                             <Form.Group>
//                                 <Form.Label className="fw-semibold">Event End Date</Form.Label>
//                                 <Form.Control
//                                     type="date"
//                                     name="eventEndDate"
//                                     value={formData.eventEndDate}
//                                     onChange={handleInputChange}
//                                     className="shadow-sm"
//                                     required
//                                     style={{ fontSize: "14px" }}
//                                 />
//                             </Form.Group>
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="mt-2">
//                         <Button variant="dark" type="submit">
//                             Submit
//                         </Button>
//                     </div>
//                 </Form>
//             </div>
//         </div>
//     );
// };

// export default EditleadsDetails;
import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col, Modal } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-hot-toast";

const EditleadsDetails = () => {
  const { leadId, queryId } = useParams();
  const navigate = useNavigate();

  const [persons, setPersons] = useState([]);
  const [existingEvents, setExistingEvents] = useState([]);
  const [newPersons, setNewPersons] = useState([]);
  const [newEvents, setNewEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/lead/lead-query-details/${leadId}/${queryId}`
        );
        setPersons(res.data.lead.persons || []);
        setExistingEvents(res.data.lead.queryDetails?.eventDetails || []);
      } catch (err) {
        toast.error("Failed to fetch lead/query details");
        console.error(err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/category/all");
        setCategories(res.data.data || []);
      } catch {
        toast.error("Failed to fetch categories");
      }
    };

    fetchDetails();
    fetchCategories();
  }, [leadId, queryId]);

  const handleNewPersonChange = (i, e) => {
    const { name, value } = e.target;
    const updated = [...newPersons];
    updated[i][name] = value;
    setNewPersons(updated);
  };

  const handleExistingEventChange = (i, field, value) => {
    const updated = [...existingEvents];
    updated[i][field] = value;
    setExistingEvents(updated);
  };

  const handleNewEventChange = (i, field, value) => {
    const updated = [...newEvents];
    updated[i][field] = value;
    setNewEvents(updated);
  };

  const addNewPerson = () => {
    setNewPersons([
      ...newPersons,
      { name: "", phoneNo: "", whatsappNo: "", email: "", profession: "" },
    ]);
  };

  const addNewEvent = () => {
    setNewEvents([
      ...newEvents,
      { category: "", eventStartDate: "", eventEndDate: "" },
    ]);
  };

  const deleteNewEvent = (index) => {
    const updated = [...newEvents];
    updated.splice(index, 1);
    setNewEvents(updated);
  };

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.name,
  }));

  const validateInputs = () => {
    for (const p of newPersons) {
      if (p.phoneNo && !/^[0-9]{10}$/.test(p.phoneNo)) {
        toast.error("Phone number must be 10 digits");
        return false;
      }
      if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
        toast.error("Invalid email format");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    try {
      await axios.put(
        `http://localhost:5000/api/lead/${leadId}/update-query/${queryId}`,
        {
          newPersons,
          updatedEventDetails: existingEvents,
          newEventDetails: newEvents,
        }
      );
      toast.success("Details updated successfully");
      navigate("/customer");
    } catch (err) {
      toast.error("Update failed");
      console.error(err);
    }
  };

  return (
    <div className="container py-4">
      <Form onSubmit={handleSubmit}>
        <h5 className="fw-bold mb-3">Existing Person(s)</h5>
        {persons.map((p, i) => (
          <Row className="mb-2" key={i}>
            <Col md={2}><Form.Control value={p.name} disabled /></Col>
            <Col md={2}><Form.Control value={p.phoneNo} disabled /></Col>
            <Col md={2}><Form.Control value={p.whatsappNo} disabled /></Col>
            <Col md={3}><Form.Control value={p.email} disabled /></Col>
            <Col md={3}><Form.Control value={p.profession} disabled /></Col>
          </Row>
        ))}

        <h5 className="fw-bold mt-4">Add New Person(s)</h5>
        {newPersons.map((p, i) => (
          <Row className="mb-2" key={i}>
            <Col md={2}><Form.Control name="name" placeholder="Name" value={p.name} onChange={(e) => handleNewPersonChange(i, e)} /></Col>
            <Col md={2}><Form.Control name="phoneNo" placeholder="10-digit phone" value={p.phoneNo} onChange={(e) => handleNewPersonChange(i, e)} /></Col>
            <Col md={2}><Form.Control name="whatsappNo" placeholder="WhatsApp No" value={p.whatsappNo} onChange={(e) => handleNewPersonChange(i, e)} /></Col>
            <Col md={3}><Form.Control name="email" placeholder="Email" value={p.email} onChange={(e) => handleNewPersonChange(i, e)} /></Col>
            <Col md={3}><Form.Control name="profession" placeholder="Profession" value={p.profession} onChange={(e) => handleNewPersonChange(i, e)} /></Col>
          </Row>
        ))}
        <Button size="sm" variant="secondary" onClick={addNewPerson}>+ Add Person</Button>

        <hr className="my-4" />

        <h5 className="fw-bold mb-3">Edit Existing Event(s)</h5>
        {existingEvents.length === 0 ? (
          <p className="text-muted">No existing events found.</p>
        ) : (
          existingEvents.map((e, i) => (
            <Row key={e._id || i} className="mb-2 align-items-end">
              <Col md={3}><Form.Control value={e.category} disabled /></Col>
              <Col md={3}><Form.Control type="date" value={e.eventStartDate ? e.eventStartDate.slice(0, 10) : ""} onChange={(ev) => handleExistingEventChange(i, "eventStartDate", ev.target.value)} /></Col>
              <Col md={3}><Form.Control type="date" value={e.eventEndDate ? e.eventEndDate.slice(0, 10) : ""} onChange={(ev) => handleExistingEventChange(i, "eventEndDate", ev.target.value)} /></Col>
            </Row>
          ))
        )}

        <h5 className="fw-bold mt-4">Add New Event(s)</h5>
        {newEvents.map((e, i) => (
          <Row key={i} className="mb-2 align-items-end">
            <Col md={3}>
              <Select
                options={categoryOptions}
                placeholder="Select category"
                value={categoryOptions.find((opt) => opt.value === e.category) || null}
                onChange={(opt) => handleNewEventChange(i, "category", opt?.value || "")}
              />
            </Col>
            <Col md={3}><Form.Control type="date" value={e.eventStartDate} onChange={(ev) => handleNewEventChange(i, "eventStartDate", ev.target.value)} /></Col>
            <Col md={3}><Form.Control type="date" value={e.eventEndDate} onChange={(ev) => handleNewEventChange(i, "eventEndDate", ev.target.value)} /></Col>
            <Col md={3}><Button variant="outline-danger" size="sm" onClick={() => deleteNewEvent(i)}>Delete</Button></Col>
          </Row>
        ))}
        <Button size="sm" variant="secondary" onClick={addNewEvent}>+ Add Event</Button>

        <div className="text-end mt-4">
          <Button variant="dark" type="submit">Save Changes</Button>
        </div>
      </Form>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton><Modal.Title>Confirm Update</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to save the updated details?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="dark" onClick={confirmSubmit}>Yes, Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditleadsDetails;
