import { CallType, CallStatus } from './types';

export const CALL_TYPES: CallType[] = [
  'Warm Call',
  'Follow-up Call',
  'Call Back',
  'Qualification Call',
  'Proposal Discussion',
  'Negotiation',
  'Closing Call',
  'Relationship Call',
  'Support Call'
];

export const CALL_STATUSES: CallStatus[] = [
  'Pending',
  'In Progress',
  'Completed',
  'Cancelled'
];

export const ENGINE_MAKES = [
  'Cummins',
  'Kirloskar',
  'Perkins',
  'Mahindra',
  'Ashok Leyland',
  'Caterpillar',
  'Other'
];

export const TERRITORIES = [
  'Bangalore',
  'Mangalore',
  'Mysore',
  'North Karnataka'
];

export const BRANCHES = [
  'Byappanhalli',
  'Peenya',
  'JC Road',
  'Tumkur',
  'Mangalore',
  'Ankola',
  'Chitradurga',
  'Shimoga',
  'Belagavi',
  'Kalaburagi',
  'Hospet',
  'Hubli',
  'Vijayapur',
  'Hosur',
  'Mysore',
  'Attibele',
  'Ballari',
  'Hassan',
  'Bangalore'
];

export const FOS_NAMES = [
  'Murugesan',
  'D.K Kumar',
  'Ranjith. A',
  'Nikhath Anjum',
  'Melroy',
  'Arun Kumar',
  'Hussain',
  'Harish Nayak',
  'Naveen Kumar',
  'Vittal',
  'Vivian Dsouza'
];

export const LEAD_OWNERS = FOS_NAMES; // Backward compatibility aliases if needed elsewhere temporarily

export const QUOTE_STATUSES = ['Open', 'Close', 'Sale', 'Lost'];

export const QUOTE_STAGES = [
  { name: 'Quote Submission', percent: 10, remarks: 'Maintenance Team/End User' },
  { name: '1st Level Discussion', percent: 20, remarks: 'Maintenance/Technician Team' },
  { name: '2nd Level Discussion', percent: 50, remarks: 'Finance/Commercial Team' },
  { name: 'Management Approval/Fund Allocation', percent: 75, remarks: 'Procurement/Finance/Purchase team' },
  { name: 'Issue of P.O', percent: 90, remarks: 'Procurement Team' },
  { name: 'P.O Closure', percent: 100, remarks: 'Finance Team/ Procurement Team' }
];

export const SUPPORT_REQUIRED = ['Commercial', 'Technical'];

export const OPPORTUNITIES = ['DATUM', 'RECD', 'RAS', 'DFK', 'BESS'];

export const LEAD_TYPES = ['Cold', 'Hot', 'Warm'];

export const LEAD_SOURCES = ['Service Engineer', 'FOS'];

export const FOLLOW_UP_TYPES = ['Visit', 'Call Follow up'];

export const VISIT_PURPOSES = ['RECD', 'DATUM', 'RAS', 'DFK', 'BESS'];

export const VISIT_TYPES = [
  'Warm Visit',
  'Follow-up Visit',
  'Proposal Discussion',
  'Negotiation',
  'Closing Visit',
  'Relationship Visit'
];

export const VISIT_STATUSES = ['Interested', 'Not Interested', 'Follow-Up'];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
