import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Eye, Calendar, ChevronRight, Share2, Sparkles, BookOpen } from 'lucide-react';
import { articleService } from '../../services/dataServices';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { Skeleton } from '../../components/common/Skeleton';

export const ArticleDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const res = await articleService.getArticleById(id);
        if (res?.data) {
          setArticle(res.data);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="w-1/3 h-5" />
        <Skeleton className="w-full h-12" />
        <Skeleton className="w-1/2 h-6" />
        <Skeleton className="w-full h-72 rounded-2xl" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Artikel tidak ditemukan.</h2>
        <Link to="/baca-5-menit" className="text-[#075E54] font-medium hover:underline mt-2 inline-block">
          ← Kembali ke Baca 5 Menit
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(article.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-[#075E54]">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/baca-5-menit" className="hover:text-[#075E54]">Baca 5 Menit</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-[#17211D] truncate max-w-xs">{article.title}</span>
      </nav>

      {/* Editorial Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {article.category?.name}
        </span>

        <h1 className="text-2xl sm:text-4xl font-bold text-[#17211D] tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-gray-600 italic">
          {article.excerpt}
        </p>

        {/* Author metadata & read time */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-b border-gray-200/80 py-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <img
              src={article.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={article.author?.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="font-semibold text-[#17211D]">{article.author?.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{article.readTimeMinutes} menit baca</span>
          </div>
        </div>
      </div>

      {/* Featured Thumbnail */}
      <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
        <img
          src={article.thumbnail}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Editorial Article Body */}
      <article className="max-w-2xl mx-auto prose prose-emerald prose-lg leading-relaxed text-[#17211D]/90">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-base sm:text-lg text-gray-700 leading-relaxed my-4">
            {paragraph}
          </p>
        ))}
      </article>

      {/* Gamification reward callout */}
      <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-emerald-900 font-medium">
            Selamat! Anda telah menyelesaikan artikel ini dan mendapatkan <strong>+10 Poin Literasi</strong>.
          </p>
        </div>
        <Link to="/baca-5-menit" className="text-[#075E54] font-bold hover:underline shrink-0">
          Artikel Lainnya →
        </Link>
      </div>

      {/* Related Articles */}
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <section className="pt-10 border-t border-gray-200 space-y-5">
          <h3 className="text-xl font-bold text-[#17211D]">Artikel Terkait Lainnya</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {article.relatedArticles.map((rel) => (
              <ArticleCard key={rel.id} article={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
