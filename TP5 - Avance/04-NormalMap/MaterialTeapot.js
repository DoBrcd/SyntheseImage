﻿// Définition de la classe MaterialTeapot

// superclasse et classes nécessaires
Requires("Material");
Requires("Texture2D");


class MaterialTeapot extends Material
{
    constructor()
    {
        let nbL = 2;

        let srcVertexShader = dedent
            `#version 300 es

            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;
            uniform mat3 matN;

            // informations des sommets (VBO)
            in vec3 glVertex;
            in vec3 glNormal;
            in vec3 glTangent;
            in vec2 glTexCoords;

            // données pour le fragment shader
            out vec4 frgPosition;
            out vec3 frgN;
            out vec3 frgT;
            out vec2 frgTexCoords;

            void main()
            {
                frgPosition = matVM * vec4(glVertex, 1.0);
                gl_Position = matP * frgPosition;
                frgN = matN * glNormal;
                frgT = matN * glTangent;
                frgTexCoords = glTexCoords * 8.0;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // caractéristiques du matériau
            uniform sampler2D texDiffuse;
            uniform sampler2D texNormale;
            const vec3 Ks = vec3(1.0, 1.0, 1.0);
            const float ns = 128.0;

            // lampes
            const int nbL = ${nbL};
            uniform vec3 LightColors[nbL];
            uniform vec4 LightPositions[nbL];

            // données venant du vertex shader
            in vec4 frgPosition;
            in vec3 frgN;
            in vec3 frgT;
            in vec2 frgTexCoords;

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                // couleur diffuse
                vec3 Kd = texture(texDiffuse, frgTexCoords).rgb;

                /// construire le repère TBN
                vec3 N = normalize(frgN);
                vec3 T = normalize(frgT);
                vec3 B = cross(N, T);

                /// aller chercher la normale dans la "normal map" texNormale
                vec3 Nmod = texture(texNormale, frgTexCoords).xyz;
                Nmod = Nmod * 2.0 - 1.0;
                /// la mettre dans le repère global et la normaliser
                mat3 TBN = mat3(T, B, N);
                Nmod = normalize(TBN * Nmod);
                /// éclairement de Lambert et Phong ou autre

                vec3 mV = normalize(frgPosition.xyz);

                for (int i=0; i<nbL; i++) {

                    // Calculer L
                    vec3 L = normalize(LightPositions[i].xyz - frgPosition.xyz * LightPositions[i].w);

                    // eclairement diffus / Utilisation de Lambert
                    float D = clamp(dot(Nmod, L), 0.0, 1.0);

                    glFragColor += D * vec4(Kd,0.0) * vec4(LightColors[i], 0.0);

                    // eclairement spec / Utilisation de Blinn
                    vec3 H = normalize(L - mV);
                    float dotNH = clamp(dot(Nmod, H), 0.0, 1.0);
                    float S = pow(dotNH, ns);

                    glFragColor += S * vec4(Ks,0.0) * vec4(LightColors[i], 0.0);
                }


                //glFragColor = vec4(Kd, 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialTeapot");
        this.m_LightNumber = nbL;

        // emplacement des variables uniform spécifiques
        this.m_TexDiffuseLoc     = gl.getUniformLocation(this.m_ShaderId, "texDiffuse");
        this.m_TexNormaleLoc     = gl.getUniformLocation(this.m_ShaderId, "texNormale");
        this.m_LightColorsLoc    = gl.getUniformLocation(this.m_ShaderId, "LightColors");
        this.m_LightPositionsLoc = gl.getUniformLocation(this.m_ShaderId, "LightPositions");

        // charge les images
        this.m_TexDiffuse = new Texture2D("data/BenCloward/cobblestones/diffuse.jpg", gl.LINEAR, gl.REPEAT);
        this.m_TexNormale = new Texture2D("data/BenCloward/cobblestones/normal.jpg",  gl.LINEAR, gl.REPEAT);
    }


    /**
     * définit l'ensemble des lampes
     * @param lights : tableau de Light donnant la position des lampes par rapport à la caméra
     */
    setLights(lights)
    {
        // TODO recompiler le shader si le nombre de lampes a changé
        let nblights = lights.length;
        if (nblights != this.m_LightNumber) throw "bad lights number";

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


    select(mesh, matP, matVM)
    {
        // méthode de la superclasse (active le shader)
        super.select(mesh, matP, matVM);

        // activer la texture sur l'unité 0
        this.m_TexDiffuse.setTextureUnit(gl.TEXTURE0, this.m_TexDiffuseLoc);
        this.m_TexNormale.setTextureUnit(gl.TEXTURE1, this.m_TexNormaleLoc);
    }


    deselect()
    {
        // libérer le sampler
        this.m_TexDiffuse.setTextureUnit(gl.TEXTURE0);
        this.m_TexNormale.setTextureUnit(gl.TEXTURE1);

        // méthode de la superclasse (désactive le shader)
        super.deselect();
    }


    destroy()
    {
        // méthode de la superclasse
        super.destroy();

        // supprimer les textures
        this.m_TexDiffuse.destroy();
        this.m_TexNormale.destroy();
    }
}
