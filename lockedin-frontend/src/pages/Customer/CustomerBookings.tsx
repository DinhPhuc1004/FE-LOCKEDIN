// src/pages/Customer/CustomerBookings.tsx
import React, { useState } from 'react';
import { Calendar, List, Clock, MapPin, MessageSquare, ArrowRight, XCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Badge from '../../components/Badge';

const STATUS_MAP: Record<string, { label: string; variant: 'red' | 'white' | 'gray' | 'outline' }> = {
  Unpaid: { label: 'Chưa Thanh Toán', variant: 'outline' },
  PaidPendingAcceptance: { label: 'Chờ HLV Duyệt', variant: 'outline' },
  Active: { label: 'Đang Hoạt Động', variant: 'red' },
  Completed: { label: 'Hoàn Thành', variant: 'white' },
  Cancelled: { label: 'Đã Hủy', variant: 'gray' },
};

const CustomerBookings: React.FC = () => {
  const { bookings, workspaces, cancelBooking, addReview } = useData();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleOpenReview = (booking: any) => {
    setSelectedBookingForReview(booking);
    setRating(5);
    setComment('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReview || submittingReview) return;
    setSubmittingReview(true);
    try {
      await addReview(selectedBookingForReview.ptId, rating, comment);
      setSelectedBookingForReview(null);
      alert('Cảm ơn bạn đã gửi nhận xét đánh giá!');
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      alert('Không thể gửi đánh giá lúc này.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calendar data helper
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  
  // Find completed sessions count from workspaces list
  const getSessionsCompleted = (bookingId: string, defaultValue = 0) => {
    const ws = workspaces.find(w => w.bookingId === bookingId);
    return ws ? ws.sessionsCompleted : defaultValue;
  };

  const activeCount = bookings.filter(b => b.status === 'Active').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const pendingCount = bookings.filter(b => b.status === 'PaidPendingAcceptance' || b.status === 'Unpaid').length;

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu đặt lịch này không?')) return;
    try {
      await cancelBooking(bookingId);
    } catch (e) {
      console.error('Failed to cancel booking:', e);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black mobile-content-pad">
      {/* Header */}
      <div className="border-b border-brand-border bg-brand-dark">
        <div className="section-container py-10">
          <p className="section-label mb-2">Lịch Đặt</p>
          <div className="flex items-center justify-between">
            <h1 className="page-title">Lịch Tập Của Tôi</h1>
            <div className="flex border border-brand-border overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest cursor-pointer transition-colors ${view === 'list' ? 'bg-brand-red text-white' : 'text-white/40 hover:text-white'}`}
              >
                <List size={14} />
                Danh Sách
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest cursor-pointer transition-colors ${view === 'calendar' ? 'bg-brand-red text-white' : 'text-white/40 hover:text-white'}`}
              >
                <Calendar size={14} />
                Lịch
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Đang Hoạt Động', value: activeCount },
            { label: 'Chờ Xử Lý / Thanh Toán', value: pendingCount },
            { label: 'Khóa Đã Hoàn Thành', value: completedCount },
          ].map((s, i) => (
            <div key={i} className="bg-brand-surface border border-brand-border p-5 text-center">
              <p className="font-display text-4xl text-white mb-1 font-bold">{s.value}</p>
              <p className="text-white/30 text-xs uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* LIST VIEW */}
        {view === 'list' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {bookings.length === 0 ? (
              <div className="bg-brand-surface border border-brand-border p-12 text-center text-white/30 text-sm">
                Bạn chưa thực hiện đặt lịch huấn luyện viên nào.
              </div>
            ) : (
              bookings.map((b) => {
                const stat = STATUS_MAP[b.status] || { label: b.status, variant: 'gray' };
                const completedSessions = getSessionsCompleted(b.id, b.status === 'Completed' ? b.sessionsCount : 0);
                const progress = Math.round((completedSessions / b.sessionsCount) * 100) || 0;
                const initials = b.ptName ? b.ptName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'PT';
                
                return (
                  <div key={b.id} className={`bg-brand-surface border transition-all duration-300 ${b.status === 'Active' ? 'border-brand-red' : 'border-brand-border hover:border-brand-red/50'}`}>
                    {b.status === 'Active' && <div className="h-0.5 w-full bg-brand-red" />}
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-brand-dark border border-brand-border flex items-center justify-center flex-shrink-0">
                            <span className="font-display text-xl text-white font-bold">{initials}</span>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                              <h3 className="font-semibold text-white">{b.ptName || 'Huấn Luyện Viên'}</h3>
                              <Badge variant={stat.variant}>{stat.label}</Badge>
                            </div>
                            <p className="text-white/40 text-sm mb-3">{b.packageName || 'Gói Tập Luyện'}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-white/40">
                              <span className="flex items-center gap-1"><Calendar size={12} />{new Date(b.createdAt).toLocaleDateString('vi-VN')}</span>
                              <span className="flex items-center gap-1"><Clock size={12} />{new Date(b.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="flex items-center gap-1"><MapPin size={12} />Lớp Online</span>
                            </div>
                          </div>
                        </div>

                        <div className="sm:text-right flex-shrink-0">
                          <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Số buổi</p>
                          <p className="text-white font-bold font-mono">{completedSessions}/{b.sessionsCount}</p>
                          <p className="text-white/30 text-xs">đã tập</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {(b.status === 'Active' || b.status === 'Completed') && (
                        <div className="mt-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-white/30 text-xs uppercase tracking-wider">Tiến trình khóa tập</span>
                            <span className="text-white text-xs font-semibold">{progress}%</span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-brand-border justify-between">
                        <div className="flex gap-2">
                          {b.status === 'Active' && (
                            <Link to="/customer/workspace" className="btn-primary text-xs py-2.5 px-5">
                              <MessageSquare size={12} />
                              Vào Workspace & Chat
                            </Link>
                          )}
                          {b.status === 'Completed' && (
                            <button
                              onClick={() => handleOpenReview(b)}
                              className="btn-primary text-xs py-2.5 px-5 bg-white text-black hover:bg-white/80"
                            >
                              ★ Đánh Giá HLV
                            </button>
                          )}
                          {b.status === 'Unpaid' && (
                            <Link to={`/checkout/${b.id}`} className="btn-primary text-xs py-2.5 px-5 bg-brand-red hover:bg-brand-red-dark">
                              <CreditCard size={12} />
                              Thanh Toán Ngay
                            </Link>
                          )}
                          {(b.status === 'Unpaid' || b.status === 'PaidPendingAcceptance') && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              className="flex items-center gap-1.5 px-4 py-2 border border-brand-border text-brand-red hover:bg-brand-red/10 text-xs uppercase tracking-widest cursor-pointer transition-colors"
                            >
                              <XCircle size={12} />
                              Hủy Đặt Lịch
                            </button>
                          )}
                        </div>
                        <span className="text-white/50 text-sm font-semibold font-mono">
                          {b.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Find more */}
            <Link
              to="/marketplace"
              className="border border-dashed border-brand-border p-8 text-center text-white/30 hover:border-brand-red hover:text-white transition-all duration-300 flex flex-col items-center gap-2"
            >
              <span className="font-montserrat font-extrabold text-2xl uppercase tracking-wider">Đặt Lịch Thêm</span>
              <span className="flex items-center gap-2 text-sm">Tìm Thêm Huấn Luyện Viên <ArrowRight size={14} /></span>
            </Link>
          </div>
        )}

        {/* CALENDAR VIEW */}
        {view === 'calendar' && (
          <div className="animate-fade-in">
            <div className="bg-brand-surface border border-brand-border overflow-hidden">
              {/* Calendar header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-dark">
                <h3 className="font-display text-xl text-white uppercase tracking-wider">
                  Tháng {today.getMonth() + 1} / {today.getFullYear()}
                </h3>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <div className="w-3 h-3 bg-brand-red" /> Ngày Có Buổi (Dự kiến)
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40 ml-4">
                    <div className="w-3 h-3 border border-white" /> Hôm Nay
                  </div>
                </div>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 border-b border-brand-border">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
                  <div key={d} className="py-3 text-center text-white/30 text-xs uppercase tracking-widest">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="border-b border-r border-brand-border h-16" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === today.getDate();
                  
                  // Calculate estimated session days dynamically
                  // e.g. For active bookings, assuming 3 sessions a week (M, W, F) starting from createdAt
                  const hasSession = bookings.filter(b => b.status === 'Active').some(b => {
                    const start = new Date(b.createdAt);
                    if (start.getMonth() === today.getMonth() && start.getFullYear() === today.getFullYear()) {
                       // Very simple estimation logic: 3 sessions a week starting from createdAt date
                       // For simplicity, let's just spread them evenly every 2 days
                       for(let s = 0; s < b.sessionsCount; s++) {
                         const sessionDate = new Date(start.getTime() + s * 2 * 24 * 3600 * 1000);
                         if (sessionDate.getMonth() === today.getMonth() && sessionDate.getDate() === day) {
                           return true;
                         }
                       }
                    }
                    return false;
                  });

                  return (
                    <div
                      key={day}
                      className={`h-16 border-b border-r border-brand-border p-2 transition-colors duration-150 ${
                        hasSession ? 'bg-brand-red/10 hover:bg-brand-red/20' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        isToday ? 'w-6 h-6 bg-brand-red text-white flex items-center justify-center text-xs' :
                        hasSession ? 'text-white font-bold' : 'text-white/40'
                      }`}>
                        {day}
                      </span>
                      {hasSession && (
                        <div className="mt-1">
                          <div className="w-full h-1 bg-brand-red opacity-80" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-bar">
        {[
          { label: 'Trang Chủ', icon: '⚡', path: '/' },
          { label: 'Tìm PT', icon: '🔍', path: '/marketplace' },
          { label: 'Lịch', icon: '📅', path: '/customer/bookings' },
          { label: 'Chat', icon: '💬', path: '/customer/workspace' },
          { label: 'Hồ Sơ', icon: '👤', path: '/customer/profile' },
        ].map((tab, i) => (
          <Link key={i} to={tab.path} className="flex flex-col items-center gap-1 px-3 py-1">
            <span className="text-xl">{tab.icon}</span>
            <span className="text-white/50 text-[10px] uppercase tracking-widest">{tab.label}</span>
          </Link>
        ))}
      </nav>
      {/* Review Modal */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-brand-dark border border-brand-border animate-fade-up">
            <div className="h-0.5 w-full bg-brand-red" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h3 className="font-montserrat font-bold text-lg text-white uppercase tracking-widest">Đánh Giá Huấn Luyện Viên</h3>
              <button onClick={() => setSelectedBookingForReview(null)} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitReview} className="p-6">
              <div className="mb-5">
                <p className="text-white/60 text-sm mb-3">Vui lòng chọn số sao đánh giá cho HLV:</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl cursor-pointer transition-colors ${
                        star <= rating ? 'text-brand-red' : 'text-white/20'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Nhận xét của bạn</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm tập luyện của bạn với HLV này..."
                  required
                  rows={4}
                  className="input-dark resize-none w-full"
                  disabled={submittingReview}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForReview(null)}
                  className="btn-secondary flex-1 text-xs py-3"
                  disabled={submittingReview}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-xs py-3 justify-center"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
