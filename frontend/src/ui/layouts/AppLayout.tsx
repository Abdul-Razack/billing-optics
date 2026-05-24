import { Outlet } from 'react-router-dom';

export default function AppLayout(): JSX.Element {
  return (
    <div className="app-layout">
      <header>Header Placeholder</header>
      <aside>Sidebar Placeholder</aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
