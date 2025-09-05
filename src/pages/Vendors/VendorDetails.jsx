import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Multiselect } from "multiselect-react-dropdown";
import axios from "axios";
import { toast } from "react-hot-toast";

const VendorDetails = () => {
  const [vendorCat, setVendorCat] = useState("");
  const [showAadhaarMasked, setShowAadhaarMasked] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { category, vendorData } = location.state || {};

  const [specializationOptions, setSpecializationOptions] = useState([]);
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/service/all");
        if (res.data.success) {
          const specialization = res.data.data.map((service) => ({
            name: service.name,
            id: service._id,
          }));

          const staticSpecialization = [
            { name: "Driver", id: "46493" },
            // { name: "", id: "46493" },
          ];
          setSpecializationOptions([...specialization, ...staticSpecialization]);
          // setSpecializationOptions(
          //   res.data.data.map((service) => ({
          //     name: service.name,
          //     id: service._id,
          //     price: service.price,
          //     marginPrice: service.marginPrice
          //   }))
          // );
        }
      } catch (err) {
        console.error("Failed to fetch services", err);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory) {
      setVendorCat(savedCategory);
    } else if (category) {
      setVendorCat(category);
      localStorage.setItem("selectedCategory", category);
    }
  }, [category]);

  const expertiseLevelOptions = ["Beginner", "Intermediate", "Advanced"];

  const [vendorDetails, setVendorDetails] = useState({
    name: "",
    phoneNo: "",
    alternatePhoneNo: "",
    email: "",
    address: "",
    experience: "",
    designation: "",
    expertiseLevel: "",
    specialization: [],
    camera: "",
    otherEquipment: "",
    category: "",
    bankDetails: {
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      ifsc: "",
      branch: "",
      panNumber: "",
      aadhaarNumber: "",
    },
  });

  useEffect(() => {
    if (vendorData) {
      setVendorDetails({
        name: vendorData.name || "",
        phoneNo: vendorData.phoneNo || "",
        alternatePhoneNo: vendorData.alternatePhoneNo || "",
        email: vendorData.email || "",
        address: vendorData.address || "",
        experience: vendorData.experience || "",
        designation:
          vendorData.designation ||
          (Array.isArray(vendorData.services)
            ? vendorData.services[0]?.name
            : "") ||
          "",
        expertiseLevel: vendorData.expertiseLevel || "",
        specialization: vendorData.services || [],
        camera: vendorData.camera || "",
        otherEquipment: vendorData.otherEquipment || "",
        category: vendorData.category || "",
        bankDetails: {
          bankName: vendorData.bankDetails?.bankName || "",
          accountHolder: vendorData.bankDetails?.accountHolder || "",
          accountNumber: vendorData.bankDetails?.accountNumber || "",
          ifsc: vendorData.bankDetails?.ifsc || "",
          branch: vendorData.bankDetails?.branch || "",
          panNumber: vendorData.bankDetails?.panNumber || "",
          aadhaarNumber: vendorData.bankDetails?.aadhaarNumber || "",
        },
      });
      setVendorCat(
        vendorData.category === "Inhouse Vendor" ? "In house" : "Outsource"
      );
    } else {
      setVendorDetails((prev) => ({
        ...prev,
        category:
          vendorCat === "In house" ? "Inhouse Vendor" : "Outsource Vendor",
      }));
    }
  }, [vendorData, vendorCat]);

  const handleInputChange = (field, value) => {
    setVendorDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankInputChange = (field, value) => {
    setVendorDetails((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [field]: value },
    }));
  };

  const handleSpecializationSelect = (selectedList) => {
    setVendorDetails((prev) => ({ ...prev, specialization: selectedList }));
  };
  const handleSpecializationRemove = handleSpecializationSelect;
  const selectedSpecializationObjects = Array.isArray(
    vendorDetails.specialization
  )
    ? vendorDetails.specialization
    : [];

  const [selectedEquipment, setSelectedEquipment] = useState([]);

  const equipmentOptions = [
    { name: "Camera", id: 1 },
    { name: "Lens", id: 2 },
    { name: "Tripod", id: 3 },
    { name: "Flash", id: 4 },
    { name: "Reflector", id: 5 },
  ];

  const handleEquipmentSelect = (selectedList) => {
    setSelectedEquipment(
      selectedList.map((eq) => {
        const existing = selectedEquipment.find((e) => e.id === eq.id);
        return existing || { ...eq, qty: 1, models: [""], sameModel: false };
      })
    );
  };
  const handleEquipmentRemove = handleEquipmentSelect;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const { panNumber, aadhaarNumber } = vendorDetails.bankDetails;

    if (aadhaarNumber.length !== 12) {
      return toast.error("Aadhaar number must be exactly 12 digits");
    }
    if (panNumber && panNumber.length > 0 && !panRegex.test(panNumber)) {
      return toast.error("Invalid PAN number format");
    }

    try {
      const services = (vendorDetails.specialization || []).map((service) => ({
        serviceId: service.serviceId || service.id || service._id,
        name: service.name,
        price: service.price,
        marginPrice: service.marginPrice,
      }));

      const payload = {
        name: vendorDetails.name,
        category:
          vendorCat === "In house" ? "Inhouse Vendor" : "Outsource Vendor",
        contactPerson: vendorDetails.name,
        phoneNo: vendorDetails.phoneNo,
        alternatePhoneNo: vendorDetails.alternatePhoneNo,
        email: vendorDetails.email,
        address: vendorDetails.address,
        services,
        experience: vendorDetails.experience,
        designation: vendorDetails.designation,
        expertiseLevel: vendorDetails.expertiseLevel,
        camera: vendorCat === "Outsource" ? vendorDetails.camera : undefined,
        otherEquipment:
          vendorCat === "Outsource" ? vendorDetails.otherEquipment : undefined,
        equipmentDetails:
          selectedEquipment && selectedEquipment.length > 0
            ? selectedEquipment
            : undefined,
        bankDetails: {
          ...vendorDetails.bankDetails,
          panNumber: vendorDetails.bankDetails.panNumber || undefined,
        },
      };

      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );

      const response =
        id !== "new"
          ? await axios.put(`http://localhost:5000/api/vendors/${id}`, payload)
          : await axios.post("http://localhost:5000/api/vendors", payload);

      if (response.data.success) {
        toast.success(
          id !== "new"
            ? "Vendor updated successfully"
            : "Vendor added successfully"
        );
        localStorage.removeItem("selectedCategory");
        navigate("/vendors");
      } else {
        toast.error("Failed to save vendor");
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to save vendor"
      );
    }
  };

  return (
    <div
      className="container py-2 rounded"
      style={{ background: "#F4F4F4", fontSize: "14px" }}
    >
      <div className="p-3 m-3 rounded">
        <h5 className="mb-3">Vendor Details</h5>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Phone No</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.phoneNo}
                  // maxLength={10}
                  onChange={(e) => handleInputChange("phoneNo", e.target.value)}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Alternate Phone No</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.alternatePhoneNo}
                  // maxLength={10}
                  onChange={(e) =>
                    handleInputChange("alternatePhoneNo", e.target.value)
                  }
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={vendorDetails.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </Form.Group>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Experience</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.experience}
                  onChange={(e) =>
                    handleInputChange("experience", e.target.value)
                  }
                />
              </Form.Group>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.designation}
                  onChange={(e) =>
                    handleInputChange("designation", e.target.value)
                  }
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Expertise Level</Form.Label>
                <Form.Select
                  value={vendorDetails.expertiseLevel}
                  onChange={(e) =>
                    handleInputChange("expertiseLevel", e.target.value)
                  }
                >
                  <option value="">Select Expertise Level</option>
                  {expertiseLevelOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-12">
              <Form.Group>
                <Form.Label>Specialization</Form.Label>
                <Multiselect
                  options={specializationOptions}
                  displayValue="name"
                  selectedValues={selectedSpecializationObjects}
                  onSelect={handleSpecializationSelect}
                  onRemove={handleSpecializationRemove}
                  showCheckbox
                  style={{ optionListContainer: { maxHeight: "200px" } }}
                />
              </Form.Group>
            </div>
          </div>

          {/* Equipment selection for Outsource vendors */}
          {vendorCat === "Outsource" && (
            <>
              <h6 className="my-3">Equipment Details</h6>
              <div className="row mt-2">
                <div className="col-md-12">
                  <Form.Group>
                    <Form.Label>Select Equipment</Form.Label>
                    <Multiselect
                      options={equipmentOptions}
                      displayValue="name"
                      selectedValues={selectedEquipment}
                      onSelect={handleEquipmentSelect}
                      onRemove={handleEquipmentRemove}
                      showCheckbox
                      style={{ optionListContainer: { maxHeight: "200px" } }}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="row">
                {selectedEquipment.map((eq, idx) => (
                  <div
                    key={eq.id}
                    className="col-md-6 mb-4"
                    style={{ minWidth: 320 }}
                  >
                    <div
                      className="p-3 rounded h-100"
                      style={{
                        background: "#f8f9fa",
                        border: "1px solid #e0e0e0",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div className="mb-2">
                        <strong style={{ fontSize: "16px" }}>{eq.name}</strong>
                      </div>
                      <div className="mb-2 d-flex align-items-center gap-2">
                        <label
                          htmlFor={`qty-${eq.id}`}
                          style={{ minWidth: 70, marginBottom: 0 }}
                        >
                          Quantity:
                        </label>
                        <input
                          id={`qty-${eq.id}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min={1}
                          value={eq.qty === 0 ? "" : eq.qty}
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9]/g, "");
                            // allow empty string for clearing
                            setSelectedEquipment((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      qty: val === "" ? "" : parseInt(val, 10),
                                      models: Array(
                                        val === "" ? 1 : parseInt(val, 10)
                                      ).fill(item.models[0] || ""),
                                      sameModel: item.sameModel,
                                    }
                                  : item
                              )
                            );
                          }}
                          onBlur={(e) => {
                            // default to 1 if left empty
                            if (
                              e.target.value === "" ||
                              e.target.value === "0"
                            ) {
                              setSelectedEquipment((prev) =>
                                prev.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        qty: 1,
                                        models: Array(1).fill(
                                          item.models[0] || ""
                                        ),
                                        sameModel: item.sameModel,
                                      }
                                    : item
                                )
                              );
                            }
                          }}
                          style={{
                            width: 80,
                            borderRadius: 4,
                            border: "1px solid #ced4da",
                            padding: "2px 8px",
                          }}
                        />
                      </div>
                      <div className="mb-2 d-flex align-items-center gap-2">
                        <input
                          id={`sameModel-${eq.id}`}
                          type="checkbox"
                          checked={eq.sameModel}
                          onChange={(e) => {
                            setSelectedEquipment((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      sameModel: e.target.checked,
                                      models: e.target.checked
                                        ? [item.models[0] || ""]
                                        : Array(
                                            item.qty === "" ? 1 : item.qty
                                          ).fill(item.models[0] || ""),
                                    }
                                  : item
                              )
                            );
                          }}
                          style={{ marginRight: 6 }}
                        />
                        <label
                          htmlFor={`sameModel-${eq.id}`}
                          style={{ marginBottom: 0, userSelect: "none" }}
                        >
                          All same model
                        </label>
                      </div>
                      <div>
                        {eq.sameModel ? (
                          <div className="mb-2">
                            <label
                              htmlFor={`model-${eq.id}-0`}
                              style={{ minWidth: 90, marginBottom: 0 }}
                            >
                              Model Name:
                            </label>
                            <input
                              id={`model-${eq.id}-0`}
                              type="text"
                              placeholder="Enter model name"
                              value={eq.models[0] || ""}
                              onChange={(e) => {
                                setSelectedEquipment((prev) =>
                                  prev.map((item, i) =>
                                    i === idx
                                      ? { ...item, models: [e.target.value] }
                                      : item
                                  )
                                );
                              }}
                              style={{
                                width: 220,
                                borderRadius: 4,
                                border: "1px solid #ced4da",
                                padding: "2px 8px",
                              }}
                            />
                          </div>
                        ) : (
                          Array.from({
                            length: eq.qty === "" ? 1 : eq.qty,
                          }).map((_, i) => (
                            <div
                              key={i}
                              className="mb-2 d-flex align-items-center gap-2"
                            >
                              <label
                                htmlFor={`model-${eq.id}-${i}`}
                                style={{ minWidth: 110, marginBottom: 0 }}
                              >
                                Model Name {i + 1}:
                              </label>
                              <input
                                id={`model-${eq.id}-${i}`}
                                type="text"
                                placeholder={`Enter model name ${i + 1}`}
                                value={eq.models[i] || ""}
                                onChange={(e) => {
                                  setSelectedEquipment((prev) =>
                                    prev.map((item, j) =>
                                      j === idx
                                        ? {
                                            ...item,
                                            models: item.models.map((m, mi) =>
                                              mi === i ? e.target.value : m
                                            ),
                                          }
                                        : item
                                    )
                                  );
                                }}
                                style={{
                                  width: 220,
                                  borderRadius: 4,
                                  border: "1px solid #ced4da",
                                  padding: "2px 8px",
                                }}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <h6 className="my-3">Bank Details</h6>
          <div className="row mt-2">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Bank Name</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.bankDetails.bankName}
                  onChange={(e) =>
                    handleBankInputChange("bankName", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Account Holder Name</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.bankDetails.accountHolder}
                  onChange={(e) =>
                    handleBankInputChange("accountHolder", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Account Number</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.bankDetails.accountNumber}
                  onChange={(e) =>
                    handleBankInputChange("accountNumber", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>IFSC Code</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.bankDetails.ifsc}
                  onChange={(e) =>
                    handleBankInputChange("ifsc", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Branch</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.bankDetails.branch}
                  onChange={(e) =>
                    handleBankInputChange("branch", e.target.value)
                  }
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>PAN Number (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  value={vendorDetails.bankDetails.panNumber}
                  onChange={(e) =>
                    handleBankInputChange(
                      "panNumber",
                      e.target.value.toUpperCase()
                    )
                  }
                  pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
                  title="Example: ABCDE1234F"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Aadhar Number </Form.Label>
                <Form.Control
                  type="text"
                  value={
                    showAadhaarMasked
                      ? vendorDetails.bankDetails.aadhaarNumber.replace(
                          /\d(?=\d{4})/g,
                          "*"
                        )
                      : vendorDetails.bankDetails.aadhaarNumber
                  }
                  onFocus={() => setShowAadhaarMasked(false)}
                  onBlur={() => setShowAadhaarMasked(true)}
                  onChange={(e) =>
                    handleBankInputChange(
                      "aadhaarNumber",
                      e.target.value.replace(/\D/g, "").slice(0, 12)
                    )
                  }
                  title="Must be a 12-digit Aadhaar number"
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="d-flex justify-content-end my-4">
            <Button className="mt-3" variant="dark" type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default VendorDetails;
