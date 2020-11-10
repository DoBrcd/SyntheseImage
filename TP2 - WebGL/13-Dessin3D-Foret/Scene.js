// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("Cone");
Requires("Grille");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les objets à dessiner
        this.m_Cone = new Cone(64);
        this.m_Grille = new Grille(4, 0.5, "(0.8, 0.8, 0.8)");

        // couleur du fond : gris clair
        gl.clearColor(0.9, 0.9, 0.9, 1.0);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);

        // activer la suppression des faces cachées
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        // créer les matrices utilisées
        this.m_MatView = mat4.create();
        this.m_MatProjection = mat4.create();
        this.m_MatViewModel = mat4.create();
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
        mat4.perspective(this.m_MatProjection, Utils.radians(15.0), width / height, 0.5, 15.0);
    }


    /**
     * Dessine l'image courante
     */
    onDrawFrame()
    {
        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // positionner la caméra en (0,0,9), c'est à dire la scène est décalée en z=-9
        mat4.identity(this.m_MatView);
        mat4.translate(this.m_MatView, this.m_MatView, vec3.fromValues(0, 0, -9));
        mat4.rotateX(this.m_MatView, this.m_MatView, Utils.radians(20.0));

        this.m_Grille.onDraw(this.m_MatProjection, this.m_MatView);

        // dessiner plusieurs cones de ci, de la
        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(-1, 0, 0));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);

        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(1, 0, 0));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);
        
        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(-1, 0, 1));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);

        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(1, 0, 1));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);

        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(-0.5, 0, 0));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);

        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(0.5, 0, 0));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);
        
        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(-0.15, 0, 0));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);

        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(0.15, 0, 0));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);

        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(-0.5, 0, 1));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);

        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(0.5, 0, 1));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);
        
        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(-0.15, 0, 1));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);

        mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(0.15, 0, 1));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.2, 0.2))
        this.m_Cone.onDraw(this.m_MatProjection, this.m_MatViewModel);
    
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_Cone.destroy();
    }
}
