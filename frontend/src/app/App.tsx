import { Providers } from './providers';

export function App() {
  return (
    <Providers>
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Optics POS System</h1>
          <p className="text-muted-foreground">Clean Architecture React Starter Template</p>
        </div>
      </div>
    </Providers>
  );
}

export default App;
