﻿// Définition d'un maillage en version 0, "triangle-sommet"


/**
 * Cette classe représente l'ensemble du maillage : listes des sommets et des triangles, avec une méthode de dessin
 */
class Mesh
{
    /**
     * constructeur
     * @param name : nom du maillage (pour la mise au point)
     */
    constructor(name)
    {
        // nom du maillage, pour l'afficher lors de la mise au point
        this.m_Name = name;

        // liste des sommets
        this.m_VertexList = [];

        // liste des triangles
        this.m_TriangleList = [];

        // identifiants des VBOs
        this.m_VertexBufferId     = null;
        this.m_ColorBufferId      = null;
        this.m_NormalBufferId     = null;
        this.m_FacesIndexBufferId = null;
        this.m_EdgesIndexBufferId = null;

        // identifiants liés au shader (il est créé dans une sous-classe)
        this.m_ShaderId  = null;
        this.m_MatPVMLoc = null;
        this.m_MatNLoc   = null;
        this.m_VertexLoc = null;
        this.m_ColorLoc  = null;
        this.m_NormalLoc = null;

        // matrices utilisées dans onDraw
        this.m_MatPVM = mat4.create();      // P * V * M
        this.m_MatN = mat3.create();

        // prêt à être dessiné ? non pas encore : les VBO ne sont pas créés
        this.m_Ready = false;
    }


    /**
     * recalcule les normales de tous les triangles et sommets du maillage
     * NB: attention, le nom de la méthode est computeNormals pour un Mesh,
     * mais c'est computeNormal pour un triangle ou un sommet
     */
    computeNormals()
    {
        // recalculer les normales des triangles
        for (let triangle of this.m_TriangleList) {
            triangle.computeNormal();
        }

        // recalculer les normales des sommets
        for (let vertex of this.m_VertexList) {
            vertex.computeNormal();
        }
    }


    /**
     * Cette méthode indique qu'on peut maintenant dessiner le maillage.
     * Elle est à utiliser quand on crée soi-même le maillage, par exemple après avoir calculé les normales
     */
    setReady()
    {
        this.m_Ready = true;
    }


