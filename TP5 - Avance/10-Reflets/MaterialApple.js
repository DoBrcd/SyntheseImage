// Définition de la classe MaterialApple

// superclasse et classes nécessaires
Requires("Material");
Requires("Texture2D");


class MaterialApple extends Material
{
    /** constructeur */
    constructor()
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
            in vec2 glTexCoords;

            // données pour le fragment shader
            out vec3 frgN;              // normale du fragment en coordonnées caméra
            out vec4 frgPosition;       // position du fragment en coordonnées caméra
            out vec2 frgTexCoords;      // coordonnées de texture

            void main()
            {
                frgPosition = matVM * vec4(glVertex, 1.0);
                gl_Position = matP * frgPosition;
                frgN = matN * glNormal;
                frgTexCoords = glTexCoords;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // caractéristiques du matériau
            uniform sampler2D texDiffuse;
            const vec3 Ks = vec3(1.0, 1.0, 1.0);
            const float ns = 128.0;

            // paramètres du shader : caractéristiques de la lampe
            uniform vec3 LightColor;        // couleur de la lampe
            uniform vec4 LightPosition;     // position ou direction d'une lampe positionnelle ou directionnelle
            uniform vec4 LightDirection;    // direction du cône pour une lampe spot
            uniform float cosmaxangle;
            uniform float cosminangle;

            // données venant du vertex shader
            in vec3 frgN;              // normale du fragment en coordonnées caméra
            in vec4 frgPosition;       // position du fragment en coordonnées caméra
            in vec2 frgTexCoords;      // coordonnées de texture

            // sortie du shader
            out vec4 glFragColor;


            void main()
            {
                // couleur diffuse du matériau en ce point
                vec3 Kd = texture(texDiffuse, frgTexCoords).rgb;

                // éclairement ambiant : 40%
                glFragColor = vec4(Kd * 0.4, 1.0);

                // vecteurs N, -V et Rv
                vec3 N = normalize(frgN);
                vec3 mV = normalize(frgPosition.xyz);
                vec3 Rv = reflect(mV, N);

                // direction de la lumière dans le repère caméra
                vec3 L = LightPosition.xyz - frgPosition.xyz * LightPosition.w;
                float dist = length(L);
                L /= dist;

                // présence dans le cône du spot
                float visib = smoothstep(cosmaxangle, cosminangle, dot(-L, LightDirection.xyz));

                // diminution de l'intensité à cause de la distance
                visib /= dist*dist;

                // éclairement diffus
                float dotNL = clamp(dot(N, L), 0.0, 1.0);
                glFragColor += vec4(Kd * LightColor * dotNL * visib, 1.0);

                // éclairement spéculaire de Phong
                float dotRL = clamp(dot(Rv,L), 0.0, 1.0);
                glFragColor += vec4(Ks * LightColor * pow(dotRL, ns) * visib, 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialApple");

        // emplacement des variables uniform spécifiques
        this.m_TexDiffuseLoc = gl.getUniformLocation(this.m_ShaderId, "texDiffuse");
        this.m_LightColorLoc     = gl.getUniformLocation(this.m_ShaderId, "LightColor");
        this.m_LightPositionLoc  = gl.getUniformLocation(this.m_ShaderId, "LightPosition");
        this.m_LightDirectionLoc = gl.getUniformLocation(this.m_ShaderId, "LightDirection");
        this.m_CosMaxAngleLoc    = gl.getUniformLocation(this.m_ShaderId, "cosmaxangle");
        this.m_CosMinAngleLoc    = gl.getUniformLocation(this.m_ShaderId, "cosminangle");

        // charge l'image de la pomme en tant que texture
        this.m_Texture = new Texture2D("data/Apple/skin.jpg");
    }


    /**
     * définit la lampe
     * @param light : instance de Light spécifiant les caractéristiques de la lampe
     */
    setLight(light)
    {
        if (light != null) {
            // activer le shader
            gl.useProgram(this.m_ShaderId);

            // fournir les caractéristiques dans les variables uniform
            vec3.glUniform(this.m_LightColorLoc,     light.getColor());
            vec4.glUniform(this.m_LightPositionLoc,  light.getPosition());
            vec4.glUniform(this.m_LightDirectionLoc, light.getDirection());
            gl.uniform1f(this.m_CosMinAngleLoc, light.getCosMinAngle());
            gl.uniform1f(this.m_CosMaxAngleLoc, light.getCosMaxAngle());
        }
    }


    /**
     * active le matériau
     * @param mesh : maillage pour avoir les VBO
     * @param matP : matrice de projection à transmettre au shader
     * @param matV : matrice de vue à transmettre au shader
     */
    select(mesh, matP, matVM)
    {
        // méthode de la superclasse (active le shader)
        super.select(mesh, matP, matVM);

        // activer la texture sur l'unité 0
        this.m_Texture.setTextureUnit(gl.TEXTURE0, this.m_TexDiffuseLoc);
    }


    /**
     * désactive le matériau : shader et textures
     */
    deselect()
    {
        // libérer le sampler
        this.m_Texture.setTextureUnit(gl.TEXTURE0);

        // méthode de la superclasse (désactive le shader)
        super.deselect();
    }


    /**
     * supprime les ressources allouées par cette instance
     */
    destroy()
    {
        // méthode de la superclasse
        super.destroy();

        // supprimer la texture
        this.m_Texture.destroy();
    }
}
