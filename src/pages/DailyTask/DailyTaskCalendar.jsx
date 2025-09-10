// import React, { useState, useEffect } from 'react';
// import { Calendar, dayjsLocalizer } from 'react-big-calendar';
// import dayjs from 'dayjs';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import { Button, Modal, Form, Row, Col, Container } from 'react-bootstrap';
// import Select from 'react-select';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

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
//         date: ''
//     });

//     // Fetch vendors and tasks from API
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 // Fetch vendors
//                 const vendorsResponse = await axios.get('http://localhost:5000/api/vendors/');
//                 if (vendorsResponse.data?.success) {
//                     setVendors(vendorsResponse.data.vendors || []);
//                 }

//                 // Fetch tasks
//                 const tasksResponse = await axios.get('http://localhost:5000/api/daily-tasks/');
//                 if (tasksResponse.data?.success) {
//                     const fetchedTasks = tasksResponse.data.data || [];
//                     setTasks(fetchedTasks);

//                     // Calculate task counts per date
//                     const counts = {};
//                     fetchedTasks.forEach(task => {
//                         const date = dayjs(task.createdAt).format('YYYY-MM-DD');
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
//             const response = await axios.post('http://localhost:5000/api/daily-tasks/', formData);
            
//             if (response.data?.success) {
//                 const newTask = response.data.data || response.data.task; // Try both common response formats
                
//                 if (!newTask) {
//                     throw new Error('Task was created but no task data returned');
//                 }
                
//                 if (!newTask.createdAt) {
//                     // If createdAt is missing, add it manually with current date
//                     newTask.createdAt = new Date().toISOString();
//                 }
                
//                 setTasks(prev => [...prev, newTask]);
//                 const dateStr = dayjs(newTask.createdAt).format('YYYY-MM-DD');
//                 setTaskCounts(prev => ({
//                     ...prev,
//                     [dateStr]: (prev[dateStr] || 0) + 1
//                 }));
                
//                 setEvents(prev => [
//                     ...prev,
//                     {
//                         id: newTask._id,
//                         title: `${newTask.vendorName || formData.vendorName} - ${newTask.role || formData.role}`,
//                         start: new Date(newTask.createdAt),
//                         end: new Date(newTask.createdAt),
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
//                     date: ''
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
//                             date: dayjs().format('YYYY-MM-DD')
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



import React, { useState, useEffect } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, Modal, Form, Row, Col, Container } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const localizer = dayjsLocalizer(dayjs);

const DailyTaskCalendar = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [events, setEvents] = useState([]);
    const [taskCounts, setTaskCounts] = useState({});

    const staticRoles = ['Photographer', 'Videographer', 'Caterer', 'Decorator', 'DJ', 'Coordinator'];

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({
        vendorId: '',
        vendorName: '',
        role: '',
        task: '',
        taskDate: dayjs().format('YYYY-MM-DD') // Default to today's date
    });

    // Fetch vendors and tasks from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch vendors
                const vendorsResponse = await axios.get('http://localhost:5000/api/vendors/');
                if (vendorsResponse.data?.success) {
                    setVendors(vendorsResponse.data.vendors || []);
                }

                // Fetch tasks
                const tasksResponse = await axios.get('http://localhost:5000/api/daily-tasks/');
                if (tasksResponse.data?.success) {
                    const fetchedTasks = tasksResponse.data.data || [];
                    setTasks(fetchedTasks);

                    // Calculate task counts per date using taskDate field
                    const counts = {};
                    fetchedTasks.forEach(task => {
                        const date = dayjs(task.taskDate || task.createdAt).format('YYYY-MM-DD');
                        counts[date] = (counts[date] || 0) + 1;
                    });
                    setTaskCounts(counts);

                    setEvents(
                        Object.entries(counts).map(([date, count]) => ({
                            title: `${count} ${count === 1 ? 'Task' : 'Tasks'}`,
                            start: new Date(date),
                            end: new Date(date),
                            resource: { date },
                        }))
                    );
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSelectSlot = (slotInfo) => {
        const formattedDate = dayjs(slotInfo.start).format('DD-MM-YYYY');
        navigate(`/daily-task/list?date=${formattedDate}`);
    };

    const handleSelectEvent = (event) => {
        const formattedDate = dayjs(event.start).format('DD-MM-YYYY');
        navigate(`/daily-task/list?date=${formattedDate}`);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVendorChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            vendorId: selectedOption.value,
            vendorName: selectedOption.label
        }));
    };

    const handleRoleChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            role: selectedOption.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/daily-tasks/', formData);
            
            if (response.data?.success) {
                const newTask = response.data.data || response.data.task;
                
                if (!newTask) {
                    throw new Error('Task was created but no task data returned');
                }
                
                // Use taskDate if available, otherwise use current date
                const taskDate = newTask.taskDate || new Date().toISOString();
                
                setTasks(prev => [...prev, newTask]);
                const dateStr = dayjs(taskDate).format('YYYY-MM-DD');
                setTaskCounts(prev => ({
                    ...prev,
                    [dateStr]: (prev[dateStr] || 0) + 1
                }));
                
                setEvents(prev => [
                    ...prev,
                    {
                        id: newTask._id,
                        title: `${newTask.vendorName || formData.vendorName} - ${newTask.role || formData.role}`,
                        start: new Date(taskDate),
                        end: new Date(taskDate),
                        allDay: true,
                        resource: newTask
                    }
                ]);
                
                setShowModal(false);
                setFormData({
                    vendorId: '',
                    vendorName: '',
                    role: '',
                    task: '',
                    taskDate: dayjs().format('YYYY-MM-DD') // Reset to today's date
                });
            }
        } catch (err) {
            setError(err.message);
            console.error('Error creating task:', err);
        }
    };

    const vendorOptions = vendors.map(vendor => ({
        value: vendor._id,
        label: vendor.name,
        category: vendor.category
    }));

    const roleOptions = staticRoles.map(role => ({
        value: role,
        label: role
    }));

    const customStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '38px',
            height: '38px'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3174ad' : 'white',
            color: state.isSelected ? 'white' : 'black',
            '&:hover': {
                backgroundColor: '#e9ecef'
            }
        })
    };

    if (loading) return <div>Loading data...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button
                    variant="dark"
                    onClick={() => {
                        setSelectedDate(new Date());
                        setFormData(prev => ({
                            ...prev,
                            taskDate: dayjs().format('YYYY-MM-DD')
                        }));
                        setShowModal(true);
                    }}
                >
                    Assign Daily Task
                </Button>
            </div>

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
                views={['month', 'week', 'day']}
                eventPropGetter={(event) => ({
                    style: {
                        backgroundColor: '#212529',
                        borderRadius: '4px',
                        color: 'white',
                        border: 'none'
                    }
                })}
            />

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Assign Task for {selectedDate && dayjs(selectedDate).format('MMMM D, YYYY')}</Modal.Title>
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
                                        getOptionLabel={option => (
                                            <div>
                                                {option.label}
                                                <span style={{ color: '#6c757d', fontSize: '0.8em', marginLeft: '8px' }}>
                                                    ({option.category})
                                                </span>
                                            </div>
                                        )}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="role">
                                    <Form.Label>Role</Form.Label>
                                    <Select
                                        name="role"
                                        options={roleOptions}
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
                            <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
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