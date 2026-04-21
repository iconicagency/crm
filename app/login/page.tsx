"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Successfully logged in");
      router.push("/");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Card className="w-full max-w-sm rounded-xl border-slate-200 shadow-md">
        <CardHeader className="text-center space-y-2 pt-8">
          <div className="mx-auto bg-blue-600 h-14 w-14 rounded-2xl flex items-center justify-center text-white mb-2 shadow-sm">
            <UserCheck className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl text-slate-800">Tân Gia Huy CRM</CardTitle>
          <CardDescription className="text-slate-500">
            Đăng nhập để vào hệ thống quản lý
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <Button 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-11" 
            onClick={handleGoogleLogin} 
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập với Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
