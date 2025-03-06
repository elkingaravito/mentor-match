import http.server
import socketserver
import os
import sys

PORT = 5174
DIRECTORY = "public"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Mapeo de rutas a archivos HTML
        route_mapping = {
            '/': '/index.html',
            '/login': '/login.html',
            '/register': '/register.html',
            '/dashboard': '/dashboard.html',
            '/matchmaking': '/matchmaking.html',
            '/mentors': '/mentors.html',
            '/sessions': '/sessions.html',
            '/statistics': '/statistics.html',
            '/settings': '/settings.html',
            '/admin': '/admin.html',
            '/admin/statistics': '/admin_statistics.html',
            '/admin/settings': '/admin_settings.html',
        }
        
        # Verificar si la ruta está en el mapeo
        if self.path in route_mapping:
            self.path = route_mapping[self.path]
        # Si la ruta termina con /, servir index.html
        elif self.path.endswith('/'):
            self.path = self.path + 'index.html'
        # Si la ruta no tiene extensión, intentar servir un archivo HTML
        elif '.' not in os.path.basename(self.path):
            # Verificar si existe un archivo HTML con el nombre de la ruta
            html_path = os.path.join(DIRECTORY, self.path.lstrip('/') + '.html')
            if os.path.exists(html_path):
                self.path = self.path + '.html'
            else:
                # Si no existe, servir index.html para que la SPA maneje la ruta
                self.path = '/index.html'
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"Serving static files from {os.path.abspath(DIRECTORY)} at http://localhost:{PORT}")
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Server started at http://localhost:{PORT}")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        sys.exit(0)
