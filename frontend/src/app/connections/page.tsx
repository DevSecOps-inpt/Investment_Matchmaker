'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ConnectionCard } from '@/components/connections/ConnectionCard';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface Connection {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  requester: {
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  recipient: {
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  pitch?: {
    title: string;
  };
}

export default function ConnectionsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchConnections();
  }, [isAuthenticated, router, activeTab]);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'received' ? 'received' : 'sent';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/${endpoint}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setConnections(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectionUpdate = (connectionId: string, newStatus: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId ? { ...conn, status: newStatus } : conn
      )
    );
  };

  const getConnectionCounts = () => {
    const received = connections.filter(c => activeTab === 'received').length;
    const sent = connections.filter(c => activeTab === 'sent').length;
    return { received, sent };
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const pendingCount = connections.filter(c => c.status === 'PENDING').length;
  const acceptedCount = connections.filter(c => c.status === 'ACCEPTED').length;
  const rejectedCount = connections.filter(c => c.status === 'REJECTED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your investor and entrepreneur connections
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{pendingCount}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {pendingCount} connection{pendingCount !== 1 ? 's' : ''}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{acceptedCount}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Accepted
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {acceptedCount} connection{acceptedCount !== 1 ? 's' : ''}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{rejectedCount}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Declined
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {rejectedCount} connection{rejectedCount !== 1 ? 's' : ''}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'received'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Received Requests
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'sent'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sent Requests
              </button>
            </nav>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-32"></div>
                  </div>
                ))}
              </div>
            ) : connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map((connection) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    onUpdate={handleConnectionUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No connections yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'received' 
                    ? 'Connection requests from other users will appear here.'
                    : 'Connection requests you send will appear here.'
                  }
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/pitches')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Browse Pitches
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
