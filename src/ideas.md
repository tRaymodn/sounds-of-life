first things I want to make a life board that can be played

components
- board
has a size, and to have a cohesive ordering of cells so as to be able to find the neighboring cells of a given one
needs to be able to update (change the state) of each of the individual cells
eventually, each board position I think is going to be associated with a musical note, so each board space has to have its own unique identifier based on its position


- cell
has whether its alive or dead
do we need neighboring cells? probably not becuase that can all be handled by the board




Now
- automate life game, make sequential moves using setTimeout, managing the timeout globally - make speed variable to user
- be able to 
- Add webgl into program - use a single AudioContext in the board and pass it to all of the child cells
Want to associate every cell with a note, so I am thinking of just passing into each cell the hz values of the note that it is going to be playing when active.
- want some interesting designs for note patterns - such that for example chords can be played by having multiple tiles associated with the same note, or just have different notes be different octaves of the same note as well.
- so each cell is going to have its own oscillator, and whether the audio will be playing is dependant on whether the cell is alive or not
- do I want to make the audio part of the cell another component? probably not because currently, there is no html that is going to be displayed on the screen from the audio part, so I can just embed it into the Cell component


chainging board sizes does not work right now
need to disconnect the oscillators and reconnect them with each use, beucase you can't call start() on the same one twice i guess


GOl moves do not stop the noise, maybe the function doesn't get called, or something, but when the tiles die on the board due to GOL, the sounds do not update

Musical Ideas
- maybe arpeggiate notes instead of just playing straight chords somehow - maybe depending on the cells that are alive, we determine some set of them to play notes, or to play them at certain times, to give any state a little song
- different instruments for different life boards
- instead of using real notes from a given scale, just use hz values  applied to the board based on a pattern
- use multiple different scales on x/y axis that complement each other so all the sounds are different and they sound good

