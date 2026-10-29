import React, { useState, useEffect } from 'react';
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
  Edit
} from 'lucide-react';
import { formatPKR } from '@/lib/whatsapp';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const { adminUser, token, isAuthenticated, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [loadingData, setLoadingData] = useState(false);

  // New Product Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    type: 'Rashid Cotton',
    category: 'Men',
    price: '',
    originalPrice: '',
    fabric: '',
    image_url: '',
    stock_quantity: 15
  });

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
      fetchProducts();
      fetchOrders();
      fetchStitching();
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

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
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
          images: newProd.image_url ? [newProd.image_url] : []
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Product created successfully');
        setShowAddProduct(false);
        fetchProducts();
        fetchDashboardStats();
      } else {
        toast.error(data.error || 'Failed to create product');
      }
    } catch (e) {
      toast.error('Network error creating product');
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

  // If not logged in, show Copper styled Login Screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F0] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#E5E0D5] bg-white p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1C3A2B] text-[#C5A880] font-serif text-lg font-bold mb-2">
              AT
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1C3A2B]">AT BRAND Admin</h1>
            <p className="text-xs text-muted-foreground mt-1">Management Portal & Business Terminal</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1">Username / Email</label>
              <input
                type="text"
                required
                placeholder="admin or atbrand00@gmail.com"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full rounded-xl border border-input p-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full rounded-xl border border-input p-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-xl bg-[#1C3A2B] py-3 text-xs font-bold uppercase tracking-wider text-white shadow hover:opacity-95"
            >
              {loggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#1E293B]">
      {/* Copper Inspired Left Navigation Sidebar */}
      <aside className="w-64 border-r border-[#E2E8F0] bg-white flex flex-col justify-between hidden md:flex">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-[#E2E8F0]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1C3A2B] text-[#C5A880] font-serif font-bold text-sm">
              AT
            </div>
            <div>
              <span className="font-serif font-bold tracking-wider text-[#1C3A2B] text-base block">AT BRAND</span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase block">Business Hub</span>
            </div>
          </div>

          {/* User Badge */}
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#E0533C]/10 text-[#E0533C] flex items-center justify-center font-bold text-xs">
              SH
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E293B]">{adminUser?.name || 'Shashwat'}</p>
              <span className="text-[10px] uppercase font-bold text-[#E0533C] bg-[#E0533C]/10 px-1.5 py-0.5 rounded">ADMIN</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6 text-xs">
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">OVERVIEW</p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 font-medium transition ${activeTab === 'dashboard' ? 'bg-[#E0533C]/10 text-[#E0533C]' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
            </div>

            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">CATALOG</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 font-medium transition ${activeTab === 'products' ? 'bg-[#E0533C]/10 text-[#E0533C]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Package className="h-4 w-4" />
                  Products ({productsList.length})
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 font-medium transition ${activeTab === 'inventory' ? 'bg-[#E0533C]/10 text-[#E0533C]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Archive className="h-4 w-4" />
                  Inventory
                </button>
              </div>
            </div>

            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">COMMERCE</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 font-medium transition ${activeTab === 'orders' ? 'bg-[#E0533C]/10 text-[#E0533C]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Orders ({ordersList.length})
                </button>
                <button
                  onClick={() => setActiveTab('stitching')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 font-medium transition ${activeTab === 'stitching' ? 'bg-[#E0533C]/10 text-[#E0533C]' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Scissors className="h-4 w-4" />
                  Stitching Requests ({stitchingList.length})
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#E2E8F0]">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Home</span>
            <span>/</span>
            <span className="font-semibold text-slate-800 capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddProduct(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E0533C] px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" />
              Quick Add Product
            </button>
          </div>
        </header>

        {/* Content Views */}
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div>
              {/* Welcome Message */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  👋 Good morning, {adminUser?.name || 'Shashwat'}!
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* 4 Copper KPI Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">TOTAL REVENUE</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{formatPKR(stats.totalRevenue)}</p>
                  <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">↑ Verified Orders</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">TOTAL ORDERS</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalOrders}</p>
                  <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">Active Pipeline</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ACTIVE PRODUCTS</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats.activeProducts}</p>
                  <span className="text-[11px] font-semibold text-slate-500 mt-1 inline-block">51 Catalog Items</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PENDING ORDERS</p>
                    {stats.pendingOrders > 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                        {stats.pendingOrders} new
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats.pendingOrders}</p>
                  <span className="text-[11px] text-muted-foreground mt-1 inline-block">Requires Attention</span>
                </div>
              </div>

              {/* Recent Orders & Inventory Alerts */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Recent Orders Table */}
                <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs text-[#E0533C] font-semibold">View all</button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-100 text-slate-400 uppercase">
                        <tr>
                          <th className="pb-3">ORDER</th>
                          <th className="pb-3">CUSTOMER</th>
                          <th className="pb-3">AMOUNT</th>
                          <th className="pb-3">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.recentOrders && stats.recentOrders.length > 0 ? (
                          stats.recentOrders.map(o => (
                            <tr key={o.id}>
                              <td className="py-3 font-semibold text-slate-800">{o.order_number}</td>
                              <td className="py-3 text-slate-600">{o.customer_name}</td>
                              <td className="py-3 font-bold text-slate-800">{formatPKR(o.total_amount)}</td>
                              <td className="py-3">
                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400">
                              No customer orders placed yet. Live orders will populate automatically.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Inventory Alerts */}
                <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">Inventory Alerts</h3>
                    <button onClick={() => setActiveTab('inventory')} className="text-xs text-[#E0533C] font-semibold">Manage</button>
                  </div>

                  <div className="space-y-3">
                    {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                      stats.lowStockProducts.map(p => (
                        <div key={p.id} className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
                          <div>
                            <p className="font-semibold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                          </div>
                          <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                            {p.stock_quantity} left
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground py-4 text-center">
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Product Catalog</h3>
                  <p className="text-xs text-muted-foreground">Manage prices, descriptions, and availability</p>
                </div>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="rounded-xl bg-[#E0533C] px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90"
                >
                  Add Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                    <tr>
                      <th className="p-3">PRODUCT</th>
                      <th className="p-3">TYPE</th>
                      <th className="p-3">PRICE</th>
                      <th className="p-3">STOCK</th>
                      <th className="p-3">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productsList.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-800 flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://via.placeholder.com/60'}
                            alt={p.name}
                            className="h-10 w-8 rounded object-cover border border-slate-200"
                          />
                          <span>{p.name}</span>
                        </td>
                        <td className="p-3 text-slate-600">{p.type}</td>
                        <td className="p-3 font-bold text-slate-900">{formatPKR(p.price)}</td>
                        <td className="p-3">
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${p.stock_quantity > 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {p.stock_quantity} in stock
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-lg mb-2">Orders Management</h3>
              <p className="text-xs text-muted-foreground mb-6">Review submitted customer orders, verify payments, and change shipping status.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                    <tr>
                      <th className="p-3">ORDER #</th>
                      <th className="p-3">CUSTOMER</th>
                      <th className="p-3">PHONE</th>
                      <th className="p-3">ADDRESS</th>
                      <th className="p-3">AMOUNT</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3">UPDATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ordersList.map(o => (
                      <tr key={o.id}>
                        <td className="p-3 font-bold text-[#E0533C]">{o.order_number}</td>
                        <td className="p-3 font-semibold text-slate-800">{o.customer_name}</td>
                        <td className="p-3 text-slate-600">{o.phone}</td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">{o.address}, {o.city}</td>
                        <td className="p-3 font-bold text-slate-900">{formatPKR(o.total_amount)}</td>
                        <td className="p-3">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-800">
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="rounded-lg border border-slate-200 p-1 text-[11px]"
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
                        <td colSpan={7} className="py-8 text-center text-slate-400">
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-lg mb-2">Custom Stitching Orders</h3>
              <p className="text-xs text-muted-foreground mb-6">Review bespoke measurements, style choices, and tailoring details.</p>

              <div className="space-y-4">
                {stitchingList.map(req => (
                  <div key={req.id} className="rounded-xl border border-slate-200 p-4 text-xs">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                      <div>
                        <span className="font-bold text-[#E0533C] text-sm">{req.request_number}</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{req.customer_name} ({req.phone})</p>
                        <p className="text-muted-foreground">{req.address}, {req.city}</p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-800 text-[10px]">
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg mb-2">
                      <div><span className="text-slate-400">Collar:</span> <b>{req.style_selections?.collar}</b></div>
                      <div><span className="text-slate-400">Sleeves:</span> <b>{req.style_selections?.sleeves}</b></div>
                      <div><span className="text-slate-400">Daman:</span> <b>{req.style_selections?.daman}</b></div>
                      <div><span className="text-slate-400">Unit:</span> <b>{req.unit}</b></div>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <b>Measurements:</b> Length: {req.measurements?.kurtaLength}", Chest: {req.measurements?.chest}", Shoulder: {req.measurements?.shoulder}", Sleeves: {req.measurements?.sleeveLength}", Shalwar Length: {req.measurements?.shalwarLength}", Bottom: {req.measurements?.shalwarBottom}"
                    </div>
                  </div>
                ))}

                {stitchingList.length === 0 && (
                  <p className="py-8 text-center text-slate-400">No custom stitching requests submitted yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Inventory View */}
          {activeTab === 'inventory' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-lg mb-2">Inventory Management</h3>
              <p className="text-xs text-muted-foreground mb-6">Manage SKU codes, low stock alerts, and threshold quantities.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">PRODUCT</th>
                      <th className="p-3">AVAILABLE STOCK</th>
                      <th className="p-3">ALERT LEVEL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productsList.map(p => (
                      <tr key={p.id}>
                        <td className="p-3 font-mono font-bold text-slate-600">{p.sku || `AT-${p.id}`}</td>
                        <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                        <td className="p-3 font-bold text-slate-900">{p.stock_quantity} units</td>
                        <td className="p-3">
                          <span className={`rounded px-2.5 py-1 text-[10px] font-bold ${p.stock_quantity > 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
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

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Add New Product to Catalog</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Product Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Royal Boski Silk Unstitched Suit"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Fabric Type</label>
                  <select
                    value={newProd.type}
                    onChange={(e) => setNewProd({ ...newProd, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="Rashid Cotton">Rashid Cotton</option>
                    <option value="Ahmad Cotton">Ahmad Cotton</option>
                    <option value="Wash & Wear">Wash & Wear</option>
                    <option value="Boski">Boski</option>
                    <option value="Khaddar">Khaddar</option>
                    <option value="Lattha">Lattha</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Section</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Perfumes">Perfumes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Price (PKR) *</label>
                  <input
                    required
                    type="number"
                    placeholder="3500"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Original / Box Price (PKR)</label>
                  <input
                    type="number"
                    placeholder="4000"
                    value={newProd.originalPrice}
                    onChange={(e) => setNewProd({ ...newProd, originalPrice: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newProd.image_url}
                  onChange={(e) => setNewProd({ ...newProd, image_url: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Fabric Description</label>
                <textarea
                  rows={2}
                  placeholder="Fabric specs, season, texture..."
                  value={newProd.fabric}
                  onChange={(e) => setNewProd({ ...newProd, fabric: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#E0533C] px-5 py-2 font-bold text-white hover:opacity-90"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
