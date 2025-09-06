import React from 'react';
import { Zone } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Car, Users, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface ZoneCardProps {
  zone: Zone;
  userType: 'visitor' | 'subscriber';
  onSelect: (zone: Zone) => void;
  selected: boolean;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
  zone,
  userType,
  onSelect,
  selected,
}) => {
  const isAvailable = userType === 'visitor' 
    ? zone.availableForVisitors > 0 && zone.open
    : zone.availableForSubscribers > 0 && zone.open;

  const availableSlots = userType === 'visitor' 
    ? zone.availableForVisitors 
    : zone.availableForSubscribers;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        selected && 'ring-2 ring-blue-500 shadow-md',
        !zone.open && 'opacity-50',
        !isAvailable && 'cursor-not-allowed'
      )}
      onClick={() => isAvailable && onSelect(zone)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{zone.name}</h3>
            <p className="text-sm text-gray-600">الفئة: {zone.categoryId.replace('cat_', '')}</p>
          </div>
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            zone.open 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          )}>
            {zone.open ? 'مفتوح' : 'مغلق'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Car className="h-4 w-4 text-gray-500" />
            <div className="text-sm">
              <div className="text-gray-600">المشغول</div>
              <div className="font-semibold">{zone.occupied}/{zone.totalSlots}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div className="text-sm">
              <div className="text-gray-600">متاح</div>
              <div className="font-semibold text-green-600">{availableSlots}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div className="text-sm">
              <div className="text-gray-600">عادي</div>
              <div className="font-semibold">{formatCurrency(zone.rateNormal)}/ساعة</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <div className="text-sm">
              <div className="text-gray-600">ذروة</div>
              <div className="font-semibold text-orange-600">{formatCurrency(zone.rateSpecial)}/ساعة</div>
            </div>
          </div>
        </div>

        {zone.reserved > 0 && (
          <div className="text-xs text-gray-500 mb-3">
            محجوز للمشتركين: {zone.reserved} مكان
          </div>
        )}

        <Button
          variant={selected ? 'primary' : 'secondary'}
          className="w-full"
          disabled={!isAvailable}
        >
          {!zone.open 
            ? 'المنطقة مغلقة'
            : !isAvailable 
              ? 'لا توجد أماكن متاحة'
              : selected 
                ? 'محدد'
                : 'اختيار'
          }
        </Button>
      </CardContent>
    </Card>
  );
};