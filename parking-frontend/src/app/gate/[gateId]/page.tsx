'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  setGates, 
  setCurrentGate, 
  setZones, 
  updateZone, 
  setSelectedZone,
  setWsConnected,
  setLoading,
  setError 
} from '@/store/slices/gateSlice';
import { Header } from '@/components/layout/Header';
import { ZoneCard } from '@/components/gate/ZoneCard';
import { TicketModal } from '@/components/gate/TicketModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { wsManager } from '@/lib/websocket';
import { Zone, Ticket } from '@/types';

export default function GatePage() {
  const params = useParams();
  const dispatch = useDispatch();
  const gateId = params.gateId as string;
  
  const { 
    gates, 
    currentGate, 
    zones, 
    selectedZone, 
    wsConnected, 
    loading, 
    error 
  } = useSelector((state: RootState) => state.gate);

  const [activeTab, setActiveTab] = useState<'visitor' | 'subscriber'>('visitor');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      dispatch(setLoading(true));
      try {
        // Load gates
        const gatesData = await api.getGates();
        dispatch(setGates(gatesData));
        
        // Find current gate
        const gate = gatesData.find((g: any) => g.id === gateId);
        if (gate) {
          dispatch(setCurrentGate(gate));
          
          // Load zones for this gate
          const zonesData = await api.getZones(gateId);
          dispatch(setZones(zonesData));
        }
      } catch (err: any) {
        dispatch(setError(err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadData();
  }, [gateId, dispatch]);

  // Setup WebSocket
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        await wsManager.connect();
        wsManager.subscribeToGate(gateId);
        
        // Listen for zone updates
        wsManager.on('zone-update', (zoneData: Zone) => {
          dispatch(updateZone(zoneData));
        });

        // Listen for connection changes
        wsManager.onConnectionChange((connected: boolean) => {
          dispatch(setWsConnected(connected));
        });

        dispatch(setWsConnected(true));
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        dispatch(setWsConnected(false));
      }
    };

    setupWebSocket();

    return () => {
      wsManager.unsubscribeFromGate(gateId);
      wsManager.disconnect();
    };
  }, [gateId, dispatch]);

  // Verify subscription
  const verifySubscription = async () => {
    if (!subscriptionId.trim()) {
      setSubscriptionError('يرجى إدخال رقم الاشتراك');
      return;
    }

    try {
      const data = await api.getSubscription(subscriptionId);
      if (!data.active) {
        setSubscriptionError('الاشتراك غير نشط');
        setSubscriptionData(null);
        return;
      }
      
      setSubscriptionData(data);
      setSubscriptionError('');
    } catch (error: any) {
      setSubscriptionError('اشتراك غير موجود');
      setSubscriptionData(null);
    }
  };

  // Handle check-in
  const handleCheckin = async () => {
    if (!selectedZone) return;

    setCheckinLoading(true);
    try {
      const checkinData: any = {
        gateId,
        zoneId: selectedZone.id,
        type: activeTab,
      };

      if (activeTab === 'subscriber') {
        if (!subscriptionData) {
          setSubscriptionError('يرجى التحقق من الاشتراك أولاً');
          return;
        }
        checkinData.subscriptionId = subscriptionId;
      }

      const response = await api.checkin(checkinData);
      setCurrentTicket(response.ticket);
      setShowTicketModal(true);
      
      // Reset form
      dispatch(setSelectedZone(null));
      setSubscriptionId('');
      setSubscriptionData(null);
      
    } catch (error: any) {
      dispatch(setError(error.message));
    } finally {
      setCheckinLoading(false);
    }
  };

  // Filter zones that can be accessed through current gate
  const availableZones = zones.filter(zone => 
    zone.gateIds.includes(gateId)
  );

  // Check if zone is available for subscriber's category
  const isZoneAvailableForSubscriber = (zone: Zone) => {
    if (!subscriptionData) return false;
    return subscriptionData.category === zone.categoryId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="جاري التحميل..." wsConnected={wsConnected} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="خطأ" wsConnected={wsConnected} />
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
      <Header 
        title={currentGate ? `بوابة ${currentGate.name}` : 'البوابة'} 
        wsConnected={wsConnected} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('visitor')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'visitor'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                زائر
              </button>
              <button
                onClick={() => setActiveTab('subscriber')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subscriber'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                مشترك
              </button>
            </nav>
          </div>
        </div>

        {/* Subscriber verification */}
        {activeTab === 'subscriber' && (
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold">التحقق من الاشتراك</h3>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    label="رقم الاشتراك"
                    value={subscriptionId}
                    onChange={(e) => setSubscriptionId(e.target.value)}
                    error={subscriptionError}
                    placeholder="أدخل رقم الاشتراك"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={verifySubscription}>
                    تحقق
                  </Button>
                </div>
              </div>
              
              {subscriptionData && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h4 className="font-semibold text-green-800">
                    {subscriptionData.userName}
                  </h4>
                  <p className="text-sm text-green-700">
                    الفئة: {subscriptionData.category}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm text-green-700">المركبات:</p>
                    {subscriptionData.cars.map((car: any, index: number) => (
                      <p key={index} className="text-sm text-green-600">
                        {car.plate} - {car.brand} {car.model} ({car.color})
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Zone selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            اختر المنطقة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableZones.map((zone) => {
              const canSelect = activeTab === 'visitor' || 
                (activeTab === 'subscriber' && isZoneAvailableForSubscriber(zone));
              
              return (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  userType={activeTab}
                  onSelect={(z) => canSelect && dispatch(setSelectedZone(z))}
                  selected={selectedZone?.id === zone.id}
                />
              );
            })}
          </div>
        </div>

        {/* Check-in button */}
        {selectedZone && (
          <div className="text-center">
            <Button
              onClick={handleCheckin}
              loading={checkinLoading}
              size="lg"
              className="px-12"
              disabled={activeTab === 'subscriber' && !subscriptionData}
            >
              دخول
            </Button>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        ticket={currentTicket}
        zone={selectedZone}
        gate={currentGate}
      />
    </div>
  );
}