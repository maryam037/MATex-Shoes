import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Truck, MapPin, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CheckoutPage = ({ cart, onClose, removeFromCart, onViewProduct, markProductsAsSold }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    paymentMethod: 'COD',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Submitting order...'); // Debug log

      const orderDetails = {
        ...formData,
        total: calculateTotal(),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price
        }))
      };

      const response = await fetch('http://localhost:3001/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderDetails,
          soldProducts: cart.map(item => item.id)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to place order');
      }

      const data = await response.json();
      console.log('Success response:', data);
      
      // Handle success
      markProductsAsSold(cart);
      setShowSuccessDialog(true);

    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    navigate('/');
    window.location.reload(); // Force refresh the page
  };

  // Effect for scrolling to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="pt-20 px-4 max-w-6xl mx-auto">
        <button
          onClick={onClose}
          className="flex items-center text-white py-3 px-4 rounded-lg transition-all duration-300 
                     bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 
                     shadow-lg transform hover:-translate-y-1 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
        </button>

        <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-500 to-pink-500 bg-clip-text text-transparent mb-8 text-center">
          Checkout
        </h1>

        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order Placed Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Thank you for shopping with us. You will receive a confirmation email soon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseSuccessDialog}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Package className="mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.cartId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div 
                        className="flex-grow cursor-pointer hover:text-teal-600 transition-colors duration-200"
                        onClick={() => onViewProduct(item)}
                      >
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.brand}</p>
                        <p className="font-medium">Rs. {item.price.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.cartId);
                        }}
                        className="text-red-500 font-medium hover:text-red-700 ml-4"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="pt-4 border-t mt-4 bg-gradient-to-r from-teal-50 to-pink-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-lg">Total</p>
                      <p className="font-bold text-lg">Rs. {calculateTotal().toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Information */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center">
                <MapPin className="mr-2" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 hover:border-teal-300 transition-colors duration-200"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 hover:border-teal-300 transition-colors duration-200"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Name@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 hover:border-teal-300 transition-colors duration-200"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+92 XXX XXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Shipping Address</label>
                    <textarea
                      required
                      rows="3"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 hover:border-teal-300 transition-colors duration-200"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Enter your complete address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 hover:border-teal-300 transition-colors duration-200"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Your city"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                    <textarea
                      rows="2"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 hover:border-teal-300 transition-colors duration-200"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any special instructions for delivery"
                    />
                  </div>



                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Payment Method</label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="COD"
                          checked={formData.paymentMethod === 'COD'}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="text-teal-500 focus:ring-teal-500"
                        />
                        <span>Cash on Delivery</span>
                      </label>
                      <label className="flex items-center space-x-2">
  <input
    type="radio"
    value="Online Payment"
    checked={formData.paymentMethod === 'Online Payment'}
    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
    className="text-teal-500 focus:ring-teal-500"
    disabled // This disables the button
  />
  <span>Online Payment(Unfortunately not yet available)</span>
</label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || cart.length === 0}
                    className={`w-full py-4 rounded-lg text-white font-medium transition-all duration-300 
                      ${isSubmitting || cart.length === 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 transform hover:-translate-y-1'
                      }`}
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
