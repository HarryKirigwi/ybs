import { useState } from "react";
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Video, 
  Download,
  Calendar,
  User,
  BookOpen
} from "lucide-react";

// Import reusable components from instructor dashboard
import {
  Button,
  Card,
  Modal,
  SuccessMessage,
  ErrorMessage,
  FormTextarea
} from '../../instructorDashboard/components/common';

// Import centralized hooks
import { useCoursesData } from '../hooks';

// Mock UI Components (keeping only what's not available in reusable components)
const Badge = ({ children, variant = "default", className = "", ...props }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
    variant === "secondary" ? "bg-gray-100 text-gray-800" :
    variant === "destructive" ? "bg-red-100 text-red-800" :
    variant === "outline" ? "border border-gray-300 bg-white text-gray-700" :
    "bg-blue-100 text-blue-800"
  } ${className}`} {...props}>
    {children}
  </span>
);

const TabsList = ({ children, className = "" }) => (
  <div className={`flex flex-wrap gap-2 mb-4 w-full ${className}`}>
    {children}
  </div>
);

const TabsTrigger = ({ children, value, selectedStatus, setSelectedStatus }) => {
  const isActive = selectedStatus === value;
  
  return (
    <button
      className={`flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all rounded-lg border-2 cursor-pointer ${
        isActive 
          ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105" 
          : "text-gray-600 bg-white border-gray-200 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm hover:transform hover:scale-102"
      }`}
      onClick={() => setSelectedStatus(value)}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ children, value, selectedStatus }) => (
  selectedStatus === value ? <div className="mt-2">{children}</div> : null
);

// Toast notification component
const Toast = ({ toast, onRemove }) => {
  const getToastStyles = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-green-600" />;
      case "error":
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div
      className={`max-w-md p-4 rounded-lg shadow-lg border flex items-start gap-3 transition-all duration-300 transform ${getToastStyles(toast.type)}`}
      style={{ animation: 'slideInRight 0.3s ease-out' }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getToastIcon(toast.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        <p className="text-sm opacity-90 mt-1">{toast.description}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const mockCourses = [
  {
    id: 1,
    title: "Advanced React Patterns",
    instructor: "Anita Wardi",
    description: "Deep dive into advanced React patterns including render props, compound components, and hooks patterns.",
    category: "Programming",
    submissionDate: "2025-07-29",
    lastUpdated: "2025-07-29",
    status: "pending",
    priority: "high",
    contentType: "video",
    estimatedDuration: "6 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop",
    tags: ["React", "JavaScript", "Frontend"]
  },
  {
    id: 2,
    title: "Digital Marketing Fundamentals",
    instructor: "Steven Mokina",
    description: "Complete guide to digital marketing strategies, SEO, social media marketing, and analytics.",
    category: "Marketing",
    submissionDate: "2025-07-20",
    lastUpdated: "2024-05-23",
    status: "pending",
    priority: "medium",
    contentType: "mixed",
    estimatedDuration: "4 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    tags: ["Marketing","Social Media","Analytics"]
  },
  {
    id: 3,
    title: "Data Science with Python",
    instructor: "Chad Were",
    description: "Introduction to data science using Python, pandas, numpy, and machine learning basics.",
    category: "Data Science",
    submissionDate: "2025-07-17",
    lastUpdated: "2025-07-23",
    status: "revision_required",
    priority: "high",
    contentType: "text",
    estimatedDuration: "8 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=225&fit=crop",
    tags: ["Python", "Data Science", "Machine Learning", "Analytics"],
    reviewNotes: "Content needs more practical examples and exercises."
  },
  {
    id: 4,
    title: "UX Design Principles",
    instructor: "Tracey Jepkirui",
    description: "Essential UX design principles, user research methods, and design thinking process.",
    category: "Design",
    submissionDate: "2025-07-25",
    lastUpdated: "2025-07-26",
    status: "approved",
    priority: "medium",
    contentType: "mixed", 
    estimatedDuration: "5 hours",
    thumbnailUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=225&fit=crop",
    tags: ["UX", "Design", "User Research"]
  }
];

const CourseModeration = () => {
  // Use centralized courses data and operations
  const { 
    data: coursesData, 
    loading, 
    error, 
    approveCourse, 
    rejectCourse, 
    refresh 
  } = useCoursesData();

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Extract courses data from centralized service
  const courses = coursesData?.courses || [];

  const showToast = (title, description, type = "success") => {
    const id = Date.now();
    const newToast = { id, title, description, type };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const exportToCSV = () => {
    // Prepare data for CSV export
    const csvData = courses.map(course => ({
      'Course Title': course.title,
      'Instructor': course.instructor,
      'Category': course.category,
      'Status': course.status,
      'Priority': course.priority,
      'Content Type': course.contentType,
      'Duration': course.estimatedDuration,
      'Submission Date': new Date(course.submissionDate).toLocaleDateString(),
      'Last Updated': new Date(course.lastUpdated).toLocaleDateString(),
      'Tags': course.tags.join(', '),
      'Review Notes': course.reviewNotes || 'No notes'
    }));

    // Convert to CSV string
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in values
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/\"/g, '\"\"')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `course-moderation-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast("Export Successful", "Course moderation report has been downloaded", "success");
    } else {
      showToast("Export Failed", "Your browser doesn't support file downloads", "error");
    }
  };

  const filteredCourses = courses.filter(course => 
    selectedStatus === "all" || course.status === selectedStatus
  );

  const handleStatusChange = async (courseId, newStatus, notes) => {
    try {
      if (newStatus === 'approved') {
        await approveCourse(courseId, notes);
      } else if (newStatus === 'rejected') {
        await rejectCourse(courseId, notes);
      }

      const course = courses.find(c => c.id === courseId);
      const statusMessages = {
        approved: "Course approved successfully",
        rejected: "Course rejected",
        revision_required: "Revision requested for course"
      };

      if (newStatus !== "pending" && course) {
        const toastType = newStatus === "rejected" ? "error" : "success";
        showToast("Course Status Updated", `${course.title} - ${statusMessages[newStatus]}`, toastType);
      }

      // Refresh data after status change
      await refresh();
      
      setDialogOpen(false);
      setReviewNotes("");
    } catch (error) {
      showToast(
        'Error', 
        'Failed to update course status. Please try again.', 
        'error'
      );
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", icon: Clock, text: "Pending Review" },
      approved: { variant: "default", icon: Check, text: "Approved" },
      rejected: { variant: "destructive", icon: X, text: "Rejected" },
      revision_required: { variant: "secondary", icon: AlertTriangle, text: "Revision Required" }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { className: "bg-red-100 text-red-800", text: "High Priority" },
      medium: { className: "bg-yellow-100 text-yellow-800", text: "Medium Priority" },
      low: { className: "bg-green-100 text-green-800", text: "Low Priority" }
    };

    const config = priorityConfig[priority];
    return (
      <Badge className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const getContentTypeIcon = (contentType) => {
    const icons = {
      video: Video,
      text: FileText,
      mixed: BookOpen
    };
    const IconComponent = icons[contentType];
    return <IconComponent className="h-4 w-4" />;
  };

  const stats = {
    total: courses.length,
    pending: courses.filter(c => c.status === "pending").length,
    approved: courses.filter(c => c.status === "approved").length,
    rejected: courses.filter(c => c.status === "rejected").length,
    revisionRequired: courses.filter(c => c.status === "revision_required").length
  };

  const openReviewDialog = (course) => {
    setSelectedCourse(course);
    setReviewNotes(course.reviewNotes || "");
    setDialogOpen(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading courses...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading courses</h3>
              <p className="text-sm text-red-600 mt-1">{error.message}</p>
              <button 
                onClick={refresh}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-6 gap-4">
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Course Moderation</h1>
              <p className="text-gray-600 mt-1 text-base">Review and approve course submissions</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="md"
                onClick={exportToCSV}
                icon={<Download className="h-4 w-4" />}
                className="hidden sm:flex"
              >
                Export Report
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToCSV}
                icon={<Download className="h-4 w-4" />}
                className="sm:hidden"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="bg-blue-50 rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Courses</p>
                  <p className="text-xl font-bold text-blue-700">{stats.total}</p>
                </div>
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-yellow-50 rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-700">{stats.pending}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-green-50 rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Approved</p>
                  <p className="text-xl font-bold text-green-700">{stats.approved}</p>
                </div>
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-red-50 rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Rejected</p>
                  <p className="text-xl font-bold text-red-700">{stats.rejected}</p>
                </div>
                <X className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-orange-50 rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Needs Revision</p>
                  <p className="text-xl font-bold text-orange-700">{stats.revisionRequired}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <TabsList>
            <TabsTrigger 
              value="all" 
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            >
              All Courses
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            >
              Pending
            </TabsTrigger>
            <TabsTrigger 
              value="approved" 
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            >
              Approved
            </TabsTrigger>
            <TabsTrigger 
              value="rejected" 
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            >
              Rejected
            </TabsTrigger>
            <TabsTrigger 
              value="revision_required" 
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            >
              Needs Revision
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} selectedStatus={selectedStatus}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCourses.map((course) => (
                <Card key={course.id} hoverable className="w-full overflow-hidden">
                  <div className="relative">
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-28 object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      {getPriorityBadge(course.priority)}
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                        {getContentTypeIcon(course.contentType)}
                        {course.estimatedDuration}
                      </Badge>
                    </div>
                  </div>

                  <div className="pb-3">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-base flex-1 leading-tight font-semibold">{course.title}</h3>
                      {getStatusBadge(course.status)}
                    </div>
                    <p className="text-xs leading-relaxed text-gray-600">{course.description}</p>
                  </div>

                  <div className="pt-0">
                    <div className="space-y-3">
                      {/* Course Submission Metadata */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <h4 className="text-xs font-semibold text-gray-900 mb-2">Course Submission Metadata</h4>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-600" />
                            <span className="text-gray-600">Submitted By:</span>
                          </div>
                          <span className="font-medium text-gray-900 text-xs">{course.instructor}</span>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-600" />
                            <span className="text-gray-600">Submission Date:</span>
                          </div>
                          <span className="font-medium text-gray-900 text-xs">{new Date(course.submissionDate).toLocaleDateString()}</span>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-600" />
                            <span className="text-gray-600">Last Updated:</span>
                          </div>
                          <span className="font-medium text-gray-900 text-xs">{new Date(course.lastUpdated).toLocaleDateString()}</span>
                                                                            
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 text-gray-600" />
                            <span className="text-gray-600">Category:</span>
                          </div>
                          <span className="font-medium text-gray-900 text-xs">{course.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(course.instructor)}`}>
                          {getInitials(course.instructor)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900">{course.instructor}</p>
                          <p className="text-xs text-gray-600">{course.category}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {course.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                        {course.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            +{course.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {course.reviewNotes && (course.status === "rejected" || course.status === "revision_required") && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md mt-2">
                          <p className="text-xs text-yellow-800">
                            <span className="font-medium">Review Notes: </span>
                            {course.reviewNotes}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openReviewDialog(course)}
                          icon={<Eye className="h-3 w-3" />}
                        >
                          Review
                        </Button>

                        {course.status === "pending" && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="success"
                              onClick={() => handleStatusChange(course.id, "approved")}
                              icon={<Check className="h-3 w-3" />}
                            />
                            <Button 
                              size="sm" 
                              variant="danger"
                              onClick={() => handleStatusChange(course.id, "rejected")}
                              icon={<X className="h-3 w-3" />}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredCourses.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-600">
                    {selectedStatus === "all" 
                      ? "No courses have been submitted yet." 
                      : `No courses with status "${selectedStatus}" found.`
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </div>

      {/* Review Dialog */}
      <Modal 
        isOpen={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        title={selectedCourse ? `Review Course: ${selectedCourse.title}` : ''}
        size="2xl"
      >
        {selectedCourse && (
          <div className="space-y-4">
            <img 
              src={selectedCourse.thumbnailUrl} 
              alt={selectedCourse.title}
              className="w-full h-40 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold mb-2">Course Details</h3>
              <p className="text-gray-600">{selectedCourse.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Instructor</p>
                <p className="text-sm text-gray-600">{selectedCourse.instructor}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm text-gray-600">{selectedCourse.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-gray-600">{selectedCourse.estimatedDuration}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Content Type</p>
                <p className="text-sm text-gray-600">{selectedCourse.contentType}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Review Notes</h3>
              <FormTextarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter review notes or feedback..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleStatusChange(selectedCourse.id, "approved", reviewNotes)}
                variant="success"
                icon={<Check className="h-4 w-4" />}
              >
                Approve
              </Button>
              <Button 
                onClick={() => handleStatusChange(selectedCourse.id, "revision_required", reviewNotes)}
                variant="warning"
                icon={<AlertTriangle className="h-4 w-4" />}
              >
                Request Revision
              </Button>
              <Button 
                onClick={() => handleStatusChange(selectedCourse.id, "rejected", reviewNotes)}
                variant="danger"
                icon={<X className="h-4 w-4" />}
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map(toast => (
            <Toast 
              key={toast.id} 
              toast={toast} 
              onRemove={removeToast} 
            />
          ))}
        </div>
      )}

      {/* Add CSS for toast animation */}
      <style jsx="true">{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseModeration; 