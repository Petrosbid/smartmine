const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const buildUrl = (path: string, query?: Record<string, string | number | boolean | undefined>): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${API_BASE_URL}${normalizedPath}`, window.location.origin)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined) return
      url.searchParams.set(key, String(value))
    })
  }

  return `${url.pathname}${url.search}`
}

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  query?: Record<string, string | number | boolean | undefined>,
): Promise<T> => {
  const response = await fetch(buildUrl(path, query), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`

    try {
      const errorBody = (await response.json()) as { detail?: string | Array<{ msg?: string }> }
      if (typeof errorBody.detail === 'string') {
        detail = errorBody.detail
      } else if (Array.isArray(errorBody.detail) && errorBody.detail[0]?.msg) {
        detail = errorBody.detail[0].msg
      }
    } catch {
      // ignore JSON parse errors and keep default message
    }

    throw new ApiError(response.status, detail)
  }

  return (await response.json()) as T
}
