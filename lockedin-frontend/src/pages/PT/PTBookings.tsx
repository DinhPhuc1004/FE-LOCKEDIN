// src/pages/PT/PTBookings.tsx
import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, MessageSquare, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Badge from '../../components/Badge';

const STATUS_MAP: Record<string, { label: string; variant: 'red' | 'white' | 'gray' | 'outline' }> = {
  Unpaid: { label: 'Chờ Học Viên Trả Tiền', variant: 'outline' },
  PaidPendingAcceptance: { label: 'Chờ Duyệt Giao Dịch', variant: 'outline' },
  Active: { label: 'Đang Hoạt Động', variant: 'red' },
  Completed: { label: 'Hoàn Thành', variant: 'white' },
  Cancelled: { label: 'Đã Hủy / Từ Chối', variant: 'gray' },
};

const PTBookings: React.FC = () => {
  const { bookings, workspaces, acceptBooking, rejectBooking, completeCourse } = useData();
  const [filter, setFilter] = useState<'all' | 'Active' | 'Completed' | 'PaidPendingAcceptance'>('all');

  // Filter bookings based on status
  const filtered = filter === 'all' 
    ? bookings 
    : bookings.filter((b) => b.status === filter);

  // Calculate stats
  const activeCount = bookings.filter((b) => b.status === 'Active').length;
  const completedCount = bookings.filter((b) => b.status === 'Completed').length;
  const pendingCount = bookings.filter((b) => b.status === 'PaidPendingAcceptance').length;
  
  // Total PT revenue (excluding unpaid and cancelled)
  const totalRevenue = bookings
    .filter((b) => b.status !== 'Unpaid' && b.status !== 'Cancelled')
    .reduce((sum, b) => sum + b.price, 0);

  // Helper to find workspace associated with a booking
  const getWorkspaceForBooking = (bookingId: string) => {
    return workspaces.find(w => w.bookingId === bookingId);
  };

  const handleAccept = async (bookingId: string) => {
    if (!window.confirm('Bạn có đồng ý nhận học viên này và bắt đầu khóa tập không?')) return;
    try {
      await acceptBooking(bookingId);
    } catch (e) {
      console.error('Failed to accept booking:', e);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu đặt lịch này không? Tiền sẽ được hoàn lại cho học viên.')) return;
    try {
      await rejectBooking(bookingId);
    } catch (e) {
      console.error('Failed to reject booking:', e);
    }
  };

  const handleComplete = async (bookingId: string) => {
    const ws = getWorkspaceForBooking(bookingId);
    if (!ws) return;
    if (!window.confirm('Xác nhận hoàn thành khóa học này? Số tiền ký quỹ sẽ được giải ngân cho bạn.')) return;
    try {
      await completeCourse(ws.id);
    } catch (e) {
      console.error('Failed to complete course:', e);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black mobile-content-pad">
      {/* Header */}
      <div className="border-b border-brand-border bg-brand-dark">
        <div className="section-container py-10">
          <p className="section-label mb-2">Huấn Luyện Viên</p>
          <h1 className="page-title">Quản Lý Lịch Đặt</h1>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Đang Hoạt Động', value: activeCount, accent: true },
            { label: 'Hoàn Thành', value: completedCount, accent: false },
            { label: 'Chờ Phê Duyệt', value: pendingCount, accent: false },
            { label: 'Ký Quỹ / Doanh Thu', value: `${(totalRevenue / 1000000).toFixed(2)}M`, accent: false },
          ].map((s, i) => (
            <div key={i} className={`bg-brand-surface border p-5 text-center ${s.accent ? 'border-brand-red' : 'border-brand-border'}`}>
              {s.accent && <div className="h-0.5 w-full bg-brand-red -mt-5 mb-5 mx-[-1.25rem] w-[calc(100%+2.5rem)]" />}
              <p className="font-montserrat font-extrabold text-3xl text-white mb-1 font-bold">{s.value}</p>
              <p className="text-white/30 text-xs uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 border-b border-brand-border overflow-x-auto scrollbar-none">
          {(['all', 'Active', 'PaidPendingAcceptance', 'Completed'] as const).map((f) => {
            const labels = { 
              all: 'Tất Cả', 
              Active: 'Đang Hoạt Động', 
              PaidPendingAcceptance: 'Yêu Cầu Chờ Duyệt', 
              Completed: 'Hoàn Thành' 
            };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-3 text-xs uppercase tracking-widest cursor-pointer transition-all duration-200 border-b-2 whitespace-nowrap ${
                  filter === f 
                    ? 'text-white border-brand-red font-semibold' 
                    : 'text-white/40 border-transparent hover:text-white hover:border-white/20'
                }`}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>

        {/* Booking lists */}
        <div className="flex flex-col gap-4">
          {filtered.length === 0 ? (
            <div className="bg-brand-surface border border-brand-border p-12 text-center text-white/30 text-sm">
              Không tìm thấy lịch đặt nào phù hợp với bộ lọc.
            </div>
          ) : (
            filtered.map((b) => {
              const stat = STATUS_MAP[b.status] || { label: b.status, variant: 'gray' };
              const ws = getWorkspaceForBooking(b.id);
              const completedSessions = ws ? ws.sessionsCompleted : (b.status === 'Completed' ? b.sessionsCount : 0);
              const progress = Math.round((completedSessions / b.sessionsCount) * 100) || 0;
              const initials = b.customerName ? b.customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'HV';
              
              return (
                <div
                  key={b.id}
                  className={`bg-brand-surface border transition-all duration-300 ${b.status === 'Active' ? 'border-brand-red' : 'border-brand-border hover:border-brand-red/50'}`}
                >
                  {b.status === 'Active' && <div className="h-0.5 w-full bg-brand-red" />}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-brand-dark border border-brand-border flex items-center justify-center flex-shrink-0">
                          <span className="font-montserrat font-extrabold text-base text-white font-bold">{initials}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="font-semibold text-white">{b.customerName || 'Học Viên'}</h3>
                            <span className="text-white/30 text-xs font-mono">{b.id.substring(0, 8)}...</span>
                            <Badge variant={stat.variant}>{stat.label}</Badge>
                          </div>
                          <p className="text-white/40 text-sm mb-3">{b.packageName || 'Gói Tập Luyện'}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-white/30">
                            <span className="flex items-center gap-1"><Calendar size={11} />{new Date(b.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span className="flex items-center gap-1"><Clock size={11} />{new Date(b.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-white font-semibold font-mono">{b.price.toLocaleString('vi-VN')}đ</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions for PT */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {b.status === 'Active' && (
                          <>
                            <Link to="/pt/workspace" className="flex items-center gap-1.5 px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs uppercase tracking-widest cursor-pointer transition-colors">
                              <MessageSquare size={12} />
                              Hội Thoại
                            </Link>
                            <button
                              onClick={() => handleComplete(b.id)}
                              className="flex items-center gap-1.5 px-4 py-2 border border-brand-border text-white/60 hover:border-white hover:text-white text-xs uppercase tracking-widest cursor-pointer transition-all"
                            >
                              <CheckCircle size={12} />
                              Đánh Dấu Hoàn Thành
                            </button>
                          </>
                        )}
                        {b.status === 'PaidPendingAcceptance' && (
                          <>
                            <button
                              onClick={() => handleAccept(b.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs uppercase tracking-widest cursor-pointer transition-colors"
                            >
                              <CheckCircle size={12} />
                              Chấp Nhận
                            </button>
                            <button
                              onClick={() => handleReject(b.id)}
                              className="flex items-center gap-1.5 px-4 py-2 border border-brand-border text-white/40 hover:text-white text-xs uppercase tracking-widest cursor-pointer transition-colors"
                            >
                              <XCircle size={12} />
                              Từ Chối
                            </button>
                          </>
                        )}
                        {b.status === 'Unpaid' && (
                          <div className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-widest">
                            <AlertCircle size={12} /> Chờ thanh toán điện tử
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress tracking */}
                    {(b.status === 'Active' || b.status === 'Completed') && (
                      <div className="mt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-white/30 text-xs">{completedSessions}/{b.sessionsCount} buổi đã tập xong</span>
                          <span className="text-white text-xs font-semibold">{progress}%</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PTBookings;
