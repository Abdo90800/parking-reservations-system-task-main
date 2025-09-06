'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Car, 
  Shield, 
  Settings, 
  BarChart3,
  ArrowRight,
  Building2
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const navigationCards = [
    {
      title: 'البوابات',
      description: 'إدارة دخول المركبات عبر البوابات المختلفة',
      icon: Car,
      color: 'blue',
      href: '/gates',
      roles: ['admin', 'employee'],
    },
    {
      title: 'نقطة التفتيش',
      description: 'معالجة خروج المركبات وحساب الرسوم',
      icon: Shield,
      color: 'green',
      href: '/checkpoint',
      roles: ['admin', 'employee'],
    },
    {
      title: 'لوحة الإدارة',
      description: 'إدارة النظام والتقارير والإعدادات',
      icon: Settings,
      color: 'purple',
      href: '/admin',
      roles: ['admin'],
    },
  ];

  const availableCards = navigationCards.filter(card => 
    card.roles.includes(user.role)
  );

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="الصفحة الرئيسية" showTime />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            مرحباً بك، {user.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            نظام إدارة المواقف الشامل لشركة WeLink Cargo. 
            اختر الخدمة المطلوبة من الخيارات أدناه.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {availableCards.map((card) => (
            <Card
              key={card.title}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${getColorClasses(card.color)}`}
              onClick={() => router.push(card.href)}
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 rounded-full ${getIconColorClasses(card.color)}`}>
                    <card.icon className="h-8 w-8" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {card.title}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {card.description}
                </p>
                
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(card.href);
                  }}
                >
                  الدخول
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>إحصائيات سريعة</span>
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">5</div>
                <div className="text-sm text-gray-600">البوابات النشطة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">10</div>
                <div className="text-sm text-gray-600">المناطق المتاحة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">6</div>
                <div className="text-sm text-gray-600">الاشتراكات النشطة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">4</div>
                <div className="text-sm text-gray-600">فئات الأسعار</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>© 2025 WeLink Cargo. نظام إدارة المواقف - جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}