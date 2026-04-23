
import React, { useState, useEffect } from 'react';
import ReyelGallery from './components/ReyelGallery';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [view, setView] = useState<'gallery' | 'admin'>('gallery');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setView('admin');
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      setView(currentParams.get('admin') === 'true' ? 'admin' : 'gallery');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToGallery = () => {
    window.history.pushState({}, '', window.location.pathname);
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