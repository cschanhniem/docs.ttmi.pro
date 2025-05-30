import { redirect } from 'next/navigation';
import { getAllDocs } from '@/lib/docs';

export default function HomePage() {
  try {
    const docs = getAllDocs();

    // Redirect to the first available document or getting started
    if (docs.length > 0) {
      const firstDoc = docs.find(doc => doc.slug === 'getting-started') || docs[0];
      redirect(`/${firstDoc.slug}`);
    }
  } catch (error) {
    console.error('Error loading docs:', error);
  }

  // If no docs exist, redirect to a default page
  redirect('/getting-started');
}
