/**
 * Centralized Data Service for Admin Dashboard
 * Manages all data with support for both development (mock) and production (API) environments
 */

import apiService from './apiService.js';

// Environment detection
const isDevelopment = import.meta.env.DEV || !import.meta.VITE_APP_API_URL;
const API_BASE_URL = import.meta.VITE_APP_API_URL || 'http://localhost:8000/api';

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export const dashboardData = {
  // Dashboard overview statistics
  stats: {
    totalUsers: 12000,
    activeCourses: 500,
    monthlyRevenue: 500000,
    completionRate: 80,
    pendingActions: {
      courseApproval: 15,
      instructorApproval: 10,
      paymentIssues: 3
    }
  },

  // Recent activities
  recentActivities: [
    {
      id: 1,
      type: 'course_submitted',
      title: 'New Course submitted',
      user: 'Ken simiyu',
      time: '2 hours ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'instructor_approved',
      title: 'Instructor Approved',
      user: 'Levis',
      time: '2 hours ago',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'payment_processed',
      title: 'Payment Processed',
      user: 'Sarah Chen',
      time: '3 hours ago',
      priority: 'low'
    },
    {
      id: 4,
      type: 'user_registered',
      title: 'New User Registration',
      user: 'Mike Johnson',
      time: '4 hours ago',
      priority: 'medium'
    },
    {
      id: 5,
      type: 'course_completed',
      title: 'Course Completion',
      user: 'Emma Wilson',
      time: '5 hours ago',
      priority: 'low'
    }
  ],

  // Analytics data
  analytics: {
    userGrowth: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [1200, 1350, 1500, 1650, 1800, 1950]
    },
    revenue: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [45000, 52000, 48000, 61000, 55000, 67000]
    },
    courseCompletions: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [85, 92, 88, 95, 91, 98]
    }
  }
};

// ============================================================================
// USERS DATA
// ============================================================================

