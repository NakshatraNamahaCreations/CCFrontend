// import React, { useState } from "react";

// import { Button, Modal, Form, } from "react-bootstrap";
// import { IoSearch } from "react-icons/io5";
// import sortIcon from "../assets/icons/sort.png";
// import filterIcon from "../assets/icons/filter.png";
// import UpcomingEvents from "./Booking/UpcomingEvents";
// import OngoingEvents from "./Booking/OngoingEvents";
// import { useNavigate } from "react-router-dom";
// import Calendar from "react-calendar";

// const Booking = () => {
//   const [activeTab, setActiveTab] = useState("Upcoming Events");
//   const [showCalendarModal, setShowCalendarModal] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const navigate = useNavigate();

//   const renderContent = () => {
//     switch (activeTab) {
//       case "Upcoming Events":
//         return <UpcomingEvents />;
//       case "On Going Events":
//         return <OngoingEvents />;
//       default:
//         return <UpcomingEvents />;
//     }
//   };

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//     setShowCalendarModal(false);
//     navigate(`/booking/calender-events`);
//   };

//   return (
//     <div className="container py-2 rounded vh-100" style={{ background: "#F4F4F4" }}>
//       <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
//         <div className="d-flex gap-2 align-items-center w-50">
//           <div className="w-100 bg-white d-flex gap-2 align-items-center px-2 rounded">
//             <IoSearch size={16} className="text-muted" />
//             <Form className="d-flex flex-grow-1">
//               <Form.Group className="w-100">
//                 <Form.Control
//                   type="text"
//                   placeholder="Enter Service name"
//                   style={{
//                     paddingLeft: "4px",
//                     border: "none",
//                     outline: "none",
//                     boxShadow: "none",
//                     fontSize: "14px",
//                   }}
//                 />
//               </Form.Group>
//             </Form>
//           </div>
//           <img
//             src={sortIcon}
//             alt="sortIcon"
//             style={{ width: "25px", cursor: "pointer" }}
//           />
//           <img
//             src={filterIcon}
//             alt="filterIcon"
//             style={{ width: "25px", cursor: "pointer" }}
//           />
//         </div>
//         <div className="d-flex gap-4 w-50">
//           {/* <Button
//             variant="light-gray"
//             className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
//             style={{ fontSize: "14px" }}
//             onClick={() => setShowCalendarModal(true)}
//           >
//             Calender
//           </Button> */}
//           <Button
//             variant="light-gray"
//             onClick={() => navigate("/booking/finished-events")}
//             className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
//             style={{ fontSize: "14px"}}
//           >
//             Finished Events
//           </Button>
//           <Button
//             // onClick={handleDownloadExcel}
//             variant="light-gray"
//             className="btn rounded-5 bg-white  border-2 shadow-sm"
//             style={{ fontSize: "14px" }}
//           >
//             Download Excel
//           </Button>
//         </div>

//       </div>

//       {/* Tab Navigation */}
//       <div className="d-flex gap-3 my-2">
//         <p
//           className={`text-center ${activeTab === "Upcoming Events"
//               ? "fw-bold text-dark border-bottom border-3 border-dark"
//               : "text-muted"
//             }`}
//           onClick={() => setActiveTab("Upcoming Events")}
//           style={{ fontSize: "14px", cursor: "pointer" }}
//         >
//           Upcoming Events
//         </p>
//         <p
//           className={`text-center ${activeTab === "On Going Events"
//               ? "fw-bold text-dark border-bottom border-3 border-dark"
//               : "text-muted"
//             }`}
//           onClick={() => setActiveTab("On Going Events")}
//           style={{ fontSize: "14px", cursor: "pointer" }}
//         >
//           On Going Events
//         </p>
//       </div>

//       {/* Render Active Tab Content */}
//       <div>{renderContent()}</div>

//       <Modal
//         show={showCalendarModal}
//         onHide={() => setShowCalendarModal(false)}
//         centered

//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Events Date</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="d-flex justify-content-center">
//           <Calendar
//             onChange={handleDateChange}
//             value={selectedDate}
//             minDate={new Date()}
//           />
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default Booking;

