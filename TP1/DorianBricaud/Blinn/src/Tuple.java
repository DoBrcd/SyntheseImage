/**
 * Cette classe représente un triplet 3D (x,y,z)
 */
public class Tuple
{
    // variables publiques pour aller plus vite et que ce soit plus pratique à écrire que des getters
    public float x;
    public float y;
    public float z;


    /**
     * constructeur par défaut
     */
    public Tuple()
    {
        x = 0.0f;
        y = 0.0f;
        z = 0.0f;
    }


    /**
     * constructeur
     * @param x
     * @param y
     * @param z
     */
    public Tuple(float x, float y, float z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }


    /**
     * constructeur
     * @param x
     * @param y
     * @param z
     */
    public Tuple(double x, double y, double z)
    {
        this.x = (float) x;
        this.y = (float) y;
        this.z = (float) z;
    }


    /**
     * retourne une représentation affichable
     * @return
     */
    public String toString()
    {
        return "Tuple("+x+","+y+","+z+")";
    }
}
