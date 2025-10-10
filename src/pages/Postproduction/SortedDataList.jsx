// src/pages/PostProduction/SortedDataList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Card,
  Table,
  Spinner,
  Alert,
  Badge,
  Button,
  Modal,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import Select from "react-select";
import { API_URL } from "../../utils/api";
import { toast } from "react-toastify";
import AssignPhotoEditingModal from "./modals/AssignPhotoEditingModal";
import AssignVideoEditingModal from "./modals/AssignVideoEditingModal";
import SubmitEditingTaskModal from "./modals/SubmitEditingTaskModal";
import ViewEditingTaskModal from "./modals/ViewEditingTaskModal";
import PhotoSelectionModal from "./modals/PhotoSelectionModal";
import AssignAlbumEditingModal from "./modals/AssignAlbumEditingModal";

import { FaImages, FaEdit, FaPrint, FaEye  } from "react-icons/fa";

const SortedDataList = () => {
  const { quotationId } = useParams();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPhotoAssignModal, setShowPhotoAssignModal] = useState(false);
  const [showVideoAssignModal, setShowVideoAssignModal] = useState(false);

  // NEW: “Submit Selected Photos” modal state
  const [showSubmitSelectedModal, setShowSubmitSelectedModal] = useState(false);
  const [albumForSubmit, setAlbumForSubmit] = useState(null);
  const [selectedPhotosCount, setSelectedPhotosCount] = useState("");

  const [assignData, setAssignData] = useState({
    eventName: "",
    serviceName: "",
    vendorId: "",
    taskDescription: "",
    completionDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
    specialization: "",
    finalVideoDuration: "",
  });

  const [submitData, setSubmitData] = useState({
    submittedDate: dayjs().format("YYYY-MM-DD"),
    submittedNotes: "",
  });

  const [selectedSortedTask, setSelectedSortedTask] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [photoEditingTasks, setPhotoEditingTasks] = useState([]);
  const [videoEditingTasks, setVideoEditingTasks] = useState([]);
  const [albumStatuses, setAlbumStatuses] = useState({});
  const [showPhotoSelectionModal, setShowPhotoSelectionModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const [albumSelectionTasks, setAlbumSelectionTasks] = useState({});
  const [showAlbumTaskView, setShowAlbumTaskView] = useState(false);
  const [albumTaskToView, setAlbumTaskToView] = useState(null);
  const [albumSelectedPhotos, setAlbumSelectedPhotos] = useState({});
  // state
  const [showAssignAlbumModal, setShowAssignAlbumModal] = useState(false);
  const [albumForAssign, setAlbumForAssign] = useState(null);
  const [albumEditingLatest, setAlbumEditingLatest] = useState({});
  const [showAlbumEditingView, setShowAlbumEditingView] = useState(false);
  const [albumEditingToView, setAlbumEditingToView] = useState(null);

  const options = [
    {
      value: "Awaiting Customer Selection",
      label: "Awaiting Customer Selection",
      color: "orange",
    },
    {
      value: "Photos To Be Selected By Us",
      label: "Photos To Be Selected By Us",
      color: "blue",
    },
    { value: "Selection Ready", label: "Selection Ready", color: "green" },
    { value: "In Progress", label: "In Progress", color: "purple" },
    {
      value: "Awaiting Printing Approval",
      label: "Awaiting Printing Approval",
      color: "red",
    },
    {
      value: "Sent for Printing",
      label: "Sent for Printing",
      color: "red",
    },
    { value: "Completed", label: "Completed", color: "darkgreen" },
  ];

  // NEW: open the “Submit Selected Photos” modal for an album
  const openSubmitSelectedModal = (album) => {
    setAlbumForSubmit(album);
    setSelectedPhotosCount(""); // reset field
    setShowSubmitSelectedModal(true);
  };

  // NEW: fetch tasks by album id
  const fetchAlbumSelectionTask = async (albumId) => {
    if (!albumId) return;
    try {
      const { data } = await axios.get(
        `${API_URL}/album-photoselection-task/album/${albumId}`
      );
      if (data?.success) {
        setAlbumSelectionTasks((prev) => ({
          ...prev,
          [albumId]: {
            hasTask: data.hasTask,
            latestTask: data.latestTask,
            count: data.count,
          },
        }));
      }
    } catch (err) {
      console.error("Error fetching album photo selection task:", err);
    }
  };

  const fetchAllSelectedForQuotation = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/album-photo-selected/quotation/${quotationId}/latest-by-album`
      );
      if (data?.success) {
        setAlbumSelectedPhotos(data.data || {}); // already a map keyed by albumId
      }
    } catch (e) {
      console.error("Failed to fetch selected photos map", e);
    }
  };

  const fetchAlbumEditingLatest = async (albumId) => {
    if (!albumId) return;
    try {
      const { data } = await axios.get(
        `${API_URL}/album-editing/album/${albumId}/latest`
      );
      if (data?.success) {
        setAlbumEditingLatest((prev) => ({
          ...prev,
          [albumId]: data.task || null,
        }));
      }
    } catch (err) {
      console.error("Error fetching latest album editing task:", err);
    }
  };

  const primeAlbumEditingLatest = async (albums = []) => {
    try {
      await Promise.all(albums.map((a) => fetchAlbumEditingLatest(a._id)));
    } catch (e) {
      console.error("primeAlbumEditingLatest error:", e);
    }
  };

  // ✅ Fetch selected photo info per album
  const fetchAlbumSelectedPhotos = async (albumId) => {
    if (!albumId) return;
    try {
      const { data } = await axios.get(
        `${API_URL}/album-photo-selected/album/${albumId}`
      );
      if (data?.success && data?.data) {
        setAlbumSelectedPhotos((prev) => ({
          ...prev,
          [albumId]: data.data,
        }));
      } else {
        setAlbumSelectedPhotos((prev) => ({
          ...prev,
          [albumId]: null,
        }));
      }
    } catch (err) {
      console.error("Error fetching selected photo info:", err);
    }
  };

  // ----------------------- Fetch Summary -----------------------
  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `${API_URL}/sorting-task/completed/${quotationId}`
      );
      if (!res.data?.success) {
        setError(res.data?.message || "Failed to fetch summary");
        return;
      }
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError(err?.response?.data?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelection = (album) => {
    setSelectedAlbum(album);
    setShowPhotoSelectionModal(true);
  };

  // ----------------------- Fetch Editing Tasks -----------------------
  const fetchEditingTasks = async () => {
    try {
      // Fetch both photo and video editing tasks
      const [photoRes, videoRes] = await Promise.all([
        axios.get(`${API_URL}/photo-editing/quotation/${quotationId}`),
        axios.get(`${API_URL}/video-editing/quotation/${quotationId}`),
      ]);

      if (photoRes.data?.success) {
        setPhotoEditingTasks(photoRes.data.tasks || []);
      }
      if (videoRes.data?.success) {
        setVideoEditingTasks(videoRes.data.tasks || []);
      }
    } catch (err) {
      console.error("Error fetching editing tasks:", err);
    }
  };

  // ----------------------- Fetch Services -----------------------
  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/service/all`);
      if (res.data.success) {
        const specialization = res.data.data.map((service) => ({
          value: service._id,
          label: service.name,
        }));
        const staticSpecialization = [
          { value: "candid-photo-editing", label: "Candid photo editing" },
          {
            value: "traditional-photo-editing",
            label: "Traditional Photo editing",
          },
          { value: "album-designing", label: "Album Designing" },
          {
            value: "photo-colour-correction",
            label: "Photo colour correction",
          },
          { value: "album-photo-selection", label: "Album photo selection" },
          { value: "photo-slideshow", label: "Photo slideshow" },
          {
            value: "traditional-video-editing",
            label: "Traditional Video editing",
          },
          { value: "candid-video-editing", label: "Candid Video editing" },
          { value: "video-3d-editing", label: "3D Video editing" },
          { value: "vr-360-editing", label: "360 degree VR Video editing" },
        ];
        setSpecializationOptions([...specialization, ...staticSpecialization]);
      }
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  const fetchVendorsBySpecialization = async (specializationName) => {
    if (!specializationName) {
      setVendors([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/vendors/specialization/${encodeURIComponent(
          specializationName
        )}`
      );

      if (res.data?.success && Array.isArray(res.data.data)) {
        setVendors(res.data.data);
      } else {
        setVendors([]);
        toast.error("No vendors found for this specialization");
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
      toast.error("Failed to load vendors for the selected specialization");
      setVendors([]);
    }
  };

  // ✅ 1) Use the correct backend route and keep robust error handling
  const updateAlbumStatus = async (albumId, status) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/quotations/${quotationId}/albums/${albumId}/status`,
        { status }
      );

      if (data?.success) {
        return {
          ok: true,
          newStatus: data?.data?.newStatus || status,
          message: data?.message,
        };
      }
      return {
        ok: false,
        message: data?.message || "Failed to update album status",
      };
    } catch (err) {
      return {
        ok: false,
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update album status",
      };
    }
  };

  // ✅ 2) Plain “select = update” handler with optimistic UI + revert on failure
  const handleAlbumStatusChange = async (album, selectedStatus) => {
    const prevStatus = albumStatuses[album._id];
    setAlbumStatuses((p) => ({ ...p, [album._id]: selectedStatus }));

    const result = await updateAlbumStatus(album._id, selectedStatus);

    if (!result.ok) {
      setAlbumStatuses((p) => ({ ...p, [album._id]: prevStatus }));
      toast.error(result.message);
      return;
    }

    setAlbumStatuses((p) => ({ ...p, [album._id]: result.newStatus }));
    toast.success(
      result.message || `Album status updated to ${result.newStatus}`
    );

    // NEW: if switched to selection-by-us, check whether a task already exists
    if (result.newStatus === "Photos To Be Selected By Us") {
      await fetchAlbumSelectionTask(album._id);
    }
  };

  // ----------------------- Handle Photo Selection Complete -----------------------
  const handlePhotoSelectionComplete = () => {
    fetchSummary();
  };
  // somewhere near other handlers
  const handleAlbumEditing = (album) => {
    setAlbumForAssign(album);
    setShowAssignAlbumModal(true);
  };

  const handleAssignAlbumTask = async (formPayload) => {
    // formPayload = { albumId, albumDetails, selectedPhotos, specialization, vendorId, taskDescription }
    try {
      const vendorName =
        vendors.find((v) => v._id === formPayload.vendorId)?.name || "";
      const payload = {
        quotationId,
        ...formPayload,
        vendorName,
      };

      const { data } = await axios.post(
        `${API_URL}/album-editing/assign`,
        payload
      );

      if (data?.success) {
        toast.success("Album editing task assigned!");

        // Optimistic album status flip
        setAlbumStatuses((p) => ({
          ...p,
          [formPayload.albumId]: "In Progress",
        }));

        // Fetch latest assigned task for this album
        await fetchAlbumEditingLatest(formPayload.albumId);

        // Pull fresh summary so everything stays in sync
        await fetchSummary();

        // Close assign modal
        setShowAssignAlbumModal(false);
      } else {
        throw new Error(data?.message || "Failed to assign album editing task");
      }
    } catch (err) {
      console.error("Error assigning album editing task:", err);
      toast.error(
        err?.response?.data?.message || "Failed to assign album editing task"
      );
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Merge your two quotationId effects into one
  useEffect(() => {
    if (!quotationId) return;

    let alive = true; // guard to avoid state updates after unmount/route change

    (async () => {
      try {
        await fetchSummary(); // summary first (it drives albumStatuses effect)
        if (!alive) return;

        await Promise.all([
          fetchEditingTasks(),
          fetchAllSelectedForQuotation(), // batched latest-by-album map
        ]);
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [quotationId]);

  // Derive initial album statuses from summary — keep as-is
  useEffect(() => {
    if (summary?.quotation?.albums?.length) {
      const initial = {};
      summary.quotation.albums.forEach((album) => {
        initial[album._id] = album.status || "Awaiting Customer Selection";
      });
      setAlbumStatuses(initial);

      // NEW: fetch latest album editing tasks for all albums
      primeAlbumEditingLatest(summary.quotation.albums);
    }
  }, [summary]);

  // ----------------------- Get Editing Status for Sorted Task -----------------------
  const getEditingStatus = (pkgName, serviceName, isPhotoTask = true) => {
    const tasks = isPhotoTask ? photoEditingTasks : videoEditingTasks;

    const editingTask = tasks.find(
      (task) => task.packageName === pkgName && task.serviceName === serviceName
    );

    if (!editingTask) return { status: "Not Assigned", task: null };

    return {
      status: editingTask.status,
      task: editingTask,
      isCompleted: editingTask.status === "Completed",
      type: isPhotoTask ? "photo" : "video",
    };
  };

  // ----------------------- Completed Sorted Tasks with Editing Status -----------------------
  const completedSortedTasks = useMemo(() => {
    if (!summary?.data) return [];

    const unitMap = new Map();
    summary?.collectedData?.serviceUnits?.forEach((u) => {
      if (u._id) {
        unitMap.set(u._id, {
          packageName: u.packageName || "—",
          serviceName: u.serviceName || "—",
        });
      }
    });

    return summary.data
      .filter((t) => t.status === "Completed")
      .map((t) => {
        const fallback = unitMap.get(t.serviceUnitId) || {};
        const isPhotoTask = (t.submittedPhotos || 0) > 0;
        const editingStatus = getEditingStatus(t.serviceUnitId, isPhotoTask);

        return {
          ...t,
          packageName: t.packageName || fallback.packageName || "—",
          serviceName: t.serviceName || fallback.serviceName || "—",
          editingStatus: editingStatus.status,
          editingTask: editingStatus.task,
          isEditingCompleted: editingStatus.isCompleted,
          taskType: editingStatus.type,
          isPhotoTask: isPhotoTask,
        };
      });
  }, [summary, photoEditingTasks, videoEditingTasks]);

  // ----------------------- Open Assign Modal -----------------------
  const handleAssignTaskForEditing = (task, isPhoto = true) => {
    setSelectedSortedTask(task);
    setAssignData({
      eventName: task.event || task.packageName || "—",
      serviceName: task.service || task.serviceName || "—",
      vendorId: "",
      taskDescription: "",
      completionDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
      specialization: "",
      finalVideoDuration: "",
    });
    if (isPhoto) setShowPhotoAssignModal(true);
    else setShowVideoAssignModal(true);
  };

  // ----------------------- Assign Editing Task -----------------------
  const handleAssignEditingTask = async (isPhoto) => {
    try {
      if (!selectedSortedTask) return;
      const basePayload = {
        quotationId,
        collectedDataId: summary?.collectedData?._id,
        vendorId: assignData.vendorId,
        vendorName: vendors.find((v) => v._id === assignData.vendorId)?.name,
        taskDescription: assignData.taskDescription,
        completionDate: assignData.completionDate,
        packageName:
          selectedSortedTask.event || selectedSortedTask.packageName || "—",
        serviceName:
          selectedSortedTask.service || selectedSortedTask.serviceName || "—",
      };

      let response;
      if (isPhoto) {
        const photoPayload = {
          ...basePayload,
          assignedPhotosToEdit:
            selectedSortedTask?.sortedPhotos ||
            selectedSortedTask?.submittedPhotos ||
            0,
        };
        response = await axios.post(
          `${API_URL}/photo-editing/assign`,
          photoPayload
        );
      } else {
        const videoPayload = {
          ...basePayload,
          totalClipsAssigned:
            selectedSortedTask?.sortedVideos ||
            selectedSortedTask?.submittedVideos ||
            0,
          finalVideoDuration: assignData.finalVideoDuration || "",
        };
        response = await axios.post(
          `${API_URL}/video-editing/assign`,
          videoPayload
        );
      }

      if (response.data.success) {
        toast.success("Editing task assigned successfully!");
        setShowPhotoAssignModal(false);
        setShowVideoAssignModal(false);
        await fetchEditingTasks();
      }
    } catch (err) {
      console.error("Error assigning editing task:", err);
      toast.error(
        err?.response?.data?.message || "Failed to assign editing task"
      );
    }
  };

  // ----------------------- Open Submit Modal -----------------------
  const handleOpenSubmitModal = (task) => {
    setSelectedSortedTask(task);
    setSubmitData({
      submittedDate: dayjs().format("YYYY-MM-DD"),
      submittedNotes: task.editingTask?.submittedNotes || "",
    });
    setShowSubmitModal(true);
  };

  // ----------------------- Submit Editing Task -----------------------
  const handleSubmitEditingTask = async () => {
    try {
      if (!selectedSortedTask?.editingTask?._id) {
        toast.error("No editing task found to submit");
        return;
      }

      const taskId = selectedSortedTask.editingTask._id;
      const isPhotoTask = selectedSortedTask.taskType === "photo";

      const endpoint = isPhotoTask
        ? `${API_URL}/photo-editing/${taskId}/submit`
        : `${API_URL}/video-editing/${taskId}/submit`;

      const res = await axios.post(endpoint, submitData);

      if (res.data.success) {
        toast.success("Editing task submitted successfully!");
        setShowSubmitModal(false);
        await fetchEditingTasks(); // Refresh editing tasks
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to submit task");
    }
  };

  // ----------------------- View Editing Task Details -----------------------
  const handleViewTask = async (task) => {
    try {
      // If no task assigned yet, just show the modal with empty state
      if (!task.editingTask) {
        setSelectedSortedTask(task);
        setShowViewModal(true);
        return;
      }

      const taskId = task.editingTask._id;
      const isPhotoTask = task.taskType === "photo";
      const endpoint = isPhotoTask
        ? `${API_URL}/photo-editing/${taskId}`
        : `${API_URL}/video-editing/${taskId}`;

      const res = await axios.get(endpoint);
      if (res.data.success) {
        setSelectedSortedTask({
          ...task,
          editingTask: res.data.task,
        });
      } else {
        setSelectedSortedTask(task);
      }

      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching task details:", err);
      toast.error("Failed to load task details");
    }
  };

  // ----------------------- Render Actions -----------------------
  const renderActions = (task, isPhoto) => {
    if (task.editingStatus === "Not Assigned")
      return (
        <Button
          variant="outline-primary"
          size="sm"
          style={{ fontSize: "11px" }}
          onClick={() => handleAssignTaskForEditing(task, isPhoto)}
        >
          Assign for Editing
        </Button>
      );
    return (
      <div className="d-flex gap-1 justify-content-center">
        {task.editingStatus === "Assigned" && (
          <Button
            variant="outline-success"
            size="sm"
            style={{ fontSize: "11px" }}
            onClick={() => handleOpenSubmitModal(task)}
          >
            Submit Task
          </Button>
        )}
        <Button
          variant="outline-info"
          size="sm"
          style={{ fontSize: "11px" }}
          onClick={() => handleViewTask(task)}
        >
          View Details
        </Button>
      </div>
    );
  };

  // ----------------------- Grouped Photo & Video Data -----------------------
  const groupedPhotoData = useMemo(() => {
    if (!summary?.collectedData?.serviceUnits) return [];
    const grouped = {};

    summary.collectedData.serviceUnits
      .filter((u) => u.noOfPhotos > 0 && u.sortingStatus === "Completed")
      .forEach((u) => {
        const key = `${u.packageName}_${u.serviceName}`;
        if (!grouped[key]) {
          grouped[key] = {
            event: u.packageName,
            service: u.serviceName,
            qty: 1,
            sortedPhotos: u.noOfPhotos,
          };
        } else {
          grouped[key].qty += 1;
          grouped[key].sortedPhotos += u.noOfPhotos;
        }
      });

    // Attach task details
    Object.values(grouped).forEach((g) => {
      const t = photoEditingTasks.find(
        (x) => x.packageName === g.event && x.serviceName === g.service
      );
      g.editingStatus = t ? t.status : "Not Assigned";
      g.editingTask = t || null; // ✅ add task object
      g.taskType = "photo";
    });

    return Object.values(grouped).sort((a, b) =>
      a.event.localeCompare(b.event)
    );
  }, [summary, photoEditingTasks]);

  const groupedVideoData = useMemo(() => {
    if (!summary?.collectedData?.serviceUnits) return [];
    const grouped = {};

    summary.collectedData.serviceUnits
      .filter((u) => u.noOfVideos > 0 && u.sortingStatus === "Completed")
      .forEach((u) => {
        const key = `${u.packageName}_${u.serviceName}`;
        if (!grouped[key]) {
          grouped[key] = {
            event: u.packageName,
            service: u.serviceName,
            qty: 1,
            sortedVideos: u.noOfVideos,
          };
        } else {
          grouped[key].qty += 1;
          grouped[key].sortedVideos += u.noOfVideos;
        }
      });

    // Attach task details
    Object.values(grouped).forEach((g) => {
      const t = videoEditingTasks.find(
        (x) => x.packageName === g.event && x.serviceName === g.service
      );
      g.editingStatus = t ? t.status : "Not Assigned";
      g.editingTask = t || null; // ✅ add task object
      g.taskType = "video";
    });

    return Object.values(grouped).sort((a, b) =>
      a.event.localeCompare(b.event)
    );
  }, [summary, videoEditingTasks]);

  // NEW: submit selected photos for an album
  const handleSubmitSelectedPhotos = async () => {
    try {
      if (!albumForSubmit?._id) {
        toast.error("No album selected.");
        return;
      }

      const n = parseInt(selectedPhotosCount, 10);
      if (!n || n < 0) {
        toast.error("Please enter a valid number of selected photos.");
        return;
      }

      const basePhotos = albumForSubmit?.snapshot?.basePhotos || 0;
      if (basePhotos && n > basePhotos) {
        toast.error(
          `Selected photos cannot exceed album capacity (${basePhotos}).`
        );
        return;
      }

      const payload = {
        quotationId,
        albumId: albumForSubmit._id,
        albumDetails: {
          templateLabel: albumForSubmit?.snapshot?.templateLabel || "",
          baseSheets: albumForSubmit?.snapshot?.baseSheets || 0,
          basePhotos: basePhotos || 0,
        },
        selectedPhotos: n,
      };

      const { data } = await axios.post(
        `${API_URL}/album-photo-selected/create`,
        payload
      );

      if (data?.success) {
        // ✅ Optimistic UI: mark this album as "submitted" immediately
        setAlbumSelectedPhotos((prev) => ({
          ...prev,
          [payload.albumId]: data.data || {
            albumId: payload.albumId,
            quotationId: payload.quotationId,
            selectedPhotos: payload.selectedPhotos,
            albumDetails: payload.albumDetails,
            createdAt: new Date().toISOString(),
          },
        }));

        // (optional) auto-advance status
        // setAlbumStatuses((p) => ({ ...p, [payload.albumId]: "Awaiting Printing Approval" }));

        toast.success(data.message || "Selected photos submitted!");

        // Close modal & reset
        setShowSubmitSelectedModal(false);
        setAlbumForSubmit(null);
        setSelectedPhotosCount("");

        // (optional) pull fresh server state if you want
        // await fetchAllSelectedForQuotation();
      } else {
        toast.error(data?.message || "Failed to submit selected photos.");
      }
    } catch (err) {
      console.error("Error submitting selected photos:", err);
      toast.error(
        err?.response?.data?.message || "Failed to submit selected photos."
      );
    }
  };

  // ----------------------- Render -----------------------
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <div className="mt-2">Loading sorted data...</div>
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!summary) return null;

  const albums = summary?.quotation?.albums || [];

  return (
    <>
      {/* Customer / Summary Header */}
      <Card className="shadow-sm mb-4 border-0">
        <Card.Header
          className="bg-secondary text-white fw-bold"
          style={{ fontSize: "14px" }}
        >
          Customer & Summary
        </Card.Header>
        <Card.Body style={{ fontSize: "13px" }}>
          <Row>
            <Col md={3}>
              <div className="mb-2">
                <span className="text-muted fw-bold">Quotation ID:</span>
                <div className="text-dark">
                  {summary?.quotation?.quotationId || "—"}
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="mb-2">
                <span className="text-muted fw-bold">Couple/Person:</span>
                <div className="text-dark">
                  {summary?.collectedData?.personName || "—"}
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="mb-2">
                <span className="text-muted fw-bold">Total Sorted Photos:</span>
                <div className="text-danger fw-bold">
                  {summary?.totalSortedPhotos || 0}
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="mb-2">
                <span className="text-muted fw-bold">Total Sorted Videos:</span>
                <div className="text-danger fw-bold">
                  {summary?.totalSortedVideos || 0}
                </div>
              </div>
            </Col>
          </Row>

          {!!summary?.quotation?.quoteNote && (
            <Row>
              <Col md={12}>
                <span className="text-muted fw-bold">Quote Note:</span>
                <div className="fst-italic text-dark">
                  {summary.quotation.quoteNote}
                </div>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Albums Section */}
      {albums.length > 0 && (
        <Card className="shadow-sm mb-4 border-0">
          <Card.Header
            className="bg-info text-white fw-bold d-flex justify-content-between align-items-center"
            style={{ fontSize: "14px" }}
          >
            <span>Albums Details</span>
            <Badge bg="light" text="dark" style={{ fontSize: "11px" }}>
              {albums.length} Album{albums.length > 1 ? "s" : ""}
            </Badge>
          </Card.Header>
          <Card.Body className="p-0">
            <Table
              bordered
              hover
              responsive
              className="mb-0"
              style={{ fontSize: "12px" }}
            >
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Template</th>
                  <th>Box</th>
                  <th className="text-center">Qty</th>
                  <th className="text-center">Album Unit Price</th>
                  <th className="text-center">Box / Unit</th>
                  <th>Extras</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {albums.map((a, idx) => (
                  <tr key={a._id || idx}>
                    <td className="text-center">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td>{a?.snapshot?.templateLabel || "Custom"}</td>
                    <td>{a?.snapshot?.boxLabel || "Without Box"}</td>
                    <td className="text-center">{a?.qty || 0}</td>
                    <td className="text-center">
                      ₹{(a?.unitPrice || 0).toLocaleString()}
                    </td>
                    <td className="text-center">
                      ₹{a?.snapshot?.boxSurchargeAtSave || 0}
                    </td>
                    <td style={{ fontSize: "11px" }}>
                      {a?.extras?.shared
                        ? `Shared extras: Standard ${a.extras.shared.std}, Special ${a.extras.shared.special}, Embossed ${a.extras.shared.embossed}`
                        : "No extras"}
                    </td>
                    <td style={{ width: "220px", minWidth: "220px" }}>
                      <div className="d-flex flex-column gap-1">
                        <Select
                          options={options}
                          placeholder="Update Status"
                          value={options.find(
                            (opt) => opt.value === albumStatuses[a._id]
                          )}
                          onChange={(selected) => {
                            handleAlbumStatusChange(a, selected.value);
                          }}
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: "30px",
                              height: "30px",
                              borderColor: state.isFocused
                                ? "#86b7fe"
                                : "#ced4da",
                              boxShadow: state.isFocused
                                ? "0 0 0 0.15rem rgba(13,110,253,.25)"
                                : "",
                              "&:hover": { borderColor: "#86b7fe" },
                              fontSize: "11.5px",
                            }),
                            valueContainer: (base) => ({
                              ...base,
                              padding: "0 6px",
                              whiteSpace: "normal",
                              lineHeight: "1.2",
                            }),
                            singleValue: (base, { data }) => ({
                              ...base,
                              color: data.color,
                              fontWeight: "600",
                              fontSize: "11.5px",
                              whiteSpace: "normal",
                              overflow: "visible",
                            }),
                            placeholder: (base) => ({
                              ...base,
                              fontSize: "11.5px",
                            }),
                            dropdownIndicator: (base) => ({
                              ...base,
                              padding: "2px 6px",
                            }),
                            option: (
                              base,
                              { data, isFocused, isSelected }
                            ) => ({
                              ...base,
                              color: data.color,
                              backgroundColor: isSelected
                                ? "#f5f5f5"
                                : isFocused
                                ? "#fafafa"
                                : "white",
                              fontSize: "11.5px",
                              whiteSpace: "normal",
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 9999,
                              fontSize: "11.5px",
                            }),
                          }}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          menuShouldScrollIntoView={false}
                        />

                        {/* Buttons under the Select control inside Albums table */}
                        {albumStatuses[a._id] ===
                          "Photos To Be Selected By Us" && (
                          <>
                            {albumSelectionTasks[a._id]?.hasTask ? (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                style={{
                                  fontSize: "11px",
                                  whiteSpace: "nowrap",
                                }}
                                onClick={() => {
                                  setAlbumTaskToView(
                                    albumSelectionTasks[a._id].latestTask ||
                                      null
                                  );
                                  setShowAlbumTaskView(true);
                                }}
                              >
                                View Task
                              </Button>
                            ) : (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                style={{
                                  fontSize: "11px",
                                  whiteSpace: "nowrap",
                                }}
                                onClick={() => handlePhotoSelection(a)}
                              >
                                Photo Selection
                              </Button>
                            )}
                          </>
                        )}

                        {albumStatuses[a._id] === "Selection Ready" && (
                          <>
                            {albumSelectedPhotos[a._id] ? (
                              <Badge bg="success" style={{ fontSize: "11px" }}>
                                Photos Submitted (
                                {albumSelectedPhotos[a._id]?.selectedPhotos ||
                                  0}
                                )
                              </Badge>
                            ) : (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                style={{
                                  fontSize: "11px",
                                  whiteSpace: "nowrap",
                                }}
                                onClick={() => openSubmitSelectedModal(a)}
                              >
                                Submit Selected Photos
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        {albumStatuses[a._id] === "Selection Ready" && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-edit">Album Editing</Tooltip>
                            }
                          >
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="rounded-circle"
                              onClick={() => handleAlbumEditing(a)}
                            >
                              <FaEdit />
                            </Button>
                          </OverlayTrigger>
                        )}

                        {/* View Album Editing Task (when a latest task exists) */}
                        {albumEditingLatest[a._id] && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-album-view-${a._id}`}>
                                View Editing Task
                              </Tooltip>
                            }
                          >
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="rounded-circle"
                              onClick={() => {
                                setAlbumEditingToView(
                                  albumEditingLatest[a._id]
                                );
                                setShowAlbumEditingView(true);
                              }}
                            >
                              <FaEye />
                            </Button>
                          </OverlayTrigger>
                        )}

                        {/* {albumStatuses[a._id] ===
                          "Awaiting Printing Approval" && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-print">
                                Album Printing
                              </Tooltip>
                            }
                          >
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="rounded-circle"
                            >
                              <FaPrint />
                            </Button>
                          </OverlayTrigger>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* ✅ Photo Selection Modal */}
      <PhotoSelectionModal
        show={showPhotoSelectionModal}
        onClose={() => setShowPhotoSelectionModal(false)}
        album={selectedAlbum}
        totalSortedPhotos={summary?.totalSortedPhotos || 0}
        quotationId={quotationId}
        onStatusUpdate={handlePhotoSelectionComplete}
        onAssigned={async () => {
          // After creating a task, refresh cache so the button flips to “View Task”
          if (selectedAlbum?._id) {
            await fetchAlbumSelectionTask(selectedAlbum._id);
          }
        }}
      />

      <AssignAlbumEditingModal
        show={showAssignAlbumModal}
        onClose={() => setShowAssignAlbumModal(false)}
        album={albumForAssign}
        selectedPhotos={
          albumForAssign
            ? albumSelectedPhotos[albumForAssign._id]?.selectedPhotos || 0
            : 0
        }
        specializationOptions={specializationOptions}
        vendors={vendors}
        fetchVendorsBySpecialization={fetchVendorsBySpecialization}
        onAssign={handleAssignAlbumTask}
      />

      {/* ✅ Photo Table */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-secondary text-white fw-bold">
          Sorted Data (Photos)
        </Card.Header>
        <Card.Body className="p-0">
          {groupedPhotoData.length ? (
            <Table
              bordered
              hover
              responsive
              className="mb-0"
              style={{ fontSize: "12px" }}
            >
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Event</th>
                  <th>Service</th>
                  <th className="text-center">Qty</th>
                  <th className="text-center">Sorted Photos</th>
                  <th>Editing Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedPhotoData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.event}</td>
                    <td>{item.service}</td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-center fw-bold text-success">
                      {item.sortedPhotos}
                    </td>
                    <td
                      className={`${
                        item.editingStatus === "Completed"
                          ? "text-success fw-bold"
                          : "text-black"
                      }`}
                    >
                      {item.editingStatus}
                    </td>
                    <td>{renderActions(item, true)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-3 text-muted">
              No photo data available
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ✅ Video Table */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-secondary text-white fw-bold">
          Sorted Data (Videos)
        </Card.Header>
        <Card.Body className="p-0">
          {groupedVideoData.length ? (
            <Table
              bordered
              hover
              responsive
              className="mb-0"
              style={{ fontSize: "12px" }}
            >
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Event</th>
                  <th>Service</th>
                  <th className="text-center">Qty</th>
                  <th className="text-center">Sorted Videos</th>
                  <th>Editing Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedVideoData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.event}</td>
                    <td>{item.service}</td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-center fw-bold text-info">
                      {item.sortedVideos}
                    </td>
                    <td
                      className={`${
                        item.editingStatus === "Completed"
                          ? "text-success fw-bold"
                          : "text-black"
                      }`}
                    >
                      {item.editingStatus}
                    </td>
                    <td>{renderActions(item, false)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-3 text-muted">
              No video data available
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ✅ Photo Assign Modal */}
      <AssignPhotoEditingModal
        show={showPhotoAssignModal}
        onClose={() => setShowPhotoAssignModal(false)}
        assignData={assignData}
        setAssignData={setAssignData}
        specializationOptions={specializationOptions}
        vendors={vendors}
        fetchVendorsBySpecialization={fetchVendorsBySpecialization}
        handleAssignEditingTask={handleAssignEditingTask}
        selectedSortedTask={selectedSortedTask}
      />

      {/* ✅ Video Assign Modal */}
      <AssignVideoEditingModal
        show={showVideoAssignModal}
        onClose={() => setShowVideoAssignModal(false)}
        assignData={assignData}
        setAssignData={setAssignData}
        specializationOptions={specializationOptions}
        vendors={vendors}
        fetchVendorsBySpecialization={fetchVendorsBySpecialization}
        handleAssignEditingTask={handleAssignEditingTask}
        selectedSortedTask={selectedSortedTask} // ✅ added
      />

      {/* ✅ Submit Editing Task Modal */}
      <SubmitEditingTaskModal
        show={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        selectedSortedTask={selectedSortedTask}
        submitData={submitData}
        setSubmitData={setSubmitData}
        handleSubmitEditingTask={handleSubmitEditingTask}
      />

      {/* ✅ View Editing Task Details Modal */}
      <ViewEditingTaskModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        selectedSortedTask={selectedSortedTask}
      />

      {/* View Album Photo-Selection Task */}
      <Modal
        show={showAlbumTaskView}
        onHide={() => setShowAlbumTaskView(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Album Photo Selection Task</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px" }}>
          {albumTaskToView ? (
            <>
              <div>
                <strong>Vendor:</strong> {albumTaskToView.vendorName}
              </div>
              <div>
                <strong>Assigned Date:</strong>{" "}
                {dayjs(albumTaskToView.assignedDate).format("YYYY-MM-DD")}
              </div>
              <div>
                <strong>Photos To Select:</strong>{" "}
                {albumTaskToView.photosToSelect}
              </div>
              {albumTaskToView.taskDescription && (
                <div className="mt-2">
                  <strong>Notes:</strong> {albumTaskToView.taskDescription}
                </div>
              )}
            </>
          ) : (
            <Alert variant="warning" className="mb-0">
              No task found.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAlbumTaskView(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Submit Selected Photos Modal */}
      <Modal
        show={showSubmitSelectedModal}
        onHide={() => setShowSubmitSelectedModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Submit Selected Photos for Album</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px" }}>
          {albumForSubmit ? (
            <>
              <div className="mb-2">
                <strong>Album:</strong>{" "}
                {albumForSubmit?.snapshot?.templateLabel || "—"}
              </div>
              <div className="mb-3">
                <strong>Album Capacity:</strong>{" "}
                {(albumForSubmit?.snapshot?.basePhotos || 0).toLocaleString()}{" "}
                photos
              </div>

              <div className="mb-3">
                <label className="form-label">Selected Photos *</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max={albumForSubmit?.snapshot?.basePhotos || undefined}
                  value={selectedPhotosCount}
                  onChange={(e) => setSelectedPhotosCount(e.target.value)}
                  placeholder={`Max: ${(
                    albumForSubmit?.snapshot?.basePhotos || 0
                  ).toString()}`}
                />
                <div className="form-text">
                  Enter how many photos are finalized for this album.
                </div>
              </div>
            </>
          ) : (
            <Alert variant="warning" className="mb-0">
              No album selected.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowSubmitSelectedModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitSelectedPhotos}
            disabled={!albumForSubmit}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showAlbumEditingView}
        onHide={() => setShowAlbumEditingView(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Album Editing Task</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px" }}>
          {albumEditingToView ? (
            <>
              <div>
                <strong>Vendor:</strong> {albumEditingToView.vendorName || "—"}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                {albumEditingToView.status || "Assigned"}
              </div>
              <div>
                <strong>Assigned Date:</strong>{" "}
                {albumEditingToView.assignedDate
                  ? dayjs(albumEditingToView.assignedDate).format("YYYY-MM-DD")
                  : "—"}
              </div>
              <div>
                <strong>Selected Photos:</strong>{" "}
                {albumEditingToView.selectedPhotos ?? 0}
              </div>
              {albumEditingToView.taskDescription && (
                <div className="mt-2">
                  <strong>Notes:</strong> {albumEditingToView.taskDescription}
                </div>
              )}
            </>
          ) : (
            <Alert variant="warning" className="mb-0">
              No task found.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAlbumEditingView(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SortedDataList;
