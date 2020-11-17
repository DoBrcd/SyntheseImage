// Définition de la classe Mirror

// superclasse et classes nécessaires
Requires("Mesh");
Requires("MaterialMirror");


class Mirror extends Mesh
{
    /**
     * Constructeur
     */
    constructor()
    {
        // créer le matériau (this n'est pas encore défini)
        let material = new MaterialMirror();

        // initialisation de this
        super("Mirror", material);
        this.m_Material = material;

        // sommets
        let P1 = new Vertex(this, -3.0,  0.0, 0.0);
        let P2 = new Vertex(this, +3.0,  0.0, 0.0);
        let P3 = new Vertex(this, +3.0, +4.5, 0.0);
        let P4 = new Vertex(this, -3.0, +4.5, 0.0);

        // quadrilatère
        this.addQuad(P1, P2, P3, P4);

        // le maillage peut être dessiné
        this.setReady();
    }


    /**
     * supprime toutes les ressources allouées dans le constructeur
     */
    destroy()
    {
        // méthode de la superclasse (suppression des VBOs)
        super.destroy();

        // supprimer le matériau
        this.m_Material.destroy();
    }
}
