import { useEffect, useMemo, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Highlighter,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaPicker } from '@/features/admin/media/components/MediaPicker'
import { mediaRecordsToItems } from '@/features/admin/media/components/media-utils'
import {
  useMediaList,
  useCreateMedia,
  useCreateMediaFolder,
  useDeleteMedia,
  useMediaSettings,
  useUpdateMedia,
} from '@/features/admin/media/hooks/useMediaSettings'
import type { MediaLabels } from '@/features/admin/media/components/types'

export const defaultTiptapContent = '<p>Nhập nội dung tại đây...</p>'

const editorMediaLabels: MediaLabels = {
  allFiles: 'Tất cả tệp',
  unclassified: 'Chưa phân loại',
  banner: 'Banner',
  logo: 'Logo',
  documents: 'Tài liệu',
  other: 'Khác',
  trash: 'Thùng rác',
  allFilesBreadcrumb: 'Tất cả tệp',
  search: 'Tìm kiếm',
  newFolder: 'Thư mục mới',
  upload: 'Tải lên',
  allTypes: 'Tất cả loại',
  allSizes: 'Tất cả kích thước',
  uploadedAt: 'Ngày tải lên',
  filter: 'Lọc',
  list: 'Danh sách',
  grid: 'Lưới',
  fileInfo: 'Thông tin tệp',
  selectFile: 'Chọn tệp',
  filePath: 'Đường dẫn',
  fileSize: 'Kích thước',
  imageSize: 'Kích thước ảnh',
  uploadedBy: 'Người tải lên',
  actions: 'Thao tác',
  download: 'Tải xuống',
  edit: 'Chỉnh sửa',
  rename: 'Đổi tên',
  move: 'Di chuyển',
  delete: 'Xóa',
  noFiles: 'Không có tệp',
  usedStorage: 'Dung lượng đã dùng',
  manageStorage: 'Quản lý dung lượng',
  fileType: 'Loại tệp',
  folder: 'Thư mục',
  file: 'Tệp',
  loadMore: 'Tải thêm',
  selectMultiple: 'Chọn nhiều',
  cancelSelect: 'Hủy',
  deleteSelected: 'Xóa đã chọn',
  selectedCount: 'Đã chọn',
  copyLink: 'Sao chép liên kết',
}

const ResizableImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      width: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute('data-width') ?? element.getAttribute('width'),
        renderHTML: (attributes) =>
          attributes.width ? { 'data-width': attributes.width } : {},
      },
      align: {
        default: 'left',
        parseHTML: (element) => element.getAttribute('data-align') ?? 'left',
        renderHTML: (attributes) => ({ 'data-align': attributes.align }),
      },
    }
  },
  renderHTML({ HTMLAttributes }) {
    const width = HTMLAttributes['data-width']
    const align = HTMLAttributes['data-align'] ?? 'left'
    const alignmentStyle =
      align === 'center'
        ? 'margin-left:auto;margin-right:auto;'
        : align === 'right'
          ? 'margin-left:auto;margin-right:0;'
          : 'margin-left:0;margin-right:auto;'
    return [
      'img',
      {
        ...HTMLAttributes,
        style: `${width ? `width:${width};` : ''}max-width:100%;height:auto;display:block;${alignmentStyle}`,
      },
    ]
  },
})

