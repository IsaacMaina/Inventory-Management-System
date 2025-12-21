'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BaseLayout from '@/components/layout/BaseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StaggerContainer, StaggerItem, FadeIn, SlideIn } from '@/components/animations/FramerAnimations';
import { HoverCard } from '@/components/animations/HoverAnimations';
import { AnimatedBarChart, AnimatedAreaChart, AnimatedPieChart } from '@/components/ui/Chart';
import { ReportsSkeleton } from '@/components/ui/ReportsSkeleton';
import { Report, ReportResponse } from '@/lib/actions/reports';
import { Pagination } from '@/components/ui/Pagination';
import { getDailySalesReport, getSalesByCashierReport, getSalesByPaymentMethodReport, getTopSellingProducts, getProfitReport, getSalesSummary } from '@/lib/actions/posAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Calendar, TrendingUp, CreditCard, User, ShoppingCart } from 'lucide-react';

const ReportsClient = ({ initialData }: { initialData: ReportResponse | null }) => {
  const [reportsData, setReportsData] = useState<ReportResponse | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);

  // POS reports state
  const [posReportsData, setPosReportsData] = useState<any>(null);
  const [isPosLoading, setIsPosLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    // If no initial data was provided, fetch it
    if (!initialData) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/reports');
          const data = await response.json();
          setReportsData(data);
        } catch (error) {
          console.error('Error fetching reports data:', error);
          // Set default data in case of error
          setReportsData({
            reports: [],
            totalReports: 0
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [initialData]);

  // Fetch POS reports when date range changes
  useEffect(() => {
    const fetchPosReports = async () => {
      setIsPosLoading(true);
      try {
        const dailySales = await getDailySalesReport(dateRange.start, dateRange.end);
        const salesByMethod = await getSalesByPaymentMethodReport(dateRange.start, dateRange.end);
        const topProducts = await getTopSellingProducts(dateRange.start, dateRange.end);
        const salesSummary = await getSalesSummary(dateRange.start, dateRange.end);

        setPosReportsData({
          dailySales,
          salesByMethod,
          topProducts,
          salesSummary
        });
      } catch (error) {
        console.error('Error fetching POS reports:', error);
        setPosReportsData(null);
      } finally {
        setIsPosLoading(false);
      }
    };

    fetchPosReports();
  }, [dateRange]);

  if (isLoading || !reportsData) {
    return (
      <BaseLayout>
        <div className="p-4 md:p-6">
          <ReportsSkeleton />
        </div>
      </BaseLayout>
    );
  }

  // Pagination logic
  const totalReports = reportsData.totalReports || reportsData.reports.length;
  const totalPages = Math.ceil(totalReports / pageSize);
  const paginatedReports = reportsData.reports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <BaseLayout>
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive reporting and analytics for your inventory and sales</p>
          </div>
        </FadeIn>

        {/* Date Range Selector */}
        <SlideIn direction="up">
          <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Date Range:</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange({...dateRange, start: new Date(e.target.value)})}
                    className="px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="flex items-center">to</span>
                  <input
                    type="date"
                    value={dateRange.end.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange({...dateRange, end: new Date(e.target.value)})}
                    className="px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* POS Sales Stats */}
        {posReportsData && !isPosLoading && (
          <StaggerContainer staggerAmount={0.1}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Total Sales', value: posReportsData.salesSummary.totalSales.toString(), change: '+2.5%', icon: '🛒', iconColor: 'text-blue-400' },
                { title: 'Total Revenue', value: formatCurrency(posReportsData.salesSummary.totalAmount / 100), change: '+8.2%', icon: '💵', iconColor: 'text-green-400' },
                { title: 'Avg. Sale Value', value: formatCurrency(posReportsData.salesSummary.averageSaleValue / 100), change: '+1.3%', icon: '💰', iconColor: 'text-purple-400' },
                { title: 'Top Selling Product', value: posReportsData.topProducts[0]?.productName || 'N/A', change: '+5.1%', icon: '🔥', iconColor: 'text-red-400' },
              ].map((stat, index) => (
                <StaggerItem key={stat.title}>
                  <HoverCard>
                    <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md h-full">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <span className={`text-2xl ${stat.iconColor}`}>{stat.icon}</span>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-green-400">{stat.change} from last period</p>
                      </CardContent>
                    </Card>
                  </HoverCard>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        )}

        {/* Sales by Payment Method */}
        {posReportsData && !isPosLoading && posReportsData.salesByMethod && (
          <SlideIn direction="up">
            <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Sales by Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {posReportsData.salesByMethod.map((method: any) => (
                    <div key={method.paymentMethod} className="p-4 rounded-lg bg-gray-700/30">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium capitalize">
                          {method.paymentMethod.replace('mpesa_', 'M-Pesa ')}
                        </h4>
                        <span className="text-sm text-gray-400">{method.totalSales} sales</span>
                      </div>
                      <p className="text-lg font-bold text-green-400 mt-1">
                        {formatCurrency(method.totalAmount / 100)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        )}

        {/* Top Selling Products */}
        {posReportsData && !isPosLoading && posReportsData.topProducts && (
          <SlideIn direction="up">
            <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Product</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Quantity Sold</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posReportsData.topProducts.map((product: any, index: number) => (
                        <tr key={product.productId} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4 text-sm">
                            <div className="flex items-center">
                              <span className="mr-2 text-gray-400">#{index + 1}</span>
                              {product.productName}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">{product.totalQuantitySold}</td>
                          <td className="py-3 px-4 text-sm font-medium text-green-400">
                            {formatCurrency(product.totalRevenue / 100)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        )}

        {/* Daily Sales Trend */}
        {posReportsData && !isPosLoading && posReportsData.dailySales && (
          <SlideIn direction="up">
            <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Sales Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {posReportsData.dailySales.length > 0 ? (
                    <AnimatedAreaChart
                      data={posReportsData.dailySales.map((day: any) => ({
                        date: day.date,
                        amount: day.totalAmount / 100
                      }))}
                      dataKey="amount"
                      xKey="date"
                      title="Daily Sales Amount"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No sales data available for the selected period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        )}

        {/* Existing Reports Table */}
        <SlideIn direction="up">
          <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Report History</CardTitle>
              <span className="text-sm text-gray-400">{totalReports} reports</span>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Report Name</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Type</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Created Date</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports && paginatedReports.length > 0 ? (
                      paginatedReports.map((report) => (
                        <tr key={report.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium">{report.name}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              report.type === 'inventory'
                                ? 'bg-blue-500/20 text-blue-400'
                                : report.type === 'sales'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {report.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{new Date(report.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-sm">
                            <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-center text-gray-500">
                          No reports available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalReports}
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

export default ReportsClient;