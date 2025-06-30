import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Content {
  _id: string;
  title: string;
  subject: string;
  type: string;
  filePath: string;
}

const EditContent: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', subject: '', file: null as File | null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`http://localhost:5009/api/content/${id}`);
        if (!response.ok) throw new Error('Failed to fetch content');
        const data: Content = await response.json();
        setFormData({ title: data.title, subject: data.subject, file: null });
      } catch (err: any) {
        setError(err.message || 'Error fetching content');
      }
    };
    fetchContent();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.subject) {
      setError('Please fill all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    if (formData.file) data.append('file', formData.file);

    try {
      const response = await fetch(`http://localhost:5009/api/content/${id}`, {
        method: 'PUT',
        body: data,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update content');
      }
      alert('Content updated successfully');
      navigate('/create'); // Updated to navigate to TeacherCreateContent
    } catch (err: any) {
      setError(err.message || 'Error updating content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Content</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="p-4 bg-red-50 text-red-800 rounded-lg">{error}</div>}
          <div className="space-y-4">
            <Input
              placeholder="Content Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
            />
            <Input
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              disabled={loading}
            />
            <Input type="file" onChange={handleFileChange} disabled={loading} />
            <div className="flex space-x-2">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Updating...' : 'Update'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/create')} disabled={loading}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditContent;