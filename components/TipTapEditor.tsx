'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { useCallback } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

const MenuButton = ({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
      active
        ? 'bg-teal-600 text-white'
        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
    }`}
  >
    {children}
  </button>
);

export default function TipTapEditor({ content, onChange, editable = true }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content,
    editable,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
          {/* Text formatting */}
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <strong>B</strong>
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <em>I</em>
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
            <span className="underline">U</span>
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
            <span className="line-through">S</span>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
            active={editor.isActive('highlight')}
            title="Highlight"
          >
            <span className="bg-yellow-200 px-1">H</span>
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

          {/* Headings */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            H1
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            H2
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            H3
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

          {/* Lists */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            &bull; List
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            1. List
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

          {/* Table */}
          <MenuButton onClick={addTable} title="Insert Table">
            Table
          </MenuButton>
          {editor.isActive('table') && (
            <>
              <MenuButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column">
                +Col
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row">
                +Row
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column">
                -Col
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">
                -Row
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
                Del Table
              </MenuButton>
            </>
          )}

          <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

          {/* Block */}
          <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
            &ldquo; Quote
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
            &#x2015;
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

          {/* Undo/Redo */}
          <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
            Undo
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
            Redo
          </MenuButton>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Styles for table rendering */}
      <style jsx global>{`
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.75rem;
          text-align: left;
          font-size: 0.875rem;
        }
        .ProseMirror th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        .ProseMirror tr:hover td {
          background-color: #f9fafb;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #0d9488;
          padding-left: 1rem;
          color: #4b5563;
          margin: 1em 0;
        }
        .ProseMirror h1 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .ProseMirror h3 { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5rem; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; }
        .ProseMirror p { margin: 0.5em 0; }
        .ProseMirror mark { padding: 0.125rem 0.25rem; border-radius: 0.125rem; }
        .ProseMirror .selectedCell { background-color: #dbeafe; }
      `}</style>
    </div>
  );
}
