'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Store, Package, Plus, LogOut, ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface ProductVariant {
  id?: string;
  name: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  variants: ProductVariant[];
}

export default function VendorDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  const [storeForm, setStoreForm] = useState({ name: '', description: '' });
  const [creatingStore, setCreatingStore] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: '',
  });

  const [variantsForm, setVariantsForm] = useState<ProductVariant[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'VENDOR') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/store');
      setStore(res.data.store);
      setStoreForm({ name: res.data.store.name, description: res.data.store.description || '' });
      setHasStore(true);
      fetchProducts();
      fetchOrders();
    } catch (err: any) {
      if (err.response?.status === 404) {
        setHasStore(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/vendor/products');
      setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/vendor/orders');
      setOrders(res.data.orderItems);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'VENDOR') {
      fetchStoreData();
    }
  }, [isAuthenticated, user]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStore(true);
    try {
      await api.post('/vendor/store', storeForm);
      fetchStoreData();
    } catch (err) {
      console.error('Failed to create store', err);
    } finally {
      setCreatingStore(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: productForm.stock ? parseInt(productForm.stock) : 0,
        variants: variantsForm.map(v => ({ name: v.name, stock: Number(v.stock) }))
      };

      if (editingProduct) {
        await api.put(`/vendor/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/vendor/products', payload);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
      setVariantsForm([]);
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      imageUrl: product.imageUrl || '',
    });
    setVariantsForm(product.variants || []);
    setShowProductForm(true);
    setActiveTab('products');
  };

  const handleAddVariant = () => {
    setVariantsForm([...variantsForm, { name: '', stock: 0 }]);
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...variantsForm];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariantsForm(newVariants);
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...variantsForm];
    newVariants.splice(index, 1);
    setVariantsForm(newVariants);
  };

  const handleUpdateOrderStatus = async (itemId: string, status: string) => {
    try {
      await api.put(`/vendor/orders/${itemId}/status`, { status });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status', err);
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  if (hasStore === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Store className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Create Your Store</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Set up your vendor profile to start selling</p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
            <form className="space-y-6" onSubmit={handleCreateStore}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</label>
                <div className="mt-1">
                  <input required value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <div className="mt-1">
                  <textarea rows={3} value={storeForm.description} onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })} className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={creatingStore}>{creatingStore ? 'Creating...' : 'Create Store'}</Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <Store className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vendor Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">Store: <strong>{store?.name}</strong></span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-600 dark:text-gray-300"><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8">
          <button 
            onClick={() => { setActiveTab('products'); setShowProductForm(false); }}
            className={`py-4 px-1 inline-flex items-center text-sm font-medium border-b-2 transition-colors ${activeTab === 'products' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            <Package className="h-5 w-5 mr-2" /> Products
          </button>
          <button 
            onClick={() => { setActiveTab('orders'); setShowProductForm(false); }}
            className={`py-4 px-1 inline-flex items-center text-sm font-medium border-b-2 transition-colors ${activeTab === 'orders' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            <ShoppingBag className="h-5 w-5 mr-2" /> Orders
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'products' && (
          showProductForm ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <Button variant="ghost" onClick={() => { setShowProductForm(false); setEditingProduct(null); setProductForm({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' }); setVariantsForm([]); }}>Cancel</Button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSaveProduct} className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                      <input required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                      <input required value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <textarea rows={3} required value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹)</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input type="number" step="0.01" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="block w-full pl-7 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base Stock (If no variants)</label>
                      <input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                      <input type="url" value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Product Variants (Sizes, Colors, etc.)</h4>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}><Plus className="h-4 w-4 mr-1"/> Add Variant</Button>
                    </div>
                    
                    {variantsForm.length > 0 ? (
                      <div className="space-y-4">
                        {variantsForm.map((variant, index) => (
                          <div key={index} className="flex gap-4 items-end bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Variant Name (e.g. UK 8, Size L)</label>
                              <input required value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div className="w-32">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                              <input type="number" required min="0" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                            </div>
                            <button type="button" onClick={() => handleRemoveVariant(index)} className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No variants added. The base stock will be used.</p>
                    )}
                  </div>

                  <div className="pt-5 flex justify-end">
                    <Button type="submit">{editingProduct ? 'Update Product' : 'Save Product'}</Button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products Manager</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your catalog, pricing, and variants.</p>
                </div>
                <Button onClick={() => setShowProductForm(true)}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No products</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new product.</p>
                  <div className="mt-6">
                    <Button onClick={() => setShowProductForm(true)}><Plus className="h-4 w-4 mr-2" /> New Product</Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                      {product.imageUrl ? (
                        <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl})` }}></div>
                      ) : (
                        <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-400 dark:text-gray-500">No Image</span>
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-2">{product.name}</h3>
                          <span className="inline-flex bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-bold px-2 py-1 rounded">
                            ₹{Number(product.price).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">{product.description}</p>
                        
                        {product.variants && product.variants.length > 0 ? (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1 font-medium">Variants:</p>
                            <div className="flex flex-wrap gap-1">
                              {product.variants.map(v => (
                                <span key={v.id} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                                  {v.name} ({v.stock})
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <span>Stock: {product.stock}</span>
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{product.category}</span>
                          </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                          <span className="text-xs text-gray-400">{new Date(product.createdAt).toLocaleDateString()}</span>
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>Edit</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fulfill your orders and update shipping statuses.</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">When customers buy your products, they will appear here.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {orders.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.product.imageUrl ? (
                                <img className="h-10 w-10 rounded-md object-cover" src={item.product.imageUrl} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Img</div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</div>
                                {item.variantName && (
                                  <div className="text-sm text-gray-500">Variant: {item.variantName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{item.order.user.name || 'Anonymous'}</div>
                            <div className="text-sm text-gray-500">{item.order.user.email}</div>
                            <div className="text-xs text-gray-400 mt-1">Ordered: {new Date(item.order.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</div>
                            <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={item.status}
                              onChange={(e) => handleUpdateOrderStatus(item.id, e.target.value)}
                              className={`text-sm rounded-full px-3 py-1 font-semibold border-0 ${
                                item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                item.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              } focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer outline-none`}
                            >
                              <option value="PENDING" className="bg-white text-gray-900">Pending</option>
                              <option value="SHIPPED" className="bg-white text-gray-900">Shipped</option>
                              <option value="DELIVERED" className="bg-white text-gray-900">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
