// Définition de la classe MaterialGreen

Requires("Material");


class MaterialGreen extends Material
{
    constructor()
    {
        let srcVertexShader = dedent
            `#version 300 es

            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;
            uniform mat3 matN;

            // VBO fournissant les infos des sommets
            in vec3 glVertex;
            in vec3 glNormal;

            // données pour le fragment shader
            out vec4 frgPosition;
            out vec3 frgN;

            void main()
            {
                frgPosition = matVM * vec4(glVertex, 1.0);
                gl_Position = matP * frgPosition;
                frgN = matN * glNormal;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // caractéristiques du matériau
            const vec4 Kd = vec4(0.0, 0.6, 0.0, 1.0);
            const vec4 Ks = vec4(0.8, 0.8, 0.8, 1.0);
            const float ns = 64.0;

            // lampes
            const int nbL = 3;
            uniform vec3 LightColors[nbL];
            uniform vec4 LightPositions[nbL];

            // données venant du vertex shader
            in vec4 frgPosition;
            in vec3 frgN;

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                // éclairement ambiant : 20%
                glFragColor = Kd * 0.2;

                //calculer N
                vec3 N = normalize(frgN);
                
                // calculer V
                vec3 mV = normalize(frgPosition.xyz);

                //Calculer Rv
                vec3 Rv = reflect(mV, N);
                //glFragColor = vec4(Rv, 1.0); return ;

                /// TODO calculer Lambert + Phong avec chaque lampe
                for (int i=0; i<nbL; i++) {

                    // Calculer L
                    vec3 L = normalize(LightPositions[i].xyz - frgPosition.xyz * LightPositions[i].w);

                    // eclairement diffus
                    float D = clamp(dot(N, L), 0.0, 1.0);

                    glFragColor += D * Kd * vec4(LightColors[i], 0.0);

                    // eclairement spec
                    float S = pow(clamp(dot(Rv, L), 0.0, 1.0), ns);

                    glFragColor += S * Ks * vec4(LightColors[i], 0.0);
                }
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialGreen");

        // emplacement des variables uniform spécifiques
        this.m_LightColorsLoc = gl.getUniformLocation(this.m_ShaderId, "LightColors");
        this.m_LightPositionsLoc = gl.getUniformLocation(this.m_ShaderId, "LightPositions");
    }


    /**
     * définit l'ensemble des lampes
     * @param lights : tableau de Light donnant la position des lampes par rapport à la caméra
     */
    setLights(lights)
    {
        // TODO recompiler le shader si le nombre de lampes a changé
        let nblights = lights.length;
        if (nblights != 3) throw "bad lights number";

        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // construire un tableau regroupant les couleurs et un autre avec les positions
        let colors = new Float32Array(3*nblights);
        let positions = new Float32Array(4*nblights);
        for (let i=0; i<nblights; i++) {
            let color = lights[i].getColor();
            colors[i*3+0] = color[0];
            colors[i*3+1] = color[1];
            colors[i*3+2] = color[2];
            let position = lights[i].getPosition();
            positions[i*4+0] = position[0];
            positions[i*4+1] = position[1];
            positions[i*4+2] = position[2];
            positions[i*4+3] = position[3];
        }
        gl.uniform3fv(this.m_LightColorsLoc, colors);
        gl.uniform4fv(this.m_LightPositionsLoc, positions);
    }
}
