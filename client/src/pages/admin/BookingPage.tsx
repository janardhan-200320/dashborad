import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BookingPage() {
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState({
    businessName: 'bharath',
    bookingUrl: 'bharath.zervos.com'
  });
  
  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Business Booking Page</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <ExternalLink size={16} />
        </Button>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 h-64 relative">
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h2 className="text-4xl font-bold mb-2">{bookingData.businessName}</h2>
            
            <div className="flex gap-4 mt-8">
              <Button className="bg-white text-purple-600 hover:bg-gray-100 gap-2">
                <ExternalLink size={16} />
                Open Bookings Page
              </Button>
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 gap-2">
                <Palette size={16} />
                Themes and Layouts
              </Button>
            </div>
            
            <p className="mt-8 text-sm text-white/90">
              Book your appointment in a few simple steps: Choose a service, pick your date and time, and fill in your details. See you soon!
            </p>
          </div>
        </div>
      </div>

      {/* Additional Settings */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Page Customization</h3>
          <p className="text-sm text-gray-600 mb-4">Customize colors, fonts, and layout</p>
          <Button variant="outline" size="sm">Configure</Button>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">SEO Settings</h3>
          <p className="text-sm text-gray-600 mb-4">Optimize your page for search engines</p>
          <Button variant="outline" size="sm">Configure</Button>
        </div>
      </div>
    </div>
  );
}
