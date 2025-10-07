

// import React, { useState, useEffect } from 'react';
// import { Calendar, dayjsLocalizer } from 'react-big-calendar';
// import dayjs from 'dayjs';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import { Button, Modal, Form, Row, Col, Container } from 'react-bootstrap';
// import Select from 'react-select';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { API_URL } from '../../utils/api';

// const localizer = dayjsLocalizer(dayjs);

// const DailyTaskCalendar = () => {
//     const navigate = useNavigate();
//     const [vendors, setVendors] = useState([]);
//     const [tasks, setTasks] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [events, setEvents] = useState([]);
//     const [taskCounts, setTaskCounts] = useState({});

//     const staticRoles = ['Photographer', 'Videographer', 'Caterer', 'Decorator', 'DJ', 'Coordinator'];

//     const [showModal, setShowModal] = useState(false);
//     const [selectedDate, setSelectedDate] = useState(null);
//     const [formData, setFormData] = useState({
//         vendorId: '',
//         vendorName: '',
//         role: '',
//         task: '',
//         taskDate: dayjs().format('YYYY-MM-DD') // Default to today's date
//     });

//     // Fetch vendors and tasks from API
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 // Fetch vendors
//                 const vendorsResponse = await axios.get(`${API_URL}/vendors/`);
//                 if (vendorsResponse.data?.success) {
//                     setVendors(vendorsResponse.data.vendors || []);
//                 }

//                 // Fetch tasks
//                 const tasksResponse = await axios.get(`${API_URL}/daily-tasks/`);
//                 if (tasksResponse.data?.success) {
//                     const fetchedTasks = tasksResponse.data.data || [];
//                     setTasks(fetchedTasks);

//                     // Calculate task counts per date using taskDate field
//                     const counts = {};
//                     fetchedTasks.forEach(task => {
//                         const date = dayjs(task.taskDate || task.createdAt).format('YYYY-MM-DD');
//                         counts[date] = (counts[date] || 0) + 1;
//                     });
//                     setTaskCounts(counts);

//                     setEvents(
//                         Object.entries(counts).map(([date, count]) => ({
//                             title: `${count} ${count === 1 ? 'Task' : 'Tasks'}`,
//                             start: new Date(date),
//                             end: new Date(date),
//                             resource: { date },
//                         }))
//                     );
//                 }
//             } catch (err) {
//                 setError(err.message || 'Failed to fetch data');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, []);

//     const handleSelectSlot = (slotInfo) => {
//         const formattedDate = dayjs(slotInfo.start).format('DD-MM-YYYY');
//         navigate(`/daily-task/list?date=${formattedDate}`);
//     };

