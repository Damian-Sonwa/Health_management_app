import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Clock, 
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  BookMarked,
  TrendingUp,
  Target,
  Heart,
  Activity,
  Apple,
  Brain,
  Shield
} from 'lucide-react';

interface ContentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
}

// Comprehensive educational content with explanatory images
const educationalContentData: Record<string, any> = {
  '1': {
    title: 'Understanding Blood Pressure',
    fullContent: {
      introduction: `Blood pressure is one of the most important vital signs that reflects your cardiovascular health. It measures the force your heart exerts when pumping blood through your arteries. Understanding your blood pressure readings and maintaining them within a healthy range is crucial for preventing serious health complications.`,
      
      sections: [
        {
          heading: 'What is Blood Pressure?',
          icon: <Heart className="w-5 h-5 text-red-500" />,
          content: `Blood pressure consists of two measurements:
          
• **Systolic Pressure (Top Number)**: The pressure in your arteries when your heart beats and pumps blood.
• **Diastolic Pressure (Bottom Number)**: The pressure in your arteries when your heart rests between beats.

A normal blood pressure reading is less than 120/80 mmHg. Higher readings can indicate various stages of hypertension (high blood pressure).`,
          image: '/images/bp-machine.jpg',
          imageCaption: 'Digital blood pressure monitor - An essential tool for home monitoring'
        },
        {
          heading: 'Blood Pressure Categories',
          icon: <Target className="w-5 h-5 text-blue-500" />,
          content: `Understanding where your readings fall:

**Normal**: Less than 120/80 mmHg
- Ideal range for optimal heart health
- Maintain through healthy lifestyle

**Elevated**: 120-129/<80 mmHg
- Warning sign
- Time to adopt healthier habits

**Stage 1 Hypertension**: 130-139/80-89 mmHg
- Medical attention recommended
- Lifestyle changes and possible medication

**Stage 2 Hypertension**: 140/90 mmHg or higher
- Requires medical treatment
- Combination of medications and lifestyle changes

**Hypertensive Crisis**: Higher than 180/120 mmHg
- Emergency medical attention needed
- Call 911 immediately`
        },
        {
          heading: 'Why Blood Pressure Matters',
          icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
          content: `High blood pressure damages your body silently over time:

• **Heart**: Can lead to heart attack, heart failure, and enlarged heart
• **Brain**: Increases risk of stroke and cognitive decline
• **Kidneys**: Can cause kidney disease or failure
• **Eyes**: May damage blood vessels in your eyes
• **Arteries**: Causes hardening and narrowing of arteries

High blood pressure is called the "silent killer" because it often has no symptoms until serious damage occurs.`
        },
        {
          heading: 'Lifestyle Management Strategies',
          icon: <TrendingUp className="w-5 h-5 text-green-500" />,
          content: `Evidence-based approaches to manage blood pressure:

**1. DASH Diet (Dietary Approaches to Stop Hypertension)**
- Focus on fruits, vegetables, whole grains
- Choose low-fat dairy products
- Include lean proteins: fish, poultry, beans
- Limit sodium to less than 2,300mg daily (1,500mg is ideal)

**2. Regular Physical Activity**
- Aim for 150 minutes of moderate exercise weekly
- Include both aerobic and strength training
- Even small amounts help: take stairs, walk more

**3. Weight Management**
- Losing even 5-10 pounds can lower blood pressure
- Calculate your BMI and set realistic goals
- Focus on sustainable changes, not crash diets

**4. Stress Reduction**
- Practice meditation or deep breathing
- Engage in hobbies you enjoy
- Ensure 7-9 hours of quality sleep
- Consider yoga or tai chi`
        },
        {
          heading: 'Home Monitoring Tips',
          icon: <Activity className="w-5 h-5 text-purple-500" />,
          content: `Best practices for accurate readings:

**Before Measuring:**
- Sit quietly for 5 minutes
- Avoid caffeine, exercise, and smoking for 30 minutes
- Empty your bladder
- Sit with back supported and feet flat on floor

**During Measurement:**
- Place cuff on bare arm at heart level
- Don't talk during measurement
- Take 2-3 readings, 1 minute apart
- Record all readings with date and time

**When to Measure:**
- Same time each day (morning and evening ideal)
- Before taking medications
- Track for at least a week before doctor visits

**Red Flags - Seek Immediate Care:**
- Systolic over 180 OR diastolic over 120
- Severe headache with high reading
- Chest pain or shortness of breath
- Vision changes or difficulty speaking`
        }
      ],
      
      keyTakeaways: [
        'Normal blood pressure is less than 120/80 mmHg',
        'High blood pressure often has no symptoms but causes serious damage',
        'Lifestyle changes can significantly lower blood pressure',
        'Home monitoring helps you and your doctor manage your condition',
        'Medications work best combined with healthy lifestyle habits'
      ],
      
      actionSteps: [
        'Purchase a validated home blood pressure monitor',
        'Schedule a checkup with your doctor to discuss your readings',
        'Start a blood pressure log (NuviaCare helps with this!)',
        'Reduce sodium in your diet - aim for less than 2,300mg daily',
        'Begin a regular exercise routine with your doctor\'s approval',
        'If prescribed medications, take them exactly as directed'
      ]
    }
  },
  '2': {
    title: 'Diabetes Management Guide',
    fullContent: {
      introduction: `Diabetes is a chronic condition affecting how your body processes blood sugar (glucose). Proper management is essential to prevent complications and maintain quality of life. This comprehensive guide will help you understand diabetes and take control of your health.`,
      
      sections: [
        {
          heading: 'Understanding Diabetes',
          icon: <Info className="w-5 h-5 text-blue-500" />,
          content: `Diabetes occurs when your body can't properly use or produce insulin, a hormone that regulates blood sugar.

**Type 1 Diabetes**
- Body doesn't produce insulin
- Usually diagnosed in children and young adults
- Requires insulin therapy
- About 5-10% of diabetes cases

**Type 2 Diabetes**
- Body doesn't use insulin properly
- Most common type (90-95% of cases)
- Often preventable through lifestyle
- May be managed with diet, exercise, and medications

**Prediabetes**
- Blood sugar higher than normal but not yet diabetes
- Affects 1 in 3 adults
- Reversible with lifestyle changes
- Warning sign to take action now`,
          image: '/images/glucose-machine.jpg',
          imageCaption: 'Blood glucose meter - Your partner in diabetes management'
        },
        {
          heading: 'Blood Sugar Target Ranges',
          icon: <Target className="w-5 h-5 text-green-500" />,
          content: `Know your numbers (for most adults with diabetes):

**Fasting** (Before eating):
- Target: 80-130 mg/dL
- Prediabetes: 100-125 mg/dL
- Diabetes: 126 mg/dL or higher (on two separate tests)

**After Meals** (1-2 hours after eating):
- Target: Less than 180 mg/dL

**A1C** (Average over 2-3 months):
- Normal: Less than 5.7%
- Prediabetes: 5.7% to 6.4%
- Diabetes: 6.5% or higher
- Treatment goal: Usually less than 7%

Your doctor may set different targets based on your specific situation, age, and other health conditions.`
        },
        {
          heading: 'Nutrition for Diabetes',
          icon: <Apple className="w-5 h-5 text-red-500" />,
          content: `Smart eating strategies for blood sugar control:

**The Plate Method**
- 1/2 plate: Non-starchy vegetables (leafy greens, broccoli, peppers)
- 1/4 plate: Lean protein (chicken, fish, beans, tofu)
- 1/4 plate: Complex carbohydrates (brown rice, quinoa, whole grains)
- Add: Small portion of fruit and/or dairy

**Carbohydrate Counting**
- Carbs affect blood sugar most
- Work with dietitian to determine your daily carb goal
- Spread carbs evenly throughout the day
- Choose complex carbs over simple sugars

**Glycemic Index Awareness**
- Low GI foods raise blood sugar slowly
- Choose whole grains, legumes, most vegetables
- Limit high GI foods: white bread, sugary drinks, processed foods

**Meal Timing**
- Eat at consistent times daily
- Don't skip meals (especially if on medication)
- Plan healthy snacks if needed
- Stay hydrated with water`
        },
        {
          heading: 'Exercise and Physical Activity',
          icon: <Activity className="w-5 h-5 text-orange-500" />,
          content: `Physical activity improves insulin sensitivity and helps manage blood sugar:

**Aerobic Exercise**
- Walking, swimming, cycling, dancing
- Aim for 150 minutes per week
- Can be broken into 10-minute sessions
- Lowers blood sugar for hours afterward

**Strength Training**
- Use weights, resistance bands, or body weight
- 2-3 times per week
- Builds muscle that uses glucose
- Improves long-term blood sugar control

**Safety Tips**
- Check blood sugar before and after exercise
- Carry fast-acting carbs for low blood sugar
- Wear medical ID bracelet
- Tell exercise partners about your diabetes
- Stay hydrated
- Inspect feet after exercise`
        },
        {
          heading: 'Medication and Monitoring',
          icon: <Shield className="w-5 h-5 text-purple-500" />,
          content: `Managing medications and tracking your numbers:

**Common Medications**
- Metformin: First-line oral medication
- Insulin: Essential for Type 1, sometimes needed for Type 2
- GLP-1 agonists: Help body release insulin
- SGLT2 inhibitors: Help kidneys remove sugar

**Monitoring Your Blood Sugar**
- Frequency depends on your treatment plan
- Before meals and bedtime for insulin users
- Less frequent if managing with diet/exercise only
- Keep detailed logs (NuviaCare makes this easy!)

**Hypoglycemia (Low Blood Sugar)**
Warning signs: Shakiness, sweating, confusion, rapid heartbeat
- Below 70 mg/dL is too low
- Treat with 15g fast-acting carbs
- Recheck in 15 minutes
- Follow up with a snack

**Hyperglycemia (High Blood Sugar)**
Warning signs: Increased thirst, frequent urination, fatigue
- Check for ketones if over 250 mg/dL
- Drink water and take correction dose if prescribed
- Call doctor if persistently high`
        }
      ],
      
      keyTakeaways: [
        'Diabetes management requires a team approach: you, your doctor, and other health professionals',
        'Consistent monitoring helps you understand how food, activity, and medication affect your blood sugar',
        'Small lifestyle changes can make a big difference in blood sugar control',
        'Prevention of complications is possible with good management',
        'You\'re not alone - support groups and resources are available'
      ],
      
      actionSteps: [
        'Schedule a comprehensive diabetes education class',
        'Meet with a registered dietitian for personalized meal planning',
        'Set up a consistent blood sugar monitoring routine',
        'Create an exercise plan that you enjoy and can sustain',
        'Organize your medications and set up reminders',
        'Schedule recommended screenings (eye exam, foot exam, A1C test)',
        'Build a support network - friends, family, support groups'
      ]
    }
  },
  '3': {
    title: 'Cardiac Exercise Program',
    fullContent: {
      introduction: `Exercise is one of the most powerful tools for improving and maintaining heart health. This program provides safe, effective exercise routines designed specifically for cardiovascular health, whether you're recovering from a cardiac event or working to prevent heart disease.`,
      
      sections: [
        {
          heading: 'Why Exercise Matters for Your Heart',
          icon: <Heart className="w-5 h-5 text-red-500" />,
          content: `Regular physical activity provides numerous benefits for your cardiovascular system:

**Immediate Benefits**
- Improves circulation and oxygen delivery
- Lowers blood pressure during and after exercise
- Reduces stress and anxiety
- Improves mood and sleep quality

**Long-term Benefits**
- Strengthens heart muscle
- Lowers resting heart rate
- Improves cholesterol levels (higher HDL, lower LDL)
- Helps manage weight
- Reduces risk of heart disease and stroke by 30-50%
- Improves insulin sensitivity
- Reduces inflammation

**Recovery Benefits** (after cardiac event)
- Safely rebuilds cardiovascular fitness
- Increases confidence in physical abilities
- Reduces hospital readmissions
- Improves quality of life
- May extend lifespan`
        },
        {
          heading: 'Getting Started Safely',
          icon: <Shield className="w-5 h-5 text-green-500" />,
          content: `Before beginning any exercise program, especially with heart concerns:

**Medical Clearance**
- Get approval from your cardiologist or doctor
- May need exercise stress test first
- Discuss any symptoms during activity
- Review current medications

**Know Your Limits**
- Target heart rate zone: 50-70% of maximum (220 - your age)
- Use "talk test": Can you hold a conversation?
- RPE scale: Aim for "somewhat hard" (11-14 on 6-20 scale)
- Stop if you experience: chest pain, severe shortness of breath, dizziness, nausea

**Warning Signs - STOP Exercise**
- Chest pain or pressure
- Pain radiating to arm, jaw, or back
- Severe shortness of breath
- Lightheadedness or dizziness
- Irregular heartbeat or palpitations
- Nausea or vomiting
- Unusual fatigue

**Emergency Protocol**
- Call 911 immediately if symptoms persist
- Have emergency contacts readily available
- Wear medical ID if you have heart disease
- Keep nitroglycerin accessible if prescribed`
        },
        {
          heading: 'Beginner Cardiac Exercise Program',
          icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
          content: `Start slowly and progress gradually over 12 weeks:

**Weeks 1-4: Foundation Phase**
*Frequency*: 3-4 days per week
*Duration*: 10-15 minutes
*Intensity*: Very light to light (can easily talk)
*Activities*: 
- Slow walking (flat surface)
- Seated leg raises and arm circles
- Gentle stretching

**Weeks 5-8: Building Phase**
*Frequency*: 4-5 days per week
*Duration*: 15-25 minutes
*Intensity*: Light to moderate (can talk but with some effort)
*Activities*:
- Brisk walking
- Stationary cycling (low resistance)
- Swimming or water aerobics
- Light resistance bands

**Weeks 9-12: Progress Phase**
*Frequency*: 5 days per week
*Duration*: 25-30 minutes
*Intensity*: Moderate (comfortable but working)
*Activities*:
- Walking hills or inclines
- Cycling (moderate resistance)
- Elliptical machine
- Group exercise classes

**Daily Structure**
1. Warm-up: 5 minutes (slow pace)
2. Main exercise: At target intensity
3. Cool-down: 5 minutes (gradual slowdown)
4. Stretching: 5 minutes`
        },
        {
          heading: 'Strength Training for Heart Health',
          icon: <Activity className="w-5 h-5 text-orange-500" />,
          content: `Building muscle supports your cardiovascular system:

**Getting Started**
- Wait 4-6 weeks after cardiac event (or get doctor clearance)
- Start with body weight or light resistance
- 2-3 days per week (non-consecutive days)
- 1-2 sets of 10-15 repetitions
- Breathe normally (never hold your breath)

**Sample Routine** (Choose 6-8 exercises)

*Upper Body:*
- Wall push-ups
- Seated rows with resistance band
- Bicep curls (light weights)
- Shoulder raises (light weights)

*Lower Body:*
- Chair squats (sit and stand)
- Heel raises (calf strengthening)
- Leg raises (seated or standing)
- Side leg lifts

*Core:*
- Seated torso twists
- Standing marches
- Pelvic tilts

**Important Reminders**
- Move slowly and with control
- Avoid straining or Valsalva maneuver
- Stop if you feel chest discomfort
- Progress weight gradually (no more than 5-10% increase)
- Quality over quantity`
        },
        {
          heading: 'Lifestyle Integration',
          icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
          content: `Make movement part of your daily life:

**Active Living Strategies**
- Take stairs instead of elevator (when ready)
- Park farther from store entrances
- Walk during phone calls
- Do household chores at a good pace
- Garden or do yard work
- Play with grandchildren
- Dance to your favorite music
- Walk your dog (or a neighbor's!)

**Overcoming Barriers**

*"I don't have time"*
→ Break exercise into 10-minute sessions
→ Combine with other activities (walk while talking)
→ Schedule it like a doctor's appointment

*"It's too cold/hot/rainy"*
→ Exercise indoors (mall walking, home exercises)
→ Use online workout videos
→ Join a gym or community center

*"I'm too tired"*
→ Start with just 5 minutes
→ Exercise actually increases energy
→ Choose times when you feel most energetic

*"I'm afraid I'll have another heart event"*
→ Following this program actually reduces risk
→ Bring someone with you initially
→ Use heart rate monitor for reassurance
→ Join a cardiac rehab program for supervision

**Tracking Progress**
- Keep exercise log in NuviaCare
- Note how you feel before and after
- Track resting heart rate (should decrease over time)
- Measure walking distance or time
- Celebrate improvements - they add up!`
        }
      ],
      
      keyTakeaways: [
        'Exercise is medicine for your heart - one of the most effective treatments available',
        'Start slowly and progress gradually - consistency matters more than intensity',
        'Always warm up, cool down, and listen to your body',
        'Combination of aerobic and strength training provides maximum benefit',
        'Most people can safely exercise with proper guidance and precautions'
      ],
      
      actionSteps: [
        'Schedule an appointment with your doctor to discuss exercise clearance',
        'Consider joining a cardiac rehabilitation program',
        'Purchase comfortable, supportive shoes for walking',
        'Find an exercise buddy for motivation and safety',
        'Set a realistic initial goal (example: walk 10 minutes, 3 times this week)',
        'Use NuviaCare to log your activities and track progress',
        'Join a cardiac support group in your community'
      ]
    }
  },
  '4': {
    title: 'Medication Adherence Tips',
    fullContent: {
      introduction: `Taking medications as prescribed is one of the most important things you can do to manage your health. However, up to 50% of people don't take their medications correctly. This guide provides practical strategies to help you remember and properly take your medications.`,
      
      sections: [
        {
          heading: 'Why Medication Adherence Matters',
          icon: <Shield className="w-5 h-5 text-blue-500" />,
          content: `Taking medications as directed can literally save your life:

**Benefits of Good Adherence**
- Better disease control and symptom management
- Fewer hospitalizations and emergency room visits
- Lower healthcare costs
- Better quality of life
- Prevention of disease progression
- Reduced risk of complications

**Consequences of Poor Adherence**
- Disease progression
- Increased symptoms
- Higher risk of complications
- More frequent hospitalizations
- Wasted healthcare dollars
- Drug resistance (antibiotics)

**The Cost**
Studies show that medication non-adherence:
- Leads to 125,000 deaths annually in the US
- Costs the healthcare system $100-$300 billion yearly
- Results in 10% of hospitalizations
- Causes 23% of nursing home admissions`
        },
        {
          heading: 'Common Barriers to Taking Medications',
          icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
          content: `Understanding why you might skip or forget medications:

**Forgetfulness**
- Busy schedules
- Multiple medications to track
- Lack of routine
- Cognitive issues

**Side Effects**
- Unpleasant symptoms
- Fear of side effects
- Real or perceived side effects
- Lack of communication with doctor

**Cost**
- High medication prices
- Insurance gaps
- Multiple prescriptions
- Not knowing about assistance programs

**Complexity**
- Multiple medications
- Different schedules
- Confusing instructions
- Difficulty swallowing pills

**Beliefs**
- "I don't need this medication"
- "I feel fine without it"
- "Natural alternatives are better"
- Not understanding why medication is needed

**Lifestyle Factors**
- Travel
- Changes in routine
- Lack of support
- Physical limitations`
        },
        {
          heading: 'Practical Strategies for Success',
          icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
          content: `Proven techniques to help you remember:

**1. Use Technology**
- Set phone alarms for each medication time
- Use medication reminder apps (NuviaCare has built-in reminders!)
- Enable smart home assistants to remind you
- Use digital pill dispensers

**2. Create Visual Cues**
- Place medications where you'll see them
- Use sticky notes in key locations
- Keep medications with routine items (toothbrush, coffee maker)
- Use a visible pill organizer

**3. Link to Daily Habits**
- Take with meals if appropriate
- Keep by your toothbrush
- With morning coffee or evening tea
- Before or after specific activities

**4. Organize Your Medications**
- Use a weekly pill organizer
- Separate morning/evening medications
- Color-code bottles
- Keep a master medication list

**5. Simplify Your Regimen**
- Ask doctor about once-daily versions
- Request combination pills when possible
- Use blister packs from pharmacy
- Consolidate pharmacy pickups

**6. Build a Support System**
- Ask family to remind you
- Use a medication buddy
- Tell pharmacist about your concerns
- Join a support group

**7. Make It Routine**
- Same time every day
- Same location
- Same sequence
- Check off on calendar after taking`
        },
        {
          heading: 'Working with Your Healthcare Team',
          icon: <Heart className="w-5 h-5 text-red-500" />,
          content: `Communication is key to medication success:

**Talk to Your Doctor About**
- All medications you're taking (including OTC and supplements)
- Side effects you're experiencing
- Difficulty affording medications
- Problems with your medication schedule
- Questions about why you need each medication
- Alternative options if having issues

**Ask These Important Questions**
1. What is this medication for?
2. How and when should I take it?
3. What should I do if I miss a dose?
4. What side effects should I watch for?
5. Are there any foods or activities to avoid?
6. How long will I need to take this?
7. Are there less expensive alternatives?
8. Can any of my medications be combined?

**Work with Your Pharmacist**
- Request easy-open caps if needed
- Ask for large-print labels
- Get medication counseling
- Request synchronized refills
- Ask about cost-saving programs
- Report any problems

**Be Honest**
- Don't skip medications without telling your doctor
- Report all side effects
- Mention if cost is an issue
- Say if you don't understand instructions
- Admit if you're having trouble remembering`
        },
        {
          heading: 'Special Situations',
          icon: <Info className="w-5 h-5 text-purple-500" />,
          content: `Handling unique circumstances:

**When Traveling**
- Pack medications in carry-on luggage
- Bring more than you need
- Keep medications in original bottles
- Bring a copy of your prescription
- Know generic names of medications
- Adjust for time zone changes gradually
- Research medication availability at destination

**When You Miss a Dose**
- Don't double up (unless specifically told to)
- Take as soon as you remember (if close to scheduled time)
- Skip if it's almost time for the next dose
- Write down when you take makeup doses
- Call pharmacist if unsure what to do

**Managing Multiple Medications**
- Create a medication schedule chart
- Use different colored organizers
- Set multiple alarms
- Keep a detailed log
- Review complete list with doctor regularly
- Consider medication synchronization program

**If You Can't Afford Medications**
- Ask about generic alternatives
- Look for patient assistance programs
- Check with pharmaceutical companies
- Apply for Medicare Extra Help
- Use prescription discount cards
- Buy 90-day supplies for savings
- Split pills if doctor approves`
        }
      ],
      
      keyTakeaways: [
        'Taking medications as prescribed is crucial for managing your health',
        'Forgetfulness is the #1 reason people miss doses - use reminders',
        'Organize medications in pill boxes and keep a master list',
        'Always talk to your doctor before stopping or changing medications',
        'Many resources exist to help with medication costs',
        'Technology and routines are your best tools for success'
      ],
      
      actionSteps: [
        'Create a complete list of all medications, doses, and schedules',
        'Set up a pill organizer system that works for you',
        'Enable medication reminders on your phone or use NuviaCare',
        'Talk to your pharmacist about synchronizing refills',
        'Schedule a medication review appointment with your doctor',
        'Research patient assistance programs if cost is a concern',
        'Build medication-taking into your daily routine'
      ]
    }
  },
  '5': {
    title: 'Mental Health and Chronic Conditions',
    fullContent: {
      introduction: `Living with a chronic health condition affects more than just your physical health - it impacts your emotional and mental well-being too. Understanding this connection and taking care of your mental health is just as important as managing your physical symptoms.`,
      
      sections: [
        {
          heading: 'The Mind-Body Connection',
          icon: <Brain className="w-5 h-5 text-purple-500" />,
          content: `Your mental and physical health are deeply interconnected:

**How Physical Health Affects Mental Health**
- Chronic pain can lead to depression
- Fatigue impacts mood and motivation
- Physical limitations affect self-esteem
- Medical treatments can be emotionally draining
- Uncertainty about the future causes anxiety
- Loss of independence affects mental state

**How Mental Health Affects Physical Health**
- Depression can worsen chronic disease symptoms
- Anxiety increases blood pressure and heart rate
- Stress weakens immune system
- Poor mental health reduces medication adherence
- Emotional distress slows healing
- Mental health issues increase inflammation

**Common Mental Health Challenges**
With chronic conditions, you may experience:
- Depression (affects 1 in 3 people with chronic illness)
- Anxiety disorders
- Adjustment disorders
- Grief and loss
- Fear and worry
- Irritability and anger
- Feeling overwhelmed`
        },
        {
          heading: 'Recognizing Mental Health Issues',
          icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
          content: `Know the warning signs:

**Depression Symptoms** (lasting 2+ weeks)
- Persistent sad, anxious, or empty mood
- Loss of interest in activities once enjoyed
- Fatigue or decreased energy
- Sleep problems (too much or too little)
- Appetite changes
- Difficulty concentrating
- Feelings of worthlessness or guilt
- Thoughts of death or suicide

**Anxiety Symptoms**
- Excessive worry that's hard to control
- Restlessness or feeling on edge
- Rapid heartbeat or sweating
- Difficulty sleeping
- Physical tension
- Avoiding situations due to fear
- Panic attacks

**When to Seek Help Immediately**
- Thoughts of suicide or self-harm
- Thoughts of harming others
- Severe panic or anxiety attacks
- Inability to care for yourself
- Psychotic symptoms (hallucinations, delusions)
- Substance abuse to cope

**National Suicide Prevention Lifeline: 988**
Available 24/7, free and confidential`
        },
        {
          heading: 'Coping Strategies',
          icon: <Heart className="w-5 h-5 text-red-500" />,
          content: `Practical ways to support your mental health:

**1. Stay Connected**
- Maintain relationships with friends and family
- Join support groups (online or in-person)
- Share your feelings with trusted people
- Don't isolate yourself
- Consider peer support programs
- Stay engaged in your community

**2. Practice Self-Care**
- Get adequate sleep (7-9 hours)
- Eat nutritious, balanced meals
- Stay physically active within your abilities
- Engage in hobbies you enjoy
- Take time to relax
- Practice good hygiene
- Set realistic goals

**3. Manage Stress**
- Try deep breathing exercises
- Practice progressive muscle relaxation
- Use meditation or mindfulness apps
- Listen to calming music
- Spend time in nature
- Limit exposure to stressors when possible
- Learn to say no to overwhelming commitments

**4. Challenge Negative Thoughts**
- Notice when you're thinking negatively
- Question if thoughts are realistic
- Replace negative thoughts with balanced ones
- Practice gratitude daily
- Focus on what you can control
- Celebrate small victories

**5. Structure Your Day**
- Maintain a regular routine
- Set small, achievable goals
- Break tasks into manageable steps
- Plan activities you enjoy
- Balance rest and activity
- Track your mood and triggers`
        },
        {
          heading: 'Professional Support',
          icon: <Shield className="w-5 h-5 text-green-500" />,
          content: `When and how to get professional help:

**Types of Mental Health Professionals**

*Psychologist*
- Provides talk therapy and counseling
- Can diagnose mental health conditions
- Cannot prescribe medications (in most states)

*Psychiatrist*
- Medical doctor specializing in mental health
- Can prescribe medications
- Often combines medication with therapy

*Licensed Counselor/Therapist*
- Provides counseling and support
- Various specializations available
- Cannot prescribe medications

*Social Worker*
- Helps with resources and support services
- Provides counseling
- Assists with practical needs

**Therapy Options**

*Cognitive Behavioral Therapy (CBT)*
- Focuses on changing thought patterns
- Evidence-based for many conditions
- Usually short-term and goal-oriented

*Acceptance and Commitment Therapy (ACT)*
- Helps accept difficult emotions
- Focuses on values and meaningful action
- Useful for chronic illness

*Support Groups*
- Share experiences with others
- Learn coping strategies
- Feel less alone
- Free or low-cost options available

**Finding a Provider**
- Ask your primary care doctor for referrals
- Check your insurance provider directory
- Use online therapist-finding services
- Contact local mental health agencies
- Ask for recommendations from support groups
- Many offer telehealth options

**Paying for Mental Health Care**
- Most insurance covers mental health
- Look for sliding-scale fee therapists
- Check community mental health centers
- Online therapy options may be more affordable
- Employee assistance programs (EAPs)
- Medicare covers mental health services`
        },
        {
          heading: 'Building Resilience',
          icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
          content: `Developing strength to face challenges:

**What is Resilience?**
The ability to adapt and bounce back from difficult experiences. It's not about avoiding stress, but learning to cope effectively.

**Ways to Build Resilience**

*Maintain Perspective*
- Remember that setbacks are temporary
- Look for opportunities in challenges
- Keep the big picture in mind
- Don't catastrophize

*Foster Optimism*
- Focus on what's going well
- Practice gratitude daily
- Visualize positive outcomes
- Surround yourself with positive people

*Develop Problem-Solving Skills*
- Break problems into smaller parts
- Consider multiple solutions
- Take action on what you can control
- Learn from past experiences

*Practice Self-Compassion*
- Talk to yourself like a good friend
- Accept that everyone struggles
- Don't judge yourself harshly
- Recognize your efforts

*Find Meaning*
- Connect with your values
- Help others when possible
- Pursue activities that matter to you
- Find purpose in your experience

**Remember**
- Resilience develops over time
- Everyone's journey is different
- Asking for help is a sign of strength
- Small steps lead to big changes
- You don't have to do this alone`
        }
      ],
      
      keyTakeaways: [
        'Mental and physical health are deeply connected - both need attention',
        'Depression and anxiety are common with chronic illness - you\'re not alone',
        'Professional help is available and effective',
        'Self-care and coping strategies can make a significant difference',
        'Building resilience helps you handle challenges more effectively',
        'Reaching out for support is a sign of strength, not weakness'
      ],
      
      actionSteps: [
        'Screen yourself for depression using a validated tool (PHQ-9)',
        'Talk to your doctor about your mental health at your next visit',
        'Start one self-care practice this week (meditation, journaling, etc.)',
        'Connect with a support group for your condition',
        'Make a list of people you can talk to when struggling',
        'Research mental health resources in your area',
        'Consider scheduling an appointment with a therapist'
      ]
    }
  },
  '6': {
    title: 'Emergency Response Training',
    fullContent: {
      introduction: `Knowing how to respond in a medical emergency can save a life - possibly even your own. This training covers essential emergency recognition, first aid basics, and when to seek immediate medical care. Being prepared gives you confidence and could make all the difference in a critical situation.`,
      
      sections: [
        {
          heading: 'Recognizing Medical Emergencies',
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          content: `**CALL 911 IMMEDIATELY if you see:**

**Heart Attack Warning Signs**
- Chest pain, pressure, squeezing, or fullness
- Pain radiating to arm, jaw, neck, or back
- Shortness of breath
- Cold sweat, nausea, lightheadedness
- Sense of impending doom

*Women may have*: Unusual fatigue, nausea, back pain

**Stroke - Use F.A.S.T.**
**F**ace: Ask person to smile - does one side droop?
**A**rm: Ask to raise both arms - does one drift down?
**S**peech: Ask to repeat a phrase - is speech slurred?
**T**ime: If you see any signs, call 911 immediately

*Additional stroke signs:*
- Sudden severe headache
- Sudden vision problems
- Sudden dizziness or loss of balance
- Confusion

**Severe Allergic Reaction (Anaphylaxis)**
- Difficulty breathing or wheezing
- Swelling of face, lips, or tongue
- Rapid pulse
- Dizziness or fainting
- Skin rash or hives
- Nausea or vomiting

*If person has an EpiPen, help them use it and call 911*

**Severe Bleeding**
- Blood spurting or flowing continuously
- Blood soaking through bandages
- Bleeding that won't stop after 10 minutes of direct pressure
- Amputation or deep wound

**Diabetic Emergencies**
*Low blood sugar (Hypoglycemia):*
- Confusion or unusual behavior
- Shakiness, sweating
- Rapid heartbeat
- Unable to swallow

*High blood sugar (Hyperglycemia):*
- Fruity breath odor
- Extreme thirst
- Very frequent urination
- Nausea and vomiting
- Confusion or drowsiness

**Other Emergencies**
- Seizures lasting more than 5 minutes
- Difficulty breathing
- Choking
- Severe burns
- Head injury with loss of consciousness
- Poisoning
- Chest pain
- Severe allergic reaction`
        },
        {
          heading: 'CPR Basics',
          icon: <Heart className="w-5 h-5 text-red-500" />,
          content: `**Hands-Only CPR** (for adults)
*When someone is unresponsive and not breathing*

**1. Check and Call**
- Tap shoulder and shout "Are you okay?"
- If no response and not breathing normally, call 911
- Get an AED if available

**2. Position**
- Place person on back on firm surface
- Kneel beside chest
- Place heel of one hand on center of chest
- Place other hand on top
- Interlock fingers

**3. Push Hard and Fast**
- Push straight down at least 2 inches
- Rate: 100-120 compressions per minute
- Allow chest to fully recoil between compressions
- Continue until help arrives or AED is ready

**Rhythm Tip**
Compress to the beat of "Stayin' Alive" by the Bee Gees

**Important Notes**
- Don't be afraid to push hard
- Broken ribs may occur but CPR saves lives
- Continue until paramedics arrive
- Use AED as soon as available

**For Infants (under 1 year)**
- Use two fingers in center of chest
- Press about 1.5 inches deep
- Same rate: 100-120 per minute

**Consider Taking a Class**
- Hands-on CPR training is highly recommended
- American Heart Association offers classes
- Red Cross also provides certification
- Many community centers offer free training`
        },
        {
          heading: 'Using an AED (Automated External Defibrillator)',
          icon: <Activity className="w-5 h-5 text-blue-500" />,
          content: `**What is an AED?**
A device that can analyze heart rhythm and deliver an electric shock to restore normal rhythm during cardiac arrest.

**Where to Find AEDs**
- Airports, malls, office buildings
- Schools and gyms
- Community centers
- Many public spaces
- Look for red and white signs with heart symbol

**How to Use an AED**

**Step 1: Turn On AED**
- Open case (some turn on automatically)
- Follow voice and visual prompts

**Step 2: Expose Chest**
- Remove clothing from chest
- Wipe chest dry if wet
- Remove medication patches
- Shave chest hair if needed (some AEDs include razor)

**Step 3: Attach Pads**
- Place pads as shown in diagram on AED
- One pad upper right chest
- One pad lower left side
- Press pads firmly to skin
- Plug in connector if needed

**Step 4: Let AED Analyze**
- Don't touch person
- AED will analyze heart rhythm
- Stand clear

**Step 5: Deliver Shock if Advised**
- Make sure no one is touching person
- Say "Stand clear" loudly
- Push shock button when prompted
- AED won't shock if not needed

**Step 6: Continue CPR**
- Immediately resume compressions after shock
- AED will reanalyze every 2 minutes
- Follow AED prompts
- Continue until paramedics arrive

**Important Safety**
- AEDs are very safe and won't shock unnecessarily
- You can't hurt someone by using an AED
- Cannot use on someone in water - move them first
- Safe for children over 1 year (use pediatric pads if available)`
        },
        {
          heading: 'First Aid Essentials',
          icon: <Shield className="w-5 h-5 text-green-500" />,
          content: `**Controlling Severe Bleeding**

1. Call 911 if bleeding is severe
2. Wear gloves if available
3. Apply direct pressure with clean cloth
4. Add more cloths if soaked (don't remove first one)
5. Elevate wound above heart if possible
6. Apply pressure to pressure points if needed
7. Don't remove impaled objects

**Choking (Heimlich Maneuver)**

*For conscious adults:*
1. Stand behind person
2. Make fist with one hand
3. Place thumb side against stomach, above navel
4. Grasp fist with other hand
5. Give quick, upward thrusts
6. Repeat until object comes out or person becomes unconscious

*Signs of choking:*
- Universal choking sign (hands at throat)
- Cannot cough, speak, or breathe
- Face turning blue

*If person becomes unconscious:*
- Call 911
- Begin CPR
- Look for object before giving breaths

**Burns**

*First-degree (redness):*
- Cool with water for 10-15 minutes
- Apply aloe vera
- Cover with sterile bandage
- Give over-the-counter pain medicine

*Second-degree (blisters):*
- Don't break blisters
- Cool with water
- Cover with sterile bandage
- Seek medical care if large area

*Third-degree (charred, white):*
- Call 911
- Don't remove clothing stuck to burn
- Cover with sterile cloth
- Don't apply water to large burns
- Treat for shock

**Shock**

*Signs:*
- Pale, cold, clammy skin
- Rapid, weak pulse
- Rapid breathing
- Nausea or vomiting
- Weakness or fatigue
- Confusion

*Treatment:*
1. Call 911
2. Have person lie down
3. Elevate legs 12 inches (if no spinal injury)
4. Keep person warm
5. Don't give anything to eat or drink
6. Monitor breathing and pulse

**Seizures**

*What to do:*
1. Protect from injury
2. Turn on side if possible
3. Cushion head
4. Time the seizure
5. Stay with person

*Do NOT:*
- Put anything in mouth
- Restrain person
- Give food or water during seizure

*Call 911 if:*
- Seizure lasts more than 5 minutes
- Person is injured
- Trouble breathing after
- Person is pregnant
- Another seizure follows
- First time seizure`
        },
        {
          heading: 'Emergency Preparedness',
          icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
          content: `**Build an Emergency Medical Kit**

*Essential items:*
- Emergency contact numbers
- List of medications and allergies
- Sterile gauze pads (various sizes)
- Adhesive bandages
- Adhesive tape
- Elastic bandages
- Antiseptic wipes
- Antibiotic ointment
- Disposable gloves
- Scissors and tweezers
- Instant cold packs
- Thermometer
- Pain relievers
- Emergency blanket
- CPR face shield
- First aid manual

*For chronic conditions, also include:*
- Extra medications (7-day supply)
- Blood glucose meter and supplies
- Blood pressure monitor
- Peak flow meter
- EpiPen or other emergency medications
- Medical device batteries

**Create an Emergency Plan**

*Know your information:*
- List of all medications (name, dose, frequency)
- List of allergies
- Medical conditions
- Doctor contact information
- Emergency contacts
- Insurance information
- Medical ID number

*Communicate your plan:*
- Share with family members
- Tell coworkers about conditions
- Inform neighbors if living alone
- Register with special needs registry
- Wear medical alert bracelet/necklace

*Plan for scenarios:*
- What to do if you feel symptoms
- Who to call first
- Where medications are located
- Where emergency information is kept
- How to get to hospital quickly

**Medical Alert System**

*Consider if you:*
- Live alone
- Have serious medical conditions
- Are at fall risk
- Have history of emergencies

*Options:*
- Traditional pendant/bracelet systems
- Smartphone apps
- Smartwatch features
- GPS-enabled devices

**Stay Trained**
- Take CPR/AED course every 2 years
- Practice using emergency equipment
- Review emergency plans regularly
- Update medical information as needed
- Teach family members basic first aid`
        }
      ],
      
      keyTakeaways: [
        'Recognizing emergency signs quickly saves lives - know F.A.S.T. for stroke',
        'CPR and AED use are simpler than you think - don\'t be afraid to act',
        'When in doubt, call 911 - it\'s better to be safe',
        'Having an emergency plan and supplies prepared reduces panic',
        'Taking a CPR/First Aid course provides confidence and hands-on practice',
        'Medical alert systems and IDs help first responders help you'
      ],
      
      actionSteps: [
        'Sign up for a CPR/AED/First Aid certification course in your area',
        'Create or update your medical emergency information card',
        'Build a home first aid kit with essential supplies',
        'Locate the nearest AED to your home and workplace',
        'Create an emergency contact list on your phone',
        'Consider getting a medical alert bracelet if you have chronic conditions',
        'Teach family members about your specific emergency needs',
        'Practice calling 911 and knowing what information to provide'
      ]
    }
  }
};

