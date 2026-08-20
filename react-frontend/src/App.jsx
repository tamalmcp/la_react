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

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
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
          {console.log(products.length)}
        </div>
      </div>
    </div>
  )
}

export default App
