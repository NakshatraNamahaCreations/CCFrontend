// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import moment from 'moment';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { Table, Spinner, Button, Form, Container, Row, Col } from 'react-bootstrap';

// const DailyTasksTable = () => {
//     const [tasks, setTasks] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [searchParams, setSearchParams] = useSearchParams();
//     const navigate = useNavigate();
//     const dateParam = searchParams.get('date');
//     const [selectedDate, setSelectedDate] = useState(
//         dateParam ? moment(dateParam, 'DD-MM-YYYY') : moment()
//     );

//     const columns = [
//         { title: 'Vendor Name', key: 'vendorName', accessor: task => task.vendorId?.name },
//         { title: 'Email', key: 'email', accessor: task => task.vendorId?.email },
//         { title: 'Role', key: 'role', accessor: task => task.role },
//         { title: 'Task', key: 'task', accessor: task => task.task },
//         {
//             title: 'Created At',
//             key: 'createdAt',
//             accessor: task => moment(task.createdAt).format('DD-MM-YYYY HH:mm')
//         },
//     ];

//     const fetchTasksByDate = async (date) => {
//         try {
//             setLoading(true);

//             if (!moment(date, 'DD-MM-YYYY', true).isValid()) {
//                 throw new Error('Invalid date format. Please use DD-MM-YYYY');
//             }

//             const response = await axios.get(`http://localhost:5000/api/daily-tasks/by-date`, {
//                 params: { date }
//             });

//             if (response.data.success) {
//                 setTasks(response.data.data);
//             } else {
//                 console.error('Failed to fetch tasks:', response.data.message);
//                 alert(response.data.message || 'Failed to fetch tasks');
//             }
//         } catch (error) {
//             console.error('Error fetching tasks:', error);
//             alert(error.response?.data?.message || error.message || 'Error fetching tasks');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         const initialDate = dateParam || moment().format('DD-MM-YYYY');
//         fetchTasksByDate(initialDate);
//         if (!dateParam) {
//             setSearchParams({ date: initialDate });
//         }
//     }, [dateParam]);

//     return (
//         <Container className="py-4">
//             <Row className="mb-4 align-items-center">
//                 <Col>
//                     <h5>Daily Tasks for {selectedDate.format('DD-MM-YYYY')}</h5>
//                 </Col>
//                 <Col xs="auto">
//                     <Button
//                         variant="dark"
//                         onClick={() => navigate('/daily-task')}
//                     >
//                         Back to Calendar
//                     </Button>
//                 </Col>
//             </Row>

//             {loading ? (
//                 <div className="text-center">
//                     <Spinner animation="border" role="status">
//                         <span className="visually-hidden">Loading tasks...</span>
//                     </Spinner>
//                 </div>
//             ) : (
//                 <Table striped bordered hover responsive style={{fontSize:"14px"}}>
//                     <thead>
//                         <tr>
//                             {columns.map(column => (
//                                 <th key={column.key}>{column.title}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {tasks.map(task => (
//                             <tr key={task._id}>
//                                 {columns.map(column => (
//                                     <td key={`${task._id}-${column.key}`}>
//                                         {column.accessor(task)}
//                                     </td>
//                                 ))}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </Table>
//             )}
//         </Container>
//     );
// };


import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Table,
  Spinner,
  Button,
  Form,
  Container,
  Row,
  Col,
  Modal,
  Badge,
  Dropdown,
  Card,
  Alert
} from "react-bootstrap";

