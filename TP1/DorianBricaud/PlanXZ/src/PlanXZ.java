import org.ini4j.Profile.Section;

public class PlanXZ extends Objet3D{

	protected Point centre;	
	
	public PlanXZ() {
		this.centre = new Point(0, 0, 0);
	}

	/**
     * constructeur à partir d'une section de fichier .ini
     * @param ini
     */
    public PlanXZ(final Section sectionini)
    {
        // centre=<x> <y> <z>
        if (sectionini.containsKey("y0")) {
            String mots = sectionini.get("y0").trim();
            //centre = new Point(Float.parseFloat(mots[0]), Float.parseFloat(mots[1]), Float.parseFloat(mots[2]));
            centre = new Point(0, Float.parseFloat(mots), 0);
        }
        // lire les propriétés communes
        super.parseIni(sectionini);
    }
    
    /**
     * calcule la couleur de l'objet au point désigné par incident
     * si l'objet est réfléchissant, on peut relancer au maximum
     * profondeur rayons indirects
     * @param scene
     * @param incident rayon considéré
     * @param profondeur nombre maximal d'appels récursifs de cette méthode
     * @return
     */
    @Override
    public Couleur getColor(final Scene scene, final Rayon incident, final int profondeur)
    {
        // normale N au niveau du point de contact
        Vecteur N = getNormale(incident);
        
        Point contact = incident.contact;
        float K = 1f;
        boolean inZone = (Math.floor(K * contact.x) + Math.floor(K * contact.z)) % 2 == 0;

        Couleur	KdMod = inZone ? Kd.Inverse() : Kd;
        Couleur	KsMod = inZone ? /*new Couleur(0.1, 0.1, 0.1)*/ Ks : Ks;
        
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
                    eclairement = eclairement.add(KdMod.mul(lampe.getCouleur()).mul(dotNL));
                    
                    // angle entre Rv et L
                    float dotRL = Rmv.dot(L);
                    if (dotRL > 0.0f) {
                        
                        // éclairement spéculaire de Phong
                        eclairement = eclairement.add(KsMod.mul(lampe.getCouleur()).mul((float) Math.pow(dotRL, ns)));
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
            eclairement = eclairement.add(autre.mul(KsMod));
        }
        
        // couleur diffuse de l'objet modulée par l'angle entre N et L
        return eclairement;
    }
	
	@Override
	public float getIntersectionDistance(Rayon incident) {
		float k = (this.centre.y - incident.P.y) / incident.V.y;
		if(k <= 0) k = Constantes.INFINI;
		return k;
	}

	@Override
	public Vecteur getNormale(Rayon incident) {
		return new Vecteur(0.0f, 1.0f, 0.0f);
	}

}
