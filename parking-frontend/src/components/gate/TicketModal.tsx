import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Ticket, Zone, Gate } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Printer, CheckCircle } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  zone: Zone | null;
  gate: Gate | null;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  zone,
  gate,
}) => {
  const handlePrint = () => {
    window.print();
  };

  if (!ticket || !zone || !gate) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تذكرة الدخول" size="md">
      <div className="space-y-6">
        {/* Success Animation */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            تم الدخول بنجاح!
          </h3>
          <p className="text-gray-600">
            يرجى الاحتفاظ بهذه التذكرة للخروج
          </p>
        </div>

        {/* Ticket Details */}
        <div className="bg-gray-50 rounded-lg p-6 print:bg-white print:border print:border-gray-300">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">WeLink Cargo</h2>
            <p className="text-sm text-gray-600">نظام حجز المواقف</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">رقم التذكرة</label>
                <p className="text-lg font-mono font-semibold text-gray-900">{ticket.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">نوع الزائر</label>
                <p className="text-lg font-semibold text-gray-900">
                  {ticket.type === 'visitor' ? 'زائر' : 'مشترك'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">البوابة</label>
                <p className="text-lg font-semibold text-gray-900">{gate.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">المنطقة</label>
                <p className="text-lg font-semibold text-gray-900">{zone.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">وقت الدخول</label>
              <p className="text-lg font-semibold text-gray-900">
                {formatDateTime(ticket.checkinAt)}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 text-center">
                يرجى إبراز هذه التذكرة عند الخروج
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 print:hidden">
          <Button
            onClick={handlePrint}
            variant="secondary"
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>طباعة</span>
          </Button>
          <Button
            onClick={onClose}
            variant="primary"
            className="flex-1"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </Modal>
  );
};