PIXI.NinePatch
================

Rendering 9Patch containers on a PIXI stage.

This is a fork of [SebastianNette/PIXI.NinePatch](https://github.com/SebastianNette/PIXI.NinePatch)
and was modified as follows:

- Support PIXI's new resource loader and reading frames from a spritesheet
  json.
- Support Android SDK ninepatch [AndroidSDK draw9patch tool](https://developer.android.com/studio/write/draw9patch.html).
  file format via a ruby script. Also allows the content body to have different
  position and dimension than the center patch.
- Apply proper scale when the requested width and height is too small.
- Removed unnecessary options (scaleMode, image file name)


#### How to use ####
Simply load the pixi.ninepatch.js file after your pixi.js file.
```
<script src="pixi.js"></script>
<script src="pixi.ninepatch.js"></script>
```

#### Creating a 9 Patch Container ####
```javascript
// Create a loader and load the required resources.
let loader = PIXI.loaders.Loader();
loader.add("ninepatch", "img/ninepatch.json");
loader.add("content", "img/hello.png");

loader.load((loader, resources) => {
    // Create a new ninepatch
    let ninepatch = new PIXI.NinePatch(resources.ninepatch, width, height);

    // Add content at the position indicated by the 9Patch
    ninepatch.body.addChild(new PIXI.SPrite(resources.content.texture));

    // Display the 9Patch by adding it to the PIXI stage
    stage.addChild(ninepatch);
});
```

The constructor is either

__new PIXI.NinePatch(resource, width, height)__

or

__new PIXI.NinePatch(options)__

Options in an object with the following options:

__resource:__ PIXI.loaders.Resource|{key:string,texture:PIXI.Texture}|Array&lt;PIXI.Texture&gt; The nine patches to use. Can be a PIXI.loaders.Resource (spritesheet) object; or an object with the texture name as the key and the PIXI.Texture as the value; or an array with the textures. Textures are used in order of their name.

__width:__ number (optional) The width of your 9Patch container. Defaults to the combined width of the left, middle, and right patches.

__height:__ number (optional) The height of your 9Patch container. Default to the combined height of the top, middle, and bottom patches.

__filter:__ string => boolean (optional) A filter applied when resources are given as an object or PIXI.loaders.Resource. Filters the textures by their name. Useful when loading from a spritesheet also containing other images.

For example:

```javascript
let ninepatch = new PIXI.NinePatch({
    width: 100,
    height: 30,
    resource: resources.ninepatch,
    filter: /textbox_\d*/,
});
stage.addChild(ninepatch);
```

Textures are ordered by their name and used as nine patches as follows
```
  0 1 2
  3 4 5
  6 7 8
```

### Creating the spritesheet resource ###

I included a ruby script for generating the *.json file required by PIXI
from a standard ninepatch.9.png image. You can edit these images for example
with the [Android Studio 9Patch editor](https://developer.android.com/studio/write/draw9patch.html).

```
Usage: ruby 9patch2atlas.rb ninepatch.9.png [pretty]
Output is the input file with the extension replaced by json.
If pretty is given, pretty formats the json
```

#### Adding children ####

The content's location may be different from the location of the middle patch.
Add children to the body container:

```javascript

let ninepatch = new PIXI.NinePatch(...);

ninepatch.body.addChild(sprite);

stage.addChild(ninepatch);
```
