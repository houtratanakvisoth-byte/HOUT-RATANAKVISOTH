import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Sidebar from './Sidebar.jsx';
import AdSlot from './AdSlot.jsx';

export default function Layout({ children, showSidebar = true, fullWidth = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-main)] transition-colors duration-200">
      
      {/* Top Header Advertisement Slot */}
      <div className="w-full bg-[var(--bg-card)]/50 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdSlot slot="header" />
        </div>
      </div>

      {/* Main Navigation Header */}
      <Header />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fullWidth ? (
          children
        ) : showSidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Primary Content (8 columns on lg) */}
            <div className="lg:col-span-8 w-full min-w-0">
              {children}
            </div>

            {/* Sidebar (4 columns on lg) */}
            <div className="lg:col-span-4 w-full">
              <Sidebar />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {children}
          </div>
        )}
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
