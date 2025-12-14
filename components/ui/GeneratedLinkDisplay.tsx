'use client';

import { useState } from 'react';
import { Button } from './Button';

interface GeneratedLinkDisplayProps {
  link: string;
  onCopy: () => Promise<boolean>;
  onClear?: () => void;
  expiryHours?: number;
}

export function GeneratedLinkDisplay({ 
  link, 
  onCopy, 
  onClear, 
  expiryHours = 3 
}: GeneratedLinkDisplayProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied' | 'failed'>('idle');

  const handleCopy = async () => {
    setCopyStatus('copying');
    const success = await onCopy();
    
    if (success) {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } else {
      setCopyStatus('failed');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const getCopyButtonText = () => {
    switch (copyStatus) {
      case 'copying': return '📋 Copying...';
      case 'copied': return '✅ Copied!';
      case 'failed': return '❌ Failed';
      default: return '📋 Copy';
    }
  };

  const getCopyButtonColor = () => {
    switch (copyStatus) {
      case 'copied': return 'bg-green-600 hover:bg-green-700';
      case 'failed': return 'bg-red-600 hover:bg-red-700';
      default: return '';
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 animate-fade-in lg:rounded-2xl lg:p-6">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <label className="text-sm font-medium text-gray-700 lg:text-base">
          Generated Invite Link
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full lg:text-sm">
            ✅ Ready to Share
          </span>
          {onClear && (
            <button
              onClick={onClear}
              className="text-xs text-gray-500 hover:text-gray-700 lg:text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* Link Input and Copy Button */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
        <input
          type="text"
          value={link}
          readOnly
          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 lg:px-4 lg:py-3 lg:text-base"
          onClick={(e) => e.currentTarget.select()}
        />
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          disabled={copyStatus === 'copying'}
          className={`shrink-0 ${getCopyButtonColor()}`}
        >
          {getCopyButtonText()}
        </Button>
      </div>
      
      {/* Link Information */}
      <div className="mt-4 space-y-2 text-xs text-gray-500 lg:text-sm">
        <div className="flex items-center space-x-2">
          <span>⏰</span>
          <span>This link expires in {expiryHours} hours</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>🔒</span>
          <span>The link can only be used once</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>📧</span>
          <span>Share this link with the intended recipient</span>
        </div>
      </div>

      {/* Quick Share Actions - Remove SMS, keep Email and WhatsApp */}
      <div className="mt-4 pt-4 border-t border-gray-200 lg:mt-6 lg:pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 lg:text-base">Quick Share</h4>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => window.open(`mailto:?subject=Healthcare Platform Invitation&body=You've been invited to join our healthcare platform. Click here to register: ${link}`)}
            className="p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900 lg:text-base">📧 Email</div>
            <div className="text-xs text-gray-500 lg:text-sm">Send via email</div>
          </button>
          
          <button 
            onClick={() => window.open(`https://wa.me/?text=You've been invited to join our healthcare platform: ${link}`)}
            className="p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900 lg:text-base">💬 WhatsApp</div>
            <div className="text-xs text-gray-500 lg:text-sm">Share via WhatsApp</div>
          </button>
        </div>
      </div>
    </div>
  );
}