export default function ContentViewerModal({ isOpen, onClose, content }: ContentViewerProps) {
  const [progress, setProgress] = useState(0);
  const contentData = educationalContentData[content?.id];

  if (!contentData) return null;

  const handleScroll = (e: any) => {
    const element = e.target;
    const scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    setProgress(Math.min(scrollPercentage, 100));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {contentData.title}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{content.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(content.publishedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{content.duration}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {content.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Reading Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6" onScroll={handleScroll}>
          {/* Introduction */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                {contentData.fullContent.introduction}
              </p>
            </CardContent>
          </Card>

          {/* Sections */}
          {contentData.fullContent.sections.map((section: any, index: number) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {section.icon}
                  {section.heading}
                </h3>
                
                {section.image && (
                  <div className="rounded-lg overflow-hidden border-2 border-gray-200">
                    <img 
                      src={section.image} 
                      alt={section.heading}
                      className="w-full h-64 object-cover"
                    />
                    {section.imageCaption && (
                      <p className="text-sm text-gray-600 bg-gray-50 px-4 py-2 italic">
                        {section.imageCaption}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="prose max-w-none">
                  {section.content.split('\n\n').map((paragraph: string, pIndex: number) => (
                    <p key={pIndex} className="text-gray-700 leading-relaxed mb-3 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Key Takeaways */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                <BookMarked className="w-5 h-5 text-green-600" />
                Key Takeaways
              </h3>
              <div className="space-y-2">
                {contentData.fullContent.keyTakeaways.map((takeaway: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{takeaway}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Steps */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                Your Action Steps
              </h3>
              <div className="space-y-2">
                {contentData.fullContent.actionSteps.map((step: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 flex-1">{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completion Message */}
          {progress >= 95 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Great Job!</h3>
                <p className="text-gray-600">You've completed this educational content. Keep learning!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

