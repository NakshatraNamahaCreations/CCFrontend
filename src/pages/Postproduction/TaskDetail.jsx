import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Row, Col, Badge } from "react-bootstrap";

const TaskDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Retrieve event data from localStorage
  const storedData = JSON.parse(localStorage.getItem("eventTasks")) || [];
  const event = storedData.find((item) => item.id.toString() === eventId);

  // If event is not found, display a fallback message
  if (!event) {
    return (
      <div className="container py-4">
        <Card className="shadow-sm p-4 border-0">
          <h4 className="mb-3 text-dark fw-bold">Event Not Found</h4>
          <p className="text-muted">No event found for the specified ID.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Card className="shadow-sm p-4 border-0">
        <h4 className="mb-3 text-dark fw-bold">{event.event}</h4>
        <Row className="mb-3">
          <Col md={6}>
            <p className="mb-2">
              <strong>Service:</strong> {event.service || "N/A"}
            </p>
            <p className="mb-2">
              <strong>Vendor:</strong> {event.vendor || "N/A"}
            </p>
          </Col>
          <Col md={6}>
            <p className="mb-2">
              <strong>Submission Date:</strong> {event.subDate || "N/A"}
            </p>
          </Col>
        </Row>

        <h5 className="mt-4 mb-3">📝 Assigned Tasks</h5>
        <div
          className="table-responsive"
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            borderRadius: "0.5rem",
          }}
        >
          <Table bordered hover className="align-middle mb-0">
            <thead
              className="bg-dark text-white sticky-top"
              style={{ fontSize: "14px" }}
            >
              <tr>
                <th>Sl.no</th>
                <th>Task Name</th>
                <th style={{ width: "30%" }}>Description</th>
                <th>Date</th>
                <th style={{ width: "20%" }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {event.tasks?.length > 0 ? (
                event.tasks.map((task, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{task.taskTitle || "N/A"}</strong>
                    </td>
                    <td>{task.taskDescription || "N/A"}</td>
                    <td>
                      <Badge bg="light" text="dark">
                        {task.taskDate || "N/A"}
                      </Badge>
                    </td>
                    <td>{task.remarks || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No tasks available for this event.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default TaskDetail;