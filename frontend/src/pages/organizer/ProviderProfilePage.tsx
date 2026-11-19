import ProviderOverview from '../../features/profile/ProviderOverview';
import ProviderServices from '../../features/profile/ProviderServices';

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import {
  useCreateProviderReviewMutation,
  useDeleteProviderReviewMutation,
  useGetMyProviderReviewQuery,
  useGetProviderPortfolioQuery,
  useGetProviderReviewsQuery,
  useGetProviderQuery,
  useUpdateProviderReviewMutation,
} from '../../features/profile/providersApi';
import PortfolioGallery from '../../features/profile/PortfolioGallery';
import RatingStars from '../../features/profile/RatingStars';
import StartConversationButton from '../../features/messages/StartConversation';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const providerId = Number(id);
  const organizer = useAppSelector((state) => state.auth.user);

  const {
    data: provider,
    isLoading,
    isError,
    refetch,
  } = useGetProviderQuery(providerId, {
    skip: !Number.isInteger(providerId) || providerId <= 0,
  });
  const { data: portfolio = [], isLoading: isLoadingPortfolio, isError: portfolioError, refetch: refetchPortfolio } = useGetProviderPortfolioQuery(providerId, {
    skip: !Number.isInteger(providerId) || providerId <= 0,
  });
  const { data: reviewSummary, isLoading: isLoadingReviews, isError: reviewsError, refetch: refetchReviews } = useGetProviderReviewsQuery(providerId, {
    skip: !Number.isInteger(providerId) || providerId <= 0,
  });
  const { data: myReview } = useGetMyProviderReviewQuery(providerId, {
    skip: !Number.isInteger(providerId) || providerId <= 0 || organizer?.role !== 'organizer',
  });
  const [createReview, { isLoading: isCreatingReview }] = useCreateProviderReviewMutation();
  const [updateReview, { isLoading: isUpdatingReview }] = useUpdateProviderReviewMutation();
  const [deleteReview, { isLoading: isDeletingReview }] = useDeleteProviderReviewMutation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewNotice, setReviewNotice] = useState('');

  useEffect(() => {
    setRating(myReview?.rating || 0);
    setComment(myReview?.comment || '');
  }, [myReview]);

  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setReviewError('');
    setReviewNotice('');
    if (rating < 1 || rating > 5) {
      setReviewError('Choose a rating from 1 to 5 stars.');
      return;
    }
    const data = { rating, comment: comment.trim() || null };
    try {
      if (myReview) {
        await updateReview({ id: myReview.id, providerId, data }).unwrap();
      } else {
        await createReview({ providerId, data }).unwrap();
      }
      setReviewNotice('Your review has been saved.');
    } catch {
      setReviewError('Could not save your review. Please try again.');
    }
  };

  const handleReviewDelete = async () => {
    if (!myReview || !window.confirm('Delete your review?')) return;
    try {
      await deleteReview({ id: myReview.id, providerId }).unwrap();
      setRating(0);
      setComment('');
      setReviewNotice('Your review has been deleted.');
      setReviewError('');
    } catch {
      setReviewError('Could not delete your review. Please try again.');
    }
  };

  if (isLoading) {
    return <p className="p-6 text-gray-500">Loading provider...</p>;
  }

  if (isError || !provider) {
    return (
      <div className="rounded-2xl bg-white p-8">
        <p className="text-red-600">Provider not found.</p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/organizer/services"
        className="inline-flex items-center gap-2 text-sm text-[#351018]"
      >
        <ArrowLeft size={18} />
        Back to Services
      </Link>

      <ProviderOverview provider={provider} />
      <ProviderServices key={provider.id} providerId={provider.id} />

      <section className="space-y-4 rounded-2xl border border-[#D9A3AA]/40 bg-white p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-semibold text-[#351018]">My Works</h2>
          <p className="mt-1 text-sm text-[#351018]/60">
            Explore some of my favorite projects and creative moments.
          </p>
        </div>
        <PortfolioGallery items={portfolio} isLoading={isLoadingPortfolio} isError={portfolioError} onRetry={refetchPortfolio} />
      </section>

      <section className="space-y-5 rounded-2xl border border-[#D9A3AA]/40 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[#351018]">Ratings &amp; Reviews</h2>
          {reviewSummary && reviewSummary.reviewCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#351018]">{reviewSummary.averageRating.toFixed(1)} ★</span>
              <RatingStars value={Math.round(reviewSummary.averageRating)} size={17} />
              <span className="text-sm text-[#351018]/60">— {reviewSummary.reviewCount} {reviewSummary.reviewCount === 1 ? 'Review' : 'Reviews'}</span>
            </div>
          )}
        </div>

        {organizer?.role === 'organizer' && (
          <form onSubmit={handleReviewSubmit} className="space-y-4 rounded-xl bg-[#FFF8F1] p-4 sm:p-5">
            <div>
              <p className="mb-2 text-sm font-medium text-[#351018]">{myReview ? 'Edit your review' : 'Rate this provider'}</p>
              <RatingStars value={rating} onChange={setRating} label="Your rating" size={28} />
            </div>
            <label className="block space-y-2 text-sm font-medium text-[#351018]">
              Review (optional)
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} rows={3} className="w-full resize-y rounded-xl border border-[#351018]/15 bg-white px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={isCreatingReview || isUpdatingReview} className="rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018] disabled:opacity-50">
                {isCreatingReview || isUpdatingReview ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}
              </button>
              {myReview && (
                <button type="button" onClick={handleReviewDelete} disabled={isDeletingReview} className="rounded-xl border border-[#351018]/20 px-5 py-3 text-sm text-[#351018] disabled:opacity-50">
                  {isDeletingReview ? 'Deleting...' : 'Delete Review'}
                </button>
              )}
            </div>
            {reviewError && <p role="alert" className="text-sm text-red-600">{reviewError}</p>}
            {reviewNotice && <p role="status" className="text-sm text-[#351018]">{reviewNotice}</p>}
          </form>
        )}

        {isLoadingReviews ? (
          <p className="text-sm text-[#351018]/60">Loading reviews...</p>
        ) : reviewsError ? (
          <p className="text-sm text-red-600">Could not load reviews. <button onClick={() => refetchReviews()} className="underline">Try again</button></p>
        ) : !reviewSummary?.reviews.length ? (
          <p className="text-sm text-[#351018]/60">No reviews yet.</p>
        ) : (
          <div className="divide-y divide-[#D9A3AA]/30">
            {reviewSummary.reviews.map((review) => (
              <article key={review.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-[#351018]">{review.organizer?.name || 'Organizer'}</p>
                  <time dateTime={review.createdAt} className="text-xs text-[#351018]/50">{new Date(review.createdAt).toLocaleDateString()}</time>
                </div>
                <RatingStars value={review.rating} size={16} />
                {review.comment && <p className="whitespace-pre-line text-sm text-[#351018]/70">{review.comment}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D9A3AA]/40 bg-white p-6">
        <div>
          <h2 className="font-semibold text-[#351018]">Contact Provider</h2>
          <p className="mt-1 text-sm text-[#351018]/60">Start a conversation about your event.</p>
        </div>
        <StartConversationButton providerId={provider.id} />
      </section>
    </div>
  );
}
