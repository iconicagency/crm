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

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  productsSummary: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const statusMap: Record<string, string> = {
    processing: "Chờ xử lý",
    shipping: "Đang giao",
    delivered: "Hoàn tất",
    completed: "Hoàn tất",
    cancelled: "Đã huỷ"
  };

  const paymentMap: Record<string, string> = {
    unpaid: "Chưa thanh toán",
    partial: "Đã cọc 1 phần",
    paid: "Đã thanh toán đủ"
  };

  // Basic creation state
  const [formData, setFormData] = useState({ 
    customerName: "", 
    productsSummary: "", 
    total: 0, 
    status: "processing",
    paymentStatus: "unpaid"
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const qs = await getDocs(collection(db, "orders"));
      setOrders(qs.docs.map(d => ({ id: d.id, ...d.data() } as Order)).sort((a,b) => b.createdAt - a.createdAt));
    } catch (e) {
      toast.error("Không tải được dữ liệu đơn hàng.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleSave = async () => {
    if (!formData.customerName || formData.total <= 0) return toast.error("Vui lòng điền đủ tên khách và tổng tiền");
    try {
      if (editingId) {
        await updateDoc(doc(db, "orders", editingId), { ...formData, total: Number(formData.total), updatedAt: Date.now() });
        toast.success("Cập nhật đơn hàng thành công!");
      } else {
        const orderNumber = "ORD-" + Math.floor(1000 + Math.random() * 9000);
        await addDoc(collection(db, "orders"), { ...formData, orderNumber, total: Number(formData.total), createdAt: Date.now(), updatedAt: Date.now() });
        toast.success("Tạo đơn hàng thành công!");
      }
      setOpen(false); setFormData({ customerName: "", productsSummary: "", total: 0, status: "processing", paymentStatus: "unpaid" }); fetchOrders();
    } catch (e) { toast.error("Lỗi khi lưu"); }
  };

  const openCreateModal = () => {
    setFormData({ customerName: "", productsSummary: "", total: 0, status: "processing", paymentStatus: "unpaid" });
    setEditingId(null);
    setOpen(true);
  };

  const openEditModal = (o: Order) => {
    setFormData({ customerName: o.customerName, productsSummary: o.productsSummary, total: o.total, status: o.status, paymentStatus: o.paymentStatus });
    setEditingId(o.id);
    setOpen(true);
  };

  const updateStatus = async (id: string, field: string, value: string) => {
    try {
      const now = Date.now();
      await updateDoc(doc(db, "orders", id), { [field]: value, updatedAt: now });
      fetchOrders();
      toast.success("Cập nhật thành công");
    } catch(e){ toast.error("Cập nhật lỗi"); }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa đơn hàng này?")) return;
    try {
      await deleteDoc(doc(db, "orders", id));
      toast.success("Đã xóa"); fetchOrders();
    } catch(e) { toast.error("Lỗi khi xóa"); }
  };

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const currentItems = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Quản Lý Đơn Hàng</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={openCreateModal}>Thêm Đơn Mới</Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>{editingId ? "Sửa" : "Tạo Mới"} Đơn Hàng Nhanh</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Khách Hàng</Label>
                <Input value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Mô tả ngắn SP (VD: Combo thiết bị sinh hoạt)</Label>
                <Input value={formData.productsSummary} onChange={e => setFormData({ ...formData, productsSummary: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Tổng giá trị đơn (VNĐ)</Label>
                <Input type="number" value={formData.total || ''} onChange={e => setFormData({ ...formData, total: Number(e.target.value) })} />
              </div>
            </div>
            <Button onClick={handleSave}>{editingId ? "Cập Nhật" : "Lưu lại"}</Button>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-8 flex-1 flex flex-col gap-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="flex-1 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-6 py-3 border-b border-slate-100 rounded-tl-xl text-slate-400">Mã ĐH</th>
                  <th className="px-6 py-3 border-b border-slate-100">Ngày Tạo</th>
                  <th className="px-6 py-3 border-b border-slate-100">Khách Hàng</th>
                  <th className="px-6 py-3 border-b border-slate-100">Tổng Tiền</th>
                  <th className="px-6 py-3 border-b border-slate-100">Giao Hàng</th>
                  <th className="px-6 py-3 border-b border-slate-100">Thanh Toán</th>
                  <th className="px-6 py-3 border-b border-slate-100 text-right rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {loading ? <tr><td colSpan={7} className="text-center py-6">Đang tải...</td></tr> :
                  orders.length === 0 ? <tr><td colSpan={7} className="text-center py-6 text-slate-500">Chưa có đơn hàng nào</td></tr> :
                  currentItems.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-500">{o.orderNumber}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {o.customerName}<br/>
                        <span className="font-normal text-xs text-slate-400">{o.productsSummary}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(o.total)}</td>
                      <td className="px-6 py-4">
                        <Select value={o.status} onValueChange={(v) => updateStatus(o.id, 'status', v || "")}>
                          <SelectTrigger className={cn("h-7 text-xs border-0", (o.status === 'delivered' || o.status === 'completed') ? "bg-emerald-50 text-emerald-700" : o.status === 'processing' ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700")}><SelectValue>{statusMap[o.status] || o.status}</SelectValue></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="processing">Chờ xử lý / Đóng gói</SelectItem>
                            <SelectItem value="shipping">Đang giao hàng</SelectItem>
                            <SelectItem value="delivered">Đã giao hoàn tất</SelectItem>
                            <SelectItem value="cancelled">Đã huỷ</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        <Select value={o.paymentStatus} onValueChange={(v) => updateStatus(o.id, 'paymentStatus', v || "")}>
                          <SelectTrigger className={cn("h-7 text-xs border-0", o.paymentStatus === 'paid' ? "bg-emerald-50 text-emerald-700" : o.paymentStatus === 'partial' ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700")}><SelectValue>{paymentMap[o.paymentStatus] || o.paymentStatus}</SelectValue></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                            <SelectItem value="partial">Đã cọc 1 phần</SelectItem>
                            <SelectItem value="paid">Đã thanh toán đủ</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right min-w-[120px]">
                        <button onClick={() => openEditModal(o)} className="text-blue-500 hover:text-blue-700 font-medium text-sm p-1 mr-2">Sửa</button>
                        <button onClick={() => handleDelete(o.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Xóa</button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
            {!loading && orders.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-white rounded-b-xl">
                <span className="text-xs text-slate-500">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, orders.length)} trong {orders.length}
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
