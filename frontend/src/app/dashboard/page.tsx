'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PitchCard } from '@/components/pitches/PitchCard';
import { ConnectionCard } from '@/components/connections/ConnectionCard';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Pitch {
  id: string;
  title: string;
  summary: string;
  industry: string;
  fundingStage: string;
  location?: string;
  createdAt: string;
  entrepreneur: {
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

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
  pitch?: {
    title: string;
  };
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [recentPitches, setRecentPitches] = useState<Pitch[]>([]);
  const [recentConnections, setRecentConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, router]);

  const fetchDashboardData = async () => {
    try {
      const [pitchesRes, connectionsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches?limit=6`, {
          credentials: 'include',
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/received?limit=5`, {
          credentials: 'include',
        }),
      ]);

      if (pitchesRes.ok) {
        const pitchesData = await pitchesRes.json();
        setRecentPitches(pitchesData.data || []);
      }

      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json();
        setRecentConnections(connectionsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.firstName}!
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {user.role === 'ENTREPRENEUR' 
                  ? 'Manage your pitches and connect with investors'
                  : 'Discover new opportunities and connect with entrepreneurs'
                }
              </p>
            </div>
            <NotificationBell />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.role === 'ENTREPRENEUR' && (
            <Link
              href="/pitches/create"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-6 flex items-center justify-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="font-medium">Create Pitch</span>
            </Link>
          )}
          
          <Link
            href="/pitches"
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center space-x-2 transition-colors"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              {user.role === 'ENTREPRENEUR' ? 'Browse Pitches' : 'Find Opportunities'}
            </span>
          </Link>

          <Link
            href="/connections"
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center space-x-2 transition-colors"
          >
            <span className="font-medium text-gray-900">Connections</span>
          </Link>

          <Link
            href="/chat"
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center space-x-2 transition-colors"
          >
            <span className="font-medium text-gray-900">Messages</span>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Pitches */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {user.role === 'ENTREPRENEUR' ? 'Your Recent Pitches' : 'Recent Opportunities'}
              </h2>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentPitches.length > 0 ? (
                <div className="space-y-4">
                  {recentPitches.slice(0, 3).map((pitch) => (
                    <div key={pitch.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <h3 className="font-medium text-gray-900 hover:text-indigo-600">
                        <Link href={`/pitches/${pitch.id}`}>
                          {pitch.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {pitch.summary}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {pitch.industry} • {pitch.fundingStage}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(pitch.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {user.role === 'ENTREPRENEUR' 
                    ? 'No pitches yet. Create your first pitch to get started!'
                    : 'No recent pitches available.'
                  }
                </p>
              )}
              
              <div className="mt-6">
                <Link
                  href="/pitches"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  View all pitches →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Connections */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Connections</h2>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentConnections.length > 0 ? (
                <div className="space-y-4">
                  {recentConnections.slice(0, 3).map((connection) => (
                    <div key={connection.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {connection.requester.firstName} {connection.requester.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {connection.requester.role} • {connection.pitch?.title}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          connection.status === 'PENDING' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : connection.status === 'ACCEPTED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {connection.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(connection.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No recent connections.
                </p>
              )}
              
              <div className="mt-6">
                <Link
                  href="/connections"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  View all connections →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
