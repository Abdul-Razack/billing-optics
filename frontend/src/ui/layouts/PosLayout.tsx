/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { Outlet } from 'react-router-dom';

export default function PosLayout(): JSX.Element {
  return (
    <div className="pos-layout" style={{ width: '100vw', height: '100vh' }}>
      <Outlet />
    </div>
  );
}
