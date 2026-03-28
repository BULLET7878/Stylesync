import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Package, Upload, Save, X, Info } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductEdit = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(899);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('tshirts');
  const [countInStock, setCountInStock] = useState(1);
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }

    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
          const { data } = await axios.get(`${API_URL}/api/products/${id}`);
          setTitle(data.title);
          setPrice(data.price);
          setDescription(data.description);
          setCategory(data.category);
          setCountInStock(data.countInStock);
          setImages(data.images);
          setTags(data.tags?.join(', ') || '');
        } catch (error) {
          toast.error('Failed to fetch product details');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, user, navigate]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const { data } = await axios.post(`${API_URL}/api/upload`, formData, config);
      setImages([...images, data]);
      toast.success('Image uploaded and processed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const productData = {
      title,
      price,
      description,
      category,
      countInStock,
      images,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
    };

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      if (isEditMode) {
        await axios.put(`${API_URL}/api/products/${id}`, productData, config);
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API_URL}/api/products`, productData, config);
        toast.success('Product created successfully');
      }
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('FRONTEND SAVE ERROR:', error);
      console.error('Error Response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/seller/dashboard')} className="text-gray-500 hover:text-gray-700 font-medium">
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-primary-600" />
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details below to reach thousands of StyleSync buyers.
          </p>
        </div>

        <form onSubmit={submitHandler} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Title</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Slim Fit Casual Shirt"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
              <input
                type="number"
                required
                min="899"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Minimum allowed price is ₹899
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="tshirts">T-Shirts</option>
                <option value="jeans">Jeans</option>
                <option value="ethnic">Ethnic Wear</option>
                <option value="shoes">Shoes</option>
                <option value="accessories">Accessories</option>
                <option value="shirts">Shirts</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Stock Inventory</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tags (AI Metadata)</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="summer, casual, essential"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                required
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Give a detailed description of your product..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Images</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-[4/5] rounded-xl overflow-hidden border border-gray-100 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <label className={`aspect-[4/5] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${uploading ? 'animate-pulse' : ''}`}>
                  <input type="file" className="hidden" onChange={uploadFileHandler} disabled={uploading} />
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </span>
                </label>
              </div>
              <p className="text-xs text-amber-600 font-medium">
                * Our AI will automatically crop and optimize images for the best viewing experience.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {submitting ? 'Saving changes...' : (isEditMode ? 'Update Product' : 'Publish Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;
