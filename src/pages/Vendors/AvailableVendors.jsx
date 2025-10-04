// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { Card, Table, Button, Badge, Form } from "react-bootstrap";
// import { IoSearch } from "react-icons/io5";
// import { toast } from "react-toastify";
// import axios from "axios";
// import sortIcon from "../../assets/icons/sort.png";
// import filterIcon from "../../assets/icons/filter.png";

// const AvailableVendors = () => {
//   const location = useLocation();
//   const { serviceName } = useParams();
//   const navigate = useNavigate();

//   // now also receive serviceId & unitIndex from VendorAssign
//   const {
//     returnPath,
//     quotationId,
//     packageId,
//     serviceId,
//     unitIndex,
//     slot,
//     eventStartDate,
//     isReassign,
//   } = location.state || {};

//   const [vendors, setVendors] = useState([]);
//   const [loading, setLoading] = useState(false);

//   console.log("slot", slot);
//   console.log("eventStartDate", eventStartDate);

//   useEffect(() => {
//     // Validate inputs when assignment is intended
//     if (!quotationId || !packageId || !serviceId || unitIndex == null) {
//       toast.error("Missing IDs to assign vendor");
//       if (returnPath) navigate(returnPath);
//       return;
//     }

//     // const fetchVendors = async () => {
//     //   setLoading(true);
//     //   try {
//     //     const res = await axios.get(
//     //       `http://localhost:5000/api/vendors/service-name/${encodeURIComponent(
//     //         serviceName
//     //       )}`
//     //     );

//     //     if (res.data?.success) {
//     //       const allVendors = res.data.vendors || res.data.data || [];
//     //       setVendors(allVendors);
//     //       if (allVendors.length === 0) toast.warn("No vendors found");
//     //     } else {
//     //       toast.error("Failed to load vendors");
//     //     }
//     //   } catch (error) {
//     //     console.error("Fetch vendors error:", error);
//     //     toast.error("Error fetching vendors");
//     //   } finally {
//     //     setLoading(false);
//     //   }
//     // };

//     const fetchVendors = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/vendors/service-name/${encodeURIComponent(serviceName)}?date=${eventStartDate}&slot=${slot}`
//         );

//         if (res.data?.success) {
//           const availableVendors = res.data.data.availableVendors || [];
//           setVendors(availableVendors);
//           if (availableVendors.length === 0) {
//             toast.warn(`No available vendors for ${serviceName} on ${eventStartDate}`);
//           }
//         } else {
//           toast.error("Failed to load vendors");
//         }
//       } catch (error) {
//         console.error("Fetch vendors error:", error);
//         toast.error("Error fetching vendors");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchVendors();
//   }, [
//     navigate,
//     returnPath,
//     quotationId,
//     packageId,
//     serviceId,
//     unitIndex,
//     serviceName,
//   ]);

//   const handleAssignVendor = async (vendor) => {
//     try {
//       const url = `http://localhost:5000/api/quotations/${quotationId}/package/${packageId}/service/${serviceId}/unit/${unitIndex}/assign-vendor`;
//       const body = {
//         vendorId: vendor._id || vendor.id,
//         vendorName: vendor.name,
//         slot,
//         eventStartDate,
//       };
//       const res = await axios.put(url, body);

//       if (res.data?.success) {
//         toast.success("Vendor assigned successfully");
//         // navigate(returnPath || "/quotations");
//         navigate(-1);
//       } else {
//         toast.error(res.data?.message || "Failed to assign vendor");
//       }
//     } catch (error) {
//       console.error("Assign vendor error:", error?.response?.data || error);
//       toast.error(error?.response?.data?.message || "Error assigning vendor");
//     }
//   };

//   return (
//     <div
//       className="container py-2 rounded vh-100"
//       style={{ background: "#F4F4F4" }}
//     >
//       <div className="d-flex gap-2 align-items-center justify-content-between p-2 rounded">
//         <div className="w-50 d-flex gap-2 align-items-center">
//           <div className="w-50 bg-white d-flex gap-2 align-items-center p-2 rounded" style={{ fontWeight: "700" }}>
//             {serviceName}