//     const handleSelectEvent = (event) => {
//         const formattedDate = dayjs(event.start).format('DD-MM-YYYY');
//         navigate(`/daily-task/list?date=${formattedDate}`);
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleVendorChange = (selectedOption) => {
//         setFormData(prev => ({
//             ...prev,
//             vendorId: selectedOption.value,
//             vendorName: selectedOption.label
//         }));
//     };

//     const handleRoleChange = (selectedOption) => {
//         setFormData(prev => ({
//             ...prev,
//             role: selectedOption.value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.post(`${API_URL}/daily-tasks/`, formData);
            
//             if (response.data?.success) {
//                 const newTask = response.data.data || response.data.task;
                
//                 if (!newTask) {
//                     throw new Error('Task was created but no task data returned');
//                 }
                
//                 // Use taskDate if available, otherwise use current date
//                 const taskDate = newTask.taskDate || new Date().toISOString();
                
//                 setTasks(prev => [...prev, newTask]);
//                 const dateStr = dayjs(taskDate).format('YYYY-MM-DD');
//                 setTaskCounts(prev => ({
//                     ...prev,
//                     [dateStr]: (prev[dateStr] || 0) + 1
//                 }));
                
//                 setEvents(prev => [
//                     ...prev,
//                     {
//                         id: newTask._id,
//                         title: `${newTask.vendorName || formData.vendorName} - ${newTask.role || formData.role}`,
//                         start: new Date(taskDate),
//                         end: new Date(taskDate),
//                         allDay: true,
//                         resource: newTask
//                     }
//                 ]);
                
//                 setShowModal(false);
//                 setFormData({
//                     vendorId: '',
//                     vendorName: '',
//                     role: '',
//                     task: '',
//                     taskDate: dayjs().format('YYYY-MM-DD') // Reset to today's date
//                 });
//             }
//         } catch (err) {
//             setError(err.message);
//             console.error('Error creating task:', err);
//         }
//     };

//     const vendorOptions = vendors.map(vendor => ({
//         value: vendor._id,
//         label: vendor.name,
//         category: vendor.category
//     }));

//     const roleOptions = staticRoles.map(role => ({
//         value: role,
//         label: role
//     }));

//     const customStyles = {
//         control: (provided) => ({
//             ...provided,
//             minHeight: '38px',
//             height: '38px'
//         }),
//         option: (provided, state) => ({
//             ...provided,
//             backgroundColor: state.isSelected ? '#3174ad' : 'white',
//             color: state.isSelected ? 'white' : 'black',
//             '&:hover': {
//                 backgroundColor: '#e9ecef'
//             }
//         })
//     };

//     if (loading) return <div>Loading data...</div>;
//     if (error) return <div>Error: {error}</div>;

//     return (
//         <Container className="py-4">
//             <div className="d-flex justify-content-between align-items-center mb-3">
//                 <Button
//                     variant="dark"
//                     onClick={() => {
//                         setSelectedDate(new Date());
//                         setFormData(prev => ({
//                             ...prev,
//                             taskDate: dayjs().format('YYYY-MM-DD')
//                         }));
//                         setShowModal(true);
//                     }}
//                 >
//                     Assign Daily Task
//                 </Button>
//             </div>

//             <Calendar
//                 localizer={localizer}
//                 events={events}
//                 startAccessor="start"
//                 endAccessor="end"
//                 style={{ height: 500 }}
//                 selectable
//                 onSelectSlot={handleSelectSlot}
//                 onSelectEvent={handleSelectEvent}
//                 defaultView="month"
//                 views={['month', 'week', 'day']}
//                 eventPropGetter={(event) => ({
//                     style: {
//                         backgroundColor: '#212529',
//                         borderRadius: '4px',
//                         color: 'white',
//                         border: 'none'
//                     }
//                 })}
//             />

//             <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
//                 <Modal.Header closeButton>
//                     <Modal.Title>Assign Task for {selectedDate && dayjs(selectedDate).format('MMMM D, YYYY')}</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     <Form onSubmit={handleSubmit}>
//                         <Row className="mb-3">
//                             <Col md={6}>
//                                 <Form.Group controlId="vendorId">
//                                     <Form.Label>Vendor</Form.Label>
//                                     <Select
//                                         name="vendorId"
//                                         options={vendorOptions}
//                                         onChange={handleVendorChange}
//                                         placeholder="Select Vendor"
//                                         styles={customStyles}
//                                         required
//                                         isSearchable
//                                         getOptionLabel={option => (
//                                             <div>
//                                                 {option.label}
//                                                 <span style={{ color: '#6c757d', fontSize: '0.8em', marginLeft: '8px' }}>
//                                                     ({option.category})
//                                                 </span>
//                                             </div>
//                                         )}
//                                     />
//                                 </Form.Group>
//                             </Col>
//                             <Col md={6}>
//                                 <Form.Group controlId="role">
//                                     <Form.Label>Role</Form.Label>
//                                     <Select
//                                         name="role"
//                                         options={roleOptions}
//                                         onChange={handleRoleChange}
//                                         placeholder="Select Role"
//                                         styles={customStyles}
//                                         required
//                                     />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
//                         <Row className="mb-3">
//                             <Col md={6}>
//                                 <Form.Group controlId="taskDate">
//                                     <Form.Label>Task Date</Form.Label>
//                                     <Form.Control
//                                         type="date"
//                                         name="taskDate"
//                                         value={formData.taskDate}
//                                         onChange={handleInputChange}
//                                         required
//                                     />
//                                 </Form.Group>
//                             </Col>
//                         </Row>
//                         <Form.Group controlId="task" className="mb-3">
//                             <Form.Label>Task Description</Form.Label>
//                             <Form.Control
//                                 as="textarea"
//                                 rows={3}
//                                 name="task"
//                                 value={formData.task}
//                                 onChange={handleInputChange}
//                                 required
//                             />
//                         </Form.Group>
//                         <div className="d-flex justify-content-end">
//                             <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
//                                 Cancel
//                             </Button>
//                             <Button variant="primary" type="submit">
//                                 Assign Task
//                             </Button>
//                         </div>
//                     </Form>
//                 </Modal.Body>
//             </Modal>
//         </Container>
//     );
// };

// export default DailyTaskCalendar;

import React, { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, Modal, Form, Row, Col, Container } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/api";

const localizer = dayjsLocalizer(dayjs);

const DailyTaskCalendar = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [specializationOptions, setSpecializationOptions] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    vendorId: "",
    vendorName: "",
    role: "",
    roleLabel: "",
    task: "",
    taskDate: dayjs().format("YYYY-MM-DD"), // Default today
  });

  // ✅ Fetch vendors and daily tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ Fetch vendors (Inhouse Vendor)
        const vendorRes = await axios.get(
          "http://localhost:5000/api/vendors/category/Inhouse%20Vendor"
        );
        if (vendorRes.data?.success) {
          setVendors(vendorRes.data.data || []);
        }

        // ✅ Fetch daily tasks
        const taskRes = await axios.get(`${API_URL}/daily-tasks/`);
        if (taskRes.data?.success) {
          const fetchedTasks = taskRes.data.data || [];
          setTasks(fetchedTasks);

          // Count tasks per date
          const counts = {};
          fetchedTasks.forEach((task) => {
            const date = dayjs(task.taskDate || task.createdAt).format(
              "YYYY-MM-DD"
            );
            counts[date] = (counts[date] || 0) + 1;
          });
          setTaskCounts(counts);

          // Calendar events
          const eventList = Object.entries(counts).map(([date, count]) => ({
            title: `${count} ${count === 1 ? "Task" : "Tasks"}`,
            start: dayjs(date).toDate(),
            end: dayjs(date).toDate(),
            resource: { date },
          }));
          setEvents(eventList);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Fetch service roles (dynamic + static)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_URL}/service/all`);
        if (res.data.success) {
          const dynamicServices = res.data.data.map((service) => ({
            value: service._id,
            label: service.name,
          }));

          // Static predefined specializations
          const staticSpecialization = [
            { value: "candid-photo-editing", label: "Candid Photo Editing" },
            { value: "traditional-video-editing", label: "Traditional Video Editing" },
            { value: "traditional-photo-editing", label: "Traditional Photo Editing" },
            { value: "candid-video-editing", label: "Candid Video Editing" },
            { value: "album-designing", label: "Album Designing" },
            { value: "photo-sorting", label: "Photo Sorting" },
            { value: "video-sorting", label: "Video Sorting / Conversion" },
            { value: "assistant", label: "Assistant" },
            { value: "driver", label: "Driver" },
            { value: "cc-admin", label: "CC Admin" },
            { value: "cr-manager", label: "CR Manager" },
            { value: "makeup-artist", label: "Makeup Artist" },
            { value: "speakers-audio", label: "Speakers & Audio Arrangements" },
            { value: "album-final-correction", label: "Album Final Correction" },
            { value: "photo-colour-correction", label: "Photo Colour Correction" },
            { value: "album-photo-selection", label: "Album Photo Selection" },
            { value: "video-3d-editing", label: "3D Video Editing" },
            { value: "vr-360-editing", label: "360° VR Video Editing" },
            { value: "photo-slideshow", label: "Photo Slideshow" },
            { value: "photo-lamination", label: "Photo Lamination & Frame" },
            { value: "photo-printing-lab", label: "Photo Printing Lab" },
            { value: "storage-devices", label: "Storage Devices" },
            { value: "marketing-printing", label: "Marketing Collaterals Printing" },
            { value: "uniforms", label: "Uniforms" },
            { value: "branding-collaterals", label: "Branding Collaterals" },
            { value: "software-hardware", label: "Software & Hardware Service" },
            { value: "supervisor", label: "Supervisor" },
            { value: "marketing-team", label: "Marketing Team" },
            { value: "branding-team", label: "Branding Team" },
          ];

          // Merge & sort alphabetically
          const merged = [...dynamicServices, ...staticSpecialization].sort((a, b) =>
            a.label.localeCompare(b.label)
          );

          setSpecializationOptions(merged);
        }
      } catch (err) {
        console.error("Failed to fetch services", err);
      }
    };

    fetchServices();
  }, []);

  // ✅ Calendar slot click → navigate to list
  const handleSelectSlot = (slotInfo) => {
    const formattedDate = dayjs(slotInfo.start).format("DD-MM-YYYY");
    navigate(`/daily-task/list?date=${formattedDate}`);
  };

  // ✅ Calendar event click → navigate to list
  const handleSelectEvent = (event) => {
    const formattedDate = dayjs(event.start).format("DD-MM-YYYY");
    navigate(`/daily-task/list?date=${formattedDate}`);
  };

  // ✅ Input Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVendorChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      vendorId: selectedOption?.value || "",
      vendorName: selectedOption?.label || "",
    }));
  };

  const handleRoleChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      role: selectedOption?.value || "",
      roleLabel: selectedOption?.label || "",
    }));
  };

  // ✅ Submit new daily task
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/daily-tasks/`, formData);

      if (response.data?.success) {
        const newTask = response.data.data || response.data.task;
        if (!newTask) throw new Error("Task created but no data returned");

        const taskDate = newTask.taskDate || new Date().toISOString();

        // Update local state
        setTasks((prev) => [...prev, newTask]);
        const dateKey = dayjs(taskDate).format("YYYY-MM-DD");
        setTaskCounts((prev) => ({
          ...prev,
          [dateKey]: (prev[dateKey] || 0) + 1,
        }));

        setEvents((prev) => [
          ...prev,
          {
            id: newTask._id,
            title: `${newTask.vendorName || formData.vendorName} - ${
              newTask.roleLabel || formData.role
            }`,
            start: dayjs(taskDate).toDate(),
            end: dayjs(taskDate).toDate(),
            allDay: true,
            resource: newTask,
          },
        ]);

        // Reset modal
        setShowModal(false);
        setFormData({
          vendorId: "",
          vendorName: "",
          role: "",
          roleLabel: "",
          task: "",
          taskDate: dayjs().format("YYYY-MM-DD"),
        });
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Dropdown options
  const vendorOptions = vendors.map((v) => ({
    value: v._id,
    label: v.name,
    category: v.category,
  }));

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "38px",
      height: "38px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#3174ad" : "white",
      color: state.isSelected ? "white" : "black",
      "&:hover": {
        backgroundColor: "#e9ecef",
      },
    }),
  };

  if (loading) return <div>Loading data...</div>;
  if (error) return <div className="text-danger">Error: {error}</div>;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          variant="dark"
          onClick={() => {
            setSelectedDate(new Date());
            setFormData((prev) => ({
              ...prev,
              taskDate: dayjs().format("YYYY-MM-DD"),
            }));
            setShowModal(true);
          }}
        >
          Assign Daily Task
        </Button>
      </div>

      {/* ✅ Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        defaultView="month"
        views={["month", "week", "day"]}
        eventPropGetter={() => ({
          style: {
            backgroundColor: "#212529",
            borderRadius: "4px",
            color: "white",
            border: "none",
          },
        })}
      />

      {/* ✅ Task Assign Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Assign Task for{" "}
            {selectedDate
              ? dayjs(selectedDate).format("MMMM D, YYYY")
              : dayjs(formData.taskDate).format("MMMM D, YYYY")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="vendorId">
                  <Form.Label>Vendor</Form.Label>
                  <Select
                    name="vendorId"
                    options={vendorOptions}
                    onChange={handleVendorChange}
                    placeholder="Select Vendor"
                    styles={customStyles}
                    required
                    isSearchable
                    getOptionLabel={(option) => (
                      <div>
                        {option.label}
                        <span
                          style={{
                            color: "#6c757d",
                            fontSize: "0.8em",
                            marginLeft: "8px",
                          }}
                        >
                          ({option.category})
                        </span>
                      </div>
                    )}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="role">
                  <Form.Label>Role / Specialization</Form.Label>
                  <Select
                    name="role"
                    options={specializationOptions}
                    onChange={handleRoleChange}
                    placeholder="Select Role"
                    styles={customStyles}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="taskDate">
                  <Form.Label>Task Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="taskDate"
                    value={formData.taskDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="task" className="mb-3">
              <Form.Label>Task Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="task"
                value={formData.task}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Assign Task
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DailyTaskCalendar;
