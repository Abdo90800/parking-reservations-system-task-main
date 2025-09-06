'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Gate } from '@/types';
import { MapPin, ArrowRight, Car } from 'lucide-react';

export default function GatesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadGates = async () => {
      try {
        const gatesData = await api.getGates();
        setGates(gatesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGates();
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="البوابات" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="البوابات" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="البوابات" showTime />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            اختر البوابة
          </h1>
          <p className="text-gray-600">
            اختر البوابة المطلوبة لإدارة دخول المركبات
          </p>
        </div>

        {/* Gates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gates.map((gate) => (
            <Card
              key={gate.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-blue-50 border-2 hover:border-blue-200"
              onClick={() => router.push(`/gate/${gate.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {gate.name}
                      </h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{gate.location}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">المناطق المتاحة:</p>
                    <div className="flex flex-wrap gap-2">
                      {gate.zoneIds.map((zoneId) => (
                        <span
                          key={zoneId}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {zoneId.replace('zone_', 'منطقة ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/gate/${gate.id}`);
                    }}
                  >
                    فتح البوابة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button
            onClick={() => router.push('/')}
            variant="secondary"
          >
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}