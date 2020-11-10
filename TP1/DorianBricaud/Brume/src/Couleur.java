import java.awt.Color;

/**
 *  Cette classe représente une couleur RVB
 * NB : les composantes sont des réels de 0.0 (noir) à 1.0 (blanc)
 * au cours des calculs, les valeurs peuvent dépasser ces limites
 * mais au moment de l'affichage sur écran, elles seront tronquées,
 * voir la méthode Utils.Clamp.
 */
public class Couleur
{
    // composantes de couleur
    protected float r,v,b;    // 0.0 (noir) à 1.0 (valeur max)


    /**
     *  constructeur par défaut
     */
    public Couleur()
    {
        this(0.0f, 0.0f, 0.0f);
    }

    /**
     * constructeur
     * @param r
     * @param v
     * @param b
     */
    public Couleur(final float r, final float v, final float b)
    {
        this.r = r; this.v = v; this.b = b;
    }
    public Couleur(final double r, final double v, final double b)
    {
        this.r = (float) r; this.v = (float) v; this.b = (float) b;
    }


    /**
     * constructeur à partir d'un vecteur
     * @param v
     */
    public Couleur(final Vecteur v)
    {
        this.r = (v.x+1.0f)/2.0f;
        this.v = (v.y+1.0f)/2.0f;
        this.b = (v.z+1.0f)/2.0f;
    }


    /**
     * constructeur à partir d'un seul float
     * @param g
     */
    public Couleur(final float g)
    {
        this.r = g;
        this.v = g;
        this.b = g;
    }


    /**
     * retourne une représentation affichable
     * @return
     */
    @Override
    public String toString()
    {
        return "Couleur("+r+","+v+","+b+")";
    }


    /**
     * retourne la couleur c1+c2
     * @param c1
     * @param c2
     * @return
     */
    public static Couleur add(final Couleur c1, final Couleur c2)
    {
        return new Couleur(c1.r + c2.r, c1.v + c2.v, c1.b + c2.b);
    }


    /**
     * retourne la couleur this + c
     * @param c
     */
    public Couleur add(final Couleur c)
    {
        return new Couleur(this.r + c.r, this.v + c.v, this.b + c.b);
    }


    /**
     * retourne la couleur c1*c2
     * @param c1
     * @param c2
     * @return
     */
    public static Couleur mul(final Couleur c1, final Couleur c2)
    {
        return new Couleur(c1.r * c2.r, c1.v * c2.v, c1.b * c2.b);
    }


    /**
     * retourne la couleur c*k
     * @param c
     * @param k
     * @return
     */
    public static Couleur mul(final Couleur c, final float k)
    {
        return new Couleur(c.r * k, c.v * k, c.b * k);
    }
    public static Couleur mul(final float k, final Couleur c)
    {
        return new Couleur(c.r * k, c.v * k, c.b * k);
    }


    /**
     * retourne la couleur this * k
     * @param k
     */
    public Couleur mul(final float k)
    {
        return new Couleur(this.r * k, this.v * k, this.b * k);
    }


    /**
     * retourne la couleur this * c
     * @param c
     */
    public Couleur mul(final Couleur c)
    {
        return new Couleur(this.r * c.r, this.v * c.v, this.b * c.b);
    }


    /**
     * retourne la couleur this / k
     * @param k
     */
    public Couleur div(final float k)
    {
        return new Couleur(this.r / k, this.v / k, this.b / k);
    }


    /**
     * retourne la couleur this*(1-k) + c2*k
     * @param k: 0..1
     */
    public Couleur blend(final Couleur c2, float k)
    {
        return add(this.mul(1-k), c2.mul(k));
    }


    /**
     * retourne la couleur this*(1-ck) + c2*ck
     * @param ck: ses composantes spécifient le mélange
     */
    public Couleur blend(final Couleur c2, final Couleur ck)
    {
        Couleur unmoinsk = new Couleur(1-ck.r, 1-ck.v, 1-ck.b);
        return add(this.mul(unmoinsk), c2.mul(ck));
    }



    /**
     * retourne la somme des différences de valeurs des composantes
     * @param c2
     * @return
     */
    public float compare(final Couleur c2)
    {
        return Math.abs(this.r - c2.r) + Math.abs(this.v - c2.v) + Math.abs(this.b - c2.b);
    }


    /**
     * applique une correction pour améliorer le rendu des teintes sombres
     * @param gamma
     */
    public Couleur correctionGamma(float gamma)
    {
        gamma = (float) Math.pow(gamma, 0.8);
        return mul(gamma);
    }

    /**
     * retourne le code couleur pour l'affichage dans un BufferedImage
     * @return
     */
    public int getCode()
    {
        return new Color(Utils.Clamp(r, 0.0f, 1.0f), Utils.Clamp(v, 0.0f, 1.0f), Utils.Clamp(b, 0.0f, 1.0f)).getRGB();
    }
}
