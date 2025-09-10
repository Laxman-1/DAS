// src/pages/Category.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import { Card, Form, Button, Table } from 'react-bootstrap';

const Category = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create category
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await axios.post('http://127.0.0.1:8000/api/categories', { 
        name: categoryName,
        description: categoryDescription 
      });
      setCategoryName('');
      setCategoryDescription('');
      fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // Update category
  const handleUpdate = async (id) => {
    if (!updatedName.trim()) return;
    try {
      await axios.put(`http://127.0.0.1:8000/api/categories/${id}`, { 
        name: updatedName,
        description: updatedDescription 
      });
      setEditingId(null);
      setUpdatedName('');
      setUpdatedDescription('');
      fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  return (
    <>
      <AdminNavbar />
      <AdminSidebar />
      <div style={{ marginLeft: '220px', padding: '20px' }}>
        <h2 className="mb-4">Manage Doctor Categories</h2>

        <div className="row">
          {/* Add Category Form */}
          <div className="col-md-6 mb-4">
            <Card className="p-4 shadow-sm">
              <h5 className="mb-3">Add Category</h5>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="categoryName">
                  <Form.Label>Category Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="categoryDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter category description"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit" variant="success" className="w-100">
                  Add Category
                </Button>
              </Form>
            </Card>
          </div>

          {/* Categories Table */}
          <div className="col-md-12">
            <Card className="p-4 shadow-sm">
              <h5 className="mb-3">All Categories</h5>
              <Table bordered hover responsive>
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((cat, idx) => (
                      <tr key={cat.id}>
                        <td>{idx + 1}</td>
                        <td>
                          {editingId === cat.id ? (
                            <Form.Control
                              type="text"
                              value={updatedName}
                              onChange={(e) => setUpdatedName(e.target.value)}
                            />
                          ) : (
                            cat.name
                          )}
                        </td>
                        <td>
                          {editingId === cat.id ? (
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={updatedDescription}
                              onChange={(e) => setUpdatedDescription(e.target.value)}
                            />
                          ) : (
                            cat.description || 'No description'
                          )}
                        </td>
                        <td>
                          {editingId === cat.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                className="me-2"
                                onClick={() => handleUpdate(cat.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="warning"
                                className="me-2"
                                onClick={() => {
                                  setEditingId(cat.id);
                                  setUpdatedName(cat.name);
                                  setUpdatedDescription(cat.description || '');
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(cat.id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Category;
