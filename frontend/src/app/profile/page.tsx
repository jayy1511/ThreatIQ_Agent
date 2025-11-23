'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { LogOut } from 'lucide-react';

import ProtectedRoute from "@/components/ProtectedRoute"

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={user?.photoURL || "https://github.com/shadcn.png"} alt="@shadcn" />
              <AvatarFallback>{user?.displayName ? user.displayName.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-bold">{user?.displayName || 'User'}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uid">User ID</Label>
                <p id="uid" className="text-sm text-gray-600 dark:text-gray-400 break-all">{user?.uid}</p>
              </div>
              <div>
                <Label htmlFor="provider">Provider</Label>
                <p id="provider" className="text-sm text-gray-600 dark:text-gray-400">{user?.providerData?.[0]?.providerId || 'N/A'}</p>
              </div>
            </div>
            <div className="pt-6 border-t">
              <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
