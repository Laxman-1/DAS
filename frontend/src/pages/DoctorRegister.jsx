import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Button,
  Container,
  Card,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";

const DoctorRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    dob: "",
    contact: "",
    address: "",
    qualification: "",
    specialization: "",
    license_number: "",
    experience: "",
    category_id: "",
    citizenship_number: "",
    bio: "",
  });

  const [files, setFiles] = useState({
    citizenship_file: null,
    passport_file: null,
    image: null,
    documents: [],
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file inputs
  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (name === "documents") {
      setFiles((prev) => ({ ...prev, documents: Array.from(selectedFiles) }));
    } else {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  // Validation before submit
  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage("Full name is required.");
      return false;
    }
    if (!formData.email.includes("@")) {
      setErrorMessage("Enter a valid email.");
      return false;
    }
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return false;
    }
    if (!/^\d{10}$/.test(formData.contact)) {
      setErrorMessage("Contact number must be exactly 10 digits.");
      return false;
    }
    if (formData.experience < 0) {
      setErrorMessage("Experience must be a positive number.");
      return false;
    }
    if (!formData.license_number.trim()) {
      setErrorMessage("License number is required.");
      return false;
    }
    if (!formData.category_id) {
      setErrorMessage("Please select a category.");
      return false;
    }
    // Bio is optional, so no validation required
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append single files
      if (files.citizenship_file) {
        formDataToSend.append("citizenship_file", files.citizenship_file);
      }
      if (files.passport_file) {
        formDataToSend.append("passport_file", files.passport_file);
      }
      if (files.image) {
        formDataToSend.append("image", files.image);
      }

      // Append multiple documents
      files.documents.forEach((doc, index) => {
        formDataToSend.append(`documents[${index}]`, doc);
      });

      const response = await axios.post(
        "http://127.0.0.1:8000/api/doctors",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSuccessMessage("Doctor registered successfully!");
      console.log(response.data);

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        gender: "",
        dob: "",
        contact: "",
        address: "",
        qualification: "",
        specialization: "",
        license_number: "",
        experience: "",
        category_id: "",
        citizenship_number: "",
        bio: "",
      });
      setFiles({
        citizenship_file: null,
        passport_file: null,
        image: null,
        documents: [],
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt-5">
        <Card className="p-4 shadow-lg rounded-4">
          <h2 className="mb-4 text-center text-primary">
            Doctor Registration
          </h2>

          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Row 1 */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 2 */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact</Form.Label>
                  <Form.Control
                    type="text"
                    name="contact"
                    placeholder="Enter 10-digit contact number"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 3 */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Citizenship + Passport */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Citizenship Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="citizenship_number"
                    placeholder="Enter citizenship number"
                    value={formData.citizenship_number}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Citizenship File</Form.Label>
                  <Form.Control
                    type="file"
                    name="citizenship_file"
                    onChange={handleFileChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Passport File</Form.Label>
                  <Form.Control
                    type="file"
                    name="passport_file"
                    onChange={handleFileChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Profile Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 4 */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Qualification</Form.Label>
                  <Form.Control
                    type="text"
                    name="qualification"
                    placeholder="Enter qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Specialization</Form.Label>
                  <Form.Control
                    type="text"
                    name="specialization"
                    placeholder="Enter specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 5 */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>License Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="license_number"
                    placeholder="Enter license number"
                    value={formData.license_number}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Experience (years)</Form.Label>
                  <Form.Control
                    type="number"
                    name="experience"
                    placeholder="Enter years of experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 6: Bio */}
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    placeholder="Enter a short bio (optional)"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Category */}
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Address */}
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter full address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Multiple documents */}
            <Form.Group className="mb-3">
              <Form.Label>Additional Documents</Form.Label>
              <Form.Control
                type="file"
                name="documents"
                multiple
                onChange={handleFileChange}
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100 mt-3"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Register"}
            </Button>
          </Form>
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default DoctorRegister;