//           </div>

//         </div>

//       </div>

//       <div className="container my-4">
//         <Card className="border-0 shadow-sm">
//           <Card.Body>
//             {loading ? (
//               <div>Loading vendors...</div>
//             ) : vendors.length === 0 ? (
//               <div className="text-center">No vendors available</div>
//             ) : (
//               <div className="table-responsive">
//                 <Table className="table table-hover align-middle">
//                   <thead className="text-white text-center">
//                     <tr>
//                       <th style={{ fontSize: 14 }}>Profile</th>
//                       <th style={{ fontSize: 14 }}>Vendor Name</th>
//                       <th style={{ fontSize: 14 }}>Phone Number</th>
//                       <th style={{ fontSize: 14}}>Expertise</th>
//                       <th style={{ fontSize: 14 }}>Experience</th>
//                       <th style={{ fontSize: 14 }}>Source</th>
//                       <th style={{ fontSize: 14 }}>Salary</th>
//                       <th style={{ fontSize: 14 }}>Status</th>
//                       <th style={{ fontSize: 14 }}>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {console.log("vendors", vendors)}
//                     {vendors.map((vendor) => {

//                       const specialization = vendor.specialization.find(
//                         (item) => item.name === serviceName
//                       );

//                       console.log(specialization?.salary); // salary if found

//                       return (<tr
//                         key={vendor._id || vendor.id}
//                         className="text-center fw-semibold"
//                         style={{ fontSize: 12 }}
//                       >
//                         <td>
//                           <img
//                             src={
//                               vendor.profile ||
//                               "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
//                             }
//                             alt="Profile"
//                             className="rounded-circle"
//                             style={{
//                               width: 40,
//                               height: 40,
//                               objectFit: "cover",
//                             }}
//                           />
//                         </td>
//                         <td>{vendor.name}</td>
//                         <td>{vendor.phoneNo}</td>

//                         <td>{vendor.designation}</td>
//                         <td>{vendor.expertiseLevel}</td>
//                         <td>{vendor.category}</td>
//                         <td>{specialization?.salary}</td>
//                         <td>
//                           <Badge bg="success">Available</Badge>
//                         </td>
//                         <td>
//                           <Button
//                             variant="light"
//                             className="btn-sm text-black fw-bold"
//                             onClick={() => handleAssignVendor(vendor)}
//                             disabled={
//                               !quotationId ||
//                               !packageId ||
//                               !serviceId ||
//                               unitIndex == null
//                             }
//                           >
//                             Assign
//                           </Button>
//                         </td>
//                       </tr>)
//                     }
//                     )}
//                   </tbody>
//                 </Table>
//               </div>
//             )}
//           </Card.Body>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default AvailableVendors;

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, Table, Button, Badge, Form } from "react-bootstrap";
import { IoSearch } from "react-icons/io5";
import { toast } from "react-toastify";
import axios from "axios";
import sortIcon from "../../assets/icons/sort.png";
import filterIcon from "../../assets/icons/filter.png";

