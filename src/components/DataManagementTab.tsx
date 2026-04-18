import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

export function DataManagementTab() {
  const { clearAllData, stats } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await clearAllData();
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to delete data:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
          <CardHeader className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 pb-8">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">System Controls</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Manage your database and shared data settings.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100/50 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-rose-900 uppercase text-xs tracking-widest">Danger Zone</h3>
              </div>
              <p className="text-sm text-rose-700 font-medium leading-relaxed">
                Clearing all data will permanently remove all call records, quotations, leads, visits, and targets from the shared cloud database. This action cannot be undone.
              </p>
              
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger render={<Button className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3" />}>
                  <Trash2 className="w-5 h-5" /> Delete All Database Records
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8 max-w-md">
                  <DialogHeader>
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-8 h-8 text-rose-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center text-slate-900">Final Confirmation</DialogTitle>
                    <DialogDescription className="text-center text-slate-500 font-medium py-2">
                      Are you absolutely sure you want to wipe the entire database? This will affect all users.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setModalOpen(false)}
                      className="flex-1 h-14 rounded-2xl font-bold border-slate-200 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleDeleteAll}
                      disabled={isDeleting}
                      className="flex-1 h-14 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-200"
                    >
                      {isDeleting ? "Wiping Data..." : "Yes, Purge Everything"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
          <CardHeader className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 pb-8">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Database Health</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Statistics across the entire workspace.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Calls', value: stats.totalCalls, color: 'text-indigo-600' },
                { label: 'Quotations', value: stats.totalQuotations, color: 'text-purple-600' },
                { label: 'Active Leads', value: stats.totalLeads, color: 'text-blue-600' },
                { label: 'Field Visits', value: stats.totalVisits, color: 'text-emerald-600' }
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-100/50 flex flex-col items-center justify-center text-center">
                  <span className={`text-3xl font-black mb-1 ${item.color}`}>{item.value}</span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/30 text-center">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Last Update Sync</p>
              <p className="text-xs font-black text-indigo-900">{new Date().toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
