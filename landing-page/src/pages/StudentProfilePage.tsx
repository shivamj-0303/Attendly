import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  rollNumber: string;
  registrationNumber?: string;
  profilePhotoUrl?: string;
  phoneVerified: boolean;
  firstLogin: boolean;
  classId: number;
  departmentId: number;
}

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<StudentProfile>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      // Get current user profile - adjust endpoint as needed
      const response = await api.get('/student/profile');
      setProfile(response.data);
      setEditedProfile(response.data);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      alert(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Only JPG and PNG images are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must not exceed 5MB');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async () => {
    if (!photoFile) return;

    try {
      const formData = new FormData();
      formData.append('file', photoFile);

      const response = await api.post('/student/upload-profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile((prev) => prev ? { ...prev, profilePhotoUrl: response.data.photoUrl } : null);
      setPhotoFile(null);
      setPhotoPreview(null);
      alert('Profile photo updated successfully!');
    } catch (error: any) {
      console.error('Failed to upload photo:', error);
      alert(error.response?.data?.message || 'Failed to upload photo');
    }
  };

  const deletePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;

    try {
      await api.delete('/student/delete-profile-photo');
      setProfile((prev) => prev ? { ...prev, profilePhotoUrl: undefined } : null);
      alert('Profile photo removed successfully!');
    } catch (error: any) {
      console.error('Failed to delete photo:', error);
      alert(error.response?.data?.message || 'Failed to delete photo');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Upload photo if selected
      if (photoFile) {
        await uploadPhoto();
      }

      // Update profile (limited fields for students)
      // Students can only update phone number and similar non-critical fields
      // Admin updates are handled via admin panel
      const updateData = {
        phone: editedProfile.phone,
      };

      await api.put(`/student/profile`, updateData);
      await fetchProfile();
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Failed to load profile</p>
      </div>
    );
  }

  const displayPhotoUrl = photoPreview || profile.profilePhotoUrl;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-green-600 hover:text-green-700 font-medium mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your profile information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Photo Section */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8">
            <div className="flex flex-col items-center">
              {displayPhotoUrl ? (
                <img
                  src={displayPhotoUrl}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-green-700 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <h2 className="mt-4 text-2xl font-bold text-white">{profile.name}</h2>
              <p className="text-green-100">{profile.email}</p>

              {isEditing && (
                <div className="mt-4 space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-white
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-white file:text-green-700
                      hover:file:bg-green-50"
                  />
                  {profile.profilePhotoUrl && (
                    <button
                      onClick={deletePhoto}
                      className="text-sm text-red-200 hover:text-white underline"
                    >
                      Remove current photo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="px-6 py-6 space-y-6">
            {/* View Mode */}
            {!isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Student ID</label>
                    <p className="mt-1 text-lg text-gray-900">{profile.id}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Roll Number</label>
                    <p className="mt-1 text-lg text-gray-900">{profile.rollNumber}</p>
                  </div>

                  {profile.registrationNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Registration Number
                      </label>
                      <p className="mt-1 text-lg text-gray-900">{profile.registrationNumber}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-lg text-gray-900">{profile.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Phone Verified
                    </label>
                    <p className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.phoneVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {profile.phoneVerified ? '✓ Verified' : '⚠ Not Verified'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => navigate('/student/dashboard')}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, phone: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>ℹ️ Note:</strong> Some fields like name, email, and roll number can
                      only be updated by your administrator.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProfile(profile);
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    disabled={isSaving}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-6 bg-white shadow rounded-lg px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
          <button
            onClick={() => navigate('/password-reset')}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium text-left flex items-center justify-between"
          >
            <span>🔐 Change Password</span>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
