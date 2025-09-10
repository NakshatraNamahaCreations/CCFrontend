// import React, { useState, useMemo, useEffect } from "react";
// import {
//   Table,
//   Form,
//   Button,
//   Card,
//   Modal,
//   Row,
//   Col,
//   Tooltip,
//   OverlayTrigger,
// } from "react-bootstrap";
// import {
//   FaPlus,
//   FaMinus,
//   FaEdit,
//   FaSave,
//   FaTimes,
//   FaExchangeAlt,
//   FaClipboardList,
//   FaUserTie,
//   FaUserAlt,
// } from "react-icons/fa"
// import { Link, useNavigate, useParams } from "react-router-dom";
// import deleteIcon from "../../assets/icons/deleteIcon.png";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import dayjs from "dayjs";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import AddAlbumModal from "../Albums/AddAlbumModal";
// import AlbumsTable from "../Albums/AlbumsTable";
// import AlbumDetailsModal from "../Albums/AlbumDetailsModal";
// import { computeAlbumTotal, fmt } from "../../utils/albumUtils";

// const Chip = ({ children, tone = "light" }) => (
//   <span className={`chip chip-${tone}`}>{children}</span>
// );

// const BookingdetailsPage = () => {
//   const [quotationData, setQuotationData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [installments, setInstallments] = useState([]);
//   const [editIndex, setEditIndex] = useState(null);
//   const [startFilter, setStartFilter] = useState(null);
//   const [endFilter, setEndFilter] = useState(null);
//   const [newInstruction, setNewInstruction] = useState("");
//   const [showCollectDataModal, setShowCollectDataModal] = useState(false);
//   const [selectedVendor, setSelectedVendor] = useState(null);
//   const [collectedDataList, setCollectedDataList] = useState(null); // For fetched collected data
//   const [editMode, setEditMode] = useState(false); // Track if editing
//   const [albums, setAlbums] = useState([]);
//   const [showAlbumModal, setShowAlbumModal] = useState(false);
//   const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
//   const [editingAlbum, setEditingAlbum] = useState(null);
//   const [viewAlbum, setViewAlbum] = useState(null);

//   const [collectData, setCollectData] = useState({
//     personName: "",
//     cameraName: "",
//     totalDriveSize: "",
//     filledSize: "",
//     copyingPerson: "",
//     systemNumber: "",
//     copiedLocation: "",
//     noOfPhotos: "",
//     noOfVideos: "",
//     submissionDate: "",
//     notes: "",
//   });

//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [selectedInstallment, setSelectedInstallment] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [paymentData, setPaymentData] = useState({
//     paymentDate: dayjs().format('YYYY-MM-DD'),
//     paymentMode: 'Online',
//     amount: '',
//     status: 'Completed'
//   });

//   // --- package qty edit modal state ---
//   const [pkgQtyModalOpen, setPkgQtyModalOpen] = useState(false);
//   const [pkgEditIndex, setPkgEditIndex] = useState(null);   // index in quotationData.packages
//   const [pkgDraft, setPkgDraft] = useState(null);           // deep copy of the package being edited

//   const { id } = useParams();
//   const navigate = useNavigate();

//   const handleAddInstruction = async () => {
//     if (!newInstruction.trim()) return;

//     try {
//       const res = await axios.put(
//         `http://localhost:5000/api/quotations/${id}/instruction/add`,
//         {
//           instruction: newInstruction.trim(),
//         }
//       );

//       setQuotationData((prev) => ({
//         ...prev,
//         clientInstructions: res.data.clientInstructions,
//       }));

//       setNewInstruction(""); // clear input
//       toast.success("Instruction added");
//     } catch (error) {
//       console.error("Add instruction error:", error);
//       toast.error("Failed to add instruction");
//     }
//   };

//   const handleRemoveInstruction = async (instructionToDelete) => {
//     try {
//       const res = await axios.delete(
//         `http://localhost:5000/api/quotations/${id}/instruction/delete`,
//         {
//           data: { instruction: instructionToDelete },
//         }
//       );

//       setQuotationData((prev) => ({
//         ...prev,
//         clientInstructions: res.data.clientInstructions,
//       }));

//       toast.success("Instruction deleted");
//     } catch (error) {
//       console.error("Delete instruction error:", error);
//       toast.error("Failed to delete instruction");
//     }
//   };

//   // Fetch collected data for this quotation
//   useEffect(() => {
//     const fetchCollectedData = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/collected-data/${id}`
//         );
//         setCollectedDataList(res.data.data); // .data is the CollectedData doc
//       } catch (err) {
//         setCollectedDataList(null);
//       }
//     };
//     if (id) fetchCollectedData();
//   }, [id, showCollectDataModal]); // refetch after modal closes

//   const fetchQuotation = async () => {
//     try {
//       const res = await axios.get(`http://localhost:5000/api/quotations/${id}`);
//       const q = res.data.quotation;
//       setQuotationData(q);
//       setInstallments(q.installments || []);
//       setAlbums(q.albums || []); // <-- add this line
//       console.log("res.data.q",q )
//     } catch (err) {
//       toast.error("Error loading quotation");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (id) fetchQuotation();
//   }, [id]);

//   // Package subtotal (generic helper) — keep if not already present
//   const computePackageSubtotalNow = (packagesArr = []) =>
//     Math.round(
//       (packagesArr || []).reduce(
//         (sum, pkg) =>
//           sum +
//           (pkg.services || []).reduce(
//             (s, srv) => s + (Number(srv.qty) || 1) * (Number(srv.price) || 0),
//             0
//           ),
//         0
//       )
//     );

//   // Draft package total (for showing inside the modal)
//   const pkgDraftTotal = useMemo(() => {
//     if (!pkgDraft) return 0;
//     return (pkgDraft.services || []).reduce(
//       (s, srv) => s + (Number(srv.qty) || 1) * (Number(srv.price) || 0),
//       0
//     );
//   }, [pkgDraft]);

//   const packageSubtotal = Math.round(
//     (quotationData?.packages || []).reduce(
//       (sum, pkg) =>
//         sum +
//         (pkg.services || []).reduce(
//           (s, srv) => s + Number(srv.qty || 1) * Number(srv.price || 0),
//           0
//         ),
//       0
//     )
//   );

//   const albumSubtotal = useMemo(
//     () =>
//       Math.round(
//         (albums || []).reduce((sum, a) => sum + computeAlbumTotal(a), 0)
//       ),
//     [albums]
//   );

//   const totalBeforeDiscount = Math.round(packageSubtotal + albumSubtotal);
//   const discount = Math.round(
//     (totalBeforeDiscount * (quotationData?.discountPercent || 0)) / 100
//   );
//   const totalAfterDiscount = Math.round(totalBeforeDiscount - discount);
//   const gst = quotationData?.gstApplied
//     ? Math.round(totalAfterDiscount * 0.18)
//     : 0;
//   const totalAmount = Math.round(totalAfterDiscount + gst) || 0;
//   const grandTotal = totalAmount;

//   const packageMarginSubtotal = Math.round(
//     (quotationData?.packages || []).reduce(
//       (sum, pkg) =>
//         sum +
//         (pkg.services || []).reduce(
//           (s, srv) => s + Number(srv.qty || 1) * Number(srv.marginPrice || 0),
//           0
//         ),
//       0
//     )
//   );

//   const totalMarginBeforeDiscount = Math.round(
//     packageMarginSubtotal + albumSubtotal
//   );
//   const marginDiscount = Math.round(
//     (totalMarginBeforeDiscount * (quotationData?.discountPercent || 0)) / 100
//   );
//   const marginAfterDiscount = Math.round(
//     totalMarginBeforeDiscount - marginDiscount
//   );
//   const marginGst = quotationData?.gstApplied
//     ? Math.round(marginAfterDiscount * 0.18)
//     : 0;
//   const totalMarginFinal = Math.round(marginAfterDiscount + marginGst);
//   // Compute album subtotal for any array (used when we have a "next" array)
//   const computeAlbumSubtotalNow = (albumsArr) =>
//     Math.round(
//       (albumsArr || []).reduce((sum, a) => sum + computeAlbumTotal(a), 0)
//     );

//   // In BookingdetailsPage.js
//   const calculateInstallmentDetails = (installments, currentGrandTotal) => {
//     return installments.map(inst => {
//       const amount = Math.round((inst.paymentPercentage / 100) * currentGrandTotal);
//       const pending = inst.status === "Completed"
//         ? amount - (inst.paidAmount || 0)
//         : amount;

//       // Determine status - if marked Completed but has pending amount, change to Partial
//       let status = inst.status;
//       if (inst.status === "Completed" && pending > 0) {
//         status = "Partial Paid";
//       } else if (inst.status === "Partial Paid" && pending <= 0) {
//         status = "Completed";
//       }

//       return {
//         ...inst,
//         paymentAmount: amount,
//         pendingAmount: pending,
//         paidAmount: inst.status === "Completed" ? inst.paymentAmount : 0,
//         status
//       };
//     });
//   };

//   // Build exactly the minimal payload your backend wants to store
//   const buildMinimalTotals = (albumsOverride = null, packagesOverride = null) => {
//     const albumsArr = Array.isArray(albumsOverride) ? albumsOverride : albums;
//     const packagesArr = Array.isArray(packagesOverride)
//       ? packagesOverride
//       : quotationData?.packages || [];

//     const albumSubtotalNow = computeAlbumSubtotalNow(albumsArr);
//     const packageSubtotalNow = computePackageSubtotalNow(packagesArr);

//     const totalBeforeDiscountNow = Math.round(packageSubtotalNow + albumSubtotalNow);
//     const discountNow = Math.round(
//       (totalBeforeDiscountNow * (quotationData?.discountPercent || 0)) / 100
//     );
//     const totalAfterDiscountNow = Math.round(totalBeforeDiscountNow - discountNow);
//     const gstNow = quotationData?.gstApplied ? Math.round(totalAfterDiscountNow * 0.18) : 0;
//     const grandTotalNow = Math.round(totalAfterDiscountNow + gstNow);

//     // Calculate new installment amounts based on new grand total
//     const calculatedInstallments = (installments || []).map(inst => {
//       const newAmount = Math.round((inst.paymentPercentage / 100) * grandTotalNow);
//       return {
//         ...inst,
//         paymentAmount: newAmount,
//       };
//     });

//     // Redistribute existing payments intelligently
//     let remainingPayment = 0;
//     const finalInstallments = calculatedInstallments.map(inst => {
//       // If installment was previously paid (either fully or partially)
//       const previouslyPaid = inst.paidAmount || 0;

//       // Calculate how much should be paid for this installment in new structure
//       const newPaidAmount = Math.min(
//         inst.paymentAmount,
//         previouslyPaid + remainingPayment
//       );

//       // Calculate pending amount
//       const pending = inst.paymentAmount - newPaidAmount;

//       // Update remaining payment that can be applied to next installments
//       remainingPayment = previouslyPaid + remainingPayment - newPaidAmount;

//       // Determine status
//       let status = inst.status;
//       if (newPaidAmount >= inst.paymentAmount) {
//         status = "Completed";
//       } else if (newPaidAmount > 0) {
//         status = "Partial Paid";
//       } else {
//         status = "Pending";
//       }

//       return {
//         ...inst,
//         paidAmount: newPaidAmount,
//         pendingAmount: pending,
//         status
//       };
//     });

//     // If there's still remaining payment after processing all installments,
//     // add it to the last installment as an overpayment
//     if (remainingPayment > 0 && finalInstallments.length > 0) {
//       const last = finalInstallments[finalInstallments.length - 1];
//       last.paidAmount += remainingPayment;
//       last.pendingAmount = Math.max(0, last.paymentAmount - last.paidAmount);
//       last.status = "Completed";
//     }

//     // Margin calculations (kept as-is)
//     const totalMarginBeforeDiscountNow = Math.round(
//       packageMarginSubtotal + albumSubtotalNow
//     );
//     const marginDiscountNow = Math.round(
//       (totalMarginBeforeDiscountNow * (quotationData?.discountPercent || 0)) / 100
//     );
//     const marginAfterDiscountNow = Math.round(
//       totalMarginBeforeDiscountNow - marginDiscountNow
//     );
//     const marginGstNow = quotationData?.gstApplied
//       ? Math.round(marginAfterDiscountNow * 0.18)
//       : 0;
//     const totalMarginFinalNow = Math.round(marginAfterDiscountNow + marginGstNow);

//     return {
//       totalPackageAmt: packageSubtotalNow,
//       totalAlbumAmount: albumSubtotalNow,
//       discountValue: discountNow,
//       gstValue: gstNow,
//       totalAmount: grandTotalNow,
//       installments: finalInstallments,
//       totalMarginFinal: totalMarginFinalNow,
//     };
//   };
//   const pushMinimalTotalsFrom = async (albumsOverride = null) => {
//     try {
//       const payload = buildMinimalTotals(albumsOverride);
//       await axios.put(
//         `http://localhost:5000/api/quotations/${id}/totals-min`,
//         payload
//       );
//       // Update local state with calculated installments
//       // setInstallments(payload.installments);
//       fetchQuotation()
//       // Optional: toast.success("Totals updated");
//     } catch (e) {
//       console.error("Failed to update totals", e);
//       toast.error("Failed to update totals on server");
//     }
//   };

