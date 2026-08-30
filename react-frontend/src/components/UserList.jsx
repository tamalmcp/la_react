import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import axios from '../api/axiosConfig';
import './UserList.css';

const UserList = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchUsers = async () => {
        //
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            let response;
            if (editingUser) {
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                response = await axios.put(`/users/${editingUser.id}`, updateData);
                setSuccess('User updated successfully!');
            } else {
                response = await axios.post('/users', formData);
                setSuccess('User created successfully!');
            }

            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            setError(error.response?.data?.message || 'Failed to save user');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role || 'user'
        });
        setShowForm(true);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        try {
            await axios.delete(`/users/${id}`);
            setSuccess('User deleted successfully!');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            setError(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await axios.put(`/users/${id}/role`, { role: newRole });
            setSuccess('User role updated successfully!');
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            setError(error.response?.data?.message || 'Failed to update role');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user'
        });
        setEditingUser(null);
        setShowForm(false);
        setError('');
        setSuccess('');
    };

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="user-management">
            <div className="user-header">
                <h2>User Management</h2>
                <button 
                    className="btn-add-user"
                    onClick={() => setShowForm(true)}
                >
                    + Add New User
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <div className="user-form-container">
                    <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>{editingUser ? 'New Password (optional)' : 'Password *'}</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required={!editingUser}
                                minLength="8"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Role *</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-save-user">
                                {editingUser ? 'Update' : 'Create'}
                            </button>
                            <button type="button" className="btn-cancel" onClick={resetForm}>
                                Cancel
                            </button>
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
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data">No users found</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>
                                        <strong>{user.name}</strong>
                                        {user.id === currentUser?.id && (
                                            <span className="badge-you">You</span>
                                        )}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        {user.id === currentUser?.id ? (
                                            <span className="role-badge current-user-role">
                                                {user.role || 'user'}
                                            </span>
                                        ) : (
                                            <select
                                                className="role-select"
                                                value={user.role || 'user'}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        )}
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="action-buttons">
                                        <button 
                                            className="btn-edit-user"
                                            onClick={() => handleEdit(user)}
                                            title="Edit user"
                                        >
                                            Edit
                                        </button>
                                        {user.id !== currentUser?.id && (
                                            <button 
                                                className="btn-delete-user"
                                                onClick={() => handleDelete(user.id)}
                                                title="Delete user"
                                            >
                                                Delete
                                            </button>
                                        )}
                                        {user.id === currentUser?.id && (
                                            <span className="self-action">Cannot delete self</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="user-stats">
                <div className="stat-item">
                    <span className="stat-label">Total Users:</span>
                    <span className="stat-value">{users.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Admins:</span>
                    <span className="stat-value">
                        {users.filter(u => u.role === 'admin').length}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Regular Users:</span>
                    <span className="stat-value">
                        {users.filter(u => u.role === 'user' || !u.role).length}
                    </span>
                </div>
            </div>
            
        </div>
    );
}

export default UserList;
