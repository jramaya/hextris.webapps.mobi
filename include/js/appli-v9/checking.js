/**
 * Code source :
 * https://github.com/hextris/hextris
 */


/**
 * Vérification des formes...
 * 
 */


/**
 * Fontion de recherche dans une matrice 2 dimensions
 * pour voir si elle contient un tableau à une dimension
 *
 * IndexOf ne fonctionne pas dans ce cas
 * 
 * @param  {[type]} twoD [description]
 * @param  {[type]} oneD [description]
 * @return {[type]}      [description]
 */
function search(twoD,oneD)
{
	for(var i=0;i<twoD.length;i++)
	{
		if(twoD[i][0] == oneD[0] && twoD[i][1] == oneD[1]) 
			return true;
	}

	return false;
}


/**
 * Remplir les formes
 * 
 * @param  {[type]} hex      [description]
 * @param  {[type]} side     [description]
 * @param  {[type]} index    [description]
 * @param  {[type]} deleting [description]
 * @return {[type]}          [description]
 */
function floodFill(hex, side, index, deleting) 
{
	if (hex.blocks[side] === undefined || hex.blocks[side][index] === undefined) 
		return;//just makin sure stuff exists
	
	var color = hex.blocks[side][index].color;// sauvegarde la couleur
	
	// boucles for imbriquées pour naviguer dans les blocs	
	for(var x =-1;x<2;x++)
	{
		for(var y =-1;y<2;y++)
		{
			// pour être sur qu'ils ne sont pas en diagonales
			if(Math.abs(x)==Math.abs(y))
				continue;
			
			var curSide =(side+x+hex.sides)%hex.sides;// détermine le côté à explorer
			var curIndex = index+y;// détermine l'index
			
			// pour s'assure que le bloc existe sur le côté avec l'index
			if(hex.blocks[curSide] === undefined)
				continue;
			
			if(hex.blocks[curSide][curIndex] !== undefined)
			{
				// vérifie l'existence de la couleur, 
				// si la forme a déjà été vérifiée et si elle n'a pas été supprimée
				if(hex.blocks[curSide][curIndex].color == color 
					&& search(deleting,[curSide,curIndex]) === false 
					&& hex.blocks[curSide][curIndex].deleted === 0 ) 
				{
					deleting.push([curSide,curIndex]);// ajoute la forme au tableau déjà explorée
					floodFill(hex,curSide,curIndex,deleting);// rappel avec la prochaine forme à explorer
				}
			}
		}
	}
}



function consolidateBlocks(hex,side,index)
{
	// enregistrement avec les côtés qui ont été modifiés
	var sidesChanged =[];
	var deleting=[];
	var deletedBlocks = [];

	deleting.push([side,index]);// ajoute la forme de début
	floodFill(hex,side,index,deleting);

	// il est possible d'effacer au minimum 3 blocs !
	if(deleting.length<3)
		return;

	// égal ou plus de 3 blocs à effacer
	var i;

	for(i=0; i<deleting.length;i++) 
	{
		var arr = deleting[i];

		// vérifie le contenu des tableaux
		if(arr !== undefined && arr.length==2) 
		{
			// ajout aux côtés si pas de changement
			if(sidesChanged.indexOf(arr[0])==-1)
				sidesChanged.push(arr[0]);

			// marque les formes comme supprimées
			hex.blocks[arr[0]][arr[1]].deleted = 1;
			deletedBlocks.push(hex.blocks[arr[0]][arr[1]]);
		}
	}

	// ajoute les scores
	var now = MainHex.ct;
	if(now - hex.lastCombo < settings.comboTime )
	{
		settings.comboTime = (1/settings.creationSpeedModifier) * (waveone.nextGen/16.666667) * 3;
		hex.comboMultiplier += 1;
		hex.lastCombo = now;
		var coords = findCenterOfBlocks(deletedBlocks);
		hex.texts.push(new Text(coords['x'],coords['y'],"x "+hex.comboMultiplier.toString(),"bold Q","#fff",fadeUpAndOut));
	}
	else
	{
		settings.comboTime = 240;
		hex.lastCombo = now;
		hex.comboMultiplier = 1;
	}

	var adder = deleting.length * deleting.length * hex.comboMultiplier;
	hex.texts.push(new Text(hex.x,hex.y,"+ "+adder.toString(),"bold Q ",deletedBlocks[0].color,fadeUpAndOut));
    hex.lastColorScored = deletedBlocks[0].color;

	score += adder;
}


