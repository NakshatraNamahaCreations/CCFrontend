import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Badge } from "react-bootstrap";
import dayjs from "dayjs";

const PostProductionDetail = () => {
  const { id } = useParams(); // doc id
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/collected-data/details/${id}`
      );
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const handleRowClick = (event) => {

    // console.log("id, eventId, eventName, totalPhots, totalVideos", data._id, event.eventId, event.eventName, event.noOfPhotos, event.noOfVideos, data?.quotationId);
    navigate(`/post-production/post-production-detail/assign-task`, {
      state: {
        id: data?._id,
        eventId: event.eventId,
        eventName: event.eventName,
        totalPhotos: event.noOfPhotos,
        totalVideos: event.noOfVideos,
        quotationId:data?.quotationId
      },
    });
  };

  if (!data) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="container py-4" style={{ fontSize: "13px" }}>
      {/* Quotation Info */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="fw-bold bg-dark text-white">
          Collected Data Details
        </Card.Header>
        <Card.Body>
          <div className="row mb-2">
            <div className="col-md-4">
              <strong>Quote ID:</strong> {data.quotationUniqueId}
            </div>
            <div className="col-md-4">
              <strong>Person Name:</strong> {data.personName}
            </div>
            <div className="col-md-4">
              <strong>System Number:</strong> {data.systemNumber}
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <strong>Total Photos:</strong> {data.totalPhotos}
            </div>
            <div className="col-md-4">
              <strong>Total Videos:</strong> {data.totalVideos}
            </div>
            <div className="col-md-4">
              <strong>Created At:</strong>{" "}
              {dayjs(data.createdAt).format("DD-MM-YYYY")}
              
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Event Details Table */}
      <Card className="shadow-sm">
        <Card.Header className="fw-bold bg-light">
          Event-wise Details
        </Card.Header>
        <Card.Body className="p-0">
          <Table
            bordered
            responsive
            hover
            className="mb-0"
            style={{ fontSize: "13px", cursor: "pointer" }}
          >
            <thead className="table-light">
              <tr>
                <th>Sl.No</th>
                <th>Event Name</th>
                <th>Camera Name</th>
                <th>Drive Size</th>
                <th>Filled Size</th>
                <th>Copying Person</th>
                <th>Copied Location</th>
                <th>Photos</th>
                <th>Videos</th>
                <th>Submission Date</th>
                <th>Notes</th>
                <th>Editing Status</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((ev, idx) => (
                <tr
                  key={ev._id}
                  onClick={() => handleRowClick(ev)}
                  style={{ transition: "background-color 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "")
                  }
                >
                  <td>{String(idx + 1).padStart(2, "0")}</td>
                  <td>{ev.eventName}</td>
                  <td>{ev.cameraName}</td>
                  <td>{ev.totalDriveSize}</td>
                  <td>{ev.filledSize}</td>
                  <td>{ev.copyingPerson}</td>
                  <td>{ev.copiedLocation}</td>
                  <td className="text-center">{ev.noOfPhotos}</td>
                  <td className="text-center">{ev.noOfVideos}</td>
                  <td> {dayjs(ev.submissionDate).format("DD-MM-YYYY")}</td>
                  <td>{ev.notes}</td>
                  <td className="text-center">
                    <Badge
                      bg={
                        ev.editingStatus === "Completed"
                          ? "success"
                          : ev.editingStatus === "In Process"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {ev.editingStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PostProductionDetail;
