
/**
 * TODO classe à revoir : calcul de la projection pas super
 * @author pierre
 *
 */
public class Camera
{
	// dimensions et échelle du dessin
    private int largeur;
    private int hauteur;
    private float echelle;


    // caméra
    private final Point Oeil = new Point(0,0, -Constantes.DISTECRAN);


    public Camera(final int largeur2, final int hauteur2)
    {
        setSize(largeur2, hauteur2);
    }


    public Rayon getRayon(final float xe, final float ye)
    {
        Point pixel = new Point((xe-largeur*0.5f)/echelle, (hauteur*0.5f-ye)/echelle, 0);
        Vecteur direction = new Vecteur(Oeil, pixel).normalized();
        return new Rayon(pixel, direction);
    }


    public void setSize(final int largeur2, final int hauteur2)
    {
        largeur = largeur2;
        hauteur = hauteur2;

        // facteur d'agrandissement qui dépend de la taille de la vue
        echelle = Math.max(largeur, hauteur) * Constantes.CHAMP;
        //System.out.println("camera: "+largeur+"x"+hauteur+" => "+echelle);
    }


    public int getLargeur()
    {
        return largeur;
    }


    public int getHauteur()
    {
        return hauteur;
    }
}
