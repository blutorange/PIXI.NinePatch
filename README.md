PIXI.NinePatch
================

Rendering 9Patch containers on a PIXI stage.

This is a fork of [SebastianNette/PIXI.NinePatch](https://github.com/SebastianNette/PIXI.NinePatch) and
updates it for the recent version of PIXI.js and adds support for reading frames from a .json spritesheet. 
Also includes a ruby script for generating a spritesheet json from a standard nine patch (.9.png) image, such
as those created by the [AndroidSDK draw9patch tool](https://developer.android.com/studio/write/draw9patch.html).

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

__width:__ The width of your 9Patch container.

__height:__ The height of your 9Patch container.

__resource:__ A PIXI.loaders.Resource (spritesheet) object. Used as the source for the nine patches. Can also be an object with the texture name as the key and the PIXI.Texture as the value.

Pass an object as the first argument to specify more options. Available options, in addition to the above, are:

__image:__ The name of image to be used. Must include an asterisk for the the counting number (1-9).

__scaleMode:__ One of PIXI.NinePatch.scaleModes.NINEPATCH (the default) or PIXI.NinePatch.scaleModes.DEFAULT. See below.

```javascript
let ninepatch = new PIXI.NinePatch({
    width: 100,
    height: 30,
    resource: resources.ninepatch,
    image: "img/textbox_*.png",
});

stage.addChild(ninepatch);
```

The asterik in the file name will be replaced with the numbers 1 to 9, corresponding to these nine patches:

```
[ 
  1, 2, 3,
  4, 5, 6,
  7, 8, 9
]
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

#### Adding content to the container ####

```javascript

let ninepatch = new PIXI.NinePatch(...);

ninepatch.body.addChild(sprite);

stage.addChild(ninepatch);
```


#### Restoring the Container scale behaviour ####

```javascript
let ninepatch = new PIXI.NinePatch({
    width: width,
    height: height,
    resource: resource,
    scaleMode: PIXI.NinePatch.scaleModes.DEFAULT
});

stage.addChild(ninepatch);
```

or

```javascript

var ninepatch = new PIXI.NinePatch(...);
stage.addChild(ninepatch);

ninepatch.scaleMode = PIXI.NinePatch.scaleModes.DEFAULT;
```
