
import React, { useState, useEffect } from 'react';
import ReyelGallery from './components/ReyelGallery';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [view, setView] = useState<'gallery' | 'admin'>('gallery');

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setView('admin');
    }

    const handlePopState = () => {
      setView(window.location.pathname === '/admin' ? 'admin' : 'gallery');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToGallery = () => {
    window.history.pushState({}, '', '/');
    setView('gallery');
  };

  return (
    <main className="min-h-screen animated-gradient">
      {view === 'gallery' ? (
        <ReyelGallery />
      ) : (
        <AdminPanel onBack={navigateToGallery} />
      )}
    </main>
  );
};

export default App;