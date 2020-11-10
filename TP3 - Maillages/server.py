#!/usr/bin/python
# -*- coding: utf-8 -*-

# Ce script python crée un serveur HTTP local pour afficher un dossier
# contenant plusieurs projet WebGL
# Ouvrir le navigateur sur http://localhost:8000 (n° de port configurable)

# Cela permet d'éviter le bug Cross Origins pour certains navigateurs ainsi
# que le problème des dossiers copiés au lieu de liés : quand un fichier est
# demandé dans libs/ ou data/

# numéro du port HTTP à servir
PORT = 8000

# extensions et types mime des fichiers autorisés
mimetype = {
    '.html': 'text/html',
    '.jpg':  'image/jpg',
    '.png':  'image/png',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.obj':  'text/plain'
}

# bibliothèques
import sys
if sys.version_info >= (3,0):
    from http.server import BaseHTTPRequestHandler,HTTPServer
else:
    from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
import os
import os.path


def write(f, s):
    if sys.version_info >= (3,0):
        f.write(bytes(s, 'ascii'))
    else:
        f.write(s)


# classe pour répondre aux demandes des fichiers
class FileHandler(BaseHTTPRequestHandler):
	
    #Handler for the GET requests
    def do_GET(self):
        try:

            # fichier racine
            if self.path == "/":
                self.path = "index.html"

            # enlever le / initial
            while self.path.startswith('/'):
                self.path = self.path[1:]

            # si le chemin contient libs ou data, le rediriger sur le même au dessus
            for d in ['libs/', 'data/']:
                pos = self.path.find(d)
                if pos > -1:
                    self.path = os.path.join(os.getcwd(), self.path[pos:])

            # remplacer certaines entités HTML
            self.path = self.path.replace('%20', ' ')

            # pour index.htm ou index.html, générer une liste de liens vers les projets
            if self.path in ["index.htm", "index.html"]:
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                write(self.wfile, "<html>")
                write(self.wfile, "<head>")
                write(self.wfile, "<title>Projets WebGL</title>")
                write(self.wfile, "</head>")
                write(self.wfile, "<body>")
                write(self.wfile, "<h4>Projets WebGL</h4>")                
                for dossier in sorted(os.listdir(os.getcwd())):
                    # ne garder ce dossier que s'il contient main.html
                    main = os.path.join(dossier, 'main.html')
                    if os.path.isfile(main):
                        write(self.wfile, "<a href='%s'>%s</a><br/>"%(main, dossier))
                write(self.wfile, "</body>")
                write(self.wfile, "</html>")

            # fichier ordinaire
            else:
                # test de l'extension du fichier
                base, ext = os.path.splitext(self.path)
                if ext in mimetype.keys():
                    nomcomplet = os.path.join(os.getcwd(), self.path)
                    with open(nomcomplet, 'rb') as fich:
                        self.send_response(200)
                        self.send_header('Content-type', mimetype[ext])
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(fich.read())
                else:
                    self.send_error(404,'File type not allowed: %s'%self.path)

        except IOError:
            self.send_error(404,'File not found: %s'%self.path)

# boucle principale
try:
    server = HTTPServer(('', PORT), FileHandler)
    print('Ouvrir http://localhost:%d'%PORT)
    server.serve_forever()
except KeyboardInterrupt:
    server.socket.close()
