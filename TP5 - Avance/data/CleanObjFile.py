#!/usr/bin/python
# -*- coding: utf-8 -*-

# script python qui fait en sorte que les sommets d'un fichier obj soient complets :
# coordonnées, texture et normales associés au même sommet et référencés par les facettes
# pour cela, les sommets sont éventuellement clonés
# d'autre part, toutes les facettes sont transformées en triangles


# nom du fichier à traiter
ENTREE = 'Pokemon_red.obj'
SORTIE = 'Pokemon_red_ok.obj'

# liste des sommets (v,vt,vn) du futur maillage
vertices = []
connus = {}

# listes de v, vt et vn rencontrés dans le fichier d'entrée
coordonnees = []
texcoords = []
normales = []

# facettes du maillage
triangles = []

# aide à lire les indices des sommets dans les facettes
def lireIndice(nombres, indice, maximal):
    if indice >= len(nombres): return -1
    val = nombres[indice]
    if not val: return -1
    i = int(val)
    if i < 0: return maximal + i
    return i - 1

# lit une référence de sommet "iv/it/in" et retourne l'indice du sommet dans le tableau vertices
def ChercherCreerSommet(nvntnn):
    # extraire les indices
    nombres = nvntnn.split('/')
    nv = lireIndice(nombres, 0, len(coordonnees))
    nt = lireIndice(nombres, 1, len(texcoords))
    nn = lireIndice(nombres, 2, len(normales))
    if nv<0: raise Exception("facette incorrecte à cause de %s"%nvntnn)
    vertice = (nv,nt,nn)
    # parcourir les sommets et voir s'il y a le même
    for iv,vert in connus.get(nv,[]):
        # mêmes numéros de sommet, texture et normale ?
        if vert == vertice:
            return iv
    # ajouter un sommet, c'est à dire un triplet (nv,nt,nn)
    iv = len(vertices)
    vertices.append(vertice)
    # noter que ce sommet est associé à nv
    infos = connus.get(nv, [])
    infos.append((iv, vertice))
    connus[nv] = infos
    # retourner l'indice de ce nouveau sommet
    return iv


# lire le fichier d'entrée
with open(ENTREE, 'rt') as entree:
    for ligne in entree:
        mots = ligne.strip().replace("  ", " ").split(' ')

        if mots[0] == 'f':
            # f nv1/nt1/nn1 nv2/nt2/nn2 nv3/nt3/nn3 ...
            s1 = ChercherCreerSommet(mots[1])
            s2 = ChercherCreerSommet(mots[2])
            for i in range(3, len(mots)):
                s3 = ChercherCreerSommet(mots[i])
                triangles.append( (s1+1,s2+1,s3+1) )
                s2 = s3
        elif mots[0] == 'v':
            # v x y z
            for i in range(3):
                coordonnees.append(float(mots[i+1]))
        elif mots[0] == 'vt':
            # vt u v
            for i in range(2):
                texcoords.append(float(mots[i+1]))
        elif mots[0] == 'vn':
            # vn nx ny nz
            for i in range(3):
                normales.append(float(mots[i+1]))

# fonction pour afficher le triplet nv/nt/nn d'un sommet dans une ligne f
def toTriangleVertice(iv):
    sv = "%d"%iv
    st = "%d"%iv if vertices[iv-1][1]>=0 else ""
    sn = "/%d"%iv if vertices[iv-1][2]>=0 else ""
    return "%s/%s%s"%(sv,st,sn)

# produire le fichier de sortie
with open(SORTIE, 'wt') as sortie:
    sortie.write('# refait par CleanObjFile (PN)\n')
    for nv,nt,nn in vertices:
        sortie.write('v  %f %f %f\n'%(coordonnees[nv*3+0],coordonnees[nv*3+1],coordonnees[nv*3+2]))
        if nt>=0:
            sortie.write('vt %f %f\n'%(texcoords[nt*2+0],texcoords[nt*2+1]))
        if nn>=0:
            sortie.write('vn %f %f %f\n'%(normales[nn*3+0],normales[nn*3+1],normales[nn*3+2]))
    for i,j,k in triangles:
        sortie.write('f %s %s %s\n'%(toTriangleVertice(i),toTriangleVertice(j),toTriangleVertice(k)))

# informations
print "%d vertices"%len(vertices)
print "%d triangles"%len(triangles)
