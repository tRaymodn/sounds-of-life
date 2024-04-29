import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import Cell from './Cell.js'
import '../styles/Board.css'
import * as Tone from 'tone'

export default class Board extends Component {

    constructor(props){
        super(props);
        this.state = {
            size: props.size,
            cells: this.createBoard(props.size),
            //lifePlaying: this.handleLifePlaying(props.lifePlaying, props.speed),
            lifePlaying: null,
            context: props.context,
            audioMap: null,
            torus: props.torus,
            volume: new Tone.Volume(props.volume),
            type: props.type,
            golSpeed: 800,
            rowScale: "dom7",
            colScale: "min7",
            baseNote: 125,
        }
        this.handleCellClick = this.handleCellClick.bind(this);
        this.idNumber = props.idNumber;
        this.volumeChangeFunc = props.volumeChangeFunc;
        this.styleSheet = props.styleSheet;
        this.scales = props.scales;
    }

    componentDidMount(){ // doing this to see if it can help create the audioContext for newly created boards
        if(this.state.context){ 
            this.createAudioMap(this.state.size);
        }
    }

    handleLifePlaying(componentInput, speed){
        if(!componentInput){
            return null
        }
        else{
            return setInterval(this.golMove, speed)
        }
    }

    countAliveNeighbors(board, row, col) {
        // Count the number of alive cells around the given cell (row, col)
        let count = 0;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
      
        for (const [dx, dy] of directions) {
            let newRow = row + dx;
            let newCol = col + dy;

            if(this.state.torus){ // if wrapping, get correct mod positions
                if(newRow < 0) newRow = (board.length+newRow)%board.length;
                else if(newRow > board.length-1) newRow = newRow%board.length;

                if(newCol < 0) newCol = (board.length+newCol)%board.length;
                else if(newCol > board.length-1) newCol = newCol%board.length;
            }
            else{ // else set newRow/col to -1
                if(newRow < 0 || newRow > board.length-1) newRow = -1;

                if(newCol < 0 || newCol > board.length-1) newCol = -1;
            }
            
            if(newRow !== -1 && newCol !== -1){ // check for -1, and don't add to count if we are checking an edge on a non-torus board
                if (board[newRow].props.children[newCol].props.alive === true) {
                    count++;
                }
            }
        }
      
        return count;
    }

    playSound(row, col){
        let soundObj = this.state.audioMap.get(`${row}-${col}`);

        if(soundObj.note !== 0){ // notes that have 0 as their note are just not played
            soundObj.synth.triggerAttack(soundObj.note, Tone.now());   
        }
        
    }

    playRandomSound(row, col){
        let soundObj = this.state.audioMap.get(`${row}-${col}`);

        let sound = soundObj.note[Math.floor(Math.random()*soundObj.note.length)];

        if(sound !== 0){
            soundObj.synth.triggerAttack(sound, Tone.now());   
        }
        
    }

    stopSound(row, col){
        let soundObj = this.state.audioMap.get(`${row}-${col}`);

        if(soundObj.note !== 0){ // stop the note if there was one playing to begin with
            soundObj.synth.triggerRelease(Tone.now());
        }
           
    }


    // creates an audiomap of row-col positions and sets the state of this.state.audioMap
    createAudioMap(size){ //TODO: if 
        console.log(this.state.volume)
        this.state.volume.toDestination();
        let newMap = new Map();
        for(let i = 0; i < size; i++){
            for(let j = 0; j < size; j++){
                if(this.props.context !== null && this.props.context !== undefined){ 
                    let synth = new Tone.Synth().connect(this.state.volume);  
                    let note;
                    switch(this.state.type){ // create AudioMap based on state.type
                        case "glideChange":
                            note = this.gliderBoardMultipleSounds(i,j);
                            break;
                        case "glide":
                            note = this.gliderBoardSounds(i,j);
                            break;
                        case "chordBoard":
                            note = this.chordBoard(i, j, this.state.rowScale, this.state.colScale);
                            break;
                        case "barber":
                            note = this.barberPoleBoard(i, j, this.state.rowScale, this.state.colScale);
                            break;
                        default:
                            note = this.gliderBoardSounds(i,j);
                            break;
                    }     
                    newMap.set(`${i}-${j}`, {note: note, synth: synth}); 
                }
            }
        }
        this.setState({audioMap: newMap});
    }

