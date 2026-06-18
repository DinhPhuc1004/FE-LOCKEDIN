// src/context/DataContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { 
  saveMockWorkspaces, 
  getMockMessages, 
  saveMockMessages, 
  simulatePTResponse 
} from '../services/mockFirebase';
import type { Workspace, ChatMessage } from '../services/mockFirebase';
import { 
  getMockMealPlans, 
  generateAIMealPlan 
} from '../services/mockGemini';
import type { MealPlan } from '../services/mockGemini';

export interface PTPackage {
  id: string;
  ptId: string;
  ptName: string;
  name: string;
  description: string;
  sessionsCount: number;
  price: number; // VND
  isActive: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  ptId: string;
  ptName: string;
  packageId: string;
  packageName: string;
  sessionsCount: number;
  price: number;
  status: 'Unpaid' | 'PaidPendingAcceptance' | 'Active' | 'Completed' | 'Cancelled';
  paymentTxId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  ptId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  workspaceId: string;
  customerId: string;
  customerName: string;
  ptId: string;
  ptName: string;
  reason: string;
  description: string;
  evidenceImage?: string;
  status: 'Pending' | 'ResolvedRefunded' | 'ResolvedPaidPT';
  createdAt: string;
}

export interface Settlement {
  id: string;
  ptId: string;
  ptName: string;
  bookingId: string;
  amount: number;
  status: 'PendingDisputeWindow' | 'Released' | 'LockedByDispute';
  createdAt: string;
  releasedAt?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  recipientId: string; // user ID or 'admin'
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

export interface PTVerification {
  id: string;
  userId: string;
  fullName: string;
  bio: string;
  specialization: string;
  experienceYears: number;
  verificationStatus: number;
  averageRating: number;
  totalReviews: number;
}

interface DataContextType {
  packages: PTPackage[];
  bookings: Booking[];
  workspaces: Workspace[];
  chatMessages: ChatMessage[];
  mealPlans: MealPlan[];
  reviews: Review[];
  disputes: Dispute[];
  settlements: Settlement[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  transactions: any[];
  ptVerifications: PTVerification[];
  
  // Package methods
  createPackage: (name: string, description: string, sessions: number, price: number) => void;
  updatePackage: (pkgId: string, name: string, description: string, sessions: number, price: number, active: boolean) => void;
  
  // Booking & PayOS simulation methods
  createBooking: (pkg: PTPackage) => Promise<Booking>;
  cancelBooking: (bookingId: string) => void;
  simulatePayOSPayment: (bookingId: string) => Promise<void>;
  acceptBooking: (bookingId: string) => void;
  rejectBooking: (bookingId: string) => void;
  completeCourse: (workspaceId: string) => void;

  // Workspace & Chat
  sendChatMessage: (workspaceId: string, text: string, image?: string) => void;
  saveWorkspaceNotes: (workspaceId: string, notes: string) => void;
  incrementWorkspaceSession: (workspaceId: string) => void;
  
  // AI Meal Plan
  triggerMealPlanGeneration: (workspaceId: string, stats: any) => Promise<MealPlan>;

  // Review & Dispute
  addReview: (ptId: string, rating: number, comment: string) => void;
  fileDispute: (workspaceId: string, reason: string, description: string, file?: File) => Promise<void>;
  resolveDisputeAction: (disputeId: string, decision: 'refund' | 'pay_pt') => void;

  // Admin and Payouts
  approvePTVerification: (ptId: string) => void;
  rejectPTVerification: (ptId: string) => void;
  requestAdditionalDocs: (ptId: string) => void;
  blockPT: (ptId: string) => void;
  releaseSettlement: (settlementId: string) => void;
  
  // Utilities
  markNotificationsAsRead: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, refreshUsersList } = useAuth();
  
