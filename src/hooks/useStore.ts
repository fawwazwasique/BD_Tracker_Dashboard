import { useState, useEffect } from 'react';
import { Call, Quotation, Lead, Visit, FosTarget } from '../types';
import { isSameDay, parseISO } from 'date-fns';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useStore() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [targets, setTargets] = useState<FosTarget[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribers = [
      onSnapshot(query(collection(db, 'calls'), orderBy('createdAt', 'desc')), (snapshot) => {
        setCalls(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Call)));
      }),
      onSnapshot(query(collection(db, 'quotations'), orderBy('createdAt', 'desc')), (snapshot) => {
        setQuotations(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Quotation)));
      }),
      onSnapshot(query(collection(db, 'leads'), orderBy('createdAt', 'desc')), (snapshot) => {
        setLeads(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
      }),
      onSnapshot(query(collection(db, 'visits'), orderBy('createdAt', 'desc')), (snapshot) => {
        setVisits(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Visit)));
      }),
      onSnapshot(query(collection(db, 'targets'), orderBy('createdAt', 'desc')), (snapshot) => {
        setTargets(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FosTarget)));
      })
    ];

    setIsLoaded(true);
    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  // Actions
  const addCall = async (call: Omit<Call, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'calls'), {
      ...call,
      createdAt: new Date().toISOString()
    });
  };

  const bulkAddCalls = async (data: Omit<Call, 'id' | 'createdAt'>[]) => {
    const batchSize = 500;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = data.slice(i, i + batchSize);
      chunk.forEach(item => {
        const newDocRef = doc(collection(db, 'calls'));
        batch.set(newDocRef, { ...item, createdAt: new Date().toISOString() });
      });
      await batch.commit();
    }
  };

  const updateCall = async (id: string, updates: Partial<Call>) => {
    await updateDoc(doc(db, 'calls', id), updates);
  };

  const deleteCall = async (id: string) => {
    await deleteDoc(doc(db, 'calls', id));
  };

  const addQuotation = async (quotation: Omit<Quotation, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'quotations'), {
      ...quotation,
      createdAt: new Date().toISOString()
    });
  };

  const bulkAddQuotations = async (data: Omit<Quotation, 'id' | 'createdAt'>[]) => {
    const batchSize = 500;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = data.slice(i, i + batchSize);
      chunk.forEach(item => {
        const newDocRef = doc(collection(db, 'quotations'));
        batch.set(newDocRef, { ...item, createdAt: new Date().toISOString() });
      });
      await batch.commit();
    }
  };

  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    await updateDoc(doc(db, 'quotations', id), updates);
  };

  const deleteQuotation = async (id: string) => {
    await deleteDoc(doc(db, 'quotations', id));
  };

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'leads'), {
      ...lead,
      createdAt: new Date().toISOString()
    });
  };

  const bulkAddLeads = async (data: Omit<Lead, 'id' | 'createdAt'>[]) => {
    const batchSize = 500;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = data.slice(i, i + batchSize);
      chunk.forEach(item => {
        const newDocRef = doc(collection(db, 'leads'));
        batch.set(newDocRef, { ...item, createdAt: new Date().toISOString() });
      });
      await batch.commit();
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    await updateDoc(doc(db, 'leads', id), updates);
  };

  const deleteLead = async (id: string) => {
    await deleteDoc(doc(db, 'leads', id));
  };

  const addVisit = async (visit: Omit<Visit, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'visits'), {
      ...visit,
      createdAt: new Date().toISOString()
    });
  };

  const bulkAddVisits = async (data: Omit<Visit, 'id' | 'createdAt'>[]) => {
    const batchSize = 500;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = data.slice(i, i + batchSize);
      chunk.forEach(item => {
        const newDocRef = doc(collection(db, 'visits'));
        batch.set(newDocRef, { ...item, createdAt: new Date().toISOString() });
      });
      await batch.commit();
    }
  };

  const updateVisit = async (id: string, updates: Partial<Visit>) => {
    await updateDoc(doc(db, 'visits', id), updates);
  };

  const deleteVisit = async (id: string) => {
    await deleteDoc(doc(db, 'visits', id));
  };

  const addTarget = async (target: Omit<FosTarget, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'targets'), {
      ...target,
      createdAt: new Date().toISOString()
    });
  };

  const bulkAddTargets = async (data: Omit<FosTarget, 'id' | 'createdAt'>[]) => {
    const batchSize = 500;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = data.slice(i, i + batchSize);
      chunk.forEach(item => {
        const newDocRef = doc(collection(db, 'targets'));
        batch.set(newDocRef, { ...item, createdAt: new Date().toISOString() });
      });
      await batch.commit();
    }
  };

  const updateTarget = async (id: string, updates: Partial<FosTarget>) => {
    await updateDoc(doc(db, 'targets', id), updates);
  };

  const deleteTarget = async (id: string) => {
    await deleteDoc(doc(db, 'targets', id));
  };

  const clearAllData = async () => {
    const allCalls = calls.map(c => deleteCall(c.id));
    const allQuotes = quotations.map(q => deleteQuotation(q.id));
    const allLeads = leads.map(l => deleteLead(l.id));
    const allVisits = visits.map(v => deleteVisit(v.id));
    const allTargets = targets.map(t => deleteTarget(t.id));
    
    await Promise.all([...allCalls, ...allQuotes, ...allLeads, ...allVisits, ...allTargets]);
  };

  const deleteDataByCategory = async (category: string) => {
    if (category === 'all') {
      await clearAllData();
      return;
    }

    const callsToDelete = calls.filter(c => c.partCategory === category).map(c => deleteCall(c.id));
    const quotesToDelete = quotations.filter(q => q.partCategory === category).map(q => deleteQuotation(q.id));
    
    await Promise.all([...callsToDelete, ...quotesToDelete]);
  };

  const stats = {
    totalCalls: calls.length,
    todayFollowUps: calls.filter(c => c.followUpDate && isSameDay(parseISO(c.followUpDate), new Date())).length,
    meetingAppointments: calls.filter(c => c.appointmentDate && parseISO(c.appointmentDate) >= new Date()).length,
    totalQuotations: quotations.length,
    totalQuotationValue: quotations.reduce((sum, q) => sum + (Number(q.basicAmount) || 0), 0),
    totalLeads: leads.length,
    totalVisits: visits.length,
  };

  return {
    calls, addCall, bulkAddCalls, updateCall, deleteCall,
    quotations, addQuotation, bulkAddQuotations, updateQuotation, deleteQuotation,
    leads, addLead, bulkAddLeads, updateLead, deleteLead,
    visits, addVisit, bulkAddVisits, updateVisit, deleteVisit,
    targets, addTarget, bulkAddTargets, updateTarget, deleteTarget,
    clearAllData,
    deleteDataByCategory,
    stats,
    isLoaded
  };
}
