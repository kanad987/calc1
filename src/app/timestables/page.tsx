import { Metadata } from 'next';
import { TimesTablesPage } from '@/components/TimesTablesPage';

export const metadata: Metadata = {
  title: 'Times Tables Arena ✖️ - Grade 3 Multiplication Academy',
  description: 'Interactive times tables for Grade 3 kids. Features 1-12 multiplication tables, 12x12 matrix visual chart, flashcards quiz, and 60-second speed challenge.',
};

export default function TimesTablesRoute() {
  return <TimesTablesPage />;
}
