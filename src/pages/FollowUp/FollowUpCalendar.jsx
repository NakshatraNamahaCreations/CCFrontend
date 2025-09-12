// import React, { useState, useEffect } from 'react';
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import { Badge, Container, Spinner } from 'react-bootstrap';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const localizer = momentLocalizer(moment);

// const FollowUpCalendar = () => {
//     const navigate = useNavigate();
//     const [followUps, setFollowUps] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [events, setEvents] = useState([]);

//     // Fetch follow-ups from API
//     useEffect(() => {
//         const fetchFollowUps = async () => {
//             try {
//                 const response = await axios.get('http://localhost:5000/api/follow-up/');
//                 if (response.data?.success) {
//                     const fetchedFollowUps = response.data.data || [];
//                     setFollowUps(fetchedFollowUps);

//                     // Create events map to count follow-ups per date
//                     const dateCountMap = {};
//                     fetchedFollowUps.forEach(followUp => {
//                         const dateStr = moment(followUp.followUpDate).format('YYYY-MM-DD');
//                         dateCountMap[dateStr] = (dateCountMap[dateStr] || 0) + 1;
//                     });

//                     // Create events for the calendar
//                     const followUpEvents = Object.entries(dateCountMap).map(([dateStr, count]) => ({
//                         id: dateStr,
//                         title: `${count} ${count === 1 ? 'Follow-up' : 'Follow-ups'}`,
//                         start: new Date(dateStr),
//                         end: new Date(dateStr),
//                         allDay: true,
//                         count,
//                         isOverdue: moment(dateStr).isBefore(moment(), 'day')
//                     }));

//                     setEvents(followUpEvents);
//                 }
//             } catch (err) {
//                 setError(err.message || 'Failed to fetch follow-ups');
//                 console.error('Error fetching follow-ups:', err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchFollowUps();
//     }, []);

//     const handleSelectSlot = (slotInfo) => {
//         const dateStr = moment(slotInfo.start).format('YYYY-MM-DD');
//         const followUpsForDate = followUps.filter(followUp =>
//             moment(followUp.followUpDate).format('YYYY-MM-DD') === dateStr
//         );

//         if (followUpsForDate.length > 0) {
//             navigate(`/follow-ups/date/${dateStr}`);
//         }
//     };

//     const customEventPropGetter = (event) => {
//         return {
//             style: {
//                 backgroundColor: event.isOverdue ? '#dc3545' : moment(event.start).isSame(moment(), 'day') ? '#ffc107' : '#28a745',
//                 color: 'white',
//                 borderRadius: '4px',
//                 border: 'none',
//                 padding: '2px 6px',
//                 fontSize: '0.8rem',
//                 textAlign: 'center'
//             }
//         };
//     };

//     if (loading) {
//         return (
//             <Container className="py-4 d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
//                 <div className="text-center">
//                     <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
//                         <span className="visually-hidden">Loading...</span>
//                     </Spinner>
//                     <p className="mt-3">Loading follow-ups...</p>
//                 </div>
//             </Container>
//         );
//     }

//     if (error) return <div className="alert alert-danger">Error: {error}</div>;

//     return (
//         <Container className="py-4">
//             <div className="mb-3">
//                 <Badge bg="danger" className="me-2">Overdue</Badge>
//                 <Badge bg="warning" className="me-2">Today</Badge>
//                 <Badge bg="success">Upcoming</Badge>
//             </div>

//             <Calendar
//                 localizer={localizer}
//                 events={events}
//                 startAccessor="start"
//                 endAccessor="end"
//                 style={{ height: 500 }}
//                 selectable
//                 onSelectSlot={handleSelectSlot}
//                 defaultView="month"
//                 views={['month', 'week', 'day']}
//                 eventPropGetter={customEventPropGetter}
//                 onSelectEvent={(event) => navigate(`/follow-ups/date/${moment(event.start).format('YYYY-MM-DD')}`)}
//             />
//         </Container>
//     );
// };

// export default FollowUpCalendar;



import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Badge, Container, Spinner, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

