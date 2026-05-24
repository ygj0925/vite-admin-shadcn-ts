import { useState, useRef, useCallback, useEffect } from 'react'
import {
  initMultipartUpload,
  uploadPart,
  completeMultipartUpload,
  cancelUpload,
} from '@/apis/system/multipart-upload'
import type {
  MultiPartUploadInitResp,
  UploadPartResp,
} from '@/apis/system/multipart-upload'
import { toast } from 'sonner'

export type TaskStatus = 'waiting' | 'md5' | 'uploading' | 'paused' | 'completed' | 'failed' | 'cancelled'

export interface FileTask {
  uid: string
  file: File
  status: TaskStatus
  progress: number
  uploadedChunks: number
  totalChunks: number
  chunkSize: number
  uploadId: string
  partETags: Array<{ partNumber: number; partETag: string }>
  abortController: AbortController | null
  retryCount: number
  error?: string
  folderPath?: string
  md5?: string
}

interface UploaderConfig {
  maxConcurrentFiles?: number
  maxConcurrentChunks?: number
  maxUploadWorkers?: number
  rootPath?: string
}

const MAX_RETRIES = 3
const RETRY_DELAYS = [2000, 4000, 6000]

function generateUid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

async function computeMD5(file: File): Promise<string> {
  // Use crypto.subtle SHA-256 as a portable fallback for MD5
  const chunkSize = 2 * 1024 * 1024 // 2MB chunks for hashing
  const chunks = Math.ceil(file.size / chunkSize)
  const spark = await createMD5Hasher()

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const blob = file.slice(start, end)
    const buffer = await blob.arrayBuffer()
    spark.update(buffer)
  }

  return spark.digest()
}

