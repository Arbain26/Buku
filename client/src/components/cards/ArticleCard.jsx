import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';

export const ArticleCard = ({ article }) => {
  const {
    id,
    title,
    thumbnail,
    readTimeMinutes = 5,
    views = 120,
    category,
    excerpt,
  } = article;

  const categoryName = typeof category === 'string' ? category : category?.name;

  return (
    <Link
      to={`/baca-5-menit/${id}`}
      className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80'}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {categoryName && (
          <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm text-xs font-medium text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-100 shadow-xs">
            {categoryName}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-semibold text-sm text-[#17211D] line-clamp-2 group-hover:text-[#075E54] transition-colors leading-snug mb-1">
            {title}
          </h4>
          {excerpt && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
              {excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-2.5 mt-2 border-t border-gray-100">
          <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
            <Clock className="w-3 h-3 text-emerald-600" />
            {readTimeMinutes} menit baca
          </span>

          <span className="inline-flex items-center gap-1 text-gray-400">
            <Eye className="w-3 h-3" />
            {views.toLocaleString('id-ID')} dibaca
          </span>
        </div>
      </div>
    </Link>
  );
};
