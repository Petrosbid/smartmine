import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { routes } from '../constants/routes'

export const NotFoundPage = () => {
  return (
    <div className="center-page">
      <h1>صفحه مورد نظر پیدا نشد</h1>
      <Link to={routes.dashboard}>
        <Button>بازگشت به داشبورد</Button>
      </Link>
    </div>
  )
}
