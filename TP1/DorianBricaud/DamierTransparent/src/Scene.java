import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import org.ini4j.Ini;


/**
 * Cette classe représente l'ensemble des objets à dessiner ainsi que les lampes
 */
public class Scene
{
    // objets
    private final ArrayList<Objet3D> Objets = new ArrayList<>();

    // lumières
    private final ArrayList<Lampe> Lampes = new ArrayList<>();


    /**
     * cette méthode affecte objet, distance et contact avec le plus proche
     * objet rencontré par ce rayon. Elle passe en revue tous les objets sauf
     * celui qui est indiqué dans le paramètre sauflui.
     * Elle calcule les coordonnées du point de contact.
     * @param incident
     * @param sauflui
     * @return
     */
    public boolean getClosestIntersection(final Rayon incident, final Objet3D sauflui)
    {
        // initialisation à aucun contact
        incident.setDistanceObjet(Constantes.INFINI, null);

        Objet3D closest = null;
        float min = Constantes.INFINI;
        for(Objet3D o : Objets) {
            if(o == sauflui) continue;
            float dist = o.getIntersectionDistance(incident);
            if (dist < min) {
                min = dist;
                closest = o;
            }
        }
        incident.setDistanceObjet(min, closest);

        // retourne true s'il y a un contact et dans ce cas, calcule ses coordonnÃ©es, false sinon
        return incident.calcContact();
    }


    /**
     * cette méthode affecte objet, distance et contact avec le premier
     * objet rencontré par ce rayon. Elle passe en revue tous les objets sauf
     * celui qui est indiqué dans le paramètre sauflui.
     * Elle calcule les coordonnées du point de contact.
     * @param incident
     * @param sauflui
     * @return
     */
    public boolean getAnyIntersection(final Rayon incident, final Objet3D sauflui)
    {
        // initialisation à aucun contact
        incident.setDistanceObjet(Constantes.INFINI, null);

        // FIXME programmer la recherche d'un objet intersecté par incident, n'importe lequel, sauf sauflui

        // retourne true s'il y a un contact et dans ce cas, calcule ses coordonnées, false sinon
        return incident.calcContact();
    }


    /**
     * constructeur : charge un fichier de description d'une scène
     * @param nom du fichier scène à charger
     */
    public Scene(final String nom) throws IOException
    {
        readINI(nom);
    }

    private void readINI(final String nom) throws IOException
    {
        // ouvrir le fichier ini avec la bibliothèque
        Ini ini = new Ini();
        ini.load(new FileReader(nom));

        // parcourir toutes les section [Type n°]
        for (String type: ini.keySet()) {
            switch (type.split(" ", 2)[0].toLowerCase()) {

                case "sphere":
                    Objets.add(new Sphere(ini.get(type)));
                    break;

                case "lampe":
                    Lampes.add(new Lampe(ini.get(type)));
                    break;
            }
        }
    }


    /**
     * retourne la liste des lampes
     * @return liste des lampes
     */
    public final ArrayList<Lampe> getLampes()
    {
        return Lampes;
    }
}
