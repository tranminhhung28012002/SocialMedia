import { useSearchParams } from 'react-router-dom'

export default function useQueryParams() {
  const [searchParams] = useSearchParams()
  const params = {}

  searchParams.forEach((value, key) => {
    params[key] = value
  })

  return params
}
