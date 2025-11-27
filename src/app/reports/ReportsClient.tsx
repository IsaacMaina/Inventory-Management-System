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

const ReportsClient = ({ initialData }: { initialData: ReportResponse | null }) => {
  const [reportsData, setReportsData] = useState<ReportResponse | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);

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
            <p className="text-muted-foreground">Comprehensive reporting and analytics for your inventory</p>
          </div>
        </FadeIn>

        {/* Report Stats - Using mock data for now */}
        <StaggerContainer staggerAmount={0.1}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Total Reports', value: reportsData.totalReports.toString(), change: '+2.5%', icon: '📊' },
              { title: 'Created This Month', value: '5', change: '+5.3%', icon: '📅' },
              { title: 'Downloaded', value: '12', change: '-1.2%', icon: '📥' },
              { title: 'Scheduled', value: '3', change: '+3.1%', icon: '⏰' },
            ].map((stat) => (
              <StaggerItem key={stat.title}>
                <HoverCard>
                  <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <span className="text-2xl">{stat.icon}</span>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-green-400">{stat.change} from last month</p>
                    </CardContent>
                  </Card>
                </HoverCard>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* Reports Table */}
        <SlideIn direction="up">
          <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reports List</CardTitle>
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