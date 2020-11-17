// Définition de la classe MaterialMirror

// superclasse nécessaire
Requires("Material");


class MaterialMirror extends Material
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

            void main()
            {
                gl_Position = matP * matVM * vec4(glVertex, 1.0);;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // caractéristiques du matériau
            const vec4 Kd = vec4(0.2, 0.4, 0.9, 0.1);

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                glFragColor = Kd;
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialMirror");
    }
}
