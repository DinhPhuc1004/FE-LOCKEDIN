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
        <Link to="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity w-max">
          <img src={logoImg} alt="LockedIn Logo" className="h-12 w-auto object-contain" />
        </Link>

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
            <a href="#" className="text-white/50 hover:text-brand-red transition-colors">Điều Khoản Dịch Vụ</a>
            {' '}và{' '}
            <a href="#" className="text-white/50 hover:text-brand-red transition-colors">Chính Sách Bảo Mật</a>.
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
    </div>
  );
};

export default Register;