export const usersData = {
  // Mock users list
  users: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      role: 'student',
      status: 'active',
      enrollment: 'enrolled',
      joinDate: '2024-01-15',
      lastLogin: '2024-03-20',
      department: 'Computer Science',
      location: 'New York, NY',
      bio: 'Passionate student learning web development',
      website: 'https://johndoe.dev',
      company: 'Tech University'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 (555) 987-6543',
      role: 'instructor',
      status: 'active',
      enrollment: 'enrolled',
      joinDate: '2024-01-10',
      lastLogin: '2024-03-19',
      department: 'Software Engineering',
      location: 'San Francisco, CA',
      bio: 'Senior instructor with 10+ years of experience',
      website: 'https://janesmith.com',
      company: 'Code Academy'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+1 (555) 456-7890',
      role: 'student',
      status: 'inactive',
      enrollment: 'unenrolled',
      joinDate: '2024-02-01',
      lastLogin: '2024-03-15',
      department: 'Data Science',
      location: 'Chicago, IL',
      bio: 'Data enthusiast exploring machine learning',
      website: '',
      company: 'Data Corp'
    },
    {
      id: 4,
      name: 'Admin User',
      email: 'admin@xist.com',
      phone: '+1 (555) 111-2222',
      role: 'admin',
      status: 'active',
      enrollment: 'enrolled',
      joinDate: '2024-01-01',
      lastLogin: '2024-03-21',
      department: 'System Administration',
      location: 'Austin, TX',
      bio: 'System administrator with full platform access',
      website: 'https://admin.xist.com',
      company: 'XIST LMS'
    },
    {
      id: 5,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+1 (555) 333-4444',
      role: 'instructor',
      status: 'active',
      enrollment: 'enrolled',
      joinDate: '2024-01-20',
      lastLogin: '2024-03-20',
      department: 'Web Development',
      location: 'Seattle, WA',
      bio: 'Full-stack developer and coding instructor',
      website: 'https://sarahwilson.dev',
      company: 'Tech Education Inc'
    },
    {
      id: 6,
      name: 'Mike Chen',
      email: 'mike@example.com',
      phone: '+1 (555) 555-6666',
      role: 'student',
      status: 'active',
      enrollment: 'enrolled',
      joinDate: '2024-02-15',
      lastLogin: '2024-03-21',
      department: 'Computer Science',
      location: 'Boston, MA',
      bio: 'Computer science student focusing on AI',
      website: '',
      company: 'MIT'
    },
    {
      id: 7,
      name: 'Lisa Rodriguez',
      email: 'lisa@example.com',
      phone: '+1 (555) 777-8888',
      role: 'instructor',
      status: 'active',
      enrollment: 'enrolled',
      joinDate: '2024-01-05',
      lastLogin: '2024-03-19',
      department: 'UX/UI Design',
      location: 'Portland, OR',
      bio: 'UX/UI design expert and creative instructor',
      website: 'https://lisarodriguez.design',
      company: 'Design Studio'
    },
    {
      id: 8,
      name: 'David Kim',
      email: 'david@example.com',
      phone: '+1 (555) 999-0000',
      role: 'admin',
      status: 'active',
      enrollment: 'enrolled',
      joinDate: '2024-01-08',
      lastLogin: '2024-03-21',
      department: 'Platform Management',
      location: 'Denver, CO',
      bio: 'Platform manager and system administrator',
      website: 'https://davidkim.tech',
      company: 'XIST LMS'
    }
  ],

  // User categories
  categories: [
    {
      id: 'all',
      label: 'All Users',
      icon: 'Users',
      color: 'blue',
      description: 'View all users in the system'
    },
    {
      id: 'admin',
      label: 'Administrators',
      icon: 'Crown',
      color: 'purple',
      description: 'System administrators and platform managers'
    },
    {
      id: 'instructor',
      label: 'Instructors',
      icon: 'BookOpen',
      color: 'green',
      description: 'Course instructors and educators'
    },
    {
      id: 'student',
      label: 'Students',
      icon: 'GraduationCap',
      color: 'orange',
      description: 'Students and learners'
    }
  ],

  // User roles
  roles: [
    { value: 'admin', label: 'Administrator', color: 'red' },
    { value: 'instructor', label: 'Instructor', color: 'purple' },
    { value: 'student', label: 'Student', color: 'blue' }
  ],

  // User statuses
  statuses: [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'red' },
    { value: 'pending', label: 'Pending', color: 'yellow' }
  ],

  // Enrollment statuses
  enrollments: [
    { value: 'enrolled', label: 'Enrolled', color: 'blue' },
    { value: 'unenrolled', label: 'Unenrolled', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' }
  ]
};

// ============================================================================
// NOTIFICATIONS DATA
// ============================================================================

export const notificationsData = {
  notifications: [
    {
      id: 1,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight at 2 AM',
      timestamp: '2024-01-15T10:30:00Z',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'course',
      title: 'New Course Submission',
      message: 'Course "Advanced React Development" submitted for review',
      timestamp: '2024-01-15T09:15:00Z',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'user',
      title: 'Instructor Application',
      message: 'New instructor application from John Doe',
      timestamp: '2024-01-15T08:45:00Z',
      read: true,
      priority: 'medium'
    },
    {
      id: 4,
      type: 'financial',
      title: 'Payment Issue',
      message: 'Payment processing error for transaction #12345',
      timestamp: '2024-01-15T07:20:00Z',
      read: false,
      priority: 'high'
    },
    {
      id: 5,
      type: 'security',
      title: 'Security Alert',
      message: 'Multiple failed login attempts detected',
      timestamp: '2024-01-15T06:30:00Z',
      read: true,
      priority: 'high'
    },
    {
      id: 6,
      type: 'system',
      title: 'Backup Completed',
      message: 'Daily system backup completed successfully',
      timestamp: '2024-01-15T05:00:00Z',
      read: true,
      priority: 'low'
    },
    {
      id: 7,
      type: 'course',
      title: 'Course Update Required',
      message: 'Course "JavaScript Fundamentals" needs content updates',
      timestamp: '2024-01-15T04:15:00Z',
      read: false,
      priority: 'medium'
    }
  ],

  // Notification types
  types: [
    { value: 'system', label: 'System', color: 'blue' },
    { value: 'course', label: 'Course', color: 'green' },
    { value: 'user', label: 'User', color: 'purple' },
    { value: 'financial', label: 'Financial', color: 'orange' },
    { value: 'security', label: 'Security', color: 'red' }
  ],

  // Priority levels
  priorities: [
    { value: 'high', label: 'High', color: 'red' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'low', label: 'Low', color: 'green' }
  ]
};

