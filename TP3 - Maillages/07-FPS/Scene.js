// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("Grid");
Requires("Pyramide");
Requires("Cow");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les objets à dessiner
        this.m_Grid = new Grid(5, 5);
        this.m_Pyramide = new Pyramide();
        this.m_Cow = new Cow();

        this.m_Fly = false; // Désactive la possibilité de voler
        this.m_Crouch = false; //S'accroupir ou pas 

        // couleur du fond : gris très clair
        gl.clearColor(0.9, 0.9, 0.9, 1.0);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);

        // activer la suppression des faces cachées
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        // gestion souris
        this.m_Azimut = 0.0;
        this.m_Elevation = 0.0;
        this.m_Distance = 15.0; //will disappear
        this.m_InvPosCam = vec3.fromValues(0, -2, 0);
        this.m_Clicked = false;

        // matrices
        this.m_MatP = mat4.create();
        this.m_MatV = mat4.create();
        this.m_MatVM = mat4.create();
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
        /// mettre à jour azimut et hauteur en fonction du mouvement souris
        this.m_Azimut += (x - this.m_MousePrecX) * 0.25;
        this.m_Elevation += (y - this.m_MousePrecY) * 0.25;
        this.m_MousePrecX = x;
        this.m_MousePrecY = y;
    }

    onKeyDown(code)
    {
        let mvt = vec3.create();
        let MatR = mat4.create();
        const pas = 0.3;
        switch (code) {
            case 'Z':
                // move forward
                mvt = vec3.fromValues(0, 0, pas);
                break;
            case 'S':
                // Move backward
                mvt = vec3.fromValues(0, 0, -pas);
                break;
            case 'Q':
                // Move Left
                mvt = vec3.fromValues(pas, 0, 0);
                break;
            case 'D':
                // Move Right
                mvt = vec3.fromValues(-pas, 0, 0);
                break;
            case 'C':
                this.m_Crouch = !this.m_Crouch;
                break;
        }
        mat4.rotateY(MatR, MatR, Utils.radians(-this.m_Azimut));
        mat4.rotateX(MatR, MatR, Utils.radians(-this.m_Elevation));
        vec3.transformMat4(mvt, mvt, MatR);
        vec3.add(this.m_InvPosCam, this.m_InvPosCam, mvt);
        if (!this.m_Fly) {
            if (this.m_Crouch) {
                this.m_InvPosCam[1] = -1;
            } else {
                this.m_InvPosCam[1] = -2;
            }
        }
        // Todo Affecter this.m_MatR puis m_InvPosCam (cf cours)
    }


    onSurfaceChanged(width, height)
    {
        // met en place le viewport
        gl.viewport(0, 0, width, height);

        // matrice de projection
        mat4.perspective(this.m_MatP, Utils.radians(55.0), width / height, 0.1, 30.0);
    }


    onDrawFrame()
    {
        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // positionner la caméra
        mat4.identity(this.m_MatV);
        //mat4.translate(this.m_MatV, this.m_MatV, vec3.fromValues(0, -0.5, -this.m_Distance));

        // rotation demandée par la souris
        mat4.rotateX(this.m_MatV, this.m_MatV, Utils.radians(this.m_Elevation));
        mat4.rotateY(this.m_MatV, this.m_MatV, Utils.radians(this.m_Azimut));
        mat4.translate(this.m_MatV, this.m_MatV, this.m_InvPosCam);

        // dessiner la grille
        this.m_Grid.onDraw(this.m_MatP, this.m_MatV);

        // dessiner plusieurs pyramides
        for (let pos of [
                vec3.fromValues(-2, 0, -1),
                vec3.fromValues( 0, 0, -4),
                vec3.fromValues( 1, 0,  4),
                vec3.fromValues( 3, 0,  1),
                vec3.fromValues( 3, 0, -2),
                vec3.fromValues(-3, 0,  3),
                vec3.fromValues(-4, 0, -2)]) {
            mat4.translate(this.m_MatVM, this.m_MatV, pos);
            this.m_Pyramide.onDraw(this.m_MatP, this.m_MatVM);
        }

        // dessiner la vache en (+1, 0, 0) en la réduisant à 20% de sa taille
        mat4.translate(this.m_MatVM, this.m_MatV, vec3.fromValues(+1, 0, 0));
        mat4.scale(this.m_MatVM, this.m_MatVM, vec3.fromValues(0.2, 0.2, 0.2));
        this.m_Cow.onDraw(this.m_MatP, this.m_MatVM);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_Grid.destroy();
        this.m_Pyramide.destroy();
        this.m_Cow.destroy();
    }
}
