/**
 * ttcon.fullscrn.js
 * 
 * A Dojo-plugin for displaying images as full-screen backgrounds in browsers.
 * (c)2010. Csizmadia Tamas, TTcon Kft.
 *
 **/
dojo.provide("ttcon.fullscrn");
dojo.require("dojo.window");
dojo.declare("ttcon.fullscrn", null,{
	constructor: function(/*object*/ args) {
		this.VERSION = "0.5.0";
		this.isCssCapable = this.tryCss();
		
		if (this.isCssCapable) {
			this.imgNode = dojo.create("div", { id: "fullscrn-bg" }, dojo.body(), "first");
		} else {
			this.imgNode = dojo.create("img", { id: "fullscrn-bg" }, dojo.body(), "first");

			dojo.connect(window, "onresize", this, "resize");
		}
		
		this.setImage(args.image);
	},
	onImageLoading: function(/*String*/ src) {
	},
	onImageChanged: function(/*object*/ imgNode) {
	},
	onError: function(/*Event*/ event, /*String*/ message) {
	},
	tryCss: function() {
		var isCapable = false;
		
		if (dojo.isSafari > 4 || dojo.isFF >= 3.6 || dojo.isChrome >= 4) {
			isCapable = true;
		}
		
		return isCapable;
	},
	setImage: function(/*String*/ image) {
		if (dojo.isString(image)) {
			
			var animOut = dojo.fadeOut({ node: this.imgNode });
			
			//We will reference this for the onError event
			var targetNode;
			
			dojo.connect(animOut, "onEnd", this, function(event) {
				//Drop the img and recreate it to forget previous dimensions
				if (this.isCssCapable) {
					//Create a temporary image to trigger onload event
					var tmpImg = dojo.create("img", {
						style: { display: "none" }
					}, dojo.body(), "last");
	
					dojo.addClass(this.imgNode, "fullscrn-css-bg");
					
					targetNode = tmpImg;
				} else {
					dojo.destroy(this.imgNode);
			
					this.imgNode = dojo.create("img", {
						style: { opacity: 0 }, 
						id: "fullscrn-bg"
					}, dojo.body(), "first");
					
					targetNode = this.imgNode;
				}
			
				//Fade the new image when it is fully loaded
				dojo.connect(targetNode, "onload", this, function(event) {
					var animIn = dojo.fadeIn({ node: this.imgNode });
					
					if (this.isCssCapable) {				
						dojo.style(this.imgNode, { backgroundImage: "url('" + image + "')" });
	
						dojo.connect(animIn, "onEnd", this, function() {
							this.onImageChanged(this.imgNode);
							dojo.destroy(tmpImg);
						});
					} else {
						this.resize();
						
						dojo.connect(animIn, "onEnd", this, function() {
							this.onImageChanged(this.imgNode);
						});				
					}
					
					animIn.play();
				});
				
				//Catch that nasty errors!
				dojo.connect(targetNode, "onerror", this, function(event) {
					this.onError(event, "The image '" + image + "' can not be found!");
				});
				
				//Fire the onImageLoading event, because we're about to load the new img
				this.onImageLoading(image);
				
				targetNode.src = image;
			});
			
			animOut.play();
		} else {
			return false;
		}
	},
	resize: function() {
		var viewPort = dojo.window.getBox();
		var bgRatio = viewPort.h / viewPort.w;			
		var calculatedImgWidth, calculatedImgHeight;
		var imgDim = dojo.position(this.imgNode);
		
		//Calculate the new dimensions
		if (bgRatio > (imgDim.h / imgDim.w)) {
			calculatedImgWidth = ((viewPort.h / imgDim.h) * imgDim.w);
			calculatedImgHeight = viewPort.h;
		} else {
			calculatedImgWidth = viewPort.w;
			calculatedImgHeight = ((viewPort.w / imgDim.w) * imgDim.h);
		}
		
		//Resize and center the image
		dojo.marginBox(this.imgNode, {
			w: calculatedImgWidth, 
			h: calculatedImgHeight,
			l: (0 - ((calculatedImgWidth - viewPort.w)) / 2),
			t: (0 - ((calculatedImgHeight - viewPort.h)) / 2)
		});
	}
});