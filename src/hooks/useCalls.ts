import { useState, useEffect } from 'react';
import { Call } from '../types';
import { isSameDay, parseISO } from 'date-fns';

export function useCalls() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCalls = localStorage.getItem('calltrack_calls');
    if (savedCalls) {
      try {
        setCalls(JSON.parse(savedCalls));
      } catch (e) {
        console.error('Failed to parse calls from localStorage', e);
      }
    } else {
      // Add sample data if empty
      const sampleCalls: Call[] = [
        {
          id: '1',
          customerName: 'Rahul Sharma',
          contactPerson: 'Rahul Sharma',
          phoneNumber: '+91 98765 43210',
          email: 'rahul@sharmaind.com',
          location: 'Pune, Maharashtra',
          dgSetDetails: { kva: '125', engineMake: 'Cummins', esns: ['ESN123456'] },
          qty: 1,
          partNo: 'PN-101',
          partDesc: 'Oil Filter',
          partCategory: 'Consumables',
          fosName: 'John Doe',
          callType: 'Proposal Discussion',
          followUpType: 'Call Follow up',
          status: 'In Progress',
          remarks: 'Discussed the 125KVA proposal. Client requested a 5% discount.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          followUpDate: new Date(Date.now() + 86400000).toISOString(),
        },
        {
          id: '2',
          customerName: 'Anita Desai',
          contactPerson: 'Anita Desai',
          phoneNumber: '+91 91234 56789',
          email: 'anita@desaitextiles.com',
          location: 'Surat, Gujarat',
          dgSetDetails: { kva: '250', engineMake: 'Kirloskar', esns: ['KIR789012'] },
          qty: 1,
          partNo: 'PN-202',
          partDesc: 'Air Filter',
          partCategory: 'Consumables',
          fosName: 'Jane Smith',
          callType: 'Closing Call',
          followUpType: 'Visit',
          status: 'Completed',
          remarks: 'Order confirmed for 2 units of 250KVA. Payment scheduled for next week.',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: '3',
          customerName: 'Vikram Singh',
          contactPerson: 'Vikram Singh',
          phoneNumber: '+91 99887 76655',
          email: 'vikram@singhconst.com',
          location: 'Delhi, NCR',
          dgSetDetails: { kva: '500', engineMake: 'Perkins', esns: ['PER456789'] },
          qty: 1,
          partNo: 'PN-303',
          partDesc: 'Fuel Pump',
          partCategory: 'Spares',
          fosName: 'Raj Malhotra',
          callType: 'Negotiation',
          followUpType: 'Visit',
          status: 'Pending',
          remarks: 'Site visit scheduled for tomorrow to finalize installation points.',
          createdAt: new Date().toISOString(),
          appointmentDate: new Date(Date.now() + 172800000).toISOString(),
        }
      ];
      setCalls(sampleCalls);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('calltrack_calls', JSON.stringify(calls));
    }
  }, [calls, isLoaded]);

  const addCall = (call: Omit<Call, 'id' | 'createdAt'>) => {
    const newCall: Call = {
      ...call,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setCalls((prev) => [newCall, ...prev]);
  };

  const updateCall = (id: string, updates: Partial<Call>) => {
    setCalls((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCall = (id: string) => {
    setCalls((prev) => prev.filter((c) => c.id !== id));
  };

  const stats = {
    totalCalls: calls.length,
    todayFollowUps: calls.filter(c => 
      c.followUpDate && isSameDay(parseISO(c.followUpDate), new Date())
    ).length,
    meetingAppointments: calls.filter(c => 
      c.appointmentDate && parseISO(c.appointmentDate) >= new Date()
    ).length,
  };

  return {
    calls,
    addCall,
    updateCall,
    deleteCall,
    stats,
    isLoaded
  };
}
