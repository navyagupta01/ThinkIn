import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LessonPlanGenerator: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [sessions, setSessions] = useState<number>(4);
  const [details, setDetails] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const generatePPT = async () => {
    if (!topic || !sessions) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter a topic and number of sessions.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, sessions, details }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate presentation.');
      }

      const blob = await response.blob();
      let filename = 'lesson_slides.zip';

      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      if (filename === 'lesson_slides.zip' && topic) {
        const sanitizedTopic = topic.replace(/[<>:"/\\|?*]/g, '_').trim();
        filename = `${sanitizedTopic}_Course_Materials.zip`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: `Successfully generated ${sessions} presentation(s) for "${topic}"!`,
      });
    } catch (err) {
      console.error('Generation error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-intel-blue" />
            Lesson Plan Generator
          </CardTitle>
          <CardDescription>
            Generate teaching slides from a simple plan of action.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-medium">
              Topic
            </Label>
            <Input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessions" className="text-sm font-medium">
              Number of Sessions
            </Label>
            <Input
              id="sessions"
              type="number"
              min="1"
              max="20"
              value={sessions}
              onChange={(e) => setSessions(parseInt(e.target.value) || 1)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-medium">
              Additional Details (optional)
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. include real-life examples, 7th grade, add MCQs"
              className="w-full h-24"
            />
          </div>

          <Button
            onClick={generatePPT}
            disabled={loading || !topic.trim()}
            className="w-full bg-intel-blue hover:bg-intel-darkblue text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate PPT 🎉'
            )}
          </Button>

          {loading && (
            <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
              <p>⏳ Creating {sessions} presentation(s) for "{topic}"...</p>
              <p>This may take a few minutes depending on the complexity.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonPlanGenerator;