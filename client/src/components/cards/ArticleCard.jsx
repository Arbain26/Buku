import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, FileText, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const ArticleCard = ({ article }) => {
  if (!article) return null;

  const {
    id,
    title,
    thumbnail,
    readTimeMinutes = 5,
    views = 120,
    category,
    excerpt,
    createdAt,
  } = article;

  const categoryName = typeof category === 'string' ? category : category?.name;
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : null;

  return (
    <Link
      to={`/baca-5-menit/${id}`}
      className="group bg-white rounded-2xl border border-[#E2E8E5] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-0.5"
    >
      {/* Thumbnail with ImageWithFallback */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E8F3EF]">
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          fallbackIcon={FileText}
          fallbackText={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {categoryName && (
          <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-[#075E54] px-2.5 py-0.5 rounded-md border border-[#cbe1d7] shadow-xs">
            {categoryName}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-sm text-[#17211D] line-clamp-2 group-hover:text-[#075E54] transition-colors leading-snug mb-1.5">
            {title}
          </h4>
          {excerpt && (
            <p className="text-xs text-[#66736D] line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-[#66736D] pt-3 mt-3 border-t border-gray-100">
          <span className="inline-flex items-center gap-1 font-semibold text-[#075E54]">
            <Clock className="w-3.5 h-3.5" />
            {readTimeMinutes} menit membaca
          </span>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075E54] group-hover:translate-x-0.5 transition-transform">
            Baca Sekarang <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
};
