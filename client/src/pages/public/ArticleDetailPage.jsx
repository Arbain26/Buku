import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Eye,
  Calendar,
  ChevronRight,
  Share2,
  Sparkles,
  BookOpen,
  ArrowLeft,
  User,
} from 'lucide-react';
import { articleService } from '../../services/dataServices';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { Skeleton } from '../../components/common/Skeleton';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { Avatar } from '../../components/common/Avatar';

export const ArticleDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Reading progress bar calculation
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const res = await articleService.getArticleById(id);
        if (res?.data) {
          setArticle(res.data);
          // Fetch related articles
          const relatedRes = await articleService.getArticles({ limit: 3 });
          if (relatedRes?.data) {
            setRelatedArticles(relatedRes.data.filter((a) => a.id !== Number(id)).slice(0, 2));
          }
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
        <Skeleton className="w-1/3 h-6" />
        <Skeleton className="w-full h-12" />
        <Skeleton className="w-1/2 h-6" />
        <Skeleton className="w-full h-72 rounded-3xl" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-[#17211D]">Artikel tidak ditemukan.</h2>
        <Link to="/baca-5-menit" className="text-[#075E54] font-bold hover:underline inline-block text-sm">
          ← Kembali ke Baca 5 Menit
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(article.createdAt || Date.now()).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      {/* Sticky Reading Progress Bar */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-gray-100 z-30">
        <div
          className="h-full bg-[#075E54] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Baca 5 Menit', link: '/baca-5-menit' },
            { label: article.title },
          ]}
        />

        {/* Editorial Header */}
        <header className="space-y-4 text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#E8F3EF] text-[#075E54] border border-[#cbe1d7]">
            {article.category?.name || 'Literasi & Edukasi'}
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#17211D] tracking-tight leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-lg text-[#66736D] italic max-w-2xl mx-auto leading-relaxed">
              &ldquo;{article.excerpt}&rdquo;
            </p>
          )}

          {/* Author Metadata & Read Time */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-b border-[#E2E8E5] py-3 text-xs text-[#66736D]">
            <div className="flex items-center gap-2">
              <Avatar
                src={article.author?.avatar}
                name={article.author?.name || 'Penulis Mabbaca'}
                size="xs"
              />
              <span className="font-bold text-[#17211D]">{article.author?.name || 'Penulis Sidrap'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#075E54] font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTimeMinutes || 5} menit membaca</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden shadow-xs border border-[#E2E8E5] aspect-[16/10] bg-[#E8F3EF]">
          <ImageWithFallback
            src={article.thumbnail}
            alt={article.title}
            fallbackIcon={BookOpen}
            fallbackText={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body Content */}
        <article className="prose prose-emerald max-w-none text-[#17211D]/90 text-sm sm:text-base leading-relaxed space-y-4">
          <div className="whitespace-pre-line">
            {article.content}
          </div>
        </article>

        {/* Author Bio Box */}
        <div className="bg-[#E8F3EF]/40 rounded-2xl p-5 border border-[#cbe1d7] flex items-center gap-4 mt-8">
          <Avatar
            src={article.author?.avatar}
            name={article.author?.name}
            size="lg"
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#075E54]">Tentang Penulis</span>
            <h4 className="font-bold text-sm text-[#17211D]">{article.author?.name || 'Kontributor Literasi Sidrap'}</h4>
            <p className="text-xs text-[#66736D] mt-0.5">
              Pegiat literasi aktif yang berkontribusi menyebarkan semangat membaca di Kabupaten Sidenreng Rappang.
            </p>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="pt-10 border-t border-[#E2E8E5] space-y-4">
            <h3 className="text-lg font-bold text-[#17211D]">
              Artikel Baca 5 Menit Terkait
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
