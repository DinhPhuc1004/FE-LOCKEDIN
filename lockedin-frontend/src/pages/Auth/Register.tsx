// src/pages/Auth/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, User, Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';

const Register: React.FC = () => {
  const [role, setRole] = useState<'customer' | 'pt'>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend validations to match backend regex constraints
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.');
      return;
    }

    const passRegex = /^(?=.*[a-zA-Z])(?=.*\d).+$/;
    if (password.length < 8 || !passRegex.test(password)) {
      setError('Mật khẩu phải dài tối thiểu 8 ký tự và chứa ít nhất một chữ cái và một chữ số.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, role, phone, password);
      navigate(role === 'pt' ? '/pt/packages' : '/onboarding');
    } catch (err: any) {
      console.error('Registration failed:', err);
      let errMsg = 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const msgList: string[] = [];
        Object.keys(errors).forEach((key) => {
          if (Array.isArray(errors[key])) {
            msgList.push(...errors[key]);
          }
        });
        errMsg = msgList.join(' | ');
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src={logoImg} alt="LockedIn Logo" className="h-20 w-auto object-contain" />
          </Link>
        </div>

        <div className="mb-8">
          <p className="section-label mb-3">Bắt Đầu Ngay Hôm Nay</p>
          <h1 className="font-montserrat font-black text-4xl text-white uppercase tracking-wider">Tạo Tài Khoản</h1>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {([
            { id: 'customer', label: 'Người Tập Luyện', icon: User, desc: 'Tìm HLV & theo dõi tiến trình' },
            { id: 'pt', label: 'Huấn Luyện Viên', icon: Dumbbell, desc: 'Đăng ký nhận học viên' },
          ] as const).map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-start p-5 border-2 cursor-pointer transition-all duration-200 text-left ${
                  role === r.id
                    ? 'border-brand-red bg-brand-red/10'
                    : 'border-brand-border hover:border-white/20 bg-brand-surface'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center mb-3 ${role === r.id ? 'bg-brand-red' : 'bg-brand-dark'}`}>
                  <Icon size={16} className="text-white" />
                </div>
                <p className={`font-semibold text-sm mb-1 ${role === r.id ? 'text-white' : 'text-white/60'}`}>{r.label}</p>
                <p className="text-white/30 text-xs">{r.desc}</p>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 border border-brand-red bg-brand-red/10 px-4 py-3 text-brand-red text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Họ và Tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              className="input-dark"
            />
          </div>

          <div>
            <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="input-dark"
            />
          </div>

          <div>
            <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Số Điện Thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ví dụ: 0987654321"
              required
              className="input-dark"
            />
          </div>

          <div>
            <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Mật Khẩu</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự (chứa chữ và số)"
                required
                minLength={8}
                className="input-dark pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <p className="text-white/20 text-xs leading-relaxed">
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <button 
              type="button" 
              onClick={() => setShowTerms(true)}
              className="text-white/50 hover:text-brand-red transition-colors underline cursor-pointer bg-transparent border-0 p-0 outline-none text-xs"
            >
              Điều Khoản Dịch Vụ
            </button>
            {' '}và{' '}
            <button 
              type="button" 
              onClick={() => setShowPrivacy(true)}
              className="text-white/50 hover:text-brand-red transition-colors underline cursor-pointer bg-transparent border-0 p-0 outline-none text-xs"
            >
              Chính Sách Bảo Mật
            </button>.
          </p>

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full justify-center py-4 text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>Tạo Tài Khoản <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-8">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-white hover:text-brand-red transition-colors font-semibold">
            Đăng nhập
          </Link>
        </p>
      </div>

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-brand-dark border-2 border-brand-border p-6 w-full max-w-2xl max-h-[80vh] flex flex-col relative">
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer transition-colors text-lg"
            >
              &times;
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-montserrat font-bold text-lg text-white uppercase tracking-wider">Điều Khoản Dịch Vụ (LockedIn)</h3>
            </div>

            <div className="overflow-y-auto text-white/60 text-sm leading-relaxed pr-2 flex-1 flex flex-col gap-4">
              <p>Chào mừng bạn đến với <strong>LockedIn</strong>. Bằng cách đăng ký tài khoản và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản sau:</p>
              
              <div>
                <h4 className="text-white font-semibold mb-1">1. Tài Khoản Người Dùng</h4>
                <p>Bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật khi tạo tài khoản. Bạn có trách nhiệm bảo mật thông tin mật khẩu và chịu trách nhiệm cho mọi hoạt động diễn ra dưới tài khoản của mình.</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-1">2. Dịch Vụ Huấn Luyện & Giao Dịch Ký Quỹ (Escrow)</h4>
                <p>LockedIn cung cấp cổng kết nối giữa Học viên và Huấn luyện viên (PT). Tiền thanh toán khóa học sẽ được giữ trong hệ thống ký quỹ (Escrow) của LockedIn và chỉ giải phóng (thanh toán cho PT) khi các buổi học đã hoàn thành theo lộ trình cam kết.</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-1">3. Chính Sách Huỷ Khóa Học & Hoàn Tiền</h4>
                <p>Học viên và PT được yêu cầu thỏa thuận lịch tập trước khi bắt đầu. Nếu xảy ra tranh chấp hoặc PT không thực hiện đúng nghĩa vụ dạy học, Học viên có quyền gửi yêu cầu "Khiếu Nại" kèm minh chứng để hệ thống xem xét hoàn trả tiền ký quỹ.</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-1">4. Quy Tắc Ứng Xử</h4>
                <p>Mọi thành viên cam kết ứng xử văn minh lịch sự trên không gian phòng chat chung và trong các buổi tập thực tế. Nghiêm cấm mọi hành vi gian lận, xúc phạm danh dự hoặc chia sẻ nội dung độc hại trên nền tảng.</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-1">5. Thay Đổi Điều Khoản</h4>
                <p>LockedIn có quyền thay đổi điều khoản dịch vụ này bất kỳ lúc nào. Chúng tôi sẽ thông báo cho bạn thông qua email hoặc giao diện ứng dụng trước khi áp dụng các thay đổi lớn.</p>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="btn-primary py-2 px-6 text-xs uppercase tracking-wider cursor-pointer"
              >
                ĐÃ ĐỌC & ĐỒNG Ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-brand-dark border-2 border-brand-border p-6 w-full max-w-2xl max-h-[80vh] flex flex-col relative">
            <button
              type="button"
              onClick={() => setShowPrivacy(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer transition-colors text-lg"
            >
              &times;
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-montserrat font-bold text-lg text-white uppercase tracking-wider">Chính Sách Bảo Mật (LockedIn)</h3>
            </div>

            <div className="overflow-y-auto text-white/60 text-sm leading-relaxed pr-2 flex-1 flex flex-col gap-4">
              <p>Chính Sách Bảo Mật này giải thích cách <strong>LockedIn</strong> thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi tham gia nền tảng:</p>
              
              <div>
                <h4 className="text-white font-semibold mb-1">1. Thông Tin Thu Thập</h4>
                <p>Chúng tôi thu thập các thông tin bạn cung cấp trực tiếp như: Họ và tên, Email, Số điện thoại, Ảnh đại diện, và các minh chứng (CCCD, Chứng chỉ HLV đối với PT) nhằm mục đích xác thực tài khoản và đảm bảo an toàn cho học viên.</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-1">2. Sử Dụng Thông Tin</h4>
                <p>Thông tin của bạn được sử dụng để: Cung cấp và duy trì dịch vụ LockedIn, kết nối Học viên với PT phù hợp, gửi thông báo xác nhận lịch học, xử lý các giao dịch thanh toán và hỗ trợ giải quyết tranh chấp khiếu nại.</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-1">3. Chia Sẻ Thông Tin</h4>
                <p>Chúng tôi cam kết không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. Thông tin của bạn chỉ được chia sẻ giữa Học viên và PT được chỉ định trong cùng lớp học để phục vụ việc liên hệ tập luyện.</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-1">4. Bảo Mật Dữ Liệu</h4>
                <p>LockedIn áp dụng các biện pháp bảo mật chuẩn hóa SSL/TLS để mã hóa dữ liệu truyền tải. Dữ liệu nhạy cảm như thông tin xác thực tài khoản và thanh toán được bảo vệ nghiêm ngặt trên hệ thống máy chủ cơ sở dữ liệu an toàn.</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-1">5. Quyền Của Người Dùng</h4>
                <p>Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình bất kỳ lúc nào trực tiếp trong phần quản lý Hồ sơ tài khoản hoặc liên hệ trực tiếp với bộ phận chăm sóc khách hàng của LockedIn.</p>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="btn-primary py-2 px-6 text-xs uppercase tracking-wider cursor-pointer"
              >
                ĐÃ ĐỌC & ĐỒNG Ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
