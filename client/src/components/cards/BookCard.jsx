import React from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle2, BookOpen } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const BookCard = ({ book }) => {
  if (!book) return null;

  const {
    id,
    title,
    author,
    authors,
    authorName,
    coverImage,
    rating = 4.8,
    category,
    minPrice,
    statusTersedia = true,
    storeInventory = [],
    libraryCollections = [],
  } = book;

  // Resolve category name safely
  const categoryName = typeof category === 'string' ? category : category?.name;

  // Resolve author name cleanly whether string, authorName, or authors array
  let resolvedAuthor = author || authorName;
  if (!resolvedAuthor && Array.isArray(authors) && authors.length > 0) {
    resolvedAuthor = authors.map((a) => a?.author?.name || a?.name || '').filter(Boolean).join(', ');
  }
  if (!resolvedAuthor) resolvedAuthor = 'Penulis Tidak Diketahui';

  // Availability description
  const hasStore = storeInventory && storeInventory.length > 0;
  const hasLibrary = libraryCollections && libraryCollections.length > 0;

  return (
    <Link
      to={`/buku/${id}`}
      className="group bg-white rounded-2xl border border-[#E2E8E5] p-3 flex flex-col transition-all duration-200 hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-1"
    >
      {/* Book Cover Container with ImageWithFallback */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#E8F3EF] mb-3 shadow-xs">
        <ImageWithFallback
          src={coverImage}
          alt={title}
          fallbackText={title}
          fallbackIcon={BookOpen}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {categoryName && (
          <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-[#075E54] px-2 py-0.5 rounded-md border border-[#cbe1d7] shadow-xs max-w-[80%] truncate">
            {categoryName}
          </span>
        )}
      </div>

      {/* Book Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-[#17211D] line-clamp-1 group-hover:text-[#075E54] transition-colors leading-snug">
            {title}
          </h4>
          <p className="text-[11px] sm:text-xs text-[#66736D] line-clamp-1 mt-0.5">
            {resolvedAuthor}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating > 0 ? Number(rating).toFixed(1) : '4.8'}</span>
            </div>

            {hasStore || hasLibrary || statusTersedia ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#075E54]">
                <CheckCircle2 className="w-3 h-3 text-[#075E54]" />
                {hasStore && hasLibrary
                  ? 'Toko & Perpus'
                  : hasStore
                  ? 'Di Toko'
                  : hasLibrary
                  ? 'Di Perpus'
                  : 'Tersedia'}
              </span>
            ) : (
              <span className="text-[11px] text-gray-400">Belum tersedia</span>
            )}
          </div>

          {minPrice ? (
            <p className="text-xs font-bold text-[#075E54] mt-1">
              Mulai Rp {Number(minPrice).toLocaleString('id-ID')}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
};