//   const savePackagesAndTotals = async (nextPackages, editedPackageIndex) => {
//     // Calculate totals based on the updated packages
//     const totals = buildMinimalTotals(null, nextPackages);

//     // Prepare payload - only include the edited package if index is provided
//     const payload = {
//       // Only include the edited package if index is specified
//       package: editedPackageIndex !== undefined ? nextPackages[editedPackageIndex] : null,

//       totalPackageAmt: totals.totalPackageAmt,
//       totalAlbumAmount: totals.totalAlbumAmount,
//       discountValue: totals.discountValue,
//       gstValue: totals.gstValue,
//       totalAmount: totals.grandTotal,
//       grandTotal: totals.grandTotal,
//       totalMarginFinal: totals.totalMarginFinal,
//       installments: totals.installments,
//     };

//     console.log("payload", payload);

//     const res = await axios.put(
//       `http://localhost:5000/api/quotations/${id}/totals-min`,
//       payload
//     );

//     // If your API returns the updated quotation, prefer that:
//     if (res?.data?.quotation) {
//       setQuotationData(res.data.quotation);
//     } else {
//       // Fallback: refetch fresh data
//       await fetchQuotation();
//     }
//   };

//   // Open the modal with a deep copy of the selected package
//   const handleOpenPkgQty = (pkg, index) => {
//     setPkgEditIndex(index);
//     setPkgDraft(JSON.parse(JSON.stringify(pkg))); // deep clone
//     setPkgQtyModalOpen(true);
//   };

//   const closePkgQtyModal = () => {
//     setPkgQtyModalOpen(false);
//     setPkgEditIndex(null);
//     setPkgDraft(null);
//   };

//   // +/- buttons
//   const changeDraftQty = (srvIndex, delta) => {
//     setPkgDraft((p) => {
//       const services = [...(p.services || [])];
//       const srv = { ...services[srvIndex] };
//       const current = Number(srv.qty) || 1;
//       const next = Math.max(1, current + delta);
//       srv.qty = next;
//       services[srvIndex] = srv;
//       return { ...p, services };
//     });
//   };

//   // direct input (keeps min = 1)
//   const setDraftQtyInput = (srvIndex, val) => {
//     const n = Math.max(1, parseInt(String(val).replace(/\D/g, "") || "1", 10));
//     setPkgDraft((p) => {
//       const services = [...(p.services || [])];
//       services[srvIndex] = { ...services[srvIndex], qty: n };
//       return { ...p, services };
//     });
//   };

//   // Save back to state, then persist packages + totals + installments
//   const handleSavePkgQty = async () => {
//     if (pkgEditIndex == null || !pkgDraft) return;

//     const nextPackages = (quotationData?.packages || []).map((p, i) =>
//       i === pkgEditIndex
//         ? {
//           ...p,
//           services: (pkgDraft.services || []).map((s) => ({
//             ...s,
//             qty: Math.max(1, Number(s.qty) || 1), // enforce min 1
//           })),
//         }
//         : p
//     );

//     // Optimistic UI update
//     setQuotationData((prev) => ({ ...prev, packages: nextPackages }));
//     closePkgQtyModal();

//     try {
//       await savePackagesAndTotals(nextPackages, pkgEditIndex); // Pass the edited index
//       toast.success("Package updated");
//       fetchQuotation()
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save package");

//     }
//   };

//   const filteredPackages = quotationData?.packages?.filter((pkg) => {
//     const startDate = dayjs(pkg.eventStartDate).toDate();
//     const endDate = dayjs(pkg.eventEndDate).toDate();
//     const afterStart = !startFilter || startDate >= startFilter;
//     const beforeEnd = !endFilter || endDate <= endFilter;
//     return afterStart && beforeEnd;
//   });

//   // Only these services have assistants
//   const isCandidService = (name = "") =>
//     name === "Candid Photographer" || name === "Candid Cinematographer";

//   const getTotalAllocatedPercentage = (customList = installments) => {
//     return customList.reduce(
//       (sum, i) => sum + (Number(i.paymentPercentage) || 0),
//       0
//     );
//   };

//   const handleEditToggle = (index) => {
//     if (editIndex === index) {
//       setEditIndex(null);
//     } else {
//       setEditIndex(index);
//     }
//   };

//   const handleFieldChange = (index, field, value) => {
//     const updated = [...installments];
//     updated[index][field] = value;

//     // recalculate amount if percentage changes
//     if (field === "paymentPercentage") {
//       const raw = value.replace(/[^0-9.]/g, "");
//       if (raw === "") {
//         updated[index].paymentPercentage = "";
//       } else {
//         const parsed = parseFloat(raw);
//         if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
//           updated[index].paymentPercentage = parsed;
//           updated[index].paymentAmount = Math.round(
//             (totalAmount * parsed) / 100
//           );
//         }
//       }
//     }
//     setInstallments(updated);
//   };

//   const handleEditCollectedEvent = (event) => {
//     setSelectedVendor({
//       eventId: event.eventId,
//       eventName: event.eventName,
//     });
//     setCollectData({
//       personName: collectedDataList.personName,
//       cameraName: event.cameraName || "",
//       totalDriveSize: event.totalDriveSize || "",
//       filledSize: event.filledSize || "",
//       copyingPerson: event.copyingPerson || "",
//       systemNumber: collectedDataList.systemNumber,
//       copiedLocation: event.copiedLocation || "",
//       noOfPhotos: event.noOfPhotos || "",
//       noOfVideos: event.noOfVideos || "",
//       submissionDate: event.submissionDate
//         ? dayjs(event.submissionDate).format("YYYY-MM-DD")
//         : "",
//       notes: event.notes || "",
//     });
//     setEditMode(true);
//     setShowCollectDataModal(true);
//   };

//   const handleCollectDataChange = (e) => {
//     const { name, value } = e.target;
//     setCollectData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleCollectDataSubmit = async () => {
//     try {
//       const payload = {
//         quotationId: id,
//         quotationUniqueId: quotationData?.quotationId,
//         personName: collectData.personName,
//         systemNumber: collectData.systemNumber,
//         eventId: selectedVendor?.eventId,
//         eventName: selectedVendor?.eventName,
//         cameraName: collectData.cameraName,
//         totalDriveSize: collectData.totalDriveSize,
//         filledSize: collectData.filledSize,
//         copyingPerson: collectData.copyingPerson,
//         copiedLocation: collectData.copiedLocation,
//         noOfPhotos: collectData.noOfPhotos,
//         noOfVideos: collectData.noOfVideos,
//         submissionDate: collectData.submissionDate,
//         notes: collectData.notes,
//       };

//       await axios.post("http://localhost:5000/api/collected-data/", payload);
//       toast.success(
//         editMode ? "Data updated successfully" : "Data collected successfully"
//       );
//       setShowCollectDataModal(false);
//       setSelectedVendor(null);
//       setEditMode(false);
//       setCollectData({
//         personName: "",
//         cameraName: "",
//         totalDriveSize: "",
//         filledSize: "",
//         copyingPerson: "",
//         systemNumber: "",
//         copiedLocation: "",
//         noOfPhotos: "",
//         noOfVideos: "",
//         submissionDate: "",
//         notes: "",
//       });
//     } catch (err) {
//       toast.error("Failed to collect data");
//     }
//   };

//   const handleSaveInstallment = async (index) => {
//     const inst = installments[index];
//     const newTotal = getTotalAllocatedPercentage();

//     if (newTotal > 100) {
//       toast.error("Total percentage exceeds 100%");
//       return;
//     }

//     const payload = {
//       paymentPercentage: inst.paymentPercentage,
//       paymentAmount: inst.paymentAmount,
//       dueDate: inst.dueDate,
//       paymentMode: inst.paymentMode,
//     };

//     try {
//       let response;

//       if (inst._id) {
//         // 🔁 Update existing installment
//         response = await axios.put(
//           `http://localhost:5000/api/quotations/${id}/installment/${inst._id}`,
//           payload
//         );
//       } else {
//         // 🆕 Create new installment (use `new` as dummy ID)
//         response = await axios.put(
//           `http://localhost:5000/api/quotations/${id}/installment/new`,
//           payload
//         );
//       }

//       // ✅ Update frontend list from latest response
//       const updatedList = response.data.quotation.installments;
//       setInstallments(updatedList);
//       setEditIndex(null);
//       toast.success("Installment saved");
//     } catch (err) {
//       console.error("Save error", err);
//       toast.error("Save failed");
//     }
//   };

//   const handleDeleteInstallment = async (index) => {
//     const confirm = window.confirm(
//       "Are you sure you want to delete this installment?"
//     );
//     if (!confirm) return;

//     const inst = installments[index];

//     try {
//       await axios.delete(
//         `http://localhost:5000/api/quotations/${id}/installment/${inst._id}`
//       );
//       toast.success("Installment deleted successfully");

//       const updated = [...installments];
//       updated.splice(index, 1);
//       setInstallments(updated);
//     } catch (err) {
//       toast.error("Failed to delete installment");
//       console.error(err);
//     }
//   };

//   const handleAddInstallment = () => {
//     const total = getTotalAllocatedPercentage();
//     if (total >= 100) {
//       toast.error("Total percentage already 100%");
//       return;
//     }
//     const newInstallment = {
//       installmentNumber: installments.length + 1,
//       paymentPercentage: 0,
//       paymentAmount: 0,
//       dueDate: "",
//       paymentMode: "",
//       status: "Pending",
//     };
//     setInstallments([...installments, newInstallment]);
//   };

//   // Flatten to one row per service unit
//   const rows = (filteredPackages || []).flatMap((pkg) =>
//     (pkg.services || []).flatMap((srv) => {
//       const qty = Math.max(1, srv.qty || 1);

//       // normalize to arrays (compat with old singular assignedVendor)
//       const vendorArr = Array.isArray(srv.assignedVendors)
//         ? srv.assignedVendors
//         : srv.assignedVendor
//           ? [srv.assignedVendor]
//           : [];
//       const asstArr = Array.isArray(srv.assignedAssistants)
//         ? srv.assignedAssistants
//         : [];

//       return Array.from({ length: qty }, (_, unitIndex) => ({
//         pkg,
//         service: srv,
//         unitIndex,
//         vendor: vendorArr[unitIndex] || null,
//         assistant: isCandidService(srv.serviceName)
//           ? asstArr[unitIndex] || null
//           : null,
//       }));
//     })
//   );

//   // Keep your existing vendor-assign flow per package
//   const handleAssignVendor = (packageId) => {
//     navigate(`/vendors/vendor-assign/${id}/${packageId}`, {
//       state: { returnPath: `/booking/booking-details/${id}` },
//     });
//   };

//   // add flow
//   const openAlbumModal = () => {
//     setModalMode("add");
//     setShowAlbumModal(true);
//   };
//   const closeAlbumModal = () => {
//     setShowAlbumModal(false);
//     setEditingAlbum(null);
//   };
//   const handleAlbumAdd = (item) => {
//     const next = [...albums, item]; // 1) compute next list
//     setAlbums(next); // 2) update UI
//     setShowAlbumModal(false);

//     // 3) persist minimal totals based on the NEXT list
//     pushMinimalTotalsFrom(next);
//   };

//   const getAlbumId = (a) => a?._id || a?.id;

//   const handleAlbumEdit = (albumId) => {
//     const found = albums.find((a) => getAlbumId(a) === albumId);
//     if (!found) return;
//     setEditingAlbum(found);
//     setModalMode("edit");
//     setShowAlbumModal(true);
//   };
//   // Update
//   const handleAlbumUpdate = (serverAlbum) => {
//     const idToMatch = getAlbumId(serverAlbum);
//     const next = albums.map((a) =>
//       getAlbumId(a) === idToMatch ? serverAlbum : a
//     );

//     setAlbums(next);
//     toast.success("Album updated");
//     setShowAlbumModal(false);
//     setEditingAlbum(null);

//     // persist minimal totals based on the NEXT list
//     pushMinimalTotalsFrom(next);
//   };

//   // view flow
//   const handleAlbumView = (albumId) => {
//     const found = albums.find((a) => getAlbumId(a) === albumId);
//     if (found) setViewAlbum(found);
//   };

//   // existing qty/price/remove handlers stay the same
//   const handleAlbumQtyDelta = (id, delta) =>
//     setAlbums((prev) =>
//       prev.map((a) =>
//         a.id === id ? { ...a, qty: Math.max(1, (a.qty || 1) + delta) } : a
//       )
//     );
//   const handleAlbumPriceChange = (id, val) =>
//     setAlbums((prev) =>
//       prev.map((a) => (a.id === id ? { ...a, unitPrice: Number(val) || 0 } : a))
//     );

//   const handleAlbumRemove = async (albumId) => {
//     // Ask first
//     const album = albums.find(a => a._id === albumId || a.id === albumId);
//     const name =
//       album?.snapshot?.templateLabel || album?.templateId || "this album";
//     const ok = window.confirm(`Are you sure you want to remove ${name}?`);
//     if (!ok) return;

//     try {
//       const res = await axios.delete(
//         `http://localhost:5000/api/quotations/${id}/albums/${albumId}`
//       );

