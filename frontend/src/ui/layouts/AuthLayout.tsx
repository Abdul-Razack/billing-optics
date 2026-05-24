import { Outlet } from 'react-router-dom';

export default function AuthLayout(): JSX.Element {
  return (
    <div className="auth-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Outlet />
    </div>
  );
}
