import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Search,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';

interface Pharmacy {
  _id: string;
  name: string;
  pharmacyName?: string;
  email: string;
  phone: string;
  address?: string;
  image?: string;
}

export default function PharmacySelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pharmacies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPharmacies(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch pharmacies');
      }
    } catch (error: any) {
      console.error('Error fetching pharmacies:', error);
      toast.error('Failed to load pharmacies: ' + error.message);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPharmacy = (pharmacyId: string) => {
    navigate(`/pharmacy/${pharmacyId}`);
  };

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.pharmacyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pharmacies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Select a Pharmacy
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Choose a pharmacy to submit your medication request and chat with their customer care
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search pharmacies by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pharmacies Grid */}
        {filteredPharmacies.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No pharmacies found' : 'No pharmacies available'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Please check back later or contact support'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPharmacies.map((pharmacy) => (
              <Card
                key={pharmacy._id}
                className="hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer border-0 shadow-sm"
                onClick={() => handleSelectPharmacy(pharmacy._id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      {pharmacy.image ? (
                        <AvatarImage src={pharmacy.image} alt={pharmacy.name} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                        <Building className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{pharmacy.name}</CardTitle>
                      {pharmacy.pharmacyName && pharmacy.pharmacyName !== pharmacy.name && (
                        <p className="text-sm text-gray-500 truncate">{pharmacy.pharmacyName}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pharmacy.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{pharmacy.address}</span>
                    </div>
                  )}
                  {pharmacy.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span>{pharmacy.phone}</span>
                    </div>
                  )}
                  {pharmacy.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="truncate">{pharmacy.email}</span>
                    </div>
                  )}
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPharmacy(pharmacy._id);
                    }}
                  >
                    Select Pharmacy
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Select a pharmacy from the list above</li>
                  <li>• Upload your prescription and fill out the request form</li>
                  <li>• Chat with the pharmacy's customer care in real-time</li>
                  <li>• Track your medication request status</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