//       // Prefer server list; fallback to local
//       const next = Array.isArray(res?.data?.albums)
//         ? res.data.albums
//         : albums.filter((a) => a._id !== albumId && a.id !== albumId);

//       setAlbums(next);
//       toast.success("Album removed");

//       // Persist minimal totals for the updated list
//       await pushMinimalTotalsFrom(next);
//     } catch (err) {
//       console.error("Delete error:", err);
//       const message = err.response?.data?.message || "Failed to remove album";
//       toast.error(message);
//     }
//   };

//   const handleOpenPay = (installment) => {
//     setSelectedInstallment(installment);
//     setPaymentData({
//       paymentDate: installment.dueDate
//         ? dayjs(installment.dueDate, ["DD-MM-YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
//         : dayjs().format("YYYY-MM-DD"), // default today
//       paymentMode: installment.paymentMode || "Online",
//       amount: installment.pendingAmount || 0,
//       status: installment.status || "Partial Paid"
//     });
//     setShowPaymentModal(true);
//   };

//   const handlePaymentSubmit = async () => {
//     setIsSubmitting(true);
//     try {
//       const payload = {
//         paymentAmount: Number(paymentData.amount),
//         paymentMode: paymentData.paymentMode,
//         paymentDate: paymentData.paymentDate, // Already in YYYY-MM-DD format
//         status: paymentData.status
//       };

//       // Call the dedicated payment endpoint
//       const res = await axios.put(
//         `http://localhost:5000/api/quotations/${id}/installment/${selectedInstallment._id}/payment`,
//         payload
//       );

//       if (res.data && res.data.success) {
//         toast.success("Payment recorded successfully!");
//         setShowPaymentModal(false);
//         fetchQuotation(); // Refresh the quotation data
//       } else {
//         throw new Error(res.data?.message || "Payment failed");
//       }
//     } catch (err) {
//       console.error("Payment error:", err);
//       toast.error(err.message || "Failed to record payment");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="container py-2">
//       {/* Customer Details */}
//       <Card className="mb-4 shadow-sm border-0">
//         <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
//           <h6 className="fw-bold mb-0">Customer Details</h6>
//         </div>
//         {isLoading ? (
//           <div className="px-3 py-4">Loading...</div>
//         ) : (
//           <div className="px-3 py-3">
//             <div className="row mb-3" style={{ fontSize: "12px" }}>
//               <div className="col-md-4">
//                 <strong>Lead ID:</strong>{" "}
//                 <span className="text-primary">
//                   {quotationData?.leadId?.leadId}
//                 </span>
//               </div>
//               <div className="col-md-4">
//                 <strong>Query ID:</strong>{" "}
//                 <span>{quotationData?.quotationId}</span>
//               </div>
//               <div className="col-md-4">
//                 <strong>Reference:</strong>{" "}
//                 <span>{quotationData?.leadId?.referenceForm}</span>
//               </div>
//               <div className="col-md-4">
//                 <strong>Note:</strong>{" "}
//                 <span>{quotationData?.quoteNote}</span>
//               </div>
//             </div>
//             <div>
//               <h6 className="fw-bold">Persons</h6>
//               <div className="row g-3">
//                 {quotationData?.leadId?.persons?.map((person) => (
//                   <div className="col-md-6" key={person._id}>
//                     <div className="d-flex align-items-center px-2 py-2 bg-white rounded shadow-sm border">
//                       <div
//                         className="rounded-circle d-flex align-items-center justify-content-center me-3"
//                         style={{
//                           width: "40px",
//                           height: "40px",
//                           backgroundColor: "#007bff",
//                           color: "#fff",
//                           fontWeight: "bold",
//                         }}
//                       >
//                         {person.name?.charAt(0).toUpperCase()}
//                       </div>
//                       <div>
//                         <div className="fw-semibold">{person.name}</div>
//                         <div style={{ fontSize: "13px", color: "#555" }}>
//                           {person.phoneNo} | {person.email}
//                         </div>
//                         <span
//                           className="badge bg-light text-dark"
//                           style={{ fontSize: "10px" }}
//                         >
//                           {person.profession}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </Card>

//       <Card className="my-3">
//         <Card.Header className="d-flex justify-content-between align-items-center">
//           <strong>Assigned Vendors</strong>
//         </Card.Header>

//         {/* Client Instructions Inline Add */}
//         <Card.Body>
//           <div style={{ fontSize: "12px" }}>
//             <strong>Client Instructions:</strong>
//             <ul className="mt-2 ps-3">
//               {quotationData?.clientInstructions?.map((item) => (
//                 <li
//                   key={item}
//                   className="d-flex justify-content-between align-items-center mb-1"
//                 >
//                   <span>{item}</span>
//                   <FaTimes
//                     onClick={() => handleRemoveInstruction(item)}
//                     style={{
//                       cursor: "pointer",
//                       fontSize: "10px",
//                       color: "red",
//                     }}
//                   />
//                 </li>
//               ))}
//             </ul>

//             {/* Add Instruction Input */}
//             <div className="d-flex gap-2 mt-2">
//               <Form.Control
//                 type="text"
//                 size="sm"
//                 placeholder="Write instruction..."
//                 value={newInstruction}
//                 onChange={(e) => setNewInstruction(e.target.value)}
//               />
//               <Button
//                 variant="dark"
//                 size="sm"
//                 onClick={handleAddInstruction}
//                 className="d-flex align-items-center"
//               >
//                 <FaPlus /> Add
//               </Button>
//             </div>
//           </div>
//         </Card.Body>

//         {/* Vendors Table */}
//         <Table className="vendor-table shadow-sm" striped hover responsive>
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Service </th>
//               <th>Event</th>
//               <th>Start Date</th>
//               <th>End Date</th>
//               <th>Vendor</th>
//               <th>Assistant</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.length === 0 ? (
//               <tr>
//                 <td colSpan={8} className="text-center">
//                   No rows
//                 </td>
//               </tr>
//             ) : (
//               rows.map((r, idx) => (
//                 <tr key={`${r.pkg._id}-${r.service._id}-${r.unitIndex}`}>
//                   <td>{String(idx + 1).padStart(2, "0")}</td>

//                   <td>
//                     <div className="fw-semibold">
//                       {r.service.serviceName}
//                       <br />
//                       {r.service.qty > 1 && (
//                         <span className="unit-badge">
//                           (unit {r.unitIndex + 1} of {r.service.qty})
//                         </span>
//                       )}
//                     </div>
//                   </td>

//                   <td>{r.pkg.categoryName || "N/A"}</td>
//                   <td>{dayjs(r.pkg.eventStartDate).format("DD-MM-YYYY")}</td>
//                   <td>{dayjs(r.pkg.eventEndDate).format("DD-MM-YYYY")}</td>

//                   {/* Vendor chip */}
//                   <td className="text-nowrap">
//                     {r.vendor?.vendorName ? (
//                       <Chip tone="success">
//                         <FaUserTie />
//                         <span>{r.vendor.vendorName}</span>
//                       </Chip>
//                     ) : (
//                       <span className="text-muted">—</span>
//                     )}
//                   </td>

//                   {/* Assistant chip (only for candid services) */}
//                   <td className="text-nowrap">
//                     {isCandidService(r.service.serviceName) ? (
//                       r.assistant?.assistantName ? (
//                         <Chip tone="primary">
//                           <FaUserAlt />
//                           <span>{r.assistant.assistantName}</span>
//                         </Chip>
//                       ) : (
//                         <span className="text-muted">—</span>
//                       )
//                     ) : (
//                       <span className="text-muted">—</span>
//                     )}
//                   </td>

