'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  variantName?: string | null;
  status: string;
  product: {
    name: string;
    imageUrl: string | null;
  };
  vendor: {
    name: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function MyOrders() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/customer/orders');
        setOrders(res.data.orders);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="mr-4 text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Artiston2005</h1>
          </div>
          <nav className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Hi, {user?.name}</span>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <Package className="h-8 w-8 mr-3 text-blue-600" />
            My Orders
          </h2>
          <Link href="/">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders on the marketplace yet.</p>
            <Link href="/">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Placed</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total</p>
                      <p className="text-sm font-medium text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 sm:text-right">
                    <p className="text-xs uppercase tracking-wider font-semibold mb-1">Order ID</p>
                    <p className="font-mono">{order.id}</p>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover object-center" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-base font-medium text-gray-900">
                          {item.product.name}
                          {item.variantName && <span className="text-gray-500 font-normal ml-2">({item.variantName})</span>}
                        </h4>
                        <p className="text-sm text-gray-500 mb-2">Sold by: {item.vendor.name}</p>
                        <div className="flex items-center text-sm font-medium text-gray-900 mt-2">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 mr-4">Qty: {item.quantity}</span>
                          <span className="mr-4">₹{item.price.toFixed(2)} each</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.status || 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
