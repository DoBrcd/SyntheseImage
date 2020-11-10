import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.event.ComponentEvent;
import java.awt.event.ComponentListener;
import java.awt.event.WindowEvent;
import java.awt.event.WindowListener;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.ProgressMonitor;
import javax.swing.SwingWorker;


/**
 * C'est la classe principale du logiciel : elle crée la fenêtre
 * et lance le calcul
 */
public class Main extends JPanel implements ComponentListener
{
    private static final long serialVersionUID = 1L;

    // scène à dessiner dans le canvas
    private final Scene scene;

    // caméra qui voit la scène
    private final Camera camera;

    // le canvas évite de tout redessiner quand une autre fenêtre masque temporairement celle-ci
    private BufferedImage canvas;
    private final ProgressMonitor progressMonitor;



    /**
     * dessin d'un pixel en couleur
     * NB: le pixel est dessiné hors écran, dans le canvas
     * @param couleur
     * @param xe
     * @param ye
     * NB: si Constantes.CHECK est true, alors vérification de xe,ye
     */
    public void drawPixel(final Couleur couleur, final int xe, final int ye)
    {
        // vérification des coordonnées
        if (Constantes.CHECK) {
            if (xe < 0 || ye < 0 || xe >= canvas.getWidth() || ye >= canvas.getHeight()) return;
        }

        // définir la couleur du pixel en limitant les composantes à 0..1 (sinon ça fait planter)
        int code_color = couleur.getCode();

        // dessiner le pixel
        canvas.setRGB(xe, ye, code_color);
    }


    /**
     * calcule la couleur du pixel (xe,ye) (fractionnaire)
     * avec un nombre maximal de reflets possibles
     * @param xe
     * @param ye
     * @param maxReflets
     * @return
     */
    private Couleur getCouleurPixel(final float xe, final float ye, final int maxReflets)
    {
    	Rayon initial = camera.getRayon(xe, ye);

        boolean contact = scene.getClosestIntersection(initial, null);
        
        if(contact) { 
        	Couleur colorObj =  initial.objet.getColor(scene, initial, maxReflets); 
        	
        	
        	float k = Utils.Clamp(initial.getDistance() / 5.0f, 0.0f, 1.0f);
        	
        	Couleur colorWithMist = colorObj.mul(1.0f - k).add(Constantes.BRUME.mul(k));
        	
        	return colorWithMist;
        }

        return Constantes.BRUME;
    }


