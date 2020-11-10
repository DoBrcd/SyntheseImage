// Définition de la classe Disque


class Cone
{
    /** constructeur */
    constructor(nbsecteurs)
    {
        /** shader */

        // version WebGL2

        let srcVertexShader = dedent
            `#version 300 es
            uniform mat4 matrix;
            in vec3 glVertex;
            in vec3 glColor;
            out vec3 frgColor;
            void main()
            {
                gl_Position = matrix * vec4(glVertex, 1.0);
                frgColor = glColor;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;
            const vec3 fog_color = vec3(0.9, 0.9, 0.9);
            const float fog_dist1 = 2.0;
            const float fog_dist2 = 10.0;
            in vec3 frgColor;
            out vec4 glFragColor;
            void main()
            {
                // distance entre l'écran et le fragment
                float dist = gl_FragCoord.z / gl_FragCoord.w;
                //glFragColor = vec4(dist - 9.0, 9.0 - dist, 0, 1);return;
                // taux de brouillard 0.0 .. 1.0 en fonction de la distance
                float fog = clamp((dist-fog_dist1)/fog_dist2, 0.0, 1.0);
                //glFragColor = vec4(fog, fog, fog, 1);return;
                // mélange couleur et brouillard
                glFragColor = vec4(mix(frgColor, fog_color, fog), 1.0);

                // couleur fournie par le vertex shader
                //glFragColor = vec4(frgColor, 1.0);
            }`;

        // compiler le shader de dessin
        this.m_ShaderId = Utils.makeShaderProgram(srcVertexShader, srcFragmentShader, this.constructor.name);
        console.debug("Source du vertex shader :\n"+srcVertexShader);
        console.debug("Source du fragment shader :\n"+srcFragmentShader);

        // déterminer où sont les variables attribute et uniform
        this.m_MatrixLoc = gl.getUniformLocation(this.m_ShaderId, "matrix");
        this.m_VertexLoc = gl.getAttribLocation(this.m_ShaderId, "glVertex");
        this.m_ColorLoc = gl.getAttribLocation(this.m_ShaderId, "glColor");


        /** VBOs */

        // créer et remplir le buffer des coordonnées
        let vertices = [
            0.0, 2.0, 0.0,      // centre
        ];
        // TODO boucle pour créer les autres sommets
        for (let i=0; i<nbsecteurs; i++) {
            let angle = Utils.radians(i*360.0/nbsecteurs);
            let x = Math.sin(angle);
            let y = 0.0;
            let z = Math.cos(angle);
            vertices.push(x, y, z);
        }
        vertices.push(0, 0, 0);
        this.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

        // créer et remplir le buffer des couleurs
        let colors = [
            1.0, 1.0, 1.0,  // centre blanc
        ];
        // boucle pour créer les autres couleurs de sommets, avec Utils.hsv2rgb([h,s,v])->[r,g,b]
        for (let i=0; i<nbsecteurs; i++) {
            let rgb = Utils.hsv2rgb([i/nbsecteurs, 1.0, 0.5]);
            colors.push(rgb[0], rgb[1], rgb[2]);
        }
        colors.push(0.0, 0.0, 0.0);
        this.m_ColorBufferId = Utils.makeFloatVBO(colors, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

        // créer et remplir le buffer des indices
        let indexlist = [];
        for (let i=0; i<nbsecteurs; i++) {
            indexlist.push(0, i+1, ((i+1)%nbsecteurs) + 1);
            indexlist.push(nbsecteurs + 1, (i + 1) % (nbsecteurs) + 1, (i + 1));
            console.log(`${nbsecteurs + 1}, ${(i + 1) % (nbsecteurs) + 1}, ${(i + 1)}`);
        }
        this.TRIANGLE_COUNT = indexlist.length / 3;
        this.m_IndexBufferId = Utils.makeShortVBO(indexlist, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);

        // matrices de transformation intermédiaires (on pourrait économiser l'une d'elles)
        this.m_MatVM = mat4.create();       // V * M
        this.m_MatPVM = mat4.create();      // P * V * M
    }


    /**
     * dessiner l'objet
     * @param matP : matrice de projection perpective
     * @param matV : matrice de transformation de l'objet par rapport à la caméra
     */
    onDraw(matP, matV)
    {
        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // rajouter une translation pour décaler l'objet d'arrière en avant
        mat4.translate(this.m_MatVM, matV, vec3.fromValues(0, 0, 3.0*Math.sin(Utils.Time*0.5)));

        // rajouter des rotations pour faire basculer l'objet dans tous les sens
        mat4.rotate(this.m_MatVM, this.m_MatVM, Utils.radians(45.0 * Utils.Time), vec3.fromValues(0,1,0));
        mat4.rotate(this.m_MatVM, this.m_MatVM, Utils.radians(67.0 * Utils.Time), vec3.fromValues(0.75,0,0.5));

        // fournir la matrice P * V * M au shader
        mat4.mul(this.m_MatPVM, matP, this.m_MatVM);
        mat4.glUniformMatrix(this.m_MatrixLoc, this.m_MatPVM);

        // activer et lier le buffer contenant les coordonnées
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertexBufferId);
        gl.enableVertexAttribArray(this.m_VertexLoc);
        gl.vertexAttribPointer(this.m_VertexLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // activer et lier le buffer contenant les couleurs
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_ColorBufferId);
        gl.enableVertexAttribArray(this.m_ColorLoc);
        gl.vertexAttribPointer(this.m_ColorLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // activer et lier le buffer contenant les indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.m_IndexBufferId);

        // dessiner les triangles
        gl.drawElements(gl.TRIANGLES, this.TRIANGLE_COUNT * 3, gl.UNSIGNED_SHORT, 0);

        // désactiver les buffers
        gl.disableVertexAttribArray(this.m_VertexLoc);
        gl.disableVertexAttribArray(this.m_ColorLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // désactiver le shader
        gl.useProgram(null);
    }


    /** destructeur */
    destroy()
    {
        // supprimer le shader et les VBOs
        Utils.deleteShaderProgram(this.m_ShaderId);
        Utils.deleteVBO(this.m_VertexBufferId);
        Utils.deleteVBO(this.m_ColorBufferId);
        Utils.deleteVBO(this.m_IndexBufferId);
    }
}
