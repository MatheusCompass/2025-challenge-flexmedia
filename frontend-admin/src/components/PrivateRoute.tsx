import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute() {
  const { isAutenticado } = useAuth()
  return isAutenticado ? <Outlet /> : <Navigate to="/login" replace />
}
