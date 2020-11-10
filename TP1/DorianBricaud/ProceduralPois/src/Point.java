/**
 * Cette classe représente un point 3D
 */
public class Point extends Tuple
{
    /**
     * constructeur
     * @param x
     * @param y
     * @param z
     */
    public Point(float x, float y, float z)
    {
        super(x, y, z);
    }


    /**
     * constructeur par défaut
     */
    public Point()
    {
        super();
    }


    /**
     * retourne une chaîne décrivant le point
     */
    @Override
    public String toString()
    {
        return "Point("+x+","+y+","+z+")";
    }


    /**
     * retourne un point correspondant à this + v
     * @param u
     * @param v
     * @return
     */
    public static Point add(Point u, Vecteur v)
    {
        return new Point(u.x + v.x, u.y + v.y, u.z + v.z);
    }


    /**
     * retourne this + v
     * @param v
     * @return
     */
    public Point add(Vecteur v)
    {
        return new Point(this.x + v.x, this.y + v.y, this.z + v.z);
    }
}
