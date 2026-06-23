// src/pages/Home.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Award, TrendingUp, CheckCircle, ChevronRight, Zap, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PTHome from './PT/PTHome';
import AdminHome from './AdminHome';
import muscularMan from '../assets/muscular-man.png';
import logoImg from '../assets/logo.png';

const FEATURED_SHOWCASE = [
  {
    id: 1,
    name: 'HLV HÙNG TITAN',
    specialty: 'Bodybuilding • Powerlifting • Nutrition',
    price: 500000,
    rating: 4.9,
    reviews: 120,
    experience: '10 năm kinh nghiệm',
    image: muscularMan,
    comments: [
      { user: 'Trần Đức Khải', text: '"Báo cáo tiến độ chi tiết giúp tôi theo dõi quá trình cực kỳ rõ ràng. Không còn phải đoán mò về kết quả nữa!"' },
      { user: 'Nguyễn Minh Tuấn', text: '"Sau 3 tháng với HLV Hùng, tôi giảm được 12kg và tăng 8kg cơ. Lối sống của tôi thực sự đã thay đổi hoàn toàn nhờ sự kỷ luật này."' },
      { user: 'Hoàng Thái Hưng', text: '"Kiến thức dinh dưỡng của HLV Hùng cực kỳ chuyên sâu. Lịch ăn không hề nhàm chán mà vẫn đảm bảo macronutrients."' },
      { user: 'Lâm Tuấn Kiệt', text: '"Ban đầu tôi rất sợ tạ nặng, nhưng với phương pháp coaching chuẩn khoa học, tôi đã có thể deadlift 150kg an toàn."' },
      { user: 'Vũ Đức Mạnh', text: '"Hệ thống theo dõi bài tập rất trực quan. Tôi luôn biết ngày mai mình cần tập gì."' }
    ]
  },
  {
    id: 2,
    name: 'HLV LAN PHẠM',
    specialty: 'Yoga Trị Liệu • Phục Hồi Chấn Thương',
    price: 400000,
    rating: 4.8,
    reviews: 95,
    experience: '6 năm kinh nghiệm',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=1000&auto=format&fit=crop',
    comments: [
      { user: 'Lê Thị Thu', text: '"HLV cực kỳ tận tâm, các bài tập phục hồi đã giúp tôi hết hẳn cơn đau thắt lưng kéo dài nhiều năm."' },
      { user: 'Phạm Văn A', text: '"Giáo án rất khoa học, từ tốn và dễ tập theo. Rất đáng tiền!"' },
      { user: 'Ngô Thanh Ngân', text: '"Nhờ những bài tập giãn cơ của chị Lan, tôi không còn bị gù lưng và cải thiện được tư thế làm việc."' },
      { user: 'Đào Thu Thủy', text: '"Cảm giác mỗi buổi tập như một lần thiền định. Tinh thần tôi thoái mái hơn rất nhiều."' },
      { user: 'Trịnh Bảo Trâm', text: '"PT luôn lắng nghe và điều chỉnh cường độ sao cho phù hợp với thể trạng của tôi từng ngày."' }
    ]
  }
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


  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURED_SHOWCASE.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

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
      <section className="relative overflow-hidden pt-12 pb-6 lg:pt-16 lg:pb-10">

        {/* Background grid lines */}
        <div className="absolute inset-0 opacity-5 z-10" style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Red vertical accent */}
        <div className="absolute top-0 right-1/3 w-px h-full bg-brand-red opacity-20 hidden lg:block z-10" />

        <div className="section-container relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-start pt-2 lg:pt-4">
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
            </div>

            {/* Right: Large Muscular Man Image Visual */}
            <div className="relative flex items-start justify-center h-[450px] lg:h-[620px] xl:h-[700px] w-full pt-2 lg:pt-4">
              <img 
                src={muscularMan} 
                alt="Thể trạng" 
                className="h-[105%] lg:h-[115%] xl:h-[120%] max-h-[75vh] w-auto object-contain object-top opacity-65 select-none pointer-events-none drop-shadow-[0_0_45px_rgba(230,0,0,0.2)] origin-top transition-all duration-500 scale-105" 
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-white/0 via-white/40 to-white/0" />
        </div>
      </section>



      {/* ─── HOW IT WORKS (CLEAN & ORGANIC) ─── */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-brand-black border-y border-brand-border relative">
        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Quy Trình Đơn Giản</p>
            <h3 className="font-montserrat font-extrabold text-4xl lg:text-5xl text-white uppercase tracking-wider">
              Bắt Đầu Trong <span className="text-brand-red">3 Bước</span>
            </h3>
          </div>

          <div className="flex flex-col md:flex-row gap-12 md:gap-8 justify-between relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-brand-red/10 via-brand-red/80 to-brand-red/10" />

            {STEPS.map((step, i) => (
              <div key={i} className="flex-1 relative group flex flex-col items-center text-center">
                {/* Number Circle */}
                <div className="w-16 h-16 rounded-full bg-brand-surface border border-brand-red/30 flex items-center justify-center text-brand-red font-montserrat font-black text-2xl mb-6 shadow-[0_0_20px_rgba(230,0,0,0.1)] group-hover:shadow-[0_0_30px_rgba(230,0,0,0.4)] group-hover:scale-110 transition-all duration-300 relative z-10">
                  {step.num}
                </div>
                <h4 className="font-montserrat font-bold text-xl text-white uppercase tracking-wider mb-3">
                  {step.title}
                </h4>
                <p className="text-white/60 text-sm leading-relaxed max-w-xs text-center">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PT SHOWCASE (HORIZONTAL SLIDER) ─── */}
      <section 
        className="bg-brand-black py-16 overflow-hidden relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="section-container">
          <div className="flex items-end justify-between mb-12 relative z-10">
            <div>
              <p className="section-label mb-3">Đội Ngũ HLV</p>
              <h3 className="font-montserrat font-extrabold text-4xl lg:text-5xl text-white uppercase tracking-wider">
                HLV Nổi Bật
              </h3>
            </div>
            <Link
              to="/marketplace"
              className="flex items-center gap-2 text-xs lg:text-sm text-white/50 hover:text-white uppercase tracking-widest transition-colors duration-200"
            >
              Xem Tất Cả <ChevronRight size={16} />
            </Link>
          </div>

          {/* Horizontal Banner Container */}
          <div className="relative w-full overflow-hidden aspect-auto lg:aspect-[21/9] min-h-[550px] lg:min-h-[500px]">
             {FEATURED_SHOWCASE.map((pt, index) => (
                <div 
                  key={pt.id} 
                  className={`absolute inset-0 w-full h-full flex flex-col lg:flex-row transition-opacity duration-1000 ease-in-out ${activeSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  {/* Left content area */}
                  <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center relative z-20 bg-gradient-to-b lg:bg-gradient-to-r from-brand-black via-brand-black to-brand-black/90 lg:to-transparent">
                     {/* Background overlay for mobile readability */}
                     <div className="absolute inset-0 bg-brand-black/80 lg:hidden -z-10"></div>
                     
                     <div className="flex items-center gap-3 mb-4 lg:mb-6">
                        <div className="flex gap-1">
                          <StarRating rating={pt.rating} />
                        </div>
                        <span className="text-white font-bold text-sm">{pt.rating} <span className="text-white/40 font-normal">({pt.reviews} đánh giá)</span></span>
                     </div>
                     <h2 className="font-montserrat font-black text-3xl lg:text-5xl text-white uppercase tracking-wider mb-2 lg:mb-4 leading-tight">
                       {pt.name}
                     </h2>
                     <p className="text-brand-red text-xs lg:text-sm font-bold tracking-widest uppercase mb-6 lg:mb-8">
                       {pt.specialty}
                     </p>
                     
                     {/* Info row */}
                     <div className="flex items-center gap-6 mb-8 lg:mb-10">
                       <div>
                         <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Giá / Buổi</p>
                         <p className="text-white font-bold text-lg lg:text-xl">{pt.price.toLocaleString('vi-VN')}đ</p>
                       </div>
                       <div className="w-px h-8 bg-brand-border"></div>
                       <div>
                         <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Kinh nghiệm</p>
                         <p className="text-white font-semibold text-sm lg:text-base">{pt.experience}</p>
                       </div>
                     </div>

                     {/* Marquee Comments */}
                     <div 
                       className="mt-auto pt-2 overflow-hidden relative w-full h-32 lg:h-40"
                       style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
                     >
                        <div 
                          className="flex flex-col gap-4 absolute w-full pr-4"
                          style={{
                             animation: 'scroll-up 20s linear infinite'
                          }}
                        >
                          {[...pt.comments, ...pt.comments].map((comment, i) => (
                            <div key={i} className="py-2 pl-4 border-l-2 border-brand-red/70">
                              <p className="text-white/80 text-sm leading-relaxed italic mb-2">"{comment.text.replace(/"/g, '')}"</p>
                              <p className="text-brand-red/80 text-[10px] uppercase font-bold tracking-wider">— {comment.user}</p>
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>

                  {/* Right Image area */}
                  <div className="absolute lg:relative w-full h-full lg:w-1/2 inset-0 lg:inset-auto z-0 lg:z-10 overflow-hidden group">
                     {/* Gradient fades on all 4 edges to seamlessly blend image into background */}
                     <div className="absolute inset-y-0 left-0 w-2/3 lg:w-1/2 bg-gradient-to-r from-brand-black via-brand-black/80 to-transparent z-10"></div>
                     <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent z-10"></div>
                     <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-brand-black to-transparent z-10"></div>
                     <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-brand-black to-transparent z-10"></div>
                     
                     <img 
                       src={pt.image} 
                       alt={pt.name}
                       className="w-full h-full object-cover object-top opacity-40 lg:opacity-70 grayscale-[20%] contrast-[1.1] transition-transform duration-[10s] ease-out group-hover:scale-110"
                     />
                  </div>
                </div>
             ))}

             {/* Slider Controls OVERLAY */}
             <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 z-30 flex items-center gap-3">
               <button
                 onClick={() => setActiveSlide((prev) => (prev - 1 + FEATURED_SHOWCASE.length) % FEATURED_SHOWCASE.length)}
                 className="w-10 h-10 rounded-full bg-brand-black/80 border border-brand-border flex items-center justify-center text-white hover:text-brand-red transition-all cursor-pointer backdrop-blur-md hover:scale-110"
               >
                 <ChevronLeft size={16} />
               </button>
               <button
                 onClick={() => setActiveSlide((prev) => (prev + 1) % FEATURED_SHOWCASE.length)}
                 className="w-10 h-10 rounded-full bg-brand-black/80 border border-brand-border flex items-center justify-center text-white hover:text-brand-red transition-all cursor-pointer backdrop-blur-md hover:scale-110"
               >
                 <ChevronRight size={16} />
               </button>
             </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
      
      {/* ─── WHY LOCKEDIN ─── */}
      <section className="py-14 lg:py-20">
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
      <section className="py-14 lg:py-20">
        <div className="section-container">
          <div className="py-12 lg:py-20 text-center animate-on-scroll relative overflow-hidden">
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
