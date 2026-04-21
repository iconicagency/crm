"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Shield, User, Bell, Key, Users, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Đã cập nhật thông tin thành công!");
    }, 1000);
  };

  const dummyTeam = [
    { name: "Tân Gia Huy", email: "thanhnt.ads@gmail.com", role: "admin", status: "Active" },
    { name: "Nguyễn Văn A", email: "nva@tgh.vn", role: "staff", status: "Active" },
    { name: "Trần Thị C", email: "ttc@tgh.vn", role: "staff", status: "Invited" },
  ];

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center shrink-0">
        <h1 className="text-xl font-semibold text-slate-800">Cài Đặt Hệ Thống</h1>
      </header>

      <div className="p-8 flex-1 max-w-5xl mx-auto w-full">
        <Tabs orientation="vertical" defaultValue="profile" className="flex flex-col md:flex-row gap-8">
          <TabsList className="flex flex-col h-auto bg-transparent items-start justify-start p-0 w-full md:w-64 gap-2">
            <TabsTrigger value="profile" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2.5 rounded-lg text-slate-600 font-medium border border-transparent data-[state=active]:border-slate-200">
              <User className="h-4 w-4 mr-2" /> Hồ Sơ Cá Nhân
            </TabsTrigger>
            <TabsTrigger value="team" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2.5 rounded-lg text-slate-600 font-medium border border-transparent data-[state=active]:border-slate-200">
              <Users className="h-4 w-4 mr-2" /> Đội Ngũ & Nhân Sự
            </TabsTrigger>
            <TabsTrigger value="security" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2.5 rounded-lg text-slate-600 font-medium border border-transparent data-[state=active]:border-slate-200">
              <Shield className="h-4 w-4 mr-2" /> Bảo Mật / Phân Quyền
            </TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2.5 rounded-lg text-slate-600 font-medium border border-transparent data-[state=active]:border-slate-200">
              <Bell className="h-4 w-4 mr-2" /> Thông Báo
            </TabsTrigger>
            <TabsTrigger value="api" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2.5 rounded-lg text-slate-600 font-medium border border-transparent data-[state=active]:border-slate-200">
              <Key className="h-4 w-4 mr-2" /> Nền Tảng Mở Rộng
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 w-full">
            {/* PROFILE TAB */}
            <TabsContent value="profile" className="mt-0 outline-none w-full">
              <Card className="border-slate-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle>Thông tin hồ sơ</CardTitle>
                  <CardDescription>Cập nhật chi tiết thông tin cá nhân và tài khoản của bạn.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 flex flex-col">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-emerald-600 text-white text-2xl font-bold">T</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 flex flex-col">
                       <Button variant="outline" size="sm" className="w-fit">Đổi Ảnh Đại Diện</Button>
                       <p className="text-[10px] sm:text-xs text-slate-500">JPG, GIF hoặc PNG. Tối đa 5MB.</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Họ và Tên</Label>
                      <Input id="fullname" defaultValue={user?.name || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Hệ Thống</Label>
                      <Input id="email" type="email" defaultValue={user?.email || ""} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số Điện Thoại</Label>
                      <Input id="phone" defaultValue="0987654321" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Chức vụ trong tổ chức</Label>
                      <Input id="role" defaultValue={user?.role === 'admin' ? "Quản Trị Viên (Admin)" : "Nhân Viên"} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4 px-6 rounded-b-xl flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={loading} className="px-6">
                    {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* TEAM TAB */}
            <TabsContent value="team" className="mt-0 outline-none">
              <Card className="border-slate-200 shadow-sm rounded-xl">
                 <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <CardTitle>Đội Ngũ Nhân Sự</CardTitle>
                    <CardDescription>Quản lý và cấp quyền truy cập vào CRM.</CardDescription>
                  </div>
                  <Button size="sm">Thêm Mới</Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <div className="divide-y divide-slate-100 min-w-[500px]">
                    {dummyTeam.map((member, i) => (
                      <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-slate-200 text-slate-700">{member.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div className="flex flex-col">
                              <span className="font-medium text-slate-900 text-sm">{member.name}</span>
                              <span className="text-slate-500 text-xs">{member.email}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{member.status === 'Active' ? 'Hoạt động' : 'Đã mời'}</span>
                          <span className="text-sm font-medium text-slate-600 capitalize w-16">{member.role}</span>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Xóa</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SECURITY TAB */}
            <TabsContent value="security" className="mt-0 outline-none space-y-6">
               <Card className="border-slate-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle>Đổi Mật Khẩu</CardTitle>
                  <CardDescription>Cập nhật mật khẩu để tài khoản của bạn luôn được bảo vệ.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-w-sm">
                    <Label>Mật Khẩu Hiện Tại</Label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <Label>Mật Khẩu Mới</Label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <Label>Xác Nhận Lại</Label>
                    <Input type="password" />
                  </div>
                  <Button className="mt-4">Lưu Mật Khẩu</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NOTIFICATIONS */}
            <TabsContent value="notifications" className="mt-0 outline-none">
              <Card className="border-slate-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle>Nhắc Nhở Hệ Thống</CardTitle>
                  <CardDescription>Quản lý email và đẩy Notification gửi về thiết bị.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="flex items-center h-48 justify-center text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                      Đang cập nhật luồng cài đặt Email Server...
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API TAB */}
            <TabsContent value="api" className="mt-0 outline-none">
              <Card className="border-slate-200 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle>Tích Hợp Dịch Vụ</CardTitle>
                  <CardDescription>Liên kết đến Cổng giao tiếp ngoại vi bằng API.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="border border-slate-200 rounded-lg p-5 flex flex-col lg:flex-row items-center justify-between gap-4 bg-white">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex shrink-0 items-center justify-center">
                          <MessageSquare className="w-6 h-6" />
                       </div>
                       <div>
                         <h4 className="font-semibold text-slate-800">Cổng kết nối Pancake Chat</h4>
                         <p className="text-sm text-slate-500 line-clamp-2">Đồng bộ tin nhắn Facebook/Zalo, trích xuất leads tự động đổ về CRM.</p>
                       </div>
                     </div>
                     <Button variant="outline" className="w-full lg:w-auto shrink-0" onClick={() => toast.info("Đang đàm phán chính sách chia sẻ Token Oauth với Pancake.")}>Kết Nối Nhanh</Button>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  );
}
