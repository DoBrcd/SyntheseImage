// Définition de la classe Teapot

// superclasse et classes nécessaires
Requires("Mesh");
Requires("MaterialTeapot");


class Teapot extends Mesh
{
    /** constructeur */
    constructor()
    {
        // matériau
        let matteapot = new MaterialTeapot();

        // initialisation de this
        super("Teapot", matteapot);
        this.m_MatTeapot = matteapot;

        // lire le fichier obj
        this.loadObj("data/teapot.obj", this.onMeshLoaded); // très lent
        //this.loadObj("data/Apple/apple.obj", this.onMeshLoaded);
    }


    /** appelée quand le maillage est chargé */
    onMeshLoaded()
    {
        // attention, c'est TRÈS lent, car le maillage ne gère pas les voisinages
        //this.computeNormals();      // pour avoir des normales conformes aux tangentes (même type de calcul)
        this.computeTangents();
    }


    /**
     * définit les lampes
     * @param lights : tableau de Light donnant la position des lampes par rapport à la caméra
     */
    setLights(lights)
    {
        this.m_MatTeapot.setLights(lights);
    }
}