//                   <td className="text-nowrap">
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={
//                         <Tooltip id="tt-assign">Assign / Change Vendor</Tooltip>
//                       }
//                     >
//                       <Button
//                         variant="light"
//                         size="sm"
//                         className="btn-icon"
//                         onClick={() => handleAssignVendor(r.pkg._id)}
//                       >
//                         <FaExchangeAlt style={{ fontSize: "12px" }} />
//                       </Button>
//                     </OverlayTrigger>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </Table>

//         {/* Collect Data Modal */}
//         <Modal
//           show={showCollectDataModal} // <-- FIXED typo here
//           onHide={() => {
//             setShowCollectDataModal(false);
//             setSelectedVendor(null);
//             setEditMode(false);
//           }}
//           centered
//           size="lg"
//         >
//           <Modal.Header closeButton>
//             <Modal.Title className="fw-bold" style={{ fontSize: "16px" }}>
//               {editMode ? "Edit Collected Data" : "Collect Data"} -{" "}
//               {selectedVendor?.eventName || "Event"}
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form style={{ fontSize: "14px" }}>
//               <Row className="g-3">
//                 {/* Person Name */}
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Person Name</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="personName"
//                       value={collectData.personName}
//                       onChange={handleCollectDataChange}
//                       placeholder="Enter Person Name"
//                       readOnly={!!editMode || !!collectedDataList?.personName}
//                     />
//                   </Form.Group>
//                 </Col>

//                 {/* Camera Name */}
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Camera Name</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="cameraName"
//                       value={collectData.cameraName}
//                       onChange={handleCollectDataChange}
//                       placeholder="Enter Camera Name"
//                     />
//                   </Form.Group>
//                 </Col>

//                 {/* Total Drive Size */}
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Total Card/Drive/Pendrive Size</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="totalDriveSize"
//                       value={collectData.totalDriveSize}
//                       onChange={handleCollectDataChange}
//                       placeholder="Enter Total Size"
//                     />
//                   </Form.Group>
//                 </Col>

//                 {/* Filled Size */}
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Filled Size</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="filledSize"
//                       value={collectData.filledSize}
//                       onChange={handleCollectDataChange}
//                       placeholder="Enter Filled Size"
//                     />
//                   </Form.Group>
//                 </Col>

//                 {/* Copying Person */}
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Person Copying Data</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="copyingPerson"
//                       value={collectData.copyingPerson}
//                       onChange={handleCollectDataChange}
//                       placeholder="Enter Name of Person Copying"
//                     />
//                   </Form.Group>
//                 </Col>

//                 {/* System Number */}
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>System Number</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="systemNumber"
//                       value={collectData.systemNumber}
//                       onChange={handleCollectDataChange}
//                       placeholder="Enter System Number"
//                       readOnly={!!editMode || !!collectedDataList?.systemNumber}
//                     />
//                   </Form.Group>
//                 </Col>

//                 {/* Copied Location */}
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Copied Location</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="copiedLocation"
//                       value={collectData.copiedLocation}
//                       onChange={handleCollectDataChange}
//                       placeholder="Enter Copied Location"
//                     />
//                   </Form.Group>
//                 </Col>

//                 {/* No. of Photos */}
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>No. of Photos</Form.Label>
//                     <Form.Control
//                       type="number"
//                       name="noOfPhotos"
//                       value={collectData.noOfPhotos}
//                       onChange={handleCollectDataChange}
//                       placeholder="Enter No. of Photos"
//                     />
//                   </Form.Group>
//                 </Col>

//                 {/* No. of Videos */}
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>No. of Videos</Form.Label>
//                     <Form.Control
//                       type="number"
//                       name="noOfVideos"
//                       value={collectData.noOfVideos}
//                       onChange={handleCollectDataChange}
//                       placeholder="Enter No. of Videos"
//                     />
//                   </Form.Group>
//                 </Col>

//                 {/* Submission Date */}
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Submission Date</Form.Label>
//                     <Form.Control
//                       type="date"
//                       name="submissionDate"
//                       value={collectData.submissionDate}
//                       onChange={handleCollectDataChange}
//                     />
//                   </Form.Group>
//                 </Col>

//                 {/* Notes */}
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Notes</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="notes"
//                       value={collectData.notes}
//                       onChange={handleCollectDataChange}
//                       placeholder="Enter Notes"
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Form>
//           </Modal.Body>
//           <Modal.Footer className="justify-content-center">
//             <Button
//               variant="secondary"
//               onClick={() => {
//                 setShowCollectDataModal(false);
//                 setSelectedVendor(null);
//                 setEditMode(false);
//               }}
//               className="px-4"
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="dark"
//               onClick={handleCollectDataSubmit}
//               className="px-4"
//             >
//               {editMode ? "Update" : "Submit"}
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </Card>

//       {/* Package Details */}
//       {!isLoading && quotationData?.packages?.length > 0 && (
//         <div className="mb-4">
//           <div className="d-flex justify-content-between align-items-center my-2">
//             <h5 className="fw-bold mb-3">PACKAGE DETAILS</h5>
//             <div className="d-flex justify-content-between align-items-center">
//               <Button size="sm" variant="dark" onClick={openAlbumModal}>
//                 + Add Album
//               </Button>
//             </div>
//           </div>
//           {quotationData.packages.map((pkg, index) => {
//             const packageTotal = pkg.services.reduce(
//               (sum, srv) => sum + srv.qty * srv.price,
//               0
//             );
//             // Find if collected data exists for this package/event
//             const collectedEvent = collectedDataList?.events?.find(
//               (ev) =>
//                 ev.eventId === pkg._id || ev.eventId === pkg._id?.toString()
//             );

//             return (
//               <Card className="mb-4 border" key={pkg._id}>
//                 <Card.Header
//                   className="bg-light py-2 px-3 d-flex justify-content-between align-items-center"
//                   style={{ fontSize: "13px" }}
//                 >
//                   <div>
//                     <h6 className="fw-bold mb-1">{pkg.categoryName}</h6>
//                     <small className="text-muted d-block">
//                       {dayjs(pkg.eventStartDate).format("DD-MM-YYYY")} -{" "}
//                       {dayjs(pkg.eventEndDate).format("DD-MM-YYYY")}, {pkg.slot}
//                     </small>
//                     <div className="mt-1">
//                       <small className="d-block">
//                         <strong>Venue:</strong> {pkg.venueName}
//                       </small>
//                       <small className="d-block">
//                         <strong>Address:</strong> {pkg.venueAddress}
//                       </small>
//                     </div>
//                   </div>
//                   <div className="d-flex gap-3">
//                     {collectedEvent ? (
//                       <Button
//                         size="sm"
//                         variant="outline-secondary"
//                         onClick={() => handleEditCollectedEvent(collectedEvent)}
//                       >
//                         Edit Collected Data
//                       </Button>
//                     ) : (
//                       <Button
//                         size="sm"
//                         variant="dark"
//                         onClick={() => {
//                           setSelectedVendor({
//                             eventId: pkg._id,
//                             eventName: pkg.categoryName,
//                           });
//                           setEditMode(false);
//                           setShowCollectDataModal(true);
//                           setCollectData({
//                             personName: collectedDataList?.personName || "",
//                             cameraName: "",
//                             totalDriveSize: "",
//                             filledSize: "",
//                             copyingPerson: "",
//                             systemNumber: collectedDataList?.systemNumber || "",
//                             copiedLocation: "",
//                             noOfPhotos: "",
//                             noOfVideos: "",
//                             submissionDate: "",
//                             notes: "",
//                           });
//                         }}
//                       >
//                         Collect Data
//                       </Button>
//                     )}
//                     <Button
//                       size="sm"
//                       variant="outline-secondary"
//                       onClick={() => handleOpenPkgQty(pkg, index)}
//                     >
//                       Edit Package
//                     </Button>

//                   </div>
//                 </Card.Header>
//                 <Card.Body className="p-0">
//                   <Table bordered responsive className="mb-0">
//                     <thead className="table-light" style={{ fontSize: "12px" }}>
//                       <tr>
//                         <th style={{ width: "5%" }}>No</th>
//                         <th style={{ width: "45%" }}>Service</th>
//                         <th className="text-center" style={{ width: "10%" }}>
//                           Qty
//                         </th>
//                         <th className="text-center" style={{ width: "20%" }}>
//                           Unit Price
//                         </th>
//                         <th className="text-end" style={{ width: "20%" }}>
//                           Amount
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody style={{ fontSize: "12px" }}>
//                       {pkg.services.map((srv, idx) => (
//                         <tr key={srv._id}>
//                           <td className="text-center">{idx + 1}</td>
//                           <td>{srv.serviceName}</td>
//                           <td className="text-center">{srv.qty}</td>
//                           <td className="text-center">
//                             ₹{srv.price.toLocaleString()}
//                           </td>
//                           <td className="text-end">
//                             ₹{(srv.qty * srv.price).toLocaleString()}
//                           </td>
//                         </tr>
//                       ))}
//                       <tr className="fw-bold">
//                         <td colSpan="4" className="text-end">
//                           Package Total:
//                         </td>
//                         <td className="text-end">
//                           ₹{packageTotal.toLocaleString()}
//                         </td>
//                       </tr>
//                     </tbody>
//                   </Table>
//                 </Card.Body>
//               </Card>
//             );
//           })}

//           <AlbumsTable
//             albums={albums}
//             onQtyDelta={handleAlbumQtyDelta}
//             onPriceChange={handleAlbumPriceChange}
//             onRemove={handleAlbumRemove}
//             onView={handleAlbumView}
//             onEdit={handleAlbumEdit}
//           />

//           <AddAlbumModal
//             show={showAlbumModal}
//             onClose={closeAlbumModal}
//             onAdd={handleAlbumAdd}
//             onUpdate={handleAlbumUpdate}
//             mode={modalMode}
//             initialData={editingAlbum}
//             albumType="addons"
//             fetchQuotation={fetchQuotation}
//           />

//           <AlbumDetailsModal
//             show={!!viewAlbum}
//             onClose={() => setViewAlbum(null)}
//             album={viewAlbum}
//           />

//           <div className="p-3 border rounded bg-light mt-4">
//             <div className="d-flex justify-content-between mb-2">
//               <strong>Total Package Amount:</strong>
//               <span>₹{packageSubtotal.toLocaleString()}</span>
//             </div>

//             <div className="d-flex justify-content-between mb-2">
//               <strong>Album Total:</strong>
//               <span>₹{albumSubtotal.toLocaleString()} </span>
//             </div>
//             {/* {quotationData?.discountPercent && (
//               <> */}
//                 <div className="d-flex justify-content-between mb-2">
//                   <strong>Total Before Discount:</strong>
//                   <span>₹{totalBeforeDiscount.toLocaleString()} </span>
//                 </div>

//                 <div className="d-flex justify-content-between mb-2">
//                   <strong>Discount ({quotationData?.discountPercent}%)</strong>
//                   <span>- ₹{discount.toLocaleString()}</span>
//                 </div>
//               {/* </> */}
//             {/* )} */}

//             <div className="d-flex justify-content-between mb-2">
//               <strong>Sub Total:</strong>
//               <span>₹{totalAfterDiscount.toLocaleString()} </span>
//             </div>

//             {quotationData?.gstApplied && (
//               <div className="d-flex justify-content-between mb-2">
//                 <strong>GST 18%:</strong>
//                 <span>₹{gst.toLocaleString()}</span>
//               </div>
//             )}

//             <hr />

//             <div className="d-flex justify-content-between text-success fw-bold">
//               <h6 className="mb-0">Grand Total:</h6>
//               <h6 className="mb-0">₹{Number(grandTotal).toLocaleString()}</h6>
//             </div>

//             <hr />
//             {packageSubtotal > 0 && <div>
//               <div className="d-flex justify-content-between text-primary">
//                 <strong>Margin amount:</strong>
//                 <span>₹{totalMarginBeforeDiscount.toLocaleString()}</span>
//               </div>
//               <div className="d-flex justify-content-between text-primary">
//                 <strong>
//                   Margin after Discount ({quotationData?.discountPercent}%):
//                 </strong>
//                 <span>₹{marginAfterDiscount.toLocaleString()}</span>
//               </div>

//               {quotationData?.gstApplied && (
//                 <div className="d-flex justify-content-between text-primary">
//                   <strong>GST on Margin (18%):</strong>
//                   <span>₹{marginGst.toLocaleString()}</span>
//                 </div>
//               )}

//               <div className="d-flex justify-content-between text-success">
//                 <strong>Final Margin Total:</strong>
//                 <span>₹{totalMarginFinal.toLocaleString()}</span>
//               </div>
//             </div>}
//           </div>
//         </div>
//       )}

//       {/* Installments */}
//       <Card className="mb-4 shadow-sm border-0">
//         <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
//           <h6 className="fw-bold mb-0">Installment Details</h6>
//           <Button
//             variant="outline-dark"
//             size="sm"
//             onClick={handleAddInstallment}
//             disabled={getTotalAllocatedPercentage() >= 100}
//           >
//             <FaPlus className="me-2" /> Add Installment
//           </Button>
//         </div>
//         <div className="table-responsive">
//           <Table
//             className="mb-0"
//             bordered
//             hover
//             size="sm"
//             style={{ fontSize: "12px" }}
//           >
//             <thead className="table-light">
//               <tr>
//                 <th>Installment</th>
//                 <th>Percentage</th>
//                 <th>Amount</th>
//                 <th>Paid Amt</th>
//                 <th>Pending Amt</th>
//                 <th>Date</th>
//                 <th>Mode</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {installments.map((inst, index) => {
//                 // const amount = calculatePercentageAmount(
//                 //   inst.paymentPercentage
//                 // );

//                 // const pending = calcPendingAmt(
//                 //   inst.status,
//                 //   amount,
//                 //   inst.paidAmount
//                 // );

//                 // const paid = calcPaidAmt(inst.status, inst.paymentAmount);

//                 console.log("inst", inst)

//                 return (
//                   <tr key={index}>
//                     <td>Installment {index + 1}</td>

//                     <td>
//                       {editIndex === index && inst.status !== "Completed" ? (
//                         <Form.Control
//                           type="number"
//                           min="0"
//                           max="100"
//                           value={inst.paymentPercentage}
//                           onChange={(e) =>
//                             handleFieldChange(
//                               index,
//                               "paymentPercentage",
//                               e.target.value
//                             )
//                           }
//                           style={{ fontSize: "13px", width: "80px" }}
//                         />
//                       ) : (
//                         `${inst.paymentPercentage}%`
//                       )}
//                     </td>
//                     {/* <td>₹{amount?.toLocaleString()} </td>
//                     <td>{paid?.toLocaleString()} </td>

//                     <td>₹{pending?.toLocaleString()} </td> */}
//                     <td>₹{inst.paymentAmount?.toLocaleString()} </td>
//                     <td>₹{inst.paidAmount?.toLocaleString()} </td>

//                     <td>₹{inst.pendingAmount?.toLocaleString()} </td>

//                     <td>

//                       {inst.dueDate}

//                     </td>
//                     <td>{inst.paymentMode || "-"}</td>
//                     <td>
//                       <span
//                         className={`badge ${inst.status === "Completed"
//                           ? "bg-success"
//                           : inst.status === "Partial Paid"
//                             ? "bg-primary" // Custom class defined in your CSS
//                             : "bg-danger"
//                           }`}
//                       >
//                         {inst.status}
//                       </span>
//                     </td>
//                     <td>
//                       {/* Edit and Save/Cancel buttons - only shown for Pending status */}
//                       {inst.status === "Pending" && (
//                         editIndex === index ? (
//                           <>
//                             <Button
//                               size="sm"
//                               variant="success"
//                               onClick={() => handleSaveInstallment(index)}
//                             >
//                               <FaSave />
//                             </Button>{' '}
//                             <Button
//                               size="sm"
//                               variant="secondary"
//                               onClick={() => setEditIndex(null)}
//                             >
//                               <FaTimes />
//                             </Button>
//                           </>
//                         ) : (
//                           <Button
//                             size="sm"
//                             variant=""
//                             onClick={() => handleEditToggle(index)}
//                           >
//                             <FaEdit />
//                           </Button>
//                         )
//                       )}

//                       {/* Delete button - only shown for Pending status */}
//                       {inst.status === "Pending" && (
//                         <Button
//                           variant=""
//                           size="sm"
//                           onClick={() => handleDeleteInstallment(index)}
//                           className="ms-1"
//                         >
//                           <img
//                             src={deleteIcon}
//                             alt="delete"
//                             width="14"
//                             height="14"
//                           />
//                         </Button>
//                       )}

//                       {/* Pay button - shown for Pending or Partial Paid status when there's pending amount */}
//                       {(inst.status === "Pending" || inst.status === "Partial Paid") && inst.pendingAmount > 0 && (
//                         <Button
//                           size="sm"
//                           variant="success"
//                           onClick={() => handleOpenPay(inst)}
//                           className="ms-1"
//                         >
//                           Pay
//                         </Button>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </Table>
//           <div className="text-end px-3 py-2">
//             <strong>Total Allocated: </strong>
//             {getTotalAllocatedPercentage()}%
//           </div>
//         </div>
//       </Card>

//       {/* Payment Modal */}
//       <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Record Payment</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <div className="mb-3">
//               <Form.Label>Payment Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={paymentData.paymentDate}
//                 onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
//               />
//             </div>

//             <div className="mb-3">
//               <Form.Label>Payment Mode</Form.Label>
//               <Form.Select
//                 value={paymentData.paymentMode}
//                 onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
//               >
//                 <option value="">Select Payment Mode</option>
//                 <option value="Cash">Cash</option>
//                 <option value="Online">Online</option>
//                 <option value="Cheque">Cheque</option>
//                 <option value="Bank Transfer">Bank Transfer</option>
//               </Form.Select>
//             </div>

//             <div className="mb-3">
//               <Form.Label>Amount</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={paymentData.amount}
//                 onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
//                 max={selectedInstallment?.pendingAmount}
//               />
//             </div>

//             <div className="mb-3">
//               <Form.Label>Status</Form.Label>
//               <Form.Select
//                 value={paymentData.status}
//                 onChange={(e) => setPaymentData({ ...paymentData, status: e.target.value })}
//               >
//                 <option value="Completed">Completed</option>
//                 <option value="Partial Paid">Partial Paid</option>
//               </Form.Select>
//             </div>
//           </Form>

//           <hr />

//           <div className="text-center">
//             <h5>Total Amount: ₹{selectedInstallment?.paymentAmount?.toLocaleString()}</h5>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             onClick={handlePaymentSubmit}
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? 'Processing...' : 'Submit Payment'}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <Modal show={pkgQtyModalOpen} onHide={closePkgQtyModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Service Quantities</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {pkgDraft ? (
//             <Table bordered size="sm" className="mb-0">
//               <thead className="table-light">
//                 <tr>
//                   <th style={{ width: "55%" }}>Service</th>
//                   <th className="text-center" style={{ width: "20%" }}>Qty</th>
//                   <th className="text-end" style={{ width: "25%" }}>Amount</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(pkgDraft.services || []).map((srv, idx) => {
//                   const qty = Math.max(1, Number(srv.qty) || 1);
//                   const price = Number(srv.price) || 0;
//                   const line = qty * price;
//                   return (
//                     <tr key={srv._id || idx}>
//                       <td>{srv.serviceName}</td>
//                       <td className="text-center">
//                         <div className="d-inline-flex align-items-center gap-2">
//                           <Button
//                             size="sm"
//                             variant="light"
//                             onClick={() => changeDraftQty(idx, -1)}
//                           >
//                             -
//                           </Button>
//                           <Form.Control
//                             size="sm"
//                             style={{ width: 70, textAlign: "center" }}
//                             value={qty}
//                             onChange={(e) => setDraftQtyInput(idx, e.target.value)}
//                           />
//                           <Button
//                             size="sm"
//                             variant="light"
//                             onClick={() => changeDraftQty(idx, +1)}
//                           >
//                             +
//                           </Button>
//                         </div>
//                       </td>
//                       <td className="text-end">₹{line.toLocaleString()}</td>
//                     </tr>
//                   );
//                 })}
//                 <tr className="fw-bold">
//                   <td colSpan={2} className="text-end">Package Total</td>
//                   <td className="text-end">₹{pkgDraftTotal.toLocaleString()}</td>
//                 </tr>
//               </tbody>
//             </Table>
//           ) : (
//             <div className="text-muted">No services</div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={closePkgQtyModal}>
//             Cancel
//           </Button>
//           <Button variant="dark" onClick={handleSavePkgQty}>
//             Save Package
//           </Button>
//         </Modal.Footer>
//       </Modal>

//     </div>
//   );
// };

// export default BookingdetailsPage;

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Card,
  Modal,
  Row,
  Col,
  Tooltip,
  OverlayTrigger,
  Alert,
} from "react-bootstrap";
import {
  FaPlus,
  FaMinus,
  FaEdit,
  FaSave,
  FaTimes,
  FaExchangeAlt,
  FaClipboardList,
  FaUserTie,
  FaUserAlt,
  FaInstagram,
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import deleteIcon from "../../assets/icons/deleteIcon.png";
import axios from "axios";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddAlbumModal from "../Albums/AddAlbumModal";
import AlbumsTable from "../Albums/AlbumsTable";
import AlbumDetailsModal from "../Albums/AlbumDetailsModal";
import { computeAlbumTotal, fmt } from "../../utils/albumUtils";

const Chip = ({ children, tone = "light" }) => (
  <span className={`chip chip-${tone}`}>{children}</span>
);

const paymentModes = [
  { value: "", label: "-" },
  { value: "Online", label: "Online" },
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
  { value: "Other", label: "Other" },
];

const statusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
];

const BookingdetailsPage = () => {
  const [quotationData, setQuotationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [installments, setInstallments] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [startFilter, setStartFilter] = useState(null);
  const [endFilter, setEndFilter] = useState(null);
  const [newInstruction, setNewInstruction] = useState("");
  const [showCollectDataModal, setShowCollectDataModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [collectedDataList, setCollectedDataList] = useState(null);
  const [editMode, setEditMode] = useState(false); // Track if editing
  const [albums, setAlbums] = useState([]);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [viewAlbum, setViewAlbum] = useState(null);

  const [collectData, setCollectData] = useState({
    personName: "",
    cameraName: "",
    totalDriveSize: "",
    filledSize: "",
    copyingPerson: "",
    systemNumber: "",
    copiedLocation: "",
    noOfPhotos: "",
    noOfVideos: "",
    submissionDate: "",
    notes: "",
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentDate: dayjs().format("YYYY-MM-DD"),
    paymentMode: "Online",
    amount: "",
    status: "Completed",
  });

  // Account holder state
  const [existingHolders, setExistingHolders] = useState([]);
  const [newHolders, setNewHolders] = useState([{ name: "", amount: "" }]);

  // --- package qty edit modal state ---
  const [pkgQtyModalOpen, setPkgQtyModalOpen] = useState(false);
  const [pkgEditIndex, setPkgEditIndex] = useState(null); // index in quotationData.packages
  const [pkgDraft, setPkgDraft] = useState(null); // deep copy of the package being edited

  // Add state for person edit modal
  const [showPersonEditModal, setShowPersonEditModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [personFormData, setPersonFormData] = useState({
    name: "",
    phoneNo: "",
    email: "",
    profession: "",
    instagramHandle: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();

  // Add function to handle opening person edit modal
  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setPersonFormData({
      name: person.name || "",
      phoneNo: person.phoneNo || "",
      email: person.email || "",
      profession: person.profession || "",
      instagramHandle: person.instagramHandle || "",
    });
    setShowPersonEditModal(true);
  };

  // Add function to handle person form changes
  const handlePersonFormChange = (e) => {
    const { name, value } = e.target;
    setPersonFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add function to save person details
  const handleSavePersonDetails = async () => {
    try {
      // For Instagram-only update
      const res = await axios.put(
        `http://localhost:5000/api/lead/${quotationData?.leadId?._id}/person/${editingPerson._id}/insta-handle`,
        { instagramHandle: personFormData.instagramHandle } // Send only Instagram handle
      );

      // Update local state with the updated person data
      setQuotationData((prev) => ({
        ...prev,
        leadId: {
          ...prev.leadId,
          persons: prev.leadId.persons.map((p) =>
            p._id === editingPerson._id
              ? { ...p, instagramHandle: personFormData.instagramHandle }
              : p
          ),
        },
      }));

      toast.success("Instagram handle updated successfully");
      setShowPersonEditModal(false);
    } catch (error) {
      console.error("Update Instagram error:", error);
      toast.error("Failed to update Instagram handle");
    }
  };

  const handleAddInstruction = async () => {
    if (!newInstruction.trim()) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/quotations/${id}/instruction/add`,
        {
          instruction: newInstruction.trim(),
        }
      );

      setQuotationData((prev) => ({
        ...prev,
        clientInstructions: res.data.clientInstructions,
      }));

      setNewInstruction(""); // clear input
      toast.success("Instruction added");
    } catch (error) {
      console.error("Add instruction error:", error);
      toast.error("Failed to add instruction");
    }
  };

  const handleRemoveInstruction = async (instructionToDelete) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/quotations/${id}/instruction/delete`,
        {
          data: { instruction: instructionToDelete },
        }
      );

      setQuotationData((prev) => ({
        ...prev,
        clientInstructions: res.data.clientInstructions,
      }));

      toast.success("Instruction deleted");
    } catch (error) {
      console.error("Delete instruction error:", error);
      toast.error("Failed to delete instruction");
    }
  };

  // Fetch collected data for this quotation
  useEffect(() => {
    const fetchCollectedData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/collected-data/${id}`
        );
        setCollectedDataList(res.data.data); // .data is the CollectedData doc
      } catch (err) {
        setCollectedDataList(null);
      }
    };
    if (id) fetchCollectedData();
  }, [id, showCollectDataModal]); // refetch after modal closes

  const fetchQuotation = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/quotations/${id}`);
      const q = res.data.quotation;
      setQuotationData(q);
      setInstallments(q.installments || []);
      setAlbums(q.albums || []); // <-- add this line
      console.log("res.data.q", q);
    } catch (err) {
      toast.error("Error loading quotation");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchQuotation();
  }, [id]);

  // Package subtotal (generic helper) — keep if not already present
  const computePackageSubtotalNow = (packagesArr = []) =>
    Math.round(
      (packagesArr || []).reduce(
        (sum, pkg) =>
          sum +
          (pkg.services || []).reduce(
            (s, srv) => s + (Number(srv.qty) || 1) * (Number(srv.price) || 0),
            0
          ),
        0
      )
    );

  // Draft package total (for showing inside the modal)
  const pkgDraftTotal = useMemo(() => {
    if (!pkgDraft) return 0;
    return (pkgDraft.services || []).reduce(
      (s, srv) => s + (Number(srv.qty) || 1) * (Number(srv.price) || 0),
      0
    );
  }, [pkgDraft]);

  const packageSubtotal = Math.round(
    (quotationData?.packages || []).reduce(
      (sum, pkg) =>
        sum +
        (pkg.services || []).reduce(
          (s, srv) => s + Number(srv.qty || 1) * Number(srv.price || 0),
          0
        ),
      0
    )
  );

  const albumSubtotal = useMemo(
    () =>
      Math.round(
        (albums || []).reduce((sum, a) => sum + computeAlbumTotal(a), 0)
      ),
    [albums]
  );

  const totalBeforeDiscount = Math.round(packageSubtotal + albumSubtotal);
  const discount = Math.round(
    (totalBeforeDiscount * (quotationData?.discountPercent || 0)) / 100
  );
  const totalAfterDiscount = Math.round(totalBeforeDiscount - discount);
  const gst = quotationData?.gstApplied
    ? Math.round(totalAfterDiscount * 0.18)
    : 0;
  const totalAmount = Math.round(totalAfterDiscount + gst) || 0;
  const grandTotal = totalAmount;

  const packageMarginSubtotal = Math.round(
    (quotationData?.packages || []).reduce(
      (sum, pkg) =>
        sum +
        (pkg.services || []).reduce(
          (s, srv) => s + Number(srv.qty || 1) * Number(srv.marginPrice || 0),
          0
        ),
      0
    )
  );

  const totalMarginBeforeDiscount = Math.round(
    packageMarginSubtotal + albumSubtotal
  );
  const marginDiscount = Math.round(
    (totalMarginBeforeDiscount * (quotationData?.discountPercent || 0)) / 100
  );
  const marginAfterDiscount = Math.round(
    totalMarginBeforeDiscount - marginDiscount
  );
  const marginGst = quotationData?.gstApplied
    ? Math.round(marginAfterDiscount * 0.18)
    : 0;
  const totalMarginFinal = Math.round(marginAfterDiscount + marginGst);
  // Compute album subtotal for any array (used when we have a "next" array)
  const computeAlbumSubtotalNow = (albumsArr) =>
    Math.round(
      (albumsArr || []).reduce((sum, a) => sum + computeAlbumTotal(a), 0)
    );

  // In BookingdetailsPage.js
  const calculateInstallmentDetails = (installments, currentGrandTotal) => {
    return installments.map((inst) => {
      const amount = Math.round(
        (inst.paymentPercentage / 100) * currentGrandTotal
      );
      const pending =
        inst.status === "Completed" ? amount - (inst.paidAmount || 0) : amount;

      // Determine status - if marked Completed but has pending amount, change to Partial
      let status = inst.status;
      if (inst.status === "Completed" && pending > 0) {
        status = "Partial Paid";
      } else if (inst.status === "Partial Paid" && pending <= 0) {
        status = "Completed";
      }

      return {
        ...inst,
        paymentAmount: amount,
        pendingAmount: pending,
        paidAmount: inst.status === "Completed" ? inst.paymentAmount : 0,
        status,
      };
    });
  };

  // Build exactly the minimal payload your backend wants to store
  const buildMinimalTotals = (
    albumsOverride = null,
    packagesOverride = null
  ) => {
    const albumsArr = Array.isArray(albumsOverride) ? albumsOverride : albums;
    const packagesArr = Array.isArray(packagesOverride)
      ? packagesOverride
      : quotationData?.packages || [];

    const albumSubtotalNow = computeAlbumSubtotalNow(albumsArr);
    const packageSubtotalNow = computePackageSubtotalNow(packagesArr);

    const totalBeforeDiscountNow = Math.round(
      packageSubtotalNow + albumSubtotalNow
    );
    const discountNow = Math.round(
      (totalBeforeDiscountNow * (quotationData?.discountPercent || 0)) / 100
    );
    const totalAfterDiscountNow = Math.round(
      totalBeforeDiscountNow - discountNow
    );
    const gstNow = quotationData?.gstApplied
      ? Math.round(totalAfterDiscountNow * 0.18)
      : 0;
    const grandTotalNow = Math.round(totalAfterDiscountNow + gstNow);

    // Calculate new installment amounts based on new grand total
    // PRESERVE EXISTING ACCOUNT HOLDERS
    const calculatedInstallments = (installments || []).map((inst) => {
      const newAmount = Math.round(
        (inst.paymentPercentage / 100) * grandTotalNow
      );
      return {
        ...inst, // Keep all existing properties including accountHolders
        paymentAmount: newAmount, // Only update the amount
      };
    });

    // Redistribute existing payments intelligently
    let remainingPayment = 0;
    const finalInstallments = calculatedInstallments.map((inst) => {
      // If installment was previously paid (either fully or partially)
      const previouslyPaid = inst.paidAmount || 0;

      // Calculate how much should be paid for this installment in new structure
      const newPaidAmount = Math.min(
        inst.paymentAmount,
        previouslyPaid + remainingPayment
      );

      // Calculate pending amount
      const pending = inst.paymentAmount - newPaidAmount;

      // Update remaining payment that can be applied to next installments
      remainingPayment = previouslyPaid + remainingPayment - newPaidAmount;

      // Determine status
      let status = inst.status;
      if (newPaidAmount >= inst.paymentAmount) {
        status = "Completed";
      } else if (newPaidAmount > 0) {
        status = "Partial Paid";
      } else {
        status = "Pending";
      }

      return {
        ...inst, // Keep all properties including accountHolders
        paidAmount: newPaidAmount,
        pendingAmount: pending,
        status,
      };
    });

    // If there's still remaining payment after processing all installments,
    // add it to the last installment as an overpayment
    if (remainingPayment > 0 && finalInstallments.length > 0) {
      const last = finalInstallments[finalInstallments.length - 1];
      last.paidAmount += remainingPayment;
      last.pendingAmount = Math.max(0, last.paymentAmount - last.paidAmount);
      last.status = "Completed";
    }

    // Margin calculations (kept as-is)
    const totalMarginBeforeDiscountNow = Math.round(
      packageMarginSubtotal + albumSubtotalNow
    );
    const marginDiscountNow = Math.round(
      (totalMarginBeforeDiscountNow * (quotationData?.discountPercent || 0)) /
        100
    );
    const marginAfterDiscountNow = Math.round(
      totalMarginBeforeDiscountNow - marginDiscountNow
    );
    const marginGstNow = quotationData?.gstApplied
      ? Math.round(marginAfterDiscountNow * 0.18)
      : 0;
    const totalMarginFinalNow = Math.round(
      marginAfterDiscountNow + marginGstNow
    );

    return {
      totalPackageAmt: packageSubtotalNow,
      totalAlbumAmount: albumSubtotalNow,
      discountValue: discountNow,
      gstValue: gstNow,
      totalAmount: grandTotalNow,
      installments: finalInstallments, // This now includes accountHolders
      totalMarginFinal: totalMarginFinalNow,
    };
  };
  const pushMinimalTotalsFrom = async (albumsOverride = null) => {
    try {
      const payload = buildMinimalTotals(albumsOverride);
      await axios.put(
        `http://localhost:5000/api/quotations/${id}/totals-min`,
        payload
      );
      // Update local state with calculated installments
      // setInstallments(payload.installments);
      fetchQuotation();
      // Optional: toast.success("Totals updated");
    } catch (e) {
      console.error("Failed to update totals", e);
      toast.error("Failed to update totals on server");
    }
  };

  const savePackagesAndTotals = async (nextPackages, editedPackageIndex) => {
    // Calculate totals based on the updated packages
    const totals = buildMinimalTotals(null, nextPackages);

    // Prepare payload - only include the edited package if index is provided
    const payload = {
      // Only include the edited package if index is specified
      package:
        editedPackageIndex !== undefined
          ? nextPackages[editedPackageIndex]
          : null,

      totalPackageAmt: totals.totalPackageAmt,
      totalAlbumAmount: totals.totalAlbumAmount,
      discountValue: totals.discountValue,
      gstValue: totals.gstValue,
      totalAmount: totals.grandTotal,
      grandTotal: totals.grandTotal,
      totalMarginFinal: totals.totalMarginFinal,
      installments: totals.installments,
    };

    console.log("payload", payload);

    const res = await axios.put(
      `http://localhost:5000/api/quotations/${id}/totals-min`,
      payload
    );

    // If your API returns the updated quotation, prefer that:
    if (res?.data?.quotation) {
      setQuotationData(res.data.quotation);
    } else {
      // Fallback: refetch fresh data
      await fetchQuotation();
    }
  };

  // Open the modal with a deep copy of the selected package
  const handleOpenPkgQty = (pkg, index) => {
    setPkgEditIndex(index);
    setPkgDraft(JSON.parse(JSON.stringify(pkg))); // deep clone
    setPkgQtyModalOpen(true);
  };

  const closePkgQtyModal = () => {
    setPkgQtyModalOpen(false);
    setPkgEditIndex(null);
    setPkgDraft(null);
  };

  // +/- buttons
  const changeDraftQty = (srvIndex, delta) => {
    setPkgDraft((p) => {
      const services = [...(p.services || [])];
      const srv = { ...services[srvIndex] };
      const current = Number(srv.qty) || 1;
      const next = Math.max(1, current + delta);
      srv.qty = next;
      services[srvIndex] = srv;
      return { ...p, services };
    });
  };

  // direct input (keeps min = 1)
  const setDraftQtyInput = (srvIndex, val) => {
    const n = Math.max(1, parseInt(String(val).replace(/\D/g, "") || "1", 10));
    setPkgDraft((p) => {
      const services = [...(p.services || [])];
      services[srvIndex] = { ...services[srvIndex], qty: n };
      return { ...p, services };
    });
  };

  // Save back to state, then persist packages + totals + installments
  const handleSavePkgQty = async () => {
    if (pkgEditIndex == null || !pkgDraft) return;

    const nextPackages = (quotationData?.packages || []).map((p, i) =>
      i === pkgEditIndex
        ? {
            ...p,
            services: (pkgDraft.services || []).map((s) => ({
              ...s,
              qty: Math.max(1, Number(s.qty) || 1), // enforce min 1
            })),
          }
        : p
    );

    // Optimistic UI update
    setQuotationData((prev) => ({ ...prev, packages: nextPackages }));
    closePkgQtyModal();

    try {
      await savePackagesAndTotals(nextPackages, pkgEditIndex); // Pass the edited index
      toast.success("Package updated");
      fetchQuotation();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save package");
    }
  };

  const filteredPackages = quotationData?.packages?.filter((pkg) => {
    const startDate = dayjs(pkg.eventStartDate).toDate();
    const endDate = dayjs(pkg.eventEndDate).toDate();
    const afterStart = !startFilter || startDate >= startFilter;
    const beforeEnd = !endFilter || endDate <= endFilter;
    return afterStart && beforeEnd;
  });

  // Only these services have assistants
  const isCandidService = (name = "") =>
    name === "Candid Photographer" || name === "Candid Cinematographer";

  const getTotalAllocatedPercentage = (customList = installments) => {
    return customList.reduce(
      (sum, i) => sum + (Number(i.paymentPercentage) || 0),
      0
    );
  };

  const handleEditToggle = (index) => {
    if (editIndex === index) {
      setEditIndex(null);
    } else {
      setEditIndex(index);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...installments];
    updated[index][field] = value;

    // recalculate amount if percentage changes
    if (field === "paymentPercentage") {
      const raw = value.replace(/[^0-9.]/g, "");
      if (raw === "") {
        updated[index].paymentPercentage = "";
      } else {
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          updated[index].paymentPercentage = parsed;
          updated[index].paymentAmount = Math.round(
            (totalAmount * parsed) / 100
          );
        }
      }
    }
    setInstallments(updated);
  };

  const handleEditCollectedEvent = (event) => {
    setSelectedVendor({
      eventId: event.eventId,
      eventName: event.eventName,
    });
    setCollectData({
      personName: collectedDataList.personName,
      cameraName: event.cameraName || "",
      totalDriveSize: event.totalDriveSize || "",
      filledSize: event.filledSize || "",
      copyingPerson: event.copyingPerson || "",
      systemNumber: collectedDataList.systemNumber,
      copiedLocation: event.copiedLocation || "",
      noOfPhotos: event.noOfPhotos || "",
      noOfVideos: event.noOfVideos || "",
      submissionDate: event.submissionDate
        ? dayjs(event.submissionDate).format("YYYY-MM-DD")
        : "",
      notes: event.notes || "",
    });
    setEditMode(true);
    setShowCollectDataModal(true);
  };

  const handleCollectDataChange = (e) => {
    const { name, value } = e.target;
    setCollectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCollectDataSubmit = async () => {
    try {
      const payload = {
        quotationId: id,
        quotationUniqueId: quotationData?.quotationId,
        personName: collectData.personName,
        systemNumber: collectData.systemNumber,
        eventId: selectedVendor?.eventId,
        eventName: selectedVendor?.eventName,
        cameraName: collectData.cameraName,
        totalDriveSize: collectData.totalDriveSize,
        filledSize: collectData.filledSize,
        copyingPerson: collectData.copyingPerson,
        copiedLocation: collectData.copiedLocation,
        noOfPhotos: collectData.noOfPhotos,
        noOfVideos: collectData.noOfVideos,
        submissionDate: collectData.submissionDate,
        notes: collectData.notes,
      };

      await axios.post("http://localhost:5000/api/collected-data/", payload);
      toast.success(
        editMode ? "Data updated successfully" : "Data collected successfully"
      );
      setShowCollectDataModal(false);
      setSelectedVendor(null);
      setEditMode(false);
      setCollectData({
        personName: "",
        cameraName: "",
        totalDriveSize: "",
        filledSize: "",
        copyingPerson: "",
        systemNumber: "",
        copiedLocation: "",
        noOfPhotos: "",
        noOfVideos: "",
        submissionDate: "",
        notes: "",
      });
    } catch (err) {
      toast.error("Failed to collect data");
    }
  };

  const handleSaveInstallment = async (index) => {
    const inst = installments[index];
    const newTotal = getTotalAllocatedPercentage();

    if (newTotal > 100) {
      toast.error("Total percentage exceeds 100%");
      return;
    }

    const payload = {
      paymentPercentage: inst.paymentPercentage,
      paymentAmount: inst.paymentAmount,
      dueDate: inst.dueDate,
      paymentMode: inst.paymentMode,
    };

    try {
      let response;

      if (inst._id) {
        // 🔁 Update existing installment
        response = await axios.put(
          `http://localhost:5000/api/quotations/${id}/installment/${inst._id}`,
          payload
        );
      } else {
        // 🆕 Create new installment (use `new` as dummy ID)
        response = await axios.put(
          `http://localhost:5000/api/quotations/${id}/installment/new`,
          payload
        );
      }

      // ✅ Update frontend list from latest response
      const updatedList = response.data.quotation.installments;
      setInstallments(updatedList);
      setEditIndex(null);
      toast.success("Installment saved");
    } catch (err) {
      console.error("Save error", err);
      toast.error("Save failed");
    }
  };

  const handleDeleteInstallment = async (index) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this installment?"
    );
    if (!confirm) return;

    const inst = installments[index];

    try {
      await axios.delete(
        `http://localhost:5000/api/quotations/${id}/installment/${inst._id}`
      );
      toast.success("Installment deleted successfully");

      const updated = [...installments];
      updated.splice(index, 1);
      setInstallments(updated);
    } catch (err) {
      toast.error("Failed to delete installment");
      console.error(err);
    }
  };

  const handleAddInstallment = () => {
    const total = getTotalAllocatedPercentage();
    if (total >= 100) {
      toast.error("Total percentage already 100%");
      return;
    }
    const newInstallment = {
      installmentNumber: installments.length + 1,
      paymentPercentage: 0,
      paymentAmount: 0,
      dueDate: "",
      paymentMode: "",
      status: "Pending",
    };
    setInstallments([...installments, newInstallment]);
  };

  // Flatten to one row per service unit
  const rows = (filteredPackages || []).flatMap((pkg) =>
    (pkg.services || []).flatMap((srv) => {
      const qty = Math.max(1, srv.qty || 1);

      // normalize to arrays (compat with old singular assignedVendor)
      const vendorArr = Array.isArray(srv.assignedVendors)
        ? srv.assignedVendors
        : srv.assignedVendor
        ? [srv.assignedVendor]
        : [];
      const asstArr = Array.isArray(srv.assignedAssistants)
        ? srv.assignedAssistants
        : [];

      return Array.from({ length: qty }, (_, unitIndex) => ({
        pkg,
        service: srv,
        unitIndex,
        vendor: vendorArr[unitIndex] || null,
        assistant: isCandidService(srv.serviceName)
          ? asstArr[unitIndex] || null
          : null,
      }));
    })
  );

  // Keep your existing vendor-assign flow per package
  const handleAssignVendor = (packageId) => {
    navigate(`/vendors/vendor-assign/${id}/${packageId}`, {
      state: { returnPath: `/booking/booking-details/${id}` },
    });
  };

  // add flow
  const openAlbumModal = () => {
    setModalMode("add");
    setShowAlbumModal(true);
  };
  const closeAlbumModal = () => {
    setShowAlbumModal(false);
    setEditingAlbum(null);
  };
  const handleAlbumAdd = (item) => {
    const next = [...albums, item]; // 1) compute next list
    setAlbums(next); // 2) update UI
    setShowAlbumModal(false);

    // 3) persist minimal totals based on the NEXT list
    pushMinimalTotalsFrom(next);
  };

  const getAlbumId = (a) => a?._id || a?.id;

  const handleAlbumEdit = (albumId) => {
    const found = albums.find((a) => getAlbumId(a) === albumId);
    if (!found) return;
    setEditingAlbum(found);
    setModalMode("edit");
    setShowAlbumModal(true);
  };
  // Update
  const handleAlbumUpdate = (serverAlbum) => {
    const idToMatch = getAlbumId(serverAlbum);
    const next = albums.map((a) =>
      getAlbumId(a) === idToMatch ? serverAlbum : a
    );

    setAlbums(next);
    toast.success("Album updated");
    setShowAlbumModal(false);
    setEditingAlbum(null);

    // persist minimal totals based on the NEXT list
    pushMinimalTotalsFrom(next);
  };

  // view flow
  const handleAlbumView = (albumId) => {
    const found = albums.find((a) => getAlbumId(a) === albumId);
    if (found) setViewAlbum(found);
  };

  // existing qty/price/remove handlers stay the same
  const handleAlbumQtyDelta = (id, delta) =>
    setAlbums((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, qty: Math.max(1, (a.qty || 1) + delta) } : a
      )
    );
  const handleAlbumPriceChange = (id, val) =>
    setAlbums((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unitPrice: Number(val) || 0 } : a))
    );

  const handleAlbumRemove = async (albumId) => {
    // Ask first
    const album = albums.find((a) => a._id === albumId || a.id === albumId);
    const name =
      album?.snapshot?.templateLabel || album?.templateId || "this album";
    const ok = window.confirm(`Are you sure you want to remove ${name}?`);
    if (!ok) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/quotations/${id}/albums/${albumId}`
      );

      // Prefer server list; fallback to local
      const next = Array.isArray(res?.data?.albums)
        ? res.data.albums
        : albums.filter((a) => a._id !== albumId && a.id !== albumId);

      setAlbums(next);
      toast.success("Album removed");

      // Persist minimal totals for the updated list
      await pushMinimalTotalsFrom(next);
    } catch (err) {
      console.error("Delete error:", err);
      const message = err.response?.data?.message || "Failed to remove album";
      toast.error(message);
    }
  };

  const handleOpenPay = (installment) => {
    setSelectedInstallment(installment);

    const pending = Number(installment.pendingAmount || 0); // ✅ always use pending
    const alreadyPaid = Array.isArray(installment.accountHolders)
      ? installment.accountHolders.reduce(
          (s, h) => s + Number(h.amount || 0),
          0
        )
      : 0;

    setPaymentData({
      paymentDate: installment.dueDate
        ? dayjs(installment.dueDate, ["DD-MM-YYYY", "YYYY-MM-DD"]).format(
            "YYYY-MM-DD"
          )
        : dayjs().format("YYYY-MM-DD"),
      paymentMode: installment.paymentMode || "Online",
      amount: pending, // ✅ fix: set to pending only
      status: pending === 0 ? "Completed" : "Partial Paid",
    });

    setExistingHolders(installment.accountHolders || []);

    setNewHolders([{ name: "", amount: pending.toString() }]); // ✅ same pending
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    const name = (newHolders[0]?.name || "").trim();
    const amount = Number(paymentData.amount || 0);

    if (!name || amount <= 0) {
      toast.error("Enter account holder name.");
      return;
    }

    // Check if account holder already exists
    const existingHolderIndex = existingHolders.findIndex(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    );

    const alreadyPaid = existingHolders.reduce(
      (sum, h) => sum + Number(h.amount || 0),
      0
    );
    const planned = Number(selectedInstallment?.paymentAmount || 0);

    if (alreadyPaid + amount > planned) {
      toast.error(
        `Total would exceed installment. Planned ₹${planned.toLocaleString()}, already paid ₹${alreadyPaid.toLocaleString()}, new ₹${amount.toLocaleString()}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      let updatedHolders;

      if (existingHolderIndex !== -1) {
        // Update existing holder's amount
        updatedHolders = [...existingHolders];
        updatedHolders[existingHolderIndex] = {
          ...updatedHolders[existingHolderIndex],
          amount: updatedHolders[existingHolderIndex].amount + amount,
        };
      } else {
        // Add new holder
        updatedHolders = [...existingHolders, { name, amount }];
      }

      const payload = {
        paymentAmount: planned,
        paymentMode: paymentData.paymentMode,
        paymentDate: paymentData.paymentDate,
        status:
          alreadyPaid + amount >= planned ? "Completed" : paymentData.status,
        accountHolders: updatedHolders, // Use the updated holders array
      };

      const res = await axios.put(
        `http://localhost:5000/api/quotations/${id}/installment/${selectedInstallment._id}`,
        payload
      );

      if (res.data?.success) {
        toast.success("Payment recorded successfully!");

        // ✅ Update installments immediately
        if (res.data.quotation?.installments) {
          setInstallments(res.data.quotation.installments);
        }

        setShowPaymentModal(false);
      } else {
        throw new Error(res.data?.message || "Payment failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <Card className="mb-4 shadow-sm border-0">
        <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
          <h6 className="fw-bold mb-0">Customer Details</h6>
        </div>
        {isLoading ? (
          <div className="px-3 py-4">Loading...</div>
        ) : (
          <div className="px-3 py-3">
            <div className="row mb-3" style={{ fontSize: "12px" }}>
              <div className="col-md-4">
                <strong>Lead ID:</strong>{" "}
                <span className="text-primary">
                  {quotationData?.leadId?.leadId}
                </span>
              </div>
              <div className="col-md-4">
                <strong>Query ID:</strong>{" "}
                <span>{quotationData?.quotationId}</span>
              </div>
              <div className="col-md-4">
                <strong>Reference:</strong>{" "}
                <span>{quotationData?.leadId?.referenceForm}</span>
              </div>
              <div className="col-md-4 " style={{fontSize:"16px"}} >
                <strong>Note:</strong> <span>{quotationData?.quoteNote}</span>
              </div>
            </div>
            <div>
              <h6 className="fw-bold">Persons</h6>
              <div className="row g-3">
                {quotationData?.leadId?.persons?.map((person) => (
                  <div className="col-md-6" key={person._id}>
                    <div className="d-flex align-items-center px-2 py-2 bg-white rounded shadow-sm border position-relative">
                      {/* Edit Button */}
                      <Button
                        variant="none"
                        size="sm"
                        className="position-absolute"
                        style={{ top: "8px", right: "8px" }}
                        onClick={() => handleEditPerson(person)}
                      >
                        <FaEdit size={12} />
                      </Button>

                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      >
                        {person.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-semibold">{person.name}</div>
                        <div style={{ fontSize: "13px", color: "#555" }}>
                          {person.phoneNo} | {person.email}
                        </div>
                        <span
                          className="badge bg-light text-dark"
                          style={{ fontSize: "10px" }}
                        >
                          {person.profession}
                        </span>
                        {person.instagramHandle && (
                          <div className="mt-1">
                            <FaInstagram className="text-danger me-1" />
                            <span style={{ fontSize: "12px", color: "#555" }}>
                              {person.instagramHandle}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Person Edit Modal */}
      <Modal
        show={showPersonEditModal}
        onHide={() => setShowPersonEditModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Instagram handle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={personFormData.name}
                    onChange={handlePersonFormChange}
                    placeholder="Enter name"
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNo"
                    value={personFormData.phoneNo}
                    onChange={handlePersonFormChange}
                    placeholder="Enter phone number"
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={personFormData.email}
                    onChange={handlePersonFormChange}
                    placeholder="Enter email"
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Profession</Form.Label>
                  <Form.Control
                    type="text"
                    name="profession"
                    value={personFormData.profession}
                    onChange={handlePersonFormChange}
                    placeholder="Enter profession"
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    <FaInstagram className="text-danger me-1" />
                    Instagram Account
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="instagramHandle"
                    value={personFormData.instagramHandle}
                    onChange={handlePersonFormChange}
                    placeholder="Enter Instagram username"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPersonEditModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSavePersonDetails}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="my-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>Assigned Vendors</strong>
        </Card.Header>

        {/* Client Instructions Inline Add */}
        <Card.Body>
          <div style={{ fontSize: "12px" }}>
            <strong>Client Instructions:</strong>
            <ul className="mt-2 ps-3">
              {quotationData?.clientInstructions?.map((item) => (
                <li
                  key={item}
                  className="d-flex justify-content-between align-items-center mb-1"
                >
                  <span>{item}</span>
                  <FaTimes
                    onClick={() => handleRemoveInstruction(item)}
                    style={{
                      cursor: "pointer",
                      fontSize: "10px",
                      color: "red",
                    }}
                  />
                </li>
              ))}
            </ul>

            {/* Add Instruction Input */}
            <div className="d-flex gap-2 mt-2">
              <Form.Control
                type="text"
                size="sm"
                placeholder="Write instruction..."
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
              />
              <Button
                variant="dark"
                size="sm"
                onClick={handleAddInstruction}
                className="d-flex align-items-center"
              >
                <FaPlus /> Add
              </Button>
            </div>
          </div>
        </Card.Body>

        {/* Vendors Table */}
        <Table className="vendor-table shadow-sm" striped hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Service </th>
              <th>Event</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Vendor</th>
              <th>Assistant</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  No rows
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={`${r.pkg._id}-${r.service._id}-${r.unitIndex}`}>
                  <td>{String(idx + 1).padStart(2, "0")}</td>

                  <td>
                    <div className="fw-semibold">
                      {r.service.serviceName}
                      <br />
                      {r.service.qty > 1 && (
                        <span className="unit-badge">
                          (unit {r.unitIndex + 1} of {r.service.qty})
                        </span>
                      )}
                    </div>
                  </td>

                  <td>{r.pkg.categoryName || "N/A"}</td>
                  <td>{dayjs(r.pkg.eventStartDate).format("DD-MM-YYYY")}</td>
                  <td>{dayjs(r.pkg.eventEndDate).format("DD-MM-YYYY")}</td>

                  {/* Vendor chip */}
                  <td className="text-nowrap">
                    {r.vendor?.vendorName ? (
                      <Chip tone="success">
                        <FaUserTie />
                        <span>{r.vendor.vendorName}</span>
                      </Chip>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  {/* Assistant chip (only for candid services) */}
                  <td className="text-nowrap">
                    {isCandidService(r.service.serviceName) ? (
                      r.assistant?.assistantName ? (
                        <Chip tone="primary">
                          <FaUserAlt />
                          <span>{r.assistant.assistantName}</span>
                        </Chip>
                      ) : (
                        <span className="text-muted">—</span>
                      )
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  <td className="text-nowrap">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tt-assign">Assign / Change Vendor</Tooltip>
                      }
                    >
                      <Button
                        variant="light"
                        size="sm"
                        className="btn-icon"
                        onClick={() => handleAssignVendor(r.pkg._id)}
                      >
                        <FaExchangeAlt style={{ fontSize: "12px" }} />
                      </Button>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Collect Data Modal */}
        <Modal
          show={showCollectDataModal} // <-- FIXED typo here
          onHide={() => {
            setShowCollectDataModal(false);
            setSelectedVendor(null);
            setEditMode(false);
          }}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold" style={{ fontSize: "16px" }}>
              {editMode ? "Edit Collected Data" : "Collect Data"} -{" "}
              {selectedVendor?.eventName || "Event"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form style={{ fontSize: "14px" }}>
              <Row className="g-3">
                {/* Person Name */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Person Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="personName"
                      value={collectData.personName}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Person Name"
                      readOnly={!!editMode || !!collectedDataList?.personName}
                    />
                  </Form.Group>
                </Col>

                {/* Camera Name */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Camera Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="cameraName"
                      value={collectData.cameraName}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Camera Name"
                    />
                  </Form.Group>
                </Col>

                {/* Total Drive Size */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Total Card/Drive/Pendrive Size</Form.Label>
                    <Form.Control
                      type="text"
                      name="totalDriveSize"
                      value={collectData.totalDriveSize}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Total Size"
                    />
                  </Form.Group>
                </Col>

                {/* Filled Size */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Filled Size</Form.Label>
                    <Form.Control
                      type="text"
                      name="filledSize"
                      value={collectData.filledSize}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Filled Size"
                    />
                  </Form.Group>
                </Col>

                {/* Copying Person */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Person Copying Data</Form.Label>
                    <Form.Control
                      type="text"
                      name="copyingPerson"
                      value={collectData.copyingPerson}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Name of Person Copying"
                    />
                  </Form.Group>
                </Col>

                {/* System Number */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>System Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="systemNumber"
                      value={collectData.systemNumber}
                      onChange={handleCollectDataChange}
                      placeholder="Enter System Number"
                      readOnly={!!editMode || !!collectedDataList?.systemNumber}
                    />
                  </Form.Group>
                </Col>

                {/* Copied Location */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Copied Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="copiedLocation"
                      value={collectData.copiedLocation}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Copied Location"
                    />
                  </Form.Group>
                </Col>

                {/* No. of Photos */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>No. of Photos</Form.Label>
                    <Form.Control
                      type="number"
                      name="noOfPhotos"
                      value={collectData.noOfPhotos}
                      onChange={handleCollectDataChange}
                      placeholder="Enter No. of Photos"
                    />
                  </Form.Group>
                </Col>

                {/* No. of Videos */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>No. of Videos</Form.Label>
                    <Form.Control
                      type="number"
                      name="noOfVideos"
                      value={collectData.noOfVideos}
                      onChange={handleCollectDataChange}
                      placeholder="Enter No. of Videos"
                    />
                  </Form.Group>
                </Col>

                {/* Submission Date */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Submission Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="submissionDate"
                      value={collectData.submissionDate}
                      onChange={handleCollectDataChange}
                    />
                  </Form.Group>
                </Col>

                {/* Notes */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      type="text"
                      name="notes"
                      value={collectData.notes}
                      onChange={handleCollectDataChange}
                      placeholder="Enter Notes"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer className="justify-content-center">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCollectDataModal(false);
                setSelectedVendor(null);
                setEditMode(false);
              }}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              variant="dark"
              onClick={handleCollectDataSubmit}
              className="px-4"
            >
              {editMode ? "Update" : "Submit"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>

      {/* Package Details */}
      {!isLoading && quotationData?.packages?.length > 0 && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center my-2">
            <h5 className="fw-bold mb-3">PACKAGE DETAILS</h5>
            <div className="d-flex justify-content-between align-items-center">
              <Button size="sm" variant="dark" onClick={openAlbumModal}>
                + Add Album
              </Button>
            </div>
          </div>
          {quotationData.packages.map((pkg, index) => {
            const packageTotal = pkg.services.reduce(
              (sum, srv) => sum + srv.qty * srv.price,
              0
            );
            // Find if collected data exists for this package/event
            const collectedEvent = collectedDataList?.events?.find(
              (ev) =>
                ev.eventId === pkg._id || ev.eventId === pkg._id?.toString()
            );

            return (
              <Card className="mb-4 border" key={pkg._id}>
                <Card.Header
                  className="bg-light py-2 px-3 d-flex justify-content-between align-items-center"
                  style={{ fontSize: "13px" }}
                >
                  <div>
                    <h6 className="fw-bold mb-1">{pkg.categoryName}</h6>
                    <small className="text-muted d-block">
                      {dayjs(pkg.eventStartDate).format("DD-MM-YYYY")} -{" "}
                      {dayjs(pkg.eventEndDate).format("DD-MM-YYYY")}, {pkg.slot}
                    </small>
                    <div className="mt-1">
                      <small className="d-block">
                        <strong>Venue:</strong> {pkg.venueName}
                      </small>
                      <small className="d-block">
                        <strong>Address:</strong> {pkg.venueAddress}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex gap-3">
                    {collectedEvent ? (
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => handleEditCollectedEvent(collectedEvent)}
                      >
                        Edit Collected Data
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="dark"
                        onClick={() => {
                          setSelectedVendor({
                            eventId: pkg._id,
                            eventName: pkg.categoryName,
                          });
                          setEditMode(false);
                          setShowCollectDataModal(true);
                          setCollectData({
                            personName: collectedDataList?.personName || "",
                            cameraName: "",
                            totalDriveSize: "",
                            filledSize: "",
                            copyingPerson: "",
                            systemNumber: collectedDataList?.systemNumber || "",
                            copiedLocation: "",
                            noOfPhotos: "",
                            noOfVideos: "",
                            submissionDate: "",
                            notes: "",
                          });
                        }}
                      >
                        Collect Data
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleOpenPkgQty(pkg, index)}
                    >
                      Edit Package
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table bordered responsive className="mb-0">
                    <thead className="table-light" style={{ fontSize: "12px" }}>
                      <tr>
                        <th style={{ width: "5%" }}>No</th>
                        <th style={{ width: "45%" }}>Service</th>
                        <th className="text-center" style={{ width: "10%" }}>
                          Qty
                        </th>
                        <th className="text-center" style={{ width: "20%" }}>
                          Unit Price
                        </th>
                        <th className="text-end" style={{ width: "20%" }}>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: "12px" }}>
                      {pkg.services.map((srv, idx) => (
                        <tr key={srv._id}>
                          <td className="text-center">{idx + 1}</td>
                          <td>{srv.serviceName}</td>
                          <td className="text-center">{srv.qty}</td>
                          <td className="text-center">
                            ₹{srv.price.toLocaleString()}
                          </td>
                          <td className="text-end">
                            ₹{(srv.qty * srv.price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="fw-bold">
                        <td colSpan="4" className="text-end">
                          Package Total:
                        </td>
                        <td className="text-end">
                          ₹{packageTotal.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            );
          })}

          <AlbumsTable
            albums={albums}
            onQtyDelta={handleAlbumQtyDelta}
            onPriceChange={handleAlbumPriceChange}
            onRemove={handleAlbumRemove}
            onView={handleAlbumView}
            onEdit={handleAlbumEdit}
          />

          <AddAlbumModal
            show={showAlbumModal}
            onClose={closeAlbumModal}
            onAdd={handleAlbumAdd}
            onUpdate={handleAlbumUpdate}
            mode={modalMode}
            initialData={editingAlbum}
            albumType="addons"
            fetchQuotation={fetchQuotation}
          />

          <AlbumDetailsModal
            show={!!viewAlbum}
            onClose={() => setViewAlbum(null)}
            album={viewAlbum}
          />

          <div className="p-3 border rounded bg-light mt-4">
            <div className="d-flex justify-content-between mb-2">
              <strong>Total Package Amount:</strong>
              <span>₹{packageSubtotal.toLocaleString()}</span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <strong>Album Total:</strong>
              <span>₹{albumSubtotal.toLocaleString()} </span>
            </div>
            {/* {quotationData?.discountPercent && (
              <> */}
            <div className="d-flex justify-content-between mb-2">
              <strong>Total Before Discount:</strong>
              <span>₹{totalBeforeDiscount.toLocaleString()} </span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <strong>Discount ({quotationData?.discountPercent}%)</strong>
              <span>- ₹{discount.toLocaleString()}</span>
            </div>
            {/* </> */}
            {/* )} */}

            <div className="d-flex justify-content-between mb-2">
              <strong>Sub Total:</strong>
              <span>₹{totalAfterDiscount.toLocaleString()} </span>
            </div>

            {quotationData?.gstApplied && (
              <div className="d-flex justify-content-between mb-2">
                <strong>GST 18%:</strong>
                <span>₹{gst.toLocaleString()}</span>
              </div>
            )}

            <hr />

            <div className="d-flex justify-content-between text-success fw-bold">
              <h6 className="mb-0">Grand Total:</h6>
              <h6 className="mb-0">₹{Number(grandTotal).toLocaleString()}</h6>
            </div>

            <hr />
            {packageSubtotal > 0 && (
              <div>
                <div className="d-flex justify-content-between text-primary">
                  <strong>Margin amount:</strong>
                  <span>₹{totalMarginBeforeDiscount.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between text-primary">
                  <strong>
                    Margin after Discount ({quotationData?.discountPercent}%):
                  </strong>
                  <span>₹{marginAfterDiscount.toLocaleString()}</span>
                </div>

                {quotationData?.gstApplied && (
                  <div className="d-flex justify-content-between text-primary">
                    <strong>GST on Margin (18%):</strong>
                    <span>₹{marginGst.toLocaleString()}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between text-success">
                  <strong>Final Margin Total:</strong>
                  <span>₹{totalMarginFinal.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Installments */}
      <Card className="mb-4 shadow-sm border-0">
        <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
          <h6 className="fw-bold mb-0">Installment Details</h6>
          <Button
            variant="outline-dark"
            size="sm"
            onClick={handleAddInstallment}
            disabled={getTotalAllocatedPercentage() >= 100}
          >
            <FaPlus className="me-2" /> Add Installment
          </Button>
        </div>
        <div className="table-responsive">
          <Table
            className="mb-0"
            bordered
            hover
            size="sm"
            style={{ fontSize: "12px" }}
          >
            <thead className="table-light">
              <tr>
                <th>Installment</th>
                <th>Percentage</th>
                <th>Amount</th>
                <th>Paid Amt</th>
                <th>Pending Amt</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Account Holder</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((inst, index) => {
                return (
                  <tr key={index}>
                    <td>Installment {index + 1}</td>

                    <td>
                      {editIndex === index && inst.status !== "Completed" ? (
                        <Form.Control
                          type="number"
                          min="0"
                          max="100"
                          value={inst.paymentPercentage}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "paymentPercentage",
                              e.target.value
                            )
                          }
                          style={{ fontSize: "13px", width: "80px" }}
                        />
                      ) : (
                        `${inst.paymentPercentage}%`
                      )}
                    </td>
                    <td>₹{inst.paymentAmount?.toLocaleString()} </td>
                    <td>₹{inst.paidAmount?.toLocaleString()} </td>

                    <td>₹{inst.pendingAmount?.toLocaleString()} </td>

                    <td>{inst.dueDate}</td>
                    <td>{inst.paymentMode || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          inst.status === "Completed"
                            ? "bg-success"
                            : inst.status === "Partial Paid"
                            ? "bg-primary" // Custom class defined in your CSS
                            : "bg-danger"
                        }`}
                      >
                        {inst.status}
                      </span>
                    </td>
                    <td>
                      {inst.accountHolders && inst.accountHolders.length > 0
                        ? inst.accountHolders.map((h, i) => (
                            <div key={i}>{h.name}</div>
                          ))
                        : "-"}
                    </td>

                    <td>
                      {/* Edit and Save/Cancel buttons - only shown for Pending status */}
                      {inst.status === "Pending" &&
                        (editIndex === index ? (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleSaveInstallment(index)}
                            >
                              <FaSave />
                            </Button>{" "}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditIndex(null)}
                            >
                              <FaTimes />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant=""
                            onClick={() => handleEditToggle(index)}
                          >
                            <FaEdit />
                          </Button>
                        ))}

                      {/* Delete button - only shown for Pending status */}
                      {inst.status === "Pending" && (
                        <Button
                          variant=""
                          size="sm"
                          onClick={() => handleDeleteInstallment(index)}
                          className="ms-1"
                        >
                          <img
                            src={deleteIcon}
                            alt="delete"
                            width="14"
                            height="14"
                          />
                        </Button>
                      )}

                      {/* Pay button - shown for Pending or Partial Paid status when there's pending amount */}
                      {(inst.status === "Pending" ||
                        inst.status === "Partial Paid") &&
                        inst.pendingAmount > 0 && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleOpenPay(inst)}
                            className="ms-1"
                          >
                            Pay
                          </Button>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <div className="text-end px-3 py-2">
            <strong>Total Allocated: </strong>
            {getTotalAllocatedPercentage()}%
          </div>
        </div>
      </Card>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Record Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Payment Date */}
            <div className="mb-3">
              <Form.Label>Payment Date</Form.Label>
              <Form.Control
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    paymentDate: e.target.value,
                  })
                }
              />
            </div>

            {/* Payment Mode */}
            <div className="mb-3">
              <Form.Label>Payment Mode</Form.Label>
              <Form.Select
                value={paymentData.paymentMode}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    paymentMode: e.target.value,
                  })
                }
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </Form.Select>
            </div>

            {/* Amount (auto-filled, read-only) */}
            <div className="mb-3">
              <Form.Label>Installment Amount</Form.Label>
              <Form.Control
                type="text"
                value={`₹${paymentData.amount}`}
                readOnly
                className="fw-bold"
              />
            </div>

            {/* Status */}
            <div className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={paymentData.status}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, status: e.target.value })
                }
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* Existing Account Holders (names only) */}
            <div className="mb-3">
              <Form.Label>Already Recorded Holders</Form.Label>
              {existingHolders.length > 0 ? (
                <div className="border rounded p-2">
                  {existingHolders.map((h, idx) => (
                    <div key={idx}>{h.name}</div>
                  ))}
                </div>
              ) : (
                <div className="text-muted">No holders yet.</div>
              )}
            </div>

            {/* New Account Holder (only name) */}
            <div className="mb-3">
              <Form.Label>Add Account Holder</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter account holder name"
                value={newHolders[0]?.name}
                onChange={
                  (e) => setNewHolders([{ name: e.target.value }]) // ✅ only name
                }
              />
            </div>
          </Form>

          <hr />

          {/* Totals */}
          <div className="text-center">
            <h5>
              Total Amount: ₹
              {selectedInstallment?.paymentAmount?.toLocaleString()}
            </h5>
            <h6>
              Pending Amount: ₹
              {selectedInstallment?.pendingAmount?.toLocaleString()}
            </h6>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPaymentModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePaymentSubmit}
            disabled={isSubmitting || paymentData.status === "Pending"}
          >
            {isSubmitting ? "Processing..." : "Submit Payment"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={pkgQtyModalOpen} onHide={closePkgQtyModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Service Quantities</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pkgDraft ? (
            <Table bordered size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "55%" }}>Service</th>
                  <th className="text-center" style={{ width: "20%" }}>
                    Qty
                  </th>
                  <th className="text-end" style={{ width: "25%" }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {(pkgDraft.services || []).map((srv, idx) => {
                  const qty = Math.max(1, Number(srv.qty) || 1);
                  const price = Number(srv.price) || 0;
                  const line = qty * price;
                  return (
                    <tr key={srv._id || idx}>
                      <td>{srv.serviceName}</td>
                      <td className="text-center">
                        <div className="d-inline-flex align-items-center gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => changeDraftQty(idx, -1)}
                          >
                            -
                          </Button>
                          <Form.Control
                            size="sm"
                            style={{ width: 70, textAlign: "center" }}
                            value={qty}
                            onChange={(e) =>
                              setDraftQtyInput(idx, e.target.value)
                            }
                          />
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => changeDraftQty(idx, +1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="text-end">₹{line.toLocaleString()}</td>
                    </tr>
                  );
                })}
                <tr className="fw-bold">
                  <td colSpan={2} className="text-end">
                    Package Total
                  </td>
                  <td className="text-end">
                    ₹{pkgDraftTotal.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </Table>
          ) : (
            <div className="text-muted">No services</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePkgQtyModal}>
            Cancel
          </Button>
          <Button variant="dark" onClick={handleSavePkgQty}>
            Save Package
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingdetailsPage;
