import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useCallback } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
}

export function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          className: 'text-amber-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 bg-gray-50 border border-gray-200 rounded-lg',
      },
    },
  })

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL', previousUrl || '')

    if (url === null) return

    if (url === '') {
      editor?.chain().focus().unsetLink().run()
      return
    }

    editor?.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {editable && (
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().toggleBold()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-amber-100 text-amber-700' : 'text-gray-600'}`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().toggleItalic()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-amber-100 text-amber-700' : 'text-gray-600'}`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-amber-100 text-amber-700' : 'text-gray-600'}`}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor.isActive('orderedList') ? 'bg-amber-100 text-amber-700' : 'text-gray-600'}`}
            title="Numbered List"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-amber-100 text-amber-700' : 'text-gray-600'}`}
            title="Heading"
          >
            H
          </button>
          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor.isActive('link') ? 'bg-amber-100 text-amber-700' : 'text-gray-600'}`}
            title="Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={addImage}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"
            title="Image"
          >
            🖼
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}