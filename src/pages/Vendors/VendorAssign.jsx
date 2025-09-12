// import React, { useState, useEffect } from "react";
// import { Card, Button, Table, Tooltip, OverlayTrigger } from "react-bootstrap";
// import { FaExchangeAlt } from "react-icons/fa";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import dayjs from "dayjs";
// import Select from "react-select";

// const VendorAssign = () => {
//   const { quotationId, packageId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const returnPath = location.state?.returnPath;

//   const [quotation, setQuotation] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // assistant options cache per serviceName
//   const [assistantOptionsMap, setAssistantOptionsMap] = useState({}); // { [serviceName]: [{id,name}] }
//   const [assistantLoadingMap, setAssistantLoadingMap] = useState({}); // { [serviceName]: boolean }

//   // fetch quotation once
//   useEffect(() => {
//     const fetchQuotation = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/quotations/${quotationId}`
//         );
//         if (res.data?.success && Array.isArray(res.data.quotation?.packages)) {
//           const pkg = res.data.quotation.packages.find(
//             (p) => p._id === packageId
//           );
//           if (!pkg) {
//             toast.error("Package not found");
//           } else {
//             setQuotation({ ...res.data.quotation, packages: [pkg] });
//           }
//         } else {
//           toast.error("Quotation or package data not found");
//         }
//       } catch (err) {
//         console.error("Fetch quotation error:", err);
//         toast.error("Failed to load quotation");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchQuotation();
//   }, [quotationId, packageId]);

//   // Derived data (NO hooks below -> avoids hook-order issues)
//   const pkg = quotation?.packages?.[0];
//   const services = pkg?.services ?? [];
//   const rows = services.flatMap((s) =>
//     Array.from({ length: Math.max(1, s.qty || 1) }, (_, unitIndex) => ({
//       service: s,
//       unitIndex,
//     }))
//   );

//   // Helper: candid-only
//   const isCandidService = (name = "") =>
//     name === "Candid Photographer" || name === "Candid Cinematographer";

//   // Prefetch assistant options for candid services in this package (using SAME endpoint as AvailableVendors)
//   useEffect(() => {
//     if (!pkg) return;

//     const uniqueCandid = Array.from(
//       new Set(
//         (pkg.services || [])
//           .filter((s) => isCandidService(s.serviceName))
//           .map((s) => s.serviceName)
//       )
//     );

//     const fetchFor = async (serviceName) => {
//       if (assistantOptionsMap[serviceName] || assistantLoadingMap[serviceName])
//         return;

//       setAssistantLoadingMap((m) => ({ ...m, [serviceName]: true }));
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/vendors/service-name/${encodeURIComponent(serviceName)}?date=${pkg.eventStartDate}`
//         );
//         const list = res.data?.vendors ?? res.data?.data ?? [];
//         const opts = list.map((v) => ({ id: v._id || v.id, name: v.name }));
//         setAssistantOptionsMap((m) => ({ ...m, [serviceName]: opts }));
//       } catch (err) {
//         console.error("Fetch assistants via vendor endpoint error:", err);
//         setAssistantOptionsMap((m) => ({ ...m, [serviceName]: [] }));
//       } finally {
//         setAssistantLoadingMap((m) => ({ ...m, [serviceName]: false }));
//       }
//     };

//     uniqueCandid.forEach(fetchFor);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pkg]);

//   const handleCheckVendor = (serviceId, unitIndex, serviceName, pkg) => {
//     navigate(`/vendors/available-vendors/${serviceName}`, {
//       state: {
//         quotationId,
//         packageId,
//         serviceId,
//         unitIndex,
//         slot: quotation?.packages[0]?.slot,
//         eventStartDate: quotation?.packages[0]?.eventStartDate,
//         returnPath: `/vendors/vendor-assign/${quotationId}/${packageId}`,
//         isReassign: true,
//       },
//     });
//   };

//   // NEW: react-select handler (selectedOption is {value,label} or null)
//   const handleAssistantSelect = async (
//     serviceId,
//     unitIndex,
//     serviceName,
//     selectedOption
//   ) => {
//     const assistantId = selectedOption?.value || null; // null when cleared
//     const assistantName = selectedOption?.label || "";

//     try {
//       await axios.put(
//         `http://localhost:5000/api/quotations/${
//           quotation._id || quotationId
//         }/package/${packageId}/service/${serviceId}/unit/${unitIndex}/assign-assistant`,
//         { assistantId, assistantName }
//       );