import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { IoSearch } from "react-icons/io5";
import sortIcon from "../assets/icons/sort.png";
import filterIcon from "../assets/icons/filter.png";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import axios from "axios";
import dayjs from "dayjs";
import { FiChevronRight } from "react-icons/fi";
import { API_URL } from "../utils/api";

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("Upcoming Events");
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  const today = dayjs().format("YYYY-MM-DD");
  const selectedFormatted = dayjs(selectedDate).format("YYYY-MM-DD");
  const isSameAsToday = today === selectedFormatted;

  useEffect(() => {
    const stateDate = location.state?.date;
    const todayStr = dayjs().format("YYYY-MM-DD");

    if (stateDate) {
      setSelectedDate(new Date(stateDate));
      const formatted = dayjs(stateDate).format("YYYY-MM-DD");

      if (formatted === todayStr) {
        setActiveTab("On Going Events");
        fetchTodayEvents();
      } else {
        setActiveTab("Upcoming Events");
        fetchEventsByDate(formatted);
      }
    } else {
      setActiveTab("On Going Events");
      fetchTodayEvents();
    }
  }, []);

  const fetchTodayEvents = async () => {
    try {
      const res = await axios.get(
      `${API_URL}/quotations/booked-events-today`
      );
      setEvents(res.data.quotations || []);
    } catch (err) {
      console.error("Error fetching today's events:", err);
    }
  };

  const fetchEventsByDate = async (dateStr) => {
    try {
      const res = await axios.get(
        `${API_URL}/quotations/booked-events-by-date/${dateStr}`
      );
      setEvents(res.data.quotations || []);
    } catch (err) {
      console.error("Error fetching events by date:", err);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "Upcoming Events") {
      const formatted = dayjs(selectedDate).format("YYYY-MM-DD");
      fetchEventsByDate(formatted);
    } else {
      fetchTodayEvents();
    }
  };

  const handleDateChange = (date) => {
    const formatted = dayjs(date).format("YYYY-MM-DD");
    setSelectedDate(date);
    setShowCalendarModal(false);

    if (formatted === today) {
      setActiveTab("On Going Events");
      fetchTodayEvents();
    } else {
      setActiveTab("Upcoming Events");
      fetchEventsByDate(formatted);
    }
  };

  const displayDate =
    activeTab === "Upcoming Events"
      ? dayjs(selectedDate).format("DD-MM-YYYY")
      : dayjs().format("DD-MM-YYYY");

  return (
    <div
      className="container py-2 rounded vh-100"
      style={{ background: "#F4F4F4" }}
    >
      {/* Header */}
      <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
        <div className="d-flex gap-2 align-items-center w-50">
          <h6 className="py-2">
            {activeTab === "Upcoming Events"
              ? "Selected Date :"
              : "Current Date :"}{" "}
            {displayDate}
          </h6>
        </div>

        <div className="d-flex gap-4 w-50 justify-content-end">
          <Button
            variant="light-gray"
            onClick={() => setShowCalendarModal(true)}
            className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
            style={{ fontSize: "14px" }}
          >
            Calendar
          </Button>
          <Button
            variant="light-gray"
            onClick={() => navigate("/booking/finished-events")}
            className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
            style={{ fontSize: "14px" }}
          >
            Finished Events
          </Button>
          <Button
            variant="light-gray"
            className="btn rounded-5 bg-white border-2 shadow-sm"
            style={{ fontSize: "14px" }}
          >
            Download Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-3 my-2">
        {!isSameAsToday && (
          <p
            className={`text-center ${
              activeTab === "Upcoming Events"
                ? "fw-bold text-dark border-bottom border-3 border-dark"
                : "text-muted"
            }`}
            onClick={() => handleTabSwitch("Upcoming Events")}
            style={{ fontSize: "14px", cursor: "pointer" }}
          >
            Upcoming Events
          </p>
        )}
        <p
          className={`text-center ${
            activeTab === "On Going Events"
              ? "fw-bold text-dark border-bottom border-3 border-dark"
              : "text-muted"
          }`}
          onClick={() => handleTabSwitch("On Going Events")}
          style={{ fontSize: "14px", cursor: "pointer" }}
        >
          On Going Events
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm p-3">
        <div className="table-responsive">
          <table className="table align-middle text-center">
            <thead>
              <tr>
                <th>Sl.No</th>
                <th>Name</th>
                <th>Booking Id</th>
                <th>Events</th>
                <th>Vendor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6}>No records found.</td>
                </tr>
              ) : (
                events.map((event, idx) => {
                  return event.packages.map((pkg, i) => (
                    <tr key={`${event._id}-${i}`}>
                      <td>{String(idx + 1).padStart(2, "0")}</td>
                      <td>{event.leadId?.persons?.[0]?.name || "N/A"}</td>
                      <td>{event.quotationId}</td>
                      <td>
                        <div>
                          <div>{pkg.categoryName}</div>
                          <div style={{ fontSize: "12px", color: "#888" }}>
                            {pkg.venueName}
                          </div>
                        </div>
                      </td>
                      <td>
                        {event.vendorName || (
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-2 shadow-sm"
                            onClick={() =>
                              navigate(
                                `/vendors/vendor-assign/${event._id}/${pkg._id}`
                              )
                            }
                          >
                            Assign
                          </Button>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="light"
                          size="sm"
                          className="rounded-2 shadow-sm"
                          onClick={() =>
                            navigate(`/booking/booking-details/${event._id}`)
                          }
                        >
                          <FiChevronRight size={20} />
                        </Button>
                      </td>
                    </tr>
                  ));
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar Modal */}
      <Modal
        show={showCalendarModal}
        onHide={() => setShowCalendarModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Events Date</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            minDate={new Date()}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Booking;
