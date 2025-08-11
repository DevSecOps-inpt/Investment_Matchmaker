'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PitchCard } from '@/components/pitches/PitchCard';
import { SearchFilters } from '@/components/pitches/SearchFilters';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Pitch {
  id: string;
  title: string;
  summary: string;
  industry: string;
  fundingStage: string;
  fundingGoal?: number;
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

interface SearchFilters {
  search?: string;
  industry?: string;
  fundingStage?: string;
  location?: string;
  minFunding?: number;
  maxFunding?: number;
}

export default function PitchesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchPitches();
  }, [isAuthenticated, router, filters, currentPage]);

  const fetchPitches = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== '') {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPitches(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching pitches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.role === 'ENTREPRENEUR' ? 'My Pitches' : 'Browse Opportunities'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {user.role === 'ENTREPRENEUR' 
                ? 'Manage your pitch deck and track investor interest'
                : `Discover ${totalCount} investment opportunities`
              }
            </p>
          </div>

          {user.role === 'ENTREPRENEUR' && (
            <Link
              href="/pitches/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Pitch
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        {user.role === 'INVESTOR' && (
          <div className="bg-white shadow rounded-lg p-6">
            <SearchFilters onFiltersChange={handleFiltersChange} />
          </div>
        )}

        {/* Results */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {user.role === 'ENTREPRENEUR' ? 'Your Pitches' : 'Available Opportunities'}
              </h2>
              <span className="text-sm text-gray-500">
                {totalCount} {totalCount === 1 ? 'pitch' : 'pitches'}
              </span>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-48"></div>
                  </div>
                ))}
              </div>
            ) : pitches.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pitches.map((pitch) => (
                    <PitchCard 
                      key={pitch.id} 
                      pitch={pitch} 
                      showActions={user.role === 'INVESTOR'}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">{(currentPage - 1) * 12 + 1}</span>
                          {' '}to{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * 12, totalCount)}
                          </span>
                          {' '}of{' '}
                          <span className="font-medium">{totalCount}</span>
                          {' '}results
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          
                          {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                    page === currentPage
                                      ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <span
                                  key={page}
                                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                          
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {user.role === 'ENTREPRENEUR' ? 'No pitches yet' : 'No pitches found'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user.role === 'ENTREPRENEUR' 
                    ? 'Get started by creating your first pitch.'
                    : 'Try adjusting your search filters.'
                  }
                </p>
                {user.role === 'ENTREPRENEUR' && (
                  <div className="mt-6">
                    <Link
                      href="/pitches/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create your first pitch
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