    // disconnect all synths from audio output and reconnect them to the new one for the state
    connectNewAudio(){
        this.state.volume.toDestination()
        this.state.audioMap.forEach((value, key) => {
            value.synth.disconnect().connect(this.state.volume)
        })
    }

    // disconnects all the synths - stops them all from playing
    disconnectAllSynths(){
        if(this.state.audioMap){
            this.state.audioMap.forEach((value, key) => {
                value.synth.disconnect()
            }) 
        }
    }

    handleCellClick = (row, col) => {
        this.setState(prevState => {
            const newCells = [...prevState.cells]; // Create a copy of the cells array
            // Create a new Cell component with updated alive prop
            const updatedCell = React.cloneElement(newCells[row].props.children[col], {
                alive: !newCells[row].props.children[col].props.alive
            });
            // Update the cells array with the updated cell component
            newCells[row] = React.cloneElement(newCells[row], { children: [...newCells[row].props.children.slice(0, col), updatedCell, ...newCells[row].props.children.slice(col + 1)] });
            return { cells: newCells };
        });
    }

    shouldComponentUpdate(prevProps, prevState){
        if(prevState.size !== this.state.size){ // when board size changes
            console.log("boardUpdate - size");
            return true;
        }
        else if(prevProps.torus !== this.props.torus){ // if golWrapping changes
            console.log('board update - torus' )
            return true;
        }
        else if(prevState.type !== this.state.type){ // the audio map for this board is changing
            console.log("boardUpdate - audioMap");
            return true;
        }
        else if(prevProps.context !== this.state.context){ // when audio context changes (is populated)
            console.log("boardUpdate - context");
            return true;
        }
        else if(prevProps.volume !== this.props.volume){ // when the volume changes
            console.log("boardUpdate - volume");
            return true;
        }
        else if(prevState.baseNote !== this.state.baseNote){ // when the base note changes
            console.log("board update - base note change");
            return true;
        }
        else if(prevProps.lifePlaying !== this.props.lifePlaying || prevProps.speed !== this.props.speed){ // when global playing or volume changes
            console.log("board update - global playing or volume")
            return true;
        }
        else if(this.state.cells.length !== prevState.cells.length){ // when the length of the cells variable changes
            console.log("boardUpdate - cells size");
            return true;
        }
        else if(this.state.rowScale !== prevState.rowScale || this.state.colScale !== prevState.colScale){
            console.log("boardUpdate - row/col chordBoard Changes")
            return true;
        }
        for(let i = 0; i < this.state.size; i++){ // if any of the alive states of the children differ from the prev state
            for(let j = 0; j < this.state.size; j++){
                if(prevState.cells[i].props.children[j].props.alive != this.state.cells[i].props.children[j].props.alive){
                    console.log("boardUpdate - cell difference")
                    return true;
                }
            }
        }
        return false;
    }

