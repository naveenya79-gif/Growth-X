import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 text-center mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm">&copy; {new Date().getFullYear()} REVIVE. All rights reserved.</p>
        <p className="text-xs mt-2">A production-ready agentic commerce environment.</p>
      </div>
    </footer>
  );
};

export default Footer;
