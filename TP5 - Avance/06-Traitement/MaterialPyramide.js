// Définition de la classe MaterialPyramide

// superclasse nécessaire
Requires("Material");


class MaterialPyramide extends Material
{
    /** constructeur */
    constructor()
    {
        let srcVertexShader = dedent
            `#version 300 es

            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;

            // informations des sommets (VBO)
            in vec3 glVertex;
            in vec3 glColor;

            // données pour le fragment shader
            out vec3 frgColor;

            void main()
            {
                gl_Position = matP * matVM * vec4(glVertex, 1.0);
                frgColor = glColor;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // données venant du vertex shader
            in vec3 frgColor;

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                glFragColor = vec4(frgColor, 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialPyramide");
    }
}
