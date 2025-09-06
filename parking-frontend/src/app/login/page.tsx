'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Building2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(credentials.username, credentials.password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'فشل في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (username: string, password: string) => {
    setCredentials({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            WeLink Cargo
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            نظام حجز المواقف
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-center flex items-center justify-center space-x-2">
              <LogIn className="h-5 w-5" />
              <span>تسجيل الدخول</span>
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="اسم المستخدم"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                required
                placeholder="أدخل اسم المستخدم"
              />

              <Input
                label="كلمة المرور"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
                placeholder="أدخل كلمة المرور"
                error={error}
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                دخول
              </Button>
            </form>

            {/* Quick Login Options */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">
                تسجيل دخول سريع للاختبار:
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => quickLogin('admin', 'adminpass')}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  مدير النظام
                </Button>
                <Button
                  onClick={() => quickLogin('emp1', 'pass1')}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  موظف
                </Button>
                <Button
                  onClick={() => quickLogin('checkpoint1', 'checkpoint1')}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  نقطة تفتيش
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 WeLink Cargo. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}