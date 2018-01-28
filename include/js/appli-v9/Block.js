/**
 * Code source :
 * https://github.com/hextris/hextris
 */




/**
 * Gestion des blocks
 * 
 * @param {[type]} fallingLane [description]
 * @param {[type]} color       [description]
 * @param {[type]} iter        [description]
 * @param {[type]} distFromHex [description]
 * @param {[type]} settled     [description]
 */
function Block(fallingLane, color, iter, distFromHex, settled) 
{
	// détermine si oui ou non un bloc est reposé sur l'hexagone central ou sur un autre bloc
	this.settled = (settled === undefined) ? 0 : 1;
	this.height = settings.blockHeight;
	
	// l'emplacement où le bloc a été supprimé
	this.fallingLane = fallingLane;

    this.checked=0;
	
	this.angle = 90 - (30 + 60 * fallingLane);// l'angle sous lequel le bloc tombe

	// pour le calcul de la rotation de blocs posés au centre
	this.angularVelocity = 0;
	this.targetAngle = this.angle;
	this.color = color;
	
	this.deleted = 0;// blocs qui sont prévus pour être supprimés
	
	this.removed = 0;// blocs prévu pour être retiré de la suppression et ajoutés au centre
	this.tint = 0;// valeur pour l'opacité du bloc 
	this.opacity = 1;// valeur utilisée pour l'animation de suppression
	
	this.initializing = 1;// booléen lorsque le bloc est en pleine expansion
	this.ict = MainHex.ct;
	this.iter = iter;// vitesse du bloc
	
	this.initLen = settings.creationDt;// nombre d'itérations 
	this.attachedLane = 0;// côté du centre attaché au bloc

	// distance depuis le centre
	this.distFromHex = distFromHex || settings.startDist * settings.scale ;

	this.incrementOpacity = function() 
	{
		if (this.deleted) 
		{
			// ajouter d'une animation de frottement
			if (this.opacity >= 0.925) 
			{
				var tLane = this.attachedLane - MainHex.position;
				tLane = MainHex.sides - tLane;

				while (tLane < 0) 
				{
					tLane += MainHex.sides;
				}

				tLane %= MainHex.sides;
				MainHex.shakes.push({lane:tLane, magnitude:3 * (window.devicePixelRatio ? window.devicePixelRatio : 1) * (settings.scale)});
			}

			// effet de fade out sur l'opacité
			this.opacity = this.opacity - 0.075 * MainHex.dt;

			if (this.opacity <= 0)
			{
				// pour la suppression du bloc
				this.opacity = 0;
				this.deleted = 2;

				if (gameState == 1 || gameState==0)
					localStorage.setItem("saveState", exportSaveState());
			}
		}
	};

	/**
	 * Fournit l'index du bloc dans la pile
	 * 
	 * @return {[type]} [description]
	 */
	this.getIndex = function ()
	{
		var parentArr = MainHex.blocks[this.attachedLane];
		for (var i = 0; i < parentArr.length; i++) 
		{
			if (parentArr[i] == this)
				return i;
		}
	};


	/**
	 * Dessin d'un bloc
	 * 
	 * @param  {[type]} attached [description]
	 * @param  {[type]} index    inutile...
	 * @return {[type]}          [description]
	 */
	this.draw = function(attached, index) 
	{
		this.height = settings.blockHeight;
		if (Math.abs(settings.scale - settings.prevScale) > 0.000000001)
			this.distFromHex *= (settings.scale/settings.prevScale);

		this.incrementOpacity();
		if(attached === undefined)
			attached = false;

		if(this.angle > this.targetAngle)
			this.angularVelocity -= angularVelocityConst * MainHex.dt;
		else if(this.angle < this.targetAngle)
			this.angularVelocity += angularVelocityConst * MainHex.dt;

		if (Math.abs(this.angle - this.targetAngle + this.angularVelocity) <= Math.abs(this.angularVelocity)) 
		{ 
			this.angle = this.targetAngle;
			this.angularVelocity = 0;
		}
		else
			this.angle += this.angularVelocity;
        
		this.width = 2 * this.distFromHex / Math.sqrt(3);
		this.widthWide = 2 * (this.distFromHex + this.height) / Math.sqrt(3);
		//this.widthWide = this.width + this.height + 3;
		var p1;
		var p2;
		var p3;
		var p4;

		if (this.initializing) 
		{
			var rat = ((MainHex.ct - this.ict)/this.initLen);
			if (rat > 1)
				rat = 1;
			
			p1 = rotatePoint((-this.width / 2) * rat, this.height / 2, this.angle);
			p2 = rotatePoint((this.width / 2) * rat, this.height / 2, this.angle);
			p3 = rotatePoint((this.widthWide / 2) * rat, -this.height / 2, this.angle);
			p4 = rotatePoint((-this.widthWide / 2) * rat, -this.height / 2, this.angle);
			
			if ((MainHex.ct - this.ict) >= this.initLen) 
				this.initializing = 0;
			
		}
		else 
		{
			p1 = rotatePoint(-this.width / 2, this.height / 2, this.angle);
			p2 = rotatePoint(this.width / 2, this.height / 2, this.angle);
			p3 = rotatePoint(this.widthWide / 2, -this.height / 2, this.angle);
			p4 = rotatePoint(-this.widthWide / 2, -this.height / 2, this.angle);
		}

		if (this.deleted)
			ctx.fillStyle = "#FFF";
		else if (gameState === 0) 
		{
			if (this.color.charAt(0) == 'r') 
				ctx.fillStyle = rgbColorsToTintedColors[this.color];
			else 
				ctx.fillStyle = hexColorsToTintedColors[this.color];
		}
		else
			ctx.fillStyle = this.color;

		ctx.globalAlpha = this.opacity;
		var baseX = trueCanvas.width / 2 + Math.sin((this.angle) * (Math.PI / 180)) * (this.distFromHex + this.height / 2) + gdx;
		var baseY = trueCanvas.height / 2 - Math.cos((this.angle) * (Math.PI / 180)) * (this.distFromHex + this.height / 2) + gdy;
		ctx.beginPath();
		ctx.moveTo(baseX + p1.x, baseY + p1.y);
		ctx.lineTo(baseX + p2.x, baseY + p2.y);
		ctx.lineTo(baseX + p3.x, baseY + p3.y);
		ctx.lineTo(baseX + p4.x, baseY + p4.y);
		//ctx.lineTo(baseX + p1.x, baseY + p1.y);
		ctx.closePath();
		ctx.fill();

		if (this.tint) 
		{
			if (this.opacity < 1) 
			{
				if (gameState == 1 || gameState==0)
					localStorage.setItem("saveState", exportSaveState());

				this.iter = 2.25;
				this.tint = 0;
			}

			ctx.fillStyle = "#FFF";
			ctx.globalAlpha = this.tint;
			ctx.beginPath();
			ctx.moveTo(baseX + p1.x, baseY + p1.y);
			ctx.lineTo(baseX + p2.x, baseY + p2.y);
			ctx.lineTo(baseX + p3.x, baseY + p3.y);
			ctx.lineTo(baseX + p4.x, baseY + p4.y);
			ctx.lineTo(baseX + p1.x, baseY + p1.y);
			ctx.closePath();
			ctx.fill();
			this.tint -= 0.02 * MainHex.dt;
			if (this.tint < 0)
				this.tint = 0;
		}

		ctx.globalAlpha = 1;
	};
}


function findCenterOfBlocks(arr) 
{
	var avgDFH = 0;
	var avgAngle = 0;
	for (var i = 0; i < arr.length; i++) 
	{
		avgDFH += arr[i].distFromHex;
		var ang = arr[i].angle;
		while (ang < 0) 
		{
			ang += 360;
		}
		
		avgAngle += ang % 360;
	}

	avgDFH /= arr.length;
	avgAngle /= arr.length;

	return {
		x:trueCanvas.width/2 + Math.cos(avgAngle * (Math.PI / 180)) * avgDFH,
		y:trueCanvas.height/2 + Math.sin(avgAngle * (Math.PI / 180)) * avgDFH
	};
}


