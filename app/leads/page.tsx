"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LayoutList, KanbanSquare, Download } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  requirement?: string;
  completionTime: string;
  source: string;
  status: string;
  assignedTo?: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", requirement: "", completionTime: "", source: "Facebook", status: "new"
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const fetchLeads = async () => {
    try {
      const snap = await getDocs(collection(db, "leads"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách Lead");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const snap = await getDocs(collection(db, "leads"));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
        if (mounted) {
          setLeads(data);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          toast.error("Lỗi khi tải danh sách Lead");
          setLoading(false);
        }
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.completionTime) {
      return toast.error("Vui lòng điền các trường bắt buộc (Tên, SĐT, Thời gian hoàn thiện)");
    }
    try {
      if (editingId) {
        await updateDoc(doc(db, "leads", editingId), {
          ...formData,
          updatedAt: Date.now()
        });
        toast.success("Cập nhật Lead thành công");
      } else {
        await addDoc(collection(db, "leads"), {
          ...formData,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        toast.success("Thêm Lead thành công");
      }
      setOpen(false);
      fetchLeads();
    } catch (e: any) {
      toast.error("Lỗi: " + e.message);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: "", phone: "", email: "", requirement: "", completionTime: "", source: "Facebook", status: "new" });
    setEditingId(null);
    setOpen(true);
  };

  const openEditModal = (l: Lead) => {
    setFormData({ name: l.name, phone: l.phone, email: l.email || "", requirement: l.requirement || "", completionTime: l.completionTime, source: l.source, status: l.status });
    setEditingId(l.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Chắc chắn xóa?")) {
      await deleteDoc(doc(db, "leads", id));
      toast.success("Xóa thành công");
      fetchLeads();
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Tên", "SĐT", "Email", "Nhu cầu", "Thời gian", "Nguồn", "Trạng thái"];
    const rows = leads.map(l => [l.id, l.name, l.phone, l.email || '', l.requirement || '', l.completionTime, l.source, l.status]);
    let csvContent = "data:text/csv;charset=utf-8," + "\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "danh_sach_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã tải Excel (CSV)");
  };

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "leads", id), { status: newStatus });
      fetchLeads();
      toast.success("Chuyển trạng thái thành công");
    } catch(e) {
      toast.error("Lỗi khi cập nhật");
    }
  }

  const columns = [
    { title: "Lead Mới", id: "new", color: "border-emerald-500", bg: "bg-emerald-50" },
    { title: "Đã Liên Hệ", id: "contacted", color: "border-amber-500", bg: "bg-amber-50" },
    { title: "Tiềm Năng", id: "qualified", color: "border-emerald-500", bg: "bg-emerald-50" },
    { title: "Hủy / Thất bại", id: "lost", color: "border-red-500", bg: "bg-red-50" }
  ];

  const totalPages = Math.ceil(leads.length / itemsPerPage);
  const currentLeads = leads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Quản Lý Khách Tiềm Năng (Leads)</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
            <button onClick={() => setViewMode('list')} className={cn("px-3 py-1.5 rounded-md flex items-center text-sm font-medium transition-all", viewMode === 'list' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
               <LayoutList className="w-4 h-4 mr-2" /> Dạng Bảng
            </button>
            <button onClick={() => setViewMode('kanban')} className={cn("px-3 py-1.5 rounded-md flex items-center text-sm font-medium transition-all", viewMode === 'kanban' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
               <KanbanSquare className="w-4 h-4 mr-2" /> Bảng Kanban
            </button>
          </div>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Xuất File (Excel)
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button onClick={openCreateModal}>Thêm Lead Mới</Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Sửa" : "Thêm"} Lead Mới</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên khách hàng (*)</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Số điện thoại (*)</Label>
                  <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="requirement">Nhu cầu</Label>
                  <Input id="requirement" value={formData.requirement} onChange={e => setFormData({ ...formData, requirement: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="completionTime">Thời gian hoàn thiện (*)</Label>
                  <Input id="completionTime" placeholder="VD: Tháng 10/2026" value={formData.completionTime} onChange={e => setFormData({ ...formData, completionTime: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="source">Nguồn</Label>
                  <Select value={formData.source} onValueChange={v => setFormData({ ...formData, source: v as string })}>
                    <SelectTrigger><SelectValue placeholder="Chọn nguồn" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Khách giới thiệu">Khách giới thiệu</SelectItem>
                      <SelectItem value="Zalo OA">Zalo OA</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSave}>{editingId ? "Cập Nhật" : "Lưu Info"}</Button>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-x-auto">
        {viewMode === 'list' && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-6 py-3 border-b border-slate-100 rounded-tl-xl">Khách hàng</th>
                  <th className="px-6 py-3 border-b border-slate-100">SĐT</th>
                  <th className="px-6 py-3 border-b border-slate-100">Nhu cầu</th>
                  <th className="px-6 py-3 border-b border-slate-100">Nguồn</th>
                  <th className="px-6 py-3 border-b border-slate-100">Hoàn thiện</th>
                  <th className="px-6 py-3 border-b border-slate-100">Trạng thái</th>
                  <th className="px-6 py-3 border-b border-slate-100 text-right rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-6 text-slate-500">Đang tải...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-6 text-slate-500">Chưa có dữ liệu. Xin hãy Tạo dữ liệu Demo ở Dashboard.</td></tr>
                ) : (
                  currentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{lead.name}</td>
                      <td className="px-6 py-4 text-slate-600">{lead.phone}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{lead.requirement || '-'}</td>
                      <td className="px-6 py-4 text-slate-600">{lead.source}</td>
                      <td className="px-6 py-4 text-slate-600">{lead.completionTime}</td>
                      <td className="px-6 py-4">
                        <Select value={lead.status} onValueChange={(v) => updateLeadStatus(lead.id, v || "")}>
                          <SelectTrigger className={cn("h-7 text-xs border-0", lead.status === 'new' ? "bg-emerald-100 text-emerald-700" : lead.status === 'contacted' ? "bg-amber-100 text-amber-700" : lead.status === 'qualified' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Lead Mới</SelectItem>
                            <SelectItem value="contacted">Đã Liên Hệ</SelectItem>
                            <SelectItem value="qualified">Tiềm Năng</SelectItem>
                            <SelectItem value="lost">Bỏ Qua / Hủy</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right min-w-[120px]">
                        <button onClick={() => openEditModal(lead)} className="text-emerald-500 hover:text-emerald-700 font-medium text-sm p-1 mr-2">Sửa</button>
                        <button onClick={() => handleDelete(lead.id)} className="text-red-500 hover:text-red-700 font-medium text-sm p-1">Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {!loading && leads.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-white rounded-b-xl">
                <span className="text-xs text-slate-500">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, leads.length)} trong {leads.length}
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Trước</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Sau</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'kanban' && (
          <div className="flex gap-6 h-full items-start overflow-x-auto pb-4">
            {columns.map(col => (
              <div key={col.id} className={cn("w-80 shrink-0 rounded-xl border border-slate-200 border-t-4 bg-slate-100/50 flex flex-col max-h-full", col.color)}>
                <div className="p-4 border-b border-slate-200/50 flex justify-between items-center bg-white rounded-t-lg">
                  <h3 className="font-bold text-slate-800 text-sm">{col.title}</h3>
                  <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                    {leads.filter(l => l.status === col.id).length}
                  </span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
                  {leads.filter(l => l.status === col.id).map(lead => (
                    <div key={lead.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-sm">{lead.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{lead.source}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{lead.phone}</p>
                      <p className="text-xs text-slate-700 line-clamp-2 mb-3 bg-slate-50 p-2 rounded">{lead.requirement || 'Chưa cung cấp'}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400">H/Thiện: {lead.completionTime}</span>
                        <Select value={lead.status} onValueChange={(v) => updateLeadStatus(lead.id, v || "")}>
                          <SelectTrigger className="h-6 text-[10px] w-24"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Kéo sang Mới</SelectItem>
                            <SelectItem value="contacted">Chuyển Đã l.hệ</SelectItem>
                            <SelectItem value="qualified">Chuyển T.Năng</SelectItem>
                            <SelectItem value="lost">Chuyển Thất bại</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  {leads.filter(l => l.status === col.id).length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                      Chưa có Khách hàng
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
