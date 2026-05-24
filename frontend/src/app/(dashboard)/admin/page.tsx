'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle, XCircle, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  vendor: {
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stores');
      setStores(res.data.stores);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchStores();
    }
  }, [isAuthenticated, user]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/stores/${id}/status`, { status });
      fetchStores();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const pendingStores = stores.filter(s => s.status === 'PENDING');
  const approvedStores = stores.filter(s => s.status === 'APPROVED');
  const rejectedStores = stores.filter(s => s.status === 'REJECTED');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-gray-600"><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Pending Approvals ({pendingStores.length})</h2>
            {pendingStores.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                No pending stores to review!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingStores.map(store => (
                  <div key={store.id} className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{store.name}</h3>
                        <p className="text-sm text-gray-500">By {store.vendor.name}</p>
                        <p className="text-xs text-gray-400">{store.vendor.email}</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Pending</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 flex-1">{store.description}</p>
                    <div className="flex gap-3">
                      <Button onClick={() => handleUpdateStatus(store.id, 'APPROVED')} className="flex-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2"/> Approve
                      </Button>
                      <Button variant="outline" onClick={() => handleUpdateStatus(store.id, 'REJECTED')} className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="h-4 w-4 mr-2"/> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Approved Stores ({approvedStores.length})</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedStores.map(store => (
                    <tr key={store.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{store.vendor.name}</div>
                        <div className="text-sm text-gray-500">{store.vendor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(store.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button onClick={() => handleUpdateStatus(store.id, 'REJECTED')} className="text-red-600 hover:text-red-900">Revoke</button>
                      </td>
                    </tr>
                  ))}
                  {approvedStores.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No approved stores.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {rejectedStores.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2 opacity-50">Rejected Stores ({rejectedStores.length})</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-75">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rejectedStores.map(store => (
                      <tr key={store.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 line-through">{store.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.vendor.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button onClick={() => handleUpdateStatus(store.id, 'APPROVED')} className="text-indigo-600 hover:text-indigo-900">Re-Approve</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
