import React, { useEffect, useState } from "react";
import { Button, Card, Table, Container, Form } from "react-bootstrap";
import { IoChevronForward, IoSearch } from "react-icons/io5";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const FinishedEvents = () => {
  const navigate = useNavigate();
  const [finishedEvents, setFinishedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinishedEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/quotations/status/Completed");
        console.log("Raw data from /api/quotations/status/Completed:", response.data);

        if (response.data.success) {
          // Transform the API data to match your component's expected structure
          const transformedData = response.data.quotations.map((quotation, index) => {
            // Get the first package for event details
            const firstPackage = quotation.packages && quotation.packages.length > 0 
              ? quotation.packages[0] 
              : {};
            
            // Get the first person's name from lead
            const primaryPerson = quotation.leadId?.persons?.[0] || {};
            
            // Get assigned vendors from services
            const vendors = quotation.packages?.flatMap(pkg => 
              pkg.services?.flatMap(service => 
                service.assignedVendors?.filter(vendor => vendor?.vendorName)
              ) || []
            ).filter(vendor => vendor) || [];
            
            // Get unique vendor names
            const uniqueVendors = [...new Set(vendors.map(v => v.vendorName))];

            return {
              slNo: index + 1,
              name: primaryPerson.name || 'Unknown',
              bookingId: quotation.quotationId,
              eventDetails: {
                name: firstPackage.categoryName || 'No Event',
                venue: firstPackage.venueName || 'No Venue'
              },
              date: firstPackage.eventStartDate || 'No Date',
              vendor: uniqueVendors.length > 0 ? uniqueVendors.join(', ') : '-',
              quotationData: quotation // Keep original data for navigation
            };
          });

          setFinishedEvents(transformedData);
        } else {
          toast.error("Failed to fetch finished events");
          setFinishedEvents([]);
        }
      } catch (error) {
        console.error("Error fetching finished events:", error);
        toast.error(error.response?.data?.message || "Failed to fetch finished events");
        setFinishedEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFinishedEvents();
  }, []);

  const handleRowClick = (quotation) => {
    // Navigate to booking details with the quotation ID
    navigate(`/booking/booking-details/${quotation.quotationData._id}`);
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>Loading...</div>;
  }

  return (
    <Container className="position-relative py-2 rounded" style={{ background: "#F4F4F4" }}>
      <Card className="border-0 p-3">
        <div className="d-flex gap-5 align-items-center justify-content-between p-2 rounded">
          <div className="d-flex gap-2 align-items-center w-50">
            <div className="w-100 bg-white d-flex gap-2 align-items-center px-2 rounded">
              <IoSearch size={16} className="text-muted" />
              <Form className="d-flex flex-grow-1">
                <Form.Group className="w-100">
                  <Form.Control
                    type="text"
                    placeholder="Search by name or booking ID"
                    style={{
                      paddingLeft: "4px",
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      fontSize: "14px",
                    }}
                  />
                </Form.Group>
              </Form>
            </div>
            <img src={sortIcon} alt="sortIcon" style={{ width: "25px", cursor: "pointer" }} />
            <img src={filterIcon} alt="filterIcon" style={{ width: "25px", cursor: "pointer" }} />
          </div>
          <div className="text-end">
            <Button
              variant="light-gray"
              className="btn rounded-5 bg-white border-2 shadow-sm"
              style={{ fontSize: "14px" }}
            >
              Download Excel
            </Button>
          </div>
        </div>

        <div className="table-responsive bg-white mt-3" style={{ maxHeight: "65vh", overflowY: "auto" }}>
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
              {finishedEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No finished events found
                  </td>
                </tr>
              ) : (
                finishedEvents.map((event, idx) => (
                  <tr
                    key={event.bookingId + idx}
                    style={{ fontSize: "12px" }}
                    className="fw-semibold text-center cursor-pointer"
                    onClick={() => handleRowClick(event)}
                  >
                    <td>{String(event.slNo).padStart(2, "0")}</td>
                    <td>{event.name}</td>
                    <td>{event.bookingId}</td>
                    <td className="d-flex flex-column">
                      {event.eventDetails.name}
                      <small className="text-muted">{event.eventDetails.venue}</small>
                    </td>
                    <td>{event.date}</td>
                    <td>{event.vendor}</td>
                    <td>
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

export default FinishedEvents;