import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Quotation } from '../types';
import { 
  TERRITORIES, BRANCHES, FOS_NAMES, QUOTE_STATUSES, 
  QUOTE_STAGES, SUPPORT_REQUIRED, MONTHS 
} from '../constants';
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

export function QuotationsTab() {
  const { quotations, addQuotation, updateQuotation, deleteQuotation } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = {
    quotationNo: '',
    customerName: '',
    address: '',
    territory: TERRITORIES[0],
    branch: BRANCHES[0],
    leadOwner: FOS_NAMES[0],
    contactPerson: '',
    mobileNumber: '',
    emailId: '',
    dgRatingKva: '',
    engineMake: '',
    esn: '',
    engineModel: '',
    partNo: '',
    partDesc: '',
    partCategory: '',
    qty: 1,
    basicAmount: 0,
    status: QUOTE_STATUSES[0],
    salesStage: QUOTE_STAGES[0].name,
    stagePercent: QUOTE_STAGES[0].percent,
    stageRemarks: QUOTE_STAGES[0].remarks,
    likelyMonthOfClosure: MONTHS[new Date().getMonth()],
    supportRequired: SUPPORT_REQUIRED[0],
    platform: '',
    remarks: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleEdit = (q: Quotation) => {
    setFormData({ ...q });
    setEditingId(q.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateQuotation(editingId, formData);
    } else {
      addQuotation(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleStageChange = (stageName: string) => {
    const stage = QUOTE_STAGES.find(s => s.name === stageName);
    if (stage) {
      setFormData({
        ...formData,
        salesStage: stage.name,
        stagePercent: stage.percent,
        stageRemarks: stage.remarks
      });
    }
  };

  const handleBulkUpload = (data: any[]) => {
    data.forEach(row => {
      if (!row['Quotation No'] || !row['Customer Name']) return;
      
      const stageName = row['Sales Stage'] || QUOTE_STAGES[0].name;
      const stage = QUOTE_STAGES.find(s => s.name === stageName) || QUOTE_STAGES[0];

      addQuotation({
        quotationNo: row['Quotation No'],
        customerName: row['Customer Name'],
        address: row['Address'] || '',
        territory: row['Territory'] || TERRITORIES[0],
        branch: row['Branch'] || BRANCHES[0],
        leadOwner: row['FOS Name'] || row['Lead Owner'] || FOS_NAMES[0],
        contactPerson: row['Contact Person'] || '',
        mobileNumber: row['Mobile Number'] || '',
        emailId: row['Email ID'] || '',
        dgRatingKva: row['DG Rating KVA'] || '',
        engineMake: row['Engine Make'] || '',
        esn: row['ESN'] || '',
        engineModel: row['Engine Model'] || '',
        partNo: row['Part No'] || '',
        partDesc: row['Part Desc'] || '',
        partCategory: row['Part Category'] || '',
        qty: parseInt(row['QTY']) || 1,
        basicAmount: parseFloat(row['BASIC Amount']) || 0,
        status: row['Status'] || QUOTE_STATUSES[0],
        salesStage: stage.name,
        stagePercent: stage.percent,
        stageRemarks: stage.remarks,
        likelyMonthOfClosure: row['Likely Month Of Closure'] || MONTHS[new Date().getMonth()],
        supportRequired: row['Support Required'] || SUPPORT_REQUIRED[0],
        platform: row['Platform'] || '',
        remarks: row['Remarks'] || ''
      });
    });
  };

  const filtered = quotations.filter(q => 
    q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
          <Input 
            placeholder="Search quotations..." 
            className="pl-10 bg-indigo-50/50 border-none focus-visible:ring-indigo-500/20 text-slate-700 placeholder:text-slate-400 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <BulkUploadDialog 
            title="Quotations" 
            templateHeaders={[
              'Quotation No', 'Customer Name', 'Address', 'Territory', 'Branch', 
              'FOS Name', 'Contact Person', 'Mobile Number', 'Email ID', 
              'DG Rating KVA', 'Engine Make', 'ESN', 'Engine Model', 
              'Part No', 'Part Desc', 'Part Category', 'QTY', 
              'BASIC Amount', 'Sales Stage', 'Status', 'Likely Month Of Closure', 
              'Support Required', 'Platform', 'Remarks'
            ]}
            onUpload={handleBulkUpload}
          />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger render={<Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 gap-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 border-none" />}>
              <Plus className="w-4 h-4" /> New Quotation
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Quotation' : 'Add New Quotation'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Quotation No</Label>
                  <Input required value={formData.quotationNo} onChange={e => setFormData({...formData, quotationNo: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
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
                  <Label>Territory</Label>
                  <Select value={formData.territory} onValueChange={v => setFormData({...formData, territory: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TERRITORIES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select value={formData.branch} onValueChange={v => setFormData({...formData, branch: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
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
                      <SelectTrigger className="rounded-xl border-slate-200 shadow-sm"><SelectValue placeholder="Select FOS Name" /></SelectTrigger>
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
                  <Label>DG Rating KVA</Label>
                  <Input value={formData.dgRatingKva} onChange={e => setFormData({...formData, dgRatingKva: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Engine Make</Label>
                  <Input value={formData.engineMake} onChange={e => setFormData({...formData, engineMake: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>ESN</Label>
                  <Input value={formData.esn} onChange={e => setFormData({...formData, esn: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Engine Model</Label>
                  <Input value={formData.engineModel} onChange={e => setFormData({...formData, engineModel: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Part No</Label>
                  <Input value={formData.partNo} onChange={e => setFormData({...formData, partNo: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Part Desc</Label>
                  <Input value={formData.partDesc} onChange={e => setFormData({...formData, partDesc: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Part Category</Label>
                  <Input value={formData.partCategory} onChange={e => setFormData({...formData, partCategory: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>QTY</Label>
                  <Input type="number" min="1" value={formData.qty} onChange={e => setFormData({...formData, qty: parseInt(e.target.value) || 1})} />
                </div>
                <div className="space-y-2">
                  <Label>BASIC Amount</Label>
                  <Input type="number" value={formData.basicAmount} onChange={e => setFormData({...formData, basicAmount: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{QUOTE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sales Stage</Label>
                  <Select value={formData.salesStage} onValueChange={handleStageChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{QUOTE_STAGES.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stage %</Label>
                  <Input disabled value={`${formData.stagePercent}%`} className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Likely Month Of Closure</Label>
                  <Select value={formData.likelyMonthOfClosure} onValueChange={v => setFormData({...formData, likelyMonthOfClosure: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Support Required</Label>
                  <Select value={formData.supportRequired} onValueChange={v => setFormData({...formData, supportRequired: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SUPPORT_REQUIRED.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Stage Remarks</Label>
                <Input disabled value={formData.stageRemarks} className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {editingId ? 'Update Quotation' : 'Save Quotation'}
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
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Quote No</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Customer</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Amount</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Stage</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No quotations found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((q) => (
                  <TableRow key={q.id} className="hover:bg-indigo-50/30 transition-colors group border-slate-50">
                    <TableCell className="font-bold text-slate-800">{q.quotationNo}</TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-800">{q.customerName}</div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">{q.territory} • {q.branch}</div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-700">₹{q.basicAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-slate-700">{q.salesStage}</div>
                      <div className="text-[11px] text-indigo-600 font-bold mt-0.5">{q.stagePercent}%</div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {q.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(q)} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteQuotation(q.id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
