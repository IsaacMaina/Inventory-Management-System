'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BaseLayout from '@/components/layout/BaseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StaggerContainer, StaggerItem, FadeIn, SlideIn } from '@/components/animations/FramerAnimations';
import { HoverCard } from '@/components/animations/HoverAnimations';
import { AnimatedBarChart, AnimatedAreaChart, AnimatedPieChart } from '@/components/ui/Chart';
import { AnalyticsSkeleton } from '@/components/ui/AnalyticsSkeleton';
import { Pagination } from '@/components/ui/Pagination';

interface AnalyticsMetric {
  title: string;
  value: string;
  change: string;
  icon: string;
}

interface CategoryDistribution {
  name: string;
  value: number;
  count: number;
  totalValue: number;
  avgPrice: number;
}

interface ProductPerformance {
  name: string;
  quantity: number;
}

interface TransactionHistory {
  date: string;
  count: number;
}

interface InventoryTrend {
  date: string;
  value: number;
}

interface AnalyticsData {
  analyticsMetrics: AnalyticsMetric[];
  inventoryTrends: InventoryTrend[];
  categoryDistribution: CategoryDistribution[];
  productPerformance: ProductPerformance[];
  transactionHistory: TransactionHistory[];
}

const AnalyticsClient = ({ initialData }: { initialData: AnalyticsData | null }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);

  // Pagination states for inventory summary table
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    // If initial data was provided from the server, use it
    if (initialData) {
      setAnalyticsData(initialData);
      setIsLoading(false);
    } else {
      // If no initial data was provided, fetch it from the API as a fallback
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/analytics');
          const data = await response.json();
          setAnalyticsData(data);
        } catch (error) {
          console.error('Error fetching analytics data:', error);
          // Set default data in case of error
          setAnalyticsData({
            analyticsMetrics: [
              { title: 'Total Inventory Value', value: '$0', change: '0%', icon: '💰' },
              { title: 'Stock Transactions Today', value: '0', change: '0%', icon: '📊' },
              { title: 'Low Stock Items', value: '0 Items', change: '0%', icon: '⚠️' },
              { title: 'Top Category', value: 'No data', change: '0%', icon: ' topped ' },
            ],
            inventoryTrends: [],
            categoryDistribution: [],
            productPerformance: [],
            transactionHistory: []
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [initialData]);

  if (isLoading || !analyticsData) {
    return (
      <BaseLayout>
        <div className="p-4 md:p-6">
          <AnalyticsSkeleton />
        </div>
      </BaseLayout>
    );
  }

  const { analyticsMetrics, inventoryTrends, categoryDistribution, productPerformance, transactionHistory } = analyticsData;

  // Pagination logic for inventory summary table
  const totalItems = categoryDistribution?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedCategoryDistribution = categoryDistribution?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  ) || [];

  // Colors for charts
  const primaryColor = '#3b82f6';
  const secondaryColor = '#8b5cf6';
  const successColor = '#10b981';
  const warningColor = '#f59e0b';
  const categoryColors = [primaryColor, secondaryColor, successColor, warningColor, '#ef4444', '#ec4899', '#06b6d4'];

  return (
    <BaseLayout>
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Detailed analytics and insights for your inventory</p>
          </div>
        </FadeIn>

        {/* Analytics Metrics */}
        <StaggerContainer staggerAmount={0.1}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {analyticsMetrics.map((metric) => (
              <StaggerItem key={metric.title}>
                <HoverCard>
                  <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                      <span className="text-2xl">{metric.icon}</span>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <p className="text-xs text-green-400">{metric.change} from last period</p>
                    </CardContent>
                  </Card>
                </HoverCard>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Inventory Trends */}
          <SlideIn direction="up">
            <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md h-full">
              <CardHeader>
                <CardTitle>Inventory Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {inventoryTrends && inventoryTrends.length > 0 ? (
                  <AnimatedAreaChart
                    data={inventoryTrends}
                    dataKey="value"
                    nameKey="date"
                    title="Inventory Value Over Time"
                    color={primaryColor}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No inventory trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </SlideIn>

          {/* Category Distribution */}
          <SlideIn direction="up">
            <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md h-full">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryDistribution && categoryDistribution.length > 0 ? (
                  <AnimatedPieChart
                    data={categoryDistribution.slice(0, 6)} // Limit to top 6 categories
                    dataKey="value"
                    nameKey="name"
                    title="Main Categories Distribution"
                    colors={categoryColors}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No category distribution data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </SlideIn>
        </div>

        {/* Additional Analytics */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Product Performance */}
          <SlideIn direction="up">
            <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Product Performance by Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                {productPerformance && productPerformance.length > 0 ? (
                  <AnimatedBarChart
                    data={productPerformance.slice(0, 5)} // Limit to top 5 products
                    dataKey="quantity"
                    nameKey="name"
                    title="Top 5 Products by Quantity"
                    color={successColor}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No product performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </SlideIn>

          {/* Transaction History */}
          <SlideIn direction="up">
            <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionHistory && transactionHistory.length > 0 ? (
                  <AnimatedBarChart
                    data={transactionHistory}
                    dataKey="count"
                    nameKey="date"
                    title="Transactions by Date"
                    color={warningColor}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No transaction history data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </SlideIn>
        </div>

        {/* Detailed Analytics Table */}
        <SlideIn direction="up">
          <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Category</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Items Count</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Total Value</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Avg. Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryDistribution && categoryDistribution.length > 0 ? (
                      paginatedCategoryDistribution.map((item, index) => (
                        <tr key={item.name} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium">{item.name}</td>
                          <td className="py-3 px-4 text-sm">{typeof item.count === 'number' ? item.count.toLocaleString() : '0'}</td>
                          <td className="py-3 px-4 text-sm">{typeof item.totalValue === 'number' ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.totalValue) : new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)}</td>
                          <td className="py-3 px-4 text-sm">{typeof item.avgPrice === 'number' ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.avgPrice) : new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-center text-gray-500">
                          No category data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls for inventory summary */}
              {totalPages > 1 && (
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={[5, 10, 20, 50]}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </BaseLayout>
  );
};

export default AnalyticsClient;