import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { User, LogOut, Wifi, WifiOff } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface HeaderProps {
  title: string;
  wsConnected?: boolean;
  showTime?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  wsConnected,
  showTime = true,
}) => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {wsConnected !== undefined && (
              <div className="flex items-center space-x-2">
                {wsConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="h-4 w-4 mr-1" />
                    <span className="text-sm">متصل</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="h-4 w-4 mr-1" />
                    <span className="text-sm">غير متصل</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {showTime && (
              <div className="text-sm text-gray-600">
                {formatDateTime(currentTime.toISOString())}
              </div>
            )}
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {user.role === 'admin' ? 'مدير' : 'موظف'}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>خروج</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};