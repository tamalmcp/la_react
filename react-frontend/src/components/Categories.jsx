import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axiosConfig';
import './UserList.css';

function App() {
    const { user, hasPermission } = useAuth();
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchCategories = async (page = 1) => {
        setLoading(true);
        try {
            // const response = await axios.get('/categories');
            // setCategories(response.data);
            const response = await axios.get(`/categories?page=${page}`);
            setCategories(response.data.data);
            setCurrentPage(response.data.current_page);
            setLastPage(response.data.last_page);
            // console.log(response.data.last_page);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategories(currentPage);
    }, [currentPage]);

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const handleInputChange = (e) => {
        const { name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingCategory) {
                await axios.put(`/categories/${editingCategory.id}`, formData);
                setSuccess('Category updated successfully!');
            } else {
                await axios.post('/categories', formData);
                setSuccess('Category created successfully!');
            }
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Error creating category:', error);
            setError('Failed to create category');
        }
    }

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
        });
        setShowForm(true);
    }

    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            console.log('Deleting category with ID:', categoryId);
            try {
                await axios.delete(`/categories/${categoryId}`);
                setSuccess('Category deleted successfully!');
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                setError('Failed to delete category');
            }
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
        });
        setEditingCategory(null);
        setShowForm(false);
        // setError('');
        // setSuccess('');
    }

    return (
        <div className="user-management">
            <div className="user-header">
                <h2>Categories</h2>
                {!showForm && (
                <button className="btn-add-user" onClick={() =>setShowForm(true)}>Add Category</button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <div className="user-form-container">
                    <h3>Create Category</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-save-user">{editingCategory ? 'Update' : 'Create'}</button>
                            <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                        <tr>
                            <td colSpan="3">Loading categories...</td>
                        </tr>
                        ) : (
                            categories.length === 0 ? (
                                <tr>
                                    <td colSpan="3">No categories found.</td>
                                </tr>
                            ) : (
                                // categories.map((category, index) => (
                                //     <tr key={category.id}>
                                //         <td>{index + 1}</td>
                                //         <td>{category.name}</td>
                                //         <td className="action-buttons">
                                //             <button className="btn-edit-user" onClick={() => handleEdit(category)}>Edit</button>
                                //             <button className="btn-delete-user" onClick={() => handleDelete(category.id)}>Delete</button>
                                //         </td>
                                //     </tr>
                                // ))

                                categories.map((category, index) => {
                                    const perPage = 10; // must match what your backend paginates by
                                    const serialNo = (currentPage - 1) * perPage + index + 1;

                                    return (
                                        <tr key={category.id}>
                                            <td>{serialNo}</td>
                                            <td>{category.name}</td>
                                            <td className="action-buttons">
                                                <button className="btn-edit-user" onClick={() => handleEdit(category)}>Edit</button>
                                                <button className="btn-delete-user" onClick={() => handleDelete(category.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )
                        )}
                    </tbody>
                </table>
                <div className="pagination-controls">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                    >
                        First
                    </button>

                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                        Previous
                    </button>

                    <span>Page {currentPage} of {lastPage}</span>
                    
                    <button
                        disabled={currentPage === lastPage}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Next
                    </button>

                    <button
                        disabled={currentPage === lastPage}
                        onClick={() => setCurrentPage(lastPage)}
                    >
                        Last
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;