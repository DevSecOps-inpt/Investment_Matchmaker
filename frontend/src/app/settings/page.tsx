'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { UserCircleIcon, CogIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const entrepreneurProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  foundedYear: z.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Invalid year'),
  teamSize: z.number().min(1, 'Team size must be at least 1'),
  previousExperience: z.string().optional(),
  achievements: z.string().optional(),
});

const investorProfileSchema = z.object({
  investmentFocus: z.string().min(1, 'Investment focus is required'),
  ticketSize: z.string().min(1, 'Ticket size is required'),
  portfolioSize: z.number().min(0, 'Portfolio size must be non-negative'),
  investmentStage: z.string().min(1, 'Investment stage is required'),
  sectors: z.string().min(1, 'Sectors are required'),
  geographicFocus: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type EntrepreneurProfileData = z.infer<typeof entrepreneurProfileSchema>;
type InvestorProfileData = z.infer<typeof investorProfileSchema>;

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

const INVESTMENT_STAGES = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D+',
  'Growth',
  'Bridge'
];

export default function SettingsPage() {
  const { user, isAuthenticated, refreshUser } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'role-profile'>('profile');

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const entrepreneurForm = useForm<EntrepreneurProfileData>({
    resolver: zodResolver(entrepreneurProfileSchema),
  });

  const investorForm = useForm<InvestorProfileData>({
    resolver: zodResolver(investorProfileSchema),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      // Populate profile form
      profileForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        linkedinUrl: user.linkedinUrl || '',
        website: user.website || '',
      });

      // Populate role-specific forms
      if (user.role === 'ENTREPRENEUR' && user.entrepreneur) {
        entrepreneurForm.reset({
          companyName: user.entrepreneur.companyName,
          industry: user.entrepreneur.industry,
          foundedYear: user.entrepreneur.foundedYear,
          teamSize: user.entrepreneur.teamSize,
          previousExperience: user.entrepreneur.previousExperience || '',
          achievements: user.entrepreneur.achievements || '',
        });
      } else if (user.role === 'INVESTOR' && user.investor) {
        investorForm.reset({
          investmentFocus: user.investor.investmentFocus,
          ticketSize: user.investor.ticketSize,
          portfolioSize: user.investor.portfolioSize,
          investmentStage: user.investor.investmentStage,
          sectors: user.investor.sectors,
          geographicFocus: user.investor.geographicFocus || '',
        });
      }
    }
  }, [isAuthenticated, user, router, profileForm, entrepreneurForm, investorForm]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        await refreshUser();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error updating profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEntrepreneurSubmit = async (data: EntrepreneurProfileData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/entrepreneur-profile`, {
        method: user?.entrepreneur ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Entrepreneur profile updated successfully');
        await refreshUser();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error updating entrepreneur profile');
      }
    } catch (error) {
      toast.error('Error updating entrepreneur profile');
      console.error('Error updating entrepreneur profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvestorSubmit = async (data: InvestorProfileData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/investor-profile`, {
        method: user?.investor ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Investor profile updated successfully');
        await refreshUser();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error updating investor profile');
      }
    } catch (error) {
      toast.error('Error updating investor profile');
      console.error('Error updating investor profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your account and profile information
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserCircleIcon className="w-5 h-5 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('role-profile')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'role-profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CogIcon className="w-5 h-5 inline mr-2" />
                {user.role === 'ENTREPRENEUR' ? 'Entrepreneur' : 'Investor'} Profile
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      {...profileForm.register('firstName')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {profileForm.formState.errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      {...profileForm.register('lastName')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {profileForm.formState.errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...profileForm.register('email')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      {...profileForm.register('phone')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      {...profileForm.register('location')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="City, State, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      {...profileForm.register('linkedinUrl')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    {profileForm.formState.errors.linkedinUrl && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileForm.formState.errors.linkedinUrl.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...profileForm.register('bio')}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'role-profile' && user.role === 'ENTREPRENEUR' && (
              <form onSubmit={entrepreneurForm.handleSubmit(onEntrepreneurSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      {...entrepreneurForm.register('companyName')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {entrepreneurForm.formState.errors.companyName && (
                      <p className="mt-1 text-sm text-red-600">
                        {entrepreneurForm.formState.errors.companyName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <select
                      {...entrepreneurForm.register('industry')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Industry</option>
                      {INDUSTRIES.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                    {entrepreneurForm.formState.errors.industry && (
                      <p className="mt-1 text-sm text-red-600">
                        {entrepreneurForm.formState.errors.industry.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Founded Year *
                    </label>
                    <input
                      type="number"
                      {...entrepreneurForm.register('foundedYear', { valueAsNumber: true })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                    {entrepreneurForm.formState.errors.foundedYear && (
                      <p className="mt-1 text-sm text-red-600">
                        {entrepreneurForm.formState.errors.foundedYear.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Size *
                    </label>
                    <input
                      type="number"
                      {...entrepreneurForm.register('teamSize', { valueAsNumber: true })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min="1"
                    />
                    {entrepreneurForm.formState.errors.teamSize && (
                      <p className="mt-1 text-sm text-red-600">
                        {entrepreneurForm.formState.errors.teamSize.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Experience
                  </label>
                  <textarea
                    {...entrepreneurForm.register('previousExperience')}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your previous entrepreneurial or relevant experience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Achievements
                  </label>
                  <textarea
                    {...entrepreneurForm.register('achievements')}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="List your key achievements, awards, or milestones..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Entrepreneur Profile'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'role-profile' && user.role === 'INVESTOR' && (
              <form onSubmit={investorForm.handleSubmit(onInvestorSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Focus *
                    </label>
                    <input
                      type="text"
                      {...investorForm.register('investmentFocus')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Early-stage tech startups"
                    />
                    {investorForm.formState.errors.investmentFocus && (
                      <p className="mt-1 text-sm text-red-600">
                        {investorForm.formState.errors.investmentFocus.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ticket Size *
                    </label>
                    <input
                      type="text"
                      {...investorForm.register('ticketSize')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., $50K - $500K"
                    />
                    {investorForm.formState.errors.ticketSize && (
                      <p className="mt-1 text-sm text-red-600">
                        {investorForm.formState.errors.ticketSize.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio Size *
                    </label>
                    <input
                      type="number"
                      {...investorForm.register('portfolioSize', { valueAsNumber: true })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                    />
                    {investorForm.formState.errors.portfolioSize && (
                      <p className="mt-1 text-sm text-red-600">
                        {investorForm.formState.errors.portfolioSize.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Stage *
                    </label>
                    <select
                      {...investorForm.register('investmentStage')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Stage</option>
                      {INVESTMENT_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                    {investorForm.formState.errors.investmentStage && (
                      <p className="mt-1 text-sm text-red-600">
                        {investorForm.formState.errors.investmentStage.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sectors *
                  </label>
                  <input
                    type="text"
                    {...investorForm.register('sectors')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Technology, Healthcare, Fintech"
                  />
                  {investorForm.formState.errors.sectors && (
                    <p className="mt-1 text-sm text-red-600">
                      {investorForm.formState.errors.sectors.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Geographic Focus
                  </label>
                  <input
                    type="text"
                    {...investorForm.register('geographicFocus')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., North America, Europe, Global"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Investor Profile'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