    componentDidUpdate(prevProps, prevState) {
        console.log(this.state.audioMap, this.state.context)
        if (prevState.size !== this.state.size) { // update board size, cells, and audioMap when size changes
            this.setState({cells: this.createBoard(this.state.size)}, () => {
                try{
                    this.styleSheet.deleteRule(this.idNumber)
                }
                catch(error){
                    console.log("rule did not exist(not really a problem)" + error)
                }
                this.styleSheet.insertRule(`#board${this.idNumber} {margin-left: ${50 - this.state.size/2 + 2}%}`, this.idNumber) // change the margin size for this board
                if(this.props.context !== null){
                  this.createAudioMap(this.state.size);  
                }
            })
        }
        else if(this.props.context !== this.state.context && this.props.context !== null){ // if context is different and not null, create audio map
            this.setState({context: this.props.context}, () => {
                this.createAudioMap(this.state.size)
            })
        }
        else if(prevState.type !== this.state.type){ // if type is different in new state, create a new audio mapping for the board
            this.setState({cells: this.createBoard(this.state.size)}, () => {
                if(this.props.context !== null){
                  this.createAudioMap(this.state.size);  
                }
            })
        }
        else if(prevState.rowScale !== this.state.rowScale || prevState.colScale !== this.state.colScale){ // if row or column scale changed
            this.setState({cells: this.createBoard(this.state.size)}, () => {
                this.disconnectAllSynths();
                this.createAudioMap(this.state.size); 
            })
        }
        else if(prevProps.torus !== this.props.torus){ // if wrapping value changed
            this.setState({torus: this.props.torus});
        }
        else if(prevProps.volume !== this.props.volume){ // if the volume changed - need to reconnect all synths to the new volume
            console.log(this.props.volume)
            this.setState({volume: new Tone.Volume(this.props.volume)}, () => {
                this.connectNewAudio() // this should reconnect the synths to the new volume
            });
        }
        else if(prevState.baseNote !== this.state.baseNote){ // if the base note changes, need to update Audio Map
            this.setState({cells: this.createBoard(this.state.size)}, () => {
                this.disconnectAllSynths();
                this.createAudioMap(this.state.size); 
            })
        }
        else if(prevProps.lifePlaying !== this.props.lifePlaying){ // if global life playing status changes
            if(!this.props.lifePlaying){
                clearInterval(this.state.lifePlaying)
                this.setState({lifePlaying: null})
            }
            else{
               this.playLife()
            }
            console.log(this.state.lifePlaying)
        }
        else if(prevProps.speed !== this.props.speed){ // if global speed changes
            this.setState({golSpeed: this.props.speed})
        }
        else if(this.props.context !== null && this.state.audioMap !== null){ // if context and audioMap have been initialized
            this.state.audioMap.forEach((value, key) => {
                const [row, col] = key.split('-').map(Number);
                if(this.state.cells[row]){
                    const cell = this.state.cells[row].props.children[col];
                    if(!cell){
                        console.log("sizeUpdateBug");
                    }
                    else{
                        if (cell.props.alive !== prevState.cells[row].props.children[col].props.alive) {
                            console.log(row,col)
                            if (cell.props.alive) {
                                console.log("play")
                                if(this.state.type === "glideChange" || this.state.type === "barber"){
                                    this.playRandomSound(row, col); // this to choose from multiple sounds
                                }
                                else{
                                  this.playSound(row, col);  
                                }
                            } else {
                                console.log("stop")
                                this.stopSound(row, col);
                            }
                        }
                    }
                }
                else{
                    console.log("sizeUpdateBugv2");
                }
            });
        }
    }

    componentWillUnmount(){
        this.disconnectAllSynths()
    }

    posToSound(row, col){
        let scale = [220.000, 246.942, 261.626, 293.665, 329.628, 349.228, 391.995, 440.000]; // A minor
        return scale[row%scale.length]*(col+1);
    }

    // semitone stuff: freq = Math.pow(2, n/12) * freq0             freq: desired frequency, n: # semitones above, freq0: intial note 
    gliderBoardSounds(row, col){
        // alternating C E G B D | semitone jumps: 4, 3, 4, 3 c3:  130.81     a2:  110
        let baseNote = this.state.baseNote;
        let jumps = [3,4]
        let newNotes = [baseNote]
        for(let i = 0; i < 7; i++){
            let jump = jumps[i%jumps.length];
            let newNote = Math.pow(2, jump/12)*newNotes[newNotes.length-1];
            newNotes.push(newNote);
        }
        let set1 = newNotes.slice(0,2);
        let set2 = newNotes.slice(2,4);
        let set3 = newNotes.slice(4,6);
        let set4 = newNotes.slice(6);

        if(row === col){
            return set1[row%set1.length];
        }
        else if((row+1)%this.state.size === col){
            return set2[row%set2.length];
        }
        else if((col+1)%this.state.size === row){
            return set3[row%set3.length];
        }
        else if((col+2)%this.state.size === row){
            return set4[row%set4.length];
        }
        else{
            let rand = Math.floor(Math.random()*newNotes.length);
            return newNotes[rand];
        }
    }

