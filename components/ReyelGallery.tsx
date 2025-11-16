// Fix: Switched from a namespace import (`* as React`) to fix JSX type augmentation issues.
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { categories } from '../constants';
import type { Image, Category } from '../types';


const NeonBeam: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.div
        className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"
        style={{ left: '-100%', top: 0 }}
        animate={{ left: ['0%', '100%'], opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'linear', delay: delay }}
      />
    </motion.div>
  );
};


interface ImageCardProps {
  image: Image;
  onClick: () => void;
  index: number;
}
const ImageCard: React.FC<ImageCardProps> = ({ image, onClick, index }) => {
  return (
    <motion.div
      className="relative w-full cursor-pointer overflow-hidden rounded-lg group mb-4 break-inside-avoid"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onContextMenu={(e) => e.preventDefault()}
      layout
    >
      <NeonBeam delay={index * 0.2} />
      <img
        src={image.url}
        alt={image.title}
        className="w-full h-auto object-cover select-none pointer-events-none"
        draggable="false"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-100 opacity-70" />
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: index * 0.05 + 0.2, duration: 0.3 }}
      >
        <h3 className="text-white font-semibold text-sm md:text-base truncate">{image.title}</h3>
      </motion.div>
    </motion.div>
  );
};


interface FullscreenModalProps {
  image: Image;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  total: number;
  current: number;
}
const FullscreenModal: React.FC<FullscreenModalProps> = ({ image, onClose, onPrev, onNext, total, current }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 z-50 p-2 bg-red-600/80 hover:bg-red-700 rounded-full transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors hidden md:block"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors hidden md:block"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>

        <motion.div className="relative w-full h-auto flex justify-center" layoutId={`image-${image.id}`}>
          <img
            src={image.url}
            alt={image.title}
            className="max-w-full max-h-[85vh] object-contain select-none rounded-lg shadow-2xl shadow-black"
            draggable="false"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>

        <div className="mt-4 text-center text-white" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold">{image.title}</h2>
          <p className="text-sm opacity-70">{current + 1} / {total}</p>
        </div>

        <div className="md:hidden absolute bottom-4 flex gap-8">
           <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="p-2 bg-white/20 hover:bg-white/30 rounded-full">
               <ChevronLeft className="w-6 h-6 text-white" />
           </button>
           <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="p-2 bg-white/20 hover:bg-white/30 rounded-full">
               <ChevronRight className="w-6 h-6 text-white" />
           </button>
        </div>
      </div>
    </motion.div>
  );
};


export default function ReyelGallery() {
  const [activeMainCategoryId, setActiveMainCategoryId] = React.useState<string>(categories[0].id);
  const [activeSubCategoryId, setActiveSubCategoryId] = React.useState<string | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<Image | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState<number>(0);

  const handleMainCategoryClick = (categoryId: string) => {
    setActiveMainCategoryId(categoryId);
    setActiveSubCategoryId(null); // Reset sub-category selection
  };
  
  const activeMainCategory = React.useMemo(() => categories.find(cat => cat.id === activeMainCategoryId), [activeMainCategoryId]);
  const subCategories = activeMainCategory?.subCategories || [];

  const currentImages = React.useMemo(() => {
    if (subCategories.length > 0) {
      if (!activeSubCategoryId) return [];
      const activeSubCategory = subCategories.find(sub => sub.id === activeSubCategoryId);
      return activeSubCategory?.images || [];
    }
    return activeMainCategory?.images || [];
  }, [activeMainCategory, activeSubCategoryId, subCategories]);


  const openImage = (image: Image, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (currentImages.length === 0) return;
    const nextIndex = (currentImageIndex + 1) % currentImages.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(currentImages[nextIndex]);
  };

  const prevImage = () => {
    if (currentImages.length === 0) return;
    const prevIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(currentImages[prevIndex]);
  };

  return (
    <div className="min-h-screen text-white py-8 px-4 md:px-8 relative">
      <div className="absolute top-8 left-4 md:left-8 z-10">
        <button
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800/50"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="max-w-7xl mx-auto">
        <motion.header
          className="text-center mb-12 flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img
            src="https://res.cloudinary.com/dxhlvrach/image/upload/v1763309934/R-Reyel_qgfuej.png"
            alt="Reyel Produções Logo"
            className="w-48 md:w-64 mb-4"
          />
          <p className="text-gray-400 text-lg">
            Momentos eternizados através das lentes
          </p>
        </motion.header>

        <nav className="mb-4 overflow-x-auto pb-4">
          <div className="flex gap-3 justify-center flex-wrap">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => handleMainCategoryClick(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
                  activeMainCategoryId === category.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </nav>

        <AnimatePresence>
          {subCategories.length > 0 && (
            <motion.div
              key="sub-nav"
              className="mb-8 overflow-x-auto pb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex gap-3 justify-center flex-wrap border-t border-gray-700/50 pt-6">
                {subCategories.map((subCategory, index) => (
                  <motion.button
                    key={subCategory.id}
                    onClick={() => setActiveSubCategoryId(subCategory.id)}
                    className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                      activeSubCategoryId === subCategory.id
                        ? 'bg-red-800 text-white shadow-md shadow-red-800/40'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.05 }}
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                  >
                    {subCategory.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        <AnimatePresence mode="wait">
          <motion.div
            key={activeMainCategoryId + (activeSubCategoryId || '')}
            className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentImages.map((image, index) => (
              <ImageCard
                key={image.id}
                image={image}
                index={index}
                onClick={() => openImage(image, index)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        <footer className="text-center mt-16 py-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            © 2025{' '}
            <a
              href="https://www.instagram.com/reyelproducoes_"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-400 hover:text-red-500 transition-colors"
            >
              Reyel Produções
            </a>{' '}
            – Todos os direitos reservados.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Desenvolvido por{' '}
            <a
              href="https://www.instagram.com/onzy.company"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-400 hover:text-purple-500 transition-colors"
            >
              Onzy Company
            </a>
            .
          </p>
        </footer>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <FullscreenModal
            image={selectedImage}
            onClose={closeImage}
            onNext={nextImage}
            onPrev={prevImage}
            total={currentImages.length}
            current={currentImageIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}