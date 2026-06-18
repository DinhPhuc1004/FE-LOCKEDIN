// src/pages/Home.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Award, TrendingUp, CheckCircle, ChevronRight, Zap, Pause, Play, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PTHome from './PT/PTHome';
import AdminHome from './AdminHome';
import muscularMan from '../assets/muscular-man.png';
import logoImg from '../assets/logo.png';

const FEATURED_PTS = [
  {
    id: 1,
    name: 'Nguyễn Văn Hùng',
    specialty: 'Tăng Cơ & Sức Mạnh',
    rating: 4.9,
    reviews: 142,
    price: 450000,
    experience: '8 năm kinh nghiệm',
    initials: 'NH',
  },
  {
    id: 2,
    name: 'Trần Thị Lan',
    specialty: 'Giảm Cân & Cardio',
    rating: 4.8,
    reviews: 98,
    price: 380000,
    experience: '5 năm kinh nghiệm',
    initials: 'TL',
  },
  {
    id: 3,
    name: 'Phạm Minh Đức',
    specialty: 'Yoga & Phục Hồi',
    rating: 5.0,
    reviews: 76,
    price: 420000,
    experience: '6 năm kinh nghiệm',
    initials: 'PD',
  },
];



const STEPS = [
  {
    num: '01',
    title: 'Tạo Hồ Sơ',
    desc: 'Nhập mục tiêu tập luyện, thông số cơ thể và thời gian rảnh của bạn vào hệ thống LockedIn.',
  },
  {
    num: '02',
    title: 'Chọn HLV',
    desc: 'Duyệt qua danh sách HLV được xác minh. So sánh chuyên môn, giá cả và đánh giá thực.',
  },
  {
    num: '03',
    title: 'Bắt Đầu Rèn Luyện',
    desc: 'Đặt lịch, thanh toán an toàn qua escrow, và bắt đầu hành trình chinh phục mục tiêu.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Nguyễn Minh Tuấn',
    role: 'Kế Toán Viên',
    text: 'Sau 3 tháng với HLV Hùng, tôi giảm được 12kg và tăng 8kg cơ. LockedIn thực sự thay đổi cuộc sống tôi.',
    rating: 5,
  },
  {
    name: 'Lê Thị Thu',
    role: 'Giáo Viên',
    text: 'Hệ thống thanh toán escrow rất minh bạch. Tôi yên tâm tập luyện mà không lo lắng về tài chính.',
    rating: 5,
  },
  {
    name: 'Trần Đức Khải',
    role: 'Kỹ Sư Phần Mềm',
    text: 'Báo cáo tiến độ chi tiết giúp tôi theo dõi tiến trình cực kỳ rõ ràng. Không còn đoán mò nữa!',
    rating: 5,
  },
];

const SLIDES = [
  { label: 'Quy Trình 3 Bước', desc: 'Cách thức bắt đầu luyện tập' },
  { label: 'HLV Nổi Bật', desc: 'Đội ngũ HLV hàng đầu' },
  { label: 'Đánh Giá Thực', desc: 'Phản hồi từ học viên' }
];


// Scroll animation hook
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={12}
        className={i < Math.floor(rating) ? 'text-white fill-white' : 'text-white/20'}
      />
    ))}
  </div>
);

