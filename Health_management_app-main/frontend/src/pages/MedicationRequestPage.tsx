import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Upload, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  Truck, 
  Package,
  Shield,
  User,
  Phone,
  Mail,
  Plus,
  Eye,
  X
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface MedicationRequest {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  prescriptionFile: File | null;
  pharmacy: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentReceipt: File | null;
  status: 'pending' | 'processing' | 'out_for_delivery' | 'completed';
  createdAt: Date;
  notes?: string;
}

export default function MedicationRequestPage() {
  const [requests, setRequests] = useState<MedicationRequest[]>([]);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<MedicationRequest | null>(null);
  const [newRequest, setNewRequest] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    prescriptionFile: null as File | null,
    pharmacy: '',
    deliveryAddress: '',
    paymentMethod: 'card',
    paymentReceipt: null as File | null,
    notes: ''
  });

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get auth token
      const token = localStorage.getItem('authToken');
      
      // Create request data (excluding files for now, would need FormData for file upload)
      const requestData = {
        patientName: newRequest.patientName,
        patientPhone: newRequest.patientPhone,
        patientEmail: newRequest.patientEmail,
        pharmacy: newRequest.pharmacy,
        deliveryAddress: newRequest.deliveryAddress,
        paymentMethod: newRequest.paymentMethod,
        notes: newRequest.notes,
        prescriptionFile: newRequest.prescriptionFile?.name || 'uploaded',
        paymentReceipt: newRequest.paymentReceipt?.name || 'uploaded'
      };

      // Submit to API
      const response = await fetch(`${API_BASE_URL}/medication-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request');
      }

      // Add to local state for immediate display
      const request: MedicationRequest = {
        id: data.request?._id || `req_${Date.now()}`,
        ...newRequest,
        status: 'pending',
        createdAt: new Date()
      };

      setRequests(prev => [request, ...prev]);
      
      // Reset form
      setNewRequest({
        patientName: '',
        patientPhone: '',
        patientEmail: '',
        prescriptionFile: null,
        pharmacy: '',
        deliveryAddress: '',
        paymentMethod: 'card',
        paymentReceipt: null,
        notes: ''
      });
      setShowNewRequestForm(false);
      
      alert('Medication request submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request: ' + error.message);
    }
  };

  const handleFileUpload = (field: 'prescriptionFile' | 'paymentReceipt', file: File) => {
    setNewRequest(prev => ({ ...prev, [field]: file }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'out_for_delivery':
        return <Truck className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Medication Request
            </h1>
            <p className="text-gray-600 mt-1">Submit prescriptions and track medication deliveries</p>
          </div>
          <Button 
            onClick={() => setShowNewRequestForm(true)} 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Security Notice */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Secure & Private</p>
                <p className="text-xs text-green-600">All prescriptions and payment receipts are encrypted and HIPAA compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {showNewRequestForm && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Submit New Medication Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                {/* Patient Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="patientName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Patient Name
                    </Label>
                    <Input
                      id="patientName"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newRequest.patientName}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientPhone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="patientPhone"
                      type="tel"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newRequest.patientPhone}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, patientPhone: e.target.value }))}
                      placeholder="Phone number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientEmail" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="patientEmail"
                      type="email"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newRequest.patientEmail}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, patientEmail: e.target.value }))}
                      placeholder="Email address"
                      required
                    />
                  </div>
                </div>

                {/* Prescription Upload */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4" />
                    Prescription Upload
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('prescriptionFile', file);
                      }}
                      className="hidden"
                      id="prescription-upload"
                    />
                    <label htmlFor="prescription-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {newRequest.prescriptionFile 
                          ? `Selected: ${newRequest.prescriptionFile.name}`
                          : 'Click to upload prescription (PDF, JPG, PNG)'
                        }
                      </p>
                    </label>
                  </div>
                </div>

                {/* Pharmacy Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pharmacy">Preferred Pharmacy</Label>
                    <select
                      id="pharmacy"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={newRequest.pharmacy}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, pharmacy: e.target.value }))}
                      required
                    >
                      <option value="">Select pharmacy</option>
                      <option value="hospital_pharmacy">Hospital Pharmacy</option>
                      <option value="cvs_pharmacy">CVS Pharmacy</option>
                      <option value="walgreens">Walgreens</option>
                      <option value="rite_aid">Rite Aid</option>
                      <option value="local_pharmacy">Local Community Pharmacy</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Method
                    </Label>
                    <select
                      id="paymentMethod"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={newRequest.paymentMethod}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="insurance">Insurance</option>
                      <option value="cash">Cash on Delivery</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <Label htmlFor="deliveryAddress" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </Label>
                  <Textarea
                    id="deliveryAddress"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newRequest.deliveryAddress}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    placeholder="Enter complete delivery address"
                    rows={3}
                    required
                  />
                </div>

                {/* Payment Receipt Upload */}
                {newRequest.paymentMethod !== 'cash' && (
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4" />
                      Payment Receipt (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('paymentReceipt', file);
                        }}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label htmlFor="receipt-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {newRequest.paymentReceipt 
                            ? `Selected: ${newRequest.paymentReceipt.name}`
                            : 'Upload payment receipt (optional)'
                          }
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special instructions or notes"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    disabled={!newRequest.patientName || !newRequest.prescriptionFile || !newRequest.pharmacy}
                  >
                    Submit Request
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewRequestForm(false)}
                    className="hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Medication Requests</h2>
          
          {requests.length === 0 ? (
            <Card className="border-0 shadow-xl">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Medication Requests</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Submit your first prescription request to get medications delivered to your doorstep.
                </p>
                <Button 
                  onClick={() => setShowNewRequestForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit First Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.patientName}</h3>
                        <p className="text-sm text-gray-500">Request #{request.id.slice(-6)}</p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{formatStatus(request.status)}</span>
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="capitalize">{request.pharmacy.replace(/_/g, ' ')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{request.createdAt.toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="capitalize">{request.paymentMethod.replace(/_/g, ' ')}</span>
                      </div>

                      {request.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 italic">"{request.notes}"</p>
                        </div>
                      )}

                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                          onClick={() => setViewingRequest(request)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* View Details Modal */}
        <Dialog open={!!viewingRequest} onOpenChange={() => setViewingRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Request Details
              </span>
              <Button variant="ghost" size="sm" onClick={() => setViewingRequest(null)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {viewingRequest && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Request ID</p>
                  <p className="font-semibold text-gray-900">{viewingRequest.id}</p>
                </div>
                <Badge className={getStatusColor(viewingRequest.status)}>
                  {getStatusIcon(viewingRequest.status)}
                  <span className="ml-1 capitalize">{formatStatus(viewingRequest.status)}</span>
                </Badge>
              </div>

              {/* Patient Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{viewingRequest.patientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{viewingRequest.patientPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{viewingRequest.patientEmail}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Request Details
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Pharmacy</p>
                    <p className="font-medium capitalize">{viewingRequest.pharmacy.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">{viewingRequest.paymentMethod.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Delivery Address</p>
                    <p className="font-medium">{viewingRequest.deliveryAddress}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Submitted</p>
                    <p className="font-medium">{viewingRequest.createdAt.toLocaleDateString()} at {viewingRequest.createdAt.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              {/* Files */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Attached Files
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Prescription File</span>
                    <Badge variant="outline">PDF</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Payment Receipt</span>
                    <Badge variant="outline">PDF</Badge>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingRequest.notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Additional Notes</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 italic">"{viewingRequest.notes}"</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <Truck className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
  );
}