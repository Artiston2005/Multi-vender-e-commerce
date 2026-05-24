'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, X, Plus, Minus, Trash2, Search, Filter } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  store: {
    name: string;
  };
  variants?: {
    id: string;
    name: string;
    stock: number;
  }[];
  reviews?: { rating: number }[];
}

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { 
    items, addToCart, removeFromCart, updateQuantity, 
    clearCart, totalItems, totalPrice, isCartOpen, setIsCartOpen 
  } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: string }>({});

  // Filter & Search state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/public/products/categories');
        setCategories(res.data.categories);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCategory) params.append('category', selectedCategory);
        if (sortBy) params.append('sortBy', sortBy);

        const res = await api.get(`/public/products?${params.toString()}`);
        setProducts(res.data.products);
      } catch (err) {
        console.error('Failed to fetch public products', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce for search
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedCategory, sortBy]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert("Please log in to checkout.");
      return;
    }
    
    setCheckingOut(true);
    try {
      const payload = {
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity
        }))
      };
      
      const res = await api.post('/customer/checkout', payload);
      alert(res.data.message || 'Order placed successfully!');
      clearCart();
      setIsCartOpen(false);
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      const errorMessage = Array.isArray(errorData) ? errorData[0].message : (errorData || 'Checkout failed');
      alert(errorMessage);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Artiston2005</h1>
          <nav className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
            
            {isAuthenticated ? (
              <>
                <Link href="/orders">
                  <Button variant="ghost" className="text-sm">My Orders</Button>
                </Link>
                {user?.role === 'VENDOR' && (
                  <Link href="/vendor">
                    <Button variant="outline" className="text-sm">Vendor Dashboard</Button>
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="outline" className="text-sm">Admin Dashboard</Button>
                  </Link>
                )}
                <Button onClick={logout} variant="ghost" className="text-sm">Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button className="text-sm">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-md w-full flex bg-white shadow-xl flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                  <ShoppingCart className="h-16 w-16 text-gray-300" />
                  <p className="text-lg">Your cart is empty.</p>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item, index) => (
                    <li key={`${item.productId}-${item.variantId || 'base'}-${index}`} className="flex py-2">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover object-center" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                        )}
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name} {item.variantName && <span className="text-sm font-normal text-gray-500 ml-1">({item.variantName})</span>}</h3>
                            <p className="ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Sold by {item.storeName}</p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100"><Minus className="h-3 w-3"/></button>
                            <span className="px-2 font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100"><Plus className="h-3 w-3"/></button>
                          </div>
                          <button type="button" onClick={() => removeFromCart(item.productId, item.variantId)} className="font-medium text-red-600 hover:text-red-500 flex items-center">
                            <Trash2 className="h-4 w-4 mr-1"/> Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex justify-between text-lg font-medium text-gray-900 mb-4">
                  <p>Subtotal</p>
                  <p>₹{totalPrice.toFixed(2)}</p>
                </div>
                <p className="text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
                <Button 
                  className="w-full text-lg py-6" 
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? 'Processing...' : 'Checkout'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Welcome to the Marketplace
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Discover amazing products from vendors worldwide.
          </p>
          {!isAuthenticated && (
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Start Shopping</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">Become a Vendor</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-5 w-5" />
              <select 
                className="border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <select 
              className="border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">
            {search || selectedCategory ? 'Search Results' : 'Latest Products'}
          </h3>
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500 text-lg">No products available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 flex flex-col">
                    <Link href={`/products/${product.id}`} className="block relative group flex-1">
                      {product.imageUrl ? (
                        <div className="h-48 w-full bg-cover bg-center group-hover:opacity-90 transition-opacity" style={{ backgroundImage: `url(${product.imageUrl})` }}></div>
                      ) : (
                        <div className="h-48 w-full bg-gray-100 flex items-center justify-center border-b border-gray-100 group-hover:bg-gray-200 transition-colors">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      <div className="p-6 pb-0 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                          <span className="bg-green-100 text-green-800 text-sm font-bold px-2.5 py-1 rounded-full">₹{Number(product.price).toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 flex-1 line-clamp-2">{product.description}</p>
                        
                        {/* Rating Display */}
                        {product.reviews && product.reviews.length > 0 && (
                          <div className="flex items-center mt-1 mb-2">
                            <div className="flex text-yellow-400 text-sm">
                              {'★'.repeat(Math.round(product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length))}
                              {'☆'.repeat(5 - Math.round(product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length))}
                            </div>
                            <span className="text-xs text-gray-500 ml-2">({product.reviews.length})</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-6 pt-0 flex flex-col mt-auto">
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4 mt-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{product.category}</span>
                        <span className="text-sm text-gray-600 font-medium">Sold by {product.store.name}</span>
                      </div>

                    {product.variants && product.variants.length > 0 && (
                      <div className="mb-4">
                        <select
                          className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                          value={selectedVariants[product.id] || ''}
                          onChange={(e) => setSelectedVariants({ ...selectedVariants, [product.id]: e.target.value })}
                        >
                          <option value="" disabled>Select variant</option>
                          {product.variants.map((v) => (
                            <option key={v.id} value={v.id} disabled={v.stock === 0}>
                              {v.name} {v.stock === 0 ? '(Out of Stock)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <Button 
                      className="w-full mt-auto"
                      disabled={product.variants && product.variants.length > 0 && !selectedVariants[product.id]}
                      onClick={() => {
                        let variantId: string | undefined = undefined;
                        let variantName: string | undefined = undefined;
                        if (product.variants && product.variants.length > 0) {
                          variantId = selectedVariants[product.id];
                          const variant = product.variants.find(v => v.id === variantId);
                          variantName = variant?.name;
                        }

                        addToCart({
                          productId: product.id,
                          variantId,
                          variantName,
                          name: product.name,
                          price: product.price,
                          imageUrl: product.imageUrl,
                          storeName: product.store.name
                        });
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
