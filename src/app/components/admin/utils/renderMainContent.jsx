import AdminDashboardOverview from '../dashboard/AdminDashboardOverview';
import UsersManagement from '../users/UsersManagement';
import FinancialReport from '../financial/FinancialReport';
import AdminAnalytics from '../analytics/AdminAnalytics';
import AdminNotifications from '../notifications/AdminNotifications';
import AdminSettings from '../settings/AdminSettings';
import CourseModeration from '../courseModeration/CourseModeration';

export const renderMainContent = (activeTab, dashboardData) => {
    switch (activeTab) {
        case 'dashboard':
            return <AdminDashboardOverview dashboardData={dashboardData} />;
        case 'users':
            return <UsersManagement />;
        case 'course-moderation':
            return <CourseModeration />;
        case 'financial-report':
            return <FinancialReport />;
        case 'analytics':
            return <AdminAnalytics />;
        case 'notifications':
            return <AdminNotifications />;
        case 'settings':
            return <AdminSettings />;
        default:
            return <AdminDashboardOverview dashboardData={dashboardData} />;
    }
}; 