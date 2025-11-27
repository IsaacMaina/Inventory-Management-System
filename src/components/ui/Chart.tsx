'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface BarChartComponentProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  title: string;
  color: string;
}

export const AnimatedBarChart = ({ data, dataKey, nameKey, title, color }: BarChartComponentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-80"
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
          <XAxis dataKey={nameKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              borderColor: '#374151',
              borderRadius: '0.5rem',
              color: '#f9fafb'
            }} 
          />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} animationBegin={300} animationDuration={1000} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

interface AreaChartComponentProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  title: string;
  color: string;
}

export const AnimatedAreaChart = ({ data, dataKey, nameKey, title, color }: AreaChartComponentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full h-80"
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
          <XAxis dataKey={nameKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              borderColor: '#374151',
              borderRadius: '0.5rem',
              color: '#f9fafb'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            fill={color} 
            fillOpacity={0.3}
            animationBegin={300} 
            animationDuration={1000} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

interface PieChartComponentProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  title: string;
  colors: string[];
}

export const AnimatedPieChart = ({ data, dataKey, nameKey, title, colors }: PieChartComponentProps) => {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-80 flex flex-col items-center"
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            animationBegin={300}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              borderColor: '#374151',
              borderRadius: '0.5rem',
              color: '#f9fafb'
            }} 
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};