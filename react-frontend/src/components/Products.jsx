import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css'
import axios from "../api/axiosConfig";

function App() {
  // const [count, setCount] = useState(0)
  const { user, logout } = useState();
  const navigat = useNavigate();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: ''
  });
  // const [loading, setLoading] = useState(true);

    // Fetch all products
  const fetchProducts = async () => {
    // setLoading(true);
    try {
      const response = await axios.get('/products');
      setProducts(response.data);
      // setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      // alert('Failed to fetch products');
      // setLoading(false);
    }
  }
// console.log('API Base URL:', axios.defaults.baseURL);
  // Only log in development
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('2API Base URL:', axios.defaults.baseURL);
  // }
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submit for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log('Submitting formData:', formData);
    
    try {
      if (editingProduct) {
        // Update product
        await axios.put(`/products/${editingProduct.id}`, formData);
        alert('Product updated successfully!');
      } else {
        // Create product
        await axios.post('/products', formData);
        alert('Product created successfully!');
      }

      // Reset form and refresh list
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock
    });
    setShowForm(true);
    // console.log('Editing product:', product);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/products/${productId}`);
        alert('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // Handle logout
  const handleLogout = async () => {
      await logout();
      navigate('/login');
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Product Management</h1>
        <div className="user-info">
            <span>Welcome, {user?.name}!</span>
            <button onClick={handleLogout} className="btn-logout">
                Logout
            </button>
        </div>

        {/* Add New Product Button */}
        {!showForm && (
          <button className="btn-add" onClick={() => setShowForm(true)}>+ Add New Product</button>
        )}

        {/* Product Form */}
        {showForm && (
          <div className="form-container">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
              </div>
              <div className="form-group">
                <label>Price *</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" required />
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">{editingProduct ? 'Update' : 'Create'}</button>
                <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="products-list">
          <h2>Products ({products.length})</h2>
          {/* ========== loading ========== */}
          {/* {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p className='no-products'>No products found. Add your first product!</p>
          ) : (
            <p>Has Products</p>
          )} */}
          {/* ========== /loading ========== */}
          {products.length === 0 ? (
            <p className='no-products'>No products found. Add your first product!</p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className='description'>{product.description || 'No description'}</p>
                    <div className="product-details">
                      <span className="price">${product.price}</span>
                      <span className="stock">Stock: {product.stock}</span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button className="btn-edit" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(product.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
