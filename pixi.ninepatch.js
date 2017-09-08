/**
* The MIT License (MIT)

* Copyright (c) 2014 Sebastian Nette

* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

/**
 * PIXI NinePatch Container
 * Copyright (c) 2014, Sebastian Nette
 * http://www.mokgames.com/
 * https://github.com/SebastianNette/
 */

/**
 * Modified as follows:
 * 
 *  - Support loading from a spritesheet json
 *  - Support Android SDK .9.png file format via a ruby script,
 *    allow the content body to have different position and dimension
 *  - Scale properly when the requested width and height is too small 
 *  - Support the with PIXI's new resource loader
 *  - Removed unnecessary options (scaleMode, image file name)
 *
 * (2017) http://github.com/blutorange
 */

(function(PIXI, undefined) {
    /**
     * A NinePatchContainer is a collection of 9 Sprites. 4 corner sprites, 4
     * side sprites and 1 sprite for the content.
     * - options.resource An array of textures for the nine patches. May also be
     *    a PIXI spritesheet resource, loaded from a *.json file. For a
     *    spritesheet, the textures are ordered by their name.
     * - options.width (optional) Rendered width of the nine patch. Defaults to
     *    the width of the given textures.
     * - options.height (optional) Rendered height of the nine patch. Defaults
     *    to the height of the given textures.
     * - options.smallStrategy (optional) How to render the nine patch when
     *   the requested width or height is smaller than the corners. One of 
     *   PIXI.NinePatch.SmallStrategy.* Defaults to
     *   PIXI.NinePatch.SmallStrategy.SCALE_CORNERS. The following strategies
     *   available:
     *    - SCALE_CORNERS: Only scale those corner patches that would not fit
     *      otherwise. Smoothly transitions at any width/height.
     *    - UPSCALE: Render the nine patch at a larger width/height, and scale
     *      it down to the target width/height.
     *    - IGNORE: Do not do anything, corners will overlap.
     * - options.filter (optional) Filter applied when using a spritesheet
     *   resource. Only textures whose names match are used a patches. For
     *    example, if your patches are on a spritesheet with other images and
     *    the patches are named "mypatch_0.png", "mypatch_1.png" etc., they can
     *    be filtered as follows:
     *      key => /^mypatch_\d*\.png$/.test(key)
     *
     * @param {width: number, height: number, resource: Array<PIXI.Texture>|PIXI.Resource, filter: string => boolean} options
     * @class NinePatch
     */
    PIXI.NinePatch = class extends PIXI.Container {
    	constructor(options, _opt1, _opt2) {
	        super();
	
	        if (arguments.length > 1 || options instanceof PIXI.loaders.Resource) {
	        	options = {
        			width: _opt1,
        			height: _opt2,
    				resource: options
	        	};
	        }
	        
            // allow either a textures array or a PIXI.loaders.Resource object
	        let textures = options.resource;
	        if (textures instanceof PIXI.loaders.Resource)
	        	textures = textures.textures;	        	
	        
	        // add images
	        if (Array.isArray(textures))
	        	for(var i = 0; i < 9; i++)
	        		this.addChild(textures[i]);
	        else
        		this.addChild(...Object.keys(textures)
                    .filter(options.filter || (key => true))
                    .sort()
                    .map(key => new PIXI.Sprite(textures[key])));

	        this._targetWidth = options.width !== undefined ? options.width : (this.children[0].width + this.children[1].width + this.children[2].width);
	        this._targetHeight = options.height !== undefined ? options.height : (this.children[0].height + this.children[3].height + this.children[6].height);

	        // get original patch dimensions
	        this._originalDimensions = [];
	        for(var i = 0; i < 9; i++)
        		this._originalDimensions.push({w: this.children[i].width, h: this.children[i].height});

            // Minimum width and height is given by the patches to the 
            // left+right and top+bottom
            // If requested width or height is smaller, we need to scale.
	        this._minWidth = this._originalDimensions[0].w + this._originalDimensions[2].w;
	        this._minHeight = this._originalDimensions[0].h + this._originalDimensions[2].h;
	        
            // add content container
            this.addChild(new PIXI.Container());

	        // set anchors
	        this.children[2].anchor.set(1, 0);
	        this.children[5].anchor.set(1, 0);
	        this.children[6].anchor.set(0, 1);
	        this.children[7].anchor.set(0, 1);
	        this.children[8].anchor.set(1, 1);
	
	        // content container position
	        this._bodyLeft = this.children[0].width;
	        this._bodyTop = this.children[0].height;
	        this._bodyRight = this.children[8].width;
	        this._bodyBottom = this.children[8].height;
	        if (options.resource instanceof PIXI.loaders.Resource) {
	        	const content = (((options.resource.data||{}).meta)||{}).content;
	        	if (content) {
	        		this.children[9].position.set(content.x,content.y);
	        		this._bodyLeft = content.x;
	        		this._bodyTop = content.y;
	        		this._bodyRight = content.r;
	        		this._bodyBottom = content.b;
	        	}
	        }
	        
            // set strategy for small dimensions
            // this already call update()
            this.smallStrategy = options.smallStrategy;
        }
        
        get bodyDimension() {
        	return {
        		x: this.bodyScaleX * this._bodyLeft,
        		y: this.bodyScaleX * this._bodyTop,
        		w: this.bodyWidth,
        		h: this.bodyHeight
        	};
        }
        
        get bodyWidth() {
            return this._targetWidth - this.bodyScaleX * (this._bodyLeft - this._bodyRight);
    	}
    	
    	get bodyHeight() {
        	return this._targetHeight - this.bodyScaleY * (this._bodyTop - this._bodyBottom);
    	}
    	   	
        get body() {
            return this.children[9];
        }

    	get content() {
    		return this._content;
    	}
	        
        /**
         * The width of the NinePatchContainer, setting this will actually modify the scale to achieve the value set
         *
         * @property width
         * @type Number
         */
        get width() {
            return this.scale.x * this._targetWidth;
        }
        
        set width(value) {
            this.update(value, this._targetHeight);
        }

        /**
         * The height of the NinePatch, setting this will actually modify the scale to achieve the value set
         *
         * @property height
         * @type Number
         */
        get height() {
            return this.scale.y * this._targetHeight;
        }
        
        set height(value) {
            this.update(this._targetWidth, value);
        }

        /**
         * Sets the ready callback.
         *
         * @method onReady
         * @param callback {Function}
         * @return {NinePatch} The NinePatch container.
         */
        onReady(callback) {
            callback();
            return this;
        }

        get bodyScaleX() {
            return this._targetWidth < this._minWidth ? this._targetWidth / this._minWidth : 1;
        }

        get bodyScaleY() {
            return this._targetHeight < this._minHeight ? this._targetHeight / this._minHeight : 1;
        }

        get smallStrategy() {
            return this._smallStrategy;
        }

        set smallStrategy(value) {
            this._smallStrategy = value;
            this.update();
        }

        update(targetWidth, targetHeight) {
            switch (this._smallStrategy) {
            case PIXI.NinePatch.SmallStrategy.UPSCALE:
                this.updateUpscale(targetWidth, targetHeight);
                break;
            case PIXI.NinePatch.SmallStrategy.SCALE_CORNERS:
                this.updateScaleCorners(targetWidth, targetHeight);
                break;
            case PIXI.NinePatch.SmallStrategy.IGNORE:
                this.updateKeep(targetWidth, targetHeight);
                break;
            default:
                this.updateScaleCorners(targetWidth, targetHeight);
            }
        }

        /**
         * Updates the container dimensions and aligns the sprites.
         *
         * @method update
         * @param width {Number} The containers width.
         * @param height {Number} The containers height.
         */
        updateKeep(targetWidth, targetHeight) {
            // update target width and height
            if (targetWidth === undefined)
                targetWidth = this._targetWidth;
            if (targetHeight === undefined)
                targetHeight = this._targetHeight;
            this._targetWidth = targetWidth;
            this._targetHeight = targetHeight;

            // restore original dimensions
            for (let i = 0; i < 9; ++i) {
                this.children[i].width = this._originalDimensions[i].w;
                this.children[i].height = this._originalDimensions[i].h;
            }

            // If the requested width is smaller than the left and right patches
            // we render the nine patch at a higher resolution and scale it
            // down.
            let scaleX = 1;
            let scaleY = 1;
            if (targetWidth < this._minWidth) {
                scaleX = targetWidth/this._minWidth;
            }
            if (targetHeight < this._minHeight) {
                scaleY = targetHeight/this._minHeight;
            }
            
            let child;

            // top left
            // nothing to be done
            
            // top right
            child = this.children[2];
            child.position.set(targetWidth, 0);

            // bottom left
            child = this.children[6];
            child.position.set(0, targetHeight);

            // bottom right
            child = this.children[8];
            child.position.set(targetWidth, targetHeight);

            // top middle
            child = this.children[1];
            child.position.set(this.children[0].width, 0);
            child.width = targetWidth - child.x - this.children[2].width;
            
            // bottom middle
            child = this.children[7];
            child.position.set(this.children[1].x, targetHeight);
            child.width = this.children[1].width;

            // middle left
            child = this.children[3];
            child.position.set(0, this.children[0].height);
            child.height = targetHeight - child.y - this.children[6].height;

            // middle right
            child = this.children[5];
            child.position.set(targetWidth, this.children[3].y);
            child.height = this.children[3].height;

            // middle
            child = this.children[4];
            child.position.set(this.children[1].x, this.children[3].y);
            child.height = this.children[3].height;
            child.width = this.children[1].width;
        }


        /**
         * Updates the container dimensions and aligns the sprites.
         *
         * @method update
         * @param width {Number} The containers width.
         * @param height {Number} The containers height.
         */
        updateScaleCorners(targetWidth, targetHeight) {
            // update target width and height
            if (targetWidth === undefined)
                targetWidth = this._targetWidth;
            if (targetHeight === undefined)
                targetHeight = this._targetHeight;
            this._targetWidth = targetWidth;
            this._targetHeight = targetHeight;

            // restore original dimensions
            for (let i = 0; i < 9; ++i) {
                this.children[i].width = this._originalDimensions[i].w;
                this.children[i].height = this._originalDimensions[i].h;
            }

            // If the requested width is smaller than the left and right patches
            // we render the nine patch at a higher resolution and scale it
            // down.
            let scaleX = 1;
            let scaleY = 1;
            if (targetWidth < this._minWidth) {
                scaleX = targetWidth/this._minWidth;
            }
            if (targetHeight < this._minHeight) {
                scaleY = targetHeight/this._minHeight;
            }
            
            let child;

            // top left
            child = this.children[0];
            child.width *= scaleX;
            child.height *= scaleY;
            
            // top right
            child = this.children[2];
            child.position.set(targetWidth, 0);
            child.width *= scaleX;
            child.height *= scaleY;

            // bottom left
            child = this.children[6];
            child.position.set(0, targetHeight);
            child.width *= scaleX;
            child.height *= scaleY;

            // bottom right
            child = this.children[8];
            child.position.set(targetWidth, targetHeight);
            child.width *= scaleX;
            child.height *= scaleY;

            // top middle
            child = this.children[1];
            if (scaleX < 1)
                child.width = child.height = 0;
            else {
                child.position.set(this.children[0].width, 0);
                child.width = targetWidth - child.x - this.children[2].width;
                child.height *= scaleY;
            }
            
            // bottom middle
            child = this.children[7];
            if (scaleX < 1)
                child.width = child.height = 0;
            else {
                child.position.set(this.children[1].x, targetHeight);
                child.width = this.children[1].width;
                child.height *= scaleY;
            }


            // middle left
            child = this.children[3];
            if (scaleY < 1)
                child.width = child.height = 0;
            else {
                child.visible = true;
                child.position.set(0, this.children[0].height);
                child.width *= scaleX;
                child.height = targetHeight - child.y - this.children[6].height;
            }

            // middle right
            child = this.children[5];
            if (scaleY < 1)
                child.width = child.height = 0;
            else {
                child.position.set(targetWidth, this.children[3].y);
                child.width *= scaleX;
                child.height = this.children[3].height;
            }


            // middle
            child = this.children[4];
            if (scaleX < 1 || scaleY < 1)
                child.width = child.height = 0;
            else {
                child.position.set(this.children[1].x, this.children[3].y);
                child.height = this.children[3].height;
                child.width = this.children[1].width;
            }
        }

        /**
         * Updates the container dimensions and aligns the sprites.
         *
         * @method update
         * @param width {Number} The containers width.
         * @param height {Number} The containers height.
         */
        updateUpscale(targetWidth, targetHeight) {
            // update target width and height
            if (targetWidth === undefined)
                targetWidth = this._targetWidth;
            if (targetHeight === undefined)
                targetHeight = this._targetHeight;
            this._targetWidth = targetWidth;
            this._targetHeight = targetHeight;

            // restore original dimensions
            for (let i = 0; i < 9; ++i) {
                this.children[i].width = this._originalDimensions[i].w;
                this.children[i].height = this._originalDimensions[i].h;
            }

            // If the requested width is smaller than the left and right patches
            // we render the nine patch at a higher resolution and scale it
            // down.
            let scale = 1;
            if (targetWidth < this._minWidth || targetHeight < this._minHeight) {
                const upscaleX = Math.ceil(this._minWidth/targetWidth);
                const upscaleY = Math.ceil(this._minHeight/targetHeight);
                const upscale = upscaleX*upscaleY;
            	targetWidth *= upscale;
            	targetHeight *= upscale;
                scale = 1.0/upscale;
            }
            
            var child;

            // top left
            child = this.children[0];
            
            // top middle
            child = this.children[1];
            child.position.set(this.children[0].width, 0);
            child.width = targetWidth - child.x - this.children[2].width;
            
            // top right
            child = this.children[2];
            child.position.set(targetWidth, 0);

            // middle left
            child = this.children[3];
            child.position.set(0, this.children[0].height);
            child.height = targetHeight - child.y - this.children[6].height;

            // middle
            child = this.children[4];
            child.position.set(this.children[1].x, this.children[3].y);
            child.height = this.children[3].height;
            child.width = this.children[1].width;

            // middle right
            child = this.children[5];
            child.position.set(targetWidth, this.children[3].y);
            child.height = this.children[3].height;

            // bottom left
            child = this.children[6];
            child.position.set(0, targetHeight);

            // bottom middle
            child = this.children[7];
            child.position.set(this.children[1].x, targetHeight);
            child.width = this.children[1].width;

            // bottom right
            child = this.children[8];
            child.position.set(targetWidth, targetHeight);

            // scale down upscaled image
            if (scale !== 1) {
                // horizontal
                for (let i = 0; i < 9; ++i)
                    this.children[i].width *= scale;
                this.children[1].x = this.children[4].x = this.children[7].x = this.children[0].width;
                this.children[2].x = this.children[5].x = this.children[8].x = this._targetWidth;
                // vertical
                for (let i = 0; i < 9; ++i)
                    this.children[i].height *= scale;
                this.children[3].y = this.children[4].y = this.children[5].y = this.children[0].height;
                this.children[6].y = this.children[7].y = this.children[8].y = this._targetHeight;
            }
        }
    }

    PIXI.NinePatch.SmallStrategy = {
        UPSCALE: 0,
        SCALE_CORNERS: 1,
        IGNORE: 2
    };
})(window.PIXI);