const AvailableVendors = () => {
  const location = useLocation();
  const { serviceName } = useParams();
  const navigate = useNavigate();

  // now also receive serviceId & unitIndex from VendorAssign
  const {
    returnPath,
    quotationId,
    packageId,
    serviceId,
    unitIndex,
    slot,
    eventStartDate,
    eventEndDate,
    isReassign,
  } = location.state || {};

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log("slot", slot);
  console.log("eventStartDate", eventStartDate);

  useEffect(() => {
    // Validate inputs when assignment is intended
    if (!quotationId || !packageId || !serviceId || unitIndex == null) {
      toast.error("Missing IDs to assign vendor");
      if (returnPath) navigate(returnPath);
      return;
    }
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/vendors/service-name/${encodeURIComponent(
            serviceName
          )}?startDate=${eventStartDate}&endDate=${eventEndDate}&slot=${
            slot
          }`
        );
        if (res.data?.success) {
          const availableVendors = res.data.data.availableVendors || [];
          setVendors(availableVendors);
          if (availableVendors.length === 0) {
            toast.warn(
              `No available vendors for ${serviceName} between ${eventStartDate} and ${eventEndDate}`
            );
          }
        } else {
          toast.error("Failed to load vendors");
        }
      } catch (error) {
        console.error("Fetch vendors error:", error);
        toast.error("Error fetching vendors");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [
    navigate,
    returnPath,
    quotationId,
    packageId,
    serviceId,
    unitIndex,
    serviceName,
  ]);

  const handleAssignVendor = async (vendor) => {
    try {
      const url = `http://localhost:5000/api/quotations/${quotationId}/package/${packageId}/service/${serviceId}/unit/${unitIndex}/assign-vendor`;

      const body = {
        vendorId: vendor._id || vendor.id,
        vendorName: vendor.name,
        slot,
        eventStartDate,
        eventEndDate,
      };

      const res = await axios.put(url, body);

      if (res.data?.success) {
        toast.success("Vendor assigned successfully");
        navigate(-1);
      } else {
        toast.error(res.data?.message || "Failed to assign vendor");
      }
    } catch (error) {
      console.error("Assign vendor error:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Error assigning vendor");
    }
  };

  return (
    <div
      className="container py-2 rounded vh-100"
      style={{ background: "#F4F4F4" }}
    >
      <div className="d-flex gap-2 align-items-center justify-content-between p-2 rounded">
        <div className="w-50 d-flex gap-2 align-items-center">
          <div
            className="w-50 bg-white d-flex gap-2 align-items-center p-2 rounded"
            style={{ fontWeight: "700" }}
          >
            {serviceName}
          </div>
        </div>
      </div>

      <div className="container my-4">
        <Card className="border-0 shadow-sm">
          <Card.Body>
            {loading ? (
              <div>Loading vendors...</div>
            ) : vendors.length === 0 ? (
              <div className="text-center">No vendors available</div>
            ) : (
              <div className="table-responsive">
                <Table className="table table-hover align-middle">
                  <thead className="text-white text-center">
                    <tr>
                      <th style={{ fontSize: 14 }}>Profile</th>
                      <th style={{ fontSize: 14 }}>Vendor Name</th>
                      <th style={{ fontSize: 14 }}>Phone Number</th>
                      <th style={{ fontSize: 14 }}>Expertise</th>
                      <th style={{ fontSize: 14 }}>Experience</th>
                      <th style={{ fontSize: 14 }}>Source</th>
                      <th style={{ fontSize: 14 }}>Salary</th>
                      <th style={{ fontSize: 14 }}>Status</th>
                      <th style={{ fontSize: 14 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {console.log("vendors", vendors)}
                    {vendors.map((vendor) => {
                      const specialization = vendor.specialization.find(
                        (item) => item.name === serviceName
                      );

                      console.log(specialization?.salary); // salary if found

                      return (
                        <tr
                          key={vendor._id || vendor.id}
                          className="text-center fw-semibold"
                          style={{ fontSize: 12 }}
                        >
                          <td>
                            <img
                              src={
                                vendor.profile ||
                                "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                              }
                              alt="Profile"
                              className="rounded-circle"
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: "cover",
                              }}
                            />
                          </td>
                          <td>{vendor.name}</td>
                          <td>{vendor.phoneNo}</td>

                          <td>{vendor.designation}</td>
                          <td>{vendor.expertiseLevel}</td>
                          <td>{vendor.category}</td>
                          <td>{specialization?.salary}</td>
                          <td>
                            <Badge bg="success">Available</Badge>
                          </td>
                          <td>
                            <Button
                              variant="light"
                              className="btn-sm text-black fw-bold"
                              onClick={() => handleAssignVendor(vendor)}
                              disabled={
                                !quotationId ||
                                !packageId ||
                                !serviceId ||
                                unitIndex == null
                              }
                            >
                              Assign
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AvailableVendors;
