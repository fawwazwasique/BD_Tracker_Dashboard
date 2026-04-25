import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Quotation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  TERRITORIES, BRANCHES, FOS_NAMES, QUOTE_STATUSES, 
  QUOTE_STAGES, SUPPORT_REQUIRED, MONTHS, PART_CATEGORIES 
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
import { Plus, Search, Pencil, Trash2, Download } from 'lucide-react';
import { BulkUploadDialog } from './BulkUploadDialog';
import { exportToCSV } from '../lib/csvExport';

export function QuotationsTab() {
  const { quotations, addQuotation, bulkAddQuotations, updateQuotation, deleteQuotation } = useStore();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'Admin';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supportFilter, setSupportFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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
    esns: [''],
    engineModel: '',
    partNo: '',
    partDesc: '',
    partCategory: PART_CATEGORIES[0],
    qty: 1,
    basicAmount: 0,
    status: QUOTE_STATUSES[0],
    salesStage: QUOTE_STAGES[0].name,
    stagePercent: QUOTE_STAGES[0].percent,
    stageRemarks: QUOTE_STAGES[0].remarks,
    likelyMonthOfClosure: MONTHS[new Date().getMonth()],
    supportRequired: SUPPORT_REQUIRED[0],
    platform: '',
    remarks: '',
    quotationDate: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleEdit = (q: Quotation) => {
    setFormData({ 
      ...q,
      esns: Array.isArray(q.esns) ? [...q.esns] : [(q as any).esn || '']
    });
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

  const handleBulkUpload = async (data: any[]) => {
    let successCount = 0;
    let errorCount = 0;
    const payloads = data.map((row, index) => {
      // Robust header matching
      const getVal = (possibleHeaders: string[]) => {
        const found = Object.keys(row).find(k => 
          possibleHeaders.map(h => h.toLowerCase()).includes(k.toLowerCase())
        );
        return found ? row[found] : undefined;
      };

      const quotNo = getVal(['Quotation No', 'QuotationNo', 'Quote No']) || `QUO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const custName = getVal(['Customer Name', 'CustomerName', 'Company']) || 'Unnamed Customer';
      
      try {
        const parseDate = (val: any) => {
          if (!val) return null;
          const d = new Date(val);
          return isNaN(d.getTime()) ? null : d.toISOString();
        };

        const stageName = getVal(['Sales Stage', 'SalesStage', 'Stage']) || QUOTE_STAGES[0].name;
        const stage = QUOTE_STAGES.find(s => s.name === stageName) || QUOTE_STAGES[0];

        const qtyVal = parseInt(getVal(['QTY', 'Quantity']) || '1');
        const amountVal = parseFloat(getVal(['BASIC Amount', 'Amount', 'BasicAmount']) || '0');

        successCount++;
        return {
          quotationNo: quotNo,
          customerName: custName,
          address: getVal(['Address', 'Location']) || '',
          territory: getVal(['Territory']) || TERRITORIES[0],
          branch: getVal(['Branch']) || BRANCHES[0],
          leadOwner: getVal(['FOS Name', 'Lead Owner', 'Owner']) || FOS_NAMES[0],
          contactPerson: getVal(['Contact Person', 'ContactPerson']) || '',
          mobileNumber: getVal(['Mobile Number', 'Mobile', 'Phone']) || '',
          emailId: getVal(['Email ID', 'Email', 'EmailID']) || '',
          dgRatingKva: getVal(['DG Rating KVA', 'KVA', 'Rating']) || '',
          engineMake: getVal(['Engine Make', 'Make']) || '',
          esns: (String(getVal(['ESN', 'Serial No']) || '')).split(',').map((s: string) => s.trim()),
          engineModel: getVal(['Engine Model', 'Model']) || '',
          partNo: getVal(['Part No', 'PartNumber']) || '',
          partDesc: getVal(['Part Desc', 'Description']) || '',
          partCategory: getVal(['Part Category', 'Category']) || PART_CATEGORIES[0],
          qty: isNaN(qtyVal) ? 1 : qtyVal,
          basicAmount: isNaN(amountVal) ? 0 : amountVal,
          status: getVal(['Status']) || QUOTE_STATUSES[0],
          salesStage: stage.name,
          stagePercent: stage.percent,
          stageRemarks: stage.remarks,
          likelyMonthOfClosure: getVal(['Likely Month Of Closure', 'Closure Month']) || MONTHS[new Date().getMonth()],
          supportRequired: getVal(['Support Required', 'Support']) || SUPPORT_REQUIRED[0],
          platform: getVal(['Platform']) || '',
          remarks: getVal(['Remarks', 'Notes']) || '',
          quotationDate: parseDate(getVal(['Quotation Date', 'Date'])) || new Date().toISOString()
        };
      } catch (err) {
        console.error(`Error parsing row ${index}:`, row, err);
        errorCount++;
        return null;
      }
    }).filter(Boolean);

    if (payloads.length > 0) {
      try {
        await bulkAddQuotations(payloads as any);
        alert(`Successfully uploaded ${successCount} quotations.${errorCount > 0 ? ` Skipped ${errorCount} records due to format errors.` : ''}`);
      } catch (err: any) {
        alert(`Failed to save to database: ${err.message}. You might have exceeded your daily upload limit (Firestore quota).`);
      }
    } else {
      alert('No valid records found in the CSV. Please check the column headers (Quotation No and Customer Name are required).');
    }
  };

  const filtered = quotations.filter(q => {
    const matchesSearch = q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || q.partCategory === categoryFilter;
    const matchesSupport = supportFilter === 'all' || q.supportRequired === supportFilter;
    return matchesSearch && matchesCategory && matchesSupport;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = () => {
    const exportData = filtered.map(q => ({
      ...q,
      esns: Array.isArray(q.esns) ? q.esns.join('; ') : (q.esn || '')
    }));
    exportToCSV(exportData, "Quotations", [
      "quotationNo", "quotationDate", "customerName", "address", "territory", "branch", "leadOwner", "contactPerson", "mobileNumber", "emailId", "dgRatingKva", "engineMake", "esns", "engineModel", "partNo", "partDesc", "partCategory", "qty", "basicAmount", "status", "salesStage", "stagePercent", "supportRequired", "platform", "remarks", "createdAt"
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <Input 
              placeholder="Search quotations..." 
              className="pl-10 bg-indigo-50/50 border-none focus-visible:ring-indigo-500/20 text-slate-700 placeholder:text-slate-400 rounded-xl w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-indigo-50/50 border-none focus:ring-indigo-500/20 rounded-xl text-slate-700">
                <SelectValue placeholder="Category Filter" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="all" className="rounded-lg">All Categories</SelectItem>
                {PART_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={supportFilter} onValueChange={setSupportFilter}>
              <SelectTrigger className="bg-indigo-50/50 border-none focus:ring-indigo-500/20 rounded-xl text-slate-700">
                <SelectValue placeholder="Support Filter" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="all" className="rounded-lg">All Support</SelectItem>
                {SUPPORT_REQUIRED.map(s => (
                  <SelectItem key={s} value={s} className="rounded-lg">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            title="Quotations" 
            templateHeaders={[
              'Quotation No', 'Quotation Date', 'Customer Name', 'Address', 'Territory', 'Branch', 
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
                  <Input value={formData.quotationNo} onChange={e => setFormData({...formData, quotationNo: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Quotation Date</Label>
                  <Input type="date" value={formData.quotationDate} onChange={e => setFormData({...formData, quotationDate: e.target.value})} />
                </div>
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
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ESNs</Label>
                  <div className="space-y-2">
                    {formData.esns.map((esn, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input 
                          placeholder={`ESN ${idx + 1}`} 
                          value={esn}
                          onChange={e => {
                            const newEsns = [...formData.esns];
                            newEsns[idx] = e.target.value;
                            setFormData({...formData, esns: newEsns});
                          }}
                        />
                        {formData.esns.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              const newEsns = formData.esns.filter((_, i) => i !== idx);
                              setFormData({...formData, esns: newEsns});
                            }}
                            className="text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setFormData({...formData, esns: [...formData.esns, '']});
                      }}
                      className="w-full border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl h-10 font-bold"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Another ESN
                    </Button>
                  </div>
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
                  <div className="flex flex-col gap-2">
                    <Select 
                      value={PART_CATEGORIES.includes(formData.partCategory) ? formData.partCategory : (formData.partCategory ? 'Other' : '')} 
                      onValueChange={v => {
                        if (v === 'Other') {
                          setFormData({...formData, partCategory: ''});
                        } else {
                          setFormData({...formData, partCategory: v});
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 shadow-sm"><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        {PART_CATEGORIES.filter(c => c !== 'Other').map(cat => (
                          <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>
                        ))}
                        <SelectItem value="Other" className="rounded-lg font-bold border-t border-slate-100 italic">Other (Manual Entry)</SelectItem>
                      </SelectContent>
                    </Select>
                    {(!PART_CATEGORIES.includes(formData.partCategory) || formData.partCategory === '') && (
                      <Input 
                        placeholder="Enter Part Category" 
                        value={formData.partCategory} 
                        onChange={e => setFormData({...formData, partCategory: e.target.value})} 
                        className="rounded-xl border-slate-200"
                        autoFocus
                      />
                    )}
                  </div>
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
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Date</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Quote No</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Customer</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">ESNs</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Amount</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Stage</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No quotations found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((q) => (
                  <TableRow key={q.id} className="hover:bg-indigo-50/30 transition-colors group border-slate-50">
                    <TableCell className="text-slate-600 font-medium">{q.quotationDate}</TableCell>
                    <TableCell className="font-bold text-slate-800">{q.quotationNo}</TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-800">{q.customerName}</div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">{q.territory} • {q.branch}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[10px] font-bold text-slate-600 max-w-[100px] truncate">
                        {Array.isArray(q.esns) ? q.esns.filter(Boolean).join(', ') : '-'}
                      </div>
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
                      {isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => deleteQuotation(q.id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} quotations
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
