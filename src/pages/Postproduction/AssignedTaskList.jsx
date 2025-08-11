import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Card, Badge, Button } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import dayjs from "dayjs";
const AssignedTaskList = () => {
  const { eventId, serviceName } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, [eventId, serviceName]);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/task/assignments/${eventId}/${encodeURIComponent(serviceName)}`
      );
      if (res.data.success) {
        console.log("ass", res.data.assignments);
        setAssignments(res.data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (assignmentId) => {
    navigate(`/assignment-details/${assignmentId}`);
  };

  const showPhotos = serviceName.toLowerCase().includes("photo");
  const showVideos = serviceName.toLowerCase().includes("video");

  if (loading) {
    return <p className="text-center mt-4">Loading assignments...</p>;
  }

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Header className="fw-bold bg-dark text-white">
          Assigned Task for Event - {assignments[0]?.eventName || "N/A"} ({serviceName})
        </Card.Header>
        <Card.Body className="p-0">
          <Table bordered hover responsive className="mb-0" style={{ fontSize: "13px", textAlign: "center" }}>
            <thead className="table-light">
              <tr>
                <th>Sl.No</th>
                <th>Vendor Name</th>
                <th>Task Description</th>
                {showPhotos && <th>Photos Assigned</th>}
                {showVideos && <th>Videos Assigned</th>}
                <th>Completion Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? (
                assignments.map((task, index) => (
                  <tr key={task._id || index}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>{task.vendorName}</td>
                    <td>{task.taskDescription}</td>
                    {showPhotos && <td>{task.photosAssigned}</td>}
                    {showVideos && <td>{task.videosAssigned}</td>}
                    <td>{dayjs(task.completionDate).format("DD-MM-YYYY")}</td>
                    <td>
                      <Badge
                        bg={
                          task.status === "Completed"
                            ? "success"
                            : task.status === "InProgress"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {task.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleViewDetails(task._id)}
                      >
                        <FaEye />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showPhotos && showVideos ? "8" : "7"} className="text-muted">
                    No assignments found for this event and service.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AssignedTaskList;
