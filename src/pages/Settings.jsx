import React from 'react'
import { Card } from 'react-bootstrap'
import { FaUserAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const navigate = useNavigate();
    return (
        <div className="container py-2 rounded vh-100" style={{ background: "#F4F4F4" }}>

            <div className='d-flex gap-5 align-items-center justify-content-between p-2 rounded'>
                <Card
                    className="border-0 hover-effect"
                    style={{ width: "200px", height: "200px" }}
                    onClick={() => navigate("/settings/add-User")}
                >
                    <Card.Body className="d-flex gap-2 flex-column align-items-center justify-content-center">
                        <FaUserAlt size={50} className="user-icon  border rounded-circle p-2" style={{ color: "#000" }} />
                        <h4>User</h4>
                    </Card.Body>
                </Card>

            </div>
        </div>
    )
}

export default Settings