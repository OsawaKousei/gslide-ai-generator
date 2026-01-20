import { useNavigate } from 'react-router-dom';
import { FilePlus, LayoutTemplate, PenTool } from 'lucide-react';
import { ModeCard } from '../components/ModeCard';
// import { useGeneratorStore } from '@/features/generator/stores/useGeneratorStore';
// import { useEffect } from 'react';

export const ModeSelectorWidget = () => {
  const navigate = useNavigate();
  // const reset = useGeneratorStore((s) => s.actions.reset); // TODO: Add reset action to store

  // useEffect(() => {
  //   reset();
  // }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 bg-gray-50">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Create New Presentation
        </h1>
        <p className="text-lg text-gray-600">
          Select how you want to start your new slide deck
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        <ModeCard
          title="Start from Scratch"
          description="Create a new presentation from a blank slate with AI assistance."
          icon={FilePlus}
          onClick={() => navigate('/create/scratch')}
          disabled={true}
        />
        <ModeCard
          title="Use Template"
          description="Generate slides based on an existing PowerPoint template."
          icon={LayoutTemplate}
          onClick={() => navigate('/create/template')}
        />
        <ModeCard
          title="Create Template"
          description="Design a new master template for future use."
          icon={PenTool}
          onClick={() => navigate('/create/new-template')}
          disabled={true}
        />
      </div>
    </div>
  );
};
