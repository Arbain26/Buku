import React from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle2 } from 'lucide-react';

export const BookCard = ({ book }) => {
  const {
    id,
    title,
    author,
    coverImage,
    rating = 4.8,
    category,
    minPrice,
    statusTersedia = true,
  } = book;

  const categoryName = typeof category === 'string' ? category : category?.name;

  return (
    <Link
      to={`/buku/${id}`}
      className="group bg-white rounded-2xl border border-[#E5E7EB] p-3.5 flex flex-col transition-all duration-200 hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-0.5"
    >
      {/* Book Cover Container */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-100 mb-3">
        <img
          src={coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {categoryName && (
          <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-xs font-medium text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100 shadow-xs">
            {categoryName}
          </span>
        )}
      </div>

      {/* Book Details */}
      <div className="flex-1 flex flex-col">
        <h4 className="font-semibold text-sm text-[#17211D] line-clamp-1 group-hover:text-[#075E54] transition-colors">
          {title}
        </h4>
        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{author}</p>

        {/* Rating & Availability */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{rating > 0 ? rating.toFixed(1) : '4.8'}</span>
          </div>

          {statusTersedia ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Tersedia
            </span>
          ) : (
            <span className="text-[11px] text-gray-400">Habis</span>
          )}
        </div>

        {/* Price display if available */}
        {minPrice ? (
          <p className="text-xs font-semibold text-[#075E54] mt-1.5">
            Mulai Rp {minPrice.toLocaleString('id-ID')}
          </p>
        ) : null}
      </div>
    </Link>
  );
};
