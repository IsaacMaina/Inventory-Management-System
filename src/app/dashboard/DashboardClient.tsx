'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BaseLayout from '@/components/layout/BaseLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { StaggerContainer, StaggerItem, FadeIn, SlideIn } from '@/components/animations/FramerAnimations';
import { HoverCard, AnimatedCounter, AnimatedProgressBar } from '@/components/animations/HoverAnimations';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';

// Define types based on the server response
interface DashboardMetrics {
  totalProducts: number;
  lowStockItems: number;
  totalValue: number;
  activeSuppliers: number;
}

interface RecentActivity {
  id: string;
  action: string;
  product: string;
  time: string;
}

interface InventoryDistribution {
  name: string;
  value: number;
  color: string;
}

interface DashboardData {
  metrics: DashboardMetrics;
  recentActivity: RecentActivity[];
  inventoryDistribution: InventoryDistribution[];
}

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
};

// Format large numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Function to get icon based on metric title
const getIconForMetric = (title: string) => {
  switch(title) {
    case 'Total Products': return '📦';
    case 'Low Stock Items': return '⚠️';
    case 'Total Value': return '💰';
    case 'Active Suppliers': return '🏭';
    default: return '📊';
  }
};

// Function to get color for metric
const getColorForMetric = (title: string) => {
  switch(title) {
    case 'Total Products': return 'blue';
    case 'Low Stock Items': return 'yellow';
    case 'Total Value': return 'green';
    case 'Active Suppliers': return 'purple';
    default: return 'gray';
  }
};

const DashboardClient = ({ initialData }: { initialData: DashboardData | null }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    // If no initial data was provided, fetch it
    if (!initialData) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/dashboard');
          const data = await response.json();
          setDashboardData(data);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          // Set mock data in case of error
          setDashboardData({
            metrics: {
              totalProducts: 0,
              lowStockItems: 0,
              totalValue: 0,
              activeSuppliers: 0
            },
            recentActivity: [],
            inventoryDistribution: []
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [initialData]);

  if (isLoading || !dashboardData) {
    return (
      <BaseLayout>
        <div className="p-4 md:p-6">
          <DashboardSkeleton />
        </div>
      </BaseLayout>
    );
  }

  const { metrics, recentActivity, inventoryDistribution } = dashboardData;

  // Calculate changes for metrics (using mock changes since we don't have historical data)
  const metricsWithChanges = metrics.totalProducts > 0 ? [
    { title: 'Total Products', value: metrics.totalProducts, change: 12, icon: getIconForMetric('Total Products'), color: getColorForMetric('Total Products') },
    { title: 'Low Stock Items', value: metrics.lowStockItems, change: -3, icon: getIconForMetric('Low Stock Items'), color: getColorForMetric('Low Stock Items') },
    { title: 'Total Value', value: metrics.totalValue, change: 8.2, icon: getIconForMetric('Total Value'), color: getColorForMetric('Total Value') },
    { title: 'Active Suppliers', value: metrics.activeSuppliers, change: 5, icon: getIconForMetric('Active Suppliers'), color: getColorForMetric('Active Suppliers') },
  ] : [
    { title: 'Total Products', value: 0, change: 0, icon: '📦', color: 'blue' },
    { title: 'Low Stock Items', value: 0, change: 0, icon: '⚠️', color: 'yellow' },
    { title: 'Total Value', value: 0, change: 0, icon: '💰', color: 'green' },
    { title: 'Active Suppliers', value: 0, change: 0, icon: '🏭', color: 'purple' },
  ];

  return (
    <BaseLayout>
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your inventory today.</p>
          </div>
        </FadeIn>

        {/* Metrics Grid */}
        <StaggerContainer staggerAmount={0.1}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metricsWithChanges.map((metric) => (
              <StaggerItem key={metric.title}>
                <HoverCard>
                  <Card className="glass bg-gradient-subtle backdrop-blur-md h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                      <span className={`text-2xl ${
                        metric.color === 'blue' ? 'text-blue-400' :
                        metric.color === 'yellow' ? 'text-yellow-400' :
                        metric.color === 'green' ? 'text-green-400' :
                        metric.color === 'purple' ? 'text-purple-400' :
                        'text-gray-400'
                      }`}>
                        {metric.icon}
                      </span>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metric.title === 'Total Value' ? formatCurrency(metric.value) : formatNumber(metric.value)}
                      </div>
                      <p className={`text-xs ${
                        metric.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}% from last month
                      </p>
                    </CardContent>
                  </Card>
                </HoverCard>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* Charts and Activity Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Inventory Distribution */}
          <SlideIn direction="up">
            <Card className="glass bg-gradient-subtle backdrop-blur-md h-full">
              <CardHeader>
                <CardTitle>Inventory Distribution</CardTitle>
                <CardDescription>Breakdown of inventory by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryDistribution.map((item, index) => (
                    <FadeIn key={item.name} delay={0.1 * index}>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm font-medium">{item.value}%</span>
                        </div>
                        <AnimatedProgressBar progress={item.value} className="h-2" />
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SlideIn>

          {/* Recent Activity */}
          <SlideIn direction="up">
            <Card className="glass bg-gradient-subtle backdrop-blur-md h-full">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest inventory updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <FadeIn key={activity.id} delay={0.1 * index}>
                      <div className="flex items-start pb-4 last:pb-0">
                        <div className="rounded-full bg-blue-500/20 p-2 mr-3">
                          <div className="bg-blue-500 w-2 h-2 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-400">{activity.product}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        </div>

        {/* Performance Metrics */}
        <SlideIn direction="up">
          <Card className="glass bg-gradient-subtle backdrop-blur-md">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg glass">
                  <div className="text-3xl font-bold text-green-400">94%</div>
                  <p className="text-sm text-gray-400 mt-1">Inventory Accuracy</p>
                </div>
                <div className="text-center p-4 rounded-lg glass">
                  <div className="text-3xl font-bold text-blue-400">3.2x</div>
                  <p className="text-sm text-gray-400 mt-1">Turnover Rate</p>
                </div>
                <div className="text-center p-4 rounded-lg glass">
                  <div className="text-3xl font-bold text-purple-400">98%</div>
                  <p className="text-sm text-gray-400 mt-1">On-Time Delivery</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </BaseLayout>
  );
};

export default DashboardClient;