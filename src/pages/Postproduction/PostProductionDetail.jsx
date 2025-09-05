// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { Card, Table, Badge, Spinner, Alert } from "react-bootstrap";
// import dayjs from "dayjs";

// const PostProductionDetail = () => {
//   const { id } = useParams();
//   const [data, setData] = useState(null);
//   const [quotation, setQuotation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         // 1) collected-data details
//         const detailsRes = await axios.get(
//           `http://localhost:5000/api/collected-data/details/${id}`
//         );

//         if (detailsRes.data?.success && detailsRes.data?.data) {
//           const details = detailsRes.data.data;
//           setData(details);

//           // 2) quotation
//           if (details.quotationId) {
//             const quotationRes = await axios.get(
//               `http://localhost:5000/api/quotations/${details.quotationId}`
//             );
//             // API shape: { success: true, quotation: {...} }
//             if (quotationRes.data?.quotation) {
//               setQuotation(quotationRes.data.quotation);
//             }
//           }
//         } else {
//           setError(detailsRes.data?.message || "Failed to load data.");
//         }
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError("Failed to load data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id]);

//   // debug logs on state updates
//   useEffect(() => {
//     console.log("Data state updated:", data);
//   }, [data]);

//   useEffect(() => {
//     console.log("Quotation state updated:", quotation);
//   }, [quotation]);

//   const handleRowClick = (event) => {
//     if (!data) return;

//     navigate(`/post-production/post-production-detail/assign-task`, {
//       state: {
//         id: data._id,
//         eventId: event.eventId,
//         eventName: event.eventName,
//         totalPhotos: event.noOfPhotos,
//         totalVideos: event.noOfVideos,
//         quotationId: data.quotationId,
//         editingStatus: event.editingStatus
//       },
//     });
//   };

//   // --- helpers (put near the top of your file) ---
//   const fmt = (n) =>
//     n == null ? "-" : `₹${Number(n).toLocaleString()}`;

//   const asPlainObj = (maybeMap) => {
//     if (!maybeMap) return {};
//     if (maybeMap instanceof Map) return Object.fromEntries(maybeMap.entries());
//     if (typeof maybeMap === "object") return maybeMap;
//     return {};
//   };

//   const idToLabel = (sheetTypes = [], id) => {
//     const hit = sheetTypes.find((s) => s.id === id);
//     return hit?.label || id || "-";
//   };

//   // Build a concise “A: 2, B: 3 …” string from a qty map
//   const qtySummary = (qtyObj, sheetTypes) => {
//     const entries = Object.entries(qtyObj || {});
//     if (!entries.length) return "—";
//     return entries
//       .map(([k, v]) => `${idToLabel(sheetTypes, k)}: ${v}`)
//       .join(", ");
//   };


//   if (loading) {
//     return (
//       <div className="text-center py-4">
//         <Spinner animation="border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </Spinner>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container py-4">
//         <Alert variant="danger">{error}</Alert>
//       </div>
//     );
//   }

//   if (!data) {
//     return <div className="text-center py-4">No data found</div>;
//   }

//   return (
//     <div className="container py-4" style={{ fontSize: "13px" }}>
//       {/* Collected Data Details */}
//       <Card className="shadow-sm mb-4">
//         <Card.Header className="fw-bold bg-dark text-white">
//           Collected Data Details
//         </Card.Header>
//         <Card.Body>
//           <div className="row mb-2">
//             <div className="col-md-4">
//               <strong>Quote ID:</strong> {data.quotationUniqueId}
//             </div>
//             <div className="col-md-4">
//               <strong>Person Name:</strong> {data.personName}
//             </div>
//             <div className="col-md-4">
//               <strong>System Number:</strong> {data.systemNumber}
//             </div>
//           </div>
//           <div className="row">
//             <div className="col-md-4">
//               <strong>Total Photos:</strong> {data.totalPhotos}
//             </div>
//             <div className="col-md-4">
//               <strong>Total Videos:</strong> {data.totalVideos}
//             </div>
//             <div className="col-md-4">
//               <strong>Created At:</strong>{" "}
//               {dayjs(data.createdAt).format("DD-MM-YYYY")}
//             </div>
//           </div>
//         </Card.Body>
//       </Card>

//       {/* Albums (only if present in quotation) */}
//       {quotation?.albums?.length ? (
//         <Card className="shadow-sm mb-4">
//           <Card.Header className="fw-bold bg-light">Albums</Card.Header>
//           <Card.Body className="p-0">
//             <Table bordered responsive hover className="mb-0" style={{ fontSize: "13px" }}>
//               <thead className="table-light">
//                 <tr>
//                   <th>#</th>
//                   <th>Template</th>
//                   <th>Box</th>
//                   <th>Qty</th>
//                   <th>Album Unit Price</th>
//                   <th>Box / Unit</th>
//                   <th>Extras</th>
//                   {/* <th>Final / Unit</th>
//             <th>Final Total</th>
//             <th>Base</th>
//             <th>Saved</th> */}
//                 </tr>
//               </thead>
//               <tbody>
//                 {quotation.albums.map((alb, idx) => {
//                   const sheetTypes = alb?.snapshot?.sheetTypes || [];
//                   const sharedObj = asPlainObj(alb?.extras?.shared);
//                   const perUnitArr =
//                     Array.isArray(alb?.extras?.perUnit) ? alb.extras.perUnit : [];
//                   const finalPerUnit = Array.isArray(alb?.suggested?.finalPerUnit)
//                     ? alb.suggested.finalPerUnit
//                     : [];
//                   const albumOnlyPerUnit = Array.isArray(alb?.suggested?.albumOnlyPerUnit)
//                     ? alb.suggested.albumOnlyPerUnit
//                     : [];

//                   const hasPerUnit = !!alb?.customizePerUnit && perUnitArr.length;
//                   const extrasCell = hasPerUnit ? (
//                     <div className="small">
//                       <div className="fw-semibold mb-1">Per-unit extras</div>
//                       <Table bordered size="sm" className="mb-0">
//                         <thead>
//                           <tr>
//                             <th style={{ whiteSpace: "nowrap" }}>Unit #</th>
//                             {sheetTypes.map((t) => (
//                               <th key={t.id}>{t.label}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {perUnitArr.map((m, i) => {
//                             const mObj = asPlainObj(m);
//                             return (
//                               <tr key={i}>
//                                 <td className="text-center">{i + 1}</td>
//                                 {sheetTypes.map((t) => (
//                                   <td key={t.id} className="text-end">
//                                     {mObj?.[t.id] ?? 0}
//                                   </td>
//                                 ))}
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </Table>
//                     </div>
//                   ) : (
//                     <div className="small">
//                       <div className="fw-semibold">Shared extras</div>
//                       <div>{qtySummary(sharedObj, sheetTypes)}</div>
//                     </div>
//                   );

//                   return (
//                     <tr key={alb._id || idx}>
//                       <td>{String(idx + 1).padStart(2, "0")}</td>
//                       <td>
//                         <div className="fw-semibold">
//                           {alb?.snapshot?.templateLabel || alb?.templateId || "-"}
//                         </div>
//                         <div className="text-muted small">
//                           {alb?.snapshot?.baseSheets
//                             ? `${alb.snapshot.baseSheets} sheets • ${alb.snapshot.basePhotos ?? "-"} photos`
//                             : ""}
//                         </div>
//                       </td>
//                       <td>{alb?.snapshot?.boxLabel || alb?.boxTypeId || "-"}</td>
//                       <td className="text-center">{alb?.qty ?? 1}</td>
//                       <td className="text-end">{fmt(alb?.unitPrice)}</td>
//                       <td className="text-end">{fmt(alb?.suggested?.boxPerUnit)}</td>
//                       <td style={{ width: "30%" }}>{extrasCell}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </Table>
//           </Card.Body>
//         </Card>
//       ) : null}


//       {/* Event Details Table */}
//       <Card className="shadow-sm">
//         <Card.Header className="fw-bold bg-light">Event-wise Details</Card.Header>
//         <Card.Body className="p-0">
//           <Table
//             bordered
//             responsive
//             hover
//             className="mb-0"
//             style={{ fontSize: "13px", cursor: "pointer" }}
//           >
//             <thead className="table-light">
//               <tr>
//                 <th>Sl.No</th>
//                 <th>Event Name</th>
//                 <th>Camera Name</th>
//                 <th>Drive Size</th>
//                 <th>Filled Size</th>
//                 <th>Copying Person</th>
//                 <th>Copied Location</th>
//                 <th>Photos</th>
//                 <th>Videos</th>
//                 <th>Submission Date</th>
//                 <th>Notes</th>
//                 <th>Editing Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.events.map((ev, idx) => (
//                 <tr
//                   key={ev._id || idx}
//                   onClick={() => handleRowClick(ev)}
//                   style={{ transition: "background-color 0.2s" }}
//                   onMouseEnter={(e) =>
//                     (e.currentTarget.style.backgroundColor = "#f8f9fa")
//                   }
//                   onMouseLeave={(e) =>
//                     (e.currentTarget.style.backgroundColor = "")
//                   }
//                 >
//                   <td>{String(idx + 1).padStart(2, "0")}</td>
//                   <td>{ev.eventName}</td>
//                   <td>{ev.cameraName}</td>
//                   <td>{ev.totalDriveSize}</td>
//                   <td>{ev.filledSize}</td>
//                   <td>{ev.copyingPerson}</td>
//                   <td>{ev.copiedLocation}</td>
//                   <td className="text-center">{ev.noOfPhotos}</td>
//                   <td className="text-center">{ev.noOfVideos}</td>
//                   <td>{dayjs(ev.submissionDate).format("DD-MM-YYYY")}</td>
//                   <td>{ev.notes}</td>
//                   <td className="text-center">
//                     <Badge
//                       bg={
//                         ev.editingStatus === "Completed"
//                           ? "success"
//                           : ev.editingStatus === "In Process"
//                             ? "warning"
//                             : "secondary"
//                       }
//                     >
//                       {ev.editingStatus}
//                     </Badge>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default PostProductionDetail;


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Badge, Spinner, Alert, Button } from "react-bootstrap"; // <-- Button added
import dayjs from "dayjs";

const PostProductionDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false); // <-- NEW
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const detailsRes = await axios.get(
          `http://localhost:5000/api/collected-data/details/${id}`
        );

        if (detailsRes.data?.success && detailsRes.data?.data) {
          const details = detailsRes.data.data;
          setData(details);

          if (details.quotationId) {
            const quotationRes = await axios.get(
              `http://localhost:5000/api/quotations/${details.quotationId}`
            );
            if (quotationRes.data?.quotation) {
              setQuotation(quotationRes.data.quotation);
            }
          }
        } else {
          setError(detailsRes.data?.message || "Failed to load data.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);


  const handleRowClick = (event) => {
    if (!data) return;
    navigate(`/post-production/post-production-detail/assign-task`, {
      state: {
        id: data._id,
        eventId: event.eventId,
        eventName: event.eventName,
        totalPhotos: event.noOfPhotos,
        totalVideos: event.noOfVideos,
        quotationId: data.quotationId,
        editingStatus: event.editingStatus,
      },
    });
  };

  // --- helpers ---
  const fmt = (n) => (n == null ? "-" : `₹${Number(n).toLocaleString()}`);
  const asPlainObj = (maybeMap) => {
    if (!maybeMap) return {};
    if (maybeMap instanceof Map) return Object.fromEntries(maybeMap.entries());
    if (typeof maybeMap === "object") return maybeMap;
    return {};
  };
  const idToLabel = (sheetTypes = [], id) => {
    const hit = sheetTypes.find((s) => s.id === id);
    return hit?.label || id || "-";
  };
  const qtySummary = (qtyObj, sheetTypes) => {
    const entries = Object.entries(qtyObj || {});
    if (!entries.length) return "—";
    return entries.map(([k, v]) => `${idToLabel(sheetTypes, k)}: ${v}`).join(", ");
  };

  // --- NEW: mark booking as completed ---
  const handleMarkCompleted = async () => {
    const id = data.quotationId
    console.log("id", id)

    if (!id) return alert("Quotation identifier not available.");

    console.log("identifier", id)

    if (!window.confirm("Mark this booking as Completed?")) return;

    try {
      setMarking(true);
      // Endpoint below in the backend section
      const res = await axios.put(
        `http://localhost:5000/api/quotations/${id}/booking-status`,
        { status: "Completed" }
      );
      if (res.data?.success) {
        setQuotation((q) => ({ ...q, bookingStatus: "Completed" }));
      } else {
        alert(res.data?.message || "Failed to update booking status.");
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e.message || "Failed to update booking status.");
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-4">No data found</div>;
  }

  return (
    <div className="container py-4" style={{ fontSize: "13px" }}>
      {/* Collected Data Details */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center fw-bold bg-dark text-white">
          <span>Collected Data Details</span>

          {/* --- NEW: Mark as Completed button --- */}
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-secondary p-2" style={{fontSize:"14px"}}>
              Status: {quotation?.bookingStatus || "—"}
            </span>
            <Button
              size="sm"
              variant="success"
              onClick={handleMarkCompleted}
              disabled={marking || (quotation?.bookingStatus === "Completed")}
            >
              {marking ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Updating…
                </>
              ) : (
                "Mark as Completed"
              )}
            </Button>
          </div>
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

      {/* Albums (only if present in quotation) */}
      {quotation?.albums?.length ? (
        <Card className="shadow-sm mb-4">
          <Card.Header className="fw-bold bg-light">Albums</Card.Header>
          <Card.Body className="p-0">
            <Table bordered responsive hover className="mb-0" style={{ fontSize: "13px" }}>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Template</th>
                  <th>Box</th>
                  <th>Qty</th>
                  <th>Album Unit Price</th>
                  <th>Box / Unit</th>
                  <th>Extras</th>
                </tr>
              </thead>
              <tbody>
                {quotation.albums.map((alb, idx) => {
                  const sheetTypes = alb?.snapshot?.sheetTypes || [];
                  const sharedObj = asPlainObj(alb?.extras?.shared);
                  const perUnitArr = Array.isArray(alb?.extras?.perUnit) ? alb.extras.perUnit : [];
                  const hasPerUnit = !!alb?.customizePerUnit && perUnitArr.length;

                  const extrasCell = hasPerUnit ? (
                    <div className="small">
                      <div className="fw-semibold mb-1">Per-unit extras</div>
                      <Table bordered size="sm" className="mb-0">
                        <thead>
                          <tr>
                            <th style={{ whiteSpace: "nowrap" }}>Unit #</th>
                            {sheetTypes.map((t) => (
                              <th key={t.id}>{t.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {perUnitArr.map((m, i) => {
                            const mObj = asPlainObj(m);
                            return (
                              <tr key={i}>
                                <td className="text-center">{i + 1}</td>
                                {sheetTypes.map((t) => (
                                  <td key={t.id} className="text-end">
                                    {mObj?.[t.id] ?? 0}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="small">
                      <div className="fw-semibold">Shared extras</div>
                      <div>{qtySummary(sharedObj, sheetTypes)}</div>
                    </div>
                  );

                  return (
                    <tr key={alb._id || idx}>
                      <td>{String(idx + 1).padStart(2, "0")}</td>
                      <td>
                        <div className="fw-semibold">
                          {alb?.snapshot?.templateLabel || alb?.templateId || "-"}
                        </div>
                        <div className="text-muted small">
                          {alb?.snapshot?.baseSheets
                            ? `${alb.snapshot.baseSheets} sheets • ${alb.snapshot.basePhotos ?? "-"} photos`
                            : ""}
                        </div>
                      </td>
                      <td>{alb?.snapshot?.boxLabel || alb?.boxTypeId || "-"}</td>
                      <td className="text-center">{alb?.qty ?? 1}</td>
                      <td className="text-end">{fmt(alb?.unitPrice)}</td>
                      <td className="text-end">{fmt(alb?.suggested?.boxPerUnit)}</td>
                      <td style={{ width: "30%" }}>{extrasCell}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : null}

      {/* Event Details Table */}
      <Card className="shadow-sm">
        <Card.Header className="fw-bold bg-light">Event-wise Details</Card.Header>
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
                  key={ev._id || idx}
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
                  <td>{dayjs(ev.submissionDate).format("DD-MM-YYYY")}</td>
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
