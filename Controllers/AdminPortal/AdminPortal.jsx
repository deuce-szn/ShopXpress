// AdminPortal.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSave, 
  FaTimes, 
  FaSync,
  FaUsers,
  FaBox,
  FaTags,
  FaShoppingCart,
  FaCreditCard,
  FaShoppingBag,
  FaTruck,
  FaCog,
  FaDatabase,
  FaBars,
  FaChevronDown,
  FaUserCircle,
  FaFileAlt
} from 'react-icons/fa';
import './AdminPortal.css';

const AdminPortal = () => {
  // API Configuration
  const API_SERVER = 'http://localhost:3000/api/shop';
  const SHORT_NAME = 'admin';

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Navigation Items with explicit action mappings
  const navItems = [
    { 
      id: 'users', 
      label: 'Users', 
      icon: <FaUsers />, 
      color: '#3b82f6',
      actions: {
        get: 'getusers',
        create: 'createuser',
        update: 'updateuser',
        delete: 'deleteuser'
      }
    },
    { 
      id: 'categories', 
      label: 'Categories', 
      icon: <FaTags />, 
      color: '#10b981',
      actions: {
        get: 'getcategories',
        create: 'createcategory',
        update: 'updatecategory',
        delete: 'deletecategory'
      }
    },
    { 
      id: 'products', 
      label: 'Products', 
      icon: <FaBox />, 
      color: '#f59e0b',
      actions: {
        get: 'getproducts',
        create: 'createproduct',
        update: 'updateproduct',
        delete: 'deleteproduct'
      }
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: <FaShoppingCart />, 
      color: '#8b5cf6',
      actions: {
        get: 'getorders',
        create: 'createorder',
        update: 'updateorder',
        delete: 'deleteorder'
      }
    },
    { 
      id: 'payments', 
      label: 'Payments', 
      icon: <FaCreditCard />, 
      color: '#06b6d4',
      actions: {
        get: 'getpayments',
        create: 'createpayment',
        update: 'updatepayment',
        delete: 'deletepayment'
      }
    },
    { 
      id: 'bagging', 
      label: 'Bagging', 
      icon: <FaShoppingBag />, 
      color: '#ec4899',
      actions: {
        get: 'getbagging',
        create: 'createbagging',
        update: 'updatebagging',
        delete: 'deletebagging'
      }
    },
    { 
      id: 'delivery', 
      label: 'Delivery', 
      icon: <FaTruck />, 
      color: '#6366f1',
      actions: {
        get: 'getdelivery',
        create: 'createdelivery',
        update: 'updatedelivery',
        delete: 'deletedelivery'
      }
    },
  ];

  // Data State
  const [selectedEntity, setSelectedEntity] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // CRUD Operations
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({});

  // Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get current entity config
  const getCurrentEntity = () => {
    return navItems.find(item => item.id === selectedEntity) || navItems[0];
  };

  // Initialize form structures for each entity
  const entityForms = {
    users: {
      email: '',
      name: '',
      password: '',
      userRole: 'customer',
      gRole: 'user',
      profilePic: null
    },
    categories: {
      name: '',
      categoryImage: null
    },
    products: {
      productName: '',
      productDescription: '',
      productPrice: '',
      categoryId: '',
      productImage: null
    },
    orders: {
      userId: '',
      products: '',
      quantity: '',
      totalPrice: '',
      orderStatus: 'pending'
    },
    payments: {
      orderId: '',
      userId: '',
      amount: '',
      paymentMethod: '',
      paymentStatus: 'pending'
    },
    bagging: {
      customerId: '',
      baggerId: '',
      products: '',
      totalItems: '',
      totalPrice: ''
    },
    delivery: {
      deliveryId: '',
      orderId: '',
      CustomerId: '',
      DeliveryPersonelId: '',
      deliveryAddress: '',
      deliveryStatus: 'pending'
    }
  };

  // Generic API call function
  const callApi = async (action, formData = new FormData()) => {
    try {
      const finalFormData = new FormData();
      finalFormData.append('action', action);
      
      // Copy all entries from provided formData
      for (const [key, value] of formData.entries()) {
        finalFormData.append(key, value);
      }

      const response = await fetch(API_SERVER, {
        method: 'POST',
        headers: { 'ShortName': SHORT_NAME },
        body: finalFormData
      });

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('API call error:', err);
      return { 
        success: false, 
        message: `Network error: ${err.message}` 
      };
    }
  };

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const entity = getCurrentEntity();
    const action = entity.actions.get;

    try {
      const result = await callApi(action);
      
      if (result.success) {
        // Handle different response structures
        let dataArray;
        if (result.data && Array.isArray(result.data)) {
          dataArray = result.data;
        } else if (result.data && result.data[selectedEntity]) {
          dataArray = result.data[selectedEntity];
        } else if (result.data && result.data.products) {
          dataArray = result.data.products;
        } else if (result.data && typeof result.data === 'object') {
          dataArray = [result.data];
        } else {
          dataArray = [];
        }

        setData(dataArray);
        setFilteredData(dataArray);
        setSuccess(`Successfully loaded ${dataArray.length} ${entity.label.toLowerCase()}`);
      } else {
        setError(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedEntity]);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => {
        return Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredData(filtered);
    }
  }, [searchTerm, data]);

  // Handle edit form change
  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle create form change
  const handleCreateChange = (field, value) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file upload in forms
  const handleFileChange = (field, file, isCreate = false) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        [field]: file
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  // Start editing
  const startEdit = (item) => {
    const idField = getEntityIdField(selectedEntity);
    setEditingId(item[idField] || item.id || item.UserId || item.categoryId || item.orderId || item.paymentId || item.bagId || item.deliveryId);
    setEditForm({ ...item });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Save edit
  const saveEdit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const entity = getCurrentEntity();
    const action = entity.actions.update;
    const idField = getEntityIdField(selectedEntity);
    
    const formData = new FormData();
    formData.append(idField, editingId);

    // Add all form fields
    Object.entries(editForm).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    try {
      const result = await callApi(action, formData);

      if (result.success) {
        setSuccess('Item updated successfully');
        fetchData(); // Refresh data
        cancelEdit();
      } else {
        setError(result.message || 'Failed to update item');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const deleteItem = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const entity = getCurrentEntity();
    const action = entity.actions.delete;
    const idField = getEntityIdField(selectedEntity);
    
    const formData = new FormData();
    formData.append(idField, itemToDelete);

    try {
      const result = await callApi(action, formData);

      if (result.success) {
        setSuccess('Item deleted successfully');
        fetchData(); // Refresh data
        setShowDeleteModal(false);
        setItemToDelete(null);
      } else {
        setError(result.message || 'Failed to delete item');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new item
  const createItem = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const entity = getCurrentEntity();
    const action = entity.actions.create;
    
    const formData = new FormData();

    // Add all form fields
    Object.entries(createForm).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    try {
      const result = await callApi(action, formData);

      if (result.success) {
        setSuccess('Item created successfully');
        fetchData(); // Refresh data
        setIsCreating(false);
        setCreateForm(entityForms[selectedEntity]);
      } else {
        setError(result.message || 'Failed to create item');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get ID field name for entity
  const getEntityIdField = (entity) => {
    const idFields = {
      users: 'UserId',
      categories: 'categoryId',
      products: 'id',
      orders: 'orderId',
      payments: 'paymentId',
      bagging: 'bagId',
      delivery: 'deliveryId'
    };
    return idFields[entity] || 'id';
  };

  // Get column headers based on data
  const getTableHeaders = () => {
    if (filteredData.length > 0) {
      const firstItem = filteredData[0];
      return Object.keys(firstItem).filter(key => 
        !['Password', 'Token', 'createdAt', 'updatedAt'].includes(key)
      );
    }
    return [];
  };

  // Format value for display
  const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      return (
        <img 
          src={value} 
          alt="Uploaded" 
          className="admin-image-preview" 
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.textContent = 'Image not found';
          }}
        />
      );
    }
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return value.toString();
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Load data on entity change
  useEffect(() => {
    fetchData();
  }, [selectedEntity, fetchData]);

  return (
    <div className="admin-portal">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>
            <FaDatabase /> Admin<span>Portal</span>
          </h2>
        </div>
        
        <div className="nav-menu">
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${selectedEntity === item.id ? 'active' : ''}`}
              onClick={() => setSelectedEntity(item.id)}
            >
              <i style={{ color: item.color }}>{item.icon}</i>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="menu-toggle" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars />
            </button>
            <h1 className="page-title">
              {getCurrentEntity().label} Management
            </h1>
          </div>
          
          <div className="header-right">
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              <FaSync className={loading ? 'spinning' : ''} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="user-profile">
              <div className="user-avatar">
                <FaUserCircle />
              </div>
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Administrator</span>
              </div>
              <FaChevronDown />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="content-wrapper">
          {/* Status Messages */}
          {(error || success) && (
            <div className="status-container">
              <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                {error ? <FaTimes /> : <FaSave />}
                {error || success}
              </div>
            </div>
          )}

          {/* Data Management Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>{getCurrentEntity().label} List</h3>
              <div className="controls">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search ${getCurrentEntity().label.toLowerCase()}...`}
                  />
                </div>
                <button
                  onClick={() => setIsCreating(true)}
                  className="btn btn-success"
                >
                  <FaPlus />
                  Add New
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="table-container">
              {loading && !data.length ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Loading {getCurrentEntity().label.toLowerCase()} data...</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="empty-state">
                  <FaFileAlt size={48} />
                  <p>No {getCurrentEntity().label.toLowerCase()} found.</p>
                  <button 
                    onClick={fetchData}
                    className="btn btn-outline"
                    style={{ marginTop: '16px' }}
                  >
                    Try Loading Data
                  </button>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      {getTableHeaders().map(header => (
                        <th key={header}>
                          {header.replace(/([A-Z])/g, ' $1')}
                        </th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => {
                      const idField = getEntityIdField(selectedEntity);
                      const itemId = item[idField] || item.id || item.UserId || item.categoryId || item.orderId || item.paymentId || item.bagId || item.deliveryId;
                      const isEditing = editingId === itemId;
                      
                      return (
                        <tr key={index}>
                          {getTableHeaders().map(header => (
                            <td key={header}>
                              {isEditing ? (
                                header.includes('Image') || header === 'profilePic' || header === 'categoryImage' || header === 'productImage' ? (
                                  <input
                                    type="file"
                                    onChange={(e) => handleFileChange(header, e.target.files?.[0] || null)}
                                    className="form-input"
                                    style={{ fontSize: '12px' }}
                                  />
                                ) : header === 'products' ? (
                                  <textarea
                                    value={editForm[header] || ''}
                                    onChange={(e) => handleEditChange(header, e.target.value)}
                                    className="form-input"
                                    rows="2"
                                    style={{ fontSize: '12px' }}
                                  />
                                ) : (
                                  <input
                                    type={header.includes('Price') || header.includes('amount') ? 'number' : 'text'}
                                    value={editForm[header] || ''}
                                    onChange={(e) => handleEditChange(header, e.target.value)}
                                    className="form-input"
                                    style={{ fontSize: '12px' }}
                                  />
                                )
                              ) : (
                                formatValue(item[header])
                              )}
                            </td>
                          ))}
                          <td>
                            {isEditing ? (
                              <div className="action-buttons">
                                <button
                                  onClick={saveEdit}
                                  className="action-btn action-btn-save"
                                  title="Save"
                                >
                                  <FaSave />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="action-btn action-btn-cancel"
                                  title="Cancel"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ) : (
                              <div className="action-buttons">
                                <button
                                  onClick={() => startEdit(item)}
                                  className="action-btn action-btn-edit"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => {
                                    setItemToDelete(itemId);
                                    setShowDeleteModal(true);
                                  }}
                                  className="action-btn action-btn-delete"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {filteredData.length > itemsPerPage && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="page-btn"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="page-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="modal-overlay">
          <div className="create-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                Create New {getCurrentEntity().label}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setCreateForm(entityForms[selectedEntity]);
                }}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-grid">
                {Object.entries(entityForms[selectedEntity]).map(([field, defaultValue]) => (
                  <div key={field} className="form-group">
                    <label className="form-label">
                      {field.replace(/([A-Z])/g, ' $1')}
                    </label>
                    {field.includes('Image') || field === 'profilePic' || field === 'categoryImage' || field === 'productImage' ? (
                      <div>
                        <input
                          type="file"
                          onChange={(e) => handleCreateChange(field, e.target.files?.[0] || null)}
                          className="form-input"
                        />
                        <small style={{ color: '#6b7280', fontSize: '12px' }}>
                          Upload file for {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </small>
                      </div>
                    ) : field === 'products' ? (
                      <textarea
                        value={createForm[field] || ''}
                        onChange={(e) => handleCreateChange(field, e.target.value)}
                        placeholder="Enter JSON array of products"
                        className="form-textarea"
                      />
                    ) : (
                      <input
                        type={field.includes('Price') || field.includes('amount') ? 'number' : 'text'}
                        value={createForm[field] || ''}
                        onChange={(e) => handleCreateChange(field, e.target.value)}
                        placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                        className="form-input"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setCreateForm(entityForms[selectedEntity]);
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={createItem}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Creating...' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-content">
              <div className="delete-icon">
                <FaTrash />
              </div>
              <h3 className="delete-title">Confirm Delete</h3>
              <p className="delete-message">
                Are you sure you want to delete this {getCurrentEntity().label.toLowerCase()}? This action cannot be undone.
              </p>
              <div className="delete-actions">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteItem}
                  disabled={loading}
                  className="btn btn-danger"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;