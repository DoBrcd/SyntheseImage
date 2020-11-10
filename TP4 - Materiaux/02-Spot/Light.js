﻿// Définition de la classe Light

class Light
{
    /**
     * constructeur : initialise une lampe, utiliser les setters pour la définir
     */
    constructor()
    {
        this.m_LightColor          = vec3.create();
        this.m_LightPositionScene  = vec4.create();
        this.m_LightDirectionScene  = vec4.create();

        // pour une lampe spot
        this.m_LightCosMinAngle;
        this.m_LightCosMaxAngle;

        // position de la lampe relativement à la caméra
        this.m_LightPositionCamera  = vec4.create();
        this.m_LightDirectionCamera  = vec4.create();
    }


    /**
     * définit la couleur de la lampe, c'est à dire l'intensité
     */
    setColor(r,g,b)
    {
        vec3.set(this.m_LightColor, r,g,b);
        return this;
    }


    /**
     * retourne la couleur de la lampe
     * @return vec3 couleur
     */
    getColor()
    {
        return this.m_LightColor;
    }

    /**
     * définit la position de la lampe par rapport à la scène
     */
    setPosition(x, y, z, w)
    {
        vec4.set(this.m_LightPositionScene, x,y,z,w);
        return this;
    }


    /**
     * retourne la position de la lampe par rapport à la caméra
     * @return vec4 position caméra
     */
    getPosition()
    {
        return this.m_LightPositionCamera;
    }

    /**
     * définit la direction de la lampe par rapport à la scène
     */
    setDirection(x, y, z, w=0)
    {
        vec4.set(this.m_LightDirectionScene, x,y,z,w);
        return this;
    }


    /**
     * retourne la direction de la lampe par rapport à la caméra
     * @return vec4 direction caméra
     */
    getDirection()
    {
        return this.m_LightDirectionCamera;
    }


    /**
     * calcule la position en coordonnées caméra
     * @param matV : mat4 matrice de vue caméra
     */
    transform(matV)
    {
        vec4.transformMat4(this.m_LightPositionCamera,  this.m_LightPositionScene,  matV);
        vec4.transformMat4(this.m_LightDirectionCamera, this.m_LightDirectionScene, matV);
        vec4.normalize(this.m_LightDirectionCamera, this.m_LightDirectionCamera);
    }


    /**
     * définit la couleur de la lampe, c'est à dire l'intensité
     * @param color : vec3 donnant la couleur
     */
    setAngles(minangle, maxangle)
    {
        this.m_LightCosMinAngle = Math.cos(Utils.radians(minangle));
        this.m_LightCosMaxAngle = Math.cos(Utils.radians(maxangle));
        return this;
    }


    /**
     * retourne le cosinus de l'angle de pleine lumière
     * @return float cos(minangle)
     */
    getCosMinAngle()
    {
        return this.m_LightCosMinAngle;
    }


    /**
     * retourne le cosinus de l'angle d'extinction
     * @return float cos(maxangle)
     */
    getCosMaxAngle()
    {
        return this.m_LightCosMaxAngle;
    }
}