    /**
     * dessine la totalité de l'image
     * @param task qui gère le dessin
     */
    public void doTracerImage(final TaskTracerImage task)
    {
        // taille de l'image
        int largeur = camera.getLargeur();
        int hauteur = camera.getHauteur();
        System.out.println("image: "+largeur+"x"+hauteur);

        // brouillon rapide (ce dessin est fait en une fraction de secondes)
        final int N = 4;
        for (int ye = 0; ye < hauteur; ye+=N) {
            for (int xe = 0; xe < largeur; xe+=N) {
                // couleur du pixel au centre du carré N*N
                Couleur couleur = getCouleurPixel(xe+N*0.5f, ye+N*0.5f, 1);

                // correction gamma
                couleur = couleur.correctionGamma(0.8f);

                // dessiner les pixels du carré NxN
                for (int dy=0; dy<N; dy++) {
                    for (int dx=0; dx<N; dx++) {
                        drawPixel(couleur, xe+dx,ye+dy);
                    }
                }
            }
        }
        // afficher le brouillon
        repaint();

        // avancement du dessin lent
        progressMonitor.setMaximum(hauteur);
        long startTime = System.nanoTime();

        // passer en revue tous les pixels de l'écran
        for (int ye = 0; ye < hauteur; ye++) {
            // avancement ou arrêt
            if (task.progress(ye)) break;
            // passer en revue tous les pixels de la ligne
            for (int xe = 0; xe < largeur; xe++) {
            	//antialiasong
                Couleur moyenne = new Couleur();
                for(int dy = 0; dy < Constantes.ANTI_ALIAS; dy++) {
                    for(int dx = 0; dx < Constantes.ANTI_ALIAS; dx++) {
                        Couleur couleur = getCouleurPixel(xe+(dx+0.5f)/Constantes.ANTI_ALIAS, ye+(dy+0.5f)/Constantes.ANTI_ALIAS, Constantes.MAX_REFLETS);
                        moyenne = moyenne.add(couleur);
                    }
                }
                //moyenne correcte
                moyenne = moyenne.div(Constantes.ANTI_ALIAS * Constantes.ANTI_ALIAS);
                
                // correction gamma
                moyenne = moyenne.correctionGamma(0.8f);

                // dessiner le pixel de cette couleur
                drawPixel(moyenne, xe,ye);
            }
        }

        if (! task.isCancelled()) {
            long temps = (System.nanoTime() - startTime) / 1000000L;
            System.out.println("Temps: "+temps+" ms soit "+(largeur*hauteur*1000/temps)+" pixels par seconde");

            // afficher l'image (forcer au cas où la fenêtre soit masquée)
            repaint();

            // enregistrement de l'image dans un fichier
            try {
                File outputfile = new File(Constantes.NOM_IMAGE);
                ImageIO.write(canvas, "png", outputfile);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }


    /**
     * Cette classe gère le dessin en arrière-plan pour ne pas bloquer l'interface
     */
    class TaskTracerImage extends SwingWorker<Void, Void>
    {
        @Override
        public Void doInBackground()
        {
            doTracerImage(this);
            return null;
        }

        /**
         * met à jour la jauge d'avancement et regarde si un arrêt a été demandé
         * @param ye ligne en cours de traitement
         * @return true s'il faut interrompre le dessin, false s'il faut continuer
         */
        public boolean progress(final int ye)
        {
            // on s'en soucie seulement 1 ligne sur 8
            if (ye % 8 > 0) return false;

            // si la tâche a été annulée, quitter
            if (isCancelled()) return true;

            // jauge d'avancement
            progressMonitor.setProgress(ye);
            if (progressMonitor.isCanceled() || isDone()) {
                // annuler la tâche
                cancel(true);
                return true;
            }
            if (ye % 16 == 0) repaint();
            return false;
        }

        @Override
        public void done()
        {
            progressMonitor.close();
            repaint();
        }
    }


    private TaskTracerImage task = null;

    private void startTracerImage()
    {
        if (task != null) task.cancel(true);
        task = new TaskTracerImage();
        task.execute();
    }


    /**
     * méthode principale : elle charge la scène, crée l'interface et dessine l'image
     * @param args
     * @throws Exception
     */
    public static void main(final String[] args) throws Exception
    {
        // vérification du paramètre : le nom de la scène à dessiner
        if (args.length != 1) throw new IllegalArgumentException("usage: fournir le nom complet de la scène à dessiner");

        // charger la scène
        final Scene scene = new Scene(args[0]);

        // fenêtre
        final JFrame frame = new JFrame("lancer de rayons");

        // contenu de la fenêtre = panneau contenant un canvas pour dessiner le résultat
        final Main panel = new Main(scene, Constantes.LARGEUR_IMAGE, Constantes.HAUTEUR_IMAGE);
        frame.add(panel);

        // rafraichir l'image quand on active la fenêtre
        frame.addWindowListener(new WindowListener() {

            @Override
            public void windowActivated(final WindowEvent e) {
                panel.repaint();
            }
            @Override public void windowDeiconified(final WindowEvent e) {
                panel.repaint();
            }

            @Override public void windowOpened(final WindowEvent e) {}
            @Override public void windowIconified(final WindowEvent e) {}
            @Override public void windowDeactivated(final WindowEvent e) {}
            @Override public void windowClosing(final WindowEvent e) {}
            @Override public void windowClosed(final WindowEvent e) {}
        });

        // assemblage de la fenêtre
        frame.pack();
        frame.setVisible(true);
        frame.setResizable(true);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }


    public Main(final Scene scene2, final int largeur, final int hauteur)
    {
        // objets de base : scène et caméra
        scene = scene2;
        camera = new Camera(largeur, hauteur);

        // zone de dessin des pixels
        canvas = new BufferedImage(largeur, hauteur, BufferedImage.TYPE_INT_RGB);

        // écouteurs des événements et jauge d'avancement
        addComponentListener(this);
        progressMonitor = new ProgressMonitor(this, "Dessin en cours", "", 0, Constantes.HAUTEUR_IMAGE);
    }


    @Override
    public Dimension getPreferredSize()
    {
        return new Dimension(canvas.getWidth(), canvas.getHeight());
    }


    @Override
    public void paintComponent(final Graphics g)
    {
        super.paintComponent(g);
        // recopier le canvas sur l'écran
        Graphics2D g2 = (Graphics2D) g;
        g2.drawImage(canvas, null, null);
    }


    @Override
    public void componentResized(final ComponentEvent e)
    {
        // créer un pixmap de la taille de la fenêtre
        int largeur = getWidth();
        int hauteur = getHeight();
        canvas = new BufferedImage(largeur,  hauteur, BufferedImage.TYPE_INT_RGB);

        // reconfigurer la caméra
        camera.setSize(largeur, hauteur);

        // dessiner les objets 3D dans le pixmap
        startTracerImage();     // c'est là que tout se passe
    }

    @Override
    public void componentMoved(final ComponentEvent e) {}

    @Override
    public void componentShown(final ComponentEvent e) {}

    @Override
    public void componentHidden(final ComponentEvent e) {}
}