  // App States
  const [packages, setPackages] = useState<PTPackage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [reviews] = useState<Review[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [transactions] = useState<any[]>([]);
  const [ptVerifications, setPtVerifications] = useState<PTVerification[]>([]);

  const mapBookingStatus = (statusNum: number): 'Unpaid' | 'PaidPendingAcceptance' | 'Active' | 'Completed' | 'Cancelled' => {
    switch (statusNum) {
      case 1: return 'Unpaid';
      case 2: return 'PaidPendingAcceptance';
      case 3: return 'Active';
      case 4:
      case 5: return 'Completed';
      case 6:
      case 7: return 'Cancelled';
      default: return 'Unpaid';
    }
  };

  const fetchBackendData = async () => {
    if (!currentUser) return;
    
    // 1. Fetch Packages
    try {
      if (currentUser.role === 'pt') {
        const res = await api.get('/packages/my');
        if (res.data?.success) {
          const items = res.data.data.map((p: any) => ({
            id: p.id,
            ptId: p.ptProfileId,
            ptName: currentUser.fullName,
            name: p.name,
            description: p.description,
            sessionsCount: p.sessionCount,
            price: p.price,
            isActive: p.isActive
          }));
          setPackages(items);
        }
      } else {
        // For Customer/Admin, fetch all approved PTs packages
        const ptsRes = await api.get('/marketplace/pts');
        if (ptsRes.data?.success) {
          const pts = ptsRes.data.data.items || [];
          const allPkgs: PTPackage[] = [];
          for (const pt of pts) {
            try {
              const pkgRes = await api.get(`/marketplace/pts/${pt.ptProfileId}/packages`);
              if (pkgRes.data?.success) {
                allPkgs.push(...pkgRes.data.data.map((p: any) => ({
                  id: p.id,
                  ptId: p.ptProfileId,
                  ptName: pt.fullName,
                  name: p.name,
                  description: p.description,
                  sessionsCount: p.sessionCount,
                  price: p.price,
                  isActive: p.isActive
                })));
              }
            } catch (e) {
              console.warn("Failed to load packages for pt:", pt.ptProfileId, e);
            }
          }
          setPackages(allPkgs);
        }
      }
    } catch (e) {
      console.error("Failed to fetch packages:", e);
    }

    // 2. Fetch Bookings
    let activeBookings: Booking[] = [];
    try {
      const res = await api.get('/bookings/my');
      if (res.data?.success) {
        const mapped = res.data.data.map((b: any) => {
          return {
            id: b.id,
            customerId: b.customerId,
            customerName: b.customerId === currentUser.id ? currentUser.fullName : 'Học Viên',
            ptId: b.ptProfileId,
            ptName: 'Huấn Luyện Viên',
            packageId: b.packageId,
            packageName: 'Gói Tập Luyện',
            sessionsCount: b.sessionCount,
            price: b.totalAmount,
            status: mapBookingStatus(b.status),
            createdAt: b.createdAt
          };
        });
        setBookings(mapped);
        activeBookings = mapped.filter((b: any) => b.status === 'Active');
      }
    } catch (e) {
      console.error('Failed to fetch bookings:', e);
    }

    // 3. Fetch Workspaces for Active Bookings
    if (activeBookings.length > 0) {
      const list: Workspace[] = [];
      for (const b of activeBookings) {
        try {
          const res = await api.get(`/workspaces/booking/${b.id}`);
          if (res.data?.success) {
            const w = res.data.data;
            list.push({
              id: w.id,
              bookingId: w.bookingId,
              customerId: w.customerId,
              customerName: b.customerName,
              ptId: w.ptProfileId,
              ptName: b.ptName,
              packageName: b.packageName,
              sessionsTotal: b.sessionsCount,
              sessionsCompleted: w.status === 2 ? b.sessionsCount : 0, 
              status: w.status === 2 ? 'completed' : 'active',
              ptNotes: w.courseNote || '',
              createdAt: w.createdAt
            });
          }
        } catch (e) {
          console.warn(`No workspace found for booking ${b.id}:`, e);
        }
      }
      setWorkspaces(list);
    }

    // 4. Fetch Disputes
    try {
      const res = await api.get('/disputes/my');
      if (res.data?.success) {
        const mapped = res.data.data.map((d: any) => ({
          id: d.id,
          bookingId: d.bookingId,
          workspaceId: '',
          customerId: d.customerId,
          customerName: 'Học Viên',
          ptId: d.ptProfileId,
          ptName: 'Huấn Luyện Viên',
          reason: d.reason,
          description: '',
          status: d.status === 1 ? 'Pending' : d.status === 2 ? 'ResolvedRefunded' : 'ResolvedPaidPT',
          createdAt: d.createdAt
        }));
        setDisputes(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch disputes:', e);
    }

    // 5. Fetch Notifications
    try {
      const res = await api.get('/notifications/my');
      if (res.data?.success) {
        const mapped = res.data.data.map((n: any) => ({
          id: n.id,
          recipientId: n.userId,
          title: n.title,
          message: n.content,
          type: n.type === 2 ? 'warning' : 'success',
          read: n.isRead,
          createdAt: n.createdAt
        }));
        setNotifications(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }

    // 6. Admin Panel Fetch
    if (currentUser.role === 'admin') {
      try {
        const setRes = await api.get('/admin/settlements');
        if (setRes.data?.success) {
          const mapped = setRes.data.data.map((s: any) => ({
            id: s.id,
            ptId: s.ptProfileId,
            ptName: 'Huấn Luyện Viên',
            bookingId: s.bookingId,
            amount: s.netAmount,
            status: s.status === 1 ? 'PendingDisputeWindow' : 'Released',
            createdAt: s.createdAt
          }));
          setSettlements(mapped);
        }
      } catch (e) {
        console.error('Failed to fetch settlements:', e);
      }

      try {
        const auditRes = await api.get('/admin/audit-logs');
        if (auditRes.data?.success) {
          const mapped = auditRes.data.data.map((l: any) => ({
            id: l.id,
            actor: l.actorUserId,
            action: l.action,
            details: l.metadataJson || '',
            timestamp: l.createdAt
          }));
          setAuditLogs(mapped);
        }
      } catch (e) {
        console.error('Failed to fetch audit logs:', e);
      }

      try {
        const ptRes = await api.get('/admin/pt-verifications');
        if (ptRes.data?.success) {
          setPtVerifications(ptRes.data.data);
        }
      } catch (e) {
        console.error('Failed to fetch pt verifications:', e);
      }
    }
  };

  // Sync state with backend on mount & login user change
  useEffect(() => {
    if (currentUser) {
      fetchBackendData();
    } else {
      // Clear state on logout
      setPackages([]);
      setBookings([]);
      setWorkspaces([]);
      setDisputes([]);
      setSettlements([]);
      setNotifications([]);
      setPtVerifications([]);
    }
  }, [currentUser]);

  // Universal state saver helper
  const syncState = (key: string, data: any, stateSetter: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    stateSetter(data);
  };

  // Add notification helper
  const addNotification = (recipientId: string, title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const list: AppNotification[] = JSON.parse(localStorage.getItem('lockedin_notifications') || '[]');
    const newNotif: AppNotification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      recipientId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    syncState('lockedin_notifications', list, setNotifications);
  };

  // Add audit log helper
  const addAuditLog = (actor: string, action: string, details: string) => {
    const list: AuditLog[] = JSON.parse(localStorage.getItem('lockedin_audit_logs') || '[]');
    const newLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      actor,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    list.unshift(newLog);
    syncState('lockedin_audit_logs', list.slice(0, 150), setAuditLogs); // Cap logs at 150
  };

  // ==========================================
  // PACKAGE METHODS
  // ==========================================
  
  const createPackage = async (name: string, description: string, sessions: number, price: number) => {
    if (!currentUser || currentUser.role !== 'pt') return;
    try {
      const res = await api.post('/packages', {
        name,
        description,
        sessionCount: sessions,
        price
      });
      if (res.data?.success) {
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to create package:', e);
    }
  };

  const updatePackage = async (pkgId: string, name: string, description: string, sessions: number, price: number, active: boolean) => {
    if (!currentUser) return;
    try {
      const res = await api.put(`/packages/${pkgId}`, {
        name,
        description,
        sessionCount: sessions,
        price
      });
      if (res.data?.success) {
        const currentPkg = packages.find(p => p.id === pkgId);
        if (currentPkg && currentPkg.isActive !== active) {
          await api.patch(`/packages/${pkgId}/${active ? 'show' : 'hide'}`);
        }
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to update package:', e);
    }
  };

  // ==========================================
  // BOOKING & PAYOS INTEGRATION SIMULATION
  // ==========================================

  const createBooking = async (pkg: PTPackage): Promise<Booking> => {
    if (!currentUser) throw new Error('Must be logged in to create bookings');
    try {
      const res = await api.post('/bookings', {
        packageId: pkg.id
      });
      if (res.data?.success) {
        const b = res.data.data;
        const newBooking: Booking = {
          id: b.id,
          customerId: b.customerId,
          customerName: currentUser.fullName,
          ptId: b.ptProfileId,
          ptName: pkg.ptName,
          packageId: b.packageId,
          packageName: pkg.name,
          sessionsCount: b.sessionCount,
          price: b.totalAmount,
          status: 'Unpaid',
          createdAt: b.createdAt
        };
        fetchBackendData();
        return newBooking;
      }
      throw new Error(res.data?.message || 'Failed to create booking');
    } catch (e: any) {
      console.error('Failed to create booking:', e);
      throw e;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`);
      if (res.data?.success) {
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to cancel booking:', e);
    }
  };

  // PayOS Checkout success simulator
  const simulatePayOSPayment = async (bookingId: string) => {
    try {
      const payRes = await api.get(`/payments/booking/${bookingId}`);
      if (payRes.data?.success && payRes.data.data) {
        const payment = payRes.data.data;
        await api.post('/payments/payos/webhook', {
          code: '00',
          desc: 'success',
          data: payment.orderCode,
          signature: 'simulated'
        });
        await fetchBackendData();
      } else {
        throw new Error(payRes.data?.message || 'Payment not found on backend');
      }
    } catch (e) {
      console.error('Failed to simulate PayOS payment via API webhook:', e);
      // Fallback to local UI simulation if backend fails
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'PaidPendingAcceptance' as const } : b));
    }
  };

  const acceptBooking = async (bookingId: string) => {
    if (!currentUser || currentUser.role !== 'pt') return;
    try {
      const res = await api.post(`/bookings/${bookingId}/accept`);
      if (res.data?.success) {
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to accept booking:', e);
    }
  };

  const rejectBooking = async (bookingId: string) => {
    if (!currentUser || currentUser.role !== 'pt') return;
    try {
      const res = await api.post(`/bookings/${bookingId}/reject`);
      if (res.data?.success) {
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to reject booking:', e);
    }
  };
  const completeCourse = async (workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (!ws) return;
    try {
      const res = await api.post(`/bookings/${ws.bookingId}/complete`);
      if (res.data?.success) {
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to complete course:', e);
    }
  };

  // ==========================================
  // WORKSPACE & CHAT METHODS
  // ==========================================

  const sendChatMessage = (workspaceId: string, text: string, image?: string) => {
    if (!currentUser) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      workspaceId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      text,
      image,
      createdAt: new Date().toISOString(),
      read: true
    };

    const updated = [...chatMessages, newMsg];
    saveMockMessages(updated);
    setChatMessages(updated);

    // Check if customer sent it, trigger AI-like simulated response from trainer
    const ws = workspaces.find(w => w.id === workspaceId);
    if (ws && currentUser.role === 'customer') {
      simulatePTResponse(workspaceId, ws.ptId, ws.ptName, text, () => {
        setChatMessages(getMockMessages());
        addNotification(currentUser.id, 'New Chat Message', `Trainer sent you a message in workspace`, 'info');
      });
    } else if (ws && currentUser.role === 'pt') {
      addNotification(ws.customerId, 'New Trainer Message', `Coach ${ws.ptName} sent you a message in workspace`, 'info');
    }
  };

  const saveWorkspaceNotes = async (workspaceId: string, notes: string) => {
    try {
      const res = await api.put(`/workspaces/${workspaceId}/course-note`, {
        courseNote: notes
      });
      if (res.data?.success) {
        setWorkspaces(prev => prev.map(w => w.id === workspaceId ? { ...w, ptNotes: notes } : w));
      }
    } catch (e) {
      console.error('Failed to save workspace notes:', e);
    }
  };

  const incrementWorkspaceSession = (workspaceId: string) => {
    const updated = workspaces.map(w => {
      if (w.id === workspaceId) {
        const nextCount = w.sessionsCompleted + 1;
        if (nextCount > w.sessionsTotal) return w;
        return { ...w, sessionsCompleted: nextCount };
      }
      return w;
    });
    saveMockWorkspaces(updated);
    setWorkspaces(updated);
    
    const fresh = updated.find(w => w.id === workspaceId);
    if (fresh && currentUser) {
      addAuditLog(currentUser.fullName, 'IncrementSession', `Logged workout session completed (${fresh.sessionsCompleted}/${fresh.sessionsTotal})`);
      addNotification(fresh.customerId, 'Workout Session Logged', `Your trainer marked session #${fresh.sessionsCompleted} as completed!`, 'info');
      
      // Auto complete course if sessions equal total count
      if (fresh.sessionsCompleted === fresh.sessionsTotal) {
        completeCourse(workspaceId);
      }
    }
  };

  // ==========================================
  // AI MEAL PLAN GENERATION
  // ==========================================

  const triggerMealPlanGeneration = async (workspaceId: string, stats: any): Promise<MealPlan> => {
    const ws = workspaces.find(w => w.id === workspaceId);
    const trainerName = ws ? ws.ptName : 'Trainer';

    // Call Mock AI Service
    const plan = await generateAIMealPlan(workspaceId, stats);
    
    // Sync local state
    setMealPlans(getMockMealPlans());
    
    if (currentUser) {
      addAuditLog(currentUser.fullName, 'GenerateMealPlan', `Created AI Nutrition Meal Plan via Gemini simulator`);
    }
    
    if (ws) {
      addNotification(ws.customerId, 'New AI Nutrition Plan', `Coach ${trainerName} has generated a new Gemini AI Nutrition Meal Plan for you!`, 'success');
    }

    return plan;
  };

  // ==========================================
  // REVIEW & DISPUTE METHODS
  // ==========================================

  const addReview = async (ptId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    const booking = bookings.find(b => b.ptId === ptId && b.status === 'Completed');
    if (!booking) {
      console.warn("No completed booking found for review.");
      return;
    }
    try {
      const res = await api.post('/reviews', {
        bookingId: booking.id,
        rating,
        comment
      });
      if (res.data?.success) {
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to submit review:', e);
    }
  };

  const fileDispute = async (workspaceId: string, reason: string, description: string, file?: File): Promise<void> => {
    if (!currentUser) return;

    const ws = workspaces.find(w => w.id === workspaceId);
    if (!ws) return;

    try {
      const res = await api.post('/disputes', {
        bookingId: ws.bookingId,
        reason,
        description
      });
      if (res.data?.success) {
        const dispute = res.data.data;
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await api.post('/uploads/image?folder=disputes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data?.success) {
            const fileUrl = uploadRes.data.data.secureUrl || uploadRes.data.data.url;
            await api.post(`/disputes/${dispute.id}/evidences`, {
              fileUrl
            });
          }
        }
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to raise dispute:', e);
    }
  };

  const resolveDisputeAction = async (disputeId: string, decision: 'refund' | 'pay_pt') => {
    try {
      const endpoint = decision === 'refund' ? 'resolve-refund-customer' : 'resolve-release-to-pt';
      const res = await api.post(`/admin/disputes/${disputeId}/${endpoint}`, {
        resolutionNote: decision === 'refund' ? 'Refunded customer' : 'Released funds to PT'
      });
      if (res.data?.success) {
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to resolve dispute action:', e);
    }
  };

  // ==========================================
  // ADMIN PT MANAGEMENT & VERIFICATION
  // ==========================================

  const approvePTVerification = async (ptId: string) => {
    try {
      const res = await api.post(`/admin/pt-verifications/${ptId}/approve`);
      if (res.data?.success) {
        fetchBackendData();
        refreshUsersList();
      }
    } catch (e) {
      console.error('Failed to approve PT verification:', e);
    }
  };

  const rejectPTVerification = async (ptId: string) => {
    try {
      const res = await api.post(`/admin/pt-verifications/${ptId}/reject`);
      if (res.data?.success) {
        fetchBackendData();
        refreshUsersList();
      }
    } catch (e) {
      console.error('Failed to reject PT verification:', e);
    }
  };

  const requestAdditionalDocs = (ptId: string) => {
    console.log('Request additional docs is stubbed locally for PT ID:', ptId);
  };

  const blockPT = async (ptId: string) => {
    try {
      const res = await api.patch(`/admin/users/${ptId}/ban`);
      if (res.data?.success) {
        fetchBackendData();
        refreshUsersList();
      }
    } catch (e) {
      console.error('Failed to block PT user:', e);
    }
  };

  const releaseSettlement = async (settlementId: string) => {
    try {
      const res = await api.post(`/admin/settlements/${settlementId}/approve`);
      if (res.data?.success) {
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to release settlement:', e);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const res = await api.patch('/notifications/read-all');
      if (res.data?.success) {
        fetchBackendData();
      }
    } catch (e) {
      console.error('Failed to mark notifications as read:', e);
    }
  };

  return (
    <DataContext.Provider
      value={{
        packages,
        bookings,
        workspaces,
        chatMessages,
        mealPlans,
        reviews,
        disputes,
        settlements,
        auditLogs,
        notifications,
        transactions,
        ptVerifications,
        createPackage,
        updatePackage,
        createBooking,
        cancelBooking,
        simulatePayOSPayment,
        acceptBooking,
        rejectBooking,
        completeCourse,
        sendChatMessage,
        saveWorkspaceNotes,
        incrementWorkspaceSession,
        triggerMealPlanGeneration,
        addReview,
        fileDispute,
        resolveDisputeAction,
        approvePTVerification,
        rejectPTVerification,
        requestAdditionalDocs,
        blockPT,
        releaseSettlement,
        markNotificationsAsRead
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
