"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  category: string;
  createdAt: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({ name: "", sku: "", price: 0, unit: "Cái", category: "Vật tư" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const qs = await getDocs(collection(db, "products"));
      setProducts(qs.docs.map(d => ({ id: d.id, ...d.data() } as Product)).sort((a,b) => b.createdAt - a.createdAt));
    } catch (e) {
      toast.error("Không tải được dữ liệu sản phẩm.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const qs = await getDocs(collection(db, "products"));
        const data = qs.docs.map(d => ({ id: d.id, ...d.data() } as Product)).sort((a,b) => b.createdAt - a.createdAt);
        if (mounted) {
          setProducts(data);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          toast.error("Không tải được dữ liệu sản phẩm.");
          setLoading(false);
        }
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.sku) return toast.error("Vui lòng điền tên và mã SP");
    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), { ...formData, price: Number(formData.price), updatedAt: Date.now() });
        toast.success("Cập nhật thành công!");
      } else {
        await addDoc(collection(db, "products"), { ...formData, price: Number(formData.price), createdAt: Date.now(), updatedAt: Date.now() });
        toast.success("Tạo sản phẩm thành công!");
      }
      setOpen(false); setFormData({ name: "", sku: "", price: 0, unit: "Cái", category: "Vật tư" }); fetchProducts();
    } catch (e) { toast.error("Lỗi khi lưu sản phẩm"); }
  };

  const openCreateModal = () => {
    setFormData({ name: "", sku: "", price: 0, unit: "Cái", category: "Vật tư" });
    setEditingId(null);
    setOpen(true);
  };

  const openEditModal = (p: Product) => {
    setFormData({ name: p.name, sku: p.sku, price: p.price, unit: p.unit, category: p.category });
    setEditingId(p.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Đã xóa"); fetchProducts();
    } catch(e) { toast.error("Lỗi khi xóa"); }
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentItems = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Kho Sản Phẩm</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={openCreateModal}>Thêm Sản Phẩm Mới</Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>{editingId ? "Sửa" : "Thêm"} Sản Phẩm</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tên Sản Phẩm (*)</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Mã SKU (*)</Label>
                <Input value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Đơn Giá (VNĐ)</Label>
                <Input type="number" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label>Đơn vị (Viên, Bao, Khối, Lít...)</Label>
                <Input value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Danh mục (Vật tư, Thiết bị, Dịch vụ)</Label>
                <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
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
                  <th className="px-6 py-3 border-b border-slate-100 rounded-tl-xl text-slate-400">SKU</th>
                  <th className="px-6 py-3 border-b border-slate-100">Tên Sản Phẩm</th>
                  <th className="px-6 py-3 border-b border-slate-100">Danh Mục</th>
                  <th className="px-6 py-3 border-b border-slate-100">Đơn Giá</th>
                  <th className="px-6 py-3 border-b border-slate-100">Đơn Vị</th>
                  <th className="px-6 py-3 border-b border-slate-100 text-right rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {loading ? <tr><td colSpan={6} className="text-center py-6">Đang tải...</td></tr> :
                  products.length === 0 ? <tr><td colSpan={6} className="text-center py-6 text-slate-500">Chưa có sản phẩm nào. Hãy thử Thêm hoặc dùng Tạo dữ liệu Demo.</td></tr> :
                  currentItems.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-slate-400 text-xs">{p.sku}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{p.name}</td>
                      <td className="px-6 py-4 text-slate-600">{p.category}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">{new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(p.price)}</td>
                      <td className="px-6 py-4 text-slate-500">{p.unit}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(p)} className="text-emerald-500 hover:text-emerald-700 font-medium text-sm p-1 mr-2">Sửa</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Xóa</button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
            {!loading && products.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-white rounded-b-xl">
                <span className="text-xs text-slate-500">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, products.length)} trong {products.length}
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
