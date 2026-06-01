import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadFileApi, deleteFileApi } from '../../features/tasks/tasksApi'
import Button from '../ui/Button'
import toast from 'react-hot-toast'
import { clsx } from '../../utils/helpers'

export default function FileUpload({ taskId, attachments = [], onUpdate }) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (files) => {
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} exceeds 5MB`); continue }
      const form = new FormData()
      form.append('file', file)
      setUploading(true)
      try {
        const res = await uploadFileApi(taskId, form)
        toast.success(`${file.name} uploaded`)
        onUpdate?.(res.data.data.attachment)
      } catch { toast.error(`Failed to upload ${file.name}`) }
      finally { setUploading(false) }
    }
  }, [taskId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 5 * 1024 * 1024,
    accept: { 'image/*': [], 'application/pdf': [], 'text/*': [], 'application/msword': [], 'application/vnd.openxmlformats-officedocument.*': [] },
  })

  const handleDelete = async (attachmentId) => {
    try {
      await deleteFileApi(taskId, attachmentId)
      toast.success('File deleted')
      onUpdate?.()
    } catch { toast.error('Failed to delete file') }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
          isDragActive ? 'border-brand-500 bg-brand-600/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm text-slate-400">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-slate-400">{isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}</p>
            <p className="text-xs text-slate-600">Images, PDFs, Docs — Max 5MB</p>
          </div>
        )}
      </div>

      {/* File List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file) => (
            <div key={file._id} className="flex items-center justify-between p-3 glass rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-brand-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-300 truncate">{file.filename}</p>
                  <p className="text-xs text-slate-600">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={file.url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-500 hover:text-brand-400 hover:bg-brand-400/10 rounded transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
                <button onClick={() => handleDelete(file._id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}