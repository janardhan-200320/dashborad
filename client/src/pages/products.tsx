import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Package, DollarSign, Tag, MoreVertical, Search, Box } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: string;
  currency: string;
  description: string;
  category: string;
  sku: string;
  stock: string;
  isEnabled: boolean;
  createdAt: string;
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥', flag: '🇨🇳' },
  { code: 'AED', symbol: 'د.إ', flag: '🇦🇪' },
];

const getCurrencySymbol = (code: string) => {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency?.symbol || '₹';
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    currency: 'INR',
    description: '',
    category: '',
    sku: '',
    stock: '',
  });

  const categories = ['Spa Products', 'Hair Care', 'Skin Care', 'Makeup', 'Fitness Equipment', 'Supplements', 'Retail', 'Other'];

  // Recommended product templates
  const recommendedProducts: Omit<Product, 'id' | 'createdAt'>[] = [
    // Spa Products
    { name: 'Essential Oil Set', price: '1500', currency: 'INR', description: 'Premium aromatherapy essential oils collection', category: 'Spa Products', sku: 'SPA-001', stock: '50', isEnabled: true },
    { name: 'Massage Oil', price: '800', currency: 'INR', description: 'Organic therapeutic massage oil', category: 'Spa Products', sku: 'SPA-002', stock: '100', isEnabled: true },
    { name: 'Bath Bombs Set', price: '1000', currency: 'INR', description: 'Luxurious bath bombs with natural ingredients', category: 'Spa Products', sku: 'SPA-003', stock: '75', isEnabled: true },
    { name: 'Body Scrub', price: '900', currency: 'INR', description: 'Exfoliating body scrub with sea salt', category: 'Spa Products', sku: 'SPA-004', stock: '60', isEnabled: true },
    { name: 'Spa Gift Set', price: '3500', currency: 'INR', description: 'Complete spa experience gift package', category: 'Spa Products', sku: 'SPA-005', stock: '30', isEnabled: true },
    
    // Hair Care
    { name: 'Professional Shampoo', price: '1200', currency: 'INR', description: 'Salon-grade nourishing shampoo', category: 'Hair Care', sku: 'HAIR-001', stock: '120', isEnabled: true },
    { name: 'Deep Conditioning Mask', price: '1400', currency: 'INR', description: 'Intensive hair repair treatment', category: 'Hair Care', sku: 'HAIR-002', stock: '80', isEnabled: true },
    { name: 'Hair Serum', price: '1100', currency: 'INR', description: 'Anti-frizz shine serum', category: 'Hair Care', sku: 'HAIR-003', stock: '90', isEnabled: true },
    { name: 'Heat Protection Spray', price: '750', currency: 'INR', description: 'Thermal styling protectant', category: 'Hair Care', sku: 'HAIR-004', stock: '100', isEnabled: true },
    { name: 'Hair Color Kit', price: '950', currency: 'INR', description: 'Professional at-home coloring system', category: 'Hair Care', sku: 'HAIR-005', stock: '45', isEnabled: true },
    
    // Skin Care
    { name: 'Facial Cleanser', price: '850', currency: 'INR', description: 'Gentle daily face wash', category: 'Skin Care', sku: 'SKIN-001', stock: '150', isEnabled: true },
    { name: 'Vitamin C Serum', price: '1600', currency: 'INR', description: 'Brightening anti-aging serum', category: 'Skin Care', sku: 'SKIN-002', stock: '70', isEnabled: true },
    { name: 'Moisturizer SPF 30', price: '1300', currency: 'INR', description: 'Daily hydrating sunscreen', category: 'Skin Care', sku: 'SKIN-003', stock: '110', isEnabled: true },
    { name: 'Eye Cream', price: '1400', currency: 'INR', description: 'Anti-wrinkle eye treatment', category: 'Skin Care', sku: 'SKIN-004', stock: '65', isEnabled: true },
    { name: 'Face Mask Set', price: '1200', currency: 'INR', description: 'Variety pack of sheet masks', category: 'Skin Care', sku: 'SKIN-005', stock: '85', isEnabled: true },
    
    // Makeup
    { name: 'Foundation', price: '1500', currency: 'INR', description: 'Full coverage liquid foundation', category: 'Makeup', sku: 'MAKE-001', stock: '95', isEnabled: true },
    { name: 'Eyeshadow Palette', price: '1800', currency: 'INR', description: '12-shade professional palette', category: 'Makeup', sku: 'MAKE-002', stock: '60', isEnabled: true },
    { name: 'Lipstick Set', price: '1300', currency: 'INR', description: 'Long-lasting matte lipsticks', category: 'Makeup', sku: 'MAKE-003', stock: '120', isEnabled: true },
    { name: 'Makeup Brush Set', price: '2300', currency: 'INR', description: 'Professional 12-piece brush collection', category: 'Makeup', sku: 'MAKE-004', stock: '40', isEnabled: true },
    
    // Fitness Equipment
    { name: 'Yoga Mat', price: '1200', currency: 'INR', description: 'Non-slip premium yoga mat', category: 'Fitness Equipment', sku: 'FIT-001', stock: '80', isEnabled: true },
    { name: 'Resistance Bands Set', price: '850', currency: 'INR', description: '5-piece resistance training set', category: 'Fitness Equipment', sku: 'FIT-002', stock: '100', isEnabled: true },
    { name: 'Dumbbells Pair', price: '1500', currency: 'INR', description: 'Adjustable weight dumbbells', category: 'Fitness Equipment', sku: 'FIT-003', stock: '50', isEnabled: true },
    { name: 'Foam Roller', price: '950', currency: 'INR', description: 'Muscle recovery foam roller', category: 'Fitness Equipment', sku: 'FIT-004', stock: '70', isEnabled: true },
    { name: 'Jump Rope', price: '500', currency: 'INR', description: 'Speed jump rope for cardio', category: 'Fitness Equipment', sku: 'FIT-005', stock: '120', isEnabled: true },
    
    // Supplements
    { name: 'Protein Powder', price: '1900', currency: 'INR', description: 'Whey protein isolate', category: 'Supplements', sku: 'SUP-001', stock: '90', isEnabled: true },
    { name: 'Pre-Workout', price: '1400', currency: 'INR', description: 'Energy and focus supplement', category: 'Supplements', sku: 'SUP-002', stock: '75', isEnabled: true },
    { name: 'Multivitamin', price: '1100', currency: 'INR', description: 'Daily essential vitamins', category: 'Supplements', sku: 'SUP-003', stock: '150', isEnabled: true },
    { name: 'BCAA Supplement', price: '1300', currency: 'INR', description: 'Muscle recovery amino acids', category: 'Supplements', sku: 'SUP-004', stock: '85', isEnabled: true },
    
    // Retail
    { name: 'Water Bottle', price: '600', currency: 'INR', description: 'Insulated stainless steel bottle', category: 'Retail', sku: 'RET-001', stock: '200', isEnabled: true },
    { name: 'Gym Bag', price: '1500', currency: 'INR', description: 'Spacious sports duffle bag', category: 'Retail', sku: 'RET-002', stock: '60', isEnabled: true },
    { name: 'Towel Set', price: '850', currency: 'INR', description: 'Quick-dry microfiber towels', category: 'Retail', sku: 'RET-003', stock: '100', isEnabled: true },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const currentWorkspace = localStorage.getItem('currentWorkspace') || 'default';
    const stored = localStorage.getItem(`zervos_products_${currentWorkspace}`);
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  };

  const saveProducts = (updatedProducts: Product[]) => {
    const currentWorkspace = localStorage.getItem('currentWorkspace') || 'default';
    localStorage.setItem(`zervos_products_${currentWorkspace}`, JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    // Dispatch event for other components to sync
    window.dispatchEvent(new CustomEvent('products-updated'));
  };

  const handleOpenNew = () => {
    setFormData({ name: '', price: '', currency: 'INR', description: '', category: '', sku: '', stock: '' });
    setEditingProduct(null);
    setIsNewProductOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price,
      currency: product.currency,
      description: product.description,
      category: product.category,
      sku: product.sku,
      stock: product.stock,
    });
    setEditingProduct(product);
    setIsNewProductOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...formData }
          : p
      );
      saveProducts(updatedProducts);
      toast({
        title: 'Product Updated',
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      // Create new product
      const newProduct: Product = {
        id: Date.now().toString(),
        ...formData,
        isEnabled: true,
        createdAt: new Date().toISOString(),
      };
      saveProducts([...products, newProduct]);
      toast({
        title: 'Product Added',
        description: `${newProduct.name} has been added successfully.`,
      });
    }
    setIsNewProductOpen(false);
  };

  const handleDelete = () => {
    if (!deletingProduct) return;
    
    const updatedProducts = products.filter(p => p.id !== deletingProduct.id);
    saveProducts(updatedProducts);
    setIsDeleteDialogOpen(false);
    setDeletingProduct(null);
    toast({
      title: 'Product Deleted',
      description: `${deletingProduct.name} has been removed.`,
    });
  };

  const handleToggleEnabled = (id: string) => {
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, isEnabled: !p.isEnabled } : p
    );
    saveProducts(updatedProducts);
  };

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                <p className="text-gray-600 mt-1">Manage your product inventory</p>
              </div>
            </div>
          </div>
          <Button onClick={handleOpenNew} className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus size={18} />
            Add Custom Product
          </Button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </motion.div>

        {/* Products Grid */}
        <AnimatePresence mode="popLayout">
          {filteredProducts.length === 0 && products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <div className="inline-block p-6 bg-white rounded-3xl shadow-lg mb-4">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first product or load recommended templates</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleOpenNew}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </Button>
                <Button
                  onClick={() => {
                    const productsToAdd = recommendedProducts.map((product, index) => ({
                      ...product,
                      id: `rec-${Date.now()}-${index}`,
                      createdAt: new Date().toISOString(),
                    }));
                    saveProducts(productsToAdd);
                    toast({
                      title: 'Recommended Products Loaded',
                      description: `${productsToAdd.length} product templates have been added to your inventory.`,
                    });
                  }}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Load Recommended Products
                </Button>
              </div>
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-block p-6 bg-white rounded-3xl shadow-lg mb-4">
                <Search className="w-16 h-16 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No matching products</h3>
              <p className="text-gray-500">Try adjusting your search query</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 p-6 ${
                    !product.isEnabled ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                        {!product.isEnabled && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                            Disabled
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        <Tag size={12} />
                        {product.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.isEnabled}
                        onCheckedChange={() => handleToggleEnabled(product.id)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(product)}>
                            <Edit size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(product)}
                            className="text-red-600"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  )}

                  <div className="space-y-2 mb-4 pt-4 border-t border-gray-100">
                    {product.sku && (
                      <div className="flex items-center gap-2 text-sm">
                        <Box className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-500">SKU:</span>
                        <span className="text-gray-700 font-medium">{product.sku}</span>
                      </div>
                    )}
                    {product.stock && (
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-500">Stock:</span>
                        <span className="text-gray-700 font-medium">{product.stock} units</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900 font-semibold">
                        {getCurrencySymbol(product.currency)}{product.price}
                      </span>
                      <span className="text-gray-500">({product.currency})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className={`text-sm font-medium ${product.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {product.isEnabled ? '● Active' : '● Disabled'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Product Form Modal */}
        <Dialog open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product details' : 'Add a new product to your inventory'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="150"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(val) => setFormData({ ...formData, currency: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.flag} {currency.code} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="PROD-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="100"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewProductOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.name || !formData.price || !formData.category}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-600">Delete Product</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </DialogHeader>
            {deletingProduct && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete <span className="font-bold">{deletingProduct.name}</span>?
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
