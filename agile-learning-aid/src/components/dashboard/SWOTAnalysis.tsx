import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertTriangle, Star, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SWOTAnalysis {
  studentUsername: string;
  subject: string;
  overallPerformance: {
    totalQuizzes: number;
    averageScore: number;
    totalTimeSpent: number;
    improvementTrend: string;
  };
  strengths: Array<{
    topic: string;
    averageScore: number;
    confidence: string;
    description: string;
  }>;
  weaknesses: Array<{
    topic: string;
    averageScore: number;
    errorPattern: string;
    description: string;
    improvementSuggestion: string;
  }>;
  opportunities: Array<{
    topic: string;
    description: string;
    actionPlan: string;
    priority: string;
  }>;
  threats: Array<{
    topic: string;
    description: string;
    riskLevel: string;
    mitigation: string;
  }>;
  recommendations: Array<{
    category: string;
    suggestion: string;
    priority: string;
  }>;
}

const SWOTAnalysis: React.FC = () => {
  const { user } = useAuth();

  const { data: swotData, isLoading, error } = useQuery({
    queryKey: ['swot', user?.name],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5010/api/students/${user?.name}/swot`);
      if (!response.ok) throw new Error('Failed to fetch SWOT analysis');
      return response.json();
    },
    enabled: !!user
  });

  if (isLoading) return <div>Loading SWOT Analysis...</div>;
  if (error) {
    toast({ title: 'Error', description: 'Failed to load SWOT analysis', variant: 'destructive' });
    return <div>Error loading SWOT analysis</div>;
  }
  if (!swotData || swotData.length === 0) return <div>No SWOT analysis available</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#0071c5] to-[#004494] rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">SWOT Analysis</h1>
        <p className="text-blue-100">Understand your academic strengths and areas for improvement</p>
      </div>

      {swotData.map((swot: SWOTAnalysis, index: number) => (
        <div key={index} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{swot.subject} Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium">Total Quizzes</p>
                  <p className="text-2xl">{swot.overallPerformance.totalQuizzes}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium">Average Score</p>
                  <p className="text-2xl">{Math.round(swot.overallPerformance.averageScore)}%</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium">Trend</p>
                  <p className="text-2xl">{swot.overallPerformance.improvementTrend}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {swot.strengths.length === 0 ? (
                  <p className="text-gray-600">No strengths identified yet</p>
                ) : (
                  swot.strengths.map((strength, i) => (
                    <div key={i} className="mb-4 p-3 bg-green-50 rounded-lg">
                      <p className="font-medium">{strength.topic}</p>
                      <p className="text-sm">{strength.description}</p>
                      <p className="text-sm text-gray-600">Confidence: {strength.confidence}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {swot.weaknesses.length === 0 ? (
                  <p className="text-gray-600">No weaknesses identified yet</p>
                ) : (
                  swot.weaknesses.map((weakness, i) => (
                    <div key={i} className="mb-4 p-3 bg-red-50 rounded-lg">
                      <p className="font-medium">{weakness.topic}</p>
                      <p className="text-sm">{weakness.description}</p>
                      <p className="text-sm text-gray-600">Suggestion: {weakness.improvementSuggestion}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-500" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {swot.opportunities.length === 0 ? (
                  <p className="text-gray-600">No opportunities identified yet</p>
                ) : (
                  swot.opportunities.map((opportunity, i) => (
                    <div key={i} className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium">{opportunity.topic}</p>
                      <p className="text-sm">{opportunity.description}</p>
                      <p className="text-sm text-gray-600">Action Plan: {opportunity.actionPlan}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-500" />
                  Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                {swot.threats.length === 0 ? (
                  <p className="text-gray-600">No threats identified yet</p>
                ) : (
                  swot.threats.map((threat, i) => (
                    <div key={i} className="mb-4 p-3 bg-orange-50 rounded-lg">
                      <p className="font-medium">{threat.topic}</p>
                      <p className="text-sm">{threat.description}</p>
                      <p className="text-sm text-gray-600">Mitigation: {threat.mitigation}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {swot.recommendations.length === 0 ? (
                <p className="text-gray-600">No recommendations available yet</p>
              ) : (
                swot.recommendations.map((rec, i) => (
                  <div key={i} className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium">{rec.category}</p>
                    <p className="text-sm">{rec.suggestion}</p>
                    <p className="text-sm text-gray-600">Priority: {rec.priority}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default SWOTAnalysis;