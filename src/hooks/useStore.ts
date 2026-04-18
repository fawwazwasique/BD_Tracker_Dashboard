import { useState, useEffect } from 'react';
import { Call, Quotation, Lead, Visit, FosTarget } from '../types';
import { isSameDay, parseISO } from 'date-fns';

export function useStore() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [targets, setTargets] = useState<FosTarget[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCalls = localStorage.getItem('calltrack_calls');
    const savedQuotations = localStorage.getItem('calltrack_quotations');
    const savedLeads = localStorage.getItem('calltrack_leads');
    const savedVisits = localStorage.getItem('calltrack_visits');
    const savedTargets = localStorage.getItem('calltrack_targets');

    if (savedCalls) setCalls(JSON.parse(savedCalls));
    if (savedQuotations) setQuotations(JSON.parse(savedQuotations));
    if (savedLeads) setLeads(JSON.parse(savedLeads));
    if (savedVisits) setVisits(JSON.parse(savedVisits));
    if (savedTargets) setTargets(JSON.parse(savedTargets));

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('calltrack_calls', JSON.stringify(calls));
      localStorage.setItem('calltrack_quotations', JSON.stringify(quotations));
      localStorage.setItem('calltrack_leads', JSON.stringify(leads));
      localStorage.setItem('calltrack_visits', JSON.stringify(visits));
      localStorage.setItem('calltrack_targets', JSON.stringify(targets));
    }
  }, [calls, quotations, leads, visits, targets, isLoaded]);

  // Calls
  const addCall = (call: Omit<Call, 'id' | 'createdAt'>) => {
    const id = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 11);
    setCalls(prev => [{ ...call, id, createdAt: new Date().toISOString() }, ...prev]);
  };
  const updateCall = (id: string, updates: Partial<Call>) => {
    setCalls(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };
  const deleteCall = (id: string) => {
    setCalls(prev => prev.filter(c => c.id !== id));
  };

  // Quotations
  const addQuotation = (quotation: Omit<Quotation, 'id' | 'createdAt'>) => {
    const id = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 11);
    setQuotations(prev => [{ ...quotation, id, createdAt: new Date().toISOString() }, ...prev]);
  };
  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setQuotations(prev => prev.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };
  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  // Leads
  const addLead = (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    const id = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 11);
    setLeads(prev => [{ ...lead, id, createdAt: new Date().toISOString() }, ...prev]);
  };
  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };
  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  // Visits
  const addVisit = (visit: Omit<Visit, 'id' | 'createdAt'>) => {
    const id = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 11);
    setVisits(prev => [{ ...visit, id, createdAt: new Date().toISOString() }, ...prev]);
  };
  const updateVisit = (id: string, updates: Partial<Visit>) => {
    setVisits(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  };
  const deleteVisit = (id: string) => {
    setVisits(prev => prev.filter(v => v.id !== id));
  };

  // Targets
  const addTarget = (target: Omit<FosTarget, 'id' | 'createdAt'>) => {
    const id = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 11);
    setTargets(prev => [{ ...target, id, createdAt: new Date().toISOString() }, ...prev]);
  };
  const updateTarget = (id: string, updates: Partial<FosTarget>) => {
    setTargets(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };
  const deleteTarget = (id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
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
    isLoaded
  };
}
