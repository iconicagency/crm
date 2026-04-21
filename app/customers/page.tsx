"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: string;
  history?: string;
  createdAt: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", type: "Khách lẻ", history: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCustomers = async () => {
    try {
      const snap = await getDocs(collection(db, "customers"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách Khách hàng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const snap = await getDocs(collection(db, "customers"));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        if (mounted) {
          setCustomers(data);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          toast.error("Lỗi khi tải danh sách Khách hàng");
          setLoading(false);
        }
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.type) {
      return toast.error("Vui lòng điền Tên, SĐT và Phân loại");
    }
    try {
      if (editingId) {
        await updateDoc(doc(db, "customers", editingId), {
          ...formData,
          updatedAt: Date.now()
        });
        toast.success("Cập nhật Khách hàng thành công");
      } else {
        await addDoc(collection(db, "customers"), {
          ...formData,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        toast.success("Thêm Khách hàng thành công");
      }
      setOpen(false);
      fetchCustomers();
    } catch (e: any) {
      toast.error("Lỗi: " + e.message);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: "", phone: "", email: "", type: "Khách lẻ", history: "" });
    setEditingId(null);
    setOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setFormData({ name: c.name, phone: c.phone, email: c.email || "", type: c.type, history: c.history || "" });
    setEditingId(c.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (user?.role !== 'admin') {
      return toast.error("Chỉ Admin mới có quyền xóa");
    }
    if (confirm("Chắc chắn xóa?")) {
      await deleteDoc(doc(db, "customers", id));
      toast.success("Xóa thành công");
      fetchCustomers();
    }
  };

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const currentItems = customers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Quản Lý Khách Hàng</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={openCreateModal}>Thêm Khách Hàng</Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Sửa" : "Thêm"} Khách Hàng</DialogTitle>
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
                <Label htmlFor="type">Phân loại (*)</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v as string })}>
                  <SelectTrigger><SelectValue placeholder="Chọn phân loại" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Khách lẻ">Khách lẻ</SelectItem>
                    <SelectItem value="Nhà thầu">Nhà thầu</SelectItem>
                    <SelectItem value="Kiến trúc sư">Kiến trúc sư</SelectItem>
                    <SelectItem value="Đại lý">Đại lý</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="history">Ghi chú / Lịch sử</Label>
                <Input id="history" value={formData.history} onChange={e => setFormData({ ...formData, history: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleSave}>{editingId ? "Cập Nhật" : "Lưu Info"}</Button>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-8 flex-1 flex flex-col gap-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Danh sách Khách Hàng</h2>
          </div>
          <div className="flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-6 py-3 border-b border-slate-100">Tên KH</th>
                  <th className="px-6 py-3 border-b border-slate-100">SĐT</th>
                  <th className="px-6 py-3 border-b border-slate-100">Email</th>
                  <th className="px-6 py-3 border-b border-slate-100">Phân nhóm</th>
                  <th className="px-6 py-3 border-b border-slate-100">Ngày tạo</th>
                  <th className="px-6 py-3 border-b border-slate-100 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-6 text-slate-500">Đang tải...</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6 text-slate-500">Chưa có dữ liệu</td></tr>
                ) : (
                  currentItems.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                      <td className="px-6 py-4 text-slate-600">{c.phone}</td>
                      <td className="px-6 py-4 text-slate-600">{c.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border border-slate-200 text-slate-700 bg-slate-50">
                          {c.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(c)} className="text-emerald-500 hover:text-emerald-700 font-medium text-sm p-1 mr-2">Sửa</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 font-medium text-sm p-1">Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!loading && customers.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-white rounded-b-xl">
                <span className="text-xs text-slate-500">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, customers.length)} trong {customers.length}
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
