﻿// Définition de la classe MaterialRock

// superclasse et classes nécessaires
Requires("Material");
Requires("Texture2D");


class MaterialRock extends Material
{
    constructor()
    {
        let srcVertexShader = dedent
            `#version 300 es

            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;

            // VBO fournissant les infos des sommets
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
                glFragColor = texture(txColor, frgTexCoords);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialRock");

        // emplacement des variables uniform spécifiques
        this.m_TextureLoc = gl.getUniformLocation(this.m_ShaderId, "txColor");

        // charge l'image de la terre en tant que texture
        this.m_Texture = new Texture2D("data/earth_map.jpg");
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


    destroy()
    {
        // méthode de la superclasse
        super.destroy();

        // supprimer la texture
        this.m_Texture.destroy();
    }
}
