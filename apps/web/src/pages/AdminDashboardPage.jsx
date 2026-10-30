import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Archive,
  ShoppingCart,
  Users,
  Truck,
  Scissors,
  FileText,
  Settings,
  LogOut,
  Plus,
  AlertTriangle,
  TrendingUp,
  Search,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Edit,
  UploadCloud,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageSquare,
  Menu,
  Check
} from 'lucide-react';
import { formatPKR } from '@/lib/whatsapp';
import { toast } from 'sonner';

export const CATEGORY_FABRICS = {
  Men: [
    'Rashid Cotton',
    'Ahmad Cotton',
    'Wash & Wear',
    'Boski',
    'Khaddar',
    'Lattha',
    'Karandi',
    'Wool Blend'
  ],
  Women: [
    'Lawn Unstitched',
    'Luxury Pret',
    'Chiffon',
    'Organza',
    'Silk',
    'Velvet',
    'Cotton Kurti'
  ],
  Perfumes: [
    'Attar Oil (Ittar)',
    'Eau De Parfum (EDP)',
    'Royal Oudh',
    'French Luxury Blend',
    'Non-Alcoholic Perfume'
  ]
};

export default function AdminDashboardPage() {
  const { adminUser, token, isAuthenticated, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    pendingOrders: 0,
    lowStockProducts: [],
    recentOrders: []
  });

  // Data lists
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [stitchingList, setStitchingList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // New Product Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    type: 'Rashid Cotton',
    category: 'Men',
    price: '',
    originalPrice: '',
    fabric: '',
    stock_quantity: 15
  });

  // Multiple Image state: both external URL link input & uploaded/pending files
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageLinks, setImageLinks] = useState([]); // Array of strings (URLs)
  const [selectedFilePreviews, setSelectedFilePreviews] = useState([]); // [{ file, preview }]
  const fileInputRef = useRef(null);

  // Fetch Dashboard Analytics
  const fetchDashboardStats = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setStats(d.stats);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const d = await res.json();
      if (d.success) setProductsList(d.products);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setOrdersList(d.orders);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Stitching
  const fetchStitching = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/stitching', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setStitchingList(d.requests);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Reviews
  const fetchReviews = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) setReviewsList(d.reviews);
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Review Approval
  const handleToggleReviewApproval = async (reviewId, currentApproval) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_approved: !currentApproval })
      });
      if (res.ok) {
        toast.success(`Review ${!currentApproval ? 'Approved & Published' : 'Moved to Pending'}`);
        fetchReviews();
      }
    } catch (e) {
      toast.error('Failed to update review status');
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Review deleted permanently');
        fetchReviews();
      }
    } catch (e) {
      toast.error('Failed to delete review');
    }
  };

  // Category change for new product
  const handleCategoryChange = (newCat) => {
    const fabrics = CATEGORY_FABRICS[newCat] || CATEGORY_FABRICS.Men;
    setNewProd(prev => ({
      ...prev,
      category: newCat,
      type: fabrics[0]
    }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
      fetchProducts();
      fetchOrders();
      fetchStitching();
      fetchReviews();
    }
  }, [isAuthenticated, activeTab]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    const res = await login(loginForm.username, loginForm.password);
    setLoggingIn(false);
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success('Signed in successfully as Administrator');
    }
  };

  // Image Link Handler (Add to list)
  const handleAddImageLink = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImageLinks(prev => [...prev, url]);
    setImageUrlInput('');
  };

  const handleRemoveImageLink = (idx) => {
    setImageLinks(prev => prev.filter((_, i) => i !== idx));
  };

  // File Selection / Drag and Drop Handler
  const handleFilesSelect = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveFilePreview = (index) => {
    setSelectedFilePreviews(prev => {
      const target = prev[index];
      if (target && target.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Save Product (Uploads files first, merges with links, then saves record)
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (imageLinks.length === 0 && selectedFilePreviews.length === 0 && !imageUrlInput.trim()) {
      toast.error('Please provide at least 1 product image via link or upload');
      return;
    }

    setIsSavingProduct(true);
    try {
      let uploadedUrls = [];

      // 1. Upload files if any selected
      if (selectedFilePreviews.length > 0) {
        const formData = new FormData();
        selectedFilePreviews.forEach(item => {
          formData.append('images', item.file);
        });

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.urls) {
          uploadedUrls = uploadData.urls;
        }
      }

      // Add direct link if user typed it without clicking "Add"
      const extraLink = imageUrlInput.trim() ? [imageUrlInput.trim()] : [];
      const finalImagesList = [...imageLinks, ...extraLink, ...uploadedUrls];

      // 2. Save product record in database
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProd,
          price: Number(newProd.price),
          originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : null,
          images: finalImagesList
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Product created successfully with images!');
        setShowAddProduct(false);
        // Reset modal form
        setNewProd({
          name: '',
          type: 'Rashid Cotton',
          category: 'Men',
          price: '',
          originalPrice: '',
          fabric: '',
          stock_quantity: 15
        });
        setImageLinks([]);
        setImageUrlInput('');
        setSelectedFilePreviews([]);
        fetchProducts();
        fetchDashboardStats();
      } else {
        toast.error(data.error || 'Failed to create product');
      }
    } catch (err) {
      toast.error('Network error creating product');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Order marked as ${status}`);
        fetchOrders();
        fetchDashboardStats();
      }
    } catch (e) {
      toast.error('Error updating status');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Product deleted');
        fetchProducts();
        fetchDashboardStats();
      }
    } catch (e) {
      toast.error('Error deleting product');
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F0] px-4 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-[#D1C7B7] bg-white p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1C3A2B] text-[#C5A880] font-serif text-2xl font-black mb-3 shadow">
              AT
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-[#1C3A2B]">AT BRAND Admin</h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">Management Portal & Business Terminal</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-800 block mb-1.5">Username / Email</label>
              <input
                type="text"
                required
                placeholder="admin or atbrand00@gmail.com"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 focus:border-[#1C3A2B] focus:ring-1 focus:ring-[#1C3A2B] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-800 block mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 focus:border-[#1C3A2B] focus:ring-1 focus:ring-[#1C3A2B] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-xl bg-[#1C3A2B] py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg hover:opacity-95 transition"
            >
              {loggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F6F8] text-slate-900 font-sans">
      {/* Left Navigation Sidebar */}
      <aside className="w-64 border-r border-slate-300 bg-white flex flex-col justify-between hidden md:flex shadow-sm">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 bg-slate-50/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1C3A2B] text-[#C5A880] font-serif font-black text-base shadow">
              AT
            </div>
            <div>
              <span className="font-serif font-black tracking-wider text-[#1C3A2B] text-base block">AT BRAND</span>
              <span className="text-[11px] font-bold text-slate-600 tracking-widest uppercase block">Business Hub</span>
            </div>
          </div>

          {/* User Badge */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#1C3A2B]/15 text-[#1C3A2B] flex items-center justify-center font-black text-sm">
              AT
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">
                {adminUser?.name && !adminUser.name.toLowerCase().includes('shashwat') ? adminUser.name : 'ARSLAN TARIQ'}
              </p>
              <span className="text-[11px] uppercase font-extrabold text-[#1C3A2B] bg-[#1C3A2B]/10 px-2 py-0.5 rounded">ADMIN</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6 text-sm">
            <div>
              <p className="px-3 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">OVERVIEW</p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition ${activeTab === 'dashboard' ? 'bg-[#E0533C] text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
            </div>

            <div>
              <p className="px-3 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">CATALOG</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition ${activeTab === 'products' ? 'bg-[#E0533C] text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Package className="h-4 w-4" />
                  Products ({productsList.length})
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition ${activeTab === 'inventory' ? 'bg-[#E0533C] text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Archive className="h-4 w-4" />
                  Inventory
                </button>
              </div>
            </div>

            <div>
              <p className="px-3 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">COMMERCE</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition ${activeTab === 'orders' ? 'bg-[#E0533C] text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Orders ({ordersList.length})
                </button>
                <button
                  onClick={() => { setActiveTab('stitching'); setIsMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition ${activeTab === 'stitching' ? 'bg-[#E0533C] text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Scissors className="h-4 w-4" />
                  Stitching Requests ({stitchingList.length})
                </button>
                <button
                  onClick={() => { setActiveTab('reviews'); setIsMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 font-bold transition ${activeTab === 'reviews' ? 'bg-[#E0533C] text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Reviews ({reviewsList.length})
                  {reviewsList.filter(r => !r.is_approved).length > 0 && (
                    <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                      {reviewsList.filter(r => !r.is_approved).length} new
                    </span>
                  )}
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1C3A2B] text-[#C5A880] font-serif font-black text-base shadow">
                    AT
                  </div>
                  <div>
                    <span className="font-serif font-black tracking-wider text-[#1C3A2B] text-base block">AT BRAND</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">ARSLAN TARIQ</span>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="p-4 space-y-4 text-sm font-bold">
                <button
                  onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 ${activeTab === 'dashboard' ? 'bg-[#E0533C] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 ${activeTab === 'products' ? 'bg-[#E0533C] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Package className="h-4 w-4" />
                  Products ({productsList.length})
                </button>
                <button
                  onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 ${activeTab === 'orders' ? 'bg-[#E0533C] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Orders ({ordersList.length})
                </button>
                <button
                  onClick={() => { setActiveTab('stitching'); setIsMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 ${activeTab === 'stitching' ? 'bg-[#E0533C] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Scissors className="h-4 w-4" />
                  Stitching ({stitchingList.length})
                </button>
                <button
                  onClick={() => { setActiveTab('reviews'); setIsMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 ${activeTab === 'reviews' ? 'bg-[#E0533C] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Reviews ({reviewsList.length})
                </button>
                <button
                  onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 ${activeTab === 'inventory' ? 'bg-[#E0533C] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <Archive className="h-4 w-4" />
                  Inventory
                </button>
              </nav>
            </div>

            <div className="p-4 border-t border-slate-200">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-300 bg-white px-4 sm:px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              title="Toggle Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-semibold">
              <span className="hidden sm:inline">Home</span>
              <span className="hidden sm:inline">/</span>
              <span className="font-extrabold text-slate-900 capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddProduct(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E0533C] px-3.5 sm:px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-white shadow hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>

        {/* Content Views */}
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div>
              {/* Welcome Message */}
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900">
                  👋 Good morning, {adminUser?.name && !adminUser.name.toLowerCase().includes('shashwat') ? adminUser.name : 'ARSLAN TARIQ'}!
                </h2>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">TOTAL REVENUE</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{formatPKR(stats.totalRevenue)}</p>
                  <span className="text-xs font-bold text-emerald-700 mt-1.5 inline-block">↑ Verified Orders</span>
                </div>

                <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">TOTAL ORDERS</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalOrders}</p>
                  <span className="text-xs font-bold text-emerald-700 mt-1.5 inline-block">Active Pipeline</span>
                </div>

                <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">ACTIVE PRODUCTS</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{stats.activeProducts}</p>
                  <span className="text-xs font-bold text-slate-600 mt-1.5 inline-block">Live Catalog Items</span>
                </div>

                <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">PENDING ORDERS</p>
                    {stats.pendingOrders > 0 && (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-extrabold text-red-700">
                        {stats.pendingOrders} new
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-2">{stats.pendingOrders}</p>
                  <span className="text-xs font-bold text-amber-700 mt-1.5 inline-block">Requires Attention</span>
                </div>
              </div>

              {/* Recent Orders & Inventory Alerts */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Recent Orders Table */}
                <div className="lg:col-span-8 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-extrabold text-slate-900 text-base">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs text-[#E0533C] font-extrabold uppercase tracking-wider hover:underline">View all</button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
                        <tr>
                          <th className="pb-3">ORDER</th>
                          <th className="pb-3">CUSTOMER</th>
                          <th className="pb-3">AMOUNT</th>
                          <th className="pb-3">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {stats.recentOrders && stats.recentOrders.length > 0 ? (
                          stats.recentOrders.map(o => (
                            <tr key={o.id}>
                              <td className="py-3.5 font-bold text-[#E0533C]">{o.order_number}</td>
                              <td className="py-3.5 text-slate-800 font-bold">{o.customer_name}</td>
                              <td className="py-3.5 font-extrabold text-slate-900">{formatPKR(o.total_amount)}</td>
                              <td className="py-3.5">
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                              No customer orders placed yet. Live orders will populate automatically.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Inventory Alerts */}
                <div className="lg:col-span-4 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-extrabold text-slate-900 text-base">Inventory Alerts</h3>
                    <button onClick={() => setActiveTab('inventory')} className="text-xs text-[#E0533C] font-extrabold uppercase tracking-wider hover:underline">Manage</button>
                  </div>

                  <div className="space-y-3.5">
                    {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                      stats.lowStockProducts.map(p => (
                        <div key={p.id} className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-xs font-mono text-slate-500">{p.sku}</p>
                          </div>
                          <span className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-extrabold text-red-700">
                            {p.stock_quantity} left
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-medium text-slate-600 py-6 text-center">
                        All catalog items have healthy stock levels (&gt; 3 units).
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Catalog View */}
          {activeTab === 'products' && (
            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xl">Product Catalog</h3>
                  <p className="text-sm font-semibold text-slate-600">Manage prices, descriptions, and availability</p>
                </div>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="rounded-xl bg-[#E0533C] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow hover:opacity-90"
                >
                  Add Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-300 bg-slate-50 text-slate-600 uppercase text-xs font-extrabold">
                    <tr>
                      <th className="p-3.5">PRODUCT</th>
                      <th className="p-3.5">TYPE</th>
                      <th className="p-3.5">PRICE</th>
                      <th className="p-3.5">STOCK</th>
                      <th className="p-3.5">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {productsList.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://via.placeholder.com/60'}
                            alt={p.name}
                            className="h-12 w-10 rounded-lg object-cover border border-slate-300"
                          />
                          <span>{p.name}</span>
                        </td>
                        <td className="p-3.5 text-slate-700 font-semibold">{p.type}</td>
                        <td className="p-3.5 font-black text-slate-900">{formatPKR(p.price)}</td>
                        <td className="p-3.5">
                          <span className={`rounded-md px-2.5 py-1 text-xs font-black ${p.stock_quantity > 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {p.stock_quantity} in stock
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50"
                            title="Delete Product"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Management View */}
          {activeTab === 'orders' && (
            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-900 text-xl mb-1">Orders Management</h3>
              <p className="text-sm font-semibold text-slate-600 mb-6">Review submitted customer orders, verify payments, and change shipping status.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-300 bg-slate-50 text-slate-600 uppercase text-xs font-extrabold">
                    <tr>
                      <th className="p-3.5">ORDER #</th>
                      <th className="p-3.5">CUSTOMER</th>
                      <th className="p-3.5">PHONE</th>
                      <th className="p-3.5">ADDRESS</th>
                      <th className="p-3.5">AMOUNT</th>
                      <th className="p-3.5">STATUS</th>
                      <th className="p-3.5">UPDATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {ordersList.map(o => (
                      <tr key={o.id}>
                        <td className="p-3.5 font-bold text-[#E0533C]">{o.order_number}</td>
                        <td className="p-3.5 font-bold text-slate-900">{o.customer_name}</td>
                        <td className="p-3.5 font-semibold text-slate-700">{o.phone}</td>
                        <td className="p-3.5 text-slate-700 max-w-xs truncate">{o.address}, {o.city}</td>
                        <td className="p-3.5 font-black text-slate-900">{formatPKR(o.total_amount)}</td>
                        <td className="p-3.5">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="rounded-lg border border-slate-300 bg-white p-1.5 text-xs font-bold text-slate-800"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {ordersList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                          No orders placed yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stitching Requests View */}
          {activeTab === 'stitching' && (
            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-900 text-xl mb-1">Custom Stitching Orders</h3>
              <p className="text-sm font-semibold text-slate-600 mb-6">Review bespoke measurements, style choices, and tailoring details.</p>

              <div className="space-y-4">
                {stitchingList.map(req => (
                  <div key={req.id} className="rounded-xl border border-slate-300 p-5 bg-white shadow-sm">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
                      <div>
                        <span className="font-extrabold text-[#E0533C] text-base">{req.request_number}</span>
                        <p className="font-bold text-slate-900 mt-1">{req.customer_name} ({req.phone})</p>
                        <p className="text-xs font-medium text-slate-600">{req.address}, {req.city}</p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3.5 py-1 font-black text-blue-900 text-xs">
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl mb-3 text-xs">
                      <div><span className="text-slate-500 font-semibold">Collar:</span> <b className="text-slate-900">{req.style_selections?.collar}</b></div>
                      <div><span className="text-slate-500 font-semibold">Sleeves:</span> <b className="text-slate-900">{req.style_selections?.sleeves}</b></div>
                      <div><span className="text-slate-500 font-semibold">Daman:</span> <b className="text-slate-900">{req.style_selections?.daman}</b></div>
                      <div><span className="text-slate-500 font-semibold">Unit:</span> <b className="text-slate-900">{req.unit}</b></div>
                    </div>

                    <div className="text-xs font-medium text-slate-700 bg-slate-100/50 p-3 rounded-lg">
                      <b className="text-slate-900">Measurements:</b> Length: {req.measurements?.kurtaLength}", Chest: {req.measurements?.chest}", Shoulder: {req.measurements?.shoulder}", Sleeves: {req.measurements?.sleeveLength}", Shalwar Length: {req.measurements?.shalwarLength}", Bottom: {req.measurements?.shalwarBottom}"
                    </div>
                  </div>
                ))}

                {stitchingList.length === 0 && (
                  <p className="py-12 text-center text-slate-500 font-medium">No custom stitching requests submitted yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Reviews Management View */}
          {activeTab === 'reviews' && (
            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-slate-200 gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xl">Customer Reviews & Testimonials</h3>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    Approve genuine reviews to feature them on the website homepage marquee.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                    {reviewsList.filter(r => r.is_approved).length} Approved
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">
                    {reviewsList.filter(r => !r.is_approved).length} Pending
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[750px]">
                  <thead className="border-b border-slate-300 bg-slate-50 text-slate-600 uppercase text-xs font-extrabold">
                    <tr>
                      <th className="p-3.5">CUSTOMER</th>
                      <th className="p-3.5">SUIT / PRODUCT</th>
                      <th className="p-3.5">RATING</th>
                      <th className="p-3.5">FEEDBACK COMMENT</th>
                      <th className="p-3.5">STATUS</th>
                      <th className="p-3.5 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {reviewsList.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{r.customer_name}</p>
                          <p className="text-[11px] font-semibold text-slate-500">📍 {r.city || 'Sargodha'}</p>
                        </td>
                        <td className="p-3.5 text-xs font-bold text-slate-700">
                          {r.suit_name || 'Men Suit Fabric'}
                        </td>
                        <td className="p-3.5">
                          <span className="font-extrabold text-amber-500">★ {r.rating}/5</span>
                        </td>
                        <td className="p-3.5 text-xs text-slate-700 max-w-xs leading-relaxed italic">
                          "{r.comment}"
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${r.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {r.is_approved ? 'Approved (Live)' : 'Pending Review'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleReviewApproval(r.id, r.is_approved)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                                r.is_approved
                                  ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {r.is_approved ? 'Unpublish' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 transition"
                              title="Delete Review"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {reviewsList.length === 0 && (
                  <p className="py-12 text-center text-slate-500 font-medium">No reviews submitted yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Inventory View */}
          {activeTab === 'inventory' && (
            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-900 text-xl mb-1">Inventory Management</h3>
              <p className="text-sm font-semibold text-slate-600 mb-6">Manage SKU codes, low stock alerts, and threshold quantities.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-300 bg-slate-50 text-slate-600 uppercase text-xs font-extrabold">
                    <tr>
                      <th className="p-3.5">SKU</th>
                      <th className="p-3.5">PRODUCT</th>
                      <th className="p-3.5">AVAILABLE STOCK</th>
                      <th className="p-3.5">ALERT LEVEL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {productsList.map(p => (
                      <tr key={p.id}>
                        <td className="p-3.5 font-mono font-bold text-slate-700">{p.sku || `AT-${p.id}`}</td>
                        <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                        <td className="p-3.5 font-black text-slate-900">{p.stock_quantity} units</td>
                        <td className="p-3.5">
                          <span className={`rounded-md px-3 py-1 text-xs font-black ${p.stock_quantity > 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {p.stock_quantity > 3 ? 'Adequate' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Advanced Add Product Modal with Multi-Image Support */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl border border-slate-300">
            <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl">Add New Product to Catalog</h3>
                <p className="text-xs font-semibold text-slate-600">Enter fabric specs & upload multiple product images</p>
              </div>
              <button onClick={() => setShowAddProduct(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-bold text-slate-800">
              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-800">Product Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Royal Boski Silk Unstitched Suit"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-800">Department / Section *</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-slate-900 focus:border-[#1C3A2B] focus:outline-none bg-slate-50"
                  >
                    <option value="Men">Men (Menswear)</option>
                    <option value="Women">Women (Pret & Unstitched)</option>
                    <option value="Perfumes">Perfumes (Artisanal Scents)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-800">
                    {newProd.category === 'Perfumes' ? 'Fragrance Type / Note' : 'Fabric / Style Type'} *
                  </label>
                  <select
                    value={newProd.type}
                    onChange={(e) => setNewProd({ ...newProd, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
                  >
                    {(CATEGORY_FABRICS[newProd.category] || CATEGORY_FABRICS.Men).map(fabricOption => (
                      <option key={fabricOption} value={fabricOption}>{fabricOption}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-800">Selling Price (PKR) *</label>
                  <input
                    required
                    type="number"
                    placeholder="3500"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-800">Original / Box Price (PKR)</label>
                  <input
                    type="number"
                    placeholder="4000"
                    value={newProd.originalPrice}
                    onChange={(e) => setNewProd({ ...newProd, originalPrice: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-800">Initial Stock Units</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={newProd.stock_quantity}
                    onChange={(e) => setNewProd({ ...newProd, stock_quantity: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-slate-800">Fabric Description</label>
                <textarea
                  rows={2}
                  placeholder="Fabric specs, season, thread count, cutting..."
                  value={newProd.fabric}
                  onChange={(e) => setNewProd({ ...newProd, fabric: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
                />
              </div>

              {/* MULTIPLE IMAGE SECTION: DRAG & DROP + LINK INPUT */}
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-4">
                <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Product Images (Upload Files or Paste Links)
                </span>

                {/* Option 1: File Picker & Drag-and-drop */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFilesSelect(e.dataTransfer.files);
                    }
                  }}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 text-center transition hover:border-[#1C3A2B] hover:bg-slate-50"
                >
                  <UploadCloud className="mx-auto h-8 w-8 text-[#C5A880] mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or Drag & Drop multiple pictures here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select 1, 2, 3 or more photos. They will preview below and upload on Save.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files) handleFilesSelect(e.target.files);
                    }}
                    className="hidden"
                  />
                </div>

                {/* Option 2: Image URL input */}
                <div className="mt-3 flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      placeholder="Or paste external image URL (https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageLink(); } }}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 focus:border-[#1C3A2B] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageLink}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100"
                  >
                    Add Link
                  </button>
                </div>

                {/* Previews Grid: Shows all added image files and links */}
                {(selectedFilePreviews.length > 0 || imageLinks.length > 0) && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-slate-700 mb-2">
                      Selected Photos ({selectedFilePreviews.length + imageLinks.length}):
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {/* Uploaded File Previews */}
                      {selectedFilePreviews.map((item, idx) => (
                        <div key={`file-${idx}`} className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-slate-300 group shadow-sm">
                          <img src={item.preview} alt={`upload-${idx}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveFilePreview(idx)}
                            className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                            File {idx + 1}
                          </span>
                        </div>
                      ))}

                      {/* External URL Previews */}
                      {imageLinks.map((url, idx) => (
                        <div key={`link-${idx}`} className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-blue-400 group shadow-sm">
                          <img src={url} alt={`link-${idx}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImageLink(idx)}
                            className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-blue-700/80 text-[9px] text-white text-center py-0.5">
                            Link {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="rounded-xl bg-[#E0533C] px-7 py-2.5 font-extrabold uppercase tracking-wider text-white shadow hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSavingProduct ? 'Uploading & Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
