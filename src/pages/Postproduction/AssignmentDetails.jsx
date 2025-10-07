import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Card, Button } from "react-bootstrap";
import dayjs from "dayjs"; // ✅ Import dayjs
import { API_URL } from "../../utils/api";

const AssignmentDetails = () => {
  const { assignmentId } = useParams();
  const [submissionDetails, setSubmissionDetails] = useState([]);
  const [vendorName, setVendorName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/task-submission/${assignmentId}`
        );

        if (
          res.data?.success &&
          Array.isArray(res.data.data) &&
          res.data.data.length > 0
        ) {
          const vendorData = res.data.data[0];
          setVendorName(vendorData.vendorName || "");
          setSubmissionDetails(vendorData.submissions || []);
        } else {
          setSubmissionDetails([]);
        }
      } catch (error) {
        console.error("Error fetching submission details:", error);
        setSubmissionDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [assignmentId]);

  if (loading) {
    return <p className="text-center mt-4">Loading submission details...</p>;
  }

  return (
    <div className="container py-4" style={{ fontSize: "13px" }}>
      <Card className="shadow-sm">
        <Card.Header
          className="fw-bold bg-dark text-white d-flex justify-content-between"
          style={{ fontSize: "14px", padding: "8px 12px" }}
        >
          <span>Submission Details - {vendorName}</span>
          <Button
            variant="light"
            size="sm"
            style={{ fontSize: "12px", padding: "2px 10px" }}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {submissionDetails.length > 0 ? (
            <Table
              bordered
              hover
              responsive
              style={{
                fontSize: "12px",
                textAlign: "center",
                marginBottom: "0",
              }}
            >
              <thead className="table-light">
                <tr>
                  <th>Sl.No</th>
                  <th>Date</th>
                  <th>Photos Submitted</th>
                  <th>Videos Submitted</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {submissionDetails.map((submission, idx) => (
                  <tr key={idx}>
                    <td>{String(idx + 1).padStart(2, "0")}</td>
                    <td>{dayjs(submission.submissionDate).format("DD-MM-YYYY")}</td>
                    <td>{submission.photosEdited}</td>
                    <td>{submission.videosEdited}</td>
                    <td>{submission.comment || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center p-3" style={{ fontSize: "12px" }}>
              No submissions found for this assignment.
            </p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AssignmentDetails;