const FollowUpCalendar = () => {
    const navigate = useNavigate();
    const [followUps, setFollowUps] = useState([]);
    const [callFollowUps, setCallFollowUps] = useState([]); // State for Call Follow-ups
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedTab, setSelectedTab] = useState('payment'); // Default to payment

    // Fetch follow-ups from API for the selected tab
    // ---- Fetch follow-ups from API for the selected tab ----
    useEffect(() => {
        const fetchFollowUps = async () => {
            try {
                if (selectedTab === "payment") {
                    // ✅ Fetch Payment Follow-ups
                    const response = await axios.get("http://localhost:5000/api/follow-up/");
                    if (response.data?.success) {
                        const fetchedFollowUps = response.data.data || [];
                        setFollowUps(fetchedFollowUps);

                        if (fetchedFollowUps.length === 0) {
                            setEvents([]); // ✅ show empty calendar if no payment follow-ups
                        } else {
                            const dateCountMap = {};
                            fetchedFollowUps.forEach((followUp) => {
                                if (followUp.followUpDate) {
                                    const dateStr = moment(followUp.followUpDate).format("YYYY-MM-DD");
                                    dateCountMap[dateStr] = (dateCountMap[dateStr] || 0) + 1;
                                }
                            });

                            const followUpEvents = Object.entries(dateCountMap).map(([dateStr, count]) => ({
                                id: dateStr,
                                title: `${count} ${count === 1 ? "Follow-up" : "Follow-ups"}`,
                                start: new Date(dateStr),
                                end: new Date(dateStr),
                                allDay: true,
                                count,
                                isOverdue: moment(dateStr).isBefore(moment(), "day"),
                            }));

                            setEvents(followUpEvents);
                        }
                    } else {
                        setEvents([]); // fallback if success is false
                    }
                } else if (selectedTab === "call") {
                    // ✅ Fetch Call Follow-ups
                    const response = await axios.get(
                        "http://localhost:5000/api/lead/status/Call%20Later"
                    );
                    if (response.data?.success) {
                        const fetchedCallFollowUps = response.data.data || [];
                        setCallFollowUps(fetchedCallFollowUps);

                        if (fetchedCallFollowUps.length === 0) {
                            setEvents([]); // ✅ empty calendar if no call follow-ups
                        } else {
                            const dateCountMap = {};
                            fetchedCallFollowUps.forEach((followUp) => {
                                if (followUp.callRescheduledDate) {
                                    const dateStr = moment(followUp.callRescheduledDate).format("YYYY-MM-DD");
                                    dateCountMap[dateStr] = (dateCountMap[dateStr] || 0) + 1;
                                }
                            });

                            const callFollowUpEvents = Object.entries(dateCountMap).map(
                                ([dateStr, count]) => ({
                                    id: dateStr,
                                    title: `${count} ${count === 1 ? "Follow-up" : "Follow-ups"}`,
                                    start: new Date(dateStr),
                                    end: new Date(dateStr),
                                    allDay: true,
                                    count,
                                    isOverdue: moment(dateStr).isBefore(moment(), "day"),
                                })
                            );

                            setEvents(callFollowUpEvents);
                        }
                    } else {
                        setEvents([]); // fallback if success is false
                    }
                }
            } catch (err) {
                setError(err.message || "Failed to fetch follow-ups");
                console.error("Error fetching follow-ups:", err.response.data.message);
                setEvents([]); // ✅ prevent crash, still show empty calendar
            } finally {
                setLoading(false);
            }
        };

        fetchFollowUps();
    }, [selectedTab]);

    const handleSelectSlot = (slotInfo) => {
        const dateStr = moment(slotInfo.start).format('YYYY-MM-DD');
        const followUpsForDate = (selectedTab === 'payment' ? followUps : callFollowUps).filter(followUp =>
            moment(followUp.followUpDate).format('YYYY-MM-DD') === dateStr
        );

        if (followUpsForDate.length > 0) {
            navigate(`/follow-ups/date/${dateStr}`);
        }
    };

    const customEventPropGetter = (event) => {
        return {
            style: {
                backgroundColor: event.isOverdue ? '#dc3545' : moment(event.start).isSame(moment(), 'day') ? '#ffc107' : '#09631eff',
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                padding: '2px 6px',
                fontSize: '0.8rem',
                textAlign: 'center'
            }
        };
    };

    if (loading) {
        return (
            <Container className="py-4 d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="text-center">
                    <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-3">Loading follow-ups...</p>
                </div>
            </Container>
        );
    }

    // if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <Container className="py-4">
            <div className="mb-3">
                <Badge bg="danger" className="me-2">Overdue</Badge>
                <Badge bg="warning" className="me-2">Today</Badge>
                <Badge bg="success">Upcoming</Badge>
            </div>

            <Tabs
                activeKey={selectedTab}
                onSelect={(k) => setSelectedTab(k)} // Switch tabs
                id="follow-up-tabs"
                className="mb-3"
            >
                <Tab eventKey="payment" title="Payment Follow-ups">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 500 }}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        defaultView="month"
                        views={['month', 'week', 'day']}
                        eventPropGetter={customEventPropGetter}
                        onSelectEvent={(event) => navigate(`/follow-ups/date/${moment(event.start).format('YYYY-MM-DD')}`)}
                    />
                </Tab>
                <Tab eventKey="call" title="Call Follow-ups">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 500 }}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        defaultView="month"
                        views={['month', 'week', 'day']}
                        eventPropGetter={customEventPropGetter}
                        onSelectEvent={(event) => navigate(`/follow-ups/call-later?date=${moment(event.start).format('YYYY-MM-DD')}`)}
                    />
                </Tab>
            </Tabs>
        </Container>
    );
};

export default FollowUpCalendar;