    gliderBoardMultipleSounds(row, col){
        let baseNote = this.state.baseNote;
        let jumps = [3,4]
        let newNotes = [baseNote]
        for(let i = 0; i < 7; i++){
            let jump = jumps[i%jumps.length];
            let newNote = Math.pow(2, jump/12)*newNotes[newNotes.length-1];
            newNotes.push(newNote);
        }
        let set1 = newNotes.slice(0,2);
        let set2 = newNotes.slice(2,4);
        let set3 = newNotes.slice(4,6);
        let set4 = newNotes.slice(6);

        if(row === col){
            return set1;
        }
        else if((row+1)%this.state.size === col){
            return set2;
        }
        else if((col+1)%this.state.size === row){
            return set3;
        }
        else if((col+2)%this.state.size === row){
            return set4;
        }
        else{
            return newNotes;
        }
    }

    chordBoard(row, col, rowScale, colScale){
        console.log("input Scales: " + rowScale, colScale)
        console.log(row + "-" + col)
        // want both rows and columns to be chords, so I need to be able to generate a chord
        // need a starting note - a scale to go from
        // 12 semitones to get back to the same note

        let rowJumps;
        if(this.scales[rowScale]){ // if row scale exists within the map
            rowJumps = this.scales[rowScale];
        }
        else{ // error handling for wrong scale in row
            console.log("oofRowScales")
            rowJumps = this.scales.maj
        }

        let c3 = this.state.baseNote; //could do something with this
        let noteOrig = Math.pow(2, row/12)*c3 
        let rowJump = Math.floor(row/(rowJumps.length)) + 1
        let rowChange = row%rowJumps.length + 1;
        let origChange = 0;
        if(rowChange !== 0){
            origChange = [...rowJumps].splice(0,rowChange).reduce((acc, curr) => acc + curr, 0); // sum up total jumpage
        }
        noteOrig = (c3*rowJump)*Math.pow(2, origChange/12);


        let colJumps; // what scale being used while moving along the column
        if(this.scales[colScale]){
            colJumps = this.scales[colScale];
        }
        else{
            console.log("oofColScales");
            colJumps = this.scales.min;
        }

        let pitchJump = Math.floor(col/(colJumps.length)) + 1 // how many times to multiply c3 by (three jumps, but theres really four notes)
        console.log(colJumps.length)
        console.log(colJumps)
        let pitchChange = col%colJumps.length + 1;
        let change = 0;
        if(pitchChange !== 0){
            change = [...colJumps].splice(0,pitchChange).reduce((acc, curr) => acc + curr, 0); // sum up total jumpage
        }
        // final note is noteOrig based on row, times pitchJump, times pitchChange I think
        let finalNote = (noteOrig*pitchJump)*Math.pow(2, change/12)
        console.log(finalNote, pitchJump, rowJump);
        return finalNote;
    }

