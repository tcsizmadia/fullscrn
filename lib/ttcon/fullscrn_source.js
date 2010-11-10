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
		this.VERSION = "0.4.5";
		this.imgNode = dojo.create("img", { id: "fullscrn-bg" }, dojo.body(), "first");
		
		if (this.fadeOnLoad) {
			dojo.style(this.imgNode, { opacity: 0 });
		}
		
		this.setImage(args.image);
		
		dojo.connect(window, "onresize", this, "resize");		
	},
	onImageLoading: function(/*String*/ src) {
	},
	onImageChanged: function(/*object*/ imgNode) {
	},
	onError: function(/*Event*/ event, /*String*/ message) {
	},
	setImage: function(/*String*/ image) {
		if (dojo.isString(image)) {
			var animOut = dojo.fadeOut({ node: this.imgNode });
			
			dojo.connect(animOut, "onEnd", this, function(event) {
				//Drop the img and recreate it to forget previous dimensions
				dojo.destroy(this.imgNode);
		
				this.imgNode = dojo.create("img", {
					style: { opacity: 0 }, 
					id: "fullscrn-bg"
				}, dojo.body(), "first");
			
				//Fade the new image when it is fully loaded
				dojo.connect(this.imgNode, "onload", this, function(event) {
					this.resize();			
					var animIn = dojo.fadeIn({ node: this.imgNode });
					
					dojo.connect(animIn, "onEnd", this, function() {
						this.onImageChanged(this.imgNode);
					});
					
					animIn.play();
				});
				
				//Catch that nasty errors!
				dojo.connect(this.imgNode, "onerror", this, function(event) {
					this.onError(event, "The image '" + image + "' can not be found!");
				});
				
				//Fire the onImageLoading event, because we're about to load the new img
				this.onImageLoading(image);
				
				this.imgNode.src = image;		
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