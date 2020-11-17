// Définition de la classe MaterialRectangle

// superclasse nécessaire
Requires("Material");


class MaterialRectangle extends Material
{
    /**
     * définit un matériau pour appliquer une texture ou un FBO
     * @param texture : Texture2D ou FrameBufferObject
     */
    constructor(texture)
    {
        let srcVertexShader = dedent
            `#version 300 es

            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;

            // informations des sommets (VBO)
            in vec3 glVertex;
            in vec2 glTexCoords;

            // données pour le fragment shader
            out vec2 frgTexCoords;

            void main()
            {
                gl_Position = matP * matVM * vec4(glVertex, 1.0);
                frgTexCoords = glTexCoords;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // caractéristiques du matériau
            uniform sampler2D txColor;

            // données venant du vertex shader
            in vec2 frgTexCoords;

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                // accès au texel
                vec3 color = texture(txColor, frgTexCoords).rgb;

                glFragColor = vec4(color, 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialRectangle");

        // emplacement des variables uniform spécifiques
        this.m_TextureLoc = gl.getUniformLocation(this.m_ShaderId, "txColor");

        // texture associée à ce matériau
        this.m_Texture = texture;
    }


    select(mesh, matP, matVM)
    {
        // méthode de la superclasse (active le shader)
        super.select(mesh, matP, matVM);

        // activer la texture sur l'unité 0
        this.m_Texture.setTextureUnit(gl.TEXTURE0, this.m_TextureLoc);
    }


    deselect()
    {
        // libérer le sampler
        this.m_Texture.setTextureUnit(gl.TEXTURE0);

        // méthode de la superclasse (désactive le shader)
        super.deselect();
    }
}
