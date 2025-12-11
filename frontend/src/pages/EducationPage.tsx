import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  Download, 
  Star, 
  Clock, 
  Users, 
  Heart, 
  Activity, 
  Pill, 
  Brain,
  FileText,
  Video,
  Headphones,
  Search,
  Filter,
  Bookmark,
  Share
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import ContentViewerModal from '@/components/ContentViewerModal';
import ShareDialog from '@/components/ShareDialog';
import { toast } from 'sonner';

interface EducationalContent {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'interactive';
  category: 'general' | 'medication' | 'exercise' | 'mental-health' | 'emergency';
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  views: number;
  thumbnail?: string;
  author: string;
  publishedDate: string;
  tags: string[];
  isBookmarked: boolean;
}

export default function EducationPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedContent, setBookmarkedContent] = useState<string[]>(['1', '3']);
  const [selectedContent, setSelectedContent] = useState<EducationalContent | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareContent, setShareContent] = useState<EducationalContent | null>(null);

  const educationalContent: EducationalContent[] = [
    {
      id: '1',
      title: 'Understanding Blood Pressure',
      description: 'Learn about blood pressure readings, what they mean, and how to manage them effectively.',
      type: 'video',
      category: 'general',
      duration: '12:30',
      difficulty: 'beginner',
      rating: 4.8,
      views: 1250,
      author: 'Dr. Sarah Johnson',
      publishedDate: '2024-01-15',
      tags: ['blood pressure', 'cardiovascular', 'health monitoring'],
      isBookmarked: true
    },
    {
      id: '2',
      title: 'Diabetes Management Guide',
      description: 'Comprehensive guide to managing diabetes through diet, exercise, and medication.',
      type: 'article',
      category: 'medication',
      duration: '8 min read',
      difficulty: 'intermediate',
      rating: 4.6,
      views: 890,
      author: 'Dr. Michael Chen',
      publishedDate: '2024-01-12',
      tags: ['diabetes', 'insulin', 'blood sugar', 'diet'],
      isBookmarked: false
    },
    {
      id: '3',
      title: 'Cardiac Exercise Program',
      description: 'Safe exercise routines designed specifically for heart health and recovery.',
      type: 'interactive',
      category: 'exercise',
      duration: '25:00',
      difficulty: 'beginner',
      rating: 4.9,
      views: 2100,
      author: 'Dr. Emily Rodriguez',
      publishedDate: '2024-01-10',
      tags: ['exercise', 'cardiac', 'rehabilitation', 'fitness'],
      isBookmarked: true
    },
    {
      id: '4',
      title: 'Medication Adherence Tips',
      description: 'Audio guide with practical tips for remembering to take medications on time.',
      type: 'audio',
      category: 'medication',
      duration: '15:45',
      difficulty: 'beginner',
      rating: 4.7,
      views: 750,
      author: 'Dr. James Wilson',
      publishedDate: '2024-01-08',
      tags: ['medication', 'adherence', 'tips', 'routine'],
      isBookmarked: false
    },
    {
      id: '5',
      title: 'Mental Health and Chronic Conditions',
      description: 'Understanding the psychological impact of chronic health conditions.',
      type: 'article',
      category: 'mental-health',
      duration: '12 min read',
      difficulty: 'intermediate',
      rating: 4.5,
      views: 650,
      author: 'Dr. Lisa Thompson',
      publishedDate: '2024-01-05',
      tags: ['mental health', 'chronic conditions', 'wellbeing', 'support'],
      isBookmarked: false
    },
    {
      id: '6',
      title: 'Emergency Response Training',
      description: 'Learn how to respond to medical emergencies and when to call for help.',
      type: 'video',
      category: 'emergency',
      duration: '18:20',
      difficulty: 'advanced',
      rating: 4.9,
      views: 3200,
      author: 'Dr. Robert Martinez',
      publishedDate: '2024-01-03',
      tags: ['emergency', 'first aid', 'CPR', 'safety'],
      isBookmarked: false
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      case 'interactive': return <Brain className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return <Heart className="w-4 h-4" />;
      case 'medication': return <Pill className="w-4 h-4" />;
      case 'exercise': return <Activity className="w-4 h-4" />;
      case 'mental-health': return <Brain className="w-4 h-4" />;
      case 'emergency': return <Activity className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedContent(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
    toast.success(
      bookmarkedContent.includes(id) 
        ? 'Removed from bookmarks' 
        : 'Added to bookmarks'
    );
  };

  const handleStartContent = (content: EducationalContent) => {
    setSelectedContent(content);
    setIsViewerOpen(true);
  };

  const handleShare = (content: EducationalContent) => {
    setShareContent(content);
    setIsShareOpen(true);
  };

  const handleDownload = (content: EducationalContent) => {
    // Create downloadable content
    const contentText = `
${content.title}
By ${content.author}
Published: ${content.publishedDate}

${content.description}

Category: ${content.category}
Difficulty: ${content.difficulty}
Duration: ${content.duration}
Rating: ${content.rating}/5

Tags: ${content.tags.join(', ')}

---
Downloaded from NuviaCare Health Education
Visit us at: ${window.location.origin}
    `.trim();

    const blob = new Blob([contentText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Content downloaded successfully!');
  };

  const filteredContent = educationalContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All', icon: BookOpen },
    { id: 'general', label: 'General Health', icon: Heart },
    { id: 'medication', label: 'Medications', icon: Pill },
    { id: 'exercise', label: 'Exercise', icon: Activity },
    { id: 'mental-health', label: 'Mental Health', icon: Brain },
    { id: 'emergency', label: 'Emergency Care', icon: Activity }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Health Education
          </h1>
          <p className="text-gray-600 mt-1">Learn about health conditions, treatments, and wellness</p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search educational content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-1"
                  >
                    <Icon className="w-3 h-3" />
                    <span>{category.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((content) => (
          <Card key={content.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getTypeIcon(content.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{content.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{content.author}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark(content.id)}
                  className={`p-1 ${bookmarkedContent.includes(content.id) ? 'text-yellow-500' : 'text-gray-400'}`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarkedContent.includes(content.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-3">{content.description}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{content.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{content.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>{content.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge className={getDifficultyColor(content.difficulty)}>
                  {content.difficulty}
                </Badge>
                <div className="flex items-center space-x-1">
                  {getCategoryIcon(content.category)}
                  <span className="text-xs text-gray-500 capitalize">{content.category}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {content.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {content.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{content.tags.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => handleStartContent(content)}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShare(content)}
                  title="Share on social media"
                >
                  <Share className="w-3 h-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(content)}
                  title="Download content"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Content</p>
                <p className="text-lg font-semibold">{educationalContent.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bookmark className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bookmarked</p>
                <p className="text-lg font-semibold">{bookmarkedContent.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Video className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Videos</p>
                <p className="text-lg font-semibold">
                  {educationalContent.filter(c => c.type === 'video').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Articles</p>
                <p className="text-lg font-semibold">
                  {educationalContent.filter(c => c.type === 'article').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Viewer Modal */}
      <ContentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        content={selectedContent}
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        content={shareContent}
      />
    </div>
  );
}