//       // reflect in UI
//       setQuotation((prev) => {
//         if (!prev) return prev;
//         const q = { ...prev, packages: [...prev.packages] };
//         const p0 = { ...q.packages[0] };
//         q.packages[0] = p0;

//         p0.services = p0.services.map((s) => {
//           if (s._id !== serviceId) return s;
//           const copy = { ...s };
//           const qty = Math.max(1, copy.qty || 1);
//           const arr = Array.isArray(copy.assignedAssistants)
//             ? [...copy.assignedAssistants]
//             : Array(qty).fill(null);
//           arr[unitIndex] = assistantId ? { assistantId, assistantName } : null; // allow clearing
//           copy.assignedAssistants = arr;
//           return copy;
//         });
//         return q;
//       });

//       toast.success(
//         assistantId
//           ? `Assistant assigned: ${assistantName || "Updated"}`
//           : "Assistant cleared"
//       );
//     } catch (err) {
//       console.error("Assign assistant error:", err);
//       toast.error("Failed to assign assistant");
//     }
//   };

//   if (loading || !quotation) {
//     return <div className="text-center mt-5">Loading...</div>;
//   }

//   const customer = quotation.leadId?.persons?.[0] || {};
//   const quotationIdStr = quotation.quotationId || quotation._id;

//   // Simple react-select styling so menu overlays the table nicely
//   const selectStyles = {
//     menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//     container: (base) => ({ ...base, minWidth: 200 }),
//   };

//   return (
//     <div className="container py-2">
//       <div className="container my-4">
//         {/* Customer Info */}
//         <Card
//           className="p-3 mb-3 border-0 shadow-sm"
//           style={{ background: "#F4F4F4" }}
//         >
//           <div className="d-flex justify-content-between align-items-center pb-3">
//             <h5>Customer Details</h5>
//           </div>
//           <div className="row px-3">
//             <div className="col-md-6" style={{ fontSize: "14px" }}>
//               <p>
//                 <strong>Quotation ID:</strong> {quotationIdStr}
//               </p>
//               <p>
//                 <strong>Name:</strong> {customer.name || "-"}
//               </p>
//               <p>
//                 <strong>Phone no:</strong> {customer.phoneNo || "-"}
//               </p>
//               <p>
//                 <strong>Whatsapp no:</strong> {customer.whatsappNo || "-"}
//               </p>
//               <p>
//                 <strong>Email:</strong> {customer.email || "-"}
//               </p>
//             </div>
//             <div className="col-md-6" style={{ fontSize: "14px" }}>
//               <p>
//                 <strong>Event Start Date:</strong>{" "}
//                 {pkg?.eventStartDate
//                   ? dayjs(pkg.eventStartDate).format("DD-MM-YYYY")
//                   : "-"}
//               </p>
//               <p>
//                 <strong>Event End Date:</strong>{" "}
//                 {pkg?.eventEndDate
//                   ? dayjs(pkg.eventEndDate).format("DD-MM-YYYY")
//                   : "-"}
//               </p>
//               <p>
//                 <strong>Slot:</strong> {pkg?.slot || "-"}
//               </p>
//               <p>
//                 <strong>Venue Name:</strong> {pkg?.venueName || "-"}
//               </p>
//               <p>
//                 <strong>Venue Address:</strong> {pkg?.venueAddress || "-"}
//               </p>
//             </div>
//           </div>
//         </Card>

