import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Brain, 
  Dumbbell, 
  Apple, 
  Moon, 
  Play, 
  Clock,
  Star,
  CheckCircle,
  Target,
  Award,
  Flower2,
  BookOpen,
  Users
} from 'lucide-react';
import VideoModal from '@/components/VideoModal';
import { useSubscription } from '@/hooks/useSubscription';

export default function WellnessGuide() {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  
  // Check if user should see ads (free tier users see ads, premium users don't)
  const shouldShowAds = () => {
    return !subscription || subscription.tier === 'free' || subscription.status !== 'active';
  };
  const [selectedCategory, setSelectedCategory] = useState('fitness');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const categories = [
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'bg-red-500' },
    { id: 'yoga', label: 'Yoga', icon: Flower2, color: 'bg-purple-500' },
    { id: 'nutrition', label: 'Nutrition', icon: Apple, color: 'bg-green-500' },
    { id: 'mental', label: 'Mental Health', icon: Brain, color: 'bg-blue-500' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'bg-indigo-500' },
  ];

  const wellnessContent = {
    fitness: {
      videos: [
        {
          id: 1,
          title: 'Complete Home Workout Routine',
          duration: '45:00',
          difficulty: 'Beginner',
          calories: '300-400',
          url: 'https://youtu.be/AdqrTg_hpEQ?si=GVyRLIEu7H7xFA-Q',
          thumbnail: '/images/StockCake-home_exercise_for_health_management_Images_and_Photos_1762335939.jpg',
          description: 'Complete home workout routine for all fitness levels',
          instructor: 'Home Fitness Coach',
          equipment: 'None required'
        },
        {
          id: 2,
          title: 'Full Body Strength Training',
          duration: '30:00',
          difficulty: 'Intermediate',
          calories: '250-350',
          url: 'https://youtu.be/UNA_1DXsLmg?si=mABBfdodZCz3kZON',
          thumbnail: '/images/StockCake-home_exercise_for_health_management_Images_and_Photos_1762335939.jpg',
          description: 'Comprehensive strength training workout for muscle building',
          instructor: 'Strength Coach Pro',
          equipment: 'None required'
        }
      ],
      tips: [
        'Start with 10-15 minutes of exercise daily',
        'Focus on proper form over speed',
        'Stay hydrated during workouts',
        'Allow rest days for muscle recovery'
      ],
      challenges: [
        { name: '30-Day Plank Challenge', progress: 65, target: 30 },
        { name: 'Weekly Step Goal', progress: 8500, target: 10000 },
        { name: 'Strength Training Streak', progress: 5, target: 7 }
      ]
    },
    yoga: {
      videos: [
        {
          id: 3,
          title: 'Evening Relaxation Yoga & Meditation',
          duration: '30:00',
          difficulty: 'Beginner',
          calories: '100-150',
          url: 'https://youtu.be/24qDdn2QXjk?si=-3fM5v2MoffGxcxT',
          thumbnail: '/images/StockCake-home_exercise_for_health_management_Images_and_Photos_1762335939.jpg',
          description: 'Calming evening yoga practice with meditation for deep relaxation',
          instructor: 'Mindful Yogi',
          equipment: 'Yoga mat, bolster (optional)'
        },
        {
          id: 4,
          title: 'Energizing Morning Yoga Flow',
          duration: '25:00',
          difficulty: 'Beginner',
          calories: '80-120',
          url: 'https://youtu.be/NU4w3Bfg1nI?si=VDt-HXNAerHpe66L',
          thumbnail: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=225&fit=crop',
          description: 'Energizing morning yoga sequence to start your day with vitality',
          instructor: 'Maya Wellness',
          equipment: 'Yoga mat'
        }
      ],
      tips: [
        'Focus on your breath throughout the practice',
        'Listen to your body and modify poses as needed',
        'Practice consistently, even if just for 10 minutes',
        'Create a peaceful environment for your practice'
      ],
      challenges: [
        { name: 'Daily Yoga Practice', progress: 18, target: 30 },
        { name: 'Morning Sun Salutations', progress: 12, target: 21 },
        { name: 'Flexibility Progress', progress: 7, target: 10 }
      ]
    },
    nutrition: {
      videos: [
        {
          id: 5,
          title: 'Quick Healthy Nutrition Tips',
          duration: '1:00',
          difficulty: 'Beginner',
          url: 'https://youtube.com/shorts/xTNtREalaKE?si=791a8i69Gc_C542z',
          thumbnail: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=225&fit=crop',
          description: 'Essential nutrition tips for better health in just 60 seconds',
          instructor: 'Nutrition Expert',
          equipment: 'None required'
        },
        {
          id: 6,
          title: 'Complete Nutrition Guide for Health',
          duration: '15:00',
          difficulty: 'Beginner',
          url: 'https://youtu.be/huzh8ODNxaA?si=oViAK96gWsvn8SZT',
          thumbnail: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=225&fit=crop',
          description: 'Comprehensive guide to nutrition for optimal health and wellness',
          instructor: 'Dr. Health Expert',
          equipment: 'None required'
        }
      ],
      articles: [
        {
          id: 'n1',
          title: 'Managing Blood Pressure Through Diet',
          readTime: '7 min read',
          category: 'Heart Health',
          thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=225&fit=crop',
          excerpt: 'Evidence-based dietary strategies to naturally lower and manage blood pressure',
          content: `
# Managing Blood Pressure Through Diet

## Understanding Blood Pressure
Blood pressure is the force of blood against artery walls. High blood pressure (hypertension) affects 1 in 3 adults and significantly increases risk of heart disease, stroke, and kidney problems.

## The DASH Diet Approach

### What is DASH?
**Dietary Approaches to Stop Hypertension (DASH)** is scientifically proven to lower blood pressure in just 2 weeks.

### Core Principles:
- **High in:** Fruits, vegetables, whole grains, lean proteins
- **Moderate in:** Low-fat dairy, nuts, seeds
- **Low in:** Sodium, saturated fats, added sugars

## Foods That Lower Blood Pressure

### 1. Potassium-Rich Foods
**Why:** Helps balance sodium and relaxes blood vessel walls
- **Bananas:** 420mg potassium per medium banana
- **Sweet potatoes:** 540mg per medium potato
- **Spinach:** 840mg per cup cooked
- **Avocados:** 975mg per cup
- **White beans:** 1,189mg per cup

### 2. Magnesium Sources
**Why:** Helps blood vessels relax and improves blood flow
- **Dark chocolate:** 70%+ cacao
- **Almonds and cashews**
- **Black beans and lentils**
- **Quinoa and brown rice**

### 3. Nitrate-Rich Vegetables
**Why:** Convert to nitric oxide, which dilates blood vessels
- **Beets:** Drink beet juice or eat roasted beets
- **Leafy greens:** Arugula, spinach, kale
- **Celery:** Contains phthalides that relax arteries

### 4. Omega-3 Fatty Acids
**Why:** Reduce inflammation and improve heart health
- **Fatty fish:** Salmon, mackerel, sardines (2-3x/week)
- **Walnuts:** 1 ounce daily
- **Flaxseeds:** 1-2 tablespoons ground daily
- **Chia seeds:** 1 tablespoon daily

## Foods to Limit or Avoid

### High-Sodium Foods
**Target:** Less than 2,300mg daily (ideally 1,500mg)
- Processed meats (bacon, deli meat, sausage)
- Canned soups and broths
- Frozen meals and pizza
- Restaurant and fast food
- Pickled foods and condiments

### Saturated and Trans Fats
- Fried foods and fast food
- Full-fat dairy products
- Fatty cuts of meat
- Butter and margarine
- Baked goods and pastries

## Sample DASH Meal Plan

### Breakfast
- 1 cup oatmeal with berries and walnuts
- 1 cup low-fat milk
- 1 medium banana

### Lunch
- Grilled chicken salad with mixed greens
- 2 tbsp olive oil vinaigrette
- 1 whole grain roll
- 1 cup fresh fruit

### Dinner
- 4 oz baked salmon
- 1 cup roasted sweet potato
- 1 cup steamed broccoli
- 1 tsp olive oil

### Snacks
- 1 oz unsalted almonds
- 1 cup low-fat yogurt with berries

## Lifestyle Tips for Blood Pressure

### Meal Preparation
- **Cook at home** more often to control sodium
- **Read labels** - choose items with <140mg sodium per serving
- **Use herbs and spices** instead of salt for flavor
- **Rinse canned beans** and vegetables to reduce sodium

### Portion Control
- **Use smaller plates** to naturally reduce portions
- **Fill half your plate** with vegetables and fruits
- **Limit alcohol** to 1 drink/day for women, 2 for men
- **Stay hydrated** with water instead of sugary drinks

## Expected Results
- **Week 1-2:** May see 5-10 mmHg reduction
- **Month 1:** Up to 11 mmHg systolic reduction
- **Long-term:** Sustained improvements with consistent adherence

## When to Seek Medical Help
- Blood pressure consistently above 140/90
- Symptoms like severe headaches, chest pain, or shortness of breath
- Difficulty managing BP with lifestyle changes alone
- Need for medication adjustment

**Remember:** Always work with your healthcare provider when managing blood pressure. These dietary changes complement but don't replace medical treatment.
          `
        },
        {
          id: 'n2',
          title: 'Blood Sugar Control Through Nutrition',
          readTime: '8 min read',
          category: 'Diabetes Management',
          thumbnail: '/images/StockCake-health_management_Collections_1765361049.jpg',
          excerpt: 'Comprehensive guide to managing blood glucose levels through strategic eating',
          content: `
# Blood Sugar Control Through Nutrition

## Understanding Blood Sugar
Blood glucose (sugar) is your body's main energy source. Maintaining stable levels prevents diabetes complications and improves energy, mood, and overall health.

## Target Blood Sugar Levels
- **Fasting:** 80-130 mg/dL
- **2 hours after meals:** Less than 180 mg/dL
- **HbA1c:** Less than 7% (for most adults with diabetes)

## The Glycemic Index Approach

### Low Glycemic Foods (GI < 55)
**Best choices for stable blood sugar:**
- **Vegetables:** Broccoli, spinach, tomatoes, peppers
- **Fruits:** Berries, apples, pears, citrus fruits
- **Grains:** Steel-cut oats, quinoa, barley
- **Legumes:** Lentils, chickpeas, black beans
- **Proteins:** Fish, chicken, eggs, tofu

### Medium Glycemic Foods (GI 55-70)
**Eat in moderation:**
- Sweet potatoes
- Brown rice
- Whole grain bread
- Bananas (ripe)

### High Glycemic Foods (GI > 70)
**Limit or avoid:**
- White bread and rice
- Sugary drinks and candy
- Processed cereals
- Potatoes (russet)
- Watermelon

## Macronutrient Balance for Blood Sugar

### Carbohydrates (45-65% of calories)
**Focus on quality:**
- **Fiber-rich sources:** Aim for 25-35g daily
- **Whole grains** over refined grains
- **Non-starchy vegetables** as primary carb source
- **Portion control:** Use plate method (1/4 plate carbs)

### Protein (15-20% of calories)
**Benefits:** Slows digestion, increases satiety, minimal blood sugar impact
- **Lean sources:** Fish, poultry, eggs, legumes
- **Plant proteins:** Tofu, tempeh, nuts, seeds
- **Target:** 20-30g per meal

### Healthy Fats (20-35% of calories)
**Choose wisely:** Fats slow carb absorption
- **Monounsaturated:** Olive oil, avocados, nuts
- **Omega-3s:** Fatty fish, walnuts, flaxseeds
- **Limit saturated fats:** <10% of calories

## Blood Sugar Stabilizing Foods

### Cinnamon
**Benefits:** May improve insulin sensitivity
- **Amount:** 1-2 teaspoons daily
- **Use:** In oatmeal, yogurt, or tea

### Apple Cider Vinegar
**Benefits:** May reduce post-meal blood sugar spikes
- **Amount:** 1-2 tablespoons before meals
- **Dilute:** In water to protect tooth enamel

### Chromium-Rich Foods
**Benefits:** Enhances insulin action
- **Sources:** Broccoli, whole grains, nuts, meat

### Fiber Powerhouses
**Benefits:** Slows glucose absorption
- **Soluble fiber:** Oats, beans, apples, carrots
- **Insoluble fiber:** Whole grains, vegetables, nuts

## Meal Timing Strategies

### The Plate Method
**Visual guide for balanced meals:**
- **1/2 plate:** Non-starchy vegetables
- **1/4 plate:** Lean protein
- **1/4 plate:** Whole grain carbohydrates
- **Add:** Small amount of healthy fat

### Consistent Meal Timing
- **Eat every 3-4 hours** to prevent blood sugar swings
- **Don't skip meals** - leads to overeating later
- **Smaller, frequent meals** vs. 3 large meals

### Pre and Post-Meal Tips
**Before eating:**
- Drink water to aid digestion
- Take a short walk if possible

**After eating:**
- Take a 10-15 minute walk
- Avoid lying down immediately

## Sample Blood Sugar-Friendly Meals

### Breakfast
- 2 eggs scrambled with spinach
- 1 slice whole grain toast
- 1/2 avocado
- 1 cup berries

### Lunch
- Grilled chicken salad with mixed greens
- 1/2 cup quinoa
- Olive oil and lemon dressing
- 1 small apple

### Dinner
- 4 oz baked salmon
- Roasted Brussels sprouts
- 1/2 cup brown rice
- Side salad with vinaigrette

### Snacks (if needed)
- 1 oz almonds with 1 small apple
- Greek yogurt with berries
- Hummus with vegetable sticks

## Foods That Spike Blood Sugar

### Avoid or Limit:
- **Refined sugars:** Candy, cookies, cakes
- **Sugary beverages:** Soda, fruit juice, energy drinks
- **White starches:** White bread, rice, pasta
- **Processed foods:** Chips, crackers, fast food
- **High-sugar fruits:** Dates, raisins, fruit cocktail

## Monitoring and Tracking

### Blood Glucose Testing
- **Check before meals** and 2 hours after
- **Keep a food log** to identify trigger foods
- **Note patterns** - what foods cause spikes?

### HbA1c Testing
- **Every 3 months** for diabetes management
- **Reflects average** blood sugar over 2-3 months
- **Goal:** <7% for most adults

## Emergency Situations

### Low Blood Sugar (Hypoglycemia)
**Symptoms:** Shakiness, sweating, confusion, rapid heartbeat
**Treatment:** 15g fast-acting carbs (glucose tablets, juice)
**Follow up:** Recheck in 15 minutes

### High Blood Sugar (Hyperglycemia)
**Symptoms:** Excessive thirst, frequent urination, fatigue
**Action:** Check ketones, contact healthcare provider
**Prevention:** Stick to meal plan, take medications as prescribed

## Long-Term Benefits
- **Reduced diabetes complications**
- **Better energy levels**
- **Improved mood and mental clarity**
- **Weight management**
- **Lower cardiovascular risk**

**Important:** Work with a registered dietitian and your healthcare team to create a personalized plan that fits your lifestyle, preferences, and medical needs.
          `
        }
      ],
      tips: [
        'Monitor blood sugar levels regularly if diabetic',
        'Choose whole grains over refined carbohydrates',
        'Limit sodium to less than 2,300mg daily',
        'Include potassium-rich foods in every meal'
      ],
      challenges: [
        { name: 'Daily Vegetable Servings', progress: 4, target: 5 },
        { name: 'Sodium Reduction Goal', progress: 1800, target: 1500 },
        { name: 'Blood Pressure Tracking', progress: 5, target: 7 }
      ]
    },
    mental: {
      videos: [
        {
          id: 7,
          title: 'Mental Health & Wellness Guide',
          duration: '20:00',
          difficulty: 'Beginner',
          url: 'https://youtu.be/uTN29kj7e-w?si=-NWfXFX3WE2dFYHH',
          thumbnail: '/images/StockCake-health_management_Collections_1765361049.jpg',
          description: 'Comprehensive guide to mental health and wellness strategies',
          instructor: 'Dr. Mental Health Expert',
          equipment: 'Quiet space'
        }
      ],
      tips: [
        'Practice deep breathing exercises daily',
        'Take regular breaks from screens',
        'Connect with friends and family',
        'Engage in activities you enjoy'
      ],
      challenges: [
        { name: 'Daily Meditation', progress: 12, target: 21 },
        { name: 'Gratitude Journal', progress: 5, target: 7 },
        { name: 'Stress-Free Hours', progress: 3, target: 5 }
      ]
    },
    sleep: {
      videos: [],
      sleepPlans: [
        {
          id: 's1',
          title: 'Sleep Plan for Insomnia',
          condition: 'Insomnia',
          duration: '4-6 weeks',
          thumbnail: '/images/StockCake-health_management_Collections_1765361049.jpg',
          excerpt: 'Comprehensive plan to overcome chronic insomnia and restore healthy sleep patterns',
          plan: `
# Sleep Plan for Insomnia

## Understanding Insomnia
Insomnia affects 30% of adults and can significantly impact daily functioning. This plan uses evidence-based techniques to help restore healthy sleep patterns.

## Phase 1: Sleep Foundation (Week 1-2)

### Sleep Hygiene Basics
- **Consistent Schedule:** Go to bed and wake up at the same time daily
- **Bedroom Environment:** Keep room cool (65-68°F), dark, and quiet
- **Comfortable Bedding:** Invest in quality mattress and pillows
- **No Electronics:** Remove TVs, phones, tablets from bedroom

### Pre-Sleep Routine (Start 1 hour before bed)
1. **9:00 PM:** Dim lights throughout house
2. **9:15 PM:** Light stretching or gentle yoga
3. **9:30 PM:** Warm bath or shower
4. **9:45 PM:** Reading or meditation
5. **10:00 PM:** Lights out

## Phase 2: Sleep Restriction (Week 3-4)

### Sleep Window Technique
- **Calculate:** Track your actual sleep time for 1 week
- **Restrict:** Limit time in bed to actual sleep time + 30 minutes
- **Example:** If you sleep 6 hours, stay in bed only 6.5 hours
- **Gradually Increase:** Add 15 minutes weekly as sleep efficiency improves

### Sleep Efficiency Formula
Sleep Efficiency = (Total Sleep Time ÷ Time in Bed) × 100
**Goal:** Achieve 85% or higher efficiency

## Phase 3: Cognitive Techniques (Week 5-6)

### Worry Time
- **Schedule:** 15 minutes daily (not before bed)
- **Write:** List concerns and potential solutions
- **Redirect:** If worries arise at bedtime, remind yourself of scheduled worry time

### Progressive Muscle Relaxation
1. **Tense:** Each muscle group for 5 seconds
2. **Release:** Notice the contrast and relaxation
3. **Progress:** Start with toes, work up to head
4. **Practice:** 10-15 minutes nightly

## Dietary Considerations

### Sleep-Promoting Foods
- **Tart cherries:** Natural melatonin source
- **Almonds:** Rich in magnesium
- **Turkey:** Contains tryptophan
- **Chamomile tea:** Natural relaxant

### Foods to Avoid
- **Caffeine:** None after 2 PM
- **Alcohol:** Avoid 3 hours before bed
- **Large meals:** Finish eating 3 hours before sleep
- **Spicy foods:** Can cause discomfort

## Exercise Guidelines
- **Morning sunlight:** 15-30 minutes daily
- **Regular exercise:** 30 minutes, 4-6 hours before bed
- **Avoid:** Vigorous activity 3 hours before sleep

## When to Seek Help
Contact a healthcare provider if:
- No improvement after 6 weeks
- Symptoms worsen
- Daytime functioning severely impacted
- Signs of sleep apnea (snoring, gasping)

## Success Tracking
**Week 1-2:** Focus on consistency
**Week 3-4:** Monitor sleep efficiency
**Week 5-6:** Track mood and energy improvements

Remember: Sleep improvement takes time. Be patient and consistent with your new habits.
          `
        },
        {
          id: 's2',
          title: 'Sleep Plan for Sleep Apnea',
          condition: 'Sleep Apnea',
          duration: 'Ongoing management',
          thumbnail: '/images/StockCake-health_management_Collections_1765361049.jpg',
          excerpt: 'Management strategies for better sleep quality with sleep apnea',
          plan: `
# Sleep Plan for Sleep Apnea Management

## Understanding Sleep Apnea
Sleep apnea causes breathing interruptions during sleep, leading to poor sleep quality and health complications. This plan complements medical treatment.

## Medical Management (Essential First Step)

### CPAP Therapy
- **Consistent Use:** Wear device every night, even for naps
- **Proper Fit:** Ensure mask seals without being too tight
- **Maintenance:** Clean equipment daily, replace parts as recommended
- **Adjustment Period:** Allow 2-4 weeks to adapt to therapy

### Alternative Treatments
- **Oral Appliances:** For mild to moderate cases
- **Surgery:** For specific anatomical issues
- **Positional Therapy:** For position-dependent apnea

## Lifestyle Modifications

### Weight Management
- **Target:** Lose 10% of body weight if overweight
- **Diet:** Focus on whole foods, limit processed foods
- **Exercise:** 150 minutes moderate activity weekly
- **Professional Help:** Consider nutritionist or trainer

### Sleep Position
- **Side Sleeping:** Reduces airway collapse
- **Elevate Head:** Raise bed head 4-6 inches
- **Tennis Ball Technique:** Sew ball to back of pajamas to prevent back sleeping
- **Wedge Pillow:** Maintains proper positioning

## Environmental Optimization

### Bedroom Setup
- **Humidity:** Maintain 40-60% humidity
- **Air Quality:** Use air purifier, keep room dust-free
- **Temperature:** Cool environment (65-68°F)
- **Allergen Control:** Hypoallergenic bedding, regular cleaning

### Pre-Sleep Routine
- **Nasal Breathing:** Use saline rinse or strips if congested
- **Relaxation:** Gentle stretching or meditation
- **Avoid Sedatives:** Alcohol and sleep medications worsen apnea
- **Timing:** Consistent bedtime routine

## Dietary Considerations

### Foods That Help
- **Anti-inflammatory:** Fatty fish, berries, leafy greens
- **Magnesium-rich:** Nuts, seeds, dark chocolate
- **Hydrating:** Adequate water intake during day
- **Light dinner:** Finish eating 3 hours before bed

### Foods to Avoid
- **Inflammatory foods:** Processed meats, refined sugars
- **Dairy before bed:** May increase mucus production
- **Large meals:** Can worsen breathing difficulties
- **Alcohol:** Relaxes throat muscles, worsens apnea

## Exercise Program

### Cardiovascular Exercise
- **Walking:** 30 minutes daily
- **Swimming:** Excellent for respiratory fitness
- **Cycling:** Low-impact cardio option
- **Gradual increase:** Start slowly, build endurance

### Breathing Exercises
- **Diaphragmatic breathing:** 10 minutes twice daily
- **Pursed lip breathing:** Improves oxygen exchange
- **Throat exercises:** Strengthen airway muscles
- **Yoga:** Combines breathing and gentle movement

## Monitoring and Tracking

### Sleep Quality Indicators
- **Energy levels:** Rate 1-10 daily
- **Morning headaches:** Track frequency
- **Daytime sleepiness:** Use Epworth Sleepiness Scale
- **CPAP compliance:** Aim for 4+ hours nightly

### Regular Check-ups
- **Sleep study:** Repeat annually or as recommended
- **CPAP data review:** Monthly with sleep technician
- **Weight monitoring:** Weekly weigh-ins
- **Blood pressure:** Regular monitoring

## Warning Signs to Report
- **Worsening symptoms:** Despite treatment compliance
- **Equipment problems:** Mask leaks, pressure issues
- **New symptoms:** Chest pain, irregular heartbeat
- **Medication interactions:** Always inform doctors about sleep apnea

## Long-term Success Strategies
1. **Education:** Learn about your condition
2. **Support groups:** Connect with others who have sleep apnea
3. **Technology:** Use apps to track sleep and CPAP compliance
4. **Patience:** Improvement takes time and consistency

Remember: Sleep apnea is a serious medical condition requiring ongoing management. Work closely with your healthcare team for optimal results.
          `
        }
      ],
      tips: [
        'Maintain a consistent sleep schedule',
        'Create a relaxing bedtime routine',
        'Avoid caffeine 6 hours before bed',
        'Keep your bedroom cool and dark'
      ],
      challenges: [
        { name: 'Consistent Bedtime', progress: 5, target: 7 },
        { name: 'Screen-Free Hour', progress: 4, target: 7 },
        { name: 'Sleep Quality Score', progress: 7.5, target: 8.5 }
      ]
    }
  };

  const handleVideoPlay = (video: any) => {
    if (subscription?.plan !== 'premium' && shouldShowAds()) {
      alert('Upgrade to Premium to access all wellness videos and remove ads!');
      return;
    }
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handleArticleRead = (article: any) => {
    setSelectedArticle(article);
  };

  const currentContent = wellnessContent[selectedCategory as keyof typeof wellnessContent];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Wellness Guide</h2>
          <p className="text-gray-600 mt-1">Your personalized health and wellness companion</p>
        </div>
        {subscription?.plan === 'premium' && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Award className="w-4 h-4 mr-1" />
            Premium Access
          </Badge>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center space-x-2"
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            {/* Videos Section - Only show if videos exist */}
            {currentContent.videos && currentContent.videos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>Featured Videos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentContent.videos.map((video) => (
                      <div key={video.id} className="group cursor-pointer" onClick={() => handleVideoPlay(video)}>
                        <div className="relative overflow-hidden rounded-lg">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Play className="w-6 h-6 text-gray-900 ml-1" />
                            </div>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-black/70 text-white">
                              <Clock className="w-3 h-3 mr-1" />
                              {video.duration}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>By {video.instructor}</span>
                            <span>•</span>
                            <span>{video.difficulty}</span>
                            {video.calories && (
                              <>
                                <span>•</span>
                                <span>{video.calories} cal</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Articles Section (for Nutrition) */}
            {currentContent.articles && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Health Management Articles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentContent.articles.map((article) => (
                      <div key={article.id} className="group cursor-pointer" onClick={() => handleArticleRead(article)}>
                        <div className="relative overflow-hidden rounded-lg">
                          <img 
                            src={article.thumbnail} 
                            alt={article.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-black/70 text-white">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {article.readTime}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{article.excerpt}</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sleep Plans Section (for Sleep) */}
            {currentContent.sleepPlans && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Condition-Specific Sleep Plans</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentContent.sleepPlans.map((plan) => (
                      <div key={plan.id} className="group cursor-pointer" onClick={() => handleArticleRead(plan)}>
                        <div className="relative overflow-hidden rounded-lg">
                          <img 
                            src={plan.thumbnail} 
                            alt={plan.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-black/70 text-white">
                              <Users className="w-3 h-3 mr-1" />
                              {plan.duration}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {plan.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{plan.excerpt}</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {plan.condition}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips and Challenges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>Expert Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentContent.tips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span>Active Challenges</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentContent.challenges.map((challenge, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{challenge.name}</span>
                          <span className="text-xs text-gray-500">
                            {challenge.progress}/{challenge.target}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Premium Upgrade Banner */}
      {shouldShowAds() && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Unlock Premium Wellness Content</h3>
                <p className="text-purple-100">
                  Get access to exclusive videos, personalized plans, and ad-free experience
                </p>
              </div>
              <Button 
                variant="secondary" 
                className="bg-white text-purple-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/subscription')}
              >
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Modal */}
      <VideoModal 
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        video={selectedVideo}
      />

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedArticle.title}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedArticle(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="prose max-w-none">
                {selectedArticle.content ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, '<h3>').replace(/<h3>/g, '</p><h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: selectedArticle.plan.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, '<h3>').replace(/<h3>/g, '</p><h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}