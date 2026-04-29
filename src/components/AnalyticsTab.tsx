import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, Download } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { FOS_NAMES, LEAD_SOURCES, MONTHS, TERRITORIES } from '../constants';
import { exportToCSV } from '../lib/csvExport';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

export function AnalyticsTab() {
  const { calls, quotations, leads, visits } = useStore();
  const [territoryFilter, setTerritoryFilter] = React.useState<string>('all');

  const filteredQuotations = quotations.filter(q => territoryFilter === 'all' || q.territory === territoryFilter);
  const filteredLeads = leads.filter(l => territoryFilter === 'all' || l.territory === territoryFilter);
  const filteredVisits = visits.filter(v => territoryFilter === 'all' || v.territory === territoryFilter);
  const filteredCalls = calls.filter(c => territoryFilter === 'all' || c.territory === territoryFilter);

  const handleExportAll = () => {
    if (filteredQuotations.length > 0) exportToCSV(filteredQuotations, "All_Quotations", ["quotationNo", "customerName", "basicAmount", "status", "salesStage", "leadOwner", "createdAt", "territory"]);
    if (filteredLeads.length > 0) exportToCSV(filteredLeads, "All_Leads", ["customerName", "contactPerson", "mobileNumber", "leadType", "leadSource", "createdAt", "territory"]);
    if (filteredVisits.length > 0) exportToCSV(filteredVisits, "All_Visits", ["customerName", "contactPerson", "fosName", "visitPurpose", "status", "createdAt", "territory"]);
  };

  // Helper for formatting currency to readable Indian units (Cr/L)
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString()}`;
  };

  // 1. Quotation Status Breakdown
  const totalQuotationValue = filteredQuotations.reduce((sum, q) => sum + (Number(q.basicAmount) || 0), 0);
  const statusData = [
    { 
      name: 'Open', 
      count: filteredQuotations.filter(q => q.status === 'Open').length,
      value: filteredQuotations.filter(q => q.status === 'Open').reduce((sum, q) => sum + (Number(q.basicAmount) || 0), 0)
    },
    { 
      name: 'Close', 
      count: filteredQuotations.filter(q => q.status === 'Close').length,
      value: filteredQuotations.filter(q => q.status === 'Close').reduce((sum, q) => sum + (Number(q.basicAmount) || 0), 0)
    },
    { 
      name: 'Sale', 
      count: filteredQuotations.filter(q => q.status === 'Sale').length,
      value: filteredQuotations.filter(q => q.status === 'Sale').reduce((sum, q) => sum + (Number(q.basicAmount) || 0), 0)
    },
    { 
      name: 'Lost', 
      count: filteredQuotations.filter(q => q.status === 'Lost').length,
      value: filteredQuotations.filter(q => q.status === 'Lost').reduce((sum, q) => sum + (Number(q.basicAmount) || 0), 0)
    },
  ].filter(d => d.count > 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // 2. Monthly Quotation Trends
  const monthlyTrends = MONTHS.map(month => {
    const monthQuotes = filteredQuotations.filter(q => q.likelyMonthOfClosure === month);
    return {
      name: month.substring(0, 3),
      amount: monthQuotes.reduce((sum, q) => sum + (Number(q.basicAmount) || 0), 0),
      count: monthQuotes.length
    };
  });

  // 3. FOS Performance
  const fosPerformance = FOS_NAMES.map(name => {
    return {
      name,
      quotes: filteredQuotations.filter(q => q.leadOwner === name).length,
      visits: filteredVisits.filter(v => v.fosName === name).length,
      calls: filteredCalls.filter(c => c.fosName === name).length
    };
  }).filter(d => d.quotes > 0 || d.visits > 0 || d.calls > 0);

  // 4. Lead Source Conversion
  const leadSourceData = LEAD_SOURCES.map(source => {
    const sourceLeads = filteredLeads.filter(l => l.leadSource === source);
    return {
      name: source,
      count: sourceLeads.length
    };
  });

  // 5. Stage Distribution
  const stageData = [
    { name: 'Quote Sub', value: filteredQuotations.filter(q => q.stagePercent === 10).length },
    { name: '1st Level', value: filteredQuotations.filter(q => q.stagePercent === 20).length },
    { name: '2nd Level', value: filteredQuotations.filter(q => q.stagePercent === 50).length },
    { name: 'Approval', value: filteredQuotations.filter(q => q.stagePercent === 75).length },
    { name: 'P.O Issue', value: filteredQuotations.filter(q => q.stagePercent === 90).length },
    { name: 'Closure', value: filteredQuotations.filter(q => q.stagePercent === 100).length },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100">
        <div className="w-full md:w-64">
          <Select value={territoryFilter} onValueChange={setTerritoryFilter}>
            <SelectTrigger className="bg-indigo-50/50 border-none focus:ring-indigo-500/20 rounded-xl text-slate-700 font-bold">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Territory Filter" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="all" className="rounded-lg">All Territories</SelectItem>
              {TERRITORIES.map(t => (
                <SelectItem key={t} value={t} className="rounded-lg">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleExportAll}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl shadow-lg shadow-indigo-500/20 font-bold"
        >
          <Download className="w-4 h-4" /> Export Analytics Data
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quotation Status Breakdown */}
        <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Quotation Status Breakdown</CardTitle>
            <CardDescription className="font-medium">Current status of all generated quotations</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {statusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: any, name: string, props: any) => {
                    const { count } = props.payload;
                    return [
                      <div key={name} className="flex flex-col gap-1">
                        <span className="font-bold text-slate-800">{formatCurrency(value)}</span>
                        <span className="text-xs text-slate-500">{count} Quotations</span>
                      </div>,
                      name
                    ];
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Monthly Pipeline Forecast</CardTitle>
            <CardDescription className="font-medium">Forecasted closure value by month</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} 
                  tickFormatter={(val) => val === 0 ? '0' : (val >= 10000000 ? `${(val/10000000).toFixed(0)}Cr` : `${(val/100000).toFixed(0)}L`)}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: any) => [formatCurrency(value), 'Expected Closure']}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* FOS Performance */}
        <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">FOS Activity Analysis</CardTitle>
            <CardDescription className="font-medium">Comparative performance across FOS team</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fosPerformance} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, width: 100}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="quotes" name="Quotations" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="visits" name="Visits" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="calls" name="Calls" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Source Distribution */}
        <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Lead Source Distribution</CardTitle>
            <CardDescription className="font-medium">Where your opportunities are coming from</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadSourceData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: any) => {
                    const total = leadSourceData.reduce((sum, d) => sum + d.count, 0);
                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return [`${value} Leads (${percent}%)`, 'Contribution'];
                  }}
                />
                <Bar dataKey="count" name="Leads" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Stage Analysis */}
        <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Sales Stage Analysis</CardTitle>
            <CardDescription className="font-medium">Pipeline volume by stage</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stageData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: any) => {
                    const total = stageData.reduce((sum, d) => sum + d.value, 0);
                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return [`${value} Quotations (${percent}%)`, 'Stage Volume'];
                  }}
                />
                <Bar dataKey="value" name="Quotations" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={3} dot={{r: 6, fill: '#ec4899', strokeWidth: 2, stroke: '#fff'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
