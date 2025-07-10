import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  Upload, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  AlertCircle,
  FilePlus,
  Edit,
  Save,
  BarChart2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const API_URL = 'http://localhost:5002/api';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  files: { filename: string; path: string; originalName: string }[];
  criteria: string[];
  maxScore: number;
}

interface Submission {
  _id: string;
  assignmentId: { _id: string; title: string; maxScore: number };
  studentId: string;
  studentName: string;
  files: { filename: string; path: string; originalName: string }[];
  submittedAt: string;
  aiGrade: { finalScore: number; percentage: number };
  teacherGrade?: number;
  teacherFeedback?: string;
  status: 'submitted' | 'graded';
}

interface Stats {
  totalAssignments: number;
  submittedAssignments: number;
  pendingAssignments: number;
  grades: {
    assignmentId: string;
    assignmentTitle: string;
    studentId: string;
    studentName: string;
    aiGrade: number;
    teacherGrade?: number;
    percentage: number;
  }[];
}

const Assignments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    deadline: '',
    files: [] as File[],
    criteria: '',
    maxScore: '100'
  });
  const [submissionFiles, setSubmissionFiles] = useState<{ [key: string]: File[] }>({});
  const [submissionGrades, setSubmissionGrades] = useState<{ [key: string]: string }>({});
  const [submissionFeedbacks, setSubmissionFeedbacks] = useState<{ [key: string]: string }>({});
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAssignments();
    fetchSubmissions();
    fetchStats();
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

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/submissions`, {
        headers: {
          'x-user-id': user?.id,
          'x-user-role': user?.role,
          'x-user-name': user?.name
        }
      });
      setSubmissions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch submissions');
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.error || 'Failed to fetch submissions' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/stats`, {
        headers: {
          'x-user-id': user?.id,
          'x-user-role': user?.role,
          'x-user-name': user?.name
        }
      });
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch stats');
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.error || 'Failed to fetch stats' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!window.confirm('Are you sure you want to create this assignment?')) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('deadline', newAssignment.deadline);
      formData.append('criteria', newAssignment.criteria);
      formData.append('maxScore', newAssignment.maxScore);
      formData.append('userId', user!.id);
      newAssignment.files.forEach(file => formData.append('files', file));
      await axios.post(`${API_URL}/assignments`, formData, {
        headers: {
          'x-user-id': user?.id,
          'x-user-role': user?.role,
          'x-user-name': user?.name,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewAssignment({ title: '', description: '', deadline: '', files: [], criteria: '', maxScore: '100' });
      fetchAssignments();
      toast({ title: 'Success', description: 'Assignment created successfully' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create assignment');
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.error || 'Failed to create assignment' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setNewAssignment({
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline.split('T')[0],
      files: [],
      criteria: assignment.criteria.join('\n'),
      maxScore: assignment.maxScore.toString()
    });
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignment || !window.confirm('Are you sure you want to update this assignment?')) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('deadline', newAssignment.deadline);
      formData.append('criteria', newAssignment.criteria);
      formData.append('maxScore', newAssignment.maxScore);
      formData.append('userId', user!.id);
      newAssignment.files.forEach(file => formData.append('files', file));
      await axios.put(`${API_URL}/assignments/${editingAssignment._id}`, formData, {
        headers: {
          'x-user-id': user?.id,
          'x-user-role': user?.role,
          'x-user-name': user?.name,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewAssignment({ title: '', description: '', deadline: '', files: [], criteria: '', maxScore: '100' });
      setEditingAssignment(null);
      fetchAssignments();
      toast({ title: 'Success', description: 'Assignment updated successfully' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update assignment');
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.error || 'Failed to update assignment' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!submissionFiles[assignmentId]?.length) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select at least one file to submit' });
      return;
    }
    if (!window.confirm('Are you sure you want to submit this assignment?')) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('userId', user!.id);
      formData.append('userName', user!.name);
      submissionFiles[assignmentId]?.forEach(file => formData.append('files', file));
      await axios.post(`${API_URL}/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'x-user-id': user?.id,
          'x-user-role': user?.role,
          'x-user-name': user?.name,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSubmissionFiles(prev => ({ ...prev, [assignmentId]: [] }));
      fetchSubmissions();
      fetchStats();
      toast({ title: 'Success', description: 'Assignment submitted successfully' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit assignment');
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.error || 'Failed to submit assignment' });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    if (!submissionGrades[submissionId]) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a grade' });
      return;
    }
    if (!window.confirm('Are you sure you want to submit this grade?')) return;
    try {
      setLoading(true);
      await axios.put(`${API_URL}/submissions/${submissionId}/grade`, {
        teacherGrade: parseInt(submissionGrades[submissionId]),
        teacherFeedback: submissionFeedbacks[submissionId],
        userId: user!.id
      }, {
        headers: {
          'x-user-id': user?.id,
          'x-user-role': user?.role,
          'x-user-name': user?.name
        }
      });
      setSubmissionGrades(prev => ({ ...prev, [submissionId]: '' }));
      setSubmissionFeedbacks(prev => ({ ...prev, [submissionId]: '' }));
      fetchSubmissions();
      fetchStats();
      toast({ title: 'Success', description: 'Grade submitted successfully' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to grade submission');
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.error || 'Failed to grade submission' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium">
            Please log in to view assignments
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <Loader2 className="w-12 h-12 text-[#0071c5] animate-spin" />
        </div>
      )}
      <div className="relative bg-gradient-to-r from-[#0071c5] via-[#004494] to-[#002c5f] rounded-3xl p-8 mb-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Sparkles className="w-32 h-32 text-white opacity-5" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">
              {user.role === 'teacher' ? 'Manage Assignments' : 'Your Assignments'}
            </h1>
          </div>
          <p className="text-[#a8d4f0] text-lg mb-6 max-w-2xl">
            {user.role === 'teacher'
              ? 'Create, monitor, and grade assignments to guide your students.'
              : 'View and submit assignments, and track your progress.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {user.role === 'teacher' ? (
        <div className="space-y-8">
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-[#0071c5]" />
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    placeholder="Enter assignment title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    placeholder="Enter assignment description"
                  />
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={newAssignment.deadline}
                    onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Criteria (one per line)</Label>
                  <Textarea
                    value={newAssignment.criteria}
                    onChange={(e) => setNewAssignment({ ...newAssignment, criteria: e.target.value })}
                    placeholder="Enter grading criteria, one per line"
                  />
                </div>
                <div>
                  <Label>Max Score</Label>
                  <Input
                    type="number"
                    value={newAssignment.maxScore}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxScore: e.target.value })}
                    placeholder="Enter maximum score"
                  />
                </div>
                <div>
                  <Label>Files</Label>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.docx"
                    onChange={(e) => setNewAssignment({ ...newAssignment, files: Array.from(e.target.files || []) })}
                  />
                </div>
                <Button
                  className="bg-[#0071c5] hover:bg-[#004494] text-white"
                  onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : editingAssignment ? (
                    <Save className="w-4 h-4 mr-2" />
                  ) : (
                    <FilePlus className="w-4 h-4 mr-2" />
                  )}
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {assignments.map(assignment => (
              <Card key={assignment._id} className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#0071c5]" />
                      {assignment.title}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(assignment)}
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Link to={`/teacher-ai-grades?assignmentId=${assignment._id}`}>
                        <Button
                          className="bg-[#0071c5] hover:bg-[#004494] text-white"
                          disabled={loading}
                        >
                          <BarChart2 className="w-4 h-4 mr-2" />
                          View AI Grades
                        </Button>
                      </Link>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{assignment.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Deadline: {new Date(assignment.deadline).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Max Score: {assignment.maxScore}</p>
                  {submissions
                    .filter(s => s.assignmentId._id === assignment._id)
                    .map(submission => (
                      <div key={submission._id} className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Student: {submission.studentName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          AI Grade: {submission.aiGrade.finalScore}/{submission.aiGrade.percentage}%
                        </p>
                        {submission.status === 'graded' ? (
                          <p className="text-sm text-gray-600">
                            Teacher Grade: {submission.teacherGrade} | Feedback: {submission.teacherFeedback}
                          </p>
                        ) : (
                          <div className="mt-4 space-y-2">
                            <Label>Teacher Grade</Label>
                            <Input
                              type="number"
                              placeholder="Enter grade"
                              value={submissionGrades[submission._id] || ''}
                              onChange={(e) => setSubmissionGrades({
                                ...submissionGrades,
                                [submission._id]: e.target.value
                              })}
                            />
                            <Label>Feedback</Label>
                            <Textarea
                              placeholder="Enter feedback"
                              value={submissionFeedbacks[submission._id] || ''}
                              onChange={(e) => setSubmissionFeedbacks({
                                ...submissionFeedbacks,
                                [submission._id]: e.target.value
                              })}
                            />
                            <Button
                              className="bg-[#0071c5] hover:bg-[#004494] text-white"
                              onClick={() => handleGradeSubmission(submission._id)}
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4 mr-2" />
                              )}
                              Submit Grade
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {stats && (
            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#0071c5]" />
                  Assignment Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Assignments</p>
                    <p className="text-lg font-semibold">{stats.totalAssignments}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="text-lg font-semibold">{stats.submittedAssignments}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-lg font-semibold">{stats.pendingAssignments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {assignments.map(assignment => (
            <Card key={assignment._id} className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0071c5]" />
                  {assignment.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{assignment.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Deadline: {new Date(assignment.deadline).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Max Score: {assignment.maxScore}</p>
                {submissions.some(s => s.assignmentId._id === assignment._id) ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Status: Submitted</p>
                    {submissions
                      .filter(s => s.assignmentId._id === assignment._id)
                      .map(s => (
                        <div key={s._id}>
                          <p className="text-sm text-gray-600">
                            AI Grade: {s.aiGrade.finalScore}/{s.aiGrade.percentage}%
                          </p>
                          {s.status === 'graded' && (
                            <p className="text-sm text-gray-600">
                              Teacher Grade: {s.teacherGrade} | Feedback: {s.teacherFeedback}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <Label>Upload Submission</Label>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.docx"
                      onChange={(e) => setSubmissionFiles({
                        ...submissionFiles,
                        [assignment._id]: Array.from(e.target.files || [])
                      })}
                    />
                    <Button
                      className="bg-[#0071c5] hover:bg-[#004494] text-white"
                      onClick={() => handleSubmitAssignment(assignment._id)}
                      disabled={loading || !submissionFiles[assignment._id]?.length}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Submit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assignments;