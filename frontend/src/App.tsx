import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import NewPostPage from './pages/NewPostPage';
import EditPostPage from './pages/EditPostPage';
import PostPage from './pages/PostPage';
import NotFoundPage from './pages/NotFoundPage';
import CategoryPage from './pages/CategoryPage';


const App: React.FC = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/posts/new"
          element={
            <ProtectedRoute>
              <NewPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:id/edit"
          element={
            <ProtectedRoute>
              <EditPostPage />
            </ProtectedRoute>
          }
        />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default App;
