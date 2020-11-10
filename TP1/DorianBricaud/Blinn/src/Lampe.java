import org.ini4j.Profile.Section;

public class Lampe
{
    // caractéristiques
    protected Point position = new Point(0, 0, 0);
    protected Couleur couleur = new Couleur(1, 1, 1);


    public Lampe()
    {
    }

    public Lampe(final Section sectionini)
    {
        // position=<x> <y> <z>
        if (sectionini.containsKey("position")) {
            String[] mots = sectionini.get("position").trim().split("[ \t]");
            position = new Point(Float.parseFloat(mots[0]), Float.parseFloat(mots[1]), Float.parseFloat(mots[2]));
        }

        // couleur=<r> <v> <b>
        if (sectionini.containsKey("couleur")) {
            String[] mots = sectionini.get("couleur").trim().split("[ \t]");
            couleur = new Couleur(Float.parseFloat(mots[0]), Float.parseFloat(mots[1]), Float.parseFloat(mots[2]));
        }
    }

    public final Point getPosition() {
        return position;
    }

    public final void setPosition(final Point position) {
        this.position = position;
    }

    public final Couleur getCouleur() {
        return couleur;
    }

    public final void setCouleur(final Couleur couleur) {
        this.couleur = couleur;
    }

}
