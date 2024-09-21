import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Cuvisoft. All rights reserved.</p>
        <div className="mt-2">
          <a href="#" className="hover:text-blue-300 mx-2">Privacy Policy</a>
          <a href="#" className="hover:text-blue-300 mx-2">Terms of Service</a>
          <a href="#" className="hover:text-blue-300 mx-2">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
