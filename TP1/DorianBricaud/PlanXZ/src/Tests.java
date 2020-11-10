import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

/**
 * classe permettant de vérifier quelques fonctions de base du logiciel
 * NB: c'est du JUnit 4
 *
 * Pour exécuter ces tests :
 *  - dans Eclipse : cliquer droit et choisir "Run as..." puis JUnit Test
 *  - en ligne de commande : make tests
 *
 * @author pierre
 *
 */
public class Tests
{

    @Test
    public void testVectorSubtract()
    {
        // test de la soustraction de deux Vecteur
        Vecteur sub = Vecteur.sub(new Vecteur(5,-3,2), new Vecteur(4,-6,7));
        assertEquals( 1.0f, sub.x, Constantes.EPSILON);
        assertEquals( 3.0f, sub.y, Constantes.EPSILON);
        assertEquals(-5.0f, sub.z, Constantes.EPSILON);
    }

    @Test
    public void testVectorConstructor()
    {
        // test de la construction d'un vecteur par deux points
        Vecteur V = new Vecteur(new Point(4,-6,2), new Point(5,-3,7));
        assertEquals( 1.0f, V.x, Constantes.EPSILON);
        assertEquals( 3.0f, V.y, Constantes.EPSILON);
        assertEquals( 5.0f, V.z, Constantes.EPSILON);
    }

    @Test
    public void testVectorDot()
    {
        // test du produit scalaire
        float ps = new Vecteur(-2,-3,-4).dot(new Vecteur(5,6,7));
        assertEquals(-56.0f, ps, Constantes.EPSILON);
    }

    @Test
    public void testVectorNormalize1()
    {
        // test de la normalisation
        Vecteur V = new Vecteur(2,-3,4).normalized();
        assertEquals( 0.371391f, V.x, Constantes.EPSILON);
        assertEquals(-0.557086f, V.y, Constantes.EPSILON);
        assertEquals( 0.742781f, V.z, Constantes.EPSILON);
    }

    @Test
    public void testVectorNormalize2()
    {
        // test de la normalisation
        Vecteur V = new Vecteur(2,3,-4);
        Vecteur.normalize(V);
        assertEquals( 0.371391f, V.x, Constantes.EPSILON);
        assertEquals( 0.557086f, V.y, Constantes.EPSILON);
        assertEquals(-0.742781f, V.z, Constantes.EPSILON);
    }

    @Test
    public void testRayonConstructor()
    {
        // test du constructeur d'un rayon
        Rayon R = new Rayon(new Point(2,-3,4), new Point(5,6,-7));
        assertEquals( 2.0f, R.P.x, Constantes.EPSILON);
        assertEquals(-3.0f, R.P.y, Constantes.EPSILON);
        assertEquals( 4.0f, R.P.z, Constantes.EPSILON);


        assertEquals( 0.206529f, R.V.x, Constantes.EPSILON);
        assertEquals( 0.619586f, R.V.y, Constantes.EPSILON);
        assertEquals(-0.757271f, R.V.z, Constantes.EPSILON);
    }

    @Test
    public void testChercherIntersection1()
    {
        // test de ChercherIntersection
        Sphere sphere = new Sphere(new Point(0,0,10), 2.0f);
        Rayon R1 = new Rayon(new Point(0,0,-10), new Point(0.95f,0,0));
        float d1 = sphere.getIntersectionDistance(R1);
        assertEquals(19.26051f, d1, Constantes.EPSILON);
    }


    @Test
    public void testChercherIntersection2()
    {
        // test de ChercherIntersection
        Sphere sphere = new Sphere(new Point(0,0,10), 2.0f);
        Rayon R2 = new Rayon(new Point(2,0,-10), new Point(2.001f,0,0));
        float d2 = sphere.getIntersectionDistance(R2);
        assertTrue(1e9f < d2);
    }

}
