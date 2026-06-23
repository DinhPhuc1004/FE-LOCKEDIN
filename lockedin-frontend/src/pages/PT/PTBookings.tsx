// src/pages/PT/PTBookings.tsx
import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, MessageSquare, XCircle, AlertCircle, X, ExternalLink } from 'lucide-react';
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
  const [filter, setFilter] = useState<'all' | 'Active' | 'Completed' | 'PaidPendingAcceptance' | 'Settlement'>('all');
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<any>(null);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loadingSettlements, setLoadingSettlements] = useState(false);

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

  React.useEffect(() => {
    if (filter === 'Settlement') {
      const fetchSettlements = async () => {
        setLoadingSettlements(true);
        try {
          const { default: api } = await import('../../services/api');
          const res = await api.get('/settlements/my');
          if (res.data?.success) {
            setSettlements(res.data.data);
          }
        } catch (e) {
          console.error('Failed to fetch settlements:', e);
        } finally {
          setLoadingSettlements(false);
        }
      };
      fetchSettlements();
    }
  }, [filter]);

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
          {(['all', 'Active', 'PaidPendingAcceptance', 'Completed', 'Settlement'] as const).map((f) => {
            const labels = { 
              all: 'Tất Cả', 
              Active: 'Đang Hoạt Động', 
              PaidPendingAcceptance: 'Yêu Cầu Chờ Duyệt', 
              Completed: 'Hoàn Thành',
              Settlement: 'Thu Nhập'
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

        {/* Booking & Settlement lists */}
        <div className="flex flex-col gap-4">
          {filter === 'Settlement' ? (
            <div className="animate-fade-in">
              {loadingSettlements ? (
                <div className="text-center py-10 text-white/40">Đang tải dữ liệu thu nhập...</div>
              ) : settlements.length === 0 ? (
                <div className="bg-brand-surface border border-brand-border p-12 text-center text-white/30 text-sm">
                  Chưa có dữ liệu thu nhập / đối soát.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settlements.map((s) => (
                    <div key={s.id} className="bg-brand-surface border border-brand-border p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Mã Đối Soát</p>
                          <p className="font-mono text-white/80">{s.id.substring(0, 8)}</p>
                        </div>
                        <Badge variant={s.status === 2 ? 'white' : 'outline'}>
                          {s.status === 1 ? 'Đang Xử Lý' : s.status === 2 ? 'Đã Thanh Toán' : 'Lỗi'}
                        </Badge>
                      </div>
                      <div className="mb-4">
                        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Số Tiền (VNĐ)</p>
                        <p className="text-2xl font-bold font-mono text-white">
                          {s.amount.toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                      <div className="flex justify-between text-xs text-white/40">
                        <span>Lịch đặt: <span className="font-mono text-white/60">{s.bookingId.substring(0, 8)}</span></span>
                        <span>Ngày tạo: {new Date(s.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : filtered.length === 0 ? (
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
                      {/* Left Block: Clickable Customer Information */}
                      <div 
                        className="flex items-start gap-4 cursor-pointer group"
                        onClick={() => setSelectedDetailBooking(b)}
                        title="Xem chi tiết lịch đặt"
                      >
                        <div className="w-12 h-12 bg-brand-dark border border-brand-border flex items-center justify-center flex-shrink-0 group-hover:border-brand-red transition-colors duration-200">
                          <span className="font-montserrat font-extrabold text-base text-white font-bold group-hover:text-brand-red transition-colors duration-200">{initials}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="font-semibold text-white group-hover:text-brand-red transition-colors duration-200">{b.customerName || 'Học Viên'}</h3>
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
                        <button
                          onClick={() => setSelectedDetailBooking(b)}
                          className="flex items-center gap-1.5 px-4 py-2 border border-brand-border text-white hover:border-brand-red hover:text-brand-red text-xs uppercase tracking-widest cursor-pointer transition-all"
                        >
                          Xem Chi Tiết
                        </button>
                        
                        {(b.status === 'Active' || b.status === 'Completed') && (
                          <>
                            <Link 
                              to={`/pt/workspace?bookingId=${b.id}`} 
                              className="flex items-center gap-1.5 px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs uppercase tracking-widest cursor-pointer transition-colors"
                            >
                              <MessageSquare size={12} />
                              Hội Thoại
                            </Link>
                            {b.status === 'Active' && (
                              <button
                                onClick={() => handleComplete(b.id)}
                                className="flex items-center gap-1.5 px-4 py-2 border border-brand-border text-white/60 hover:border-white hover:text-white text-xs uppercase tracking-widest cursor-pointer transition-all"
                              >
                                <CheckCircle size={12} />
                                Đánh Dấu Hoàn Thành
                              </button>
                            )}
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

      {/* Booking Details Modal */}
      {selectedDetailBooking && (() => {
        const b = selectedDetailBooking;
        const stat = STATUS_MAP[b.status] || { label: b.status, variant: 'gray' };
        const ws = getWorkspaceForBooking(b.id);
        const completedSessions = ws ? ws.sessionsCompleted : (b.status === 'Completed' ? b.sessionsCount : 0);
        const progress = Math.round((completedSessions / b.sessionsCount) * 100) || 0;
        const initials = b.customerName ? b.customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'HV';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-brand-dark border border-brand-border w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border bg-brand-surface/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-red flex items-center justify-center font-bold">
                    <span className="font-display text-sm text-white">{initials}</span>
                  </div>
                  <div>
                    <h3 className="font-montserrat font-bold text-white uppercase tracking-wide">Chi Tiết Lịch Đặt</h3>
                    <p className="text-white/30 text-[10px] font-mono mt-0.5">MÃ: {b.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDetailBooking(null)}
                  className="text-white/40 hover:text-white transition-colors cursor-pointer p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
                {/* Customer Section */}
                <div className="bg-brand-surface border border-brand-border/40 p-4">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Học Viên</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">{b.customerName}</span>
                    <span className="text-white/40 text-xs font-mono">{b.customerId}</span>
                  </div>
                </div>

                {/* Package details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-surface border border-brand-border/40 p-4">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Gói Luyện Tập</p>
                    <p className="text-white text-sm font-semibold truncate" title={b.packageName}>{b.packageName}</p>
                  </div>
                  <div className="bg-brand-surface border border-brand-border/40 p-4">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Học Phí Ký Quỹ</p>
                    <p className="text-brand-red text-sm font-bold font-mono">{b.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-surface border border-brand-border/40 p-4">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Số Buổi Tập</p>
                    <p className="text-white text-sm font-semibold">{b.sessionsCount} buổi</p>
                  </div>
                  <div className="bg-brand-surface border border-brand-border/40 p-4 flex flex-col justify-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Trạng Thái</p>
                    <div>
                      <Badge variant={stat.variant}>{stat.label}</Badge>
                    </div>
                  </div>
                </div>

                {/* Training progress details */}
                {(b.status === 'Active' || b.status === 'Completed') && (
                  <div className="bg-brand-surface border border-brand-border/40 p-4 flex flex-col gap-3">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Tiến Độ Luyện Tập</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60">{completedSessions}/{b.sessionsCount} buổi hoàn thành</span>
                      <span className="text-white font-bold font-mono">{progress}%</span>
                    </div>
                    <div className="progress-track h-2 bg-brand-dark">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    {ws?.ptNotes && (
                      <div className="mt-2 border-t border-brand-border/30 pt-3">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-bold">Ghi Chú Của PT</p>
                        <p className="text-xs text-white/70 italic leading-relaxed">{ws.ptNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Info */}
                <div className="bg-brand-surface border border-brand-border/40 p-4 text-xs flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-white/30">Ngày Đăng Ký:</span>
                    <span className="text-white/70">{new Date(b.createdAt).toLocaleDateString('vi-VN')} {new Date(b.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 border-t border-brand-border bg-brand-surface/20 flex items-center justify-end gap-3 flex-wrap">
                {b.status === 'PaidPendingAcceptance' && (
                  <>
                    <button
                      onClick={() => {
                        handleAccept(b.id);
                        setSelectedDetailBooking(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs uppercase tracking-widest cursor-pointer transition-colors"
                    >
                      <CheckCircle size={12} />
                      Chấp Nhận
                    </button>
                    <button
                      onClick={() => {
                        handleReject(b.id);
                        setSelectedDetailBooking(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 border border-brand-border text-white/40 hover:text-white text-xs uppercase tracking-widest cursor-pointer transition-colors"
                    >
                      <XCircle size={12} />
                      Từ Chối
                    </button>
                  </>
                )}

                {(b.status === 'Active' || b.status === 'Completed') && (
                  <Link
                    to={`/pt/workspace?bookingId=${b.id}`}
                    onClick={() => setSelectedDetailBooking(null)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs uppercase tracking-widest cursor-pointer transition-colors"
                  >
                    <ExternalLink size={12} />
                    Vào Phòng Trò Chuyện
                  </Link>
                )}

                <button
                  onClick={() => setSelectedDetailBooking(null)}
                  className="px-4 py-2 border border-brand-border hover:border-white text-white/60 hover:text-white text-xs uppercase tracking-widest cursor-pointer transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default PTBookings;
