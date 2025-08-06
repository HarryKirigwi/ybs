import {
    LayoutDashboard,
    DollarSign,
    BarChart3,
    Bell,
    Settings,
    Users,
    BookOpen,
} from 'lucide-react';

export const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'course-moderation', label: 'Course Moderation', icon: BookOpen },
    { id: 'financial-report', label: 'Financial Report', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
]; 