    barberPoleBoard(row, col, diagonal, antiDiagonal){ // two scales for diagonal and antidiagonal cells on board
        // becuase there are necessarily six notes on the edges of the board that are going to be contantly playing
        // gonna leave them blank for now
        // uppper and lower diagonals: where x-y = 1 || y-x = 1
        // upper and lower antidiagonals: where x+y = n || x+y = n+2

        let c3 = this.state.baseNote;
        let finalNote = c3;

        if(row === 0 || row === this.state.size-1 || col === 0 || col === this.state.size-1){ // if on the edges of the board
            return 0
        }
        else if(row-col === 1 || col-row === 1){ // upper and lower main diagonals
            if(this.scales[diagonal]){
                let currScale = this.scales[diagonal]
                let noteScale = []
                let jumpsSoFar = 0;
                for(let i = 0; i < currScale.length*2; i++){
                    noteScale.push(c3*Math.pow(2, jumpsSoFar/12)); // push new note to noteScale based on JSF
                    jumpsSoFar = jumpsSoFar + currScale[i%currScale.length] // update jumpssofar based on current scale
                }
                finalNote = noteScale;
            }
            else{
                console.log("Scale does not exist")
            }
        }
        else if(col+row === this.state.size || col+row === this.state.size - 2){ // upper and lower antidiagonals
            if(this.scales[antiDiagonal]){
                let currScale = this.scales[antiDiagonal]
                let noteScale = []
                let jumpsSoFar = 0;
                for(let i = 0; i < currScale.length*2; i++){
                    noteScale.push(c3*Math.pow(2, jumpsSoFar/12)); // push new note to noteScale based on JSF
                    jumpsSoFar = jumpsSoFar + currScale[i%currScale.length] // update jumpssofar based on current scale
                }
                finalNote = noteScale;
            }
            else{
                console.log("Scale does not exist")
            }
        }
        else{
            return 0
        }

        return finalNote;
    }

    createBoard(size){
        let rows = [];
        for (let i = 0; i < size; i++) {
            let rowCells = [];
            for (let j = 0; j < size; j++) {
                let cell = <Cell alive={false} key={`${i}-${j}`} boardSize={size} row={i} col={j} onClick={() => this.handleCellClick(i, j)} />
                rowCells.push(cell);
            }
            let row = React.createElement('div', { className: 'row', key: i,}, rowCells);
            rows.push(row);
        }
        return rows;
    }

    golMove = () => {
        this.setState(prevState => {
            let newCells = prevState.cells.map(row => {
                let newRowCells = React.Children.map(row.props.children, cell => {
                    let aliveCount = this.countAliveNeighbors(prevState.cells, cell.props.row, cell.props.col);
                    let newAlive = cell.props.alive;
                    if (aliveCount === 3 && !cell.props.alive) {
                        // Create a new Cell component with updated alive prop
                        newAlive = true;
                    } else if ((aliveCount < 2 || aliveCount > 3) && cell.props.alive) {
                        // Create a new Cell component with updated alive prop
                        newAlive = false;
                    }
                    return React.cloneElement(cell, {alive: newAlive});
                });
                return React.cloneElement(row, {}, newRowCells);
            });
            return { cells: newCells };
        });
    }

    playLife = () => {
        if(this.state.lifePlaying != null){
            clearInterval(this.state.lifePlaying)
            this.setState({lifePlaying: null})
        }
        else{
            this.setState({lifePlaying: setInterval(this.golMove, this.state.golSpeed)});
        }
    }

    updateBoard = (event) => {
        let newSize = Number(event.target.value)
        if(!isNaN(newSize) && newSize > 0 && newSize < 100){
            this.setState({
            size: newSize,
            //board: React.createElement(Board, {size: newSize})
            })
        }
        else{
            //erroro handling for wrong size board here
        }
        
      }

    changeAudioStyle = () => {
        let newStyle = ""
        switch(this.state.type){
            case "glide":
                newStyle = "glideChange"
                document.getElementById("changeAudioStyleButton" + this.idNumber).innerHTML = "Change Audio Style (Glider Change)"
                break;
            case "glideChange":
                newStyle = "chordBoard"
                document.getElementById("changeAudioStyleButton" + this.idNumber).innerHTML = "Change Audio Style (Chord Board)"
                break;
            case "chordBoard":
                newStyle = "barber";
                document.getElementById("changeAudioStyleButton" + this.idNumber).innerHTML = "Change Audio Style (Barber Pole)"
                break;
            case "barber":
                newStyle = "glide";
                document.getElementById("changeAudioStyleButton" + this.idNumber).innerHTML = "Change Audio Style (Glider)"
            default:
                newStyle = "glide";
                document.getElementById("changeAudioStyleButton" + this.idNumber).innerHTML = "Change Audio Style (Glider)"
                break;
        }
        this.setState({type: newStyle});
        
    }

