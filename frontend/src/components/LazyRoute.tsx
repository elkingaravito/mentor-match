import React, { Suspense } from 'react';
import LoadingScreen from './feedback/LoadingScreen';
import ErrorBoundary from './ErrorBoundary';
import ErrorScreen from './feedback/ErrorScreen';

interface LazyRouteProps {
  path: string;
}

// Utilizamos el patrón glob de Vite para importar todas las páginas de manera optimizada
// Esto permite a Vite analizar estáticamente las importaciones
const pages = import.meta.glob('../pages/**/*.{ts,tsx,js,jsx}');

export const LazyRoute = ({ path }: LazyRouteProps) => {
  const [error, setError] = React.useState<Error | null>(null);

  const Component = React.lazy(async () => {
    try {
      // Construimos la ruta exacta según el formato de los archivos en tu proyecto
      const pagePath = `../pages/${path}.tsx`;
      // Verificamos si la página existe
      if (!pages[pagePath]) {
        // Si no existe con extensión .tsx, intentamos con .jsx
        const jsxPath = `../pages/${path}.jsx`;
        // Si tampoco existe con .jsx, intentamos con .js
        const jsPath = `../pages/${path}.js`;
        // Si tampoco existe con .js, intentamos con .ts
        const tsPath = `../pages/${path}.ts`;
        
        // Si no encontramos la página con ninguna extensión
        if (!pages[jsxPath] && !pages[jsPath] && !pages[tsPath]) {
          console.error(`No module found for path: ${path}`);
          throw new Error(`Page not found: ${path}`);
        }
        
        // Usamos la primera extensión que encontremos
        const actualPath = pages[jsxPath] ? jsxPath : (pages[jsPath] ? jsPath : tsPath);
        const module = await pages[actualPath]();
        return typeof module === 'object' && 'default' in module ? module : { default: module };
      }
      
      // Llamamos a la función que devuelve la importación
      const module = await pages[pagePath]();
      
      // Verificamos que exista el export default
      if (!module.default) {
        throw new Error(`No default export found in ${path}`);
      }
      
      return module;
    } catch (error) {
      console.error(`Error loading page: ${path}`, error);
      setError(error as Error);
      // Cargamos la página NotFound
      const NotFoundPath = '../pages/NotFound.tsx';
      if (pages[NotFoundPath]) {
        return pages[NotFoundPath]();
      } else {
        // Fallback si NotFound.tsx no existe
        return {
          default: () => <div>Page not found</div>
        };
      }
    }
  });

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
};