//         {/* Vendor Assignment Table */}
//         <Card className="border-0 p-3">
//           <div
//             className="table-responsive bg-white mt-3"
//             style={{ maxHeight: "65vh", overflowY: "auto" }}
//           >
//             <Table className="table table-hover align-middle">
//               <thead
//                 className="text-white sticky-top"
//                 style={{ fontSize: "14px" }}
//               >
//                 <tr>
//                   <th>SI. No.</th>
//                   <th>Service</th>
//                   <th>Price</th>
//                   <th className="text-center">Assigned Vendor</th>
//                   <th className="text-center">Assistant</th>
//                 </tr>
//               </thead>
//               <tbody style={{ fontSize: "12px" }} className="fw-semibold">
//                 {rows.map(({ service, unitIndex }, rowIdx) => {
//                   const assignedVendor = Array.isArray(service.assignedVendors)
//                     ? service.assignedVendors[unitIndex]
//                     : service.assignedVendor;

//                   const isCandid = isCandidService(service.serviceName);
//                   const currentAssistant = Array.isArray(
//                     service.assignedAssistants
//                   )
//                     ? service.assignedAssistants[unitIndex]
//                     : null;

//                   const asstRaw =
//                     assistantOptionsMap[service.serviceName] || [];
//                   const asstOptions = asstRaw.map((a) => ({
//                     value: a.id,
//                     label: a.name,
//                   }));
//                   const asstLoading =
//                     !!assistantLoadingMap[service.serviceName];

//                   // Current value object for react-select
//                   const currentValue = currentAssistant?.assistantId
//                     ? {
//                         value: currentAssistant.assistantId,
//                         label:
//                           currentAssistant.assistantName ||
//                           asstRaw.find(
//                             (a) => a.id === currentAssistant.assistantId
//                           )?.name ||
//                           "Selected assistant",
//                       }
//                     : null;

//                   return (
//                     <tr key={`${service._id}-${unitIndex}`}>
//                       <td>{String(rowIdx + 1).padStart(2, "0")}</td>
//                       <td>
//                         {service.serviceName}
//                         {service.qty > 1 && (
//                           <span className="text-muted ms-2">
//                             (unit {unitIndex + 1} of {service.qty})
//                           </span>
//                         )}
//                       </td>
//                       <td>₹{service.price}</td>
//                       <td>
//                         {assignedVendor?.vendorName ? (
//                           <div className="d-flex justify-content-center align-items-center gap-2">
//                             <span className="text-success fw-bold">
//                               {assignedVendor.vendorName}
//                               {assignedVendor.category ? (
//                                 <span className="text-muted ms-1">
//                                   ({assignedVendor.category})
//                                 </span>
//                               ) : null}
//                             </span>
//                             <OverlayTrigger
//                               placement="top"
//                               overlay={
//                                 <Tooltip id="tooltip-top">
//                                   Reassign Vendor
//                                 </Tooltip>
//                               }
//                             >
//                               <Button
//                                 onClick={() =>
//                                   handleCheckVendor(
//                                     service._id,
//                                     unitIndex,
//                                     service.serviceName
//                                   )
//                                 }
//                                 variant="light"
//                                 className="btn-sm text-black fw-bold d-flex align-items-center gap-1"
//                               >
//                                 <FaExchangeAlt style={{ fontSize: "12px" }} />
//                               </Button>
//                             </OverlayTrigger>
//                           </div>
//                         ) : (
//                           <div className="text-center">
//                             <Button
//                               onClick={() =>
//                                 handleCheckVendor(
//                                   service._id,
//                                   unitIndex,
//                                   service.serviceName
//                                 )
//                               }
//                               variant="light"
//                               className="btn-sm text-black fw-bold"
//                             >
//                               Check Vendor
//                             </Button>
//                           </div>
//                         )}
//                       </td>

