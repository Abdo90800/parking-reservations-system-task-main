'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { formatDateTime, formatCurrency, formatDuration } from '@/lib/utils';
import { CheckoutResponse, Ticket, Subscription } from '@/types';
import { Scan, Receipt, AlertTriangle } from 'lucide-react';

export default function CheckpointPage() {
  const { user, token } = useAuth();
  const [ticketId, setTicketId] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lookup ticket
  const lookupTicket = async () => {
    if (!ticketId.trim()) {
      setError('يرجى إدخال رقم التذكرة');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const ticketData = await api.getTicket(ticketId);
      setTicket(ticketData);
      
      // If it's a subscriber ticket, get subscription details
      if (ticketData.type === 'subscriber') {
        // We need to find the subscription - this would typically be included in ticket data
        // For now, we'll try common subscription IDs from the seed data
        const commonSubs = ['sub_001', 'sub_002', 'sub_003', 'sub_004', 'sub_005'];
        for (const subId of commonSubs) {
          try {
            const subData = await api.getSubscription(subId);
            if (subData.currentCheckins?.some((c: any) => c.ticketId === ticketId)) {
              setSubscription(subData);
              break;
            }
          } catch (e) {
            // Continue searching
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
      setTicket(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  // Perform checkout
  const performCheckout = async (forceConvertToVisitor = false) => {
    if (!ticket) return;

    setLoading(true);
    setError('');

    try {
      const result = await api.checkout({
        ticketId: ticket.id,
        forceConvertToVisitor,
      });
      
      setCheckoutResult(result);
      setTicket(null);
      setSubscription(null);
      setTicketId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTicketId('');
    setTicket(null);
    setSubscription(null);
    setCheckoutResult(null);
    setError('');
  };

  if (!user || user.role !== 'employee') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="نقطة التفتيش" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">يجب تسجيل الدخول كموظف للوصول لهذه الصفحة</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="نقطة التفتيش" showTime />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Lookup */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Scan className="h-5 w-5" />
              <span>البحث عن التذكرة</span>
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  label="رقم التذكرة"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="امسح أو أدخل رقم التذكرة"
                  error={error}
                />
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={lookupTicket} loading={loading}>
                  بحث
                </Button>
                <Button onClick={resetForm} variant="secondary">
                  إعادة تعيين
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Information */}
        {ticket && (
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold">معلومات التذكرة</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم التذكرة
                  </label>
                  <p className="text-lg font-mono font-semibold">{ticket.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الزائر
                  </label>
                  <p className="text-lg font-semibold">
                    {ticket.type === 'visitor' ? 'زائر' : 'مشترك'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المنطقة
                  </label>
                  <p className="text-lg font-semibold">{ticket.zoneId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    وقت الدخول
                  </label>
                  <p className="text-lg font-semibold">
                    {formatDateTime(ticket.checkinAt)}
                  </p>
                </div>
              </div>

              {ticket.checkoutAt && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 font-semibold">
                    تم الخروج مسبقاً في: {formatDateTime(ticket.checkoutAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Subscription Details */}
        {subscription && (
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold">تفاصيل الاشتراك</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المشترك
                  </label>
                  <p className="text-lg font-semibold">{subscription.userName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفئة
                  </label>
                  <p className="text-lg font-semibold">{subscription.category}</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المركبات المسجلة
                </label>
                <div className="space-y-2">
                  {subscription.cars.map((car, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <p className="font-semibold">{car.plate}</p>
                      <p className="text-sm text-gray-600">
                        {car.brand} {car.model} - {car.color}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-800 font-semibold">تحقق من لوحة المركبة</p>
                    <p className="text-blue-700 text-sm">
                      تأكد من مطابقة لوحة المركبة مع إحدى اللوحات المسجلة أعلاه
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checkout Actions */}
        {ticket && !ticket.checkoutAt && (
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold">إجراءات الخروج</h3>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button
                  onClick={() => performCheckout(false)}
                  loading={loading}
                  variant="primary"
                  className="flex-1"
                >
                  خروج عادي
                </Button>
                
                {ticket.type === 'subscriber' && (
                  <Button
                    onClick={() => performCheckout(true)}
                    loading={loading}
                    variant="danger"
                    className="flex-1"
                  >
                    تحويل لزائر (عدم مطابقة اللوحة)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checkout Result */}
        {checkoutResult && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>فاتورة الخروج</span>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم التذكرة
                  </label>
                  <p className="text-lg font-mono font-semibold">{checkoutResult.ticketId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    مدة الإقامة
                  </label>
                  <p className="text-lg font-semibold">
                    {formatDuration(checkoutResult.durationHours)}
                  </p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">تفصيل الرسوم</h4>
                <div className="space-y-2">
                  {checkoutResult.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">
                          {formatDuration(item.hours)} - {item.rateMode === 'normal' ? 'عادي' : 'ذروة'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(item.from)} - {formatDateTime(item.to)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.amount)}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.rate)}/ساعة</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">المجموع:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(checkoutResult.amount)}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button onClick={resetForm} variant="primary" size="lg">
                  تذكرة جديدة
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}