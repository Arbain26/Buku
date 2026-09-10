import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Sparkles, Eye } from 'lucide-react';
import { articleService } from '../../services/dataServices';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    articleService.getCategories().then((res) => {
      if (res?.data) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const res = await articleService.getArticles({
          category: selectedCategory || undefined,
        });
        if (res?.data) {
          setArticles(res.data);
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory]);

  const featuredArticle = articles.find((a) => a.isFeatured) || articles[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
          <Clock className="w-3.5 h-3.5" />
          Editorial Literasi Modern
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#17211D] tracking-tight">
          Baca 5 Menit
        </h1>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Tidak punya banyak waktu untuk membaca buku tebal? Mulailah dari artikel 5 menit.
          Temukan esai ringkas seputar literasi digital, finansial, dan sejarah luhur Sidrap.
        </p>
      </div>

      {/* Featured Article Editorial Banner */}
      {featuredArticle && !selectedCategory && (
        <div className="relative bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-card flex flex-col lg:flex-row gap-6 p-6 sm:p-8">
          <div className="flex-1 space-y-4 flex flex-col justify-between">
            <div>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md mb-2">
                {featuredArticle.category?.name}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#17211D] hover:text-[#075E54] transition-colors leading-tight">
                <a href={`/baca-5-menit/${featuredArticle.id}`}>{featuredArticle.title}</a>
              </h2>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                {featuredArticle.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
              <span className="font-semibold text-emerald-800">
                {featuredArticle.readTimeMinutes} menit membaca
              </span>
              <a
                href={`/baca-5-menit/${featuredArticle.id}`}
                className="font-semibold text-[#075E54] hover:underline"
              >
                Baca Artikel Lengkap →
              </a>
            </div>
          </div>

          <div className="lg:w-1/2 aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 relative shadow-inner">
            <img
              src={featuredArticle.thumbnail}
              alt={featuredArticle.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            !selectedCategory
              ? 'bg-[#075E54] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Semua Topik
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.slug
                ? 'bg-[#075E54] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Tidak ada artikel dalam topik ini"
          description="Coba pilih topik lain untuk menemukan artikel menarik."
          actionText="Tampilkan Semua Topik"
          onAction={() => setSelectedCategory('')}
        />
      )}
    </div>
  );
};
