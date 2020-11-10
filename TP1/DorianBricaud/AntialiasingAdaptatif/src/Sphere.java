import org.ini4j.Profile.Section;

/**
 * Cette classe représente une sphère à dessiner
 */
public class Sphere extends Objet3D
{
    // note: toutes ces variables sont publiques afin de ne pas recourir à des getters

    /// coordonnées du centre
    protected Point centre = new Point();

    /// demi-diamètre
    protected float rayon = 0.0f;


    /**
     * constructeur par défaut
     */
    public Sphere()
    {
    }


    /**
     * constructeur
     * @param centre
     * @param rayon
     */
    public Sphere(final Point centre, final float rayon)
    {
        this.centre = centre;
        this.rayon = rayon;
    }


    /**
     * constructeur à partir d'une section de fichier .ini
     * @param ini
     */
    public Sphere(final Section sectionini)
    {
        // centre=<x> <y> <z>
        if (sectionini.containsKey("centre")) {
            String[] mots = sectionini.get("centre").trim().split("[ \t]");
            centre = new Point(Float.parseFloat(mots[0]), Float.parseFloat(mots[1]), Float.parseFloat(mots[2]));
        }

        // rayon=<n>
        if (sectionini.containsKey("rayon")) {
            String[] mots = sectionini.get("rayon").trim().split("[ \t]");
            rayon = Float.parseFloat(mots[0]);
        }

        // lire les propriétés communes
        super.parseIni(sectionini);
    }


    /**
     * calcule la distance du point d'intersection entre this et le rayon
     * ne renvoie pas de point situé "derrière" le rayon
     * @param incident
     * @return Constantes.INFINI si pas d'intersection correcte
     */
    @Override
    public float getIntersectionDistance(final Rayon incident)
    {
        // polynome en k décrivant les contacts entre le Rayon et this
        Vecteur CP = new Vecteur(centre, incident.P);
        float B = incident.V.dot(CP);
        float C = CP.dot(CP) - rayon*rayon;
        
        // racines de ce polynome
        float delta = B*B - C;
        
        // test d'existence des racines
        if (delta <= 0.0f) return Constantes.INFINI;
        delta = (float) Math.sqrt(delta);
        
        // racines non négatives ou nulles
        float k1 = -B + delta;
        if (k1 <= 0.0f) k1 = Constantes.INFINI;
        float k2 = -B - delta;
        if (k2 <= 0.0f) k2 = Constantes.INFINI;
        
        return Math.min(k1, k2);
    }


    /**
     * retourne le vecteur normal au point de contact donné par le rayon incident
     * @param incident
     * @return
     */
    @Override
    public Vecteur getNormale(final Rayon incident)
    {
    	return new Vecteur(centre, incident.contact).normalized();
    }
}
