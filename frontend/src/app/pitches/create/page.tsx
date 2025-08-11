'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const pitchSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  summary: z.string().min(1, 'Summary is required').max(500, 'Summary must be less than 500 characters'),
  description: z.string().min(1, 'Description is required'),
  industry: z.string().min(1, 'Industry is required'),
  fundingStage: z.string().min(1, 'Funding stage is required'),
  fundingGoal: z.number().min(1, 'Funding goal must be greater than 0'),
  location: z.string().optional(),
  teamSize: z.number().min(1, 'Team size must be at least 1'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'NDA_REQUIRED']),
});

type PitchFormData = z.infer<typeof pitchSchema>;

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Real Estate',
  'Manufacturing',
  'Food & Beverage',
  'Transportation',
  'Energy',
  'Entertainment',
  'Other'
];

const FUNDING_STAGES = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D+',
  'Growth',
  'Bridge'
];

export default function CreatePitchPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PitchFormData>({
    resolver: zodResolver(pitchSchema),
    defaultValues: {
      visibility: 'PUBLIC',
      teamSize: 1,
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'ENTREPRENEUR') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        return data.filename;
      });

      const filenames = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...filenames]);
      toast.success(`${filenames.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Error uploading files');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (filename: string) => {
    setUploadedFiles(prev => prev.filter(f => f !== filename));
  };

  const onSubmit = async (data: PitchFormData) => {
    setIsSubmitting(true);
    try {
      const pitchData = {
        ...data,
        attachments: uploadedFiles,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(pitchData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Pitch created successfully!');
        router.push(`/pitches/${result.id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error creating pitch');
      }
    } catch (error) {
      toast.error('Error creating pitch');
      console.error('Error creating pitch:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user || user.role !== 'ENTREPRENEUR') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Pitch</h1>
            <p className="mt-1 text-sm text-gray-600">
              Share your startup idea with potential investors
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch Title *
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Revolutionary AI-Powered Healthcare Platform"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary *
                </label>
                <textarea
                  {...register('summary')}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Brief overview of your startup (max 500 characters)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {watch('summary')?.length || 0}/500 characters
                </p>
                {errors.summary && (
                  <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  {...register('industry')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Stage *
                </label>
                <select
                  {...register('fundingStage')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Stage</option>
                  {FUNDING_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
                {errors.fundingStage && (
                  <p className="mt-1 text-sm text-red-600">{errors.fundingStage.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Goal ($) *
                </label>
                <input
                  type="number"
                  {...register('fundingGoal', { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="500000"
                />
                {errors.fundingGoal && (
                  <p className="mt-1 text-sm text-red-600">{errors.fundingGoal.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Size *
                </label>
                <input
                  type="number"
                  {...register('teamSize', { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="5"
                />
                {errors.teamSize && (
                  <p className="mt-1 text-sm text-red-600">{errors.teamSize.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  {...register('website')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://yourcompany.com"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                {...register('description')}
                rows={8}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Provide a detailed description of your startup, the problem you're solving, your solution, target market, business model, and traction..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload pitch deck, business plan, or other documents
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="sr-only"
                        disabled={isUploading}
                      />
                      <span className="mt-1 block text-xs text-gray-500">
                        PDF, DOC, PPT, or images up to 10MB each
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                  {uploadedFiles.map((filename) => (
                    <div key={filename} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                      <span className="text-sm text-gray-900">{filename}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(filename)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('visibility')}
                    value="PUBLIC"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    <strong>Public</strong> - Visible to all investors
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('visibility')}
                    value="NDA_REQUIRED"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    <strong>NDA Required</strong> - Investors must sign NDA to view details
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('visibility')}
                    value="PRIVATE"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    <strong>Private</strong> - Only visible to you
                  </span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Pitch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
