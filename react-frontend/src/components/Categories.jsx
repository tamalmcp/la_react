import React, { useState, useEffect } from 'react';
import './UserList.css';

function App() {
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
    });

    useEffect(() => {
        setSuccess('');
        setError('');
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        console.log('Form submitted');
    }

    const resetForm = () => {
        setShowForm(false);
        setError('');
        setSuccess('');
    }

    return (
        <div className="user-management">
            <div className="user-header">
                <h2>Categories</h2>
                <button className="btn-add-user" onClick={() =>setShowForm(true)}>Add Category</button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <div className="user-form-container">
                    <h3>Create Category</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name *</label>
                            <input type="text" placeholder="Enter category name" />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-save-user">Create</button>
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
                        <tr>
                            <td>1</td>
                            <td>Category 1</td>
                            <td>Actn</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default App;