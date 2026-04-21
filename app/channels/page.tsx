"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  platform: string;
  budget: number;
  status: string;
  createdAt: number;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({ name: "", platform: "Facebook", budget: 0, status: "active" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const qs = await getDocs(collection(db, "channels"));
      setChannels(qs.docs.map(d => ({ id: d.id, ...d.data() } as Channel)).sort((a,b) => b.createdAt - a.createdAt));
    } catch (e) {
      console.error(e);
      toast.error("Không tải được dữ liệu Marketing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const qs = await getDocs(collection(db, "channels"));
        const data = qs.docs.map(d => ({ id: d.id, ...d.data() } as Channel)).sort((a,b) => b.createdAt - a.createdAt);
        if (mounted) {
          setChannels(data);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          toast.error("Không tải được dữ liệu Marketing.");
          setLoading(false);
        }
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    if (!formData.name) return toast.error("Vui lòng điền tên chiến dịch");
    try {
      if (editingId) {
        await updateDoc(doc(db, "channels", editingId), { ...formData, budget: Number(formData.budget), updatedAt: Date.now() });
        toast.success("Cập nhật thành công!");
      } else {
        await addDoc(collection(db, "channels"), { ...formData, budget: Number(formData.budget), createdAt: Date.now(), updatedAt: Date.now() });
        toast.success("Tạo kênh Marketing thành công!");
      }
      setOpen(false); setFormData({ name: "", platform: "Facebook", budget: 0, status: "active" }); fetchChannels();
    } catch (e) {
      toast.error("Lỗi khi cập nhật kênh Marketing");
    }
  };

  const openCreateModal = () => {
    setFormData({ name: "", platform: "Facebook", budget: 0, status: "active" });
    setEditingId(null);
    setOpen(true);
  };

  const openEditModal = (c: Channel) => {
    setFormData({ name: c.name, platform: c.platform, budget: c.budget, status: c.status });
    setEditingId(c.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa chiến dịch này?")) return;
    try {
      await deleteDoc(doc(db, "channels", id));
      toast.success("Đã xóa"); fetchChannels();
    } catch(e) {
      toast.error("Lỗi khi xóa");
    }
  };

  const totalPages = Math.ceil(channels.length / itemsPerPage);
  const currentItems = channels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Quản Lý Marketing</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={openCreateModal}>Thêm Chiến Dịch</Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>{editingId ? "Sửa Chiến Dịch" : "Chiến Dịch Mới"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tên chiến dịch</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Nền tảng</Label>
                <Select value={formData.platform} onValueChange={v => setFormData({ ...formData, platform: v || "" })}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">Facebook Ads</SelectItem>
                    <SelectItem value="Google">Google Ads</SelectItem>
                    <SelectItem value="Tiktok">Tiktok</SelectItem>
                    <SelectItem value="Zalo">Zalo Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Ngân sách (VNĐ)</Label>
                <Input type="number" value={formData.budget || ''} onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label>Trạng thái</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v || "" })}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang chạy</SelectItem>
                    <SelectItem value="paused">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
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
                  <th className="px-6 py-3 border-b border-slate-100 rounded-tl-xl">Chiến dịch</th>
                  <th className="px-6 py-3 border-b border-slate-100">Nền tảng</th>
                  <th className="px-6 py-3 border-b border-slate-100">Ngân sách</th>
                  <th className="px-6 py-3 border-b border-slate-100">Trạng thái</th>
                  <th className="px-6 py-3 border-b border-slate-100 text-right rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {loading ? <tr><td colSpan={5} className="text-center py-6">Đang tải...</td></tr> :
                  channels.length === 0 ? <tr><td colSpan={5} className="text-center py-6 text-slate-500">Chưa có chiến dịch nào</td></tr> :
                  currentItems.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{c.name}</td>
                      <td className="px-6 py-4">{c.platform}</td>
                      <td className="px-6 py-4">{new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(c.budget)}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs", c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700')}>
                          {c.status === 'active' ? 'Đang chạy' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(c)} className="text-emerald-500 hover:text-emerald-700 font-medium text-sm p-1 mr-2">Sửa</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Xóa</button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
            {!loading && channels.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-white rounded-b-xl">
                <span className="text-xs text-slate-500">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, channels.length)} trong {channels.length}
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