// ============================================================================
// COURSES DATA
// ============================================================================

export const coursesData = {
  // Pending courses for moderation
  pendingCourses: [
    {
      id: 1,
      title: 'Advanced React Development',
      instructor: 'Jane Smith',
      category: 'Programming',
      submittedDate: '2024-01-15',
      status: 'pending',
      description: 'Learn advanced React concepts and best practices',
      duration: '8 weeks',
      price: 99.99
    },
    {
      id: 2,
      title: 'UX/UI Design Fundamentals',
      instructor: 'Lisa Rodriguez',
      category: 'Design',
      submittedDate: '2024-01-14',
      status: 'pending',
      description: 'Master the basics of user experience and interface design',
      duration: '6 weeks',
      price: 79.99
    },
    {
      id: 3,
      title: 'Data Science with Python',
      instructor: 'Bob Johnson',
      category: 'Data Science',
      submittedDate: '2024-01-13',
      status: 'pending',
      description: 'Introduction to data science using Python',
      duration: '10 weeks',
      price: 129.99
    }
  ],

  // Course categories
  categories: [
    { value: 'programming', label: 'Programming', color: 'blue' },
    { value: 'design', label: 'Design', color: 'purple' },
    { value: 'data-science', label: 'Data Science', color: 'green' },
    { value: 'business', label: 'Business', color: 'orange' },
    { value: 'marketing', label: 'Marketing', color: 'pink' }
  ],

  // Course statuses
  statuses: [
    { value: 'pending', label: 'Pending Review', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'draft', label: 'Draft', color: 'gray' }
  ]
};

// ============================================================================
// FINANCIAL DATA
// ============================================================================

export const financialData = {
  // Revenue analytics
  revenue: {
    monthly: [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 61000 },
      { month: 'May', revenue: 55000 },
      { month: 'Jun', revenue: 67000 }
    ],
    yearly: [
      { year: '2020', revenue: 480000 },
      { year: '2021', revenue: 520000 },
      { year: '2022', revenue: 580000 },
      { year: '2023', revenue: 650000 },
      { year: '2024', revenue: 720000 }
    ]
  },

  // Payment statistics
  payments: {
    total: 15000,
    successful: 14250,
    failed: 750,
    pending: 500,
    refunded: 200
  },

  // Financial reports
  reports: [
    {
      id: 1,
      title: 'Monthly Revenue Report',
      type: 'revenue',
      period: 'January 2024',
      amount: 67000,
      status: 'completed'
    },
    {
      id: 2,
      title: 'Payment Processing Report',
      type: 'payments',
      period: 'January 2024',
      amount: 15000,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Refund Analysis',
      type: 'refunds',
      period: 'January 2024',
      amount: 200,
      status: 'pending'
    }
  ]
};

// ============================================================================
// ANALYTICS DATA
// ============================================================================