    /**
     * Cette méthode lit le fichier indiqué, il contient un maillage au format OBJ
     * @param filename : nom complet du fichier à lire
     * @param callback : fonction à appeler à la fin du chargement du fichier OBJ, elle doit appeler buildVBO par exemple, si on fournit null, alors ça appelle buildVBO
     */
    loadObj(filename, callback=null)
    {
        // faire une requête HTTP pour demander le fichier obj
        let request = new XMLHttpRequest();
        request.mesh = this;
        request.overrideMimeType('text/plain; charset=x-user-defined');
        request.open("GET", filename, true);
        request.responseType = "text";
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status === 200) {
                    this.mesh.onLoadObj(request.responseText, callback);
                }
            }
        }
        request.onerror = function() {
            console.error(this.m_Name+" : "+filename+" cannot be loaded, check name and access");
            console.error(request);
        }
        request.send();
    }


    /**
     * Cette méthode est appelée automatiquement, quand le contenu du fichier obj
     * est devenu disponible.
     * @param content : contenu du fichier obj
     * @param callback : fonction à appeler à la fin du chargement du fichier OBJ, elle doit appeler buildVBO par exemple
     */
    onLoadObj(content, callback=null)
    {
        // parcourir le fichier obj ligne par ligne
        let lines = content.split('\n');
        for (let l=0; l<lines.length; l++) {
            // nettoyer la ligne
            let line = lines[l].replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
            // séparer la ligne en mots
            let words = line.split(' ');
            // mettre le premier mot en minuscules
            let word0 = words[0].toLowerCase();
            if (word0 == 'f' && words.length == 4) {
                // lire le numéro du premier point
                let v1 = this.m_VertexList[parseInt(words[1])-1];
                // lire le numéro du deuxième point
                let v2 = this.m_VertexList[parseInt(words[2])-1];
                // lire le numéro du troisième point
                let v3 = this.m_VertexList[parseInt(words[3])-1];
                // ajouter un triangle v1,v2,v3
                new Triangle(this, v1,v2,v3);
            } else
            if (word0 == 'v' && words.length == 4) {
                // coordonnées 3D d'un sommet
                let x = parseFloat(words[1]);
                let y = parseFloat(words[2]);
                let z = parseFloat(words[3]);
                new Vertex(this, x,y,z);
            }
        }

        // message
        console.log(this.m_Name+" : obj loaded,",this.m_VertexList.length+" vertices,", this.m_TriangleList.length+" triangles");

        // appeler la callback sur this si elle est définie ou construire les VBO
        if (callback != null) {
            callback.call(this);
        } else {
            this.buildVBOs();
        }
    }


    /**
     * Cette méthode construit les VBO pour l'affichage du maillage avec la méthode onDraw
     * Il faut avoir appelé computeNormals avant, si on a besoin des normales pour le shader
     */
    buildVBOs()
    {
        //stocker les coordonnées les couleurs les normales
        let vertices = [];
        let colors = [];
        let normals = [];
        let num = 0;

        for (let v of this.m_VertexList) {
            v.m_Index = num;
            num++;
            vertices.push(v.m_Coords[0], v.m_Coords[1], v.m_Coords[2]);
            colors.push(v.m_Color[0], v.m_Color[1], v.m_Color[2]);
            normals.push(v.m_Normal[0], v.m_Normal[1], v.m_Normal[2]);
        }
        this.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        this.m_ColorBufferId = Utils.makeFloatVBO(colors, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        this.m_NormalBufferId = Utils.makeFloatVBO(normals, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

        let indexList = [];
        for (let t of this.m_TriangleList) {
            indexList.push(t.m_Vertices[0].m_Index, t.m_Vertices[1].m_Index, t.m_Vertices[2].m_Index)
        }
        this.m_FacesIndexBufferId = Utils.makeShortVBO(indexList, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);

        // il est maintenant prêt à être dessiné
        this.m_Ready = true;
    }


    /**
     * construit un VBO d'indices pour dessiner les arêtes
     * Cette méthode est à lancer après buildVBOs()
     */
    buildEdgesVBO()
    {
        let indexList = [];
        for (let t of this.m_TriangleList) {
            indexList.push(t.m_Vertices[0].m_Index, t.m_Vertices[1].m_Index,
                            t.m_Vertices[1].m_Index, t.m_Vertices[2].m_Index,
                            t.m_Vertices[2].m_Index, t.m_Vertices[0].m_Index)
        }
        this.m_EdgesIndexBufferId = Utils.makeShortVBO(indexList, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
    }


    /**
     * dessiner le maillage s'il est prêt
     * @param matP : matrice de projection perpective
     * @param matVM : matrice de transformation de l'objet par rapport à la caméra
     */
    onDraw(matP, matVM)
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return;

        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // fournir la matrice P * VM au shader
        mat4.mul(this.m_MatPVM, matP, matVM);
        mat4.glUniformMatrix(this.m_MatPVMLoc, this.m_MatPVM);

        // calcul de la matrice normale
        mat3.fromMat4(this.m_MatN, matVM);
        mat3.transpose(this.m_MatN, this.m_MatN);
        mat3.invert(this.m_MatN, this.m_MatN);
        mat3.glUniformMatrix(this.m_MatNLoc, this.m_MatN);

        // activer et lier le buffer contenant les coordonnées
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertexBufferId);
        gl.enableVertexAttribArray(this.m_VertexLoc);
        gl.vertexAttribPointer(this.m_VertexLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // activer et lier le buffer contenant les couleurs s'il est utilisé dans le shader
        if (this.m_ColorLoc != null && this.m_ColorLoc >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.m_ColorBufferId);
            gl.enableVertexAttribArray(this.m_ColorLoc);
            gl.vertexAttribPointer(this.m_ColorLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);
        }

        // activer et lier le buffer contenant les normales s'il est utilisé dans le shader
        if (this.m_NormalLoc != null && this.m_NormalLoc >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.m_NormalBufferId);
            gl.enableVertexAttribArray(this.m_NormalLoc);
            gl.vertexAttribPointer(this.m_NormalLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);
        }

        // activer et lier le buffer contenant les indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.m_FacesIndexBufferId);

        // dessiner les triangles
        gl.drawElements(gl.TRIANGLES, this.m_TriangleList.length * 3, gl.UNSIGNED_SHORT, 0);

        // désactiver les buffers
        gl.disableVertexAttribArray(this.m_VertexLoc);
        if (this.m_ColorLoc != null && this.m_ColorLoc >= 0) {
            gl.disableVertexAttribArray(this.m_ColorLoc);
        }
        if (this.m_NormalLoc != null && this.m_NormalLoc >= 0) {
            gl.disableVertexAttribArray(this.m_NormalLoc);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // désactiver le shader
        gl.useProgram(null);
    }


    /**
     * dessiner les arêtes du maillage s'il est prêt
     * @param matP : matrice de projection perpective
     * @param matVM : matrice de transformation de l'objet par rapport à la caméra
     */
    onDrawEdges(matP, matVM)
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready || this.m_EdgesIndexBufferId == null) return;

        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // fournir la matrice P * VM au shader
        mat4.mul(this.m_MatPVM, matP, matVM);
        mat4.glUniformMatrix(this.m_MatPVMLoc, this.m_MatPVM);

        // activer et lier le buffer contenant les coordonnées
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertexBufferId);
        gl.enableVertexAttribArray(this.m_VertexLoc);
        gl.vertexAttribPointer(this.m_VertexLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // activer et lier le buffer contenant les indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.m_EdgesIndexBufferId);

        // dessiner les lignes
        gl.drawElements(gl.LINES, this.m_TriangleList.length * 6, gl.UNSIGNED_SHORT, 0);

        // désactiver les buffers
        gl.disableVertexAttribArray(this.m_VertexLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // désactiver le shader
        gl.useProgram(null);
    }

    /**
     * ajoute un triangle à this
     * @param a 
     * @param b 
     * @param c 
     */
    addTriangle(a, b, c) {
        return new Triangle(this, a, b, c);
    }

    /**
     * ajoute un quad à this
     * @param a 
     * @param b 
     * @param c 
     * @param d
     */
    addQuad(a, b, c, d) {
        this.addTriangle(a, b, c);
        this.addTriangle(a, c, d);
    }

    /**
     * applique une extrusion sur un groupe de triangles
     * @param triangles : liste des triangles à extruder
     * @param vector : direction et distance d'extrusion
     */
    extrude(triangles, vector)
    {
        for (const t of triangles) {
            const A = t.m_Vertices[0];
            const B = t.m_Vertices[1];
            const C = t.m_Vertices[2];

            const A1 = new Vertex(this, A.m_Coords[0] + vector[0], A.m_Coords[1] + vector[1], A.m_Coords[2] + vector[2]);
            const B1 = new Vertex(this, B.m_Coords[0] + vector[0], B.m_Coords[1] + vector[1], B.m_Coords[2] + vector[2]);
            const C1 = new Vertex(this, C.m_Coords[0] + vector[0], C.m_Coords[1] + vector[1], C.m_Coords[2] + vector[2]);
            
            t.m_Vertices = [A1, B1, C1];

            this.addQuad(A, B, B1, A1);
            this.addQuad(B, C, C1, B1);
            this.addQuad(C, A, A1, C1);
        }
    }


    /**
     * Effectue une subdivision de tous les triangles
     * @param normalize true s'il faut normaliser les sommets intermédiaire
     */
    subdivide(normalize = false) {
        // copier la liste des triangles pour ne pas traiter les nouveaux triangles
        let triangles = this.m_TriangleList.slice(0);

        // tableaux (clé, valeur) des milieux, ex: pour le sommet p1, clé=p2, valeur=m(p1,p2) ou rien
        for (let v of this.m_VertexList) {
            v.m_Milieux = new Map();
        }

        // chaque triangle est coupé en 4
        for (let t of triangles) {
            let A = t.m_Vertices[0];
            let B = t.m_Vertices[1];
            let C = t.m_Vertices[2];
            
            const mAB = Vertex.middle(this, A, B);
            const mBC = Vertex.middle(this, C, B);
            const mCA = Vertex.middle(this, C, A);

            if (normalize) {
                vec3.normalize(mAB.m_Coords, mAB.m_Coords);
                vec3.normalize(mBC.m_Coords, mBC.m_Coords);
                vec3.normalize(mCA.m_Coords, mCA.m_Coords);
            }

            t.m_Vertices = [mAB, mBC, mCA];
            new Triangle(this, A, mAB, mCA);
            new Triangle(this, B, mBC, mAB);
            new Triangle(this, C, mCA, mBC);
        }
    }


    /** destructeur */
    destroy()
    {
        // supprimer les VBOs (le shader n'est pas créé ici)
        Utils.deleteVBO(this.m_VertexBufferId);
        Utils.deleteVBO(this.m_ColorBufferId);
        Utils.deleteVBO(this.m_NormalBufferId);
        Utils.deleteVBO(this.m_FacesIndexBufferId);
        Utils.deleteVBO(this.m_EdgesIndexBufferId);
    }
}


