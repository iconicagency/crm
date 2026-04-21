"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, TrendingUp, Search, Bell, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    totalCustomers: 0,
  });
  const [sourceData, setSourceData] = useState<{name: string, value: number}[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const leadsSnap = await getDocs(query(collection(db, "leads")));
        const newLeadsSnap = await getDocs(query(collection(db, "leads"), where("status", "==", "new")));
        const customersSnap = await getDocs(collection(db, "customers"));
        
        let sData: Record<string, number> = {};
        leadsSnap.forEach(doc => {
          const src = doc.data().source || 'Khác';
          sData[src] = (sData[src] || 0) + 1;
        });

        // Recent LEads
        const recentSnap = await getDocs(query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(5)));
        const rLeads = recentSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setSourceData(Object.keys(sData).map(k => ({ name: k, value: sData[k] })));
        setRecentLeads(rLeads);
        
        setStats({
          totalLeads: leadsSnap.size,
          newLeads: newLeadsSnap.size,
          totalCustomers: customersSnap.size
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    
    fetchStats();
  }, [isSeeding, isCleaning]);

  const handleSeedData = async () => {
    if (isSeeding || isCleaning) return;
    setIsSeeding(true);
    try {
      const now = Date.now();
      
      const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
      const middleNames = ["Văn", "Thị", "Ngọc", "Hữu", "Thanh", "Minh", "Thu", "Xuân", "Hải", "Đức", "Hoài"];
      const lastNames = ["An", "Bình", "Cường", "Dung", "Em", "Phong", "Giang", "Hà", "Ý", "Khoa", "Linh", "Mai", "Nam", "Oanh", "Phát", "Quân", "Tâm", "Hùng", "Sơn", "Tùng", "Long"];
      
      const getName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${middleNames[Math.floor(Math.random() * middleNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const getPhone = () => `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      const randArr = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
      
      // 1. Leads (25 items)
      const leadSources = ["Facebook", "Website", "Zalo OA", "Khách giới thiệu", "Khác"];
      const leadStatuses = ["new", "contacted", "qualified", "lost"];
      const leadReqs = ["Xây nhà phố", "Sửa chung cư", "Biệt thự", "Xây nhà trọ", "Làm nội thất bếp", "Ốp lát sân vườn"];
      
      for(let i=0; i<25; i++) {
        await addDoc(collection(db, "leads"), {
          name: getName(), phone: getPhone(), email: `khach${i}@example.com`, requirement: randArr(leadReqs), completionTime: `Tháng ${Math.floor(Math.random()*12)+1}/2026`, source: randArr(leadSources), status: randArr(leadStatuses), createdAt: now - (Math.random()*1000000000), updatedAt: now
        });
      }

      // 2. Customers (20 items)
      const custTypes = ["Khách lẻ", "Nhà thầu", "Kiến trúc sư", "Đại lý"];
      for(let i=0; i<20; i++) {
        await addDoc(collection(db, "customers"), {
          name: getName(), phone: getPhone(), email: `cust${i}@example.com`, type: randArr(custTypes), history: `Khách hàng tiềm năng số ${i}`, createdAt: now - (Math.random()*1000000000), updatedAt: now
        });
      }

      // 3. Channels (20 items)
      const platforms = ["Facebook Ads", "Google Ads", "TikTok Ads", "Zalo ZNS", "Email Marketing", "SEO"];
      const statuses = ["active", "paused", "completed"];
      for(let i=0; i<20; i++) {
        await addDoc(collection(db, "channels"), {
          name: `Chiến dịch ${randArr(platforms)} - đợt ${i}`, platform: randArr(platforms), budget: Math.floor(Math.random()*50)*1000000 + 5000000, status: randArr(statuses), createdAt: now, updatedAt: now
        });
      }

      // 4. Products (30 items)
      const categories = ["Gạch ốp lát", "Vật tư phụ", "Thiết bị vệ sinh", "Sơn nước", "Trần thạch cao"];
      const units = ["m2", "Viên", "Thùng", "Bao", "Cái", "Bộ"];
      for(let i=0; i<30; i++) {
        await addDoc(collection(db, "products"), {
          name: `Sản phẩm ${randArr(categories)} mã 0${i}`, sku: `SP-${1000+i}`, price: Math.floor(Math.random()*200)*10000 + 50000, unit: randArr(units), category: randArr(categories), createdAt: now, updatedAt: now
        });
      }

      // 5. Orders (25 items)
      const ordStatuses = ["processing", "shipping", "completed", "cancelled"];
      const payStatuses = ["unpaid", "partial", "paid"];
      for(let i=0; i<25; i++) {
        await addDoc(collection(db, "orders"), {
          orderNumber: `ORD-${Math.floor(Math.random()*10000)}`, customerName: getName(), productsSummary: `Mua ${Math.floor(Math.random()*10)+1} mặt hàng VLXD`, total: Math.floor(Math.random()*100)*1000000 + 2000000, status: randArr(ordStatuses), paymentStatus: randArr(payStatuses), createdAt: now - (Math.random()*1000000000), updatedAt: now
        });
      }

      // 6. Tasks (25 items)
      const taskTypes = ["Gọi điện", "Gặp mặt", "Email", "Khảo sát", "Gửi báo giá"];
      const taskStatuses = ["pending", "completed"];
      for(let i=0; i<25; i++) {
        await addDoc(collection(db, "tasks"), {
          title: `${randArr(taskTypes)} hỗ trợ khách hàng.`, customerName: getName(), type: randArr(taskTypes), dueDate: `2026-0${Math.floor(Math.random()*9)+1}-${Math.floor(Math.random()*28)+1}`, status: randArr(taskStatuses), createdAt: now, updatedAt: now
        });
      }

      // 7. Quotations (20 items)
      for(let i=0; i<20; i++) {
        await addDoc(collection(db, "quotations"), {
          customerId: `cid-${i}`, customerName: getName(), customerType: "customer", createdBy: "admin", products: [{ name: "Sản phẩm demo", price: 100000, quantity: 5 }], total: Math.floor(Math.random()*50)*100000 + 500000, createdAt: now - (Math.random()*500000000), updatedAt: now
        });
      }

      toast.success("Đã bổ sung thêm ~165 bản ghi dữ liệu mẫu!");
    } catch (error) {
      console.error(error);
      toast.error("Thêm dữ liệu mẫu thất bại.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCleanDuplicates = async () => {
    if (isSeeding || isCleaning) return;
    setIsCleaning(true);
    let deletedCount = 0;
    try {
      const collectionsToClean = [
        { name: 'leads', key: (d: any) => `${d.name}-${d.phone}` },
        { name: 'customers', key: (d: any) => `${d.name}-${d.phone}` },
        { name: 'quotations', key: (d: any) => `${d.customerName}-${d.total}` },
        { name: 'channels', key: (d: any) => `${d.name}-${d.platform}` },
        { name: 'tasks', key: (d: any) => `${d.title}-${d.customerName}` },
        { name: 'products', key: (d: any) => `${d.sku}` },
        { name: 'orders', key: (d: any) => `${d.orderNumber}` }
      ];

      for (const col of collectionsToClean) {
        const snap = await getDocs(collection(db, col.name));
        const seen = new Set();
        for (const document of snap.docs) {
          const data = document.data();
          const identifier = col.key(data);
          
          if (seen.has(identifier)) {
            await deleteDoc(doc(db, col.name, document.id));
            deletedCount++;
          } else {
            seen.add(identifier);
          }
        }
      }
      
      if (deletedCount > 0) {
        toast.success(`Đã xoá ${deletedCount} bản ghi trùng lặp do bấn nút dồn!`);
      } else {
        toast.info("Không phát hiện dữ liệu trùng lặp nào.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi dọn dẹp dữ liệu.");
    } finally {
      setIsCleaning(false);
    }
  };

  // Mock performance data for visual completeness
  const mockPerformance = [
    { name: 'T2', sales: 400 },
    { name: 'T3', sales: 300 },
    { name: 'T4', sales: 550 },
    { name: 'T5', sales: 450 },
    { name: 'T6', sales: 700 },
    { name: 'T7', sales: 650 },
  ];

  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Tổng quan hệ thống</h1>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <input type="text" placeholder="Tìm kiếm..." className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 relative cursor-pointer hover:bg-slate-200 transition-colors">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      </header>

      <div className="p-8 flex-1 flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Khách Tiềm Năng</p>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalLeads}</h3>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads Mới</p>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-slate-900">{stats.newLeads}</h3>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">New</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Khách Hàng</p>
              <UserCheck className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalCustomers}</h3>
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 flex-1 pb-8">
           <div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="p-4 border-b border-slate-100 w-full">
              <h2 className="font-bold text-slate-800">Nguồn Khách Hàng</h2>
            </div>
            <div className="p-4 flex-1 w-full flex items-center justify-center">
              {sourceData.length === 0 ? (
                <div className="flex w-full h-[250px] items-center justify-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  Chưa có dữ liệu thống kê
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {sourceData.length > 0 && (
              <div className="flex gap-4 pb-4 px-4 flex-wrap justify-center text-xs">
                {sourceData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length]}}></span>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
           <div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Hiệu Quả Kinh Doanh Nhóm</h2>
            </div>
            <div className="p-4 flex-1">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mockPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Leads Gần Đây</h2>
            </div>
            <div className="p-0 overflow-y-auto max-h-[310px]">
              {recentLeads.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">Chưa có leads nào</div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-800 text-sm">{lead.name}</span>
                        <span className="text-xs text-slate-500">{lead.phone}</span>
                      </div>
                      <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap",
                          lead.status === 'new' ? 'bg-emerald-100 text-emerald-700' :
                          lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                          lead.status === 'qualified' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        )}>
                          {lead.status === 'new' ? 'Mới' : lead.status === 'contacted' ? 'Đã liên hệ' : lead.status === 'qualified' ? 'Tiềm năng' : 'Hủy'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
