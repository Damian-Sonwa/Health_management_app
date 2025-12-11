import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface Pharmacy {
  _id: string;
  name?: string;
  pharmacyName?: string;
  phone?: string;
  address?: string;
  status?: string;
}

interface PharmacySelectProps {
  value: string;
  onChange: (pharmacyId: string | null) => void;
}

export default function PharmacySelect({ value, onChange }: PharmacySelectProps) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/pharmacies`;
      console.log('🔵 Fetching approved pharmacies from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔵 Pharmacies response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Pharmacies API error:', response.status, errorText);
        throw new Error(`Failed to fetch pharmacies: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔵 Pharmacies response data:', data);
      console.log('📡 Pharmacy fetch result:', JSON.stringify(data, null, 2));

      if (data.success) {
        // Backend already filters by status: 'approved', but double-check
        const approvedPharmacies = (data.data || []).filter((p: Pharmacy) => {
          const isApproved = !p.status || p.status === 'approved';
          const hasId = !!p._id;
          const hasName = !!(p.name || p.pharmacyName);
          
          if (!isApproved) {
            console.warn('⚠️ Pharmacy not approved:', p);
          }
          if (!hasId) {
            console.warn('⚠️ Pharmacy missing _id:', p);
          }
          if (!hasName) {
            console.warn('⚠️ Pharmacy missing name:', p);
          }
          
          return isApproved && hasId && hasName;
        });
        
        console.log(`🔵 Found ${approvedPharmacies.length} approved pharmacies (from ${data.data?.length || 0} total)`);
        setPharmacies(approvedPharmacies);
      } else {
        console.error('❌ Failed to fetch pharmacies:', data.message);
        setPharmacies([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching pharmacies:', error);
      console.error('❌ Error details:', error.message, error.stack);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (pharmacyId: string) => {
    // Call the onChange callback with the selected pharmacy ID
    onChange(pharmacyId || null);
  };

  if (loading) {
    return (
      <div className="w-full p-3 border border-gray-300 rounded-lg flex items-center gap-2 bg-white">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Loading pharmacies...</span>
      </div>
    );
  }

  return (
    <Select value={value || ''} onValueChange={handleSelect}>
      <SelectTrigger className="w-full h-11 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <SelectValue placeholder="Select a Pharmacy">
          {value ? pharmacies.find(p => p._id === value || p._id === value)?.name || pharmacies.find(p => p._id === value || p._id === value)?.pharmacyName || 'Select pharmacy' : 'Select a Pharmacy'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {pharmacies.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            <Building className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No approved pharmacies available</p>
            <p className="text-xs text-gray-400 mt-1">Please check back later</p>
          </div>
        ) : (
          pharmacies.map((pharmacy) => (
            <SelectItem key={pharmacy._id} value={pharmacy._id} className="cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-2 py-1">
                <Building className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900">{pharmacy.name || pharmacy.pharmacyName}</span>
                  {pharmacy.address && (
                    <p className="text-xs text-gray-500 truncate">{pharmacy.address}</p>
                  )}
                </div>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

