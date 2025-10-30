import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BusinessHours() {
  const { toast } = useToast();
  
  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Business Hours</h1>
      </div>

      {/* Working Hours Section */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ChevronRight size={20} className="text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900">Working Hours</h3>
              <p className="text-sm text-gray-600">Set your business's weekly operating days and hours.</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Customize working hours
          </Button>
        </div>
      </div>

      {/* Special Working Hours Section */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ChevronRight size={20} className="text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900">Special Working Hours</h3>
              <p className="text-sm text-gray-600">Add extra available days or hours.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>

      {/* Unavailability Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <ChevronRight size={20} className="text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900">Unavailability</h3>
              <p className="text-sm text-gray-600">Add extra unavailable days or hours.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
