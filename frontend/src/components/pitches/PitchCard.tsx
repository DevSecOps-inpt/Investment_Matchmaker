'use client';

import Link from 'next/link';
import { MapPinIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface PitchCardProps {
  pitch: {
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
  };
  showActions?: boolean;
}

export function PitchCard({ pitch, showActions = false }: PitchCardProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/pitches/${pitch.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer">
                {pitch.title}
              </h3>
            </Link>
            
            <p className="text-gray-600 mt-2 line-clamp-3">
              {pitch.summary}
            </p>

            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {pitch.industry}
              </span>
              
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {pitch.fundingStage}
              </span>

              {pitch.fundingGoal && (
                <span className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  {formatCurrency(pitch.fundingGoal)}
                </span>
              )}

              {pitch.location && (
                <span className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {pitch.location}
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 ml-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                {pitch.entrepreneur.user.avatar ? (
                  <img
                    src={pitch.entrepreneur.user.avatar}
                    alt={`${pitch.entrepreneur.user.firstName} ${pitch.entrepreneur.user.lastName}`}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {pitch.entrepreneur.user.firstName[0]}{pitch.entrepreneur.user.lastName[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {formatDate(pitch.createdAt)}
          </div>

          <div className="text-sm text-gray-600">
            by {pitch.entrepreneur.user.firstName} {pitch.entrepreneur.user.lastName}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
            <Link
              href={`/pitches/${pitch.id}`}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              View Details
            </Link>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Connect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
