/**
 * Cette classe définit toutes les constantes utilisées dans l'application
 */
public final class Constantes
{
    // vérification des coordonnées des pixels dessinés dans Main.drawPixel()
    public static final boolean CHECK = false;

    // distance maximale (dépend de la précision des nombres)
    public static final float INFINI = 1e38f;

    // distance minimale (dépend de la taille de la scène)
    public static final float EPSILON = 1e-5f;

    // caméra
    public static final float DISTECRAN = 10.0f;
    public static final float CHAMP = 0.25f;

    // dimensions (initiales) et nom du fichier PNG de sortie
    public static final int LARGEUR_IMAGE = 800;
    public static final int HAUTEUR_IMAGE = 500;
    public static final String NOM_IMAGE = "image.png";

    // nombre de rayons réfléchis successifs
    public static final int MAX_REFLETS = 3;
    
    public static final int ANTI_ALIAS = 5;
    
    public static final Couleur BRUME = new Couleur(0.9, 0.9, 0.9);
}
