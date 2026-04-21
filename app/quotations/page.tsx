"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface QuotationProduct {
  name: string;
  price: number;
  quantity: number;
}

interface Quotation {
  id: string;
  customerId: string;
  customerName: string;
  customerType: string;
  products: QuotationProduct[];
  total: number;
  createdBy: string;
  createdAt: number;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { user } = useAuth();
  
  const [formCustomerName, setFormCustomerName] = useState("");
  const [products, setProducts] = useState<QuotationProduct[]>([{ name: "", price: 0, quantity: 1 }]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      const snap = await getDocs(collection(db, "quotations"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
      setQuotations(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách Báo giá");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const addProductRow = () => setProducts([...products, { name: "", price: 0, quantity: 1 }]);
  
  const updateProduct = (index: number, field: keyof QuotationProduct, value: string | number) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  const handleSave = async () => {
    if (!formCustomerName) {
      return toast.error("Vui lòng nhập tên khách hàng");
    }
    const validProducts = products.filter(p => p.name.trim() !== "" && p.price > 0 && p.quantity > 0);
    if (validProducts.length === 0) {
      return toast.error("Vui lòng thêm ít nhất 1 sản phẩm hợp lệ");
    }
    
    const total = validProducts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    
    try {
      if (editingId) {
        await updateDoc(doc(db, "quotations", editingId), {
          customerName: formCustomerName,
          products: validProducts,
          total,
          updatedAt: Date.now()
        });
        toast.success("Cập nhật báo giá thành công");
      } else {
        await addDoc(collection(db, "quotations"), {
          customerId: "temp_id_" + Date.now(),
          customerName: formCustomerName,
          customerType: "customer",
          products: validProducts,
          total,
          createdBy: user?.uid || "unknown",
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        toast.success("Tạo báo giá thành công");
      }
      setOpen(false);
      setFormCustomerName("");
      setProducts([{ name: "", price: 0, quantity: 1 }]);
      fetchQuotations();
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi: " + e.message);
    }
  };

  const openCreateModal = () => {
    setFormCustomerName("");
    setProducts([{ name: "", price: 0, quantity: 1 }]);
    setEditingId(null);
    setOpen(true);
  };

  const openEditModal = (q: Quotation) => {
    setFormCustomerName(q.customerName);
    setProducts(q.products.length ? q.products : [{ name: "", price: 0, quantity: 1 }]);
    setEditingId(q.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa báo giá này?")) return;
    try {
      await deleteDoc(doc(db, "quotations", id));
      toast.success("Đã xóa báo giá");
      fetchQuotations();
    } catch (e: any) {
      toast.error("Lỗi khi xóa");
    }
  };

  const handleExportPDF = (quote: Quotation) => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.text("BAO GIA (QUOTATION)", 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Khach hang: ${quote.customerName}`, 14, 30);
    doc.text(`Ngay: ${new Date(quote.createdAt).toLocaleDateString('vi-VN')}`, 14, 40);
    
    const tableBody = quote.products.map((p, idx) => [
      idx + 1,
      p.name,
      p.quantity,
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price),
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price * p.quantity)
    ]);
    
    autoTable(doc, {
      startY: 50,
      head: [['STT', 'San pham / Hang muc', 'So luong', 'Don gia', 'Thanh tien']],
      body: tableBody,
    });
    
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 50;
    doc.text(`Tong cong: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quote.total)}`, 14, finalY + 10);
    
    doc.save(`Bao_Gia_${quote.customerName.replace(/\s+/g, '_')}.pdf`);
  };

  const totalPages = Math.ceil(quotations.length / itemsPerPage);
  const currentItems = quotations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Quản Lý Đơn / Báo Giá</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={openCreateModal}>Tạo Báo Giá Mới</Button>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Sửa" : "Tạo Mới"} Báo Giá / Đơn hàng</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Tên khách hàng (*)</Label>
                <Input id="customerName" value={formCustomerName} onChange={e => setFormCustomerName(e.target.value)} />
              </div>
              
              <div className="space-y-4">
                <Label>Sản phẩm / Hạng mục</Label>
                {products.map((p, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-2 border p-2 rounded-md">
                    <Input placeholder="Tên sản phẩm" value={p.name} onChange={e => updateProduct(i, 'name', e.target.value)} className="flex-1" />
                    <Input type="number" placeholder="Đơn giá" value={p.price || ''} onChange={e => updateProduct(i, 'price', Number(e.target.value))} className="w-full md:w-32" />
                    <Input type="number" placeholder="SL" value={p.quantity || ''} onChange={e => updateProduct(i, 'quantity', Number(e.target.value))} className="w-full md:w-20" />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addProductRow} className="w-full">
                  + Thêm sản phẩm
                </Button>
              </div>
              
              <div className="pt-4 border-t text-right font-semibold">
                Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  products.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 0)), 0)
                )}
              </div>
            </div>
            <Button onClick={handleSave}>{editingId ? "Cập Nhật" : "Lưu Báo Giá"}</Button>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-8 flex-1 flex flex-col gap-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Danh sách Báo Giá</h2>
          </div>
          <div className="flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-6 py-3 border-b border-slate-100">Khách Hàng</th>
                  <th className="px-6 py-3 border-b border-slate-100">Ngày tạo</th>
                  <th className="px-6 py-3 border-b border-slate-100">Tổng tiền</th>
                  <th className="px-6 py-3 border-b border-slate-100 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-6 text-slate-500">Đang tải...</td></tr>
                ) : quotations.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-slate-500">Chưa có dữ liệu</td></tr>
                ) : (
                  currentItems.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{q.customerName}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(q.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(q.total)}
                      </td>
                      <td className="px-6 py-4 text-right min-w-[180px]">
                        <Button variant="outline" size="sm" onClick={() => handleExportPDF(q)} className="text-xs mr-2">Xuất PDF</Button>
                        <button onClick={() => openEditModal(q)} className="text-blue-500 hover:text-blue-700 font-medium text-sm p-1 mr-2">Sửa</button>
                        <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700 font-medium text-sm p-1">Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!loading && quotations.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-white rounded-b-xl">
                <span className="text-xs text-slate-500">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, quotations.length)} trong {quotations.length}
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
