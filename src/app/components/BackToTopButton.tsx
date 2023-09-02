import { useState, useEffect } from 'react';

function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type='button'
      className={`w-16 h-16 fixed bottom-0 right-0 mr-5 mb-5 lg:mr-20 lg:mb-20 btn-theme bg-green-600 rounded-full text-2xl transition-opacity duration-300 hover:opacity-100 ${
        isVisible ? 'opacity-50' : 'opacity-0'
      }`}
      onClick={scrollToTop}
    >
      <i className="fa-solid fa-caret-up"></i>
      <span className="sr-only">top</span>
    </button>
  );
}

export default BackToTopButton;