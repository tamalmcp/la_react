import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
import './App.css'
import axios from "./api/axiosConfig";

function App() {
  // const [count, setCount] = useState(0)
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

  const fetchProducts = async () => {
    // setLoading(true);
    try {
      const response = await axios.get('/products');
      setProducts(response.data);
      // setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
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

  return (
    <div className="App">
      <div className="container">
        <h1>Product Management</h1>
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
  )
}

export default App
