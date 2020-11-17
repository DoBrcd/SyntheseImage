// Définition de la classe MaterialProc

// superclasse nécessaire
Requires("Material");


class MaterialProc extends Material
{
    constructor()
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
            out vec4 frgPositionObjet;

            void main()
            {
                frgPositionObjet = vec4(glVertex, 0.0);
                vec4 posCamera = matVM * vec4(glVertex, 1.0);
                gl_Position = matP * posCamera;
                frgTexCoords = glTexCoords;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // temps écoulé
            uniform float time;

            // informations venant du vertex shader
            in vec2 frgTexCoords;
            in vec4 frgPositionObjet;

            // sortie du shader
            out vec4 glFragColor;

            // conversion RGB en HSV
            vec3 rgb2hsv(vec3 c)
            {
                vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
                vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
                vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
                float d = q.x - min(q.w, q.y);
                float e = 1.0e-10;
                return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
            }

            // conversion HSV en RGB
            vec3 hsv2rgb(vec3 c)
            {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            void main()
            {
                // distance au centre de l'espace des textures
                /*float dr = (1.0 - 15.0*distance(frgTexCoords, vec2(0.5 + 0.25*pow(sin(frgTexCoords.s),3.0), 0.5 + 0.25 * (cos(frgTexCoords.t) - pow(cos(frgTexCoords.t),4.0)))))*1.0;
                float dg = (1.0 - 15.0*distance(frgTexCoords, vec2(0.5 + -0.25*pow(sin(frgTexCoords.s),3.0), 0.5 + 0.25 * (cos(frgTexCoords.t) - pow(cos(frgTexCoords.t),4.0)))))*1.0;
                float db = (1.0 - 2.0*distance(frgTexCoords, vec2(0.75 + 0.1 * cos(time), 0.25 + 0.5 * sin(time))) )* 0.0;
*/
                float angle = atan(0.5 - frgTexCoords.t, 0.5 - frgTexCoords.s);
                float d = distance(frgTexCoords, vec2(0.5));
                float r = 0.5+0.7* angle *sin(8.0*6.28*frgTexCoords.s);
                float g = 0.5+0.2* angle *sin(8.0*6.28*frgTexCoords.t );
                float b = (1.0-r)*(1.0-g);

                glFragColor = vec4(r,g,b, 1.0);

                //glFragColor = vec4(dr, dg, db, 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialProc");
    }
}
