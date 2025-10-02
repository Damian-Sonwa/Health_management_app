import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  FileText, 
  Award, 
  Clock, 
  Star, 
  X,
  Heart,
  Activity,
  Droplets,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Target
} from 'lucide-react';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const bloodPressureContent = {
  overview: {
    title: "Understanding Blood Pressure",
    description: "Blood pressure is the force of blood pushing against your artery walls. Learning to manage it is crucial for your heart health.",
    normalRange: "Less than 120/80 mmHg",
    highRange: "140/90 mmHg or higher",
    riskFactors: [
      "Age (risk increases with age)",
      "Family history of high blood pressure",
      "Being overweight or obese",
      "Lack of physical activity",
      "Too much salt in diet",
      "Smoking and alcohol use",
      "Stress and poor sleep"
    ]
  },
  management: {
    lifestyle: [
      "Eat a heart-healthy diet (DASH diet)",
      "Reduce sodium intake to less than 2,300mg daily",
      "Exercise regularly (150 minutes moderate activity/week)",
      "Maintain a healthy weight",
      "Limit alcohol consumption",
      "Quit smoking",
      "Manage stress through relaxation techniques",
      "Get 7-9 hours of quality sleep"
    ],
    monitoring: [
      "Check blood pressure regularly at home",
      "Keep a blood pressure log",
      "Take medications as prescribed",
      "Don't skip doctor appointments",
      "Know your target blood pressure goals"
    ]
  }
};

const glucoseContent = {
  overview: {
    title: "Managing Blood Glucose",
    description: "Blood glucose (sugar) levels indicate how well your body processes sugar. Proper management prevents serious complications.",
    normalRange: "70-100 mg/dL (fasting)",
    highRange: "126 mg/dL or higher (fasting)",
    complications: [
      "Heart disease and stroke",
      "Kidney damage (nephropathy)",
      "Eye damage (retinopathy)",
      "Nerve damage (neuropathy)",
      "Poor wound healing",
      "Increased infection risk"
    ]
  },
  management: {
    diet: [
      "Follow a consistent meal schedule",
      "Choose complex carbohydrates over simple sugars",
      "Control portion sizes",
      "Include fiber-rich foods",
      "Limit processed and sugary foods",
      "Stay hydrated with water",
      "Count carbohydrates if recommended"
    ],
    lifestyle: [
      "Exercise regularly to improve insulin sensitivity",
      "Monitor blood sugar as directed",
      "Take medications exactly as prescribed",
      "Manage stress levels",
      "Get adequate sleep",
      "Maintain a healthy weight",
      "Don't skip meals"
    ]
  }
};

const emergencyInfo = [
  {
    condition: "Blood Pressure Crisis",
    symptoms: ["Severe headache", "Chest pain", "Difficulty breathing", "Vision changes", "Nausea/vomiting"],
    action: "Call 911 immediately if BP > 180/120 with symptoms",
    color: "text-red-600 bg-red-50 border-red-200"
  },
  {
    condition: "Severe Hypoglycemia",
    symptoms: ["Confusion", "Seizures", "Loss of consciousness", "Inability to swallow"],
    action: "Call 911 immediately - Do not give food/drink if unconscious",
    color: "text-orange-600 bg-orange-50 border-orange-200"
  },
  {
    condition: "Severe Hyperglycemia",
    symptoms: ["Extreme thirst", "Frequent urination", "Nausea", "Fruity breath odor", "Confusion"],
    action: "Seek immediate medical attention if glucose > 400 mg/dL",
    color: "text-purple-600 bg-purple-50 border-purple-200"
  }
];

export default function EducationModal({ isOpen, onClose }: EducationModalProps) {
  const [activeTab, setActiveTab] = useState('blood-pressure');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-green-500" />
              Patient Health Education
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Learning Progress Overview */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold text-red-600">Blood Pressure</div>
                  <div className="text-sm text-red-600">Heart Health Management</div>
                </div>
                <div className="text-center">
                  <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-blue-600">Blood Glucose</div>
                  <div className="text-sm text-blue-600">Diabetes Management</div>
                </div>
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-orange-600">Emergency Info</div>
                  <div className="text-sm text-orange-600">When to Seek Help</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="blood-pressure" className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Blood Pressure</span>
              </TabsTrigger>
              <TabsTrigger value="blood-glucose" className="flex items-center space-x-2">
                <Droplets className="w-4 h-4" />
                <span>Blood Glucose</span>
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency Info</span>
              </TabsTrigger>
            </TabsList>

            {/* Blood Pressure Tab */}
            <TabsContent value="blood-pressure" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    {bloodPressureContent.overview.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{bloodPressureContent.overview.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Normal Blood Pressure</h4>
                      <p className="text-2xl font-bold text-green-600">{bloodPressureContent.overview.normalRange}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">High Blood Pressure</h4>
                      <p className="text-2xl font-bold text-red-600">{bloodPressureContent.overview.highRange}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Risk Factors:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {bloodPressureContent.overview.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                      Lifestyle Management
                    </h4>
                    <div className="space-y-3">
                      {bloodPressureContent.management.lifestyle.map((tip, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-purple-500" />
                      Monitoring & Care
                    </h4>
                    <div className="space-y-3">
                      {bloodPressureContent.management.monitoring.map((tip, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Blood Glucose Tab */}
            <TabsContent value="blood-glucose" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Droplets className="w-5 h-5 mr-2 text-blue-500" />
                    {glucoseContent.overview.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{glucoseContent.overview.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Normal Glucose (Fasting)</h4>
                      <p className="text-2xl font-bold text-green-600">{glucoseContent.overview.normalRange}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">High Glucose (Fasting)</h4>
                      <p className="text-2xl font-bold text-red-600">{glucoseContent.overview.highRange}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Potential Complications:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {glucoseContent.overview.complications.map((complication, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                          {complication}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-green-500" />
                      Diet Management
                    </h4>
                    <div className="space-y-3">
                      {glucoseContent.management.diet.map((tip, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-blue-500" />
                      Lifestyle & Monitoring
                    </h4>
                    <div className="space-y-3">
                      {glucoseContent.management.lifestyle.map((tip, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Emergency Info Tab */}
            <TabsContent value="emergency" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {emergencyInfo.map((emergency, index) => (
                  <Card key={index} className={`border-2 ${emergency.color}`}>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        {emergency.condition}
                      </h3>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Warning Symptoms:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {emergency.symptoms.map((symptom, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              {symptom}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg border-2 border-red-200">
                        <h4 className="font-semibold text-red-800 mb-2">IMMEDIATE ACTION REQUIRED:</h4>
                        <p className="text-red-700 font-medium">{emergency.action}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Emergency Contacts</h3>
                  <div className="space-y-2 text-blue-700">
                    <p><strong>Emergency Services:</strong> 911</p>
                    <p><strong>Your Doctor:</strong> Keep this number easily accessible</p>
                    <p><strong>Pharmacy:</strong> For medication questions</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}