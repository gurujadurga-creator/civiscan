import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { IssueDetailModal } from './components/IssueDetailModal.tsx';

// 13 Pages
import { PublicHome } from './pages/PublicHome.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { UploadAndDetect } from './pages/UploadAndDetect.tsx';
import { AllIssues } from './pages/AllIssues.tsx';
import { MapView } from './pages/MapView.tsx';
import { PriorityManagement } from './pages/PriorityManagement.tsx';
import { AssignedTasks } from './pages/AssignedTasks.tsx';
import { CompletedHistory } from './pages/CompletedHistory.tsx';
import { ReportsAndAnalytics } from './pages/ReportsAndAnalytics.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { SolarFutureScope } from './pages/SolarFutureScope.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { LiveLocationDeviceManagement } from './pages/LiveLocationDeviceManagement.tsx';

const MainLayout: React.FC = () => {
  const { currentPage, selectedIssue, setSelectedIssue } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <PublicHome />;
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <UploadAndDetect />;
      case 'issues':
        return <AllIssues />;
      case 'map':
        return <MapView />;
      case 'priority':
        return <PriorityManagement />;
      case 'tasks':
        return <AssignedTasks />;
      case 'live-location':
        return <LiveLocationDeviceManagement />;
      case 'completed':
        return <CompletedHistory />;
      case 'reports':
        return <ReportsAndAnalytics />;
      case 'notifications':
        return <NotificationsPage />;
      case 'future-scope':
        return <SolarFutureScope />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <PublicHome />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {renderPage()}
        </main>
      </div>

      {/* Global Issue Inspection & Action Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