//                       {/* Assistant column (react-select) */}
//                       <td>
//                         {isCandid ? (
//                           <Select
//                             value={currentValue}
//                             onChange={(opt) =>
//                               handleAssistantSelect(
//                                 service._id,
//                                 unitIndex,
//                                 service.serviceName,
//                                 opt
//                               )
//                             }
//                             options={asstOptions}
//                             isClearable
//                             isLoading={asstLoading}
//                             placeholder={
//                               asstLoading
//                                 ? "Loading assistants..."
//                                 : "Assign Assistant"
//                             }
//                             menuPortalTarget={document.body}
//                             styles={selectStyles}
//                           />
//                         ) : (
//                           <div className="text-muted text-center">—</div>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </Table>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default VendorAssign;




import React, { useState, useEffect } from "react";
import { Card, Button, Table, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FaExchangeAlt } from "react-icons/fa";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import Select from "react-select";

const VendorAssign = () => {
  const { quotationId, packageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = location.state?.returnPath;

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  // assistant options cache per serviceName
  const [assistantOptionsMap, setAssistantOptionsMap] = useState({});
  const [assistantLoadingMap, setAssistantLoadingMap] = useState({});

  // fetch quotation once
  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/quotations/${quotationId}`
        );
        if (res.data?.success && Array.isArray(res.data.quotation?.packages)) {
          const pkg = res.data.quotation.packages.find(
            (p) => p._id === packageId
          );
          if (!pkg) {
            toast.error("Package not found");
          } else {
            setQuotation({ ...res.data.quotation, packages: [pkg] });
          }
        } else {
          toast.error("Quotation or package data not found");
        }
      } catch (err) {
        console.error("Fetch quotation error:", err);
        toast.error("Failed to load quotation");
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [quotationId, packageId]);

  // Derived data
  const pkg = quotation?.packages?.[0];
  const services = pkg?.services ?? [];
  const rows = services.flatMap((s) =>
    Array.from({ length: Math.max(1, s.qty || 1) }, (_, unitIndex) => ({
      service: s,
      unitIndex,
    }))
  );

  // Helper: candid-only
  const isCandidService = (name = "") =>
    name === "Candid Photographer" || name === "Candid Cinematographer";

  // Prefetch assistant options for candid services
  useEffect(() => {
    if (!pkg) return;

    const uniqueCandid = Array.from(
      new Set(
        (pkg.services || [])
          .filter((s) => isCandidService(s.serviceName))
          .map((s) => s.serviceName)
      )
    );

    const fetchFor = async (serviceName) => {
      if (assistantOptionsMap[serviceName] || assistantLoadingMap[serviceName])
        return;

      setAssistantLoadingMap((m) => ({ ...m, [serviceName]: true }));
      try {
        const res = await axios.get(
          `http://localhost:5000/api/vendors/service-name/${encodeURIComponent(
            serviceName
          )}?date=${pkg.eventStartDate}&slot=${pkg.slot}`
        );

        // ✅ FIX: use availableVendors array
        const list = res.data?.data?.availableVendors ?? [];
        const opts = list.map((v) => ({ id: v._id, name: v.name }));

        setAssistantOptionsMap((m) => ({ ...m, [serviceName]: opts }));
      } catch (err) {
        console.error("Fetch assistants via vendor endpoint error:", err);
        setAssistantOptionsMap((m) => ({ ...m, [serviceName]: [] }));
      } finally {
        setAssistantLoadingMap((m) => ({ ...m, [serviceName]: false }));
      }
    };

    uniqueCandid.forEach(fetchFor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg]);

  const handleCheckVendor = (serviceId, unitIndex, serviceName) => {
    navigate(`/vendors/available-vendors/${serviceName}`, {
      state: {
        quotationId,
        packageId,
        serviceId,
        unitIndex,
        slot: quotation?.packages[0]?.slot,
        eventStartDate: quotation?.packages[0]?.eventStartDate,
        returnPath: `/vendors/vendor-assign/${quotationId}/${packageId}`,
        isReassign: true,
      },
    });
  };

  // Assistant assign handler
  // Assistant assign handler
  const handleAssistantSelect = async (
    serviceId,
    unitIndex,
    serviceName,
    selectedOption
  ) => {
    const assistantId = selectedOption?.value || null;
    const assistantName = selectedOption?.label || "";

    try {
      await axios.put(
        `http://localhost:5000/api/quotations/${quotationId}/package/${packageId}/service/${serviceId}/unit/${unitIndex}/assign-assistant`, { assistantId, assistantName, eventStartDate: pkg.eventStartDate, slot: pkg.slot }
      );

      // reflect in UI
      setQuotation((prev) => {
        if (!prev) return prev;
        const q = { ...prev, packages: [...prev.packages] };
        const p0 = { ...q.packages[0] };
        q.packages[0] = p0;

        p0.services = p0.services.map((s) => {
          if (s._id !== serviceId) return s;
          const copy = { ...s };
          const qty = Math.max(1, copy.qty || 1);
          const arr = Array.isArray(copy.assignedAssistants)
            ? [...copy.assignedAssistants]
            : Array(qty).fill(null);
          arr[unitIndex] = assistantId ? { assistantId, assistantName } : null;
          copy.assignedAssistants = arr;
          return copy;
        });
        return q;
      });

      toast.success(
        assistantId
          ? `Assistant assigned: ${assistantName || "Updated"}`
          : "Assistant cleared"
      );

      // 🔄 Re-fetch available vendors after assistant change
      if (serviceName && pkg?.eventStartDate && pkg?.slot) {
        setAssistantLoadingMap((m) => ({ ...m, [serviceName]: true }));
        try {
          const res = await axios.get(
            `http://localhost:5000/api/vendors/service-name/${encodeURIComponent(
              serviceName
            )}?date=${pkg.eventStartDate}&slot=${pkg.slot}`
          );

          const list = res.data?.data?.availableVendors ?? [];
          const opts = list.map((v) => ({ id: v._id, name: v.name }));

          setAssistantOptionsMap((m) => ({ ...m, [serviceName]: opts }));
        } catch (err) {
          console.error("Re-fetch assistants error:", err);
          setAssistantOptionsMap((m) => ({ ...m, [serviceName]: [] }));
        } finally {
          setAssistantLoadingMap((m) => ({ ...m, [serviceName]: false }));
        }
      }
    } catch (err) {
      console.error("Assign assistant error:", err);
      toast.error("Failed to assign assistant");
    }
  };

  if (loading || !quotation) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  const customer = quotation.leadId?.persons?.[0] || {};
  const quotationIdStr = quotation.quotationId || quotation._id;

  const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    container: (base) => ({ ...base, minWidth: 200 }),
  };

  return (
    <div className="container py-2">
      <div className="container my-4">
        {/* Customer Info */}
        <Card className="p-3 mb-3 border-0 shadow-sm" style={{ background: "#F4F4F4" }}>
          <div className="d-flex justify-content-between align-items-center pb-3">
            <h5>Customer Details</h5>
          </div>
          <div className="row px-3">
            <div className="col-md-6" style={{ fontSize: "14px" }}>
              <p><strong>Quotation ID:</strong> {quotationIdStr}</p>
              <p><strong>Name:</strong> {customer.name || "-"}</p>
              <p><strong>Phone no:</strong> {customer.phoneNo || "-"}</p>
              <p><strong>Whatsapp no:</strong> {customer.whatsappNo || "-"}</p>
              <p><strong>Email:</strong> {customer.email || "-"}</p>
            </div>
            <div className="col-md-6" style={{ fontSize: "14px" }}>
              <p><strong>Event Start Date:</strong> {pkg?.eventStartDate ? dayjs(pkg.eventStartDate).format("DD-MM-YYYY") : "-"}</p>
              <p><strong>Event End Date:</strong> {pkg?.eventEndDate ? dayjs(pkg.eventEndDate).format("DD-MM-YYYY") : "-"}</p>
              <p><strong>Slot:</strong> {pkg?.slot || "-"}</p>
              <p><strong>Venue Name:</strong> {pkg?.venueName || "-"}</p>
              <p><strong>Venue Address:</strong> {pkg?.venueAddress || "-"}</p>
            </div>
          </div>
        </Card>

        {/* Vendor Assignment Table */}
        <Card className="border-0 p-3">
          <div className="table-responsive bg-white mt-3" style={{ maxHeight: "65vh", overflowY: "auto" }}>
            <Table className="table table-hover align-middle">
              <thead className="text-white sticky-top" style={{ fontSize: "14px" }}>
                <tr>
                  <th>SI. No.</th>
                  <th>Service</th>
                  <th>Price</th>
                  <th className="text-center">Assigned Vendor</th>
                  <th className="text-center">Assistant</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "12px" }} className="fw-semibold">
                {rows.map(({ service, unitIndex }, rowIdx) => {
                  const assignedVendor = Array.isArray(service.assignedVendors)
                    ? service.assignedVendors[unitIndex]
                    : service.assignedVendor;

                  const isCandid = isCandidService(service.serviceName);
                  const currentAssistant = Array.isArray(service.assignedAssistants)
                    ? service.assignedAssistants[unitIndex]
                    : null;

                  const asstRaw = assistantOptionsMap[service.serviceName] || [];
                  const asstOptions = asstRaw.map((a) => ({
                    value: a.id,
                    label: a.name,
                  }));
                  const asstLoading = !!assistantLoadingMap[service.serviceName];

                  const currentValue = currentAssistant?.assistantId
                    ? {
                      value: currentAssistant.assistantId,
                      label:
                        currentAssistant.assistantName ||
                        asstRaw.find((a) => a.id === currentAssistant.assistantId)?.name ||
                        "Selected assistant",
                    }
                    : null;

                  return (
                    <tr key={`${service._id}-${unitIndex}`}>
                      <td>{String(rowIdx + 1).padStart(2, "0")}</td>
                      <td>
                        {service.serviceName}
                        {service.qty > 1 && (
                          <span className="text-muted ms-2">
                            (unit {unitIndex + 1} of {service.qty})
                          </span>
                        )}
                      </td>
                      <td>₹{service.price}</td>
                      <td>
                        {assignedVendor?.vendorName ? (
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            <span className="text-success fw-bold">
                              {assignedVendor.vendorName}
                              {assignedVendor.category && (
                                <span className="text-muted ms-1">
                                  ({assignedVendor.category})
                                </span>
                              )}
                            </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip id="tooltip-top">Reassign Vendor</Tooltip>}
                            >
                              <Button
                                onClick={() => handleCheckVendor(service._id, unitIndex, service.serviceName)}
                                variant="light"
                                className="btn-sm text-black fw-bold d-flex align-items-center gap-1"
                              >
                                <FaExchangeAlt style={{ fontSize: "12px" }} />
                              </Button>
                            </OverlayTrigger>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Button
                              onClick={() => handleCheckVendor(service._id, unitIndex, service.serviceName)}
                              variant="light"
                              className="btn-sm text-black fw-bold"
                            >
                              Check Vendor
                            </Button>
                          </div>
                        )}
                      </td>

                      {/* Assistant column */}
                      <td>
                        {isCandid ? (
                          <Select
                            value={currentValue}
                            onChange={(opt) =>
                              handleAssistantSelect(service._id, unitIndex, service.serviceName, opt)
                            }
                            options={asstOptions}
                            isClearable
                            isLoading={asstLoading}
                            placeholder={asstLoading ? "Loading assistants..." : "Assign Assistant"}
                            menuPortalTarget={document.body}
                            styles={selectStyles}
                          />
                        ) : (
                          <div className="text-muted text-center">—</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorAssign;
