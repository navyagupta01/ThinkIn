
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-intel-blue bg-opacity-10 dark:bg-intel-blue dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Construction className="h-8 w-8 text-intel-blue dark:text-intel-lightblue" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This feature is coming soon! We're working hard to bring you the best learning experience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
