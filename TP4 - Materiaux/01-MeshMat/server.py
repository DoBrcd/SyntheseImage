#!/usr/bin/python
# -*- coding: utf-8 -*-

# Ce script python crée un serveur HTTP local pour ouvrir un projet WebGL
# Ouvrir le navigateur sur http://localhost:8000 (n° de port configurable)

# Cela permet d'éviter le bug Cross Origins pour certains navigateurs ainsi
# que le problème des dossiers copiés au lieu de liés : quand un fichier est
# demandé dans libs/ ou data/, il est recherché dans ..

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


# classe pour répondre aux demandes des fichiers
class FileHandler(BaseHTTPRequestHandler):
	
    #Handler for the GET requests
    def do_GET(self):
        try:

            # fichier racine
            if self.path == "/":
                self.path = "main.html"

            # enlever le / initial
            while self.path.startswith('/'):
                self.path = self.path[1:]

            # si le chemin commence par libs, le rediriger sur ../libs, idem avec data
            if self.path.startswith('libs/'):
                self.path = os.path.join(os.pardir, self.path)
            if self.path.startswith('data/'):
                self.path = os.path.join(os.pardir, self.path)

            # remplacer certaines entités HTML
            self.path = self.path.replace('%20', ' ')

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
