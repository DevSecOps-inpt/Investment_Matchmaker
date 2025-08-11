'use client';

import { useState } from 'react';
import { CheckIcon, XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ConnectionCardProps {
  connection: {
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
  };
  onUpdate?: (connectionId: string, newStatus: string) => void;
}

export function ConnectionCard({ connection, onUpdate }: ConnectionCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: 'ACCEPTED' | 'REJECTED') => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/${connection.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Connection ${status.toLowerCase()}`);
        onUpdate?.(connection.id, status);
      } else {
        throw new Error('Failed to update connection');
      }
    } catch (error) {
      toast.error('Error updating connection');
      console.error('Error updating connection:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              {connection.requester.avatar ? (
                <img
                  src={connection.requester.avatar}
                  alt={`${connection.requester.firstName} ${connection.requester.lastName}`}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {connection.requester.firstName[0]}{connection.requester.lastName[0]}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {connection.requester.firstName} {connection.requester.lastName}
            </h3>
            <p className="text-sm text-gray-600">
              {connection.requester.role}
            </p>
            
            {connection.pitch && (
              <p className="text-sm text-gray-500 mt-1">
                Interested in: <span className="font-medium">{connection.pitch.title}</span>
              </p>
            )}

            {connection.message && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{connection.message}</p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-3">
              {formatDate(connection.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(connection.status)}`}>
            {connection.status}
          </span>
        </div>
      </div>

      {connection.status === 'PENDING' && (
        <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleStatusUpdate('REJECTED')}
            disabled={isUpdating}
            className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Decline
          </button>
          <button
            onClick={() => handleStatusUpdate('ACCEPTED')}
            disabled={isUpdating}
            className="flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors disabled:opacity-50"
          >
            <CheckIcon className="h-4 w-4 mr-1" />
            Accept
          </button>
        </div>
      )}

      {connection.status === 'ACCEPTED' && (
        <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-md transition-colors">
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
            Message
          </button>
        </div>
      )}
    </div>
  );
}
