import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Wand2, CheckCircle, Clock } from 'lucide-react';
import { aiService, ChatMessage, TaskData } from '../services/llmService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AIPlannerChatProps {
  onPlanGenerated?: (tasks: TaskData[]) => void;
  onClose?: () => void;
}

const AIPlannerChat: React.FC<AIPlannerChatProps> = ({ onPlanGenerated, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi! I\'m your AI planning assistant. Tell me what you want to accomplish and I\'ll help you create a structured plan with tasks, timing, and scheduling. For example: "I need to prepare for a job interview next week" or "Help me plan my workout routine for this month".',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<TaskData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !user.id) {
      toast.error('User ID missing — please login again.');
      console.log('❌ Invalid user object:', user);
      return;
    }

    // Get current Indian date/time context with explicit today reference
    const now = new Date();
    const indianTime = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(now);

    const todayDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata'
    }).format(now); // YYYY-MM-DD format

    const contextualMessage = `IMPORTANT CONTEXT:
- Current date and time in India (IST): ${indianTime}
- Today's date (use this for "today"): ${todayDate}
- When user says "today", use: ${todayDate}
- When user says "tomorrow", use: ${new Date(now.getTime() + 24*60*60*1000).toLocaleDateString('en-CA', {timeZone: 'Asia/Kolkata'})}

User request: ${inputMessage}`;

    const newUserMessage: ChatMessage = {
      role: 'user',
      content: contextualMessage,
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('✅ Sending to LLM...');
      console.log('user:', user);
      // console.log('user._id:', user?.id);
      console.log('messages:', updatedMessages);

      const { reply, tasks } = await aiService.chatPlan(user.id.toString(), updatedMessages);


      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
      };

      setMessages([...updatedMessages, assistantMessage]);

      if (tasks?.length > 0) {
        setExtractedTasks(tasks);
      }

    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast.error('Failed to get AI response');

      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!user || extractedTasks.length === 0) return;

    try {
      setIsLoading(true);
      const plan = {
        user_id: user.id.toString(),
        tasks: extractedTasks,
      };

      await aiService.saveStructuredPlan(plan);
      toast.success('Plan saved successfully!');

      if (onPlanGenerated) {
        onPlanGenerated(extractedTasks);
      }

      setExtractedTasks([]);

      const confirmMessage: ChatMessage = {
        role: 'assistant',
        content: 'Great! I\'ve saved your structured plan. The tasks have been added to your task list. Is there anything else you\'d like to plan?',
      };
      setMessages((prev) => [...prev, confirmMessage]);

    } catch (error) {
      console.error('Failed to save plan:', error);
      toast.error('Failed to save plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Planning Assistant</h2>
              <p className="text-sm text-gray-400">Get personalized task planning</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              ✕
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  message.role === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`flex-1 max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Tasks Preview */}
          {extractedTasks.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Generated Plan Preview</h3>
                <button
                  onClick={handleSavePlan}
                  disabled={isLoading}
                  className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md text-xs hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                >
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Save Plan
                </button>
              </div>
              <div className="space-y-2">
                {extractedTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-md">
                    <span className="text-sm text-gray-200">{task.title}</span>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{task.expected_time_minutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe what you want to plan... (e.g., 'Help me plan my week')"
              rows={2}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlannerChat;


// import React, { useState, useRef, useEffect } from 'react';
// import { Send, Bot, User, Wand2, CheckCircle, Clock } from 'lucide-react';
// import { aiService, ChatMessage, TaskData } from '../services/llmService';
// import { useAuth } from '../contexts/AuthContext';
// import toast from 'react-hot-toast';

// interface AIPlannerChatProps {
//   onPlanGenerated?: (tasks: TaskData[]) => void;
//   onClose?: () => void;
// }

// const AIPlannerChat: React.FC<AIPlannerChatProps> = ({ onPlanGenerated, onClose }) => {
//   const { user } = useAuth();
//   const [messages, setMessages] = useState<ChatMessage[]>([
//     {
//       role: 'assistant',
//       content: 'Hi! I\'m your AI planning assistant. Tell me what you want to accomplish and I\'ll help you create a structured plan with tasks, timing, and scheduling. For example: "I need to prepare for a job interview next week" or "Help me plan my workout routine for this month".'
//     }
//   ]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [extractedTasks, setExtractedTasks] = useState<TaskData[]>([]);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSendMessage = async () => {

// if (!user || !user._id) {
//   toast.error("User ID missing — please login again.");
//   console.log("❌ Invalid user object:", user);
//   return;
// }


//     const newUserMessage: ChatMessage = {
//       role: 'user',
//       content: inputMessage
//     };

//     const updatedMessages = [...messages, newUserMessage];
//     setMessages(updatedMessages);
//     setInputMessage('');
//     setIsLoading(true);

//     try {
//       console.log('✅ Sending to LLM...');
// console.log('user:', user);
// console.log('user.id:', user?.id);
// console.log('messages:', updatedMessages);

// const { reply, tasks } = await aiService.chatPlan(user._id.toString(), updatedMessages);

// const assistantMessage: ChatMessage = {
//   role: 'assistant',
//   content: reply  // ✅ just the reply string
// };

// setMessages([...updatedMessages, assistantMessage]);

// if (tasks?.length > 0) {
//   setExtractedTasks(tasks); // ✅ directly use extracted tasks from backend
// }


//       // Try to extract structured tasks from the response
//       extractTasksFromResponse(response);
//     } catch (error) {
//       console.error('Failed to get AI response:', error);
//       toast.error('Failed to get AI response');
      
//       const errorMessage: ChatMessage = {
//         role: 'assistant',
//         content: 'Sorry, I encountered an error. Please try again.'
//       };
//       setMessages([...updatedMessages, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const extractTasksFromResponse = (response: string) => {
//     // Simple extraction logic - in a real app, the AI would return structured data
//     const taskPattern = /(?:Task|TODO|Action)[\s\d]*[:\-]\s*(.+?)(?:\n|$)/gi;
//     const timePattern = /(\d+)\s*(?:minutes?|mins?|hours?|hrs?)/gi;
    
//     const tasks: TaskData[] = [];
//     let match;
    
//     while ((match = taskPattern.exec(response)) !== null) {
//       const taskText = match[1].trim();
//       if (taskText) {
//         // Extract time estimate if mentioned
//         const timeMatch = timePattern.exec(taskText);
//         const estimatedTime = timeMatch ? parseInt(timeMatch[1]) * (timeMatch[0].includes('hour') ? 60 : 1) : 30;
        
//         // Generate a default schedule (you might want to make this smarter)
//         const scheduledDate = new Date();
//         scheduledDate.setDate(scheduledDate.getDate() + tasks.length);
//         scheduledDate.setHours(9, 0, 0, 0); // Default to 9 AM
        
//         tasks.push({
//           title: taskText,
//           scheduled_for: scheduledDate.toISOString(),
//           expected_time_minutes: estimatedTime,
//           status: 'pending'
//         });
//       }
//     }
    
//     if (tasks.length > 0) {
//       setExtractedTasks(tasks);
//     }
//   };

//   const handleSavePlan = async () => {
//     if (!user || extractedTasks.length === 0) return;

//     try {
//       setIsLoading(true);
//       const plan = {
//         user_id: user.id.toString(),
//         tasks: extractedTasks
//       };

//       await aiService.saveStructuredPlan(plan);
//       toast.success('Plan saved successfully!');
      
//       if (onPlanGenerated) {
//         onPlanGenerated(extractedTasks);
//       }
      
//       setExtractedTasks([]);
      
//       // Add confirmation message
//       const confirmMessage: ChatMessage = {
//         role: 'assistant',
//         content: 'Great! I\'ve saved your structured plan. The tasks have been added to your todo list. Is there anything else you\'d like to plan?'
//       };
//       setMessages(prev => [...prev, confirmMessage]);
      
//     } catch (error) {
//       console.error('Failed to save plan:', error);
//       toast.error('Failed to save plan');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-gray-700">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b border-gray-700">
//           <div className="flex items-center space-x-3">
//             <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
//               <Wand2 className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-white">AI Planning Assistant</h2>
//               <p className="text-sm text-gray-400">Get personalized task planning</p>
//             </div>
//           </div>
//           {onClose && (
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
//             >
//               ✕
//             </button>
//           )}
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((message, index) => (
//             <div
//               key={index}
//               className={`flex items-start space-x-3 ${
//                 message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
//               }`}
//             >
//               <div className={`p-2 rounded-full ${
//                 message.role === 'user' 
//                   ? 'bg-blue-600' 
//                   : 'bg-gradient-to-r from-purple-600 to-blue-600'
//               }`}>
//                 {message.role === 'user' ? (
//                   <User className="w-4 h-4 text-white" />
//                 ) : (
//                   <Bot className="w-4 h-4 text-white" />
//                 )}
//               </div>
//               <div className={`flex-1 max-w-[80%] p-3 rounded-lg ${
//                 message.role === 'user'
//                   ? 'bg-blue-600 text-white ml-auto'
//                   : 'bg-gray-800 text-gray-100'
//               }`}>
//                 <p className="text-sm leading-relaxed whitespace-pre-wrap">
//                   {message.content}
//                 </p>
//               </div>
//             </div>
//           ))}
          
//           {isLoading && (
//             <div className="flex items-start space-x-3">
//               <div className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
//                 <Bot className="w-4 h-4 text-white" />
//               </div>
//               <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
//                 <div className="flex items-center space-x-2">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//                   <span className="text-sm">AI is thinking...</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Extracted Tasks Preview */}
//           {extractedTasks.length > 0 && (
//             <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-sm font-medium text-white">Generated Plan Preview</h3>
//                 <button
//                   onClick={handleSavePlan}
//                   disabled={isLoading}
//                   className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md text-xs hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
//                 >
//                   <CheckCircle className="w-3 h-3 inline mr-1" />
//                   Save Plan
//                 </button>
//               </div>
//               <div className="space-y-2">
//                 {extractedTasks.map((task, index) => (
//                   <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-md">
//                     <span className="text-sm text-gray-200">{task.title}</span>
//                     <div className="flex items-center space-x-2 text-xs text-gray-400">
//                       <Clock className="w-3 h-3" />
//                       <span>{task.expected_time_minutes}m</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
          
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input */}
//         <div className="p-4 border-t border-gray-700">
//           <div className="flex space-x-3">
//             <textarea
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Describe what you want to plan... (e.g., 'Help me plan my week')"
//               rows={2}
//               className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
//             />
//             <button
//               onClick={handleSendMessage}
//               disabled={!inputMessage.trim() || isLoading}
//               className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Send className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AIPlannerChat;
