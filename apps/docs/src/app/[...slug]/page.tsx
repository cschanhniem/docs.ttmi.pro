import { notFound } from 'next/navigation';
import { getDocBySlug, getAllDocs } from '@/lib/docs';
import { DocLayout } from '@/components/doc-layout';
import { MDXContent } from '@/components/mdx-content';

interface DocPageProps {
  params: {
    slug: string[];
  };
}

export async function generateStaticParams() {
  try {
    const docs = getAllDocs();

    return docs.map((doc) => ({
      slug: doc.slug.split('/'),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [
      { slug: ['getting-started'] }
    ];
  }
}

export async function generateMetadata({ params }: DocPageProps) {
  const doc = getDocBySlug(params.slug);

  if (!doc) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: `${doc.meta.title} | ERP Documentation`,
    description: doc.meta.description,
  };
}

export default function DocPage({ params }: DocPageProps) {
  const doc = getDocBySlug(params.slug);

  if (!doc) {
    notFound();
  }

  return (
    <DocLayout>
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <header className="mb-8">
          <h1 className="mb-2">{doc.meta.title}</h1>
          {doc.meta.description && (
            <p className="text-xl text-muted-foreground">{doc.meta.description}</p>
          )}
          {doc.meta.date && (
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(doc.meta.date).toLocaleDateString()}
            </p>
          )}
        </header>

        <MDXContent content={doc.content} />
      </article>
    </DocLayout>
  );
}
