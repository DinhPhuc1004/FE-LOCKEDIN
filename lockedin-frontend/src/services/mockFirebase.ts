// src/services/mockFirebase.ts

export interface ChatMessage {
  id: string;
  workspaceId: string;
  senderId: string;
  senderName: string;
  text: string;
  image?: string;
  createdAt: string;
  read: boolean;
}

export interface Workspace {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  ptId: string;
  ptName: string;
  packageName: string;
  sessionsTotal: number;
  sessionsCompleted: number;
  status: 'active' | 'completed' | 'disputed';
  ptNotes?: string;
  createdAt: string;
}

const MESSAGES_KEY = 'lockedin_chat_messages';
const WORKSPACES_KEY = 'lockedin_workspaces';

export function getMockWorkspaces(): Workspace[] {
  const data = localStorage.getItem(WORKSPACES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMockWorkspaces(w: Workspace[]): void {
  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(w));
}

export function getMockMessages(workspaceId?: string): ChatMessage[] {
  const data = localStorage.getItem(MESSAGES_KEY);
  const messages: ChatMessage[] = data ? JSON.parse(data) : [];
  if (workspaceId) {
    return messages.filter(m => m.workspaceId === workspaceId);
  }
  return messages;
}

export function saveMockMessages(msgs: ChatMessage[]): void {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));
}

// Automatically create initial messages when a workspace is created
export function initializeWorkspaceChat(workspaceId: string, ptName: string) {
  const initialMessages: ChatMessage[] = [
    {
      id: `msg-${workspaceId}-init-1`,
      workspaceId,
      senderId: 'system',
      senderName: 'System',
      text: 'Workspace created successfully! Chat is now active.',
      createdAt: new Date(Date.now() - 5000).toISOString(),
      read: true
    },
    {
      id: `msg-${workspaceId}-init-2`,
      workspaceId,
      senderId: 'pt-1', // alex's ID or similar
      senderName: ptName,
      text: `Hello! Welcome to LockedIn. I am very excited to help you conquer your fitness goals in this package. Let me know your preferred training schedule and if you have any health details you'd like me to focus on first!`,
      createdAt: new Date().toISOString(),
      read: false
    }
  ];

  const allMsgs = getMockMessages();
  allMsgs.push(...initialMessages);
  saveMockMessages(allMsgs);
}

// Automated response helper from PT to make workspace feel alive
export function simulatePTResponse(workspaceId: string, ptId: string, ptName: string, userMessage: string, onNewMessage: () => void) {
  setTimeout(() => {
    const responses = [
      `That sounds awesome! I have updated our routine notes. Let's make sure we log this session properly.`,
      `Awesome work! Remember to stay hydrated and hit your target protein for today! 📈`,
      `Got it! Let me review your body stats. I will generate or adjust your AI Meal Plan in the tab above so you can take a look!`,
      `Understood. For that sensitivity/pain, please do NOT push too hard. We will adjust the workout to focus on core stabilization and mobility first.`,
      `Let's schedule our next 1-on-1 coaching call tomorrow. Make sure you get 7-8 hours of sleep tonight! 💪`
    ];

    let replyText = responses[Math.floor(Math.random() * responses.length)];
    const lowerText = userMessage.toLowerCase();
    
    if (lowerText.includes('meal') || lowerText.includes('ăn') || lowerText.includes('đồ ăn') || lowerText.includes('dinh dưỡng')) {
      replyText = `Absolutely! I am looking at your goals right now. I will use the Gemini AI Nutritionist in our panel to draft a structured meal plan. Check back in the Meal Plan tab in a few seconds!`;
    } else if (lowerText.includes('đau') || lowerText.includes('chấn thương') || lowerText.includes('mệt') || lowerText.includes('hurt') || lowerText.includes('pain')) {
      replyText = `Oh, please rest up! Safety is our number one priority. I will write down health notes in your profile and adjust our upcoming routines so we don't load that specific muscle/joint. Let me know if it worsens.`;
    } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('chào')) {
      replyText = `Hello! Hope you had a great workout today. Ready to crush some milestones? Let me know how I can assist you right now!`;
    }

    const reply: ChatMessage = {
      id: 'msg-sim-' + Math.random().toString(36).substring(2, 9),
      workspaceId,
      senderId: ptId,
      senderName: ptName,
      text: replyText,
      createdAt: new Date().toISOString(),
      read: false
    };

    const allMsgs = getMockMessages();
    allMsgs.push(reply);
    saveMockMessages(allMsgs);
    onNewMessage();
  }, 1800);
}
