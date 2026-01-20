import type { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Props = {
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly onClick: () => void;
  readonly disabled?: boolean;
};

export const ModeCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  disabled,
}: Props) => (
  <Card
    className={`w-full max-w-sm cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${disabled ? 'opacity-50 cursor-not-allowed hover:transform-none' : ''}`}
    onClick={disabled ? undefined : onClick}
  >
    <CardHeader>
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
        <Icon size={24} />
      </div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);
