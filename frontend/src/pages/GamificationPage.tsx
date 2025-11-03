import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Flame, Star, Award, Crown, Zap, Heart, Activity, Loader2 } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

export default function GamificationPage() {
  const { progress, achievements, leaderboard, isLoading, isLoadingLeaderboard } = useGamification();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const levelProgress = ((progress?.totalPoints || 0) % 100);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Your Health Journey</h1>
        <p className="text-gray-600 mt-1">Track your progress and earn rewards</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Level Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm">Current Level</p>
                <p className="text-4xl font-bold">{progress?.level || 1}</p>
              </div>
              <Crown className="w-12 h-12 text-yellow-300" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-100">Progress to Level {(progress?.level || 1) + 1}</span>
                <span className="font-medium">{levelProgress}%</span>
              </div>
              <Progress value={levelProgress} className="h-2 bg-purple-900" />
            </div>
          </CardContent>
        </Card>

        {/* Points Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Points</p>
                <p className="text-4xl font-bold">{progress?.totalPoints || 0}</p>
              </div>
              <Star className="w-12 h-12 text-yellow-300" />
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Current Streak</p>
                <p className="text-4xl font-bold">{progress?.currentStreak || 0}</p>
                <p className="text-orange-100 text-xs mt-1">days in a row</p>
              </div>
              <Flame className="w-12 h-12 text-yellow-300" />
            </div>
          </CardContent>
        </Card>

        {/* Longest Streak Card */}
        <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Best Streak</p>
                <p className="text-4xl font-bold">{progress?.longestStreak || 0}</p>
                <p className="text-green-100 text-xs mt-1">days record</p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Daily Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${progress?.dailyGoals?.bloodPressure ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className={`w-8 h-8 ${progress?.dailyGoals?.bloodPressure ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-800">Blood Pressure</p>
                    <p className="text-sm text-gray-600">Record today's reading</p>
                  </div>
                </div>
                {progress?.dailyGoals?.bloodPressure && (
                  <div className="bg-green-500 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${progress?.dailyGoals?.bloodGlucose ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className={`w-8 h-8 ${progress?.dailyGoals?.bloodGlucose ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-800">Blood Glucose</p>
                    <p className="text-sm text-gray-600">Check glucose level</p>
                  </div>
                </div>
                {progress?.dailyGoals?.bloodGlucose && (
                  <div className="bg-green-500 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${progress?.dailyGoals?.medication ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className={`w-8 h-8 ${progress?.dailyGoals?.medication ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-800">Medication</p>
                    <p className="text-sm text-gray-600">Take your meds</p>
                  </div>
                </div>
                {progress?.dailyGoals?.medication && (
                  <div className="bg-green-500 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Tip:</span> Complete all daily goals to maintain your streak and earn bonus points! 🎯
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {/* Achievements Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            Achievements ({achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement: any) => (
                <div 
                  key={achievement._id} 
                  className="p-4 rounded-lg border-2 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800">{achievement.name}</h4>
                        <Badge className={`bg-${achievement.badgeColor}-500 text-white`}>
                          +{achievement.points}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <p className="text-xs text-gray-500">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No achievements yet. Start tracking your health to earn rewards!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Community Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLeaderboard ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((user: any, index: number) => (
                <div 
                  key={user._id} 
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400' :
                    index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400' :
                    'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`font-bold text-2xl ${
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-600' :
                      index === 2 ? 'text-orange-600' :
                      'text-gray-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.userId?.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-600">Level {user.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">{user.totalPoints}</p>
                    <p className="text-xs text-gray-600">points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Leaderboard will appear when more users join!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

