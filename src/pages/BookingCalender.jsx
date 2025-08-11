// import React, { useEffect, useState } from "react";
// import { Calendar, dayjsLocalizer } from "react-big-calendar";
// import dayjs from "dayjs";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { Container, Card } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const localizer = dayjsLocalizer(dayjs);

// const BookingCalender = () => {
//   const navigate = useNavigate();
//   const [events, setEvents] = useState([]);

//   useEffect(() => {
//     const fetchBookedQuotations = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/quotations/status/Booked");
//         if (response.data.success) {
//           // Aggregate event counts by date, only for today and future dates
//           const dateCountMap = {};
//           const today = dayjs().startOf('day');
//           response.data.quotations.forEach(quotation => {
//             quotation.packages.forEach(pkg => {
//               const date = pkg.eventStartDate;
//               if (dayjs(date).isBefore(today)) return; // Skip past dates
//               if (dateCountMap[date]) {
//                 dateCountMap[date]++;
//               } else {
//                 dateCountMap[date] = 1;
//               }
//             });
//           });

//           // Convert to calendar events
//           const calendarEvents = Object.entries(dateCountMap).map(([date, count]) => ({
//             title: `${count} Events`,
//             start: new Date(date),
//             end: new Date(date),
//             resource: { date },
//           }));

//           setEvents(calendarEvents);
//         } else {
//           console.error("Error loading events:", response.data.message);
//         }
//       } catch (err) {
//         console.error("Error fetching booked quotations:", err);
//       }
//     };

//     fetchBookedQuotations();
//   }, []);

//   const handleEventClick = (event) => {
//     const selectedDate = dayjs(event.start).format("YYYY-MM-DD");
//     navigate("/booking-list", { state: { date: selectedDate } });
//   };

//   return (
//     <Container>
//       <Card className="mt-3">
//         <Card.Body>
//           <Calendar
//             localizer={localizer}
//             events={events}
//             startAccessor="start"
//             endAccessor="end"
//             defaultView="month"
//             views={["month", "agenda"]}
//             style={{ height: 460 }}
//             eventPropGetter={(event) => ({
//               style: {
//                 backgroundColor: "#3C3D37",
//                 color: "white",
//                 borderRadius: "4px",
//                 border: "none",
//                 padding: "2px 6px",
//               },
//             })}
//             onSelectEvent={handleEventClick}
//           />
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// };

// export default BookingCalender;

import React, { useEffect, useState } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Container, Card, Table, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const localizer = dayjsLocalizer(dayjs);

const BookingCalender = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [key, setKey] = useState("calendar");

  useEffect(() => {
    const fetchBookedQuotations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/quotations/status/Booked"
        );

        if (response.data.success) {
          const quotations = response.data.quotations;
          setAllBookings(quotations);

          // 📌 Prepare Calendar Event Counts
          const dateCountMap = {};
          const today = dayjs().startOf("day");

          quotations.forEach((quotation) => {
            quotation.packages.forEach((pkg) => {
              const date = pkg.eventStartDate;
              if (dayjs(date).isBefore(today)) return;
              dateCountMap[date] = (dateCountMap[date] || 0) + 1;
            });
          });

          const calendarEvents = Object.entries(dateCountMap).map(
            ([date, count]) => ({
              title: `${count} Events`,
              start: new Date(date),
              end: new Date(date),
              resource: { date },
            })
          );

          setEvents(calendarEvents);
        }
      } catch (err) {
        console.error("Error fetching booked quotations:", err);
      }
    };

    fetchBookedQuotations();
  }, []);

  const handleEventClick = (event) => {
    const selectedDate = dayjs(event.start).format("YYYY-MM-DD");
    navigate("/booking-list", { state: { date: selectedDate } });
  };

  return (
    <Container>
      <Card className="mt-3">
        <Card.Body>
          <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
            {/* Calendar Tab */}
            <Tab eventKey="calendar" title="Calendar View">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView="month"
                views={["month", "agenda"]}
                style={{ height: 460 }}
                eventPropGetter={() => ({
                  style: {
                    backgroundColor: "#3C3D37",
                    color: "white",
                    borderRadius: "4px",
                    border: "none",
                    padding: "2px 6px",
                  },
                })}
                onSelectEvent={handleEventClick}
              />
            </Tab>

            {/* All Bookings Tab */}
            <Tab eventKey="allBookings" title="All Bookings">
              <div style={{ overflowX: "auto" }}>
                <Table
                  bordered={false}
                  hover
                  style={{
                    borderCollapse: "separate",
                    borderSpacing: "0 8px",
                    width: "100%",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#f9f9f9",
                        fontSize: "14px",
                        textAlign: "center",
                      }}
                    >
                      <th>Sl.no</th>
                      <th>Booking Id</th>
                      <th>Event (Category - Date)</th>
                      <th>Customer Name</th>
                      <th>Phone</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map((q, index) => {
                      const events = q.packages.map((pkg, i) => (
                        <div key={i}>
                          {pkg.categoryName} -{" "}
                          {dayjs(pkg.eventStartDate).format("DD/MM/YY")}
                        </div>
                      ));
                      const names = q.leadId?.persons?.map((p, i) => (
                        <div key={i}>{p.name}</div>
                      ));
                      const phones = q.leadId?.persons?.map((p, i) => (
                        <div key={i}>{p.phoneNo}</div>
                      ));

                      return (
                        <tr
                          key={q._id}
                          style={{
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                            fontSize: "13px",
                            textAlign: "center",
                          }}
                          onClick={()=>navigate(`/booking/booking-details/${q?._id}`)}
                        >
                          <td>{String(index + 1).padStart(2, "0")}</td>
                          <td>{q.quotationId}</td>
                          <td>{events}</td>
                          <td>{names}</td>
                          <td>{phones}</td>
                          <td>₹{q.totalAmount.toLocaleString()}</td>
                          <td>{q.bookingStatus}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BookingCalender;
