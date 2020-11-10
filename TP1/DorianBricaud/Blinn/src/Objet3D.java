import org.ini4j.Profile.Section;

public abstract class Objet3D
{
    /// couleur diffuse fixe
    protected Couleur Kd = new Couleur();

    /// couleur réfléchie fixe
    protected Couleur Ks = new Couleur();
    protected float ns = 0.0f;


    public Couleur getKd(final Rayon incident)
    {
        return Kd;
    }


    public void setKd(final Couleur Kd2)
    {
        Kd = Kd2;
    }


    public Couleur getKs(final Rayon incident)
    {
        return Ks;
    }


    public void setKs(final Couleur Ks2)
    {
        Ks = Ks2;
    }


    public float getNs(final Rayon incident)
    {
        return ns;
    }


    public void setNs(final float ns2)
    {
        ns = ns2;
    }


    /**
     * calcule la distance du point d'intersection entre this et le rayon
     * ne renvoie pas de point situé "derrière" le rayon
     * @param incident rayon considéré
     * @return Constantes.INFINI si pas d'intersection correcte
     */
    public abstract float getIntersectionDistance(final Rayon incident);


    /**
     * retourne le vecteur normal au point de contact donné par le rayon incident
     * @param incident
     * @return vecteur normalisé
     */
    public abstract Vecteur getNormale(Rayon incident);


    /**
     * calcule la couleur de l'objet au point désigné par incident
     * si l'objet est réfléchissant, on peut relancer au maximum
     * profondeur rayons indirects
     * @param scene
     * @param incident rayon considéré
     * @param profondeur nombre maximal d'appels récursifs de cette méthode
     * @return
     */
    public Couleur getColor(final Scene scene, final Rayon incident, final int profondeur)
    {
        // normale N au niveau du point de contact
        Vecteur N = getNormale(incident);
        
        // Vecteur R-v = miroir de -V par rapport à N
        Vecteur Rmv = N.mul(-2*N.dot(incident.getV())).add(incident.getV());
        
        // éclairement résultant
        Couleur eclairement = new Couleur();
        
        /// boucle sur les lampes
        for (Lampe lampe: scene.getLampes()) {
            
            // construire un rayon partant de la lampe, vers le point de contact
            Rayon lumiere = new Rayon(lampe.getPosition(), incident.getContact());
            
            // this est-il l'objet le plus proche sur le rayon ?
            scene.getClosestIntersection(lumiere, null);
            if (lumiere.getObjet() == this) {
                // pas d'ombre car this est le premier visible de la lampe
            
                // Vecteur L lampe au niveau du point de contact
                Vecteur L = new Vecteur(incident.getContact(), lampe.getPosition()).normalized();
                
                // produit scalaire entre N et L
                float dotNL = N.dot(L);
                if (dotNL > 0.0f) {
                
                    // cumul de l'éclairement de la lampe
                    eclairement = eclairement.add(Kd.mul(lampe.getCouleur()).mul(dotNL));
                    
                    
                    /** Methode PHONG **/
                    /*
                    // angle entre Rv et L
                    float dotRL = Rmv.dot(L);
                    if (dotRL > 0.0f) {
                        
                        // éclairement spéculaire de Phong
                        eclairement = eclairement.add(Ks.mul(lampe.getCouleur()).mul((float) Math.pow(dotRL, ns)));
                    }
                    */
                    
                    /**Methode de Blinn **/
                    
                    Vecteur H = L.sub(incident.getV()).normalized();
                    
                    float dotHN = H.dot(N);
                    if(dotHN > 0.0f) {
                    	eclairement = eclairement.add(Ks.mul(lampe.getCouleur()).mul((float) Math.pow(dotHN, ns)));
                    }
                }
            }
        }
        
        if (profondeur > 0) {
            /// reflets des autres objets
            Rayon reflet = new Rayon(incident.getContact(), Rmv);
            Couleur autre;
            
            // chercher quel objet de la scène le rencontre au plus près
            boolean touche = scene.getClosestIntersection(reflet, this);
            if (touche) {
                // le rayon tape dans un objet, quelle est sa couleur ?
                autre = reflet.getObjet().getColor(scene, reflet, profondeur-1);
            } else {
                // aucun objet, c'est la couleur du ciel
                autre = reflet.getSkyColor();
            }
            
            // ajouter autre à l'éclairement total
            eclairement = eclairement.add(autre.mul(Ks));
        }
        
        // couleur diffuse de l'objet modulée par l'angle entre N et L
        return eclairement;
    }


    protected void parseIni(final Section sectionini)
    {
        // kd=<r> <v> <b>
        if (sectionini.containsKey("Kd")) {
            String[] mots = sectionini.get("Kd").trim().split("[ \t]");
            Kd = new Couleur(Float.parseFloat(mots[0]), Float.parseFloat(mots[1]), Float.parseFloat(mots[2]));
        }

        // Ks=<r> <v> <b> ou Kr=<r> <v> <b>
        if (sectionini.containsKey("Ks")) {
            String[] mots = sectionini.get("Ks").trim().split("[ \t]");
            Ks = new Couleur(Float.parseFloat(mots[0]), Float.parseFloat(mots[1]), Float.parseFloat(mots[2]));
        } else if (sectionini.containsKey("Kr")) {
            String[] mots = sectionini.get("Kr").trim().split("[ \t]");
            Ks = new Couleur(Float.parseFloat(mots[0]), Float.parseFloat(mots[1]), Float.parseFloat(mots[2]));
        }

        // ns=<n>
        if (sectionini.containsKey("ns")) {
            String[] mots = sectionini.get("ns").trim().split("[ \t]");
            ns = Float.parseFloat(mots[0]);
        }
    }

}
