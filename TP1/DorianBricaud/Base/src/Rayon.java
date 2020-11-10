
/**
 * Cette classe représente une demi-droite partant d'un point P et de vecteur directeur V
 * elle est donc orientée dans le sens V.
 * Cette classe représente aussi le point de contact avec le plus proche objet
 * rencontré : le numéro de l'objet, sa distance à P et le point de contact
 */
public class Rayon
{
    /// origine de la demi-droite
    protected Point P;

    /// vecteur directeur obligatoirement normalisé
    protected Vecteur V;

    // plus proche objet rencontré ou null si aucun
    protected Objet3D objet;

    /// distance du point de contact ou Constantes.INFINI si aucun
    protected float distance;

    /// coordonnées du point de contact
    protected Point contact;


    /**
     * constructeur par défaut
     */
    public Rayon()
    {
    }


    /**
     * construit un rayon partant de P1 et allant dans la direction P1,P2
     * @param P1
     * @param P2
     */
    public Rayon(final Point P1, final Point P2)
    {
        P = P1;
        V = new Vecteur(P1,P2).normalized();
    }


    /**
     * construit un rayon partant de P et allant dans la direction V
     * @param P
     * @param V considéré comme déjà normalisé
     */
    Rayon(final Point P, final Vecteur V)
    {
        this.P = P;
        this.V = V; //.normaliser(); inutile car tous les appels se font avec un vecteur normalisé
    }


    public Point getP()
    {
        return P;
    }


    public Vecteur getV()
    {
        return V;
    }


    public Objet3D getObjet()
    {
        return objet;
    }


    public Point getContact()
    {
        return contact;
    }


    public float getDistance()
    {
        return distance;
    }


    /**
     * retourne le carré de la distance de contact avec l'objet
     * @return
     */
    public float getDistance2()
    {
        return distance*distance;
    }


    /**
     * initialise la distance de contact et l'objet concerné
     * @param distance
     * @param objet
     */
    public void setDistanceObjet(float distance, final Objet3D objet)
    {
        this.distance = distance;
        this.objet = objet;
    }


    /**
     * calcule les coordonnées du point de contact s'il y en a un
     * @return true si c'est le cas, false si aucun contact
     */
    public boolean calcContact()
    {
    	if(distance >= Constantes.INFINI) return false;
    	contact = P.add(V.mul(distance));
        // calculer les coordonnées du point de contact en fonction de P, V et distance
    	return true;
    }


    /**
     * renvoie la couleur du "ciel" vu dans cette direction
     * @return du bleu si le rayon va vers le haut, du vert/marron s'il va vers le bas
     */
    public Couleur getSkyColor()
    {
        // deux hémisphères, selon que V va vers le haut ou vers le bas
        if (V.y > 0.0f) {
            // dégradé de bleu selon V.y
            final Couleur bleu_clair = new Couleur(0.7, 0.7, 1.0);
            final Couleur bleu_sombre = new Couleur(0.0, 0.0, 1.0);
            return Couleur.add( bleu_clair.mul(1.0f-V.y), bleu_sombre.mul(V.y) );
        } else {
            // léger dégradé de marron clair/vert   ATTENTION, ce n'est pas un "sol" car il est à l'infini.
            return new Couleur(0.5, 0.4+0.2*V.y, 0.1);
        }
    }
}