    updateVolume = (event) => {
        this.volumeChangeFunc(event)
    }

    updateLifeSpeed = (event) => {
        this.setState({golSpeed: event.target.value}, () => {
           document.getElementById(`speedLabel${this.idNumber}`).innerHTML = "Playing Speed: " + (3000-event.target.value)
        })
         
    }

    updateRowScale = (event) => {
        this.setState({rowScale: document.getElementById(`chordBoardInputRows${this.idNumber}`).value}, () => {
            document.getElementById(`chordBoardInputRows${this.idNumber}`).value = "";
        })
    }

    updateColScale = (event) => {
        this.setState({colScale: document.getElementById(`chordBoardInputCols${this.idNumber}`).value}, () => {
            document.getElementById(`chordBoardInputCols${this.idNumber}`).value = "";
        })
    }

    changeBaseNote = (event) => {
        let val = document.getElementById(`baseNoteFrequencyInput${this.idNumber}`).value;

        if(!isNaN(Number(val))){
            this.setState({baseNote: Number(val)})
            document.getElementById(`baseNoteFrequencyInput${this.idNumber}`).value = ""
        }
        else{
            // error handling
        }
    }

    render(){        
        return(
            <div className="boardContainer">
                <span className="boardTitle">Board {this.idNumber + 1}</span>
                <div className="gameBoard" id={"board" + this.idNumber}>{this.state.cells}</div>
                <br></br>
                <div className="boardButtons">
                    <button className="boardButtonElement" onClick={this.playLife}>Life Move</button>
                    <div>
                        <label id={"speedLabel" + this.idNumber} htmlFor={"speedSlider" + this.idNumber}>Playing Speed: {3000 - this.state.golSpeed}</label>
                        <input className="speedSlider" type="range" defaultValue={800} id={"speedSlider" + this.idNumber} min={100} max={3000} onMouseUp={this.updateLifeSpeed}></input>
                    </div>
                    <button className="boardButtonElement" id={"changeAudioStyleButton" + this.idNumber} onClick={this.changeAudioStyle}>Change Audio Style (Glider Change)</button>
                    <div>
                        <input className="halfInputElement" type="text" id="sizeInput" placeholder="Board Size" onChange={this.updateBoard}></input>
                        <input className="halfInputElement" type="text" id={"baseNoteFrequencyInput" + this.idNumber} placeholder="Base Note(hz)"></input>
                    </div>
                    <div>
                        <span className="spanExamples">{this.state.size}</span>
                        <span className="spanExamples">{this.state.baseNote}</span>
                    </div>
                    <button className="boardButtonElement" id={"changeBaseNoteButton" + this.idNumber} onClick={this.changeBaseNote}>Update Base Note</button>
                    <label className="boardButtonElement" htmlFor={"volumeSlider" + this.idNumber}>Volume</label>
                    <input id={"volumeSlider" + this.idNumber} type="range" min={-30} max={20} defaultValue={-6} onMouseUp={this.updateVolume}></input> 
                    <br></br>
                    {(this.state.type === "chordBoard" || this.state.type === "barber") && (
                        <div id={"chordBoardInputs" + this.idNumber} className="chordBoardInputs">
                            <div style={{width: "50%"}}>
                                <input className="fullLengthElement" type="text" id={"chordBoardInputRows" + this.idNumber} placeholder="Row Scale"></input>
                                <button id={"rowScaleButton" + this.idNumber} onClick={this.updateRowScale}>Apply Row Scale</button>
                                <p>Scale: {this.state.rowScale}</p>
                            </div>
                            <div style={{width: "50%"}}>
                               <input className="fullLengthElement" type="text" id={"chordBoardInputCols" + this.idNumber} placeholder="Column Scale"></input>
                                <button id={"colScaleButton" + this.idNumber} onClick={this.updateColScale}>Apply Column Scale</button> 
                                <p>Scale: {this.state.colScale}</p>
                            </div>
                        </div> 
                    )}
                </div>
                
            </div>
        )
    }
}

