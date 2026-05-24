import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

/**
 * Redirect helper page.
 * Reads the `path` param from the URL and navigates to it.
 * Used for page-reload functionality in the tab system --
 * when a user refreshes the browser on a tabbed route, the app
 * can redirect through here to restore the correct path.
 */
export default function RedirectPage() {
  const navigate = useNavigate()
  const { path } = useParams<{ path: string }>()

  useEffect(() => {
    if (path) {
      // Decode in case the path was encoded in the URL
      navigate(`/${decodeURIComponent(path)}`, { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [path, navigate])

  // Render a minimal loading state while redirecting
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
