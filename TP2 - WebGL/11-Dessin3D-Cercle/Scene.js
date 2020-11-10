// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("Disque");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les objets à dessiner
        this.m_Disque = new Disque(16);

        // couleur du fond : gris clair
        gl.clearColor(0.9, 0.9, 0.9, 1.0);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);

        // activer la suppression des faces cachées
        //gl.enable(gl.CULL_FACE);
        //gl.cullFace(gl.BACK);

        // créer les matrices utilisées
        this.m_MatView = mat4.create();
        this.m_MatProjection = mat4.create();
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

        // matrice de projection, angle de vue = 15°, permet de voir la pyramide assez grande
        mat4.perspective(this.m_MatProjection, Utils.radians(15.0), width / height, 0.5, 15.0);
    }


    /**
     * Dessine l'image courante
     */
    onDrawFrame()
    {
        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // la caméra étant en (0,0,0) et dirigée vers z<0, on doit décaler la scène en z=-9 (par exemple)
        mat4.identity(this.m_MatView);
        mat4.translate(this.m_MatView, this.m_MatView, vec3.fromValues(0, 0, -9));

        // dessiner le tetraèdre animé
        this.m_Disque.onDraw(this.m_MatProjection, this.m_MatView);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_Disque.destroy();
    }
}
