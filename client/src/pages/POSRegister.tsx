import React, { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, X, 
  Coffee, Scissors, Heart, Dumbbell, Stethoscope, MoreHorizontal,
  User, CreditCard, Banknote, Smartphone, DollarSign, Receipt, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type Service = {
  id: string;
  name: string;
  price: number; // in cents
  description?: string;
  duration?: string;
  category: 'Beauty' | 'Fashion' | 'Salon' | 'Gym' | 'Clinic' | 'Other';
};

type CartItem = {
  service: Service;
  quantity: number;
};

// Initial services for different categories
const INITIAL_SERVICES: Service[] = [
  // Beauty
  { id: 'b1', name: 'Beard Design Session', price: 401500, description: 'Professional beard styling', duration: '30 min', category: 'Beauty' },
  { id: 'b2', name: 'Facial Treatment', price: 79900, description: '60 min facial cleansing and mask', duration: '60 min', category: 'Beauty' },
  { id: 'b3', name: 'Haircut', price: 59900, description: 'Standard haircut', duration: '45 min', category: 'Beauty' },
  
  // Salon
  { id: 'sl1', name: 'Hair Color', price: 149900, description: 'Full hair coloring service', duration: '2 hr', category: 'Salon' },
  { id: 'sl2', name: 'Hair Spa', price: 89900, description: 'Deep conditioning treatment', duration: '1 hr', category: 'Salon' },
  { id: 'sl3', name: 'Manicure & Pedicure', price: 69900, description: 'Complete nail care', duration: '1 hr', category: 'Salon' },
  
  // Spa (Fashion related services)
  { id: 'f1', name: 'Massage (30min)', price: 129900, description: 'Relaxing massage', duration: '30 min', category: 'Fashion' },
  { id: 'f2', name: 'Body Scrub', price: 99900, description: 'Full body exfoliation', duration: '45 min', category: 'Fashion' },
  
  // Gym
  { id: 'g1', name: 'Personal Training Session', price: 199900, description: 'One-on-one training', duration: '1 hr', category: 'Gym' },
  { id: 'g2', name: 'Group Class', price: 49900, description: 'Group fitness class', duration: '45 min', category: 'Gym' },
  { id: 'g3', name: 'Nutrition Consultation', price: 149900, description: 'Diet planning session', duration: '30 min', category: 'Gym' },
  
  // Clinic
  { id: 'c1', name: 'General Consultation', price: 79900, description: 'Doctor consultation', duration: '20 min', category: 'Clinic' },
  { id: 'c2', name: 'Physiotherapy Session', price: 119900, description: 'Physical therapy', duration: '45 min', category: 'Clinic' },
  { id: 'c3', name: 'Diagnostic Tests', price: 299900, description: 'Basic health checkup', duration: '30 min', category: 'Clinic' },
  
  // Wellness/Other
  { id: 'o1', name: 'Coffee Tasting Session', price: 39900, description: 'Guided coffee tasting', duration: '30 min', category: 'Other' },
  { id: 'o2', name: 'Yoga Class', price: 59900, description: 'Group yoga session', duration: '1 hr', category: 'Other' },
];

const CATEGORY_ICONS = {
  Beauty: Scissors,
  Fashion: Heart,
  Salon: Scissors,
  Gym: Dumbbell,
  Clinic: Stethoscope,
  Other: Coffee,
};

const CATEGORY_COLORS = {
  Beauty: 'from-pink-500 to-rose-500',
  Fashion: 'from-purple-500 to-indigo-500',
  Salon: 'from-amber-500 to-orange-500',
  Gym: 'from-green-500 to-emerald-500',
  Clinic: 'from-blue-500 to-cyan-500',
  Other: 'from-slate-500 to-gray-500',
};

export default function POSRegister() {
  const [, setLocation] = useLocation();
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCustomService, setShowCustomService] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [staffName, setStaffName] = useState('');
  const { toast } = useToast();

  // Custom service form
  const [customService, setCustomService] = useState({
    name: '',
    price: '',
    description: '',
    duration: '',
    category: 'Other' as Service['category'],
  });

  const categories = ['all', 'Beauty', 'Fashion', 'Salon', 'Gym', 'Clinic', 'Other'];

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, quantity]) => ({
        service: services.find(s => s.id === id)!,
        quantity,
      }))
      .filter(item => item.service);
  }, [cart, services]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.service.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.18); // 18% tax
  const total = subtotal + tax;

  const formatPrice = (cents: number) => `₹${(cents / 100).toFixed(2)}`;

  const addToCart = (serviceId: string) => {
    setCart(prev => ({
      ...prev,
      [serviceId]: (prev[serviceId] || 0) + 1,
    }));
    toast({
      title: 'Added to cart',
      description: 'Service added successfully',
    });
  };

  const updateQuantity = (serviceId: string, delta: number) => {
    setCart(prev => {
      const newQty = (prev[serviceId] || 0) + delta;
      if (newQty <= 0) {
        const { [serviceId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [serviceId]: newQty };
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart(prev => {
      const { [serviceId]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearCart = () => {
    setCart({});
    toast({
      title: 'Cart cleared',
      description: 'All items removed from cart',
    });
  };

  const handleAddCustomService = () => {
    if (!customService.name || !customService.price) {
      toast({
        title: 'Invalid service',
        description: 'Please provide name and price',
        variant: 'destructive',
      });
      return;
    }

    const priceInCents = Math.round(parseFloat(customService.price) * 100);
    
    const newService: Service = {
      id: `custom-${Date.now()}`,
      name: customService.name,
      price: priceInCents,
      description: customService.description,
      duration: customService.duration,
      category: customService.category,
    };

    setServices(prev => [newService, ...prev]);
    setShowCustomService(false);
    setCustomService({
      name: '',
      price: '',
      description: '',
      duration: '',
      category: 'Other',
    });

    toast({
      title: 'Service added',
      description: `${newService.name} has been added to services`,
    });

    // Automatically add to cart
    addToCart(newService.id);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add services before checkout',
        variant: 'destructive',
      });
      return;
    }
    setShowCheckout(true);
  };

  const handleCompleteSale = () => {
    // Validate staff name
    if (!staffName.trim()) {
      toast({
        title: 'Staff name required',
        description: 'Please enter the staff member handling this bill',
        variant: 'destructive',
      });
      return;
    }

    // Create transaction object
    const transaction = {
      id: `POS-${Date.now()}`,
      customer: { 
        name: customerName || 'Walk-in Customer',
        email: ''
      },
      items: cartItems.map(item => ({
        productId: item.service.id,
        qty: item.quantity,
        price: item.service.price,
        name: item.service.name
      })),
      date: new Date().toISOString().split('T')[0],
      amount: total,
      status: 'Completed' as const,
      staff: staffName.trim(),
      openBalance: 0,
      totalReturn: 0,
      balanceAmount: total,
      orderValue: total,
      currency: '₹',
      paymentMethod: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
    };

    // Get existing transactions from localStorage
    const existingTransactions = JSON.parse(localStorage.getItem('pos_transactions') || '[]');
    
    // Add new transaction at the beginning
    const updatedTransactions = [transaction, ...existingTransactions];
    
    // Save back to localStorage
    localStorage.setItem('pos_transactions', JSON.stringify(updatedTransactions));

    toast({
      title: 'Sale completed!',
      description: `Total: ${formatPrice(total)} - Payment recorded successfully`,
    });
    
    // Reset form
    setCart({});
    setShowCheckout(false);
    setCustomerName('');
    setStaffName('');
    setPaymentMethod('cash');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-lg shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">POS System</h1>
                <p className="text-sm text-slate-600">Service & Appointment Sales</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1 text-sm">
                {cartItems.length} items in cart
              </Badge>
              <Button
                onClick={() => setLocation('/dashboard/pos')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to POS
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filters */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm border p-4 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-brand-500 focus:ring-brand-200"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Domain:</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px] border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setShowCustomService(true)}
                  variant="outline"
                  className="ml-auto border-brand-300 text-brand-700 hover:bg-brand-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add custom service
                </Button>
              </div>
            </motion.div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredServices.map((service, index) => {
                  const Icon = CATEGORY_ICONS[service.category];
                  const gradient = CATEGORY_COLORS[service.category];
                  
                  return (
                    <motion.div
                      key={service.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{service.name}</h3>
                              <p className="text-sm text-slate-600">{service.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-slate-900">{formatPrice(service.price)}</p>
                            <p className="text-xs text-slate-500">{service.duration} • {service.category}</p>
                          </div>
                          
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => addToCart(service.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                              size="sm"
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Add Service
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredServices.length === 0 && (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No services found</p>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <motion.div 
              className="sticky top-24 bg-white rounded-xl shadow-lg border p-6 space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-brand-600" />
                  Cart
                </h2>
                {cartItems.length > 0 && (
                  <Button
                    onClick={clearCart}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Staff Name Field */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <Label htmlFor="staff-name" className="text-sm font-medium text-blue-900 mb-1 block">
                  Staff Handling Bill
                </Label>
                <Input
                  id="staff-name"
                  placeholder="Enter staff name"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                />
              </div>

              <div className="border-t pt-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">Cart is empty</p>
                    <p className="text-sm text-slate-500 mt-1">Add services to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {cartItems.map(item => (
                        <motion.div
                          key={item.service.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate">
                              {item.service.name}
                            </p>
                            <p className="text-xs text-slate-600">
                              {formatPrice(item.service.price)} × {item.quantity}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => updateQuantity(item.service.id, -1)}
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-semibold w-6 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              onClick={() => updateQuantity(item.service.id, 1)}
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => removeFromCart(item.service.id)}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <motion.div 
                  className="border-t pt-4 space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Sub Total</span>
                      <span>(Item discount included: ₹0)</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-semibold">
                      <span></span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax (18%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Round Off</span>
                      <span>₹0.00</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">(Items: {cartItems.length}, Quantity: {cartItems.reduce((s, i) => s + i.quantity, 0)})</p>
                      <p className="text-2xl font-bold text-brand-600">{formatPrice(total)}</p>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white shadow-lg text-lg py-6"
                    >
                      <Receipt className="mr-2 h-5 w-5" />
                      Cash [€]
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Custom Service Dialog */}
      <Dialog open={showCustomService} onOpenChange={setShowCustomService}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-600" />
              Add Custom Service
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="service-name">Service Name *</Label>
              <Input
                id="service-name"
                placeholder="e.g., Special Massage Package"
                value={customService.name}
                onChange={(e) => setCustomService({ ...customService, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="service-price">Price (₹) *</Label>
                <Input
                  id="service-price"
                  type="number"
                  placeholder="0.00"
                  value={customService.price}
                  onChange={(e) => setCustomService({ ...customService, price: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-duration">Duration</Label>
                <Input
                  id="service-duration"
                  placeholder="e.g., 1 hr"
                  value={customService.duration}
                  onChange={(e) => setCustomService({ ...customService, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="service-category">Category</Label>
              <Select 
                value={customService.category} 
                onValueChange={(value) => setCustomService({ ...customService, category: value as Service['category'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Salon">Salon</SelectItem>
                  <SelectItem value="Gym">Gym</SelectItem>
                  <SelectItem value="Clinic">Clinic</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="service-description">Description</Label>
              <Textarea
                id="service-description"
                placeholder="Brief description of the service"
                value={customService.description}
                onChange={(e) => setCustomService({ ...customService, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomService(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomService} className="bg-brand-600 hover:bg-brand-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax (18%):</span>
                <span className="font-semibold">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-brand-600">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customer-name">Customer Name (Optional)</Label>
              <Input
                id="customer-name"
                placeholder="Walk-in Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card
                    </div>
                  </SelectItem>
                  <SelectItem value="upi">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      UPI
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteSale}
              className="bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