export const analyticsData = {
  // User metrics
  userMetrics: {
    totalUsers: 12000,
    activeUsers: 8500,
    newUsers: 450,
    userGrowth: 12.5,
    userRetention: 78.3,
    userEngagement: 65.2
  },

  // Course metrics
  courseMetrics: {
    totalCourses: 500,
    publishedCourses: 450,
    draftCourses: 50,
    courseCompletion: 380,
    averageRating: 4.6,
    totalEnrollments: 8500
  },

  // Engagement metrics
  engagementMetrics: {
    averageSessionTime: 25.5,
    pageViews: 125000,
    uniqueVisitors: 8500,
    bounceRate: 32.1,
    timeOnSite: 15.2,
    returnVisitors: 4200
  },

  // Performance metrics
  performanceMetrics: {
    courseCompletionRate: 76.2,
    averageGrade: 82.5,
    assignmentSubmission: 95.8,
    quizPassRate: 88.3,
    certificateIssued: 320,
    dropoutRate: 12.4
  },

  // Platform metrics
  platformMetrics: {
    serverUptime: 99.9,
    averageLoadTime: 245,
    mobileUsage: 45.2,
    desktopUsage: 54.8,
    tabletUsage: 8.5,
    errorRate: 0.1,
    peakConcurrentUsers: 1250
  },

  // Device usage data
  deviceUsageData: [
    { device: 'Desktop', percentage: 54.8 },
    { device: 'Mobile', percentage: 45.2 },
    { device: 'Tablet', percentage: 8.5 }
  ],

  // Revenue analytics
  revenueAnalytics: {
    totalRevenue: 1250000,
    monthlyGrowth: 8.5,
    averageOrderValue: 125.50,
    topRevenueSources: [
      { source: 'Course Sales', revenue: 850000, percentage: 68 },
      { source: 'Subscriptions', revenue: 320000, percentage: 25.6 },
      { source: 'Certifications', revenue: 80000, percentage: 6.4 }
    ]
  },

  // Geographic data
  geographicData: [
    { country: 'United States', users: 4500, percentage: 37.5 },
    { country: 'United Kingdom', users: 2800, percentage: 23.3 },
    { country: 'Canada', users: 1800, percentage: 15 },
    { country: 'Australia', users: 1200, percentage: 10 },
    { country: 'Germany', users: 900, percentage: 7.5 },
    { country: 'Others', users: 800, percentage: 6.7 }
  ],

  // Time series data
  timeSeriesData: {
    userGrowth: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [1200, 1350, 1500, 1650, 1800, 1950]
    },
    revenue: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [45000, 52000, 48000, 61000, 55000, 67000]
    },
    courseCompletions: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [85, 92, 88, 95, 91, 98]
    },
    engagement: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [65, 68, 72, 75, 78, 82]
    }
  },

  // User growth data for charts
  userGrowthData: [
    { month: 'Jan', users: 12000, newUsers: 1200, growth: 12.5 },
    { month: 'Feb', users: 13350, newUsers: 1350, growth: 11.3 },
    { month: 'Mar', users: 14850, newUsers: 1500, growth: 11.2 },
    { month: 'Apr', users: 16500, newUsers: 1650, growth: 11.1 },
    { month: 'May', users: 18300, newUsers: 1800, growth: 10.9 },
    { month: 'Jun', users: 20250, newUsers: 1950, growth: 10.7 }
  ],

  // Course performance data for charts
  coursePerformanceData: [
    { course: 'React Fundamentals', enrollments: 1250, completions: 980, rating: 4.8, revenue: 125000 },
    { course: 'Advanced JavaScript', enrollments: 980, completions: 720, rating: 4.6, revenue: 98000 },
    { course: 'Python for Data Science', enrollments: 850, completions: 680, rating: 4.7, revenue: 85000 },
    { course: 'UX/UI Design', enrollments: 720, completions: 540, rating: 4.5, revenue: 72000 },
    { course: 'Node.js Backend', enrollments: 650, completions: 520, rating: 4.4, revenue: 65000 },
    { course: 'Machine Learning', enrollments: 580, completions: 460, rating: 4.9, revenue: 58000 }
  ],

  // Engagement trend data
  engagementTrendData: [
    { month: 'Jan', sessionTime: 22.5, pageViews: 115000, bounceRate: 35.2, returnVisitors: 3800 },
    { month: 'Feb', sessionTime: 24.1, pageViews: 118000, bounceRate: 34.8, returnVisitors: 3950 },
    { month: 'Mar', sessionTime: 25.3, pageViews: 122000, bounceRate: 33.5, returnVisitors: 4100 },
    { month: 'Apr', sessionTime: 26.2, pageViews: 125000, bounceRate: 32.1, returnVisitors: 4200 },
    { month: 'May', sessionTime: 27.1, pageViews: 128000, bounceRate: 31.8, returnVisitors: 4300 },
    { month: 'Jun', sessionTime: 28.5, pageViews: 131000, bounceRate: 30.5, returnVisitors: 4450 }
  ],

  // Learning outcomes data for charts
  learningOutcomesData: {
    labels: ['Excellent (90-100%)', 'Good (80-89%)', 'Satisfactory (70-79%)', 'Needs Improvement (60-69%)', 'Poor (<60%)'],
    datasets: [
      {
        label: 'Student Performance Distribution',
        data: [25, 35, 25, 10, 5],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2
      }
    ]
  },

  // Instructor applications data - aligned with InstructorRegistration.jsx form structure
  instructorApplications: [
    {
      id: 1,
      // Basic Information (matching form fields)
      full_name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      location: 'San Francisco, CA',
      professional_title: 'Senior Data Scientist',
      
      // Professional Background
      education: 'PhD in Computer Science',
      industry: 'Technology',
      skills: 'Machine Learning, Data Science, Python, R, SQL',
      
      // Teaching Experience
      teaching_experience_years: '5+ years',
      students_taught_count: '100+ students',
      previous_teaching_experience: 'Professional Training,University Lecturer',
      teaching_platforms: 'Zoom Training,Coursera,YouTube',
      
      // Course Proposal
      course_proposal: 'Introduction to Machine Learning: From Theory to Practice - A comprehensive course covering fundamental ML concepts, algorithms, and real-world applications using Python.',
      
      // Application metadata
      application_status: 'pending',
      submission_date: '2024-01-15T10:30:00Z',
      progress_percentage: 100,
      
      // Additional fields for admin display (not in form but useful for admin)
      phone: '+1 (555) 123-4567',
      department: 'Computer Science',
      university: 'Stanford University',
      bio: 'Experienced researcher and educator with expertise in machine learning and data science. Published 15+ papers in top-tier conferences.',
      motivation: 'Passionate about making AI education accessible to everyone. Want to create courses that bridge theory and practical applications.',
      proposedCourses: [
        'Introduction to Machine Learning',
        'Advanced Data Science with Python',
        'Deep Learning Fundamentals'
      ],
      references: [
        { name: 'Dr. Michael Chen', email: 'mchen@stanford.edu', relationship: 'PhD Advisor' },
        { name: 'Prof. Lisa Wang', email: 'lwang@mit.edu', relationship: 'Research Collaborator' }
      ],
      documents: [
        { name: 'CV', url: '/documents/sarah-johnson-cv.pdf' },
        { name: 'Research Statement', url: '/documents/sarah-johnson-research.pdf' },
        { name: 'Teaching Portfolio', url: '/documents/sarah-johnson-teaching.pdf' }
      ],
      reviewNotes: '',
      reviewer: null,
      reviewDate: null
    },
    {
      id: 2,
      // Basic Information (matching form fields)
      full_name: 'David Rodriguez',
      email: 'david.rodriguez@example.com',
      location: 'Berkeley, CA',
      professional_title: 'Senior Software Engineer',
      
      // Professional Background
      education: 'MS in Software Engineering',
      industry: 'Technology',
      skills: 'Full-Stack Development, React, Node.js, JavaScript, TypeScript',
      
      // Teaching Experience
      teaching_experience_years: '3-5 years',
      students_taught_count: '51-100 students',
      previous_teaching_experience: 'Professional Training,Corporate Training',
      teaching_platforms: 'Zoom Training,Microsoft Teams',
      
      // Course Proposal
      course_proposal: 'Modern React Development: Building Scalable Web Applications - Learn React fundamentals, hooks, state management, and best practices for building production-ready applications.',
      
      // Application metadata
      application_status: 'approved',
      submission_date: '2024-01-10T14:20:00Z',
      progress_percentage: 100,
      
      // Additional fields for admin display
      phone: '+1 (555) 987-6543',
      department: 'Web Development',
      university: 'University of California, Berkeley',
      bio: 'Senior software engineer with extensive experience in modern web technologies. Led development teams at multiple startups.',
      motivation: 'Want to share practical knowledge gained from building real-world applications. Focus on hands-on, project-based learning.',
      proposedCourses: [
        'Modern React Development',
        'Node.js Backend Development',
        'Full-Stack JavaScript'
      ],
      references: [
        { name: 'Alex Thompson', email: 'alex@techstartup.com', relationship: 'Former Manager' },
        { name: 'Maria Garcia', email: 'mgarcia@berkeley.edu', relationship: 'Academic Advisor' }
      ],
      documents: [
        { name: 'CV', url: '/documents/david-rodriguez-cv.pdf' },
        { name: 'Portfolio', url: '/documents/david-rodriguez-portfolio.pdf' },
        { name: 'Code Samples', url: '/documents/david-rodriguez-code.pdf' }
      ],
      reviewNotes: 'Strong technical background and excellent communication skills. Approved for web development courses.',
      reviewer: 'Admin User',
      reviewDate: '2024-01-12T09:15:00Z'
    },
    {
      id: 3,
      // Basic Information (matching form fields)
      full_name: 'Emily Chen',
      email: 'emily.chen@example.com',
      location: 'New York, NY',
      professional_title: 'UX/UI Designer',
      
      // Professional Background
      education: 'BFA in Design',
      industry: 'Design',
      skills: 'User Experience Design, UI/UX Research, Figma, Adobe Creative Suite',
      
      // Teaching Experience
      teaching_experience_years: '1-2 years',
      students_taught_count: '21-50 students',
      previous_teaching_experience: 'Online Course Creation',
      teaching_platforms: 'YouTube,Google class',
      
      // Course Proposal
      course_proposal: 'UX/UI Design Fundamentals: Creating User-Centered Digital Experiences - Master the principles of user experience design, wireframing, prototyping, and user research.',
      
      // Application metadata
      application_status: 'rejected',
      submission_date: '2024-01-08T16:45:00Z',
      progress_percentage: 100,
      
      // Additional fields for admin display
      phone: '+1 (555) 456-7890',
      department: 'UX/UI Design',
      university: 'Parsons School of Design',
      bio: 'UX/UI designer with experience at major tech companies. Specialized in user research and interface design.',
      motivation: 'Passionate about teaching design thinking and user-centered design principles. Want to help students create impactful digital experiences.',
      proposedCourses: [
        'UX/UI Design Fundamentals',
        'User Research Methods',
        'Design Systems and Prototyping'
      ],
      references: [
        { name: 'James Wilson', email: 'jwilson@designstudio.com', relationship: 'Former Colleague' },
        { name: 'Dr. Sarah Kim', email: 'skim@parsons.edu', relationship: 'Academic Mentor' }
      ],
      documents: [
        { name: 'CV', url: '/documents/emily-chen-cv.pdf' },
        { name: 'Portfolio', url: '/documents/emily-chen-portfolio.pdf' },
        { name: 'Design Case Studies', url: '/documents/emily-chen-cases.pdf' }
      ],
      reviewNotes: 'Portfolio lacks depth in educational content design. Need more experience in creating learning materials.',
      reviewer: 'Admin User',
      reviewDate: '2024-01-11T11:30:00Z'
    }
  ]
};

