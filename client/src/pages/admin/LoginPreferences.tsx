import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPreferences() {
  const { toast } = useToast();
  const [allowGuest, setAllowGuest] = useState(true);
  const [allowRegistered, setAllowRegistered] = useState(false);
  
  const [loginFields, setLoginFields] = useState([
    { id: '1', name: 'Name', required: true, draggable: true },
    { id: '2', name: 'Email', required: true, draggable: true },
    { id: '3', name: 'Contact Number', required: true, draggable: true },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('zervos_login_prefs');
    if (saved) {
      const data = JSON.parse(saved);
      setAllowGuest(data.allowGuest);
      setAllowRegistered(data.allowRegistered);
      if (data.loginFields) setLoginFields(data.loginFields);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('zervos_login_prefs', JSON.stringify({
      allowGuest,
      allowRegistered,
      loginFields
    }));
    toast({ title: "Success", description: "Login preferences updated" });
  };
  
  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Login Preferences</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-600 mb-6">Set up your business login preferences.</p>

        {/* Login Options */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allowGuest}
              onChange={(e) => setAllowGuest(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-900">
              Allow <span className="text-indigo-600">Guest Login</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allowRegistered}
              onChange={(e) => setAllowRegistered(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-900">
              Allow <span className="text-indigo-600">Registered Login</span>
            </label>
          </div>
        </div>

        {/* Login Fields */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Login Fields</h3>
              <p className="text-sm text-gray-600">
                The following fields will be displayed in the booking form for register login options.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus size={16} />
              Add Custom Field
            </Button>
          </div>

          {/* Fields List */}
          <div className="space-y-2">
            {loginFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">☰</span>
                  <span className="text-sm font-medium text-gray-900">{field.name}</span>
                  {field.required && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button onClick={saveSettings}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
