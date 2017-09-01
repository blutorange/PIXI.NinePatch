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
 * Slightly modified to work the with PIXI's loader and other small
 * modifications to make it work with a recent version of PIXIJs
 * http://github.com/blutorange
 */

(function(PIXI, undefined) {
    /**
     * A NinePatchContainer is a collection of 9 Sprites. 4 corner Sprites, 4 side Sprites and 1 Sprite for the content.
     * - options.image (optional) Base file name, "*" is replaced with the nine patch index (1-9). If not given, uses the first 9 textures of the textures array.
     * - options.resource An array of textures for the nine patches. May also be a PIXI spritesheet resource, which is loaded from a *.json file.
     * - options.width Rendered width of the nine patch.
     * - options.height Rendered height of the nine patch.
     * - options.scaleMode Either PIXI.NinePatch.scaleModes.NINEPATCH or PIXI.NinePatch.scaleModes.DEFAULT
     * @param {width: number, height: number, image: string, resource: Array<PIXI.Texture>|PIXI.Resource, scaleMode: numer} options
     * @class NinePatch
     */
    PIXI.NinePatch = class extends PIXI.Container {
    	constructor(options, _opt1, _opt2) {
	        super();
	
	        if (arguments.length > 1) {
	        	options = {
        			width: _opt1,
        			height: _opt2,
    				resource: options
	        	};
	        }
	        
	        this.scaleMode = options.scaleMode || PIXI.NinePatch.scaleModes.NINEPATCH;
	        
	        this.targetWidth = options.width;
	        this.targetHeight = options.height;
	        
	        this.loaded = 0;
	
	        this.updateCallback = null;
	        this.readyCallback = null;
	
	        let textures = options.resource;
	        if (textures instanceof PIXI.loaders.Resource) {
	        	textures = textures.textures;	        	
	        }
	        
	        // add images
	        if (options.image)
	        	for(var i = 0; i < 9; i++)
	        		this.addChild(textures[options.image]);
	        else
        		this.addChild(...Object.values(textures).map((t) => new PIXI.Sprite(t)));

            // add content container
            this.addChild(new PIXI.Container());

	        // set anchors
	        this.children[2].anchor.set(1, 0);
	        this.children[5].anchor.set(1, 0);
	        this.children[6].anchor.set(0, 1);
	        this.children[7].anchor.set(0, 1);
	        this.children[8].anchor.set(1, 1);
	
	        // quick access
	        this._body = this.children[9];
	        
	        // setup content container
	        this._bodyX = this.children[0].width;
	        this._bodyY = this.children[0].height;
	        this._bodyR = this.children[8].width;
	        this._bodyB = this.children[8].height;
	        if (options.resource instanceof PIXI.loaders.Resource) {
	        	const content = (((options.resource.data||{}).meta)||{}).content;
	        	if (content) {
	        		this._body.position.set(content.x,content.y);
	        		this._bodyX = content.x;
	        		this._bodyY = content.y;
	        		this._bodyR = content.r;
	        		this._bodyB = content.b;
	        	}
	        }
	        
            this.update();
        }
        
        get bodyWidth() {
        	return this._bodyWidth;
    	}
    	
    	get bodyHeight() {
        	return this._bodyHeight;
    	}
    	   	
        get body() {
            return this._body;
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
            if(this.scaleMode === PIXI.NinePatch.scaleModes.DEFAULT) {
                return this.scale.x * this.getLocalBounds().width;
            }
            else {
                return this.scale.x * this.targetWidth;
            }
        }
        
        set width(value) {
            if(this.scaleMode === PIXI.NinePatch.scaleModes.DEFAULT) {
                var width = this.getLocalBounds().width;

                if (width !== 0) {
                    this.scale.x = value / ( width/this.scale.x );
                }
                else {
                    this.scale.x = 1;
                }               
                this._width = value;
            }
            else {
                this.update(value, this.targetHeight);
            }
        }

        /**
         * The height of the NinePatch, setting this will actually modify the scale to achieve the value set
         *
         * @property height
         * @type Number
         */
        get height() {
            if(this.scaleMode === PIXI.NinePatch.scaleModes.DEFAULT)
                return  this.scale.y * this.getLocalBounds().height;
            else
                return this.scale.y * this.targetHeight;
        }
        
        set height(value) {
            if(this.scaleMode === PIXI.NinePatch.scaleModes.DEFAULT) {
                var height = this.getLocalBounds().height;
                if(height !== 0)
                    this.scale.y = value / ( height/this.scale.y );
                else
                    this.scale.y = 1;
                this._height = value;
            }
            else {
                this.update( this.targetWidth, value );
            }
        }

        /**
         * Sets the update callback.
         *
         * @method onUpdate
         * @param callback {Function}
         * @return {NinePatch} The NinePatch container.
         */
        onUpdate(callback) {
            this.updateCallback = callback;	            
            return this;
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

        /**
         * Updates the container dimensions and aligns the sprites.
         *
         * @method update
         * @param width {Number} The containers width.
         * @param height {Number} The containers height.
         */
        update(width, height) {
            // update width if supplied
            if(width !== undefined)
                this.targetWidth = width;

            // update height if supplied
            if(height !== undefined)
                this.targetHeight = height;

            var child;

            // top middle
            child = this.children[1];
            child.position.set(this.children[0].width, 0);
            child.width = this.targetWidth - child.x - this.children[2].width;

            // top right
            child = this.children[2];
            child.position.set(this.targetWidth, 0);

            // middle left
            child = this.children[3];
            child.position.set(0, this.children[0].height);
            child.height = this.targetHeight - child.y - this.children[6].height;

            // middle
            child = this.children[4];
            child.position.set(this.children[1].x, this.children[3].y);
            child.height = this.children[3].height;
            child.width = this.children[1].width;

            // middle right
            child = this.children[5];
            child.position.set(this.targetWidth, this.children[3].y);
            child.height = this.children[3].height;

            // bottom left
            child = this.children[6];
            child.position.set(0, this.targetHeight);

            // bottom middle
            child = this.children[7];
            child.position.set(this.children[1].x, this.targetHeight);
            child.width = this.children[1].width;

            // bottom right
            child = this.children[8];
            child.position.set(this.targetWidth, this.targetHeight);

            this._bodyWidth = this.targetWidth-this._bodyX-this._bodyR;
            this._bodyHeight = this.targetHeight-this._bodyY-this._bodyB;

            // fire custom callback
            if(this.updateCallback)
                this.updateCallback();
        }
    }

    // NinePatch scale modes.
    PIXI.NinePatch.scaleModes = {
        DEFAULT: 1,
        NINEPATCH: 2
    };
})(window.PIXI);