// ============================================================================
// SETTINGS DATA
// ============================================================================

export const settingsData = {
  // Admin settings
  admin: {
    siteName: 'XIST LMS',
    siteDescription: 'Learning Management System',
    contactEmail: 'admin@xist.com',
    supportPhone: '+1 (555) 123-4567',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  },

  // System configuration
  system: {
    maxFileSize: 10, // MB
    allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    enableTwoFactor: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false
  },

  // Notification settings
  notifications: {
    email: {
      systemAlerts: true,
      courseUpdates: true,
      userActivity: false,
      financialReports: true
    },
    sms: {
      systemAlerts: false,
      courseUpdates: false,
      userActivity: false,
      financialReports: false
    },
    push: {
      systemAlerts: true,
      courseUpdates: true,
      userActivity: true,
      financialReports: false
    }
  }
};

// ============================================================================
// SIDEBAR NAVIGATION DATA
// ============================================================================

export const sidebarData = {
  navigation: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      path: '/admin/dashboard',
      badge: null
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'Users',
      path: '/admin/users',
      badge: null
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: 'BookOpen',
      path: '/admin/courses',
      badge: 15
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'BarChart3',
      path: '/admin/analytics',
      badge: null
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: 'DollarSign',
      path: '/admin/financial',
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      path: '/admin/settings',
      badge: null
    }
  ],

  // User profile data
  userProfile: {
    name: 'Harry King',
    email: 'admin@xist.com',
    role: 'Administrator',
    avatar: null,
    lastLogin: '2024-01-15T10:30:00Z'
  }
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const constants = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  },

  // API Endpoints
  API_ENDPOINTS: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    NOTIFICATIONS: '/admin/notifications',
    COURSES: '/admin/courses',
    ANALYTICS: '/admin/analytics',
    FINANCIAL: '/admin/financial',
    SETTINGS: '/admin/settings',
    AUTH: '/admin/auth'
  },

  // File Types
  FILE_TYPES: {
    IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
    SPREADSHEETS: ['xls', 'xlsx', 'csv'],
    PRESENTATIONS: ['ppt', 'pptx']
  },

  // Validation Rules
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
    PASSWORD_MIN_LENGTH: 8,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
  },

  // Date Formats
  DATE_FORMATS: {
    DISPLAY: 'MMM DD, YYYY',
    INPUT: 'YYYY-MM-DD',
    DATETIME: 'MMM DD, YYYY HH:mm',
    TIME: 'HH:mm'
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const dataUtils = {
  // Get initials from name
  getInitials: (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  },

  // Get user data safely
  getUserData: (user, field, defaultValue = '') => {
    if (!user) return defaultValue;
    return user[field] || defaultValue;
  },

  // Validate email
  isValidEmail: (email) => {
    return constants.VALIDATION.EMAIL_REGEX.test(email);
  },

  // Validate phone
  isValidPhone: (phone) => {
    return constants.VALIDATION.PHONE_REGEX.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  // Validate password
  validatePassword: (password) => {
    const minLength = constants.VALIDATION.PASSWORD_MIN_LENGTH;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: {
        length: password.length < minLength,
        uppercase: !hasUpperCase,
        lowercase: !hasLowerCase,
        numbers: !hasNumbers,
        special: !hasSpecialChar
      }
    };
  },

  // Get avatar color
  getAvatarColor: (name) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
    const index = name.length % colors.length;
    return colors[index];
  },

  // Get status color
  getStatusColor: (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Get role color
  getRoleColor: (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'instructor': return 'bg-purple-100 text-purple-800';
      case 'student': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Format currency
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Format date
  formatDate: (date, format = 'display') => {
    const dateObj = new Date(date);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return dateObj.toLocaleDateString('en-US', options);
  },

  // Format relative time
  formatRelativeTime: (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(date);
  },

  // Generate CSV content
  generateCSV: (data, headers) => {
    const csvContent = [
      headers,
      ...data.map(row => headers.map(header => row[header] || ''))
    ].map(row => row.join(',')).join('\n');
    
    return csvContent;
  },

  // Download file
  downloadFile: (content, filename, type = 'text/csv') => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

// ============================================================================
// PRODUCTION DATA SERVICE
// ============================================================================

/**
 * Production data service that fetches data from the backend API
 */
class ProductionDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Dashboard data
  async getDashboardData() {
    const cacheKey = 'dashboard';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.dashboard.getDashboardData();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      return dashboardData; // Fallback to mock data
    }
  }

  // Users data
  async getUsersData() {
    const cacheKey = 'users';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.users.getUsers();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to fetch users data:', error);
      return usersData; // Fallback to mock data
    }
  }

  // Notifications data
  async getNotificationsData() {
    const cacheKey = 'notifications';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.notifications.getNotifications();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to fetch notifications data:', error);
      return notificationsData; // Fallback to mock data
    }
  }

  // Courses data
  async getCoursesData() {
    const cacheKey = 'courses';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.courseModeration.getPendingCourses();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to fetch courses data:', error);
      return coursesData; // Fallback to mock data
    }
  }

  // Financial data
  async getFinancialData() {
    const cacheKey = 'financial';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.financial.getFinancialReports();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
      return financialData; // Fallback to mock data
    }
  }

  // Analytics data
  async getAnalyticsData() {
    const cacheKey = 'analytics';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.analytics.getPlatformAnalytics();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      return analyticsData; // Fallback to mock data
    }
  }

  // Settings data
  async getSettingsData() {
    const cacheKey = 'settings';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.settings.getSettings();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to fetch settings data:', error);
      return settingsData; // Fallback to mock data
    }
  }

  // Sidebar data
  async getSidebarData() {
    const cacheKey = 'sidebar';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      // For sidebar data, we'll combine profile and navigation data
      const [profileResponse, navigationResponse] = await Promise.all([
        apiService.auth.getProfile(),
        apiService.dashboard.getDashboardData() // We'll use dashboard data for navigation
      ]);
      
      const response = {
        navigation: sidebarData.navigation, // Use static navigation for now
        userProfile: profileResponse
      };
      
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to fetch sidebar data:', error);
      return sidebarData; // Fallback to mock data
    }
  }

  // Refresh all data
  async refreshAllData() {
    this.clearCache();
    return {
      dashboard: await this.getDashboardData(),
      users: await this.getUsersData(),
      notifications: await this.getNotificationsData(),
      courses: await this.getCoursesData(),
      financial: await this.getFinancialData(),
      analytics: await this.getAnalyticsData(),
      settings: await this.getSettingsData(),
      sidebar: await this.getSidebarData()
    };
  }
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