const DailyTasksTable = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dateParam = searchParams.get("date");
  const [selectedDate, setSelectedDate] = useState(
    dateParam ? moment(dateParam, "DD-MM-YYYY") : moment()
  );
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, task: null });
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  const columns = [
    {
      title: "Vendor Name",
      key: "vendorName",
      accessor: (task) => task.vendorId?.name || task.vendorName,
    },
    { title: "Email", key: "email", accessor: (task) => task.vendorId?.email },
    { title: "Role", key: "role", accessor: (task) => task.role },
    { title: "Task", key: "task", accessor: (task) => task.task },
    {
      title: "Status",
      key: "status",
      accessor: (task) => (
        <Badge
          bg={
            task.status === "Completed"
              ? "success"
              : task.status === "Pending"
              ? "warning"
              : "secondary"
          }
        >
          {task.status}
        </Badge>
      ),
    },
    {
      title: "Task Date",
      key: "taskDate",
      accessor: (task) => moment(task.taskDate).format("DD-MM-YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      accessor: (task) => (
        <div className="d-flex gap-1">
          <Dropdown>
            <Dropdown.Toggle
              variant="outline-primary"
              size="sm"
              id={`status-dropdown-${task._id}`}
            >
              Update Status
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ zIndex: 9999 }}>
              <Dropdown.Item
                onClick={() => handleStatusChange(task, "Created")}
              >
                Mark as Created
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => handleStatusChange(task, "Pending")}
              >
                Mark as Pending
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => handleStatusChange(task, "Completed")}
              >
                Mark as Completed
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => setDeleteModal({ show: true, task })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const fetchTasksByDate = async (date) => {
    try {
      setLoading(true);

      if (!moment(date, "DD-MM-YYYY", true).isValid()) {
        throw new Error("Invalid date format. Please use DD-MM-YYYY");
      }

      const response = await axios.get(
        `http://localhost:5000/api/daily-tasks/by-date`,
        {
          params: { date },
        }
      );

      if (response.data.success) {
        setTasks(response.data.data);
      } else {
        console.error("Failed to fetch tasks:", response.data.message);
        showAlert(response.data.message || "Failed to fetch tasks", "danger");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showAlert(
        error.response?.data?.message || error.message || "Error fetching tasks",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    if (newStatus === "Pending" && task.status !== "Completed") {
      // Open modal for reschedule date
      setCurrentTask(task);
      setRescheduleDate(moment(task.taskDate).format("YYYY-MM-DD"));
      setShowRescheduleModal(true);
      return;
    }

    await updateTaskStatus(task._id, newStatus);
  };

  const updateTaskStatus = async (taskId, status, rescheduleDate = null) => {
    try {
      setUpdating(true);
      const requestData = { status };

      if (rescheduleDate) {
        requestData.rescheduleDate = rescheduleDate;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/daily-tasks/${taskId}/status`,
        requestData
      );

      console.log("Update response:", response.data); // Debug log

      if (response.data.success) {
        // Update the task in the local state
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? response.data.task : task
          )
        );
        showAlert("Status updated successfully!", "success");
      } else {
        showAlert(response.data.message || "Failed to update status", "warning");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Error updating status";
      showAlert(errorMessage, "danger");
    } finally {
      setUpdating(false);
      setShowRescheduleModal(false);
      setCurrentTask(null);
      setRescheduleDate("");
    }
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduleDate) {
      showAlert("Please select a reschedule date", "warning");
      return;
    }

    await updateTaskStatus(currentTask._id, "Pending", rescheduleDate);
  };

  const handleDeleteTask = async () => {
    try {
      setUpdating(true);
      const response = await axios.delete(
        `http://localhost:5000/api/daily-tasks/${deleteModal.task._id}`
      );

      if (response.data.success) {
        // Remove the task from the local state
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== deleteModal.task._id)
        );
        showAlert("Task deleted successfully!", "success");
      } else {
        showAlert(response.data.message || "Failed to delete task", "warning");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      showAlert(
        error.response?.data?.message || error.message || "Error deleting task",
        "danger"
      );
    } finally {
      setUpdating(false);
      setDeleteModal({ show: false, task: null });
    }
  };

  useEffect(() => {
    const initialDate = dateParam || moment().format("DD-MM-YYYY");
    fetchTasksByDate(initialDate);
    if (!dateParam) {
      setSearchParams({ date: initialDate });
    }
  }, [dateParam]);

  return (
    <Container className="py-4" style={{ minHeight: "100vh" }}>
      {/* Alert Component */}
      {alert.show && (
        <Alert 
          variant={alert.type} 
          className="position-fixed top-0 end-0 m-3"
          style={{ zIndex: 9999, minWidth: "300px" }}
          dismissible
          onClose={() => setAlert({ show: false, message: "", type: "" })}
        >
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4 align-items-center">
        <Col>
          <h4 className="text-primary">
            Daily Tasks for {selectedDate.format("DD-MM-YYYY")}
          </h4>
        </Col>
        <Col xs="auto">
          <Button
            variant="dark"
            onClick={() => navigate("/daily-task")}
            className="d-flex align-items-center"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Calendar
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading tasks...</span>
          </Spinner>
          <p className="mt-2 text-muted">Loading tasks...</p>
        </div>
      ) : (
        <Card>
          <Card.Body className="p-0">
            <div className="table-responsive" style={{ overflow: "visible", fontSize: "12px" }}>
              <Table striped bordered hover className="mb-0">
                <thead className="table-dark">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key} style={{ verticalAlign: "middle" }}>
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      {columns.map((column) => (
                        <td
                          key={`${task._id}-${column.key}`}
                          style={{ verticalAlign: "middle" }}
                        >
                          {column.accessor(task)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {tasks.length === 0 && !loading && (
              <div className="text-center text-muted py-5">
                <i className="bi bi-calendar-x fs-1"></i>
                <h5 className="mt-3">No tasks found for this date</h5>
                <p>Try selecting a different date or create new tasks</p>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Reschedule Modal */}
      <Modal
        show={showRescheduleModal}
        onHide={() => setShowRescheduleModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="bi bi-calendar-check me-2"></i>
            Reschedule Task
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p className="text-muted">
              Please select a new date for this task:
            </p>
            <p>
              <strong>Task:</strong> {currentTask?.task}
            </p>
            <p>
              <strong>Current Date:</strong>{" "}
              {currentTask && moment(currentTask.taskDate).format("DD-MM-YYYY")}
            </p>
          </div>
          <Form.Group>
            <Form.Label className="fw-bold">New Task Date</Form.Label>
            <Form.Control
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              min={moment().format("YYYY-MM-DD")}
              className="border-primary"
            />
            <Form.Text className="text-muted">
              Select a future date to reschedule this task
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowRescheduleModal(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRescheduleConfirm}
            disabled={updating || !rescheduleDate}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Confirm Reschedule
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, task: null })}
        centered
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-warning">
            <strong>Warning:</strong> This action cannot be undone.
          </div>
          <p>Are you sure you want to delete this task?</p>
          <div className="bg-light p-3 rounded">
            <p>
              <strong>Task:</strong> {deleteModal.task?.task}
            </p>
            <p>
              <strong>Vendor:</strong> {deleteModal.task?.vendorName}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {deleteModal.task &&
                moment(deleteModal.task.taskDate).format("DD-MM-YYYY")}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setDeleteModal({ show: false, task: null })}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteTask}
            disabled={updating}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Delete Task
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom CSS to fix dropdown visibility */}
      <style>
        {`
          .table-responsive {
            overflow-x: auto;
            overflow-y: visible;
          }
          .dropdown-menu {
            z-index: 1060 !important;
            position: absolute !important;
          }
        `}
      </style>
    </Container>
  );
};

export default DailyTasksTable;