const Home: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  useScrollAnimation();

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const playerRef = useRef<any>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initPlayer = () => {
      if (!iframeContainerRef.current) return;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }

      playerRef.current = new (window as any).YT.Player(iframeContainerRef.current, {
        videoId: 'qV-kw7l_ZNk',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          disablekb: 1,
          playsinline: 1,
          fs: 0,
          autohide: 1
        },
        events: {
          onReady: (event: any) => {
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              setIsVideoPlaying(true);
            }
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              event.target.seekTo(0);
              event.target.playVideo();
            }
          }
        }
      });
    };

    const loadYT = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        initPlayer();
      } else {
        (window as any).onYouTubeIframeAPIReady = () => {
          initPlayer();
        };
      }
    };

    if (!document.getElementById('youtube-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    loadYT();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [currentUser, currentRole]);

  if (currentUser && currentRole === 'pt') {
    return <PTHome />;
  }

  if (currentUser && currentRole === 'admin') {
    return <AdminHome />;
  }

  return (
    <div className="bg-brand-black min-h-screen mobile-content-pad">
      <style>{`
        @keyframes progress-ring {
          from {
            stroke-dashoffset: 113.1;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Fullscreen Hero Background Cinematic Video (Muted Autoplay Loop via API) */}
        <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 transition-opacity duration-1000 ${isVideoPlaying ? 'opacity-25' : 'opacity-0'}`}>
          <div 
            ref={iframeContainerRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] scale-110"
          />
          <div className="absolute inset-0 bg-brand-black/55 z-10" />
        </div>

        {/* Background grid lines */}
        <div className="absolute inset-0 opacity-5 z-10" style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Red vertical accent */}
        <div className="absolute top-0 right-1/3 w-px h-full bg-brand-red opacity-20 hidden lg:block z-10" />

        <div className="section-container relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center pb-24 lg:pb-32 pt-12 lg:pt-16 -translate-y-8 lg:-translate-y-16">
            {/* Left: Copy */}
            <div className="flex flex-col gap-8">
              {/* Label */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-brand-red" />
                <span className="section-label">Kết Nối Huấn Luyện Viên Chuyên Nghiệp</span>
              </div>

              {/* Headline */}
              <h1 className="font-montserrat font-black text-6xl sm:text-7xl lg:text-8xl text-white uppercase leading-[0.95] tracking-tight">
                ĐÁNH THỨC
                <span className="block text-brand-red">THỂ TRẠNG</span>
                ĐỈNH CAO
              </h1>

              {/* Subtext */}
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                LockedIn kết nối bạn với đội ngũ huấn luyện viên cá nhân chuyên nghiệp và xác minh uy tín. 
                Đồng hành xây dựng lộ trình tập luyện bài bản cùng hệ thống thanh toán an toàn, minh bạch qua ký quỹ escrow.
              </p>

              {/* CTA Group */}
              <div className="flex flex-wrap gap-4">
                <Link to="/marketplace" className="btn-primary text-base py-4 px-8 animate-pulse-red">
                  <Zap size={18} fill="white" />
                  Tìm HLV Của Bạn
                  <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn-secondary text-base py-4 px-8">
                  Đăng Ký Miễn Phí
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex -space-x-2">
                  {['NH', 'TL', 'PD', 'MK'].map((init, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-brand-surface border-2 border-black flex items-center justify-center text-xs font-bold text-white"
                      style={{ zIndex: 4 - i }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className="text-white fill-white" />
                    ))}
                  </div>
                  <p className="text-xs text-white/50">10,000+ người dùng tin tưởng</p>
                </div>
              </div>
            </div>

            {/* Right: Large Muscular Man Image Visual */}
            <div className="relative flex items-center justify-center h-[500px] lg:h-[750px] xl:h-[850px] w-full pt-8 lg:pt-12">
              <img 
                src={muscularMan} 
                alt="Thể trạng" 
                className="h-[110%] lg:h-[120%] xl:h-[135%] max-h-[90vh] w-auto object-contain object-bottom opacity-65 select-none pointer-events-none drop-shadow-[0_0_45px_rgba(230,0,0,0.2)] origin-bottom transition-all duration-500 scale-105" 
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-white/0 via-white/40 to-white/0" />
        </div>
      </section>



      {/* ─── INTERACTIVE PORTAL CAROUSEL (3-IN-1 AUTOMATIC SLIDER) ─── */}
      <section 
        id="how-it-works"
        className="py-20 lg:py-28 bg-brand-black border-y border-brand-border"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="section-container">
          {/* Slides Container */}
          <div className="relative min-h-[500px] md:min-h-[420px] lg:min-h-[480px]">
            
            {/* ─── SLIDE 1: HOW IT WORKS ─── */}
            <div className={`transition-all duration-500 ease-in-out ${
              activeSlide === 0 
                ? 'opacity-100 translate-y-0 scale-100 z-10 relative' 
                : 'opacity-0 translate-y-4 scale-95 pointer-events-none absolute inset-0 z-0'
            }`}>
              <div className="text-center mb-12">
                <p className="section-label mb-3">Quy Trình Đơn Giản</p>
                <h3 className="font-montserrat font-extrabold text-4xl lg:text-5xl text-white uppercase tracking-wider">
                  Bắt Đầu Trong <span className="text-brand-red">3 Bước</span>
                </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-0 border border-brand-border bg-brand-surface/25">
                {STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`p-10 border-brand-border group hover:bg-brand-surface/50 transition-colors duration-300 ${
                      i < STEPS.length - 1 ? 'border-b md:border-b-0 md:border-r' : ''
                    }`}
                  >
                    <div className="font-montserrat font-black text-6xl text-brand-red/20 group-hover:text-brand-red/40 transition-colors duration-300 mb-6 leading-none">
                      {step.num}
                    </div>
                    <h4 className="font-montserrat font-bold text-xl text-white uppercase tracking-wider mb-3">
                      {step.title}
                    </h4>
                    <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── SLIDE 2: FEATURED PTs ─── */}
            <div className={`transition-all duration-500 ease-in-out ${
              activeSlide === 1 
                ? 'opacity-100 translate-y-0 scale-100 z-10 relative' 
                : 'opacity-0 translate-y-4 scale-95 pointer-events-none absolute inset-0 z-0'
            }`}>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="section-label mb-3">Đội Ngũ HLV</p>
                  <h3 className="font-montserrat font-extrabold text-4xl lg:text-5xl text-white uppercase tracking-wider">
                    HLV Nổi Bật
                  </h3>
                </div>
                <Link
                  to="/marketplace"
                  className="flex items-center gap-2 text-xs text-white/50 hover:text-white uppercase tracking-widest transition-colors duration-200"
                >
                  Xem Tất Cả <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {FEATURED_PTS.map((pt) => (
                  <div
                    key={pt.id}
                    className="card-dark group p-0 overflow-hidden bg-brand-surface/40 hover:bg-brand-surface/80"
                  >
                    <div className="relative p-6 border-b border-brand-border">
                      <div className="w-16 h-16 bg-brand-dark border border-brand-border group-hover:border-brand-red transition-colors duration-300 flex items-center justify-center mb-4">
                        <span className="font-display text-xl text-white">{pt.initials}</span>
                      </div>
                      <h4 className="font-semibold text-white text-base mb-0.5">{pt.name}</h4>
                      <p className="text-white/40 text-xs mb-2.5">{pt.experience}</p>
                      <span className="badge-red py-0.5 px-2 text-[10px]">{pt.specialty}</span>
                    </div>

                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <StarRating rating={pt.rating} />
                          <span className="text-white text-xs font-semibold">{pt.rating}</span>
                        </div>
                        <p className="text-white/30 text-[10px]">{pt.reviews} đánh giá</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-[9px] uppercase tracking-wider">Giá / Buổi</p>
                        <p className="text-white font-bold text-base">{pt.price.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <Link to="/marketplace" className="btn-primary w-full text-center text-[10px] py-2">
                        Đặt Lịch Ngay
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── SLIDE 3: TESTIMONIALS ─── */}
            <div className={`transition-all duration-500 ease-in-out ${
              activeSlide === 2 
                ? 'opacity-100 translate-y-0 scale-100 z-10 relative' 
                : 'opacity-0 translate-y-4 scale-95 pointer-events-none absolute inset-0 z-0'
            }`}>
              <div className="text-center mb-12">
                <p className="section-label mb-3">Đánh Giá Thực</p>
                <h3 className="font-montserrat font-extrabold text-4xl lg:text-5xl text-white uppercase tracking-wider">
                  Người Dùng Nói Gì
                </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {TESTIMONIALS.map((t, i) => (
                  <div
                    key={i}
                    className="card-dark p-8 flex flex-col gap-5 bg-brand-surface/40 hover:bg-brand-surface/80"
                  >
                    <div className="font-display text-5xl text-brand-red leading-none">"</div>
                    <p className="text-white/70 text-sm leading-relaxed -mt-4 flex-1">
                      {t.text}
                    </p>
                    <div className="flex items-center justify-between border-t border-brand-border pt-4">
                      <div>
                        <p className="text-white font-semibold text-xs">{t.name}</p>
                        <p className="text-white/30 text-[10px]">{t.role}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} size={10} className="text-white fill-white" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Nike-style Control Panel for 3-in-1 Carousel */}
          <div className="mt-12 grid grid-cols-3 items-center border-t border-brand-border pt-6">
            {/* Left Column: Autoplay Status */}
            <div className="text-xs text-white/30 hidden md:block">
              {!isPaused ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-brand-red animate-ping" />
                  Tự động chuyển slide sau 5s
                </span>
              ) : (
                <span className="flex items-center gap-2 text-white/20">
                  <span className="inline-block w-2 h-2 rounded-full bg-white/20" />
                  Đã tạm dừng tự động phát
                </span>
              )}
            </div>

            {/* Center Column: Dot Indicators */}
            <div className="flex justify-center gap-2.5 col-span-3 md:col-span-1">
              {SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === index ? 'bg-brand-red w-6' : 'bg-white/25 hover:bg-white/45'
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Right Column: Controls */}
            <div className="flex justify-end items-center gap-3 col-span-3 md:col-span-1 mt-4 md:mt-0">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="w-10 h-10 rounded-full border border-brand-border/60 hover:border-brand-red flex items-center justify-center text-white hover:text-brand-red transition-all cursor-pointer relative bg-brand-surface/40 hover:bg-brand-surface/80 hover:shadow-[0_0_12px_rgba(230,0,0,0.2)]"
                title={isPaused ? 'Phát tự động' : 'Tạm dừng'}
              >
                {/* Circular Progress Ring (Hidden when paused) */}
                {!isPaused && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      className="stroke-brand-red fill-none"
                      strokeWidth="2"
                      strokeDasharray="113.1"
                      strokeDashoffset="113.1"
                      style={{
                        animation: 'progress-ring 5s linear forwards',
                      }}
                      key={activeSlide} // Resets animation on slide change
                    />
                  </svg>
                )}
                {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
              </button>
              <button
                onClick={() => setActiveSlide((prev) => (prev - 1 + 3) % 3)}
                className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-white hover:text-brand-red hover:border-brand-red transition-all cursor-pointer bg-brand-surface/40 hover:bg-brand-surface/80 hover:shadow-[0_0_12px_rgba(230,0,0,0.2)]"
                title="Slide trước"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % 3)}
                className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-white hover:text-brand-red hover:border-brand-red transition-all cursor-pointer bg-brand-surface/40 hover:bg-brand-surface/80 hover:shadow-[0_0_12px_rgba(230,0,0,0.2)]"
                title="Slide tiếp theo"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY LOCKEDIN ─── */}
      <section className="py-24 lg:py-32">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll">
              <p className="section-label mb-4">Tại Sao Chọn Chúng Tôi</p>
              <h2 className="font-montserrat font-extrabold text-5xl lg:text-6xl text-white uppercase tracking-wider mb-8">
                An Toàn.<br />
                <span className="text-brand-red">Minh Bạch.</span><br />
                Hiệu Quả.
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">
                LockedIn không chỉ là ứng dụng tìm HLV. Chúng tôi là người bảo đảm 
                toàn bộ hành trình — từ kết nối, thanh toán escrow, đến theo dõi tiến trình tập luyện chi tiết.
              </p>

              <div className="flex flex-col gap-4">
                {[
                  'HLV được xác minh danh tính và chứng chỉ',
                  'Thanh toán escrow — tiền chỉ giải phóng khi hoàn thành',
                  'Báo cáo tiến độ trực quan để theo dõi kết quả thực tế',
                  'Tranh chấp được Admin giải quyết công bằng',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-brand-red flex-shrink-0 mt-0.5" />
                    <span className="text-white/70 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-4 animate-on-scroll">
              {[
                { icon: Award, title: 'HLV Xác Minh', desc: '100% có chứng chỉ chuyên nghiệp' },
                { icon: TrendingUp, title: 'Báo Cáo Tiến Độ', desc: 'Dữ liệu tập luyện chi tiết và trực quan' },
                { icon: Users, title: 'Cộng Đồng', desc: '10,000+ thành viên đang luyện tập' },
                { icon: Zap, title: 'AI Meal Plan', desc: 'Kế hoạch dinh dưỡng cá nhân hóa' },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="card-dark p-6">
                    <div className="w-10 h-10 bg-brand-red flex items-center justify-center mb-4">
                      <Icon size={18} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-2">{feature.title}</h4>
                    <p className="text-white/40 text-xs leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>



      {/* ─── FINAL CTA ─── */}
      <section className="py-24 lg:py-32">
        <div className="section-container">
          <div className="border border-brand-red/30 p-12 lg:p-20 text-center animate-on-scroll relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute inset-0 bg-brand-red opacity-5" />
            <div className="relative z-10">
              <p className="section-label mb-6">Bắt Đầu Ngay Hôm Nay</p>
              <h2 className="font-montserrat font-black text-6xl lg:text-8xl text-white uppercase tracking-tight mb-6">
                SẴN SÀNG<br />
                <span className="text-brand-red">CHINH PHỤC?</span>
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
                Hàng nghìn người đã bắt đầu hành trình chinh phục vóc dáng của họ. 
                Đây là lúc của bạn.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/marketplace" className="btn-primary text-base py-4 px-10">
                  <Zap size={18} fill="white" />
                  Tìm HLV Ngay
                </Link>
                <Link to="/register" className="btn-secondary text-base py-4 px-10">
                  Đăng Ký Miễn Phí
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-brand-border py-16 bg-brand-dark/30">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Column 1: Logo & Info */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="LockedIn Logo" className="h-10 w-auto object-contain" />
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                LockedIn là nền tảng kết nối huấn luyện viên cá nhân chuyên nghiệp và đồng hành tập luyện hàng đầu Việt Nam.
              </p>
              
              {/* Detailed Business & Contact Info */}
              <div className="text-xs text-white/30 flex flex-col gap-2 border-t border-brand-border/40 pt-4 mt-2">
                <p className="leading-relaxed">
                  <strong className="text-white/50">Văn phòng:</strong> Nhà văn hóa sinh viên TP.HCM, Lưu Hữu Phước, Đông Hoà, Dĩ An, Bình Dương, Vietnam
                </p>
                <p>
                  <strong className="text-white/50">Hotline:</strong> <span className="text-brand-red font-mono hover:underline cursor-pointer">+84 33 724 4845</span>
                </p>
                <p>
                  <strong className="text-white/50">Email:</strong> <span className="text-white/60 font-mono hover:underline cursor-pointer">lockedinisyourfriend@gmail.com</span>
                </p>
                <p className="text-[11px] text-white/20 mt-1">
                  GPĐKKD số: 0317896542 do Sở KH&ĐT TP.HCM cấp ngày 12/03/2026
                </p>
              </div>

              {/* Social links */}
              <div className="flex gap-4 mt-2">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-brand-border hover:border-brand-red hover:text-brand-red text-white/40 flex items-center justify-center transition-all duration-200 hover:shadow-[0_0_8px_rgba(255,0,0,0.4)]"
                  title="Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-brand-border hover:border-brand-red hover:text-brand-red text-white/40 flex items-center justify-center transition-all duration-200 hover:shadow-[0_0_8px_rgba(255,0,0,0.4)]"
                  title="Instagram"
                >
                  <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-brand-border hover:border-brand-red hover:text-brand-red text-white/40 flex items-center justify-center transition-all duration-200 hover:shadow-[0_0_8px_rgba(255,0,0,0.4)]"
                  title="YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.517 0-9.388.503a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.503 9.388.503 9.388.503s7.518 0 9.388-.503a3.003 3.003 0 0 0 2.11-2.11c.503-1.87 0-5.837 0-5.837s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2 & 3: Navigation Links */}
            {[
              { title: 'Nền Tảng', links: ['Tìm HLV', 'Bảng Giá', 'Lộ Trình', 'Blog'] },
              { title: 'Hỗ Trợ', links: ['Câu Hỏi Thường Gặp', 'Điều Khoản', 'Bảo Mật', 'Liên Hệ'] },
            ].map((col, i) => (
              <div key={i} className="md:pl-4">
                <p className="text-white font-semibold text-sm uppercase tracking-widest mb-6">{col.title}</p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-white/40 text-sm hover:text-white transition-colors duration-200">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Column 4: Newsletter */}
            <div>
              <p className="text-white font-semibold text-sm uppercase tracking-widest mb-6">Bản Tin</p>
              <p className="text-white/40 text-xs leading-relaxed mb-4">
                Đăng ký nhận tin tức để cập nhật các bài viết thể hình và dinh dưỡng mới nhất từ LockedIn.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký!'); }} className="flex gap-2 mb-6">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  required
                  className="w-full bg-brand-surface border border-brand-border px-3 py-2 text-xs focus:outline-none focus:border-brand-red text-white"
                />
                <button
                  type="submit"
                  className="bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  GỬI
                </button>
              </form>

              {/* Secure Payment Escrow & Trust Badges */}
              <div className="border-t border-brand-border/40 pt-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors">
                  <svg className="w-4 h-4 text-brand-red flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Giao dịch Escrow an toàn 100%</span>
                </div>
                <div className="flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors">
                  <svg className="w-4 h-4 text-brand-red flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Bảo mật thông tin chuẩn SSL</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-brand-border pt-8 flex flex-wrap gap-4 justify-between items-center">
            <p className="text-white/20 text-xs">© 2026 LockedIn. All rights reserved.</p>
            <p className="text-white/30 text-xs flex items-center gap-1.5 font-medium select-none">
              Made with <span className="text-brand-red animate-pulse text-sm">❤️</span> in VietNam — Crafted with passion & heart
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-bar">
        {[
          { label: 'Trang Chủ', icon: '⚡', path: '/' },
          { label: 'Tìm PT', icon: '🔍', path: '/marketplace' },
          { label: 'Lịch', icon: '📅', path: '/customer/bookings' },
          { label: 'Chat', icon: '💬', path: '/customer/workspace' },
          { label: 'Hồ Sơ', icon: '👤', path: '/customer/profile' },
        ].map((tab, i) => (
          <Link
            key={i}
            to={tab.path}
            className="flex flex-col items-center gap-1 px-3 py-1"
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-white/50 text-[10px] uppercase tracking-widest">{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Home;
