// Définition de la classe MaterialColor

Requires("Material");


class MaterialColor extends Material
{
    /**
     * constructeur
     * @param r, g, b : couleur
     */
    constructor(r, g, b)
    {
        let srcVertexShader = dedent
            `#version 300 es
            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;
            uniform mat3 matN;

            // informations des sommets (VBO)
            in vec3 glVertex;
            in vec3 glNormal;

            // calculs allant vers le fragment shader
            out vec3 frgN;              // normale du fragment en coordonnées caméra
            out vec4 frgPosition;       // position du fragment en coordonnées caméra

            void main()
            {
                frgPosition = matVM * vec4(glVertex, 1.0);
                gl_Position = matP * frgPosition;
                frgN = matN * glNormal;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;
            // couleur du matériau, fixée lors de la construction du matériau
            const vec3 Kd = vec3(${r}, ${g}, ${b});

            // paramètres du shader : caractéristiques de la lampe
            uniform vec3 LightColor;        // couleur de la lampe
            uniform vec4 LightPosition;     // position ou direction d'une lampe positionnelle ou directionnelle
            uniform vec4 LightDirection;    // direction du cône pour une lampe spot
            uniform float cosmaxangle;
            uniform float cosminangle;

            // informations venant du vertex shader
            in vec3 frgN;              // normale du fragment en coordonnées caméra
            in vec4 frgPosition;       // position du fragment en coordonnées caméra

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                // éclairement ambiant : 20%
                vec3 amb = 0.2 * Kd;

                // vecteur normal normalisé
                vec3 N = normalize(frgN);

                // direction de la lumière dans le repère caméra
                vec3 L = LightPosition.xyz - frgPosition.xyz * LightPosition.w;

                // carré de la distance de la lampe au fragment
                float d2 = dot(L, L);
                L = L / sqrt(d2);


                // visibilité ?
                float visib = smoothstep(cosmaxangle, cosminangle, dot(-L, LightDirection.xyz));

                // éclairement diffus de Lambert
                float dotNL = clamp(dot(N, L), 0.0, 1.0);
                vec3 dif = visib * LightColor/d2 * Kd * dotNL;

                // couleur finale = diffus + ambiant
                glFragColor = vec4(dif + amb, 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialColor");

        // emplacement des variables uniform spécifiques
        this.m_LightColorLoc     = gl.getUniformLocation(this.m_ShaderId, "LightColor");
        this.m_LightPositionLoc  = gl.getUniformLocation(this.m_ShaderId, "LightPosition");
        this.m_LightDirectionLoc  = gl.getUniformLocation(this.m_ShaderId, "LightDirection");
        this.m_CosMaxAngleLoc  = gl.getUniformLocation(this.m_ShaderId, "cosmaxangle");
        this.m_CosMinAngleLoc  = gl.getUniformLocation(this.m_ShaderId, "cosminangle");
    }


    /**
     * Fournit la lampe au shader
     * @param light : instance de Light spécifiant les caractéristiques de la lampe
     */
    setLight(light)
    {
        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // fournir les infos de la lampe au shader
        vec3.glUniform(this.m_LightColorLoc,     light.getColor());
        vec4.glUniform(this.m_LightPositionLoc,  light.getPosition());
        vec4.glUniform(this.m_LightDirectionLoc, light.getDirection());
        gl.uniform1f(this.m_CosMaxAngleLoc, light.getCosMaxAngle());
        gl.uniform1f(this.m_CosMinAngleLoc, light.getCosMinAngle());
    }
}
