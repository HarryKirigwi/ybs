import React, { useState } from 'react';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  FileText,
  Download,
  Search,
  Filter,
  X
} from 'lucide-react';
import { useInstructorApplications } from '../../hooks/useInstructorApplications';

/**
 * Instructor Approval Component
 * Allows admins to review and approve/reject instructor applications
 */
const InstructorApproval = () => {
  const {
    filteredApplications,
    loading,
    error,
    selectedApplication,
    showApplicationModal,
    stats,
    filters,
    viewApplication,
    closeApplicationModal,
    approveApplication,
    rejectApplication,
    updateFilters,
    clearFilters,
    getStatusColor,
    formatDate
  } = useInstructorApplications();

  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'

  // Handle approve/reject action
  const handleAction = (type, application) => {
    setActionType(type);
    setSelectedApplication(application);
    setReviewNotes(application.reviewNotes || '');
    setShowReviewModal(true);
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!selectedApplication) return;

    try {
      const result = actionType === 'approve' 
        ? await approveApplication(selectedApplication.id, reviewNotes)
        : await rejectApplication(selectedApplication.id, reviewNotes);

      if (result.success) {
        setShowReviewModal(false);
        setReviewNotes('');
        setActionType('');
        setSelectedApplication(null);
      }
    } catch (error) {
      // console.error('Error submitting review:', error);
    }
  };

  // Close review modal
  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewNotes('');
    setActionType('');
    setSelectedApplication(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Instructor Applications</h2>
          <p className="text-gray-600">Review and manage instructor applications</p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="sm:w-48">
            <select
              value={filters.department}
              onChange={(e) => updateFilters({ department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Web Development">Web Development</option>
              <option value="UX/UI Design">UX/UI Design</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {application.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.department}</div>
                    <div className="text-sm text-gray-500">{application.university}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.teaching_experience_years}</div>
                    <div className="text-sm text-gray-500">{application.education}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.application_status)}`}>
                      {application.application_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(application.submission_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewApplication(application)}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {application.application_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction('approve', application)}
                            className="text-green-600 hover:text-green-900 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction('reject', application)}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.searchTerm || filters.status !== 'all' || filters.department !== 'all'
                ? 'Try adjusting your filters'
                : 'No instructor applications have been submitted yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Application Details</h3>
              <button
                onClick={closeApplicationModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Basic Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900">{selectedApplication.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-sm text-gray-900">{selectedApplication.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Professional Title</label>
                    <p className="text-sm text-gray-900">{selectedApplication.professional_title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <p className="text-sm text-gray-900">{selectedApplication.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">University</label>
                    <p className="text-sm text-gray-900">{selectedApplication.university}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience</label>
                    <p className="text-sm text-gray-900">{selectedApplication.teaching_experience_years}</p>
                  </div>
                </div>
              </div>

              {/* Education & Professional Background */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Education & Professional Background</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Education</label>
                    <p className="text-sm text-gray-900">{selectedApplication.education}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Industry</label>
                    <p className="text-sm text-gray-900">{selectedApplication.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Skills</label>
                    <p className="text-sm text-gray-900">{selectedApplication.skills}</p>
                  </div>
                </div>
              </div>

              {/* Teaching Experience */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Teaching Experience</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teaching Experience Years</label>
                    <p className="text-sm text-gray-900">{selectedApplication.teaching_experience_years}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Students Taught Count</label>
                    <p className="text-sm text-gray-900">{selectedApplication.students_taught_count}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Previous Teaching Experience</label>
                    <p className="text-sm text-gray-900">{selectedApplication.previous_teaching_experience}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teaching Platforms</label>
                    <p className="text-sm text-gray-900">{selectedApplication.teaching_platforms}</p>
                  </div>
                </div>
              </div>

              {/* Course Proposal */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Course Proposal</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Proposed Course</label>
                    <p className="text-sm text-gray-900">{selectedApplication.course_proposal}</p>
                  </div>
                </div>
              </div>

              {/* Bio & Motivation */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Bio & Motivation</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bio</label>
                    <p className="text-sm text-gray-900">{selectedApplication.bio}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Motivation</label>
                    <p className="text-sm text-gray-900">{selectedApplication.motivation}</p>
                  </div>
                </div>
              </div>

              {/* Proposed Courses */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Proposed Courses</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedApplication.proposedCourses.map((course, index) => (
                    <li key={index} className="text-sm text-gray-900">{course}</li>
                  ))}
                </ul>
              </div>

              {/* References */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">References</h4>
                <div className="space-y-2">
                  {selectedApplication.references.map((reference, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-3">
                      <p className="text-sm font-medium text-gray-900">{reference.name}</p>
                      <p className="text-sm text-gray-600">{reference.email}</p>
                      <p className="text-sm text-gray-500">{reference.relationship}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Documents</h4>
                <div className="space-y-2">
                  {selectedApplication.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{doc.name}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Information */}
                              {selectedApplication.application_status !== 'pending' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Review Information</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reviewer</label>
                      <p className="text-sm text-gray-900">{selectedApplication.reviewer}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Review Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedApplication.reviewDate)}</p>
                    </div>
                    {selectedApplication.reviewNotes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Review Notes</label>
                        <p className="text-sm text-gray-900">{selectedApplication.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
                            {selectedApplication.application_status === 'pending' && (
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => handleAction('reject', selectedApplication)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction('approve', selectedApplication)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {actionType === 'approve' ? 'Approve' : 'Reject'} Application
              </h3>
              <button
                onClick={closeReviewModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about your decision..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={closeReviewModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className={`px-4 py-2 text-white rounded-lg transition-colors cursor-pointer ${
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorApproval; 