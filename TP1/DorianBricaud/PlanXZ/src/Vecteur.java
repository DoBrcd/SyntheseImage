/**
 * Cette classe représente un vecteur 3D
 */
public class Vecteur extends Tuple
{
    /**
     * initialise un vecteur allant de p1 à p2
     * @param p1
     * @param p2
     */
    public Vecteur(final Point p1, final Point p2)
    {
        this.x = p2.x - p1.x;
        this.y = p2.y - p1.y;
        this.z = p2.z - p1.z;
    }


    /**
     * constructeur
     * @param x
     * @param y
     * @param z
     */
    public Vecteur(final float x, final float y, final float z)
    {
        super(x,y,z);
    }
    public Vecteur(final double x, final double y, final double z)
    {
        super(x,y,z);
    }


    /**
     * constructeur par défaut : vecteur aléatoire
     */
    public Vecteur()
    {
        x = (float) (Math.random() * 2.0f - 1.0f);
        y = (float) (Math.random() * 2.0f - 1.0f);
        z = (float) (Math.random() * 2.0f - 1.0f);
    }


    /**
     * retourne une représentation affichable
     * @return
     */
    @Override
    public String toString()
    {
        return "Vecteur("+x+","+y+","+z+")";
    }


    /**
     * retourne v*k
     * @param k
     * @param v
     * @return
     */
    public static Vecteur mul(final float k, final Vecteur v)
    {
        return new Vecteur(v.x * k, v.y * k, v.z * k);
    }
    public static Vecteur mul(final Vecteur v, final float k)
    {
        return new Vecteur(v.x * k, v.y * k, v.z * k);
    }


    /**
     * retourne this*k
     * @param k
     * @return
     */
    public Vecteur mul(final float k)
    {
        return new Vecteur(this.x * k, this.y * k, this.z * k);
    }


    /**
     * retourne v/k
     * @param v
     * @param k
     * @return
     */
    public static Vecteur div(final Vecteur v, final float k)
    {
        return new Vecteur(v.x / k, v.y / k, v.z / k);
    }


    /**
     * retourne this/k
     * @param k
     * @return
     */
    public Vecteur div(final float k)
    {
        return new Vecteur(this.x / k, this.y / k, this.z / k);
    }


    /**
     * retourne u+v
     * @param u
     * @param v
     * @return
     */
    public static Vecteur add(final Vecteur u, final Vecteur v)
    {
        return new Vecteur(u.x + v.x, u.y + v.y, u.z + v.z);
    }


    /**
     * retourne this + v
     * @param v
     * @return
     */
    public Vecteur add(final Vecteur v)
    {
        return new Vecteur(this.x + v.x, this.y + v.y, this.z + v.z);
    }


    /**
     * retourne -v
     * @param v
     * @return
     */
    public static Vecteur neg(final Vecteur v)
    {
        return new Vecteur(-v.x, -v.y, -v.z);
    }


    /**
     * retourne -this
     * @return
     */
    public Vecteur neg()
    {
        return new Vecteur(-x, -y, -z);
    }


    /**
     * retourne u-v
     * @param u
     * @param v
     * @return
     */
    public static Vecteur sub(final Vecteur u, final Vecteur v)
    {
        return new Vecteur(
                u.x - v.x,
                u.y - v.y,
                u.z - v.z);
    }


    /**
     * retourne this - v
     * @param v
     * @return
     */
    public Vecteur sub(final Vecteur v)
    {
        return new Vecteur(
                this.x - v.x,
                this.y - v.y,
                this.z - v.z);
    }


    /**
     * calcule le produit scalaire entre this et v
     * @param v
     * @return
     */
    public float dot(final Vecteur v)
    {
        return this.x * v.x  +  this.y * v.y  +  this.z * v.z;
    }


    /**
     * calcule le carré de la norme de this
     * @return
     */
    public float norme2()
    {
        return x*x + y*y + z*z;
    }


    /**
     * calcule la norme de this
     * @return
     */
    public float norme()
    {
        return (float) Math.sqrt(norme2());
    }


    /**
     * tente de normaliser this
     * @return une copie normalisée de this ou this lui-même s'il est nul
     */
    public Vecteur normalized()
    {
        // carré de la norme ?
        float norme2 = norme2();
        if (norme2 < Constantes.EPSILON) return this; // vecteur quasi-nul, pas traitable

        // diviser les composantes par la norme actuelle
        float norme = (float) Math.sqrt(norme2);
        return new Vecteur(x/norme, y/norme, z/norme);
    }


    /**
     * tente de normaliser le vecteur V
     * @param le vecteur à normaliser
     */
    public static void normalize(final Vecteur V)
    {
        // carré de la norme ?
        float norme2 = V.norme2();
        if (norme2 < Constantes.EPSILON) return; // vecteur quasi-nul, pas traitable

        // diviser les composantes par la norme actuelle
        float norme = (float) Math.sqrt(norme2);
        V.x /= norme;
        V.y /= norme;
        V.z /= norme;
    }


    /**
     * calcule le produit vectoriel entre this et v
     * @param v
     * @return
     */
    public static Vecteur cross(final Vecteur u, final Vecteur v)
    {
        return new Vecteur(
            u.y*v.z - u.z*v.y,
            u.z*v.x - u.x*v.z,
            u.x*v.y - u.y*v.x
        );
    }


    /**
     * retourne le vecteur u pivoté selon l'axe et l'angle
     * @param axe
     * @param angle
     * @return
     */
    public static Vecteur rotate(final Vecteur u, final Vecteur axe, final float angle)
    {
        // formule de la rotation de Rodrigues :
        // cos(a)*U + (1-cos(a))(U.N)*N + sin(a)*(N^U)
        float cosa = (float) Math.cos(angle);
        float cosam1 = 1.0f - cosa;
        float sina = (float) Math.sin(angle);
        float udotn = u.dot(axe);
        Vecteur NcrossU = Vecteur.cross(axe, u);
        return new Vecteur(
                cosa*u.x + cosam1*udotn*axe.x + sina*NcrossU.x,
                cosa*u.y + cosam1*udotn*axe.y + sina*NcrossU.y,
                cosa*u.z + cosam1*udotn*axe.z + sina*NcrossU.z
        );
    }
}