/**
 * Cette classe représente l'un des sommets d'un maillage
 */
class Vertex
{
    constructor(mesh, x,y,z)
    {
        // attributs de sommet
        this.m_Index = -1;
        this.m_Coords = vec3.fromValues(x, y, z);
        this.m_Color = vec3.create();
        this.m_Normal = vec3.create();

        // lien entre sommet et mesh
        mesh.m_VertexList.push(this);
        this.m_Mesh = mesh;
    }

    // get the middle between A and B, store it in the map of A and B
    static middle(mesh, A, B) {
        let m = A.m_Milieux.get(B)
        if (m === undefined) {
            const x = (A.m_Coords[0] + B.m_Coords[0]) * 0.5;
            const y = (A.m_Coords[1] + B.m_Coords[1]) * 0.5;
            const z = (A.m_Coords[2] + B.m_Coords[2]) * 0.5;
            m = new Vertex(mesh, x, y, z);
            A.m_Milieux.set(B, m);
            B.m_Milieux.set(A, m);
        }
        return m;
    }

    /**
     * affecte la couleur de ce sommet
     */
    setColor(r, g, b)
    {
        this.m_Color = vec3.fromValues(r, g, b);
        // pour pouvoir faire let v = new Vertex(...).setColor(...).setNormal(...);
        return this;
    }

    /**
     * affecte la normale de ce sommet
     */
    setNormal(nx, ny, nz)
    {
        this.m_Normal = vec3.fromValues(nx, ny, nz);
        // pour pouvoir faire let v = new Vertex(...).setColor(...).setNormal(...);
        return this;
    }


    /**
     * calcule la normale du sommet = moyenne des normales des triangles autour
     */
    computeNormal()
    {
        vec3.zero(this.m_Normal);
        for (const t of this.m_Mesh.m_TriangleList) {
            if (t.contains(this)) {
                vec3.add(this.m_Normal, this.m_Normal, t.m_Normal);
            }
        }
        vec3.normalize(this.m_Normal, this.m_Normal);
    }
}


/**
 * Cette classe représente l'un des triangles d'un maillage
 */
class Triangle
{
    constructor(mesh, v0, v1, v2)
    {
        // tableau des sommets
        this.m_Vertices = [v0, v1, v2];

        // lien entre triangle et mesh
        mesh.m_TriangleList.push(this);
        this.m_Mesh = mesh;

        // normale et surface
        this.m_Normal = vec3.create();
        this.m_Surface = 0.0;
    }


    /**
     * retourne true si this contient ce sommet
     * @param vertex : cherché parmi les 3 sommets du triangle
     * @return true si vertex = l'un des sommets, false sinon
     */
    contains(vertex)
    {
        return this.m_Vertices.includes(vertex);
    }


    /**
     * calcule la normale du sommet = moyenne des normales des triangles autour
     */
    computeNormal()
    {
        let AB = vec3.create();
        let AC = vec3.create();

        const A = this.m_Vertices[0];
        const B = this.m_Vertices[1];
        const C = this.m_Vertices[2];

        vec3.subtract(AB, B.m_Coords, A.m_Coords);
        vec3.subtract(AC, C.m_Coords, A.m_Coords);

        //produit vectoriel, non normalisé
        vec3.cross(this.m_Normal, AB, AC);
    }
}
