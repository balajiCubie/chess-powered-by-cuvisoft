import React from 'react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
];

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex items-center">
          Chess
          <span className="ml-2 text-sm flex items-center">
            <span className="inline-block transform -translate-y-1">
              <span className="inline-block border-white font-normal">
                Powered by cuvisoft
              </span>
            </span>
          </span>
        </Link>

        <ul className="flex space-x-4">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link href={item.href} className="hover:text-blue-200 transition-colors">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
