import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Table, Spinner, Button, Form, Container, Row, Col } from 'react-bootstrap';

const DailyTasksTable = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const dateParam = searchParams.get('date');
    const [selectedDate, setSelectedDate] = useState(
        dateParam ? moment(dateParam, 'DD-MM-YYYY') : moment()
    );

    const columns = [
        { title: 'Vendor Name', key: 'vendorName', accessor: task => task.vendorId?.name },
        { title: 'Email', key: 'email', accessor: task => task.vendorId?.email },
        { title: 'Role', key: 'role', accessor: task => task.role },
        { title: 'Task', key: 'task', accessor: task => task.task },
        { 
            title: 'Created At', 
            key: 'createdAt', 
            accessor: task => moment(task.createdAt).format('DD-MM-YYYY HH:mm') 
        },
    ];

    const fetchTasksByDate = async (date) => {
        try {
            setLoading(true);
            
            if (!moment(date, 'DD-MM-YYYY', true).isValid()) {
                throw new Error('Invalid date format. Please use DD-MM-YYYY');
            }

            const response = await axios.get(`http://localhost:5000/api/daily-tasks/by-date`, {
                params: { date }
            });

            if (response.data.success) {
                setTasks(response.data.data);
            } else {
                console.error('Failed to fetch tasks:', response.data.message);
                alert(response.data.message || 'Failed to fetch tasks');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            alert(error.response?.data?.message || error.message || 'Error fetching tasks');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const initialDate = dateParam || moment().format('DD-MM-YYYY');
        fetchTasksByDate(initialDate);
        if (!dateParam) {
            setSearchParams({ date: initialDate });
        }
    }, [dateParam]);

    return (
        <Container className="py-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h5>Daily Tasks for {selectedDate.format('DD-MM-YYYY')}</h5>
                </Col>
                <Col xs="auto">
                    <Button 
                        variant="dark"
                        onClick={() => navigate('/daily-task')}
                    >
                        Back to Calendar
                    </Button>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading tasks...</span>
                    </Spinner>
                </div>
            ) : (
                <Table striped bordered hover responsive style={{fontSize:"14px"}}>
                    <thead>
                        <tr>
                            {columns.map(column => (
                                <th key={column.key}>{column.title}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task._id}>
                                {columns.map(column => (
                                    <td key={`${task._id}-${column.key}`}>
                                        {column.accessor(task)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default DailyTasksTable;