export function TiptapEditor({
  content = defaultTiptapContent,
  placeholder = 'Nhập nội dung...',
  onChange,
}: {
  content?: string
  placeholder?: string
  onChange?: (value: string) => void
}) {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const mediaQuery = useMediaList()
  const mediaSettingsQuery = useMediaSettings()
  const createMedia = useCreateMedia()
  const createFolder = useCreateMediaFolder()
  const updateMedia = useUpdateMedia()
  const deleteMedia = useDeleteMedia()
  const mediaItems = useMemo(
    () =>
      mediaRecordsToItems(
        mediaQuery.data?.pages.flatMap((page) => page.items) ?? [],
        mediaQuery.data?.pages.flatMap((page) => page.folders) ?? [],
      ),
    [mediaQuery.data?.pages],
  )
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit bundles Link in the current Tiptap version. Disable it
      // here because the editor registers a configured Link extension below.
      StarterKit.configure({ link: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      ResizableImage.configure({ allowBase64: false }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
    ],
    content,
    onUpdate: ({ editor: nextEditor }) => onChange?.(nextEditor.getHTML()),
  })
  const editorSelection = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      isImageSelected: currentEditor?.isActive('image') ?? false,
      imageWidth: currentEditor?.getAttributes('image').width ?? '100%',
    }),
  })

  useEffect(() => {
    if (!editor || editor.getHTML() === content) return
    editor.commands.setContent(content, { emitUpdate: false })
  }, [content, editor])

  if (!editor) return null

  const isImageSelected = editorSelection?.isImageSelected ?? false
  const selectedImageWidth = editorSelection?.imageWidth ?? '100%'

  const insertMediaImage = (item: {
    url?: string
    path: string
    name: string
  }) => {
    const src = item.url || item.path
    if (!src || src.startsWith('data:')) return
    editor.chain().focus().setImage({ src, alt: item.name }).run()
    setIsMediaPickerOpen(false)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-1 border-b bg-white p-2 dark:border-slate-700 dark:bg-slate-950">
        <Select
          defaultValue="paragraph"
          onValueChange={(value) => {
            if (value === 'paragraph')
              editor.chain().focus().setParagraph().run()
            if (value.startsWith('heading-')) {
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: Number(value.split('-')[1]) as 1 | 2 | 3 | 4 | 5 | 6,
                })
                .run()
            }
          }}
        >
          <SelectTrigger className="h-8 w-36 border-0 bg-transparent text-xs shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Đoạn văn</SelectItem>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <SelectItem key={level} value={`heading-${level}`}>
                Tiêu đề {level} (H{level})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToolbarButton
          label="B"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="I"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="U"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          icon={<Quote className="size-4" />}
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={<List className="size-4" />}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={<ListOrdered className="size-4" />}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={<Highlighter className="size-4" />}
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />
        <ToolbarButton
          icon={<ImageIcon className="size-4" />}
          onClick={() => setIsMediaPickerOpen(true)}
        />
        <label
          className="flex cursor-pointer items-center gap-1 rounded p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Màu chữ"
        >
          <span className="text-xs font-semibold">A</span>
          <input
            type="color"
            aria-label="Màu chữ"
            className="size-5 cursor-pointer border-0 bg-transparent p-0"
            value={editor.getAttributes('textStyle').color ?? '#0f172a'}
            onChange={(event) =>
              editor.chain().focus().setColor(event.target.value).run()
            }
          />
        </label>
        <ToolbarButton
          label="A̶"
          onClick={() => editor.chain().focus().unsetColor().run()}
        />
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
        <ToolbarButton
          icon={<AlignLeft className="size-4" />}
          onClick={() =>
            editor.isActive('image')
              ? editor
                  .chain()
                  .focus()
                  .updateAttributes('image', { align: 'left' })
                  .run()
              : editor.chain().focus().setTextAlign('left').run()
          }
        />
        <ToolbarButton
          icon={<AlignCenter className="size-4" />}
          onClick={() =>
            editor.isActive('image')
              ? editor
                  .chain()
                  .focus()
                  .updateAttributes('image', { align: 'center' })
                  .run()
              : editor.chain().focus().setTextAlign('center').run()
          }
        />
        <ToolbarButton
          icon={<AlignRight className="size-4" />}
          onClick={() =>
            editor.isActive('image')
              ? editor
                  .chain()
                  .focus()
                  .updateAttributes('image', { align: 'right' })
                  .run()
              : editor.chain().focus().setTextAlign('right').run()
          }
        />
        <div className="ml-1 flex items-center gap-1 border-l pl-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <span>Kích thước ảnh</span>
          <Select
            value={selectedImageWidth}
            disabled={!isImageSelected}
            onValueChange={(value) => {
              if (isImageSelected)
                editor
                  .chain()
                  .focus()
                  .updateAttributes('image', {
                    width: value === '100%' ? null : value,
                  })
                  .run()
            }}
          >
            <SelectTrigger className="h-8 w-28 border-0 bg-transparent text-xs shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25%">25%</SelectItem>
              <SelectItem value="50%">50%</SelectItem>
              <SelectItem value="75%">75%</SelectItem>
              <SelectItem value="100%">100%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
        <ToolbarButton
          icon={<Undo2 className="size-4" />}
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          icon={<Redo2 className="size-4" />}
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>
      <div className="w-full overflow-auto">
        <EditorContent
          editor={editor}
          placeholder={placeholder}
          className="w-full min-h-64 bg-white dark:bg-slate-950 [&_.ProseMirror]:min-h-64 [&_.ProseMirror]:w-full [&_.ProseMirror]:p-8 [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_p]:text-sm [&_.ProseMirror_p]:leading-7 [&_.ProseMirror_h1]:mb-5 [&_.ProseMirror_h1]:text-4xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:mb-4 [&_.ProseMirror_h2]:text-3xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h3]:mb-3 [&_.ProseMirror_h3]:text-2xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h4]:mb-3 [&_.ProseMirror_h4]:text-xl [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_h5]:mb-2 [&_.ProseMirror_h5]:text-lg [&_.ProseMirror_h5]:font-semibold [&_.ProseMirror_h6]:mb-2 [&_.ProseMirror_h6]:text-base [&_.ProseMirror_h6]:font-semibold [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_img]:my-4 [&_.ProseMirror_img]:max-h-80 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:object-contain [&_.ProseMirror_.ProseMirror-selectednode]:rounded-md [&_.ProseMirror_.ProseMirror-selectednode]:ring-2 [&_.ProseMirror_.ProseMirror-selectednode]:ring-primary [&_.ProseMirror_.ProseMirror-selectednode]:ring-offset-2"
        />
      </div>
      <div className="border-t bg-white px-3 py-1 text-right text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-950">
        145/5000
      </div>
      <MediaPicker
        open={isMediaPickerOpen}
        imageOnly
        items={mediaItems}
        labels={editorMediaLabels}
        title="Chọn hình ảnh"
        closeLabel="Đóng"
        hasMore={mediaQuery.hasNextPage}
        isLoadingMore={mediaQuery.isFetchingNextPage}
        onLoadMore={() => void mediaQuery.fetchNextPage()}
        onCreateMedia={(item) =>
          createMedia.mutateAsync({
            name: item.name,
            originalName: item.name,
            path: item.path,
            url: item.url ?? `/images/${item.name}`,
            storageMode: mediaSettingsQuery.data?.storageMode ?? 'SOURCE',
            mimeType: item.mimeType ?? 'application/octet-stream',
            extension: item.name.split('.').pop() ?? '',
            size: item.size ?? 0,
            folder: item.path.split('/').slice(0, -1).join('/') || '/',
            data: item.data,
          })
        }
        onCreateFolder={(folder) =>
          createFolder
            .mutateAsync({
              name: folder.name,
              parentPath: folder.parentPath,
              storageMode: mediaSettingsQuery.data?.storageMode ?? 'SOURCE',
            })
            .then(() => undefined)
        }
        onRenameMedia={(item, name) =>
          updateMedia.mutateAsync({ id: item.id, name })
        }
        onDeleteMedia={(item) =>
          deleteMedia.mutateAsync({ id: item.id }).then(() => undefined)
        }
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={insertMediaImage}
      />
    </div>
  )
}

function ToolbarButton({
  label,
  icon,
  active,
  disabled,
  onClick,
}: {
  label?: string
  icon?: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`rounded p-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800'}`}
    >
      {label ?? icon}
    </button>
  )
}
