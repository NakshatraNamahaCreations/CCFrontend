import React, { useState, useEffect } from "react";
import { Card, Button, Table, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FaExchangeAlt } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

const VendorAssign = () => {
  const { quotationId, packageId } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/quotations/${quotationId}`);
        console.log("API response:", res.data);

        // Use res.data.quotation instead of res.data.data
        if (res.data.success && res.data.quotation && Array.isArray(res.data.quotation.packages)) {
          const pkg = res.data.quotation.packages.find(p => p._id === packageId);
          if (!pkg) {
            toast.error("Package not found");
            setLoading(false);
            return;
          }
          setQuotation({ ...res.data.quotation, packages: [pkg] });

        } else {
          toast.error("Quotation or package data not found");
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Fetch quotation error:", error);
        toast.error("Failed to load quotation");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [quotationId, packageId]);

  const handleCheckVendor = (serviceName) => {
    console.log('Navigating to:', serviceName); // Debug

    navigate(`/vendors/available-vendors/${serviceName}`, {
      state: {
        quotationId,
        packageId,
        returnPath: `/vendors/vendor-assign/${quotationId}/${packageId}`,
        isReassign: true,
      }
    });
  }
 

  if (loading || !quotation) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  const customer = quotation.leadId?.persons?.[0] || {};
  const pkg = quotation.packages[0];
  const quotationIdStr = quotation.quotationId || quotation._id;

  return (
    <div className="container py-2">
      <div className="container my-4">
        {/* Customer Info */}
        <Card className="p-3 mb-3 border-0 shadow-sm" style={{ background: "#F4F4F4" }}>
          <div className="d-flex justify-content-between align-items-center pb-3">
            <h5>Customer Details</h5>
            {/* Optionally add Edit details button here */}
          </div>
          <div className="row px-3">
            <div className="col-md-6" style={{ fontSize: "14px" }}>
              <p>
                <strong>Quotation ID:</strong> {quotationIdStr}
              </p>
              <p>
                <strong>Name:</strong> {customer.name || "-"}
              </p>
              <p>
                <strong>Phone no:</strong> {customer.phoneNo || "-"}
              </p>
              <p>
                <strong>Whatsapp no:</strong> {customer.whatsappNo || "-"}
              </p>
              <p>
                <strong>Email:</strong> {customer.email || "-"}
              </p>
            </div>
            <div className="col-md-6" style={{ fontSize: "14px" }}>
              <p>
                <strong>Event Start Date:</strong> {dayjs(pkg.eventStartDate).format("DD-MM-YYYY") || "-"}
              </p>
              <p>
                <strong>Event End Date:</strong> {dayjs(pkg.eventEndDate).format("DD-MM-YYYY") || "-"}
              </p>
              <p>
                <strong>Slot:</strong> {pkg.slot || "-"}
              </p>
              <p>
                <strong>Venue Name:</strong> {pkg.venueName || "-"}
              </p>
              <p>
                <strong>Venue Address:</strong> {pkg.venueAddress || "-"}
              </p>
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
                </tr>
              </thead>
              <tbody style={{ fontSize: "12px" }} className="fw-semibold">
                {pkg.services.map((service, idx) => (
                  <tr key={service._id}>
                    <td>{String(idx + 1).padStart(2, "0")}</td>
                    <td>{service.serviceName}</td>
                    <td>₹{service.price}</td>
                    <td>
                      {service.assignedVendor?.vendorName ? (
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <span className="text-success fw-bold">{service.assignedVendor.vendorName}</span>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">Reassign Vendor</Tooltip>}
                          >
                            <Button
                              onClick={() => handleCheckVendor(service.serviceName)}
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
                            onClick={() => handleCheckVendor(service.serviceName)}
                            variant="light"
                            className="btn-sm text-black fw-bold"
                          >
                            Check Vendor
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <div className="d-flex justify-content-end">
          <Button variant="dark" style={{ fontSize: "14px" }} onClick={() => navigate("/booking-list")}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorAssign;