export type CallType = 
  | 'Warm Call' 
  | 'Follow-up Call' 
  | 'Call Back' 
  | 'Qualification Call' 
  | 'Proposal Discussion' 
  | 'Negotiation' 
  | 'Closing Call' 
  | 'Relationship Call' 
  | 'Support Call';

export type CallStatus = 'Pending' | 'Completed' | 'In Progress' | 'Cancelled';

export interface Call {
  id: string;
  customerName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  location: string;
  territory?: string;
  dgSetDetails: {
    kva: string;
    engineMake: string;
    esns: string[];
  };
  qty: number;
  partNo: string;
  partDesc: string;
  partCategory: string;
  fosName: string;
  followUpType: string;
  callType: CallType;
  status: CallStatus;
  likelyMonthOfClosure?: string;
  remarks: string;
  createdAt: string;
  followUpDate?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  customerName: string;
  address: string;
  territory: string;
  leadOwner: string;
  contactPerson: string;
  mobileNumber: string;
  emailId: string;
  dgRatingKva: string;
  engineMake: string;
  esns: string[];
  engineModel: string;
  partNo: string;
  partDesc: string;
  partCategory: string;
  qty: number;
  basicAmount: number;
  status: string;
  salesStage: string;
  stagePercent: number;
  stageRemarks: string;
  likelyMonthOfClosure: string;
  supportRequired: string;
  platform: string;
  remarks: string;
  createdAt: string;
  quotationDate: string;
}

export interface Lead {
  id: string;
  customerName: string;
  contactPerson: string;
  mobileNumber: string;
  emailId: string;
  territory?: string;
  leadOwner: string;
  opportunity: string;
  leadType: string;
  leadSource: string;
  likelyMonthOfClosure?: string;
  remarks: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  customerName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  location: string;
  territory?: string;
  dgSetDetails: {
    kva: string;
    engineMake: string;
    esns: string[];
  };
  fosName: string;
  visitPurpose: string;
  visitType: string;
  status: string;
  likelyMonthOfClosure?: string;
  remarks: string;
  createdAt: string;
}

export interface FosTarget {
  id: string;
  fosName: string;
  month: string;
  year: string;
  targetVisits: number;
  achievedVisits: number;
  targetAmount: number;
  achievedAmount: number;
  remarks: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCalls: number;
  todayFollowUps: number;
  meetingAppointments: number;
  totalQuotations: number;
  totalLeads: number;
  totalVisits: number;
}

export type UserRole = 'Admin' | 'FOS';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
}
