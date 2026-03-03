'use client';

import { useEffect, useState } from 'react';
import { defaultContent, type EditableContent } from '@/lib/editableContent';

export function useEditableContent() {
  const [content, setContent] = useState<EditableContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/content');
        if (!response.ok) {
          throw new Error('Failed to load content');
        }
        const data = (await response.json()) as EditableContent;
        if (isMounted) {
          setContent(data);
        }
      } catch {
        if (isMounted) {
          setError('Failed to load content');
          setContent(defaultContent);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return { content, loading, error };
}
