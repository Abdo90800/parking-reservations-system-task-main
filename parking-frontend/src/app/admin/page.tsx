'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  setParkingState, 
  addAuditLogEntry, 
  setLoading, 
  setError 
} from '@/store/slices/adminSlice';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { wsManager } from '@/lib/websocket';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { 
  BarChart3, 
  Settings, 
  Users, 
  Clock, 
  Calendar,
  Activity,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function AdminPage() {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const { parkingState, auditLog, loading, error } = useSelector((state: RootState) => state.admin);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showRateModal, setShowRateModal] = useState(false);
  const [showRushModal, setShowRushModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // Form states
  const [rateForm, setRateForm] = useState({ rateNormal: 0, rateSpecial: 0 });
  const [rushForm, setRushForm] = useState({ weekDay: 1, from: '', to: '' });
  const [vacationForm, setVacationForm] = useState({ name: '', from: '', to: '' });

  // Load initial data
  useEffect(() => {
    if (!user || user.role !== 'admin' || !token) return;

    const loadData = async () => {
      dispatch(setLoading(true));
      try {
        const [parkingData, categoriesData, subscriptionsData] = await Promise.all([
          api.getParkingState(token),
          api.getCategories(),
          api.getSubscriptions(token),
        ]);
        
        dispatch(setParkingState(parkingData));
        setCategories(categoriesData);
        setSubscriptions(subscriptionsData);
      } catch (err: any) {
        dispatch(setError(err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadData();
  }, [user, token, dispatch]);

  // Setup WebSocket for admin updates
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        await wsManager.connect();
        
        wsManager.on('admin-update', (updateData: any) => {
          dispatch(addAuditLogEntry(updateData));
        });
      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    };

    setupWebSocket();

    return () => {
      wsManager.disconnect();
    };
  }, [dispatch]);

  // Toggle zone status
  const toggleZoneStatus = async (zoneId: string, currentStatus: boolean) => {
    if (!token) return;
    
    try {
      await api.updateZoneStatus(zoneId, !currentStatus, token);
      
      // Refresh parking state
      const parkingData = await api.getParkingState(token);
      dispatch(setParkingState(parkingData));
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  };

  // Update category rates
  const updateCategoryRates = async () => {
    if (!selectedCategory || !token) return;

    try {
      await api.updateCategory(selectedCategory.id, rateForm, token);
      
      // Refresh categories
      const categoriesData = await api.getCategories();
      setCategories(categoriesData);
      
      setShowRateModal(false);
      setSelectedCategory(null);
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  };

  // Add rush hour
  const addRushHour = async () => {
    if (!token) return;

    try {
      await api.addRushHour(rushForm, token);
      setShowRushModal(false);
      setRushForm({ weekDay: 1, from: '', to: '' });
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  };

  // Add vacation
  const addVacation = async () => {
    if (!token) return;

    try {
      await api.addVacation(vacationForm, token);
      setShowVacationModal(false);
      setVacationForm({ name: '', from: '', to: '' });
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="لوحة الإدارة" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">يجب تسجيل الدخول كمدير للوصول لهذه الصفحة</p>
          </div>
        </div>
      </div>
    );
  }

  const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="لوحة الإدارة" showTime />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
                { id: 'zones', label: 'إدارة المناطق', icon: Settings },
                { id: 'rates', label: 'الأسعار', icon: DollarSign },
                { id: 'schedule', label: 'الجدولة', icon: Clock },
                { id: 'subscriptions', label: 'الاشتراكات', icon: Users },
                { id: 'audit', label: 'سجل العمليات', icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">إجمالي الأماكن</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {parkingState.reduce((sum, zone) => sum + zone.totalSlots, 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">مشغول</p>
                      <p className="text-2xl font-bold text-red-600">
                        {parkingState.reduce((sum, zone) => sum + zone.occupied, 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <Users className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">متاح</p>
                      <p className="text-2xl font-bold text-green-600">
                        {parkingState.reduce((sum, zone) => sum + zone.free, 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">المشتركين</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {subscriptions.filter(s => s.active).length}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Parking State Table */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">حالة المواقف</h3>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المنطقة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجمالي
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          مشغول
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          متاح
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          محجوز
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parkingState.map((zone) => (
                        <tr key={zone.zoneId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {zone.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {zone.totalSlots}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {zone.occupied}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {zone.free}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                            {zone.reserved}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              zone.open 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {zone.open ? 'مفتوح' : 'مغلق'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Zones Management Tab */}
        {activeTab === 'zones' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">إدارة المناطق</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parkingState.map((zone) => (
                  <div key={zone.zoneId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{zone.name}</h4>
                      <p className="text-sm text-gray-600">
                        {zone.occupied}/{zone.totalSlots} مشغول
                      </p>
                    </div>
                    <Button
                      onClick={() => toggleZoneStatus(zone.zoneId, zone.open)}
                      variant={zone.open ? 'danger' : 'success'}
                      className="flex items-center space-x-2"
                    >
                      {zone.open ? (
                        <>
                          <ToggleRight className="h-4 w-4" />
                          <span>إغلاق</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4" />
                          <span>فتح</span>
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rates Management Tab */}
        {activeTab === 'rates' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">إدارة الأسعار</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{category.name}</h4>
                      <p className="text-sm text-gray-600">
                        عادي: {formatCurrency(category.rateNormal)}/ساعة | 
                        ذروة: {formatCurrency(category.rateSpecial)}/ساعة
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedCategory(category);
                        setRateForm({
                          rateNormal: category.rateNormal,
                          rateSpecial: category.rateSpecial,
                        });
                        setShowRateModal(true);
                      }}
                    >
                      تعديل الأسعار
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Management Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">أوقات الذروة</h3>
                  <Button onClick={() => setShowRushModal(true)}>
                    إضافة وقت ذروة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">إدارة أوقات الذروة حيث يتم تطبيق الأسعار الخاصة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">الإجازات</h3>
                  <Button onClick={() => setShowVacationModal(true)}>
                    إضافة إجازة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">إدارة فترات الإجازات حيث يتم تطبيق الأسعار الخاصة</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">الاشتراكات</h3>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المشترك
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الفئة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المركبات
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        داخل الموقف
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sub.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sub.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sub.cars.length} مركبة
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sub.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {sub.active ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sub.currentCheckins?.length || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">سجل العمليات</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLog.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">لا توجد عمليات مسجلة</p>
                ) : (
                  auditLog.map((entry, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{entry.action}</p>
                          <p className="text-sm text-gray-600">
                            {entry.targetType}: {entry.targetId}
                          </p>
                          <p className="text-sm text-gray-600">
                            المدير: {entry.adminId}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rate Update Modal */}
      <Modal
        isOpen={showRateModal}
        onClose={() => setShowRateModal(false)}
        title="تعديل الأسعار"
      >
        <div className="space-y-4">
          <Input
            label="السعر العادي (ريال/ساعة)"
            type="number"
            step="0.1"
            value={rateForm.rateNormal}
            onChange={(e) => setRateForm(prev => ({ ...prev, rateNormal: parseFloat(e.target.value) }))}
          />
          <Input
            label="سعر الذروة (ريال/ساعة)"
            type="number"
            step="0.1"
            value={rateForm.rateSpecial}
            onChange={(e) => setRateForm(prev => ({ ...prev, rateSpecial: parseFloat(e.target.value) }))}
          />
          <div className="flex space-x-3">
            <Button onClick={updateCategoryRates} className="flex-1">
              حفظ
            </Button>
            <Button 
              onClick={() => setShowRateModal(false)} 
              variant="secondary" 
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rush Hour Modal */}
      <Modal
        isOpen={showRushModal}
        onClose={() => setShowRushModal(false)}
        title="إضافة وقت ذروة"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اليوم
            </label>
            <select
              value={rushForm.weekDay}
              onChange={(e) => setRushForm(prev => ({ ...prev, weekDay: parseInt(e.target.value) }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {weekDays.map((day, index) => (
                <option key={index} value={index}>{day}</option>
              ))}
            </select>
          </div>
          <Input
            label="من الساعة"
            type="time"
            value={rushForm.from}
            onChange={(e) => setRushForm(prev => ({ ...prev, from: e.target.value }))}
          />
          <Input
            label="إلى الساعة"
            type="time"
            value={rushForm.to}
            onChange={(e) => setRushForm(prev => ({ ...prev, to: e.target.value }))}
          />
          <div className="flex space-x-3">
            <Button onClick={addRushHour} className="flex-1">
              إضافة
            </Button>
            <Button 
              onClick={() => setShowRushModal(false)} 
              variant="secondary" 
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* Vacation Modal */}
      <Modal
        isOpen={showVacationModal}
        onClose={() => setShowVacationModal(false)}
        title="إضافة إجازة"
      >
        <div className="space-y-4">
          <Input
            label="اسم الإجازة"
            value={vacationForm.name}
            onChange={(e) => setVacationForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="مثل: عيد الفطر"
          />
          <Input
            label="من تاريخ"
            type="date"
            value={vacationForm.from}
            onChange={(e) => setVacationForm(prev => ({ ...prev, from: e.target.value }))}
          />
          <Input
            label="إلى تاريخ"
            type="date"
            value={vacationForm.to}
            onChange={(e) => setVacationForm(prev => ({ ...prev, to: e.target.value }))}
          />
          <div className="flex space-x-3">
            <Button onClick={addVacation} className="flex-1">
              إضافة
            </Button>
            <Button 
              onClick={() => setShowVacationModal(false)} 
              variant="secondary" 
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}