// Create production data service instance
const productionDataService = new ProductionDataService();

// Export the appropriate data service based on environment
export const dataService = isDevelopment ? {
  // Development: Return static data
  dashboard: dashboardData,
  users: usersData,
  notifications: notificationsData,
  courses: coursesData,
  financial: financialData,
  analytics: analyticsData,
  settings: settingsData,
  sidebar: sidebarData,
  instructorApplications: analyticsData.instructorApplications,
  constants,
  utils: dataUtils,
  
  // Development methods
  getDashboardData: () => Promise.resolve(dashboardData),
  getUsersData: () => Promise.resolve(usersData),
  getNotificationsData: () => Promise.resolve(notificationsData),
  getCoursesData: () => Promise.resolve(coursesData),
  getFinancialData: () => Promise.resolve(financialData),
  getAnalyticsData: () => Promise.resolve(analyticsData),
  getSettingsData: () => Promise.resolve(settingsData),
  getSidebarData: () => Promise.resolve(sidebarData),
  refreshAllData: () => Promise.resolve({
    dashboard: dashboardData,
    users: usersData,
    notifications: notificationsData,
    courses: coursesData,
    financial: financialData,
    analytics: analyticsData,
    settings: settingsData,
    sidebar: sidebarData
  })
} : {
  // Production: Return API-based data service
  dashboard: dashboardData, // Initial fallback
  users: usersData, // Initial fallback
  notifications: notificationsData, // Initial fallback
  courses: coursesData, // Initial fallback
  financial: financialData, // Initial fallback
  analytics: analyticsData, // Initial fallback
  settings: settingsData, // Initial fallback
  sidebar: sidebarData, // Initial fallback
  instructorApplications: analyticsData.instructorApplications, // Initial fallback
  constants,
  utils: dataUtils,
  
  // Production methods
  getDashboardData: () => productionDataService.getDashboardData(),
  getUsersData: () => productionDataService.getUsersData(),
  getNotificationsData: () => productionDataService.getNotificationsData(),
  getCoursesData: () => productionDataService.getCoursesData(),
  getFinancialData: () => productionDataService.getFinancialData(),
  getAnalyticsData: () => productionDataService.getAnalyticsData(),
  getSettingsData: () => productionDataService.getSettingsData(),
  getSidebarData: () => productionDataService.getSidebarData(),
  refreshAllData: () => productionDataService.refreshAllData(),
  clearCache: (key) => productionDataService.clearCache(key)
};

export default dataService; 