// @cursor: Inventory Management - Products page
// List all products with stock levels and low stock alerts

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { SkeletonTable } from '@/components/shared/skeleton';
import { Package, Plus, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isLowStock?: boolean;
  totalSales?: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventorySummary, setInventorySummary] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // First check if table exists
      const checkResponse = await fetch('/api/products/check');
      const checkData = await checkResponse.json();
      
      if (!checkData.exists) {
        toast.error(
          checkData.isTableMissing 
            ? 'Product table not found. Please run database migration. See MIGRATION_FIX.md'
            : `Database error: ${checkData.error}`,
          { duration: 6000 }
        );
        setLoading(false);
        return;
      }
      
      // Table exists, fetch products
      const response = await fetch('/api/products');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch products' }));
        throw new Error(errorData.error || errorData.details || 'Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
      
      // Check if it's a database schema issue
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
        toast.error('Database tables not found. Please run: npx prisma migrate dev', {
          duration: 5000,
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchInventorySummary = async () => {
    try {
      const response = await fetch('/api/products/inventory?type=summary');
      if (response.ok) {
        const data = await response.json();
        setInventorySummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchInventorySummary();
  }, []);

  const lowStockProducts = products.filter(p => p.isLowStock);
  const activeProducts = products.filter(p => p.isActive);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  ← Back
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Products</h1>
                  <p className="text-sm text-gray-600">Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="p-4">
          <SkeletonTable />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                ← Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">Products</h1>
                <p className="text-sm text-gray-600">Manage inventory</p>
              </div>
            </div>
            <Button size="sm" onClick={() => router.push('/products/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Inventory Stats */}
          {inventorySummary && (
            <div className="flex items-center gap-4 pt-2 border-t text-sm">
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{inventorySummary.activeProducts}</span>
                <span className="text-gray-600">active</span>
              </div>
              {lowStockProducts.length > 0 && (
                <div className="flex items-center gap-1.5 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">{lowStockProducts.length}</span>
                  <span>low stock</span>
                </div>
              )}
              {inventorySummary.inventoryValue > 0 && (
                <div className="flex items-center gap-1.5 text-green-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">₹{inventorySummary.inventoryValue.toFixed(2)}</span>
                  <span>value</span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="p-4 pb-24">
        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="mb-4 p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-900 mb-1">
                  Low Stock Alert
                </p>
                <p className="text-sm text-orange-800">
                  {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} need restocking
                </p>
              </div>
            </div>
          </Card>
        )}

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Products Yet"
            description="Add products to track inventory, stock levels, and sales. Set low stock thresholds to get alerts when items need restocking."
            actionLabel="Add First Product"
            onAction={() => router.push('/products/add')}
          />
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <Card
                key={product.id}
                className={`p-4 ${product.isLowStock ? 'border-orange-300 bg-orange-50/50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      {product.isLowStock && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                          Low Stock
                        </span>
                      )}
                      {!product.isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {product.sku && (
                        <span>SKU: <span className="font-mono">{product.sku}</span></span>
                      )}
                      <span>Stock: <span className="font-semibold text-gray-900">{product.stockQuantity}</span> {product.unit}</span>
                      <span>Price: <span className="font-semibold text-gray-900">₹{product.price.toFixed(2)}</span></span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/products/${product.id}/edit`)}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
