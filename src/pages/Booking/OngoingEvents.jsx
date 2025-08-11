import React, { useEffect, useState } from "react";
import { Button, Card, Table, Container } from "react-bootstrap";
import { IoChevronForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const OngoingEvents = () => {
  const navigate = useNavigate();
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/quotations/today")
      .then(res => res.json())
      .then(data => {
        console.log("Raw data from /api/quotations/today:", data);
        if (data.success) {
          setTodayEvents(data.data);
        } else {
          setTodayEvents([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch today's events:", err);
        setTodayEvents([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading today's events...</div>;

  return (
    <Container className="position-relative">
      <Card className="border-0 p-3">
        <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top">
              <tr style={{ fontSize: "14px" }}>
                <th>Sl.No</th>
                <th>Name</th>
                <th>Booking Id</th>
                <th>Events</th>
                <th>Date</th>
                <th>Package</th>
                <th>Vendor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {todayEvents.length === 0 && (
                <tr><td colSpan="8" className="text-center">No events found for today.</td></tr>
              )}
              {todayEvents.map((item, idx) => (
                <tr key={item.bookingId + idx} style={{ fontSize: "12px" }} className="fw-semibold text-center">
                  <td>{String(idx + 1).padStart(2, "0")}</td>
                  <td>{item.name}</td>
                  <td>{item.bookingId}</td>
                  <td className="d-flex flex-column">
                    {item.eventDetails.name}
                    <small className="text-muted">{item.eventDetails.venue}</small>
                  </td>
                  <td>{item.date}</td>
                  <td>{item.package || '-'}</td>
                  <td>{item.vendor || '-'}</td>
                  <td style={{ cursor: "pointer" }} onClick={() => navigate(`/booking/booking-details/${item.bookingId}`)}>
                    <IoChevronForward size={20} className="text-muted" />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </Container>
  );
};

export default OngoingEvents;