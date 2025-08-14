// Network Status Indicator Component
// Shows connection status and offline functionality

'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useOffline, useNetworkStatus } from '@/app/contexts/OfflineContext';

interface NetworkStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export default function NetworkStatusIndicator({ 
  className = '', 
  showDetails = false 
}: NetworkStatusIndicatorProps) {
  const { offlineState, syncOfflineActions } = useOffline();
  const networkStatus = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (isSyncing || !networkStatus.isOnline) return;
    
    setIsSyncing(true);
    try {
      await syncOfflineActions();
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync when coming back online
  useEffect(() => {
    if (networkStatus.isOnline && offlineState.pendingActions > 0) {
      handleSync();
    }
  }, [networkStatus.isOnline, offlineState.pendingActions]);

  if (!offlineState.isInitialized) {
    return null; // Don't show until initialized
  }

  const isOnline = networkStatus.isOnline;
  const hasOfflineData = offlineState.hasOfflineData;
  const pendingActions = offlineState.pendingActions;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Network Status Icon */}
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        
        {/* Offline Data Status */}
        {hasOfflineData && (
          <Cloud className="w-4 h-4 text-blue-500" />
        )}
        
        {/* Pending Actions */}
        {pendingActions > 0 && (
          <div className="relative">
            <RefreshCw className={`w-4 h-4 text-orange-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {pendingActions}
            </span>
          </div>
        )}
      </div>

      {/* Status Text */}
      {showDetails && (
        <div className="text-sm">
          {isOnline ? (
            <span className="text-green-600">Online</span>
          ) : (
            <span className="text-red-600">Offline</span>
          )}
          
          {hasOfflineData && (
            <span className="text-blue-600 ml-2">• Offline data available</span>
          )}
          
          {pendingActions > 0 && (
            <span className="text-orange-600 ml-2">
              • {pendingActions} pending action{pendingActions !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Sync Button */}
      {pendingActions > 0 && isOnline && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
        </button>
      )}
    </div>
  );
}

// Compact version for mobile
export function CompactNetworkStatus() {
  const { offlineState } = useOffline();
  const networkStatus = useNetworkStatus();

  if (!offlineState.isInitialized) {
    return null;
  }

  const isOnline = networkStatus.isOnline;
  const hasOfflineData = offlineState.hasOfflineData;
  const pendingActions = offlineState.pendingActions;

  return (
    <div className="flex items-center space-x-1">
      {isOnline ? (
        <Wifi className="w-3 h-3 text-green-500" />
      ) : (
        <WifiOff className="w-3 h-3 text-red-500" />
      )}
      
      {hasOfflineData && (
        <Cloud className="w-3 h-3 text-blue-500" />
      )}
      
      {pendingActions > 0 && (
        <div className="relative">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center text-[8px]">
            {pendingActions > 9 ? '9+' : pendingActions}
          </span>
        </div>
      )}
    </div>
  );
}

// Offline banner for when user is offline
export function OfflineBanner() {
  const { offlineState, syncOfflineActions } = useOffline();
  const networkStatus = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  if (networkStatus.isOnline || !offlineState.isInitialized) {
    return null;
  }

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncOfflineActions();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 z-50 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">You're offline</span>
        {offlineState.hasOfflineData && (
          <span className="text-xs opacity-90">• Offline data available</span>
        )}
      </div>
      
      {offlineState.pendingActions > 0 && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="text-xs bg-white text-red-500 px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          {isSyncing ? 'Syncing...' : `Sync ${offlineState.pendingActions} action${offlineState.pendingActions !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}
