import React, { useState, useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { 
  Phone, 
  Users, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  MapPin,
  Mail,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  Pencil,
  FileText,
  Target,
  Briefcase,
  Trash2,
  Database,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, isWithinInterval, isBefore, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { CALL_TYPES, CALL_STATUSES, ENGINE_MAKES, FOLLOW_UP_TYPES, FOS_NAMES } from './constants';
import { CallType, CallStatus } from './types';
import { motion, AnimatePresence } from 'framer-motion';

import { QuotationsTab } from './components/QuotationsTab';
import { LeadsTab } from './components/LeadsTab';
import { VisitsTab } from './components/VisitsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { FosTargetsTab } from './components/FosTargetsTab';
import { BulkUploadDialog } from './components/BulkUploadDialog';
import { DataManagementTab } from './components/DataManagementTab';

export default function App() {
  const { 
    calls, addCall, bulkAddCalls, updateCall, deleteCall, 
    quotations, addQuotation, bulkAddQuotations, updateQuotation, deleteQuotation,
    leads, addLead, bulkAddLeads, updateLead, deleteLead,
    visits, addVisit, bulkAddVisits, updateVisit, deleteVisit,
    stats, isLoaded 
  } = useStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingCallId, setEditingCallId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [callsPage, setCallsPage] = useState(1);
  const callsPerPage = 50;

  const [formData, setFormData] = useState({
    customerName: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    location: '',
    dgSetDetails: {
      kva: '',
      engineMake: 'Cummins',
      esn: '',
    },
    partNo: '',
    partDesc: '',
    partCategory: '',
    fosName: '',
    followUpType: '',
    callType: 'Warm Call' as CallType,
    status: 'Pending' as CallStatus,
    remarks: '',
    followUpDate: undefined as Date | undefined,
    appointmentDate: undefined as Date | undefined,
    appointmentTime: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500); // Show splash for 3.5 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl rotate-45" />
          <p className="font-bold text-indigo-600/50">Tracking Workspace...</p>
        </div>
      </div>
    );
  }
  
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const nextWeekStart = addWeeks(weekStart, 1);
  const nextWeekEnd = endOfWeek(nextWeekStart);

  const meetingsThisWeek = calls.filter(c => 
    c.appointmentDate && 
    isWithinInterval(parseISO(c.appointmentDate), { start: weekStart, end: weekEnd })
  ).length;

  const meetingsNextWeek = calls.filter(c => 
    c.appointmentDate && 
    isWithinInterval(parseISO(c.appointmentDate), { start: nextWeekStart, end: nextWeekEnd })
  ).length;

  const pendingFollowUps = calls.filter(c => 
    c.followUpDate && 
    (isBefore(parseISO(c.followUpDate), now) || isSameDay(parseISO(c.followUpDate), now)) &&
    c.status !== 'Completed'
  ).length;

  const resetForm = () => {
    setFormData({
      customerName: '',
      contactPerson: '',
      phoneNumber: '',
      email: '',
      location: '',
      dgSetDetails: { kva: '', engineMake: 'Cummins', esn: '' },
      partNo: '',
      partDesc: '',
      partCategory: '',
      fosName: '',
      followUpType: '',
      callType: 'Warm Call',
      status: 'Pending',
      remarks: '',
      followUpDate: undefined,
      appointmentDate: undefined,
      appointmentTime: '',
    });
    setEditingCallId(null);
  };

  const handleEdit = (call: any) => {
    setFormData({
      customerName: call.customerName,
      contactPerson: call.contactPerson,
      phoneNumber: call.phoneNumber,
      email: call.email,
      location: call.location,
      dgSetDetails: { ...call.dgSetDetails },
      partNo: call.partNo || '',
      partDesc: call.partDesc || '',
      partCategory: call.partCategory || '',
      fosName: call.fosName || '',
      followUpType: call.followUpType || '',
      callType: call.callType,
      status: call.status,
      remarks: call.remarks,
      followUpDate: call.followUpDate ? parseISO(call.followUpDate) : undefined,
      appointmentDate: call.appointmentDate ? parseISO(call.appointmentDate) : undefined,
      appointmentTime: call.appointmentTime || '',
    });
    setEditingCallId(call.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const callData = {
      ...formData,
      followUpDate: formData.followUpDate?.toISOString(),
      appointmentDate: formData.appointmentDate?.toISOString(),
    };

    if (editingCallId) {
      updateCall(editingCallId, callData);
    } else {
      addCall(callData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleBulkUploadCalls = async (data: any[]) => {
    const payloads = data.map(row => {
      if (!row['Customer Name']) return null;
      
      return {
        customerName: row['Customer Name'],
        contactPerson: row['Contact Person'] || '',
        phoneNumber: row['Phone Number'] || '',
        email: row['Email'] || '',
        location: row['Location'] || '',
        dgSetDetails: {
          kva: row['KVA Rating'] || '',
          engineMake: row['Engine Make'] || 'Cummins',
          esn: row['ESN'] || ''
        },
        partNo: row['Part No'] || '',
        partDesc: row['Part Desc'] || '',
        partCategory: row['Part Category'] || '',
        fosName: row['FOS Name'] || '',
        followUpType: row['Follow up Type'] || '',
        callType: (row['Call Type'] as CallType) || 'Warm Call',
        status: (row['Status'] as CallStatus) || 'Pending',
        remarks: row['Remarks'] || '',
        followUpDate: row['Follow-up Date'] ? new Date(row['Follow-up Date']).toISOString() : undefined,
        appointmentDate: row['Appointment Date'] ? new Date(row['Appointment Date']).toISOString() : undefined,
        appointmentTime: row['Appointment Time'] || '',
      };
    }).filter(Boolean);

    if (payloads.length > 0) {
      await bulkAddCalls(payloads as any);
    }
  };

  const filteredCalls = calls.filter(call => 
    call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCallsPages = Math.ceil(filteredCalls.length / callsPerPage);
  const paginatedCalls = filteredCalls.slice((callsPage - 1) * callsPerPage, callsPage * callsPerPage);

  const getStatusIcon = (status: CallStatus) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: CallStatus) => {
    switch (status) {
      case 'Completed': return <Badge variant="outline" className="bg-emerald-500 text-white border-none shadow-sm shadow-emerald-200">Completed</Badge>;
      case 'In Progress': return <Badge variant="outline" className="bg-indigo-500 text-white border-none shadow-sm shadow-indigo-200">In Progress</Badge>;
      case 'Cancelled': return <Badge variant="outline" className="bg-rose-500 text-white border-none shadow-sm shadow-rose-200">Cancelled</Badge>;
      default: return <Badge variant="outline" className="bg-amber-500 text-white border-none shadow-sm shadow-amber-200">Pending</Badge>;
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center text-white p-6 overflow-hidden"
          >
            {/* Elegant Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center space-y-8 relative z-10"
            >
              <div className="relative">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: "backOut" }}
                  className="w-28 h-28 bg-white rounded-[2rem] mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)]"
                >
                  <Phone className="w-14 h-14 text-[#020617]" />
                </motion.div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border border-dashed border-indigo-500/30 rounded-full pointer-events-none"
                />
              </div>

              <div className="space-y-3">
                <motion.h1 
                  initial={{ letterSpacing: "0.2em", opacity: 0 }}
                  animate={{ letterSpacing: "0em", opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
                >
                  Ethen Power Solutionns
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-indigo-400 font-bold tracking-[0.4em] uppercase text-xs"
                >
                  BD Tracker Dashboard
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="pt-12"
              >
                <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">
                  Powered By <span className="text-white border-b border-indigo-500/50 pb-0.5">Fawwaz Creations</span>
                </p>
              </motion.div>
            </motion.div>

            {/* Progress line */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-slate-800">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar / Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 p-6 z-10 hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-1 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/30">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight leading-tight uppercase text-slate-900">Ethen Power</h1>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-0.5">Solutionns</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <Button 
            variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 transition-all duration-300 h-12 rounded-xl border border-transparent font-semibold",
              activeTab === 'dashboard' ? "bg-indigo-50 text-indigo-700 shadow-sm border-indigo-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => setActiveTab('dashboard')}
          >
            <Users className="w-4 h-4" /> <span className="text-sm">Dashboard</span>
          </Button>
          <Button 
            variant={activeTab === 'calls' ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 transition-all duration-300 h-12 rounded-xl border border-transparent font-semibold",
              activeTab === 'calls' ? "bg-indigo-50 text-indigo-700 shadow-sm border-indigo-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => setActiveTab('calls')}
          >
            <Phone className="w-4 h-4" /> <span className="text-sm">Call Management</span>
          </Button>
          <Button 
            variant={activeTab === 'quotations' ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 transition-all duration-300 h-12 rounded-xl border border-transparent font-semibold",
              activeTab === 'quotations' ? "bg-indigo-50 text-indigo-700 shadow-sm border-indigo-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => setActiveTab('quotations')}
          >
            <FileText className="w-4 h-4" /> <span className="text-sm">Quotations</span>
          </Button>
          <Button 
            variant={activeTab === 'analytics' ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 transition-all duration-300 h-12 rounded-xl border border-transparent font-semibold",
              activeTab === 'analytics' ? "bg-indigo-50 text-indigo-700 shadow-sm border-indigo-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => setActiveTab('analytics')}
          >
            <Clock className="w-4 h-4" /> <span className="text-sm">Analytics</span>
          </Button>
          <Button 
            variant={activeTab === 'leads' ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 transition-all duration-300 h-12 rounded-xl border border-transparent font-semibold",
              activeTab === 'leads' ? "bg-indigo-50 text-indigo-700 shadow-sm border-indigo-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => setActiveTab('leads')}
          >
            <Target className="w-4 h-4" /> <span className="text-sm">Leads</span>
          </Button>
          <Button 
            variant={activeTab === 'visits' ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 transition-all duration-300 h-12 rounded-xl border border-transparent font-semibold",
              activeTab === 'visits' ? "bg-indigo-50 text-indigo-700 shadow-sm border-indigo-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => setActiveTab('visits')}
          >
            <Briefcase className="w-4 h-4" /> <span className="text-sm">FOS Visits</span>
          </Button>
          <Button 
            variant={activeTab === 'targets' ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 transition-all duration-300 h-12 rounded-xl border border-transparent font-semibold",
              activeTab === 'targets' ? "bg-indigo-50 text-indigo-700 shadow-sm border-indigo-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => setActiveTab('targets')}
          >
            <Target className="w-4 h-4" /> <span className="text-sm">FOS Targets</span>
          </Button>
          <Button 
            variant={activeTab === 'appointments' ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 transition-all duration-300 h-12 rounded-xl border border-transparent font-semibold",
              activeTab === 'appointments' ? "bg-indigo-50 text-indigo-700 shadow-sm border-indigo-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => setActiveTab('appointments')}
          >
            <CalendarIcon className="w-4 h-4" /> <span className="text-sm">Appointments</span>
          </Button>
          <Button 
            variant={activeTab === 'management' ? 'secondary' : 'ghost'} 
            className={cn(
              "w-full justify-start gap-3 transition-all duration-300 h-12 rounded-xl border border-transparent font-semibold",
              activeTab === 'management' ? "bg-indigo-50 text-indigo-700 shadow-sm border-indigo-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => setActiveTab('management')}
          >
            <Database className="w-4 h-4" /> <span className="text-sm">Data Management</span>
          </Button>
        </nav>

        <div className="mt-auto pt-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 text-center">
            <p className="text-[8px] text-indigo-500 uppercase tracking-[0.4em] mb-2 font-black">Powered By</p>
            <p className="text-xs font-black text-indigo-900 tracking-widest uppercase">Fawwaz Creations</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:pl-64 p-6 md:p-10 min-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-slate-800">
              BD Tracker Dashboard
            </h2>
            <p className="text-indigo-600/80 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
              {activeTab === 'dashboard' ? 'Real-time business development insights.' : 
               activeTab === 'calls' ? 'Manage your customer interactions efficiently.' : 
               activeTab === 'management' ? 'System database and bulk data controls.' :
               'Your upcoming schedule at a glance.'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
            {activeTab === 'calls' && (
              <BulkUploadDialog 
                title="Calls" 
                templateHeaders={[
                  'Customer Name', 'Contact Person', 'Phone Number', 
                  'Email', 'Location', 'KVA Rating', 'Engine Make', 'ESN', 
                  'Part No', 'Part Desc', 'Part Category', 'FOS Name', 'Follow up Type',
                  'Call Type', 'Status', 'Remarks', 'Follow-up Date', 'Appointment Date', 'Appointment Time'
                ]}
                onUpload={handleBulkUploadCalls}
              />
            )}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger render={<Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 gap-3 px-8 h-12 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 border-none" />}>
                <Plus className="w-5 h-5" /> New Call Entry
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{editingCallId ? 'Edit Call Record' : 'Add New Call Record'}</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">Enter the details of the customer interaction below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</Label>
                    <Input 
                      id="customerName" 
                      placeholder="e.g. John Doe" 
                      required 
                      className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                      value={formData.customerName}
                      onChange={e => setFormData({...formData, customerName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Person</Label>
                    <Input 
                      id="contactPerson" 
                      placeholder="e.g. Jane Smith" 
                      className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                      value={formData.contactPerson}
                      onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</Label>
                    <Input 
                      id="phoneNumber" 
                      placeholder="+91 98765 43210" 
                      required 
                      className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fosName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">FOS Name</Label>
                    <div className="flex flex-col gap-2">
                      <Select 
                        value={FOS_NAMES.includes(formData.fosName) ? formData.fosName : (formData.fosName ? 'Other' : '')}
                        onValueChange={val => {
                          if (val === 'Other') {
                            setFormData({...formData, fosName: ''});
                          } else {
                            setFormData({...formData, fosName: val});
                          }
                        }}
                      >
                        <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-500/20 rounded-xl">
                          <SelectValue placeholder="Select FOS Name" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                          {FOS_NAMES.map(name => (
                            <SelectItem key={name} value={name} className="rounded-lg focus:bg-indigo-50 focus:text-indigo-700">{name}</SelectItem>
                          ))}
                          <SelectItem value="Other" className="rounded-lg focus:bg-indigo-50 focus:text-indigo-700 font-bold italic">Other (Manual Entry)</SelectItem>
                        </SelectContent>
                      </Select>
                      {(!FOS_NAMES.includes(formData.fosName) || formData.fosName === '') && (
                        <Input 
                          placeholder="Enter FOS Name" 
                          className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                          value={formData.fosName}
                          onChange={e => setFormData({...formData, fosName: e.target.value})}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-500">DG Set Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kva" className="text-xs font-bold text-slate-500 uppercase tracking-wider">KVA Rating</Label>
                      <Input 
                        id="kva" 
                        placeholder="e.g. 125" 
                        className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                        value={formData.dgSetDetails.kva}
                        onChange={e => setFormData({...formData, dgSetDetails: {...formData.dgSetDetails, kva: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="engineMake" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engine Make</Label>
                      <Select 
                        value={formData.dgSetDetails.engineMake}
                        onValueChange={val => setFormData({...formData, dgSetDetails: {...formData.dgSetDetails, engineMake: val}})}
                      >
                        <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-500/20 rounded-xl">
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                          {ENGINE_MAKES.map(make => (
                            <SelectItem key={make} value={make} className="rounded-lg focus:bg-indigo-50 focus:text-indigo-700">{make}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="esn" className="text-xs font-bold text-slate-500 uppercase tracking-wider">ESN</Label>
                      <Input 
                        id="esn" 
                        placeholder="Engine Serial Number" 
                        className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                        value={formData.dgSetDetails.esn}
                        onChange={e => setFormData({...formData, dgSetDetails: {...formData.dgSetDetails, esn: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-500">Part Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="partNo" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Part No</Label>
                      <Input 
                        id="partNo" 
                        placeholder="e.g. PN-12345" 
                        className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                        value={formData.partNo}
                        onChange={e => setFormData({...formData, partNo: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partDesc" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Part Desc</Label>
                      <Input 
                        id="partDesc" 
                        placeholder="e.g. Filter Element" 
                        className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                        value={formData.partDesc}
                        onChange={e => setFormData({...formData, partDesc: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partCategory" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Part Category</Label>
                      <Input 
                        id="partCategory" 
                        placeholder="e.g. Consumables" 
                        className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                        value={formData.partCategory}
                        onChange={e => setFormData({...formData, partCategory: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fosName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">FOS Name</Label>
                    <div className="flex flex-col gap-2">
                      <Select value={FOS_NAMES.includes(formData.fosName) ? formData.fosName : (formData.fosName ? 'Other' : '')} onValueChange={v => {
                        if (v === 'Other') {
                          setFormData({...formData, fosName: ''});
                        } else {
                          setFormData({...formData, fosName: v});
                        }
                      }}>
                        <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-500/20 rounded-xl">
                          <SelectValue placeholder="Select FOS Name" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                          {FOS_NAMES.map(name => (
                            <SelectItem key={name} value={name} className="rounded-lg">{name}</SelectItem>
                          ))}
                          <SelectItem value="Other" className="rounded-lg font-bold border-t border-slate-100 italic">Other (Manual Entry)</SelectItem>
                        </SelectContent>
                      </Select>
                      {(!FOS_NAMES.includes(formData.fosName) || formData.fosName === '') && (
                        <Input 
                          placeholder="Enter FOS Name" 
                          value={formData.fosName} 
                          onChange={e => setFormData({...formData, fosName: e.target.value})} 
                          className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="callType" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Call Type</Label>
                    <Select 
                      value={formData.callType}
                      onValueChange={val => setFormData({...formData, callType: val as CallType})}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-500/20 rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        {CALL_TYPES.map(type => (
                          <SelectItem key={type} value={type} className="rounded-lg focus:bg-indigo-50 focus:text-indigo-700">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</Label>
                    <Select 
                      value={formData.status}
                      onValueChange={val => setFormData({...formData, status: val as CallStatus})}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-500/20 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        {CALL_STATUSES.map(status => (
                          <SelectItem key={status} value={status} className="rounded-lg focus:bg-indigo-50 focus:text-indigo-700">{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followUpType" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Follow up Type</Label>
                    <Select 
                      value={formData.followUpType}
                      onValueChange={val => setFormData({...formData, followUpType: val})}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-500/20 rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        {FOLLOW_UP_TYPES.map(type => (
                          <SelectItem key={type} value={type} className="rounded-lg focus:bg-indigo-50 focus:text-indigo-700">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-up Date</Label>
                    <Popover>
                      <PopoverTrigger render={<Button variant="outline" className="w-full justify-start text-left font-normal bg-slate-50 border-slate-200 rounded-xl hover:bg-slate-100" />}>
                        <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                        {formData.followUpDate ? format(formData.followUpDate, "PPP") : <span className="text-slate-400">Pick a date</span>}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl border-slate-200 shadow-xl">
                        <Calendar
                          mode="single"
                          selected={formData.followUpDate}
                          onSelect={date => setFormData({...formData, followUpDate: date})}
                          initialFocus
                          className="rounded-xl"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Appointment Date & Time</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <Popover>
                          <PopoverTrigger render={<Button variant="outline" className="w-full justify-start text-left font-normal bg-slate-50 border-slate-200 rounded-xl hover:bg-slate-100" />}>
                            <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                            {formData.appointmentDate ? format(formData.appointmentDate, "PPP") : <span className="text-slate-400">Pick a date</span>}
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-xl border-slate-200 shadow-xl">
                            <Calendar
                              mode="single"
                              selected={formData.appointmentDate}
                              onSelect={date => setFormData({...formData, appointmentDate: date})}
                              initialFocus
                              className="rounded-xl"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="w-full sm:w-32">
                        <Input 
                          type="time" 
                          value={formData.appointmentTime}
                          onChange={e => setFormData({...formData, appointmentTime: e.target.value})}
                          className="w-full bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks</Label>
                  <Input 
                    id="remarks" 
                    placeholder="Add any specific notes here..." 
                    className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/20 rounded-xl"
                    value={formData.remarks}
                    onChange={e => setFormData({...formData, remarks: e.target.value})}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 h-12 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    {editingCallId ? 'Update Call Record' : 'Save Call Record'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Total Calls</CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center shadow-inner">
                      <Phone className="w-5 h-5 text-indigo-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-5xl font-black text-slate-900 tracking-tight">{stats.totalCalls}</div>
                    <p className="text-xs font-medium text-slate-500 mt-2">Lifetime total interactions</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Total Quotations</CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-inner">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-5xl font-black text-slate-900 tracking-tight">{stats.totalQuotations}</div>
                    <p className="text-xs font-medium text-slate-500 mt-2">Active quotes in pipeline</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Overall Quote Value</CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shadow-inner">
                      <span className="text-lg font-bold text-emerald-600">₹</span>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-4xl font-black text-slate-900 tracking-tight leading-tight">₹{stats.totalQuotationValue.toLocaleString()}</div>
                    <p className="text-xs font-medium text-slate-500 mt-2">Combined total basics</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Total Leads</CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-inner">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-5xl font-black text-slate-900 tracking-tight">{stats.totalLeads}</div>
                    <p className="text-xs font-medium text-slate-500 mt-2">New opportunities</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">FOS Visits</CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shadow-inner">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-5xl font-black text-slate-900 tracking-tight">{stats.totalVisits}</div>
                    <p className="text-xs font-medium text-slate-500 mt-2">Field operations</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Today's Follow-ups</CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shadow-inner">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-5xl font-black text-slate-900 tracking-tight">{stats.todayFollowUps}</div>
                    <p className="text-xs font-medium text-slate-500 mt-2">Scheduled for today</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Meeting Appointments</CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shadow-inner">
                      <CalendarIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-5xl font-black text-slate-900 tracking-tight">{stats.meetingAppointments}</div>
                    <p className="text-xs font-medium text-slate-500 mt-2">Upcoming site visits/meetings</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Quick Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-800">Recent Interactions</CardTitle>
                    <CardDescription className="font-medium text-slate-500">Latest calls and updates from your team.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {calls.slice(0, 5).map((call) => (
                        <div key={call.id} className="flex items-start gap-4 group p-3 rounded-xl hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-100">
                          <div className="mt-1 p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                            {getStatusIcon(call.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-slate-800 truncate">{call.customerName}</p>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{format(parseISO(call.createdAt), 'MMM d, HH:mm')}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">{call.callType}</p>
                            <p className="text-xs font-medium text-slate-500 mt-1.5 line-clamp-1 italic bg-slate-50 p-2 rounded-lg border border-slate-100 group-hover:bg-white transition-colors">"{call.remarks}"</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors mt-2" />
                        </div>
                      ))}
                      {calls.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                          <Phone className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          <p className="font-medium">No recent activity found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-800">Upcoming Appointments</CardTitle>
                    <CardDescription className="font-medium text-slate-500">Scheduled meetings and site visits.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {calls
                        .filter(c => c.appointmentDate && parseISO(c.appointmentDate) >= new Date())
                        .sort((a, b) => parseISO(a.appointmentDate!).getTime() - parseISO(b.appointmentDate!).getTime())
                        .slice(0, 5)
                        .map((call) => (
                          <div key={call.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors group">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{call.customerName}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-xs font-semibold text-slate-600">{format(parseISO(call.appointmentDate!), 'PPP')}</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-bold shadow-sm">
                              {call.callType}
                            </Badge>
                          </div>
                        ))}
                      {calls.filter(c => c.appointmentDate && parseISO(c.appointmentDate) >= new Date()).length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                          <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          <p className="font-medium">No upcoming appointments.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'calls' && (
            <motion.div 
              key="calls"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                  <Input 
                    placeholder="Search by name, company..." 
                    className="pl-10 bg-indigo-50/50 border-none focus-visible:ring-indigo-500/20 text-slate-700 placeholder:text-slate-400 rounded-xl"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button variant="outline" className="gap-2 flex-1 md:flex-none rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600">
                    <Filter className="w-4 h-4" /> Filter
                  </Button>
                  <Button variant="outline" className="gap-2 flex-1 md:flex-none rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600">
                    Export CSV
                  </Button>
                </div>
              </div>

              <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl overflow-hidden rounded-2xl">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <Table>
                    <TableHeader className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                      <TableRow className="border-slate-100 hover:bg-transparent">
                        <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Customer</TableHead>
                        <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Company</TableHead>
                        <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Call Type</TableHead>
                        <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                        <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">DG Details</TableHead>
                        <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Follow-up</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCalls.map((call) => (
                        <TableRow key={call.id} className="hover:bg-indigo-50/30 transition-colors group border-slate-50">
                          <TableCell>
                            <div className="font-bold text-slate-800">{call.customerName}</div>
                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-indigo-400" /> {call.phoneNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-semibold text-slate-700">{call.contactPerson}</div>
                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-indigo-400" /> {call.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 border-none">
                              {call.callType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(call.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-semibold text-slate-700">
                              <span className="font-bold">{call.dgSetDetails.kva} KVA</span>
                              <span className="text-slate-400 ml-1">({call.dgSetDetails.engineMake})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-semibold text-slate-600">
                              {call.followUpDate ? format(parseISO(call.followUpDate), 'MMM d, yyyy') : '-'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                                onClick={() => handleEdit(call)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Dialog>
                                <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" />}>
                                  <Search className="w-3.5 h-3.5" />
                                </DialogTrigger>
                                <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Call Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                                        <p className="font-bold text-slate-800">{call.customerName}</p>
                                      </div>
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact</p>
                                        <p className="font-bold text-slate-800">{call.contactPerson}</p>
                                      </div>
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                                        <p className="font-bold text-slate-800">{call.phoneNumber}</p>
                                      </div>
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Follow up Type</p>
                                        <p className="font-bold text-slate-800">{call.followUpType || '-'}</p>
                                      </div>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4">
                                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3">Part Details</p>
                                      <div className="grid grid-cols-3 gap-2 text-sm bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                        <div>
                                          <p className="text-xs font-semibold text-slate-500 mb-0.5">Part No</p>
                                          <p className="font-bold text-slate-800">{call.partNo || '-'}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs font-semibold text-slate-500 mb-0.5">Part Desc</p>
                                          <p className="font-bold text-slate-800">{call.partDesc || '-'}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs font-semibold text-slate-500 mb-0.5">Category</p>
                                          <p className="font-bold text-slate-800">{call.partCategory || '-'}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4">
                                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3">DG Set Info</p>
                                      <div className="grid grid-cols-3 gap-2 text-sm bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                        <div>
                                          <p className="text-xs font-semibold text-slate-500 mb-0.5">KVA</p>
                                          <p className="font-bold text-slate-800">{call.dgSetDetails.kva}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs font-semibold text-slate-500 mb-0.5">Make</p>
                                          <p className="font-bold text-slate-800">{call.dgSetDetails.engineMake}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs font-semibold text-slate-500 mb-0.5">ESN</p>
                                          <p className="font-bold text-slate-800">{call.dgSetDetails.esn}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4">
                                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">Remarks</p>
                                      <p className="text-sm font-medium text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">"{call.remarks}"</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                                onClick={() => deleteCall(call.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalCallsPages > 1 && (
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-500">
                        Showing {(callsPage - 1) * callsPerPage + 1} to {Math.min(callsPage * callsPerPage, filteredCalls.length)} of {filteredCalls.length} records
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={callsPage === 1}
                          onClick={() => setCallsPage(prev => prev - 1)}
                          className="rounded-lg h-8 px-3 text-xs font-bold border-slate-200"
                        >
                          Previous
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={callsPage === totalCallsPages}
                          onClick={() => setCallsPage(prev => prev + 1)}
                          className="rounded-lg h-8 px-3 text-xs font-bold border-slate-200"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                  {filteredCalls.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-20 text-indigo-300" />
                      <p className="font-medium">No call records found matching your search.</p>
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </motion.div>
          )}

          {activeTab === 'appointments' && (
            <motion.div 
              key="appointments"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl p-4">
                  <Calendar
                    mode="single"
                    className="rounded-xl border-none"
                  />
                </Card>
                <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl p-6">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Quick Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-500">This Week</span>
                      <span className="font-bold text-slate-800">{meetingsThisWeek} Meetings</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-500">Next Week</span>
                      <span className="font-bold text-slate-800">{meetingsNextWeek} Meetings</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="font-semibold text-amber-600">Pending Follow-ups</span>
                      <span className="font-bold text-amber-700">{pendingFollowUps} Tasks</span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Upcoming Schedule</h3>
                <div className="space-y-4">
                  {calls
                    .filter(c => c.appointmentDate)
                    .sort((a, b) => parseISO(a.appointmentDate!).getTime() - parseISO(b.appointmentDate!).getTime())
                    .map((call) => (
                      <Card key={call.id} className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-indigo-200/40 transition-all">
                        <div className="flex">
                          <div className="w-2 bg-gradient-to-b from-indigo-500 to-purple-500 group-hover:w-3 transition-all" />
                          <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-lg text-slate-800">{call.customerName}</h4>
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 border-indigo-200 bg-indigo-50">{call.callType}</Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                  <Building2 className="w-4 h-4 text-slate-400" /> {call.location}
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                  <MapPin className="w-4 h-4 text-slate-400" /> {call.location}
                                </div>
                                <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 text-indigo-700">
                                  <Clock className="w-4 h-4 text-indigo-500" /> {format(parseISO(call.appointmentDate!), 'h:mm a')}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-[120px]">
                                <p className="text-sm font-bold text-indigo-600">{format(parseISO(call.appointmentDate!), 'EEEE')}</p>
                                <p className="text-xs font-semibold text-slate-500">{format(parseISO(call.appointmentDate!), 'MMMM d, yyyy')}</p>
                              </div>
                              <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">View Details</Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  {calls.filter(c => c.appointmentDate).length === 0 && (
                    <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-dashed border-slate-200 shadow-sm">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-500 font-medium mb-4">No appointments scheduled yet.</p>
                      <Button variant="link" onClick={() => setIsDialogOpen(true)} className="text-indigo-600 font-bold">Schedule your first meeting</Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'quotations' && (
            <motion.div key="quotations" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <QuotationsTab />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <AnalyticsTab />
            </motion.div>
          )}

          {activeTab === 'leads' && (
            <motion.div key="leads" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <LeadsTab />
            </motion.div>
          )}

          {activeTab === 'visits' && (
            <motion.div key="visits" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <VisitsTab />
            </motion.div>
          )}

          {activeTab === 'targets' && (
            <motion.div key="targets" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <FosTargetsTab />
            </motion.div>
          )}

          {activeTab === 'management' && (
            <motion.div key="management" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <DataManagementTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-2 flex flex-col md:hidden z-20">
        <div className="flex overflow-x-auto gap-2 w-full pb-2 px-2 snap-x">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("flex-col h-auto py-2 gap-1 min-w-[64px] snap-start", activeTab === 'dashboard' && "text-indigo-600")}
            onClick={() => setActiveTab('dashboard')}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("flex-col h-auto py-2 gap-1 min-w-[64px] snap-start", activeTab === 'calls' && "text-indigo-600")}
            onClick={() => setActiveTab('calls')}
          >
            <Phone className="w-5 h-5" />
            <span className="text-[10px]">Calls</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("flex-col h-auto py-2 gap-1 min-w-[64px] snap-start", activeTab === 'quotations' && "text-indigo-600")}
            onClick={() => setActiveTab('quotations')}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px]">Quotes</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("flex-col h-auto py-2 gap-1 min-w-[64px] snap-start", activeTab === 'analytics' && "text-indigo-600")}
            onClick={() => setActiveTab('analytics')}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px]">Analytics</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("flex-col h-auto py-2 gap-1 min-w-[64px] snap-start", activeTab === 'leads' && "text-indigo-600")}
            onClick={() => setActiveTab('leads')}
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px]">Leads</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("flex-col h-auto py-2 gap-1 min-w-[64px] snap-start", activeTab === 'visits' && "text-indigo-600")}
            onClick={() => setActiveTab('visits')}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px]">Visits</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("flex-col h-auto py-2 gap-1 min-w-[64px] snap-start", activeTab === 'targets' && "text-indigo-600")}
            onClick={() => setActiveTab('targets')}
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px]">Targets</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("flex-col h-auto py-2 gap-1 min-w-[64px] snap-start", activeTab === 'appointments' && "text-indigo-600")}
            onClick={() => setActiveTab('appointments')}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[10px]">Dates</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("flex-col h-auto py-2 gap-1 min-w-[64px] snap-start", activeTab === 'management' && "text-indigo-600")}
            onClick={() => setActiveTab('management')}
          >
            <Database className="w-5 h-5" />
            <span className="text-[10px]">Database</span>
          </Button>
        </div>
        <div className="text-[8px] text-center text-gray-400 pb-1 uppercase tracking-widest font-bold">
          Powered by Fawwaz Creations
        </div>
      </div>
    </div>
  );
}
