import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import './RolePermissionMAnager.css';

const RolePermissionMAnager = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [newPermissionName, setNewPermissionName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                axios.get('/roles'),
                axios.get('/permissions'),
            ]);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
        } catch (error) {
            console.error('Error fetching data: ', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateRole = async (e) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;

        setError('');
        setSuccess('');

        try {
            await axios.post('/roles', {name: newRoleName});
            setSuccess('Role saved successfully!');
            setNewRoleName('');
            fetchData();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create role');
            console.error('Error creating category:', error);
        }
    };

    const handleDeleteRole = async (id) => {
        if (!window.confirm('Delete this role?')) return;
        try {
            await axios.delete(`/roles/${id}`)
            if (selectedRole?.id === id) setSelectedRole(null);
            setSuccess('Role deleted successfully!');
            fetchData();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create role');
        }
    };

    if (loading) return <div className="loading">Loading Role Manager...</div>;

    return (
        <div className="role-manager">
            <h2>Role & Permission Management</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="manager-grid">
                {/* Roles Column */}
                <div className="column roles-column">
                    <h3>Roles</h3>
                    <form onSubmit={handleCreateRole} className="create-form">
                        <input 
                        type="text" 
                        placeholder="New role name..."
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        />
                        <button type="submit" className="btn-save">Add</button>
                    </form>
                    <ul className="item-list">
                        {roles.map(role => (
                            <li 
                                key={role.id} 
                                className={selectedRole?.id === role.id ? 'active' : ''}
                                onClick={() => setSelectedRole(role)}
                                >
                                <span>{role.name}</span>
                                <button 
                                    className="btn-delete-small"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                                >
                                    x
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Permissions Column */}
                <div className="column permissions-column">
                    <h3>Permissions</h3>
                    <form className="create-form">
                        <input 
                        type="text" 
                        placeholder="New permission name..."
                        value=""
                        onChange=""
                        />
                        <button type="submit" className="btn-save">Add</button>
                    </form>
                    <ul className="item-list">
                        {permissions.map(perm => (
                        <li key={perm.id}>
                            <span>{perm.name}</span>
                            <button className="btn-delete-small">x</button>
                        </li>
                        ))}
                    </ul>
                </div>

                {/* Assignment Matrix */}
                <div className="column assignment-column">
                    <h3>Assign Permissions to: Role Name</h3>
                    <div className="permission-matrix">
                        <label className="checkbox-label">
                            <input type="checkbox" /> Perm Name
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" /> Perm Name2
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" /> Perm Name3
                        </label>
                    </div>
                    <button className="btn-save">Save Permissions</button>
                </div>
            </div>
        </div>
    );
}

export default RolePermissionMAnager;