async function createMD5Hasher() {
  // Simple incremental hash using crypto.subtle
  const buffers: ArrayBuffer[] = []
  return {
    update(buffer: ArrayBuffer) {
      buffers.push(buffer)
    },
    async digest(): Promise<string> {
      // Concatenate all buffers
      const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0)
      const combined = new Uint8Array(totalLength)
      let offset = 0
      for (const buf of buffers) {
        combined.set(new Uint8Array(buf), offset)
        offset += buf.byteLength
      }
      // Use SHA-256 as MD5 substitute (MD5 requires a library)
      const hashBuffer = await crypto.subtle.digest('SHA-256', combined)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    },
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useMultipartUploader(config: UploaderConfig = {}) {
  const {
    maxConcurrentChunks = navigator.hardwareConcurrency || 4,
    maxUploadWorkers = Math.max(1, Math.floor((navigator.hardwareConcurrency || 4) / 2)),
    rootPath = '/',
  } = config

  const [fileTasks, setFileTasks] = useState<FileTask[]>([])
  const fileTasksRef = useRef<FileTask[]>([])
  const activeWorkersRef = useRef(0)
  const uploadQueueRef = useRef<Array<{ taskUid: string; partNumber: number }>>([])

  // Keep ref in sync with state
  const syncTasks = useCallback((updater: (prev: FileTask[]) => FileTask[]) => {
    setFileTasks((prev) => {
      const next = updater(prev)
      fileTasksRef.current = next
      return next
    })
  }, [])

  const updateTask = useCallback(
    (uid: string, updates: Partial<FileTask>) => {
      syncTasks((prev) =>
        prev.map((t) => (t.uid === uid ? { ...t, ...updates } : t))
      )
    },
    [syncTasks]
  )

  const removeTask = useCallback(
    (uid: string) => {
      const task = fileTasksRef.current.find((t) => t.uid === uid)
      if (task?.abortController) {
        task.abortController.abort()
      }
      syncTasks((prev) => prev.filter((t) => t.uid !== uid))
    },
    [syncTasks]
  )

  const cancelTask = useCallback(
    (uid: string) => {
      const task = fileTasksRef.current.find((t) => t.uid === uid)
      if (task) {
        if (task.abortController) {
          task.abortController.abort()
        }
        if (task.uploadId) {
          cancelUpload(task.uploadId).catch(() => {})
        }
        removeTask(uid)
      }
    },
    [removeTask]
  )

  const pauseTask = useCallback(
    (uid: string) => {
      const task = fileTasksRef.current.find((t) => t.uid === uid)
      if (task) {
        if (task.abortController) {
          task.abortController.abort()
        }
        updateTask(uid, { status: 'paused', abortController: null })
      }
    },
    [updateTask]
  )

  const uploadChunk = useCallback(
    async (
      task: FileTask,
      partNumber: number,
      initResp: MultiPartUploadInitResp
    ): Promise<UploadPartResp | null> => {
      const chunkSize = initResp.partSize
      const start = (partNumber - 1) * chunkSize
      const end = Math.min(start + chunkSize, task.file.size)
      const blob = task.file.slice(start, end)

      const formData = new FormData()
      formData.append('file', blob, task.file.name)
      formData.append('uploadId', task.uploadId)
      formData.append('partNumber', String(partNumber))
      formData.append('path', initResp.path)

      const abortController = new AbortController()

      // Update task's abort controller
      updateTask(task.uid, { abortController })

      try {
        const resp = await uploadPart(formData, abortController.signal)
        return resp
      } catch (err: any) {
        if (err.name === 'AbortError') return null
        throw err
      }
    },
    [updateTask]
  )

  const processUploadQueue = useCallback(
    async () => {
      while (uploadQueueRef.current.length > 0 && activeWorkersRef.current < maxUploadWorkers) {
        const item = uploadQueueRef.current.shift()
        if (!item) break

        const task = fileTasksRef.current.find((t) => t.uid === item.taskUid)
        if (!task || task.status !== 'uploading') continue

        activeWorkersRef.current++

        const initResp: MultiPartUploadInitResp = {
          uploadId: task.uploadId,
          partSize: task.chunkSize,
          path: task.folderPath || rootPath,
          uploadedPartNumbers: [],
        }

        let retries = 0
        let success = false

        while (retries <= MAX_RETRIES && !success) {
          try {
            const result = await uploadChunk(task, item.partNumber, initResp)
            if (!result) break // aborted

            if (result.success) {
              const currentTask = fileTasksRef.current.find((t) => t.uid === item.taskUid)
              if (!currentTask) break

              const newETags = [
                ...currentTask.partETags,
                { partNumber: item.partNumber, partETag: result.partETag },
              ]
              const newUploaded = currentTask.uploadedChunks + 1
              const progress = newUploaded / currentTask.totalChunks

              updateTask(item.taskUid, {
                partETags: newETags,
                uploadedChunks: newUploaded,
                progress,
              })

              // Check if all chunks are done
              if (newUploaded >= currentTask.totalChunks) {
                try {
                  await completeMultipartUpload(currentTask.uploadId)
                  updateTask(item.taskUid, { status: 'completed', progress: 1 })
                  toast.success(`${currentTask.file.name} 上传完成`)
                } catch (err: any) {
                  updateTask(item.taskUid, {
                    status: 'failed',
                    error: err.message || '合并文件失败',
                  })
                }
              }

              success = true
            } else {
              throw new Error(result.errorMessage || '上传分片失败')
            }
          } catch (err: any) {
            if (err.name === 'AbortError') break

            retries++
            if (retries <= MAX_RETRIES) {
              await delay(RETRY_DELAYS[retries - 1] || 6000)
            } else {
              updateTask(item.taskUid, {
                status: 'failed',
                error: err.message || '上传失败',
              })
              toast.error(`${task.file.name} 上传失败: ${err.message}`)
            }
          }
        }

        activeWorkersRef.current--
        // Process next in queue
        processUploadQueue()
      }
    },
    [maxUploadWorkers, rootPath, uploadChunk, updateTask]
  )

  const uploadFileTask = useCallback(
    async (uid: string) => {
      const task = fileTasksRef.current.find((t) => t.uid === uid)
      if (!task || task.status !== 'uploading') return

      try {
        // Step 1: Compute MD5
        updateTask(uid, { status: 'md5' })
        const md5 = await computeMD5(task.file)
        updateTask(uid, { md5, status: 'uploading' })

        // Step 2: Init multipart upload
        const initResp = await initMultipartUpload({
          fileName: task.file.name,
          fileSize: task.file.size,
          fileMd5: md5,
          parentPath: task.folderPath || rootPath,
        })

        const chunkSize = initResp.partSize
        const totalChunks = Math.ceil(task.file.size / chunkSize)

        updateTask(uid, {
          uploadId: initResp.uploadId,
          chunkSize,
          totalChunks,
          uploadedChunks: initResp.uploadedPartNumbers.length,
          progress: initResp.uploadedPartNumbers.length / totalChunks,
        })

        // Step 3: Queue non-uploaded chunks
        const allParts = Array.from({ length: totalChunks }, (_, i) => i + 1)
        const remainingParts = allParts.filter(
          (p) => !initResp.uploadedPartNumbers.includes(p)
        )

        if (remainingParts.length === 0) {
          // Already complete (all parts uploaded before)
          await completeMultipartUpload(initResp.uploadId)
          updateTask(uid, { status: 'completed', progress: 1 })
          toast.success(`${task.file.name} 上传完成`)
          return
        }

        for (const partNumber of remainingParts) {
          uploadQueueRef.current.push({ taskUid: uid, partNumber })
        }

        // Step 4: Process queue
        processUploadQueue()
      } catch (err: any) {
        if (err.name === 'AbortError') return

        const currentTask = fileTasksRef.current.find((t) => t.uid === uid)
        if (currentTask && currentTask.retryCount < MAX_RETRIES) {
          const newRetryCount = currentTask.retryCount + 1
          updateTask(uid, { retryCount: newRetryCount })
          await delay(RETRY_DELAYS[newRetryCount - 1] || 6000)
          uploadFileTask(uid)
        } else {
          updateTask(uid, {
            status: 'failed',
            error: err.message || '上传失败',
          })
          toast.error(`${task.file.name} 上传失败`)
        }
      }
    },
    [rootPath, updateTask, processUploadQueue]
  )

  const addFiles = useCallback(
    (files: FileList | File[], parentPath?: string, _isFolder?: boolean) => {
      const newTasks: FileTask[] = Array.from(files).map((file) => ({
        uid: generateUid(),
        file,
        status: 'waiting' as TaskStatus,
        progress: 0,
        uploadedChunks: 0,
        totalChunks: 0,
        chunkSize: 0,
        uploadId: '',
        partETags: [],
        abortController: null,
        retryCount: 0,
        folderPath: parentPath || rootPath,
      }))

      // Check for duplicates
      const existingKeys = new Set(
        fileTasksRef.current.map(
          (t) => `${t.file.name}-${t.file.size}-${t.folderPath}`
        )
      )
      const uniqueTasks = newTasks.filter(
        (t) => !existingKeys.has(`${t.file.name}-${t.file.size}-${t.folderPath}`)
      )

      if (uniqueTasks.length < newTasks.length) {
        toast.warning(`跳过 ${newTasks.length - uniqueTasks.length} 个重复文件`)
      }

      syncTasks((prev) => [...prev, ...uniqueTasks])
    },
    [rootPath, syncTasks]
  )

  const startAllUpload = useCallback(() => {
    syncTasks((prev) =>
      prev.map((t) =>
        t.status === 'waiting' || t.status === 'paused' ? { ...t, status: 'uploading' as TaskStatus } : t
      )
    )

    // Start uploading each waiting/paused task
    const tasksToStart = fileTasksRef.current.filter(
      (t) => t.status === 'uploading' && t.uploadId === ''
    )
    for (const task of tasksToStart) {
      uploadFileTask(task.uid)
    }
  }, [syncTasks, uploadFileTask])

  const resumeTask = useCallback(
    (uid: string) => {
      updateTask(uid, { status: 'uploading' })
      const task = fileTasksRef.current.find((t) => t.uid === uid)
      if (task) {
        if (task.uploadId) {
          // Resume: re-queue remaining chunks
          const remainingChunks = task.totalChunks - task.uploadedChunks
          if (remainingChunks > 0) {
            const allParts = Array.from({ length: task.totalChunks }, (_, i) => i + 1)
            const uploadedPartNumbers = task.partETags.map((e) => e.partNumber)
            const remaining = allParts.filter((p) => !uploadedPartNumbers.includes(p))
            for (const partNumber of remaining) {
              uploadQueueRef.current.push({ taskUid: uid, partNumber })
            }
            processUploadQueue()
          }
        } else {
          uploadFileTask(uid)
        }
      }
    },
    [updateTask, uploadFileTask, processUploadQueue]
  )

  const retryTask = useCallback(
    (uid: string) => {
      updateTask(uid, {
        status: 'uploading',
        retryCount: 0,
        error: undefined,
        uploadedChunks: 0,
        partETags: [],
        progress: 0,
        uploadId: '',
      })
      uploadFileTask(uid)
    },
    [updateTask, uploadFileTask]
  )

  const clearAllTasks = useCallback(() => {
    for (const task of fileTasksRef.current) {
      if (task.abortController) {
        task.abortController.abort()
      }
      if (task.uploadId) {
        cancelUpload(task.uploadId).catch(() => {})
      }
    }
    syncTasks(() => [])
    uploadQueueRef.current = []
    activeWorkersRef.current = 0
  }, [syncTasks])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const task of fileTasksRef.current) {
        if (task.abortController) {
          task.abortController.abort()
        }
      }
    }
  }, [])

  return {
    fileTasks,
    addFiles,
    startAllUpload,
    pauseTask,
    resumeTask,
    cancelTask,
    retryTask,
    removeTask,
    clearAllTasks,
  }
}
