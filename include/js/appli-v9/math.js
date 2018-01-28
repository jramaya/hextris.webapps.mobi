/**
 * Code source :
 * https://github.com/hextris/hextris
 */



/**
 * Gestion de la rotation
 * 
 * @param  {[type]} x     [description]
 * @param  {[type]} y     [description]
 * @param  {[type]} theta [description]
 * @return {[type]}       [description]
 */
function rotatePoint(x, y, theta) 
{
    var thetaRad = theta * (Math.PI / 180);
    var rotX = Math.cos(thetaRad) * x - Math.sin(thetaRad) * y;
    var rotY = Math.sin(thetaRad) * x + Math.cos(thetaRad) * y;

    return {
        x: rotX,
        y: rotY
    };
}


/**
 * Nombre aléatoire entre une valeur mini et maxi
 * 
 * @param  {[type]} min [description]
 * @param  {[type]} max [description]
 * @return {[type]}     [description]
 */
function randInt(min, max) 
{
    return Math.floor((Math.random() * max) + min);
}
