import { Metadata } from 'next';
import { MathQuestPage } from '@/components/MathQuestPage';

export const metadata: Metadata = {
  title: 'Kids Math Quest 🏆 - Adventure Challenges & Star Rewards',
  description: 'Embark on a fun math adventure! Solve Grade 3 multiplication, division, addition, and subtraction problems, build win streaks, and earn stars.',
};

export default function QuestRoute() {
  return <MathQuestPage />;
}
