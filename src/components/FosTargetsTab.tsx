import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Target, Download } from 'lucide-react';
import { BulkUploadDialog } from './BulkUploadDialog';
import { FOS_NAMES, MONTHS } from '../constants';
import { exportToCSV } from '../lib/csvExport';

const YEARS = ['2024', '2025', '2026', '2027'];

export function FosTargetsTab() {
  const { targets, addTarget, bulkAddTargets, updateTarget, deleteTarget, visits, quotations } = useStore();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'Admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fosName: FOS_NAMES[0],
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear().toString(),
    targetVisits: 0,
    achievedVisits: 0,
    targetAmount: 0,
    achievedAmount: 0,
    remarks: ''
  });

  const resetForm = () => {
    setFormData({
      fosName: FOS_NAMES[0],
      month: MONTHS[new Date().getMonth()],
      year: new Date().getFullYear().toString(),
      targetVisits: 0,
      achievedVisits: 0,
      targetAmount: 0,
      achievedAmount: 0,
      remarks: ''
    });
    setEditingId(null);
  };

  const handleEdit = (t: any) => {
    setFormData({
      fosName: t.fosName,
      month: t.month,
      year: t.year,
      targetVisits: t.targetVisits,
      achievedVisits: t.achievedVisits,
      targetAmount: t.targetAmount,
      achievedAmount: t.achievedAmount,
      remarks: t.remarks
    });
    setEditingId(t.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTarget(editingId, formData);
    } else {
      addTarget(formData);
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

      const fosName = getVal(['FOS Name', 'Lead Owner', 'Owner']);
      const month = getVal(['Month']);
      const year = getVal(['Year']);

      if (!fosName || !month || !year) return null;

      try {
        successCount++;
        return {
          fosName: fosName,
          month: month,
          year: year,
          targetVisits: parseInt(getVal(['Target Visits', 'TargetVisits']) || '0') || 0,
          achievedVisits: parseInt(getVal(['Achieved Visits', 'AchievedVisits']) || '0') || 0,
          targetAmount: parseFloat(getVal(['Target Amount', 'TargetAmount']) || '0') || 0,
          achievedAmount: parseFloat(getVal(['Achieved Amount', 'AchievedAmount']) || '0') || 0,
          remarks: getVal(['Remarks', 'Notes']) || ''
        };
      } catch (err) {
        console.error('Error parsing row:', row, err);
        successCount--;
        return null;
      }
    }).filter(Boolean);

    if (payloads.length > 0) {
      await bulkAddTargets(payloads as any);
      alert(`Successfully uploaded ${successCount} FOS targets.`);
    } else {
      alert('No valid records found in the CSV. Please check the column headers (FOS Name, Month, and Year are required).');
    }
  };

  const filtered = targets.filter(t => 
    t.fosName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.year.includes(searchTerm)
  );

  const handleExport = () => {
    exportToCSV(filtered, "FOS_Targets", [
      "fosName", "month", "year", "targetVisits", "achievedVisits", "targetAmount", "achievedAmount", "remarks"
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
          <Input 
            placeholder="Search targets by name, month, or year..." 
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
            title="FOS Targets" 
            templateHeaders={[
              'FOS Name', 'Month', 'Year', 'Target Visits', 'Achieved Visits', 
              'Target Amount', 'Achieved Amount', 'Remarks'
            ]}
            onUpload={handleBulkUpload}
          />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger render={<Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 gap-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 border-none" />}>
              <Plus className="w-4 h-4" /> New Target
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Target' : 'Add New Target'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>FOS Name</Label>
                  <div className="flex flex-col gap-2">
                    <Select value={FOS_NAMES.includes(formData.fosName) ? formData.fosName : (formData.fosName ? 'Other' : '')} onValueChange={v => {
                      if (v === 'Other') {
                        setFormData({...formData, fosName: ''});
                      } else {
                        setFormData({...formData, fosName: v});
                      }
                    }}>
                      <SelectTrigger className="rounded-xl border-slate-200"><SelectValue placeholder="Select FOS Name" /></SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        {FOS_NAMES.map(o => <SelectItem key={o} value={o} className="rounded-lg">{o}</SelectItem>)}
                        <SelectItem value="Other" className="rounded-lg font-bold border-t border-slate-100 italic">Other (Manual Entry)</SelectItem>
                      </SelectContent>
                    </Select>
                    {(!FOS_NAMES.includes(formData.fosName) || formData.fosName === '') && (
                      <Input 
                        placeholder="Enter FOS Name" 
                        value={formData.fosName} 
                        onChange={e => setFormData({...formData, fosName: e.target.value})} 
                        className="rounded-xl border-slate-200"
                        autoFocus
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={formData.month} onValueChange={v => setFormData({...formData, month: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={formData.year} onValueChange={v => setFormData({...formData, year: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Visits</Label>
                  <Input type="number" required value={formData.targetVisits} onChange={e => setFormData({...formData, targetVisits: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label>Achieved Visits</Label>
                  <Input type="number" required value={formData.achievedVisits} onChange={e => setFormData({...formData, achievedVisits: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label>Target Amount</Label>
                  <Input type="number" required value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label>Achieved Amount</Label>
                  <Input type="number" required value={formData.achievedAmount} onChange={e => setFormData({...formData, achievedAmount: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Remarks</Label>
                  <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {editingId ? 'Update Target' : 'Save Target'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-lg shadow-slate-200/40 bg-white/80 backdrop-blur-xl overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">FOS Name</th>
                <th className="px-6 py-4 font-bold">Period</th>
                <th className="px-6 py-4 font-bold">Visits (Achieved/Target)</th>
                <th className="px-6 py-4 font-bold">Amount (Achieved/Target)</th>
                <th className="px-6 py-4 font-bold">Remarks</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Target className="w-8 h-8 text-slate-300" />
                      <p>No targets found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const monthIndex = MONTHS.indexOf(t.month);
                  
                  // Calculate achieved visits
                  const achievedVisits = visits.filter(v => {
                    const visitDate = new Date(v.createdAt);
                    return v.fosName === t.fosName && 
                           visitDate.getMonth() === monthIndex && 
                           visitDate.getFullYear().toString() === t.year;
                  }).length;

                  // Calculate achieved amount
                  const achievedAmount = quotations.filter(q => {
                    const quoteDate = new Date(q.createdAt);
                    return q.leadOwner === t.fosName && 
                           q.stagePercent >= 90 &&
                           quoteDate.getMonth() === monthIndex && 
                           quoteDate.getFullYear().toString() === t.year;
                  }).reduce((sum, q) => sum + q.basicAmount, 0);

                  const visitPercent = t.targetVisits > 0 ? Math.round((achievedVisits / t.targetVisits) * 100) : 0;
                  const amountPercent = t.targetAmount > 0 ? Math.round((achievedAmount / t.targetAmount) * 100) : 0;
                  
                  return (
                    <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group border-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-800">{t.fosName}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{t.month} {t.year}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-700">{achievedVisits} / {t.targetVisits}</span>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${visitPercent >= 100 ? 'bg-emerald-500' : visitPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(visitPercent, 100)}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{visitPercent}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-700">₹{achievedAmount.toLocaleString()} / ₹{t.targetAmount.toLocaleString()}</span>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${amountPercent >= 100 ? 'bg-emerald-500' : amountPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(amountPercent, 100)}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{amountPercent}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-medium text-slate-500">{t.remarks || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="icon" onClick={() => deleteTarget(t.id)} className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
