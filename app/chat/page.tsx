"use client";

import { useState } from "react";
import { Search, Send, Image as ImageIcon, Paperclip, MoreVertical, Phone, Mail, ShoppingCart, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const mockConversations = [
  { id: '1', name: 'Ngô Thanh Hải', platform: 'Facebook Fanpage', lastMessage: 'Dạ shop tư vấn cho em lô gạch ốp tường với ạ.', time: '10:12', unread: 2, avatar: 'H' },
  { id: '2', name: 'Công ty Kiến trúc X', platform: 'Zalo OA', lastMessage: 'Bên anh nhận được báo giá rồi em nhé.', time: '09:45', unread: 0, avatar: 'C' },
  { id: '3', name: 'Trần Thị Thu', platform: 'Website', lastMessage: 'Gọi lại cho mình số 09xx nhé', time: 'Hôm qua', unread: 1, avatar: 'T' },
  { id: '4', name: 'Nguyễn Bình', platform: 'Facebook Fanpage', lastMessage: 'Cho mình xin địa chỉ showroom.', time: 'Hôm qua', unread: 0, avatar: 'B' },
];

const mockMessages = [
  { id: 'm1', sender: 'customer', text: 'Chào shop, cho mình hỏi bên mình có gạch Taicera nhám không?', time: '10:05' },
  { id: 'm2', sender: 'agent', text: 'Dạ chào anh/chị. Bên em là đại lý phân phối chính hãng các sản phẩm gạch Taicera ạ. Mình đang ốp cho không gian nào (bếp, nhà tắm, phòng khách) để em tư vấn mã phù hợp ạ?', time: '10:07' },
  { id: 'm3', sender: 'customer', text: 'Mình đang định ốp nhà tắm.', time: '10:10' },
  { id: 'm4', sender: 'customer', text: 'Dạ shop tư vấn cho em lô gạch ốp tường với ạ.', time: '10:12' },
];

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState('1');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const [platformTab, setPlatformTab] = useState<'all' | 'facebook' | 'zalo'>('all');

  const filteredConversations = mockConversations.filter(chat => {
    if (platformTab === 'facebook') return chat.platform === 'Facebook Fanpage';
    if (platformTab === 'zalo') return chat.platform === 'Zalo OA';
    return true;
  });

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, {
      id: Date.now().toString(),
      sender: 'agent',
      text: input,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full h-screen overflow-hidden bg-slate-50">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Chat Đa Kênh</h1>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Facebook
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>Zalo OA
          </span>
        </div>
      </header>

      {/* 3-Pane Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Pane 1: Conversation List */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 pb-2">
            <div className="relative">
              <input type="text" placeholder="Tìm kiếm tin nhắn..." className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>
            
            <div className="flex p-1 bg-slate-100 rounded-lg mt-4 w-full">
              <button 
                onClick={() => setPlatformTab('all')}
                className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-all", platformTab === 'all' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setPlatformTab('facebook')}
                className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-all", platformTab === 'facebook' ? "bg-white text-[#1877F2] shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Facebook
              </button>
              <button 
                onClick={() => setPlatformTab('zalo')}
                className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-all", platformTab === 'zalo' ? "bg-white text-[#0068FF] shadow-sm" : "text-slate-500 hover:text-slate-700")}
              >
                Zalo
              </button>
            </div>
            
            <div className="flex gap-2 mt-3 mb-1">
              <button className="text-[11px] font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">Chưa đọc</button>
              <button className="text-[11px] font-medium bg-slate-50 text-slate-600 hover:bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Có SĐT</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">Trống</div>
            )}
            {filteredConversations.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "flex items-start gap-3 p-4 cursor-pointer border-b border-slate-50 transition-colors",
                  activeChat === chat.id ? "bg-blue-50" : "hover:bg-slate-50"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex flex-shrink-0 items-center justify-center font-bold relative">
                  {chat.avatar}
                  {chat.platform === 'Facebook Fanpage' && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></span>}
                  {chat.platform === 'Zalo OA' && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn("font-medium text-sm truncate", chat.unread > 0 ? "text-slate-900 font-bold" : "text-slate-700")}>{chat.name}</span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{chat.time}</span>
                  </div>
                  <p className={cn("text-xs truncate", chat.unread > 0 ? "text-slate-800 font-medium" : "text-slate-500")}>{chat.lastMessage}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{chat.platform}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold mt-1">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pane 2: Chat Area */}
        <div className="flex-1 flex flex-col bg-[#f0f2f5]">
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="font-medium text-slate-800">Ngô Thanh Hải</div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded">Facebook</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5"/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            <div className="text-center text-xs text-slate-400 my-2">Hôm nay</div>
            
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex w-full", msg.sender === 'agent' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                  msg.sender === 'agent' 
                    ? "bg-blue-600 text-white rounded-br-sm" 
                    : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                )}>
                  <p>{msg.text}</p>
                  <div className={cn("text-[10px] mt-1 text-right", msg.sender === 'agent' ? "text-blue-100" : "text-slate-400")}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex gap-2 mb-2">
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full cursor-pointer hover:bg-slate-200">Chào hỏi</span>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full cursor-pointer hover:bg-slate-200">Báo giá TTBVS</span>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full cursor-pointer hover:bg-slate-200">Xin SĐT</span>
            </div>
            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <button className="p-2 text-slate-400 hover:text-slate-600"><ImageIcon className="w-5 h-5"/></button>
              <button className="p-2 text-slate-400 hover:text-slate-600"><Paperclip className="w-5 h-5"/></button>
              <textarea 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder="Nhập tin nhắn... (Nhấn Enter để gửi)" 
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] text-sm py-2 px-2"
                rows={1}
              />
              <button onClick={handleSend} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <Send className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </div>

        {/* Pane 3: CRM Context (Right Sidebar) */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-slate-100 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold mb-4">H</div>
            <h2 className="text-lg font-bold text-slate-900">Ngô Thanh Hải</h2>
            <p className="text-sm text-slate-500">Khách hàng mới</p>
            
            <div className="flex gap-2 mt-4 w-full">
              <Button className="flex-1 text-xs" variant="outline"><Phone className="w-3 h-3 mr-2" />Gọi</Button>
              <Button className="flex-1 text-xs" variant="outline"><Mail className="w-3 h-3 mr-2" />Email</Button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Thông tin liên hệ</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Điện thoại</span>
                  <span className="font-medium">0982.111.222</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-400 italic">Chưa có</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Khu vực</span>
                  <span className="font-medium">Quận Cầu Giấy, HN</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                Lịch sử đơn hàng
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">0 đơn</span>
              </h3>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center text-xs text-slate-500">
                Khách chưa phát sinh giao dịch.
              </div>
            </div>

            <div className="space-y-2 mt-auto pt-6 border-t border-slate-100">
              <Button className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 border-none shadow-none"><Target className="w-4 h-4 mr-2" />Tạo Lead Mới</Button>
              <Button className="w-full justify-start bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none"><ShoppingCart className="w-4 h-4 mr-2" />Lên Đơn Hàng / Báo giá</Button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
