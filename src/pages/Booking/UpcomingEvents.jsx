import React, { useEffect, useState } from "react";
import { Button, Card, Table, Container } from "react-bootstrap";
import { IoChevronForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const UpcomingEvents = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  // Parse query params, e.g. date or customerId
  const params = new URLSearchParams(location.search);
  const date = params.get("date");  // or customerId if you pass that

  // In your API call, pass this filter
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      setLoading(true);
      try {
        const url = date 
          ? `http://localhost:5000/api/quotations/upcoming?date=${date}`
          : "http://localhost:5000/api/quotations/upcoming";

        const response = await axios.get(url);

        if (response.data.success) {
          setUpcomingEvents(response.data.data);
        } else {
          toast.error("Failed to fetch upcoming events");
        }
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        toast.error(error.response?.data?.message || "Failed to fetch upcoming events");
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingEvents();
  }, [date]);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>Loading...</div>;
  }

  return (
    <Container className="position-relative">
      <Card className="border-0 p-3">
        <div className="table-responsive bg-white" style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <Table className="table table-hover align-middle">
            <thead className="text-white text-center sticky-top" style={{ backgroundColor: "#333a40" }}>
              <tr style={{ fontSize: "14px" }}>
                <th>Sl.No</th>
                <th>Name</th>
                <th>Booking Id</th>
                <th>Events</th>
                <th>Date</th>
                <th>Vendor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No upcoming events found
                  </td>
                </tr>
              ) : (
                upcomingEvents.map((item, idx) => (
                  <tr key={idx} style={{ fontSize: "12px" }} className="text-center fw-semibold">
                    <td>{String(idx + 1).padStart(2, "0")}</td>
                    <td>{item.name}</td>
                    <td>{item.bookingId}</td>
                    <td className="d-flex flex-column">
                      {item.eventDetails.name}
                      <small className="text-muted">{item.eventDetails.venue}</small>
                    </td>
                    <td>{item.date}</td>
                    <td>
                      {item.vendor ? (
                        <span>{item.vendor}</span>
                      ) : (
                        <Button
                          variant="light-gray"
                          onClick={() => navigate(`/vendors/vendor-assign/${item.bookingId}`)}
                          className="btn rounded-1 fw-bold bg-white border-2 shadow-sm"
                          style={{ fontSize: "12px" }}
                        >
                          Assign
                        </Button>
                      )}
                    </td>
                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/booking/booking-details/${item.bookingId}`)}
                    >
                      <IoChevronForward size={20} className="text-muted" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </Container>
  );
};

export default UpcomingEvents;