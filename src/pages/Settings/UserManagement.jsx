import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Alert } from 'react-bootstrap';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';
import editIcon from "../../assets/icons/editIcon.png";
import deleteIcon from "../../assets/icons/deleteIcon.png";

const UserManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        phonenumber: '', // Changed from 'phone' to 'phonenumber' to match backend
        password: '',
        role: 'user', // Default to 'user' to match backend enum
        status: 'active'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch all users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/users');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setFormData({
            name: '',
            email: '',
            username: '',
            phonenumber: '', // Changed from 'phone' to 'phonenumber'
            password: '',
            role: 'user', // Default to 'user'
            status: 'active'
        });
        setError('');
    };

    const handleShow = () => setShowModal(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = formData.id
                ? `http://localhost:5000/api/users/${formData.id}`
                : 'http://localhost:5000/api/users';
            const method = formData.id ? 'PUT' : 'POST';

            const body = { ...formData };
            if (!formData.id) delete body.id; // Remove id for new user creation
            if (!body.password) delete body.password; // Remove empty password on update

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save user');
            }

            await fetchUsers();
            handleClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setFormData({
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            phonenumber: user.phonenumber, // Changed from 'phone' to 'phonenumber'
            password: '',
            role: user.role,
            status: user.status
        });
        handleShow();
    };

    const handleDelete = async (userId) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }
            await fetchUsers();
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (user) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: user.status === 'active' ? 'inactive' : 'active' })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to toggle user status');
            }
            await fetchUsers();
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            {error && <Alert variant="danger">{error}</Alert>}
            {loading && <Alert variant="info">Loading...</Alert>}
            <div className="d-flex justify-content-end align-items-center mb-4">
                <Button variant="dark" onClick={handleShow} disabled={loading}>
                    Add New User
                </Button>
            </div>

            <div className="table-responsive bg-white mt-3" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                <Table className="table table-hover align-middle">
                    <thead className="text-white text-center sticky-top" style={{ fontSize: "14px" }}>
                        <tr>
                            <th>SI. No.</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: "12px" }} className='fw-semibold text-center'>
                        {users.map((user, index) => (
                            <tr key={user._id}>
                                <td>{String(index + 1).padStart(2, "0")}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td className='fw-bold'>{user.role}</td>
                                <td className={user.status === 'active' ? 'text-success' : 'text-danger'}>
                                    {user.status === 'active' ? 'Active' : 'Inactive'}
                                </td>
                                <td className="text-center">
                                    <Button
                                        variant="link"
                                        className="text-primary p-0 me-2"
                                        onClick={() => handleEdit(user)}
                                        disabled={loading}
                                    >
                                        <img src={editIcon} alt="editIcon" style={{ width: "20px" }} />
                                    </Button>
                                    <Button
                                        variant="link"
                                        className="text-danger p-0 me-2"
                                        onClick={() => handleDelete(user._id)}
                                        disabled={loading}
                                    >
                                        <img src={deleteIcon} alt="deleteIcon" style={{ width: "20px" }} />
                                    </Button>
                                    <Button
                                        variant="link"
                                        className={`p-0 ${user.status === 'active' ? 'text-success' : 'text-secondary'}`}
                                        onClick={() => handleToggleActive(user)}
                                        disabled={loading}
                                    >
                                        {user.status === 'active' ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Add/Edit User Modal */}
            <Modal show={showModal} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{formData.id ? 'Edit User' : 'Add New User'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"

                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phonenumber" // Changed from 'phone' to 'phonenumber'
                                        value={formData.phonenumber}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={!formData.id}
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label>Role</Form.Label>
                                  <Form.Select
  name="role"
  value={formData.role}
  onChange={handleInputChange}
  required
  disabled={loading}
>
  <option value="user">User</option>
  <option value="admin">Admin</option>
  <option value="accountant">Accountant</option>
  <option value="manager">Manager</option>
  <option value="superadmin">Super Admin</option>
</Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button variant="dark" type="submit" disabled={loading}>
                                {formData.id ? 'Update' : 'Add'} User
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default UserManagement;