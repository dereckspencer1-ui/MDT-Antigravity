import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-6xl font-black gradient-primary-text">404</h1>
        <p className="text-muted-foreground">La página que buscas no existe.</p>
        <Link to="/" className="inline-block mt-4 text-primary hover:underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
