// src/pages/WorkspacePage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, ChevronRight, Dumbbell, Plus, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import api from '../services/api';
import { getMockMessages, saveMockMessages } from '../services/mockFirebase';

const WorkspacePage: React.FC = () => {
  const { workspaces, incrementWorkspaceSession, fileDispute } = useData();
  const { currentUser } = useAuth();
  
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [mealPlansList, setMealPlansList] = useState<any[]>([]);
  
  // Dispute Modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeFile, setDisputeFile] = useState<File | null>(null);
  const [submittingDispute, setSubmittingDispute] = useState(false);
  
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMealPlan, setLoadingMealPlan] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [generatingMealPlan, setGeneratingMealPlan] = useState(false);
  const [useMockChat, setUseMockChat] = useState(false);
  
  const [input, setInput] = useState('');
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  
  // Create Plan Modal state
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [goal, setGoal] = useState('');
  const [preference, setPreference] = useState('');
  const [allergyNote, setAllergyNote] = useState('');
  const [genError, setGenError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize selectedWorkspace with the first workspace
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0]);
    }
  }, [workspaces, selectedWorkspace]);

  // Load details whenever selectedWorkspace changes
  const loadWorkspaceDetails = async (wsId: string) => {
    if (!wsId) return;
    let conv: any = null;
    try {
      setLoadingMessages(true);
      // 1. Get conversation by workspace ID
      const convRes = await api.get(`/conversations/workspace/${wsId}`);
      if (convRes.data?.success && convRes.data.data) {
        conv = convRes.data.data;
        setConversation(conv);
      } else {
        // Conversation doesn't exist yet, try to create it via bookingId
        const ws = workspaces.find(w => w.id === wsId);
        if (ws?.bookingId) {
          const createRes = await api.post(`/conversations/booking/${ws.bookingId}`);
          if (createRes.data?.success && createRes.data.data) {
            conv = createRes.data.data;
            setConversation(conv);
          }
        }
      }

      // 2. Load messages if conversation is found
      if (conv) {
        try {
          const msgRes = await api.get(`/conversations/${conv.id}/messages`);
          if (msgRes.data?.success) {
            setMessages(msgRes.data.data || []);
            setUseMockChat(false);
          } else {
            throw new Error('Fallback to mock');
          }
        } catch (msgErr) {
          console.warn('Backend messages API failed, falling back to mock messages:', msgErr);
          setUseMockChat(true);
          const mockMsgs = getMockMessages(wsId).map(m => ({
            id: m.id,
            conversationId: conv.id,
            senderUserId: m.senderId === 'pt-1' ? selectedWorkspace?.ptId : m.senderId,
            senderName: m.senderName,
            content: m.text,
            createdAt: m.createdAt
          }));
          setMessages(mockMsgs);
        }
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.error('Error loading conversation/messages:', e);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }

    try {
      setLoadingMealPlan(true);
      // 3. Load meal plans
      const mealRes = await api.get(`/meal-plans/workspace/${wsId}`);
      if (mealRes.data?.success) {
        setMealPlansList(mealRes.data.data || []);
      }
    } catch (e) {
      console.error('Error loading meal plans:', e);
      setMealPlansList([]);
    } finally {
      setLoadingMealPlan(false);
    }
  };

  useEffect(() => {
    if (selectedWorkspace) {
      loadWorkspaceDetails(selectedWorkspace.id);
    }
  }, [selectedWorkspace]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message polling for real-time feel
  useEffect(() => {
    if (!conversation || useMockChat) return;
    const interval = setInterval(async () => {
      try {
        const msgRes = await api.get(`/conversations/${conversation.id}/messages`);
        if (msgRes.data?.success) {
          setMessages(msgRes.data.data || []);
        }
      } catch (e) {
        console.warn('Silent messages poll failed:', e);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [conversation, useMockChat]);

  const sendMessage = async () => {
    if (!input.trim() || !conversation || sendingMessage) return;
    const text = input.trim();
    setInput('');
    setSendingMessage(true);
    try {
      if (useMockChat) {
        throw new Error('Directly using mock chat');
      }
      const res = await api.post('/conversations/messages', {
        conversationId: conversation.id,
        content: text,
        messageType: 'text'
      });
      if (res.data?.success && res.data.data) {
        setMessages(prev => [...prev, res.data.data]);
      } else {
        throw new Error('SendMessage API response success is false');
      }
    } catch (e) {
      console.warn('Backend send message API failed/mock mode active, saving locally:', e);
      const mockMsg = {
        id: 'msg-' + Math.random().toString(36).substring(2, 9),
        conversationId: conversation.id,
        senderUserId: currentUser?.id,
        senderName: currentUser?.fullName || 'Me',
        content: text,
        createdAt: new Date().toISOString()
      };
      
      const allMsgs = getMockMessages();
      allMsgs.push({
        id: mockMsg.id,
        workspaceId: selectedWorkspace.id,
        senderId: mockMsg.senderUserId || 'user',
        senderName: mockMsg.senderName,
        text: mockMsg.content,
        createdAt: mockMsg.createdAt,
        read: true
      });
      saveMockMessages(allMsgs);
      setMessages(prev => [...prev, mockMsg]);

      // Trigger automatic PT response simulation
      if (currentUser?.role === 'customer') {
        setTimeout(() => {
          const responses = [
            `Tuyệt vời! Tôi đã cập nhật kế hoạch luyện tập của chúng ta. Bạn nhớ đăng nhập đầy đủ các buổi tập nhé.`,
            `Cố lên! Hãy bổ sung nước và protein đầy đủ cho ngày hôm nay nhé! 📈`,
            `Tôi đã nhận được thông tin. Để tôi xem lại chỉ số hình thể của bạn để thiết lập thực đơn AI cho phù hợp.`,
            `Nếu bạn thấy đau ở khớp hay cơ, hãy dừng tập ngay lập tức. Chúng ta sẽ điều chỉnh bài tập tập trung giãn cơ trước.`,
            `Hãy cố gắng ngủ đủ 7-8 tiếng tối nay nhé! Cần giúp đỡ gì thêm cứ nhắn tôi. 💪`
          ];
          const replyText = responses[Math.floor(Math.random() * responses.length)];
          const replyMsg = {
            id: 'msg-sim-' + Math.random().toString(36).substring(2, 9),
            conversationId: conversation.id,
            senderUserId: selectedWorkspace?.ptId || 'pt-1',
            senderName: selectedWorkspace?.ptName || 'HLV',
            content: replyText,
            createdAt: new Date().toISOString()
          };

          const updatedAllMsgs = getMockMessages();
          updatedAllMsgs.push({
            id: replyMsg.id,
            workspaceId: selectedWorkspace.id,
            senderId: replyMsg.senderUserId,
            senderName: replyMsg.senderName,
            text: replyMsg.content,
            createdAt: replyMsg.createdAt,
            read: false
          });
          saveMockMessages(updatedAllMsgs);
          setMessages(prev => [...prev, replyMsg]);
        }, 1800);
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const handleGenerateMealPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace || generatingMealPlan) return;
    setGeneratingMealPlan(true);
    setGenError('');
    try {
      // Step 1: Request Gemini AI to generate JSON string
      const genRes = await api.post('/meal-plans/generate', {
        workspaceId: selectedWorkspace.id,
        goal,
        preference: preference || 'Dễ tìm, chuẩn vị Việt',
        allergyNote: allergyNote || 'Không'
      });

      if (genRes.data?.success && genRes.data.data) {
        const generatedJson = genRes.data.data;
        
        // Step 2: Save the generated plan to Database
        const createRes = await api.post('/meal-plans', {
          workspaceId: selectedWorkspace.id,
          title: `Thực Đơn AI: ${goal}`,
          contentJson: generatedJson,
          source: 1 // Source: 1 = AI generated
        });

        if (createRes.data?.success && createRes.data.data) {
          // Re-fetch meal plans
          const mealRes = await api.get(`/meal-plans/workspace/${selectedWorkspace.id}`);
          if (mealRes.data?.success) {
            setMealPlansList(mealRes.data.data || []);
          }
          // Reset states & close modal
          setGoal('');
          setPreference('');
          setAllergyNote('');
          setShowCreatePlanModal(false);
          setShowMealPlan(true);
        } else {
          setGenError(createRes.data?.message || 'Không thể lưu thực đơn vào cơ sở dữ liệu.');
        }
      } else {
        setGenError(genRes.data?.message || 'Gemini AI không thể tạo thực đơn vào lúc này.');
      }
    } catch (err: any) {
      console.error('Failed to generate meal plan:', err);
      setGenError(err.response?.data?.message || err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setGeneratingMealPlan(false);
    }
  };

  const handleActivatePlan = async (planId: string) => {
    try {
      const res = await api.patch(`/meal-plans/${planId}/activate`);
      if (res.data?.success) {
        // Refresh plans list
        if (selectedWorkspace) {
          const mealRes = await api.get(`/meal-plans/workspace/${selectedWorkspace.id}`);
          if (mealRes.data?.success) {
            setMealPlansList(mealRes.data.data || []);
          }
        }
      }
    } catch (e) {
      console.error('Error activating plan:', e);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa thực đơn này không?')) return;
    try {
      const res = await api.delete(`/meal-plans/${planId}`);
      if (res.data?.success) {
        // Refresh plans list
        if (selectedWorkspace) {
          const mealRes = await api.get(`/meal-plans/workspace/${selectedWorkspace.id}`);
          if (mealRes.data?.success) {
            setMealPlansList(mealRes.data.data || []);
          }
        }
      }
    } catch (e) {
      console.error('Error deleting plan:', e);
    }
  };

  // Find the active meal plan (fallback to the first one)
  const activePlan = mealPlansList.find(p => p.isActive) || mealPlansList[0];
  
  let parsedPlan = null;
  if (activePlan && activePlan.contentJson) {
    try {
      parsedPlan = JSON.parse(activePlan.contentJson);
    } catch (e) {
      console.error('Error parsing plan json:', e);
    }
  }

  const calories = parsedPlan?.dailyCalories || parsedPlan?.calories || 0;
  const protein = parsedPlan?.proteinGrams || parsedPlan?.protein || 0;
  const carbs = parsedPlan?.carbGrams || parsedPlan?.carbs || 0;
  const fat = parsedPlan?.fatGrams || parsedPlan?.fat || 0;
  const daysList = parsedPlan?.days || [];
  const currentDay = daysList[selectedDayIndex] || daysList[0];
  const mealsList = currentDay?.meals || [];

  const macroPercent = (val: number, total: number) => {
    if (!total) return 0;
    return Math.round((val / total) * 100);
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-brand-black flex overflow-hidden">
      {/* Workspace Sidebar / Conversations List */}
      <aside className="w-72 flex-shrink-0 bg-brand-dark border-r border-brand-border flex flex-col hidden md:flex">
        <div className="px-5 py-5 border-b border-brand-border">
          <p className="section-label">
            {currentUser?.role === 'pt' ? 'Danh Sách Học Viên' : 'Danh Sách Lớp Học'}
          </p>
          <h2 className="font-montserrat font-bold text-xl text-white uppercase tracking-wider mt-1">LỚP HỌC CHI TIẾT</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {workspaces.length === 0 ? (
            <div className="p-5 text-center text-white/30 text-xs">
              {currentUser?.role === 'pt' ? 'Chưa có học viên nào hoạt động' : 'Chưa có khóa học nào hoạt động'}
            </div>
          ) : (
            workspaces.map((ws) => {
              const isActive = selectedWorkspace && ws.id === selectedWorkspace.id;
              const name = currentUser?.role === 'pt' ? ws.customerName : ws.ptName;
              const initials = name ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'WS';
              const specialty = ws.packageName || 'Khóa tập liên kết';
              
              return (
                <button
                  key={ws.id}
                  onClick={() => setSelectedWorkspace(ws)}
                  className={`w-full text-left px-5 py-4 border-b border-brand-border cursor-pointer transition-all duration-200 border-l-2 ${
                    isActive ? 'bg-brand-red/10 border-l-brand-red' : 'border-l-transparent hover:bg-white/[0.03] hover:border-l-brand-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center border ${isActive ? 'bg-brand-red border-brand-red' : 'bg-brand-surface border-brand-border'}`}>
                      <span className="font-display text-sm text-white font-bold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-white/70'}`}>{name}</p>
                      <p className="text-white/30 text-xs truncate mt-0.5">{specialty}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      {selectedWorkspace ? (
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-dark flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-red flex items-center justify-center font-bold">
                <span className="font-display text-base text-white">
                  {(currentUser?.role === 'pt' ? selectedWorkspace.customerName : selectedWorkspace.ptName)
                    ?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'WS'}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {currentUser?.role === 'pt' ? selectedWorkspace.customerName : selectedWorkspace.ptName}
                </p>
                <p className="text-white/30 text-xs">{selectedWorkspace.packageName || 'Khóa Tập Luyện'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Progress Text */}
              <div className="text-right mr-2 hidden sm:block">
                <p className="text-white/40 text-[9px] uppercase tracking-wider">Tiến Độ Lớp Học</p>
                <p className="text-white font-bold text-xs font-mono">
                  {selectedWorkspace.sessionsCompleted} / {selectedWorkspace.sessionsTotal} Buổi
                </p>
              </div>

              {/* HLV / PT Action: Increment Session */}
              {currentUser?.role === 'pt' && selectedWorkspace.status === 'active' && (
                <button
                  onClick={() => {
                    if (window.confirm(`Xác nhận hoàn thành buổi học thứ ${selectedWorkspace.sessionsCompleted + 1}?`)) {
                      incrementWorkspaceSession(selectedWorkspace.id);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer border border-brand-red bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white transition-all duration-200"
                >
                  <Plus size={12} />
                  + Buổi Tập
                </button>
              )}

              {/* Customer Action: Dispute */}
              {currentUser?.role === 'customer' && selectedWorkspace.status === 'active' && (
                <button
                  onClick={() => {
                    setDisputeReason('');
                    setDisputeDesc('');
                    setDisputeFile(null);
                    setShowDisputeModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer border border-white/20 hover:border-brand-red text-white/60 hover:text-white hover:bg-brand-red/10 transition-all duration-200"
                >
                  Khiếu Nại
                </button>
              )}

              {/* Meal Plan Toggle */}
              <button
                onClick={() => setShowMealPlan(!showMealPlan)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-widest cursor-pointer transition-all duration-200 ${
                  showMealPlan ? 'bg-brand-red text-white' : 'border border-brand-border text-white/50 hover:border-brand-red hover:text-white'
                }`}
              >
                <Zap size={12} />
                Dinh Dưỡng AI ({mealPlansList.length})
                <ChevronRight size={12} className={`transition-transform duration-200 ${showMealPlan ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 bg-brand-black">
              {loadingMessages ? (
                <div className="flex-1 flex items-center justify-center flex-col gap-2 text-white/40">
                  <Loader2 className="animate-spin text-brand-red" size={24} />
                  <span className="text-xs">Đang tải tin nhắn...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-white/20 text-xs">
                  Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderUserId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && (
                          <span className="text-white/30 text-[10px] px-1 font-semibold">{msg.senderName}</span>
                        )}
                        <div className={`px-4 py-3 text-sm leading-relaxed ${
                          isMe
                            ? 'bg-brand-red text-white'
                            : 'bg-brand-surface border border-brand-border text-white/90'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-white/20 text-[9px] px-1">
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Meal Plan Sidebar */}
            {showMealPlan && (
              <aside className="w-80 flex-shrink-0 border-l border-brand-border bg-brand-dark overflow-y-auto flex flex-col">
                <div className="px-5 py-5 border-b border-brand-border flex items-center justify-between flex-shrink-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={14} className="text-brand-red" />
                      <p className="section-label">Gemini AI</p>
                    </div>
                    <h3 className="font-montserrat font-bold text-lg text-white uppercase tracking-wider">Thực Đơn</h3>
                  </div>

                  {currentUser?.role === 'pt' && (
                    <button
                      onClick={() => setShowCreatePlanModal(true)}
                      className="w-8 h-8 bg-brand-red hover:bg-brand-red-dark text-white flex items-center justify-center rounded cursor-pointer transition-colors"
                      title="Tạo thực đơn AI mới"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loadingMealPlan ? (
                    <div className="p-8 text-center text-white/40 flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-brand-red" size={20} />
                      <span className="text-xs">Đang tải dữ liệu dinh dưỡng...</span>
                    </div>
                  ) : mealPlansList.length === 0 ? (
                    <div className="p-8 text-center text-white/30 text-xs">
                      {currentUser?.role === 'pt' ? (
                        <div className="flex flex-col gap-4 items-center">
                          <p>Chưa có thực đơn nào được tạo cho học viên.</p>
                          <button
                            onClick={() => setShowCreatePlanModal(true)}
                            className="btn-primary py-2 px-4 text-xs tracking-wider justify-center"
                          >
                            TẠO NGAY VỚI AI
                          </button>
                        </div>
                      ) : (
                        'Huấn luyện viên chưa thiết lập thực đơn dinh dưỡng cho bạn.'
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Active & Switcher Menu */}
                      <div className="p-4 border-b border-brand-border bg-brand-surface/40">
                        <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Danh Sách Thực Đơn</label>
                        <div className="flex flex-col gap-2">
                          {mealPlansList.map((plan) => (
                            <div key={plan.id} className="flex items-center justify-between bg-brand-surface p-2 border border-brand-border">
                              <span className="text-xs text-white truncate max-w-[140px] font-medium">{plan.title}</span>
                              <div className="flex items-center gap-1">
                                {plan.isActive ? (
                                  <span className="text-[10px] bg-brand-red/10 border border-brand-red px-1.5 py-0.5 text-brand-red font-semibold">ĐANG DÙNG</span>
                                ) : (
                                  <button
                                    onClick={() => handleActivatePlan(plan.id)}
                                    className="text-[10px] bg-brand-border hover:bg-white/10 px-1.5 py-0.5 text-white/60 hover:text-white cursor-pointer transition-colors"
                                  >
                                    BẬT
                                  </button>
                                )}
                                {currentUser?.role === 'pt' && (
                                  <button
                                    onClick={() => handleDeletePlan(plan.id)}
                                    className="text-white/30 hover:text-brand-red p-1 cursor-pointer transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Macronutrients Analysis */}
                      {parsedPlan ? (
                        <>
                          <div className="p-5 border-b border-brand-border">
                            <div className="grid grid-cols-4 gap-1.5 mb-4">
                              {[
                                { label: 'Calo', value: calories, unit: 'kcal' },
                                { label: 'Đạm', value: protein, unit: 'g' },
                                { label: 'Carb', value: carbs, unit: 'g' },
                                { label: 'Béo', value: fat, unit: 'g' },
                              ].map((m, i) => (
                                <div key={i} className="bg-brand-surface border border-brand-border p-2.5 text-center">
                                  <p className="text-white font-bold text-base leading-none">{m.value}</p>
                                  <p className="text-white/30 text-[9px] uppercase tracking-wider mt-1">{m.unit}</p>
                                </div>
                              ))}
                            </div>

                            {/* Nutrition fill bars */}
                            {[
                              { label: 'Chất Đạm', val: macroPercent(protein * 4, calories) },
                              { label: 'Tinh Bột', val: macroPercent(carbs * 4, calories) },
                              { label: 'Chất Béo', val: macroPercent(fat * 9, calories) },
                            ].map((m, i) => (
                              <div key={i} className="mb-3 last:mb-0">
                                <div className="flex justify-between mb-1">
                                  <span className="text-white/40 text-[10px] uppercase tracking-wider">{m.label}</span>
                                  <span className="text-white text-[10px] font-semibold">{m.val}%</span>
                                </div>
                                <div className="progress-track h-1.5">
                                  <div className="progress-fill" style={{ width: `${m.val}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Days tab selection if multiple days exist */}
                          {daysList.length > 1 && (
                            <div className="px-4 py-2 border-b border-brand-border flex gap-1.5 overflow-x-auto bg-brand-surface/20">
                              {daysList.map((dayObj: any, index: number) => (
                                <button
                                  key={index}
                                  onClick={() => setSelectedDayIndex(index)}
                                  className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer flex-shrink-0 ${
                                    selectedDayIndex === index
                                      ? 'bg-brand-red text-white'
                                      : 'border border-brand-border text-white/40 hover:text-white'
                                  }`}
                                >
                                  Ngày {dayObj.day || index + 1}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Meal Breakdown List */}
                          <div className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <Dumbbell size={12} className="text-white/30" />
                              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Thực Đơn Chi Tiết</p>
                            </div>

                            {mealsList.length === 0 ? (
                              <div className="text-center text-white/30 text-xs py-4">
                                Không có chi tiết món ăn.
                              </div>
                            ) : (
                              mealsList.map((meal: any, i: number) => (
                                <div key={i} className="mb-5 last:mb-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-white text-sm font-semibold">{meal.mealType || `Bữa Ăn ${i + 1}`}</p>
                                  </div>
                                  <ul className="flex flex-col gap-2">
                                    {meal.foods?.map((food: any, j: number) => (
                                      <li key={j} className="flex flex-col bg-brand-surface/50 border border-brand-border/40 p-2 text-xs">
                                        <div className="flex justify-between text-white/80 font-medium">
                                          <span>{food.name}</span>
                                          <span className="text-brand-red font-mono font-semibold">{food.quantity}</span>
                                        </div>
                                        <div className="flex gap-2 text-[9px] text-white/30 mt-1 font-mono">
                                          <span>Calo: {food.calories}</span>
                                          <span>P: {food.protein}g</span>
                                          <span>C: {food.carbs}g</span>
                                          <span>F: {food.fat}g</span>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                  {i < mealsList.length - 1 && (
                                    <div className="border-b border-brand-border/40 mt-4" />
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="p-5 text-center text-white/30 text-xs">
                          Thực đơn không đúng định dạng JSON.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </aside>
            )}
          </div>

          {/* Message Input Bar */}
          <div className="flex-shrink-0 border-t border-brand-border bg-brand-dark px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Nhập tin nhắn để thảo luận với HLV/Học viên..."
                  className="input-dark pr-4"
                  disabled={sendingMessage}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sendingMessage}
                className={`w-12 h-12 flex items-center justify-center transition-all duration-200 ${
                  input.trim() && !sendingMessage
                    ? 'bg-brand-red hover:bg-brand-red-dark cursor-pointer'
                    : 'bg-brand-border cursor-not-allowed'
                }`}
              >
                {sendingMessage ? (
                  <Loader2 className="animate-spin text-white" size={16} />
                ) : (
                  <Send size={16} className="text-white" />
                )}
              </button>
            </div>
            <p className="text-white/20 text-[10px] mt-2 uppercase tracking-widest">Nhấn Enter để gửi tin nhắn</p>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center text-white/40 bg-brand-black p-8">
          <Dumbbell size={48} className="text-brand-border mb-4 animate-pulse" />
          <h2 className="font-montserrat font-bold text-lg text-white uppercase tracking-wider">Không Tìm Thấy Không Gian Lớp Học</h2>
          <p className="text-xs text-white/30 text-center max-w-sm mt-2">
            {currentUser?.role === 'pt'
              ? 'Bạn chưa có học viên nào đang hoạt động. Khi học viên đăng ký gói tập của bạn và thanh toán thành công, không gian trao đổi sẽ tự động xuất hiện tại đây!'
              : 'Bạn chưa đăng ký khóa tập nào đang hoạt động hoặc cuộc giao dịch chưa được HLV phê duyệt. Hãy đăng ký khóa học ở phần Tìm PT!'}
          </p>
        </main>
      )}

      {/* PT AI Meal Plan Modal */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-brand-dark border-2 border-brand-border p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-brand-red" size={20} />
              <h3 className="font-montserrat font-bold text-lg text-white uppercase tracking-wider">Tạo Thực Đơn Dinh Dưỡng AI</h3>
            </div>

            {genError && (
              <div className="mb-4 border border-brand-red bg-brand-red/10 px-3 py-2 text-brand-red text-xs">
                {genError}
              </div>
            )}

            <form onSubmit={handleGenerateMealPlan} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Mục Tiêu Tập Luyện</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Ví dụ: Tăng cân tăng cơ, giảm mỡ đùi..."
                  required
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Sở Thích Ăn Uống</label>
                <input
                  type="text"
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                  placeholder="Ví dụ: Đồ ăn Việt, nhiều gà và rau xanh..."
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Dị Ứng & Kiêng Kỵ</label>
                <input
                  type="text"
                  value={allergyNote}
                  onChange={(e) => setAllergyNote(e.target.value)}
                  placeholder="Ví dụ: Không ăn tôm, dị ứng lạc..."
                  className="input-dark"
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  className="px-4 py-2 border border-brand-border text-white/60 hover:text-white text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={generatingMealPlan}
                  className="btn-primary py-2 px-4 text-xs tracking-wider justify-center min-w-[120px]"
                >
                  {generatingMealPlan ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="animate-spin text-white" size={12} />
                      ĐANG TẠO...
                    </div>
                  ) : (
                    'XÁC NHẬN TẠO'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-brand-dark border-2 border-brand-border p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 bg-brand-red rounded-full animate-ping" />
              <h3 className="font-montserrat font-bold text-lg text-white uppercase tracking-wider">Khiếu Nại Lớp Học</h3>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!disputeReason.trim() || !disputeDesc.trim()) {
                  alert('Vui lòng điền đầy đủ lý do và mô tả khiếu nại!');
                  return;
                }
                setSubmittingDispute(true);
                try {
                  await fileDispute(
                    selectedWorkspace.id,
                    disputeReason.trim(),
                    disputeDesc.trim(),
                    disputeFile || undefined
                  );
                  alert('Gửi khiếu nại thành công! Admin sẽ tiến hành kiểm duyệt.');
                  setShowDisputeModal(false);
                } catch (err) {
                  console.error(err);
                  alert('Gửi khiếu nại thất bại.');
                } finally {
                  setSubmittingDispute(false);
                }
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Lý Do Khiếu Nại</label>
                <input
                  type="text"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Ví dụ: HLV không dạy đúng lịch, thái độ thiếu chuyên nghiệp..."
                  required
                  className="input-dark focus:border-brand-red"
                  disabled={submittingDispute}
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Mô Tả Chi Tiết</label>
                <textarea
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Nhập chi tiết các buổi tập lỗi hoặc hành vi sai phạm của HLV..."
                  required
                  rows={4}
                  className="input-dark focus:border-brand-red py-2"
                  disabled={submittingDispute}
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-bold">Ảnh Minh Chứng (Nếu có)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDisputeFile(e.target.files?.[0] || null)}
                  className="input-dark py-2"
                  disabled={submittingDispute}
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 border border-brand-border text-white/60 hover:text-white text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                  disabled={submittingDispute}
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="btn-primary py-2 px-4 text-xs tracking-wider justify-center min-w-[120px]"
                >
                  {submittingDispute ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="animate-spin text-white" size={12} />
                      ĐANG GỬI...
                    </div>
                  ) : (
                    'GỬI KHIẾU NẠI'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
