import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Coffee, Sun, Moon, Apple, Lightbulb } from 'lucide-react';
import { MealPlan } from '@/lib/healthData';

interface MealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mealPlan: MealPlan;
}

export default function MealPlanModal({ isOpen, onClose, title, mealPlan }: MealPlanModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800">{title}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Meal Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Breakfast */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-orange-800">
                  <Coffee className="w-5 h-5 mr-2" />
                  Breakfast Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mealPlan.breakfast.map((item, index) => (
                  <div key={index} className="flex items-center p-2 bg-white rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Lunch */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-yellow-800">
                  <Sun className="w-5 h-5 mr-2" />
                  Lunch Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mealPlan.lunch.map((item, index) => (
                  <div key={index} className="flex items-center p-2 bg-white rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dinner */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-blue-800">
                  <Moon className="w-5 h-5 mr-2" />
                  Dinner Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mealPlan.dinner.map((item, index) => (
                  <div key={index} className="flex items-center p-2 bg-white rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Snacks */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-green-800">
                  <Apple className="w-5 h-5 mr-2" />
                  Healthy Snacks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mealPlan.snacks.map((item, index) => (
                  <div key={index} className="flex items-center p-2 bg-white rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Nutrition Tips */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-purple-800">
                <Lightbulb className="w-5 h-5 mr-2" />
                Nutrition Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mealPlan.tips.map((tip, index) => (
                  <div key={index} className="flex items-start p-3 bg-white rounded-lg">
                    <Badge className="bg-purple-100 text-purple-800 mr-3 mt-0.5">
                      {index + 1}
                    </Badge>
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
              Save Meal Plan
            </Button>
            <Button variant="outline">
              Download PDF
            </Button>
            <Button variant="outline">
              Share with Nutritionist
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}