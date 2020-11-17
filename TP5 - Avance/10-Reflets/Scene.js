// Définition de la classe Scene

// classes nécessaires
Requires("Ground");
Requires("Apple");
Requires("Mirror");
Requires("Light");
Requires("Stencil");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les objets à dessiner
        this.m_Ground = new Ground();
        this.m_Apple = new Apple();
        this.m_Mirror = new Mirror();

        // définition de la lampe spot
        this.m_Light = new Light();
        this.m_Light.setColor(80.0, 80.0, 80.0);
        this.m_Light.setPosition(-4.0,  10.0,  4.0, 1.0);
        this.m_Light.setDirection(1.0, -3.5, -1.5, 0.0);
        this.m_Light.setAngles(45.0, 60.0);

        // fournir la lampe aux matériaux pour initialisation
        this.m_Ground.setLight(this.m_Light);
        this.m_Apple.setLight(this.m_Light);

        // effacer l'écran en gris sombre
        gl.clearColor(0.4, 0.4, 0.4, 1.0);

        // configuration OpenGL
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        // gestion souris
        this.m_Azimut    =-20.0;
        this.m_Elevation = 12.0;
        this.m_Distance  = 30.0;
        this.m_Clicked   = false;

        // matrices
        this.m_MatP               = mat4.create();  // projection écran (angle de vue caméra)
        this.m_MatV               = mat4.create();  // scène -> caméra
        this.m_MatVM              = mat4.create();  // objet -> caméra, ex: telle pomme à mettre par rapport à la caméra
        this.m_MatMmirror         = mat4.create();  // transformation du miroir : miroir -> scène
        this.m_MatVMmirror        = mat4.create();  // V * transformation du miroir : miroir -> caméra
        this.m_MatVReflected      = mat4.create();  // matrice V complète (avec la symétrie) pour dessiner la scène à l'envers

        // stencil
        Stencil.init();
    }


    /**
     * appelée quand on appuie sur une touche du clavier
     * @param code : touche enfoncée
     */
    onKeyDown(code)
    {
        switch (code) {
        case 'Z':
            this.m_Distance *= Math.exp(-0.01);
            break;
        case 'S':
            this.m_Distance *= Math.exp(+0.01);
            break;
        }
    }

    onMouseDown(btn, x, y)
    {
        this.m_Clicked = true;
        this.m_MousePrecX = x;
        this.m_MousePrecY = y;
    }

    onMouseUp(btn, x, y)
    {
        this.m_Clicked = false;
    }

    onMouseMove(x, y)
    {
        if (! this.m_Clicked) return;
        this.m_Azimut  += (x - this.m_MousePrecX) * 0.1;
        this.m_Elevation += (y - this.m_MousePrecY) * 0.1;
        if (this.m_Elevation >  90.0) this.m_Elevation =  90.0;
        if (this.m_Elevation < -90.0) this.m_Elevation = -90.0;
        this.m_MousePrecX = x;
        this.m_MousePrecY = y;
    }


    /**
     * appelée quand la taille de la vue OpenGL change
     * @param width : largeur en nombre de pixels de la fenêtre
     * @param height : hauteur en nombre de pixels de la fenêtre
     */
    onSurfaceChanged(width, height)
    {
        // met en place le viewport
        gl.viewport(0, 0, width, height);

        // matrice de projection
        mat4.perspective(this.m_MatP,
            Utils.radians(18.0),                    // angle de champ
            width / height,                         // étirement des pixels
            0.01, 100.0);                           // near et far
    }


    /**
     * dessine les objets de la scène dans la transformation spécifiée par les matrices
     * @param matP : matrice de projection (caméra -> cube unitaire)
     * @param matV : matrice de changement de repère scène -> caméra
     */
    onDraw(matP, matV)
    {

        // calculer la position et la direction de la lampe par rapport à la scène
        this.m_Light.transform(matV);

        // spécifier la lampe aux objets qui les enverront à leurs matériaux
        this.m_Ground.setLight(this.m_Light);
        this.m_Apple.setLight(this.m_Light);

        // dessiner le sol
        this.m_Ground.onDraw(matP, matV);

        // dessiner la pomme normale en réduisant sa taille
        mat4.translate(this.m_MatVM, matV, vec3.fromValues(0.0, 0.0, 5.0));
        mat4.scale(this.m_MatVM, this.m_MatVM, vec3.fromValues(0.03, 0.03, 0.03));
        this.m_Apple.onDraw(matP, this.m_MatVM);

        // TODO dessiner d'autres pommes de la même manière
    }


    /**
     * dessine la scène, avec les lampes et les objets
     */
    onDrawFrame()
    {
        /*** PREPARATION DES MATRICES ***/

        // positionner la caméra
        mat4.identity(this.m_MatV);

        // éloignement de la scène
        mat4.translate(this.m_MatV, this.m_MatV, vec3.fromValues(0.0, -1.5, -this.m_Distance));

        // rotation demandée par la souris
        mat4.rotateX(this.m_MatV, this.m_MatV, Utils.radians(this.m_Elevation));
        mat4.rotateY(this.m_MatV, this.m_MatV, Utils.radians(this.m_Azimut));

        // transformation du miroir par rapport à la scène
        mat4.identity(this.m_MatMmirror);
        // TODO ajouter des transformations pour déplacer et pivoter le miroir

        // transformation du miroir par rapport à la caméra
        mat4.multiply(this.m_MatVMmirror, this.m_MatV, this.m_MatMmirror);

        // matrice de symétrie pour dessiner le reflet de la scène par rapport à la caméra
        mat4.identity(this.m_MatVReflected);
        // TODO faire en sorte que this.m_MatVReflected = this.m_MatV * symétrie z=-z, voir la doc de mat4


        /*** DESSIN ***/

        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );


        /** étape 1 : la découpe du stencil par le miroir **/

        // TODO configurer le stencil en mode "mettre le buffer à 1"

        // dessiner le miroir pour découper le pochoir
        this.m_Mirror.onDraw(this.m_MatP, this.m_MatVMmirror);


        /** étape 2 : le reflet à travers la découpe **/


        // TODO configurer le stencil en mode "ne dessiner que si le stencil est égal à 1"

        // dessiner les objets inversés, avec la matrice de la scène reflétée
        gl.frontFace(gl.CW);
        this.onDraw(this.m_MatP, this.m_MatVReflected);
        gl.frontFace(gl.CCW);

        // ne plus utiliser le stencil
        Stencil.disable();


        /** étape 3 : la surface du miroir par dessus le reflet */

        // superposer le miroir quasi-transparent
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        this.m_Mirror.onDraw(this.m_MatP, this.m_MatVMmirror);
        gl.disable(gl.BLEND);


        /** étape 4 : la scène réelle et le dos du miroir **/

        // dessiner la scène normale sans le miroir
        this.onDraw(this.m_MatP, this.m_MatV);

        // dessiner le miroir à l'envers pour voir son dos de l'autre côté
        gl.frontFace(gl.CW);
        this.m_Mirror.onDraw(this.m_MatP, this.m_MatVMmirror);
        gl.frontFace(gl.CCW);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_Mirror.destroy();
        this.m_Apple.destroy();
        this.m_Ground.destroy();
        this.m_Light.destroy();
        Stencil.destroy();
    }
}
