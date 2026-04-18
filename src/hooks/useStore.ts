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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export function useStore() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [targets, setTargets] = useState<FosTarget[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setCalls([]);
        setQuotations([]);
        setLeads([]);
        setVisits([]);
        setTargets([]);
        setIsLoaded(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  // Actions
  const addCall = async (call: Omit<Call, 'id' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'calls'), {
      ...call,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
  };

  const updateCall = async (id: string, updates: Partial<Call>) => {
    await updateDoc(doc(db, 'calls', id), updates);
  };

  const deleteCall = async (id: string) => {
    await deleteDoc(doc(db, 'calls', id));
  };

  const addQuotation = async (quotation: Omit<Quotation, 'id' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'quotations'), {
      ...quotation,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
  };

  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    await updateDoc(doc(db, 'quotations', id), updates);
  };

  const deleteQuotation = async (id: string) => {
    await deleteDoc(doc(db, 'quotations', id));
  };

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'leads'), {
      ...lead,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    await updateDoc(doc(db, 'leads', id), updates);
  };

  const deleteLead = async (id: string) => {
    await deleteDoc(doc(db, 'leads', id));
  };

  const addVisit = async (visit: Omit<Visit, 'id' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'visits'), {
      ...visit,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
  };

  const updateVisit = async (id: string, updates: Partial<Visit>) => {
    await updateDoc(doc(db, 'visits', id), updates);
  };

  const deleteVisit = async (id: string) => {
    await deleteDoc(doc(db, 'visits', id));
  };

  const addTarget = async (target: Omit<FosTarget, 'id' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'targets'), {
      ...target,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
  };

  const updateTarget = async (id: string, updates: Partial<FosTarget>) => {
    await updateDoc(doc(db, 'targets', id), updates);
  };

  const deleteTarget = async (id: string) => {
    await deleteDoc(doc(db, 'targets', id));
  };

  const stats = {
    totalCalls: calls.length,
    todayFollowUps: calls.filter(c => c.followUpDate && isSameDay(parseISO(c.followUpDate), new Date())).length,
    meetingAppointments: calls.filter(c => c.appointmentDate && parseISO(c.appointmentDate) >= new Date()).length,
    totalQuotations: quotations.length,
    totalLeads: leads.length,
    totalVisits: visits.length,
  };

  return {
    calls, addCall, updateCall, deleteCall,
    quotations, addQuotation, updateQuotation, deleteQuotation,
    leads, addLead, updateLead, deleteLead,
    visits, addVisit, updateVisit, deleteVisit,
    targets, addTarget, updateTarget, deleteTarget,
    stats,
    user,
    isLoaded
  };
}
