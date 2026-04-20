import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Lead } from '../types';
import { FOS_NAMES, OPPORTUNITIES, LEAD_TYPES, LEAD_SOURCES } from '../constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Download } from 'lucide-react';
import { BulkUploadDialog } from './BulkUploadDialog';
import { exportToCSV } from '../lib/csvExport';

export function LeadsTab() {
  const { leads, addLead, bulkAddLeads, updateLead, deleteLead } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const initialFormState = {
    customerName: '',
    contactPerson: '',
    mobileNumber: '',
    emailId: '',
    leadOwner: FOS_NAMES[0],
    opportunity: OPPORTUNITIES[0],
    leadType: LEAD_TYPES[0],
    leadSource: LEAD_SOURCES[0],
    remarks: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleEdit = (l: Lead) => {
    setFormData({ ...l });
    setEditingId(l.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateLead(editingId, formData);
    } else {
      addLead(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleBulkUpload = async (data: any[]) => {
    let successCount = 0;
    const payloads = data.map(row => {
      // Robust header matching
      const getVal = (possibleHeaders: string[]) => {
        const found = Object.keys(row).find(k => 
          possibleHeaders.map(h => h.toLowerCase()).includes(k.toLowerCase())
        );
        return found ? row[found] : undefined;
      };

      const customerName = getVal(['Customer Name', 'CustomerName', 'Company']);
      if (!customerName) return null;

      try {
        successCount++;
        return {
          customerName: customerName,
          contactPerson: getVal(['Contact Person', 'ContactPerson']) || '',
          mobileNumber: getVal(['Mobile Number', 'Mobile', 'Phone']) || '',
          emailId: getVal(['Email ID', 'Email', 'EmailID']) || '',
          leadOwner: getVal(['FOS Name', 'Lead Owner', 'Owner']) || FOS_NAMES[0],
          opportunity: getVal(['Opportunity']) || OPPORTUNITIES[0],
          leadType: getVal(['Lead Type', 'Type']) || LEAD_TYPES[0],
          leadSource: getVal(['Lead Source', 'Source']) || LEAD_SOURCES[0],
          remarks: getVal(['Remarks', 'Notes']) || ''
        };
      } catch (err) {
        console.error('Error parsing row:', row, err);
        successCount--;
        return null;
      }
    }).filter(Boolean);

    if (payloads.length > 0) {
      await bulkAddLeads(payloads as any);
      alert(`Successfully uploaded ${successCount} leads.`);
    } else {
      alert('No valid records found in the CSV. Please check the column headers.');
    }
  };

  const filtered = leads.filter(l => 
    l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = () => {
    exportToCSV(filtered, "Leads", [
      "customerName", "contactPerson", "mobileNumber", "emailId", "leadOwner", "opportunity", "leadType", "leadSource", "remarks", "createdAt"
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
          <Input 
            placeholder="Search leads..." 
            className="pl-10 bg-indigo-50/50 border-none focus-visible:ring-indigo-500/20 text-slate-700 placeholder:text-slate-400 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold"
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <BulkUploadDialog 
            title="Leads" 
            templateHeaders={[
              'Customer Name', 'Contact Person', 'Mobile Number', 'Email ID', 
              'FOS Name', 'Opportunity', 'Lead Type', 'Lead Source', 'Remarks'
            ]}
            onUpload={handleBulkUpload}
          />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger render={<Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 gap-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 border-none" />}>
              <Plus className="w-4 h-4" /> New Lead
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email ID</Label>
                  <Input type="email" value={formData.emailId} onChange={e => setFormData({...formData, emailId: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>FOS Name</Label>
                  <div className="flex flex-col gap-2">
                    <Select value={FOS_NAMES.includes(formData.leadOwner) ? formData.leadOwner : (formData.leadOwner ? 'Other' : '')} onValueChange={v => {
                      if (v === 'Other') {
                        setFormData({...formData, leadOwner: ''});
                      } else {
                        setFormData({...formData, leadOwner: v});
                      }
                    }}>
                      <SelectTrigger className="rounded-xl border-slate-200"><SelectValue placeholder="Select FOS Name" /></SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        {FOS_NAMES.map(o => <SelectItem key={o} value={o} className="rounded-lg">{o}</SelectItem>)}
                        <SelectItem value="Other" className="rounded-lg font-bold border-t border-slate-100 italic">Other (Manual Entry)</SelectItem>
                      </SelectContent>
                    </Select>
                    {(!FOS_NAMES.includes(formData.leadOwner) || formData.leadOwner === '') && (
                      <Input 
                        placeholder="Enter FOS Name" 
                        value={formData.leadOwner} 
                        onChange={e => setFormData({...formData, leadOwner: e.target.value})} 
                        className="rounded-xl border-slate-200"
                        autoFocus
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Opportunity</Label>
                  <Select value={formData.opportunity} onValueChange={v => setFormData({...formData, opportunity: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{OPPORTUNITIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lead Type</Label>
                  <Select value={formData.leadType} onValueChange={v => setFormData({...formData, leadType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LEAD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lead Source</Label>
                  <Select value={formData.leadSource} onValueChange={v => setFormData({...formData, leadSource: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LEAD_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {editingId ? 'Update Lead' : 'Save Lead'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Customer</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Contact</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">FOS Name</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Opportunity</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Type</TableHead>
                <TableHead className="text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No leads found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((l) => (
                  <TableRow key={l.id} className="hover:bg-indigo-50/30 transition-colors group border-slate-50">
                    <TableCell className="font-bold text-slate-800">{l.customerName}</TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-slate-700">{l.contactPerson}</div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">{l.mobileNumber}</div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {l.leadOwner}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        {l.opportunity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                        {l.leadType}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">{l.leadSource}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(l)} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteLead(l.id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} leads
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="rounded-lg h-8 px-3 text-xs font-bold border-slate-200"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="rounded-lg h-8 px-3 text-xs font-bold border-slate-200"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
