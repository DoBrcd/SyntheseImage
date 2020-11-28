// Définition de la classe Rock

// superclasse et classes nécessaires
Requires("Mesh");
Requires("MaterialRock");


class Rock extends Mesh {
    /** constructeur */
    constructor() {
        // créer le matériau (this n'est pas encore défini)
        let matrock = new MaterialRock();

        // initialisation de this
        super("Rock", matrock);
        this.m_MatRock = matrock;

        // lire le fichier obj
        this.loadObj("data/rock.obj", this.onRockLoaded);
    }


    /** appelée quand le maillage est chargé */
    onRockLoaded() {
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
            /*vec3.subtract(coords, v.m_Coords, centre);

            const x = coords[0];
            const y = coords[1];
            const z = coords[2];

            let rho = Math.sqrt(x * x + y * y + z * z);
            let theta = Math.acos(y / rho);
            let phi = Math.acos(-z / Math.sqrt(x * x + y * y));
            if (x < 0) {
                phi = Math.PI * 2 - phi;
            }*/
            /// essai non fonctionnel

            //vec3.add(coords, v.m_Coords, centre);
            /// faire un calcul correct (en fait, c'est un mapping plan)
            let s;
            if (centre[2] - v.m_Coords[2] < 0) {
                s = ((v.m_Coords[0] - min[0]) / (max[0] - min[0])) / 2 + 0.2;
            } else {
                s = ((v.m_Coords[0] - min[0]) / (max[0] - min[0])) / 2 + 0.7;
            }

            if (s > 1)
                s = s - 1;
            let t = (v.m_Coords[1] - min[1]) / (max[1] - min[1]);

            //let s = Math.atan2(coords[2], coords[0])/(2*Math.PI);
            //let t = (Math.asin(coords[1]/vec3.normalize(coords[0], coords[1], coords[2]) )/Math.PI) + 0.5


            // définition des coordonnées de texture
            v.setTexCoords(theta, phi);
        }
    }


    /**
     * supprime toutes les ressources allouées dans le constructeur
     */
    destroy() {
        // méthode de la superclasse (suppression des VBOs)
        super.destroy();

        // supprimer le matériau
        this.m_MatRock.destroy();
    }
}