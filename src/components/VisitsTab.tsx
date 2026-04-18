import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Visit } from '../types';
import { VISIT_PURPOSES, VISIT_TYPES, VISIT_STATUSES, ENGINE_MAKES, LEAD_OWNERS } from '../constants';
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
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { BulkUploadDialog } from './BulkUploadDialog';

export function VisitsTab() {
  const { visits, addVisit, bulkAddVisits, updateVisit, deleteVisit } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const initialFormState = {
    customerName: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    location: '',
    dgSetDetails: { kva: '', engineMake: ENGINE_MAKES[0], esn: '' },
    fosName: LEAD_OWNERS[0],
    visitPurpose: VISIT_PURPOSES[0],
    visitType: VISIT_TYPES[0],
    status: VISIT_STATUSES[0],
    remarks: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleEdit = (v: Visit) => {
    setFormData({ ...v, dgSetDetails: { ...v.dgSetDetails } });
    setEditingId(v.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateVisit(editingId, formData);
    } else {
      addVisit(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleBulkUpload = async (data: any[]) => {
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
          engineMake: row['Engine Make'] || ENGINE_MAKES[0],
          esn: row['ESN'] || ''
        },
        fosName: row['FOS Name'] || '',
        visitPurpose: row['Visit Purpose'] || VISIT_PURPOSES[0],
        visitType: row['Visit Type'] || VISIT_TYPES[0],
        status: row['Status'] || VISIT_STATUSES[0],
        remarks: row['Remarks'] || ''
      };
    }).filter(Boolean);

    if (payloads.length > 0) {
      await bulkAddVisits(payloads as any);
    }
  };

  const filtered = visits.filter(v => 
    v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
          <Input 
            placeholder="Search visits..." 
            className="pl-10 bg-indigo-50/50 border-none focus-visible:ring-indigo-500/20 text-slate-700 placeholder:text-slate-400 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <BulkUploadDialog 
            title="Visits" 
            templateHeaders={[
              'Customer Name', 'Contact Person', 'Phone Number', 
              'Email', 'Location', 'KVA Rating', 'Engine Make', 'ESN', 
              'FOS Name', 'Visit Purpose', 'Visit Type', 'Status', 'Remarks'
            ]}
            onUpload={handleBulkUpload}
          />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger render={<Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 gap-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 border-none" />}>
              <Plus className="w-4 h-4" /> New Visit
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Visit' : 'Add New Visit'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">DG Set Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>KVA Rating</Label>
                    <Input value={formData.dgSetDetails.kva} onChange={e => setFormData({...formData, dgSetDetails: {...formData.dgSetDetails, kva: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Engine Make</Label>
                    <Select value={formData.dgSetDetails.engineMake} onValueChange={v => setFormData({...formData, dgSetDetails: {...formData.dgSetDetails, engineMake: v}})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ENGINE_MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ESN</Label>
                    <Input value={formData.dgSetDetails.esn} onChange={e => setFormData({...formData, dgSetDetails: {...formData.dgSetDetails, esn: e.target.value}})} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>FOS Name</Label>
                  <div className="flex flex-col gap-2">
                    <Select value={LEAD_OWNERS.includes(formData.fosName) ? formData.fosName : 'Other'} onValueChange={v => {
                      if (v !== 'Other') {
                        setFormData({...formData, fosName: v});
                      } else {
                        setFormData({...formData, fosName: ''});
                      }
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select FOS Name" /></SelectTrigger>
                      <SelectContent>
                        {LEAD_OWNERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        <SelectItem value="Other">Other (Manual Entry)</SelectItem>
                      </SelectContent>
                    </Select>
                    {!LEAD_OWNERS.includes(formData.fosName) && formData.fosName !== '' && (
                      <Input 
                        placeholder="Enter FOS Name" 
                        value={formData.fosName} 
                        onChange={e => setFormData({...formData, fosName: e.target.value})} 
                        autoFocus
                      />
                    )}
                    {!LEAD_OWNERS.includes(formData.fosName) && formData.fosName === '' && (
                       <Input 
                       placeholder="Enter FOS Name" 
                       value={formData.fosName} 
                       onChange={e => setFormData({...formData, fosName: e.target.value})} 
                       autoFocus
                     />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Visit Purpose</Label>
                  <Select value={formData.visitPurpose} onValueChange={v => setFormData({...formData, visitPurpose: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{VISIT_PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Visit Type</Label>
                  <Select value={formData.visitType} onValueChange={v => setFormData({...formData, visitType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{VISIT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{VISIT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
                  {editingId ? 'Update Visit' : 'Save Visit'}
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
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Company</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">FOS Name</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Purpose</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Type</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No visits found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((v) => (
                  <TableRow key={v.id} className="hover:bg-indigo-50/30 transition-colors group border-slate-50">
                    <TableCell>
                      <div className="font-bold text-slate-800">{v.contactPerson}</div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">{v.customerName}</div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">{v.fosName}</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {v.visitPurpose}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        {v.visitType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                        {v.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(v)} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteVisit(v.id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all">
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} visits
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
