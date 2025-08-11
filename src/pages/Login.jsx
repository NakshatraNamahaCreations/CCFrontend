import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Image } from 'react-bootstrap';
import logo from '../assets/icons/logo.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ handleLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error message
    console.log('Form submitted, email:', email, 'password:', password);

    try {
      // Make API call to login endpoint
      console.log('Making API call to login...');
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API response:', response.data);

      // Extract user data from response
      const { data, token } = response.data;
      const userData = {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        phonenumber: data.phonenumber,
        role: data.role,
        profileImage: data.profileImage || 'https://images.unsplash.com/photo-1619895862022-09114b41f16f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Default image if none provided
      };

      // Save user data and token to localStorage
      console.log('Saving user data to localStorage:', userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token); // Store JWT token
      localStorage.setItem('isLoggedIn', 'true'); // Flag to track login status

      // Call handleLogin to update app state
      console.log('Calling handleLogin...');
      handleLogin(userData);

      // Navigate to dashboard
      console.log('Navigating to /dashboard...');
      window.location.reload();
      navigate('/dashboard', { replace: true }); // Use replace to avoid adding to history stack
    } catch (err) {
      // Handle error response
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Invalid email or password';
      setError(errorMessage);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center login-container"
      style={{
        height: '100vh',
        backgroundImage: 'url(https://cdn.pixabay.com/photo/2023/11/15/16/23/hydrangea-8390432_1280.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Row className="w-100">
        <Col md={4} className="mx-auto">
          <div className="login-box bg-white p-4 rounded shadow-lg" style={{ opacity: 0.9 }}>
            <h6 className="text-center mb-4">Welcome to Classy Captures</h6>
            <div className="text-center mb-4">
              <Image src={logo} alt="Logo" fluid style={{ width: '100px' }} />
            </div>
            {error && <p className="text-danger text-center">{error}</p>}
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formEmail" style={{ marginBottom: '10px' }}>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPassword" style={{ marginBottom: '20px' }}>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="dark" type="submit" className="w-100">
                Login
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;