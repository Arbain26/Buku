import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [], className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs text-[#66736D] overflow-x-auto no-scrollbar py-1 ${className}`}
    >
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-[#075E54] transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Beranda</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {isLast || !item.link ? (
              <span
                className="font-semibold text-[#17211D] truncate max-w-[200px] sm:max-w-xs shrink-0"
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.link}
                className="hover:text-[#075E54] transition-colors truncate max-w-[150px] shrink-0"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
