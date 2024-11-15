import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProductDetails = ({ shoe, shoes, onGoBack, onAddToCart, onCheckoutPage, onViewProduct }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0); // Reset selected image when shoe changes
  }, [shoe]);

  if (!shoe || !shoes) return null;

  const currentIndex = shoes.findIndex(s => s.id === shoe.id);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onViewProduct(shoes[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < shoes.length - 1) {
      onViewProduct(shoes[currentIndex + 1]);
    }
  };

  const isSoldOut = () => {
    const soldOutProductIds = [8, 12, 13, 14, 15, 21, 23];
    return soldOutProductIds.includes(shoe.id) || shoe.isSoldOut;
  };

  const getImages = () => {
    return [shoe.image || "/api/placeholder/400/300", ...(shoe.additionalImages || [])];
  };

  const images = getImages();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shoe.name,
          text: `Check out this ${shoe.name} at MA Tex`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleProceedToCheckout = () => {
    onCheckoutPage(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="pt-20 px-4 max-w-6xl mx-auto">
        <button
          onClick={onGoBack}
          className="flex items-center text-white py-3 px-4 rounded-lg transition-all duration-300 
             bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 
             shadow-lg transform hover:-translate-y-1 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
        </button>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-500 to-pink-500 bg-clip-text text-transparent mb-8 text-center">
          Product Details
        </h1>
        <div className="relative">
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 z-10"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          {currentIndex < shoes.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 z-10"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 transform rotate-180" />
            </button>
          )}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {shoe.name}
                  {isSoldOut() && (
                    <span className="ml-2 inline-block bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                      Sold Out
                    </span>
                  )}
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <img
                      src={images[selectedImage]}
                      alt={`${shoe.name} - View ${selectedImage + 1}`}
                      className={`w-full h-96 object-contain rounded-lg ${
                        isSoldOut() ? 'opacity-100' : ''
                      }`}
                    />
                    {isSoldOut() && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 text-white px-6 py-3 rounded-lg text-xl font-bold transform -rotate-12">
                          SOLD OUT
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>
                      <button 
                        onClick={handleShare}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                      >
                        <Share2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center mt-4">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-24 h-24 rounded-lg overflow-hidden ${
                          selectedImage === index 
                            ? 'ring-2 ring-teal-500 ring-offset-2' 
                            : 'hover:opacity-75'
                        } ${isSoldOut() ? 'opacity-100' : ''}`}
                      >
                        <img
                          src={img}
                          alt={`${shoe.name} - Thumbnail ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xl font-bold text-teal-500 text-center border-b-2 border-teal-500 pb-2">
                    Rs. {shoe.price.toLocaleString()}
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <h2 className="text-lg font-semibold mb-2">Product Details</h2>
                    <p><span className="font-medium">Brand:</span> {shoe.brand}</p>
                    <p><span className="font-medium">Color:</span> {shoe.color}</p>
                    <p><span className="font-medium">Available Sizes:</span> {shoe.sizes.join(', ')}</ p>
                    <p><span className="font-medium">Condition:</span> {shoe.description}</p>
                  </div>

                  <div className="space-y-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button 
                          className={`w-full py-3 rounded-lg transition-colors ${
                            isSoldOut() 
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-black text-white hover:bg-gray-800'
                          }`}
                          disabled={isSoldOut()}
                        >
                          {isSoldOut() ? 'Sold Out' : 'Add to Cart'}
                        </button>
                      </AlertDialogTrigger>
                      {!isSoldOut() && (
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Add to Cart</AlertDialogTitle>
                            <AlertDialogDescription>
                              Do you want to add {shoe.name} to your cart?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onAddToCart(shoe)}>
                              Add to Cart
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      )}
                    </AlertDialog>

                    <button
                      onClick={handleProceedToCheckout}
                      disabled={isSoldOut()}
                      className ={`w-full py-4 rounded-lg font-medium transition-all duration-300 
                        ${isSoldOut() 
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'text-white bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 transform hover:-translate-y-1'
                        }`}
                    >
                      {isSoldOut() ? 'Not Available' : 'Proceed to Checkout'}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;