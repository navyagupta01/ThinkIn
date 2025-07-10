import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  User, 
  Calendar, 
  BarChart2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:5002/api';

interface Assignment {
  _id: string;
  title: string;
}

interface Report {
  submissionId: string;
  studentId: string;
  studentName: string;
  reportPath: string;
  aiGrade: {
    finalScore: number;
    percentage: number;
    scoreBreakdown: any;
    qualityMetrics: any;
    styleMetrics: any;
    semanticAnalysis: any;
    sentimentAnalysis: any;
    comprehensiveFeedback: any;
  };
  submittedAt: string;
}

const TeacherAIGradeView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'teacher') {
      setError('Unauthorized: Teachers only');
      toast({ variant: 'destructive', title: 'Error', description: 'Unauthorized: Teachers only' });
      return;
    }
    fetchAssignments();
  }, [user, navigate]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/assignments`, {
        headers: {
          'x-user-id': user?.id,
          'x-user-role': user?.role,
          'x-user-name': user?.name
        }
      });
      setAssignments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch assignments');
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.error || 'Failed to fetch assignments' });
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (assignmentId: string) => {
    try {
      setLoading(true);
      setSelectedReport(null);
      const response = await axios.get(`${API_URL}/submissions/${assignmentId}/reports`, {
        headers: {
          'x-user-id': user?.id,
          'x-user-role': user?.role,
          'x-user-name': user?.name
        }
      });
      setReports(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch reports');
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.error || 'Failed to fetch reports' });
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetails = async (submissionId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reports/${submissionId}`, {
        headers: {
          'x-user-id': user?.id,
          'x-user-role': user?.role,
          'x-user-name': user?.name
        }
      });
      setSelectedReport(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch report details');
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.error || 'Failed to fetch report details' });
    } finally {
      setLoading(false);
    }
  };

  // Dynamic chart scaling
  const getMaxChartValue = (data: number[]) => {
    const max = Math.max(...data, 100);
    return Math.ceil(max / 10) * 10;
  };

  // Chart.js data for Quality Metrics
  const qualityMetricsChartData = selectedReport?.quality_metrics ? {
    labels: ['Word Count', 'Readability', 'Grade Level', 'Sentence Length'],
    datasets: [{
      label: 'Quality Metrics',
      data: [
        Math.min(selectedReport.quality_metrics.word_count / 10, 100),
        selectedReport.quality_metrics.readability_score,
        Math.min(selectedReport.quality_metrics.grade_level * 10, 100),
        Math.min(selectedReport.quality_metrics.avg_sentence_length * 4, 100)
      ],
      backgroundColor: ['#60A5FA', '#34D399', '#FBBF24', '#F87171'],
      borderColor: ['#2563EB', '#059669', '#D97706', '#B91C1C'],
      borderWidth: 1
    }]
  } : null;

  // Chart.js data for Criteria Coverage
  const criteriaCoverageChartData = selectedReport?.semantic_analysis ? {
    labels: Object.keys(selectedReport.semantic_analysis).slice(0, 5).map(c => c.length > 20 ? c.slice(0, 20) + '...' : c),
    datasets: [{
      label: 'Coverage Score (%)',
      data: Object.values(selectedReport.semantic_analysis).slice(0, 5).map((analysis: any) => analysis.coverage_score * 100),
      backgroundColor: '#93C5FD',
      borderColor: '#3B82F6',
      borderWidth: 1
    }]
  } : null;
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      position: 'top' as const,
      labels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        color: '#1F2937'
      }
    },
    title: { 
      display: true, 
      font: {
        size: 16,
        family: "'Inter', sans-serif",
        weight: 600 // Changed from '600' to 600 (numeric)
      },
      color: '#1F2937'
    },
    tooltip: { 
      enabled: true,
      backgroundColor: '#1F2937',
      titleFont: {
        family: "'Inter', sans-serif"
      },
      bodyFont: {
        family: "'Inter', sans-serif"
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: selectedReport?.quality_metrics ? getMaxChartValue([
        Math.min(selectedReport.quality_metrics.word_count / 10, 100),
        selectedReport.quality_metrics.readability_score,
        Math.min(selectedReport.quality_metrics.grade_level * 10, 100),
        Math.min(selectedReport.quality_metrics.avg_sentence_length * 4, 100)
      ]) : 100,
      title: { 
        display: true, 
        text: 'Score',
        font: {
          size: 12,
          family: "'Inter', sans-serif",
          weight: 500 // Changed from '500' to 500 (numeric)
        },
        color: '#1F2937'
      },
      grid: {
        color: '#E5E7EB'
      },
      ticks: {
        color: '#1F2937'
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#1F2937',
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        }
      }
    }
  }
};
  if (!user || user.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 text-xl font-semibold">
            Error: Unauthorized access
          </div>
          <p className="text-gray-600 mt-2">This page is restricted to teachers only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {loading && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center z-50">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          </div>
        )}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-3xl p-10 mb-10 text-white shadow-2xl">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BarChart2 className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Grading Dashboard</h1>
                <p className="text-blue-100 text-lg max-w-2xl mt-2">
                  Comprehensive AI analysis for student assignments with detailed insights and visualizations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 shadow-sm border border-red-100">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <Card className="mb-10 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Selection Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => {
              setSelectedAssignment(value);
              fetchReports(value);
            }}>
              <SelectTrigger className="w-full max-w-md border-gray-200 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Choose an assignment" />
              </SelectTrigger>
              <SelectContent>
                {assignments.map(assignment => (
                  <SelectItem key={assignment._id} value={assignment._id}>
                    {assignment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reports.map(report => (
              <Card key={report.submissionId} className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="truncate">{report.studentName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Submitted: {new Date(report.submittedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    AI Grade: <span className="font-medium text-blue-600">{report.aiGrade.finalScore}</span>/{report.aiGrade.percentage}%
                  </p>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 w-full transition-colors duration-200"
                    onClick={() => fetchReportDetails(report.submissionId)}
                    disabled={loading}
                  >
                    View Full Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedReport && (
          <Card className="mt-10 bg-white rounded-2xl shadow-lg border border-gray-100">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-800">AI Grading Report</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedReport.final_score !== undefined && selectedReport.percentage !== undefined ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary</h3>
                      <div className="space-y-2 text-gray 600">
                        <p><span className="font-medium">Final Score:</span> {selectedReport.final_score}/{selectedReport.percentage}%</p>
                        <p><span className="font-medium">Filename:</span> {selectedReport.filename || 'N/A'}</p>
                        <p><span className="font-medium">Analysis Date:</span> {selectedReport.timestamp || 'N/A'}</p>
                        <p><span className="font-medium">Criteria:</span> {Array.isArray(selectedReport.criteria) && selectedReport.criteria.length > 0 ? selectedReport.criteria.join(', ') : 'No criteria available'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Score Breakdown</h3>
                      <div className="space-y-2 text-gray-600">
                        {selectedReport.score_breakdown && Object.entries(selectedReport.score_breakdown).map(([key, value]: [string, any], i: number) => (
                          <p key={i}><span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</span> {value}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Comprehensive Feedback</h3>
                    {selectedReport.comprehensive_feedback ? (
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium text-gray-700">Overall Assessment:</p>
                          <p className="text-gray-600 bg-white p-4 rounded-lg shadow-sm">{selectedReport.comprehensive_feedback.overall_assessment || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Strengths:</p>
                          <ul className="list-disc list-inside text-gray-600 bg-white p-4 rounded-lg shadow-sm">
                            {selectedReport.comprehensive_feedback.strengths?.length ? (
                              selectedReport.comprehensive_feedback.strengths.map((s: string, i: number) => (
                                <li key={i} className="mb-1">{s}</li>
                              ))
                            ) : (
                              <li>No strengths provided</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Weaknesses:</p>
                          <ul className="list-disc list-inside text-gray-600 bg-white p-4 rounded-lg shadow-sm">
                            {selectedReport.comprehensive_feedback.weaknesses?.length ? (
                              selectedReport.comprehensive_feedback.weaknesses.map((w: string, i: number) => (
                                <li key={i} className="mb-1">{w}</li>
                              ))
                            ) : (
                              <li>No weaknesses provided</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Suggestions:</p>
                          <ul className="list-disc list-inside text-gray-600 bg-white p-4 rounded-lg shadow-sm">
                            {selectedReport.comprehensive_feedback.suggestions?.length ? (
                              selectedReport.comprehensive_feedback.suggestions.map((s: string, i: number) => (
                                <li key={i} className="mb-1">{s}</li>
                              ))
                            ) : (
                              <li>No suggestions provided</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No comprehensive feedback available</p>
                    )}
                  </div>

                  {selectedReport.plots && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Visual Analysis</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {qualityMetricsChartData && (
                          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                            <p className="text-sm font-medium text-gray-600 mb-3">Quality Metrics</p>
                            <div className="h-80">
                              <Bar
                                data={qualityMetricsChartData}
                                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Text Quality Metrics' } } }}
                              />
                            </div>
                          </div>
                        )}
                        {criteriaCoverageChartData && (
                          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                            <p className="text-sm font-medium text-gray-600 mb-3">Criteria Coverage</p>
                            <div className="h-80">
                              <Bar
                                data={criteriaCoverageChartData}
                                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Criteria Coverage Analysis' } } }}
                              />
                            </div>
                          </div>
                        )}
                        {selectedReport.plots.word_cloud && (
                          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                            <p className="text-sm font-medium text-gray-600 mb-3">Word Frequency</p>
                            <img
                              src={`data:image/png;base64,${selectedReport.plots.word_cloud}`}
                              alt="Word Cloud"
                              className="max-w-full rounded-lg shadow-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quality Metrics</h3>
                    {selectedReport.quality_metrics ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(selectedReport.quality_metrics).map(([key, value]: [string, any], i: number) => (
                          <li key={i} className="bg-white p-3 rounded-lg shadow-sm">
                            <span className="font-medium text-gray-700">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</span> {value}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No quality metrics available</p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Style Metrics</h3>
                    {selectedReport.style_metrics ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(selectedReport.style_metrics)
                          .filter(([key]) => key !== 'word_frequency_distribution') // Filter out word_frequency_distribution
                          .map(([key, value]: [string, any], i: number) => (
                            <li key={i} className="bg-white p-3 rounded-lg shadow-sm">
                              <span className="font-medium text-gray-700">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</span> {typeof value === 'number' && key !== 'complex_words' && key !== 'simple_words' && key !== 'paragraph_count' && key !== 'passive_voice_count' && key !== 'question_count' && key !== 'exclamation_count' && key !== 'transition_words' ? value.toFixed(2) : value}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No style metrics available</p>
                    )}
                  </div>

                  {selectedReport.semantic_analysis && (
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Criteria Analysis</h3>
                      <div className="space-y-6">
                        {Object.entries(selectedReport.semantic_analysis).map(([criterion, analysis]: [string, any], i: number) => (
                          <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="font-medium text-gray-700">{criterion}</p>
                            <div className="mt-2 text-gray-600 space-y-1">
                              <p>Max Similarity: {analysis.max_similarity?.toFixed(2) || 'N/A'}</p>
                              <p>Average Similarity: {analysis.avg_similarity?.toFixed(2) || 'N/A'}</p>
                              <p>Coverage Score: {analysis.coverage_score?.toFixed(2) || 'N/A'}</p>
                              <p className="font-medium mt-2">Relevant Sentences:</p>
                              <ul className="list-disc list-inside">
                                {analysis.relevant_sentences?.length ? (
                                  analysis.relevant_sentences.map((s: string, j: number) => (
                                    <li key={j} className="mb-1">{s}</li>
                                  ))
                                ) : (
                                  <li>No relevant sentences provided</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedReport.sentiment_analysis && (
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Analysis</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p className="bg-white p-3 rounded-lg shadow-sm"><span className="font-medium text-gray-700">Positive Ratio:</span> {(selectedReport.sentiment_analysis.positive_ratio * 100)?.toFixed(1) || 'N/A'}%</p>
                        <p className="bg-white p-3 rounded-lg shadow-sm"><span className="font-medium text-gray-700">Neutral Ratio:</span> {(selectedReport.sentiment_analysis.neutral_ratio * 100)?.toFixed(1) || 'N/A'}%</p>
                        <p className="bg-white p-3 rounded-lg shadow-sm"><span className="font-medium text-gray-700">Negative Ratio:</span> {(selectedReport.sentiment_analysis.negative_ratio * 100)?.toFixed(1) || 'N/A'}%</p>
                        <p className="bg-white p-3 rounded-lg shadow-sm"><span className="font-medium text-gray-700">Overall Tone:</span> {selectedReport.sentiment_analysis.overall_tone?.replace(/\b\w/g, c => c.toUpperCase()) || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-500">Error: Incomplete report data</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherAIGradeView;