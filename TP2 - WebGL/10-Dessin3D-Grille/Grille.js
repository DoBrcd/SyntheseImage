﻿// Définition de la classe Pyramide


class Grille {
    /** constructeur */
    constructor(taille, pas, couleur) {
        /** shader */

        // version WebGL2

        let srcVertexShader = dedent
            `#version 300 es
            uniform mat4 matrix;
            in vec3 glVertex;
            void main()
            {
                gl_Position = matrix * vec4(glVertex, 1.0);
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;
            const vec3 fog_color = vec3(0.9,0.9,0.9);
            const float fog_dist1 = 2.0;
            const float fog_dist2 = 10.0;
            const vec3 frgColor = vec3${couleur};
            out vec4 glFragColor;
            void main()
            {
                /*
                // distance entre l'écran et le fragment
                float dist = gl_FragCoord.z / gl_FragCoord.w;
                //glFragColor = vec4(dist - 9.0, 9.0 - dist, 0, 1);return;
                // taux de brouillard en fonction de la distance
                float fog = clamp((dist-6.0)/6.0, 0.0, 1.0);
                //glFragColor = vec4(fog, fog, fog, 1);return;
                // mélange couleur et brouillard
                glFragColor = vec4(mix(frgColor, fog_color, fog), 1.0);
                */

                // couleur fournie par le vertex shader
                glFragColor = vec4(frgColor, 1.0);
            }`;

        // compiler le shader de dessin
        this.m_ShaderId = Utils.makeShaderProgram(srcVertexShader, srcFragmentShader, "Triangle");
        console.debug("Source du vertex shader :\n" + srcVertexShader);
        console.debug("Source du fragment shader :\n" + srcFragmentShader);

        // déterminer où sont les variables attribute et uniform
        this.m_MatrixLoc = gl.getUniformLocation(this.m_ShaderId, "matrix");
        this.m_VertexLoc = gl.getAttribLocation(this.m_ShaderId, "glVertex");
        this.m_ColorLoc = gl.getAttribLocation(this.m_ShaderId, "glColor");


        /** VBOs */

        // créer et remplir le buffer des coordonnées
        const b = 0.5;
        let vertices = [];

        // créer les lignes, premier groupe, en X
        for (let x = - taille; x <= +taille; x += pas) {
            vertices.push(x, 0.0, -taille);
            vertices.push(x, 0.0, +taille);
        }

        // créer les lignes, premier groupe, en X
        for (let z = - taille; z <= +taille; z += pas) {
            vertices.push(-taille, 0.0, z);
            vertices.push(+taille, 0.0, z);
        }

        this.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        this.VERTEX_COUNT = vertices.length / 3;

        // matrices de transformation intermédiaires (on pourrait économiser l'une d'elles)
        this.m_MatVM = mat4.create();       // V * M
        this.m_MatPVM = mat4.create();      // P * V * M
    }


    /**
     * dessiner l'objet
     * @param matP : matrice de projection perpective
     * @param matV : matrice de transformation de l'objet par rapport à la caméra
     */
    onDraw(matP, matV) {
        /*// rajouter une translation pour décaler l'objet d'arrière en avant
        mat4.translate(this.m_MatVM, matV, vec3.fromValues(0, 0, 3.0 * Math.sin(Utils.Time * 0.5)));

        // rajouter des rotations pour faire basculer l'objet dans tous les sens
        mat4.rotate(this.m_MatVM, this.m_MatVM, Utils.radians(45.0 * Utils.Time), vec3.fromValues(0, 1, 0));
        mat4.rotate(this.m_MatVM, this.m_MatVM, Utils.radians(67.0 * Utils.Time), vec3.fromValues(0.75, 0, 0.5));*/

        mat4.translate(this.m_MatVM, matV, vec3.fromValues(0, -0.5, 3.0));
        mat4.rotate(this.m_MatVM, this.m_MatVM, Utils.radians(30), vec3.fromValues(1, 0, 0));

        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // fournir la matrice P * V * M au shader
        mat4.mul(this.m_MatPVM, matP, this.m_MatVM);
        mat4.glUniformMatrix(this.m_MatrixLoc, this.m_MatPVM);

        // activer et lier le buffer contenant les coordonnées
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertexBufferId);
        gl.enableVertexAttribArray(this.m_VertexLoc);
        gl.vertexAttribPointer(this.m_VertexLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // dessiner les lignes
        gl.drawArrays(gl.LINES, 0, this.VERTEX_COUNT);

        // désactiver les buffers
        gl.disableVertexAttribArray(this.m_VertexLoc);
        gl.disableVertexAttribArray(this.m_ColorLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // désactiver le shader
        gl.useProgram(null);
    }


    /** destructeur */
    destroy() {
        // supprimer le shader et les VBOs
        Utils.deleteShaderProgram(this.m_ShaderId);
        Utils.deleteVBO(this.m_VertexBufferId);
        Utils.deleteVBO(this.m_ColorBufferId);
        Utils.deleteVBO(this.m_IndexBufferId);
    }
}
