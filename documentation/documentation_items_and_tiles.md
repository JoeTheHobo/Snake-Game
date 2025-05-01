## Table of Contents

- [Item and Tile Properties](#documentation-on-how-to-read-items-and-tiles-in-code)
- [Adding new items (And tiles)](#adding-a-new-item-in)
- [Board Status List](#board-status-names)

---

# New Section
# **Documentation on how to read items and tiles in code**

## Shared Properties Between Items and Tiles

### Generic

id - number - Unique number representing the item/tile.

displayName - string - Name that the client sees on their computer

description - string - Tells what the item/tile is and how to use it.

type - ("tile"/"item") - If it's an item or a tile.

tags - array of strings - Which tags refer to the item. Only 1 or 2 are needed, but add as many as you want. Like a sword might have 2 tags ["medieval","weapon"].

showInEditor - boolean - If the item is visible or hidden to the player in the map editor.

visible - boolean - If the item is visible or hidden to the player in the actual game.

name - string - This is the name that we will use when saving images/sound files to this item/tile. Names should be written in all lowercase letters. (In the next two sections I will be writing "itemName" this "name" propetie is what I am refering too)

### Images

**When saving an image to the files for an item, it needs to follow a generic naming convention. All images will be saved in the "img" folder in the "public" folder. Within the "img" folder or two folders for "items" and "tiles" save to the correct one.**

**Naming a item/tile file is done like this: "type_itemName_skin.png**

**Note that "type" is either "item" or "tile"**

**Note that "skin" is refering to which skin is being used for the image. For standard items/tiles the skin should be "basic"**

**To ensure the write image is being used for the item we can access these propeties of the item/tile:**

skin - string - Tells us which skin to use for this item. "basic" is the normal skin to use.

availableSkins - array of strings - Tells use which skin packs are available for this item/tile. If you add more skins to this array, make sure the images are in the correct file for all skins included. Note: we also need to write the "basic" skin in, this array can not be empty.

**More complicated image work**

**An item/tile could have multiple images attached to it. Think of a gate being either open or closed. Both need their own image. We can name this file like this "type_itemName_skin_property1_property2_property3.png"**

**Note: Add only as many properties as you need, be it 1 or 5**

**Now use "baseImgTags" to access these properties within the code**

baseImgTags - array of strings - Tells us in order how to access it's image file. If the array is ["red","open"] and the item name is "gate" and the skin is "basic", and the item type is "item" then the file will be named "item_gate_basic_red_open.png" saved in the "items" folder in the "img" folder in the "public" folder

**Note: Now we need to make sure any varients of this item get rendered. EX: if the gate item has two files "item_gate_basic_red_open.png" and "item_gate_basic_red_closed.png". (An open and closed state). To do that use:**

renderImages - array of arrays of strings - Example: [["red","blue"],["open","closed"]]. This is stating that we have 2 values that this image could be (red/blue) in the first property value. And 2 values (open/closed) this could be in the second property value. So it's saying at some point our gate could be named this: "item_gate_basic_blue_closed.png" **ADVANCED:** You can also write ["*colors"] to get have it automatically write all the 16 board status colors (see [Board Status List](#board-status-names)) or you could write [*colors2] to get all the 16 colors plus "white".



### Sounds 

playSounds - boolean - If this item makes sounds or not. '

soundFolder - string - Tells which folder within the "sounds" folder to use for this item. Often the ItemName.

**-Sound File Format: sounds/itemName/itemName_soundName_versionNumber.mp3**

**-Notice the file is named "itemName_soundName_versionNumber.mp3" within it's own itemName folder, within the sound folder that's in the public folder.**

## Unique Properties To Items

onStartSpawn - number - Tells us how many of these items to spawn at the start of the game round.

specialSpawnWeight - number - When attempting to spawn a random item in how much weight do this item have when trying to spawn in. (Can be 0, it won't spawn in)

spawnCount - When this item does spawn in how many spawn in. (I.E. Tunnels spawn in 2 tunnels when they spawn in)

spawnLimit - false || number - Is there a limit to how many times this item can spawn in durring the game.

## Unique Properties To Tiles

changePlayerSpeed - number - When player is on this tiles multiple this "number" to their speed.

# **Events**

**Events are actions that are colled at specific times. They're like a function for the item/tile. An event could be "onCollision" which means that when the player moves on to the same sqaure as this item/tile then follow the commands within this event. Here are all the events:**

onCollision - Item or Tile - Called when player moves onto this item/tile.

offCollision - Item or Tile - Called when player moves off of this item/tile.

onDelete - Item Only - Called when the item is removed (More on this later.)

onSpawn - Item Only - Called when the item spawns in.

onActivate - Item Only - Called when player activates this item that is in their inventory

whileOn - Tile Only - Called when the player is on the tile (like onCollision, but you can access special properties unqie to whileOn like "playerCanMove")

**Events are objects and have keys inside them. An example event looks like this:**


    onCollision: {
        killPlayer: true,
    },

**Note "killPlayer" is a key. Keys are how we actually do anything within the event. Most keys can be used in any event. (whileOn event has specific keys unqiue to it.)**

## Available Keys

deleteMe - boolean (ITEM ONLY) - If the item should be removed

killPlayer - boolean - Kills the player, no matter their sheilding.

growPlayer - number - Grows the players tail that much

spawnRandomItem - boolean - Attempts to spawn a random item in.

spawn - array of objects like {id: #, count: #} - Spawns in all the items included in the array. ID refers to the id of the ITEM. This can only spawn items in. EX: [{id: 3, count: 5},{id: 1, count: 2}]

playSound - array like [soundName,soundVersion] - if the sound file is named "mouse_die_2" the "die" is the soundName and the "2" is the sound version. Remember the "soundFolder" property of the item is where we are pulling the sound file from.

giveTurbo - Object like {duration: #, moveSpeed: #} - Duration refers to how long this effect lasts. and Movespeed is whats multiplied to the users speed.

pickUp - boolean (ITEM ONLY) - Does this item go into the players inventory

dealDamage - number - Deal this much damage to the player.

equip - string ("head"/"body"/"tail") - Equip this item onto a specific part of their snake.

canvasFilter - Object like {filter: cssFilterString, duration: number, target: johnsTargetSystem} - This creates a filter for x seconds to a specific target. Targets can includes @a - all players. @p - Player who activated the event. @r - Random player, and more.

teleport - itemID - Teleports the player to that item with the same id.

removePlayerItem - array of objects like {name: itemName, count: number} - Attempts to remove each item x (count) times from the players inventory.

switchBoardStatus - boardStatus [Board Status List](#board-status-names) - Gives or Removes the board status from the board.

removeBoardStatus - boardStatus [Board Status List](#board-status-names) - Removes the board status from the board.

addBoardStatus - boardStatus [Board Status List](#board-status-names) - Adds the board status from the board.

switchBaseImgTag - Object like {index: number, switch: [stringA,stringB]} - This will switch between the two strings in the item/tiles "baseImgTags" property at the index provided. Not 0 is the first index.

setBaseImgTag - Object like {index: number, value: string} - Sets the items/tiles baseImageTags property at index to the value.



---

# New Section

# **Board Status Names**
* aquamarine

* blue 

* buff

* coral

* crimsonpurple

* gold

* green

* lemon

* lime

* magenta

* orange

* pink

* red

* skyblue

* slateblue

* venom

***P Will returns the players team status.**

**White is a team color but not a board status. It can't be added to the board. It is like a "no" team color.**



---

# New Section

# **Adding A New Item In**

**In this section we will be adding a new tile "canvas" it will be a paintable tile, it gets colored whatever the users team is.**

* Lets start just by coming up with a name for the tile. I chose canvas, it makes sense.

* Now lets figure out what the image will be for this tile. I will need 17 different variants. One for each team color, and one for white. I will create these files in the "tiles" folder in the "img" folder. The naming of each will look like "tile_canvas_basic_white.png" and all 16 others will be saved there too.

* Now inside the "server_tiles.js" file I will copy and paste the blank tile at the top of the page. And paste it at the bottom

* the id will be changed the next available id. Our case its "12". Here is how I've writting my code:
<pre>
    tiles.push({
        displayName: "Canvas",
        description: "Walk accross this tile to make art!",
        type: "tile",
        name: "canvas",
        skin: "basic",
        availableSkins: ["basic"],
        baseImgTags: ["white"],
        renderImages: [["*colors2"]],
        changePlayerSpeed: 1,
        id: 12,
        visible: true,
        showInEditor: true,
        tags: ["Special"],
    })
</pre>
If you are confused on any of these properties and what they mean read [Item and Tile Properties](#documentation-on-how-to-read-items-and-tiles-in-code)

* Now lets add some functionality. I know I want it to change to colors when the player collides with it. To change the color I'll change the baseImgTags first index, where the "white" is written. So lets add a onCollision event with the setBaseImgTag key.

<pre>
    onCollision: {
        setBaseImgTag: {
            index: 0,
            value: "*P",
        }
    }
</pre>

Note value: "*P" just means the players color.