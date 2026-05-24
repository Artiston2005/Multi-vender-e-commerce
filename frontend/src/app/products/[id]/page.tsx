'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ProductDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  stock: number;
  store: { name: string };
  variants: {
    id: string;
    name: string;
    stock: number;
  }[];
  reviews: Review[];
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/public/products/${params.id}`);
      setProduct(res.data.product);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    let variantName = undefined;
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find(v => v.id === selectedVariant);
      variantName = variant?.name;
    }

    addToCart({
      productId: product.id,
      variantId: selectedVariant || undefined,
      variantName,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      storeName: product.store.name
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setReviewError('You must be logged in to leave a review.');
      return;
    }
    
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await api.post(`/customer/reviews/${product?.id}`, { rating, comment });
      setComment('');
      setRating(5);
      // Refresh product to show new review
      fetchProduct();
    } catch (err: any) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Product not found'}</h2>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const avgRating = product.reviews.length > 0 
    ? product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="flex justify-center items-center bg-gray-50 rounded-xl overflow-hidden min-h-[400px]">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-center max-h-[600px]" />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <ShoppingCart className="h-16 w-16 mb-2 opacity-20" />
                  <span>No Image Available</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Sold by {product.store.name}</span>
              </div>
              
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {'★'.repeat(Math.round(avgRating))}
                  {'☆'.repeat(5 - Math.round(avgRating))}
                </div>
                <span className="text-gray-500 ml-2 text-sm">
                  {avgRating.toFixed(1)} ({product.reviews.length} reviews)
                </span>
              </div>

              <div className="text-3xl font-bold text-gray-900 mb-6">₹{Number(product.price).toFixed(2)}</div>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{product.description}</p>

              {product.variants && product.variants.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Select Variant</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        disabled={v.stock === 0}
                        onClick={() => setSelectedVariant(v.id)}
                        className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                          selectedVariant === v.id 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' 
                            : v.stock === 0
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {v.name}
                        {v.stock === 0 && <span className="block text-xs font-normal mt-1 text-red-500">Out of stock</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!product.variants?.length && (
                <div className="mb-6">
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium">{product.stock} in stock</span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of stock</span>
                  )}
                </div>
              )}

              <div className="mt-auto pt-8 border-t border-gray-100">
                <Button 
                  size="lg" 
                  className="w-full text-lg py-6"
                  disabled={(product.variants && product.variants.length > 0 && !selectedVariant) || 
                            (!product.variants?.length && product.stock === 0)}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" /> 
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Write Review Form */}
            <div className="lg:col-span-1 border border-gray-200 p-6 rounded-xl h-fit">
              <h3 className="text-lg font-bold mb-4">Write a Review</h3>
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {reviewError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{reviewError}</div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="What did you like or dislike?"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    ></textarea>
                  </div>
                  <Button type="submit" disabled={reviewSubmitting} className="w-full">
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">Please log in to leave a review.</p>
                  <Link href="/login">
                    <Button variant="outline">Log In</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              {product.reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                  No reviews yet. Be the first to review this product!
                </div>
              ) : (
                <div className="space-y-6">
                  {product.reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg mr-3">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{review.user.name}</div>
                          <div className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex text-yellow-400 text-sm mb-3">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                      {review.comment && <p className="text-gray-700">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
