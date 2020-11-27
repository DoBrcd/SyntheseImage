// Définition de la classe Rock

// superclasse et classes nécessaires
Requires("Mesh");
Requires("MaterialProc");


class Rock extends Mesh
{
    /** constructeur */
    constructor()
    {
        // créer le matériau (this n'est pas encore défini)
        let matrock  = new MaterialProc();

        // initialisation de this
        super("Rock", matrock);
        this.m_MatRock = matrock;

        // lire le fichier obj
        this.loadObj("data/rock.obj", this.onRockLoaded);
    }


    /** appelée quand le maillage est chargé */
    onRockLoaded()
    {
        // déterminer la boîte englobante du maillage
        // TODO ce serait à déplacer dans la classe Mesh
        let min = vec3.clone(this.m_VertexList[0].m_Coords);
        let max = vec3.clone(this.m_VertexList[0].m_Coords);
        for (let v of this.m_VertexList) {
            vec3.min(min, min, v.m_Coords);
            vec3.max(max, max, v.m_Coords);
        }

        // centre du volume englobant
        let centre = vec3.create();
        vec3.add(centre, min, max);
        vec3.scale(centre, centre, 0.5);

        // calcul des coordonnées de texture selon le volume
        let coords = vec3.create();
        for (let v of this.m_VertexList) {

            /// faire un calcul correct (en fait, c'est un mapping plan)
            let s = (v.m_Coords[0] - min[0])/(max[0] - min[0]);
            let t = (v.m_Coords[1] - min[1])/(max[1] - min[1]);


            // définition des coordonnées de texture
            v.setTexCoords(s, t);
        }
    }


    /**
     * supprime toutes les ressources allouées dans le constructeur
     */
    destroy()
    {
        // méthode de la superclasse (suppression des VBOs)
        super.destroy();

        // supprimer le matériau
        this.m_MatRock.destroy();
    }
}
