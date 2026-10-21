/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext.jsx';

// Public Pages
import Home from './pages/Home.jsx';
import PostDetail from './pages/PostDetail.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import TagPage from './pages/TagPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import CvPage from './pages/CvPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';

// Admin Components & Pages
import RequireAdmin from './components/admin/RequireAdmin.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import PostsAdmin from './pages/admin/PostsAdmin.jsx';
import PostEditor from './pages/admin/PostEditor.jsx';
import CategoriesAdmin from './pages/admin/CategoriesAdmin.jsx';
import CommentsAdmin from './pages/admin/CommentsAdmin.jsx';
import AdsAdmin from './pages/admin/AdsAdmin.jsx';
import MediaAdmin from './pages/admin/MediaAdmin.jsx';
import CvAdmin from './pages/admin/CvAdmin.jsx';
import MessagesAdmin from './pages/admin/MessagesAdmin.jsx';
import SettingsAdmin from './pages/admin/SettingsAdmin.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/tag/:slug" element={<TagPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cv" element={<CvPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Dashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <RequireAdmin>
                <PostsAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/posts/new"
            element={
              <RequireAdmin>
                <PostEditor />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/posts/edit/:id"
            element={
              <RequireAdmin>
                <PostEditor />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <RequireAdmin>
                <CategoriesAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/comments"
            element={
              <RequireAdmin>
                <CommentsAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/ads"
            element={
              <RequireAdmin>
                <AdsAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/media"
            element={
              <RequireAdmin>
                <MediaAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/cv"
            element={
              <RequireAdmin>
                <CvAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <RequireAdmin>
                <MessagesAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RequireAdmin>
                <SettingsAdmin />
              </RequireAdmin>
            }
          />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
