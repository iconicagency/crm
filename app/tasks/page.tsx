"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  customerName: string;
  type: string;
  dueDate: string;
  status: string;
  createdAt: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({ title: "", customerName: "", type: "Gọi điện", dueDate: "", status: "pending" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const qs = await getDocs(collection(db, "tasks"));
      setTasks(qs.docs.map(d => ({ id: d.id, ...d.data() } as Task)).sort((a,b) => b.createdAt - a.createdAt));
    } catch (e) {
      toast.error("Không tải được dữ liệu nhắc việc.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSave = async () => {
    if (!formData.title || !formData.customerName) return toast.error("Vui lòng điền đủ thông tin");
    try {
      if (editingId) {
        await updateDoc(doc(db, "tasks", editingId), { ...formData, updatedAt: Date.now() });
        toast.success("Cập nhật lịch chăm sóc thành công!");
      } else {
        await addDoc(collection(db, "tasks"), { ...formData, createdAt: Date.now(), updatedAt: Date.now() });
        toast.success("Tạo lịch chăm sóc thành công!");
      }
      setOpen(false); setFormData({ title: "", customerName: "", type: "Gọi điện", dueDate: "", status: "pending" }); fetchTasks();
    } catch (e) { toast.error("Lỗi khi lưu"); }
  };

  const openCreateModal = () => {
    setFormData({ title: "", customerName: "", type: "Gọi điện", dueDate: "", status: "pending" });
    setEditingId(null);
    setOpen(true);
  };

  const openEditModal = (t: Task) => {
    setFormData({ title: t.title, customerName: t.customerName, type: t.type, dueDate: t.dueDate, status: t.status });
    setEditingId(t.id);
    setOpen(true);
  };

  const toggleStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      const now = Date.now();
      await updateDoc(doc(db, "tasks", task.id), { status: newStatus, updatedAt: now });
      fetchTasks();
    } catch(e) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa lích nhắc việc này?")) return;
    try {
      await deleteDoc(doc(db, "tasks", id));
      toast.success("Đã xóa"); fetchTasks();
    } catch(e) { toast.error("Lỗi khi xóa"); }
  };

  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const currentItems = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Chăm Sóc & Nhắc Việc</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={openCreateModal}>Thêm Lịch Nhắc</Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>{editingId ? "Sửa" : "Thêm Mới"} Lịch Nhắc Chăm Sóc</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nội dung cần làm</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="VD: Hỏi thăm tiến độ thi công"/>
              </div>
              <div className="grid gap-2">
                <Label>Khách hàng liên quan</Label>
                <Input value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })}/>
              </div>
              <div className="grid gap-2">
                <Label>Loại tương tác</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v || "" })}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gọi điện">Gọi điện thoại</SelectItem>
                    <SelectItem value="Nhắn tin">Nhắn tin Zalo/SMS</SelectItem>
                    <SelectItem value="Gặp mặt">Gặp mặt trực tiếp</SelectItem>
                    <SelectItem value="Góp ý/Khảo sát">Khảo sát ý kiến</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Thời gian hẹn / Deadline</Label>
                <Input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleSave}>{editingId ? "Cập Nhật" : "Lưu lại"}</Button>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-8 flex-1 flex flex-col gap-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-6 py-3 border-b border-slate-100 rounded-tl-xl w-12">Tick</th>
                  <th className="px-6 py-3 border-b border-slate-100">Nội dung thao tác</th>
                  <th className="px-6 py-3 border-b border-slate-100">Khách Hàng</th>
                  <th className="px-6 py-3 border-b border-slate-100">Loại</th>
                  <th className="px-6 py-3 border-b border-slate-100">Hẹn</th>
                  <th className="px-6 py-3 border-b border-slate-100 text-right rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {loading ? <tr><td colSpan={6} className="text-center py-6">Đang tải...</td></tr> :
                  tasks.length === 0 ? <tr><td colSpan={6} className="text-center py-6 text-slate-500">Chưa có nhắc việc nào</td></tr> :
                  currentItems.map(t => (
                    <tr key={t.id} className={cn("hover:bg-slate-50", t.status === 'completed' && "opacity-60")}>
                      <td className="px-6 py-4">
                        <input type="checkbox" checked={t.status === 'completed'} onChange={() => toggleStatus(t)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" />
                      </td>
                      <td className={cn("px-6 py-4 font-medium", t.status === 'completed' && "line-through text-slate-500")}>{t.title}</td>
                      <td className="px-6 py-4 text-slate-700">{t.customerName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">{t.type}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{t.dueDate}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(t)} className="text-blue-500 hover:text-blue-700 font-medium text-sm p-1 mr-2">Sửa</button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Xóa</button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
            {!loading && tasks.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-white rounded-b-xl">
                <span className="text-xs text-slate-500">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, tasks.length)} trong {tasks.length}
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Trước</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Sau</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
