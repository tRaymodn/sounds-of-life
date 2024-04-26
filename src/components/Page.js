import React from 'react'
import Board from './board.js'
import Popup from './Popup.js'
import * as Tone from 'tone'
import "../styles/Page.css"

export default class Page extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            size: props.size,
            audioContext: null,
            torus: true,
            volume: [-6],
            numBoards: 1,
            globalTimeout: null,
            allGOLSpeed: 800,
            popupOpen: false,
        }
        this.sheet = this.createStyleDocument();
        this.scales = this.generateScales();
        this.changeWrapping = this.changeWrapping.bind(this)
        this.updateVolumes = this.updateVolumes.bind(this)
        this.playAllLife = this.playAllLife.bind(this)
    }
        // want to create a document and append it to the header, and give a reference to it to all of the boards so they have access to it
        

    createStyleDocument = () => {
        let docu = document.createElement("style");
        document.head.appendChild(docu);
        let sheet = docu.sheet;
        return sheet;
    }

    shouldComponentUpdate(prevProps, prevState){
        if(prevState.size != this.props.size || prevState.audioContext !== this.state.audioContext || prevState.torus != this.state.torus || prevState.volume !== this.state.volume || prevState.numBoards !== this.state.numBoards || prevState.globalTimeout !== this.state.globalTimeout || prevState.allGOLSpeed !== this.state.allGOLSpeed || prevState.popupOpen !== this.state.popupOpen){
            console.log("pageUpdate");
            return true;
        } 

        else return false;
    }

    generateAudioContext = () => {
        if(this.state.audioContext === null){
            Tone.start();
            let ctx = true;
            this.setState({audioContext: ctx})  
        }
    }

    updateVolumes = (event, volumeNum) => {
        let newVolume = Number(event.target.value);
        let newVolumes = [...this.state.volume]
        newVolumes[volumeNum] = newVolume;
        this.setState({volume: newVolumes});
    }

    changeWrapping = () => {
        this.setState(prevState => ({torus: !prevState.torus}), () => {
            let buttonText = "";
            if(this.state.torus){
                buttonText = "Change Wrapping (Enabled)";
            }
            else{
                buttonText = "Change Wrapping (Disabled)";
            }
            document.getElementById("golWrap").innerText = buttonText;
        })
    }

    playAllLife = () =>{
        if(!this.state.globalTimeout){
          this.setState({globalTimeout: true})  
        }
        else{
            this.setState({globalTimeout: null})
        }
        console.log(this.state.globalTimeout)
    }

    generateBoards = () =>{
        let arr = []
        for(let i = 0; i < this.state.numBoards; i++){
            const boundVolume = (event)  => this.updateVolumes(event, i);
            //<Board size={4} context={this.state.audioContext} torus={this.state.torus} idNumber={i} volume={this.state.volume} type="glideChange"/>
            let b = React.createElement(Board, {size: 4, idNumber: i, key: i, context: this.state.audioContext, torus: this.state.torus, volume: this.state.volume[i], volumeChangeFunc: boundVolume, type:"glideChange", styleSheet: this.sheet, scales: this.scales, lifePlaying: this.state.globalTimeout, speed: this.state.allGOLSpeed});
            arr.push(b);
        }
        let boards = React.createElement("div", {id: "boardContainer"}, arr);
        return boards;
    }

    addBoard = () =>{
        this.setState(prevState => ({numBoards: prevState.numBoards + 1, volume: [...prevState.volume].concat([-6])}));
    }

    generateScales = () =>{
        let scales = {}

        // Major: 0,4,7 = jumps: 4,3,5 (to get back to original note)
        let major = [4,3,5];
        scales.maj = major

        // Minor: 0,3,7 = 3,4,5
        let minor = [3,4,5];
        scales.min = minor

        // Major7: 0,4,7,11 = 4,3,4,1
        let major7 = [4,3,4,1];
        scales.maj7 = major7

        // Minor7: 0,3,7,10 = 3,4,3,2
        let minor7 = [3,4,3,2];
        scales.min7 = minor7;

        // Dim: 0,3,6 = 3,3,6
        let dim = [3,3,6];
        scales.dim = dim

        // Dim7: 0,3,6,9 = 3,3,3,3
        let dim7 = [3,3,3,3];
        scales.dim7 = dim7

        // Aug: 0,4,8 = 4,4,4
        let aug = [4,4,4];
        scales.aug = aug

        // Aug7: 0,4,8,10 = 4,4,2,2
        let aug7 = [4,4,2,2];
        scales.aug7 = aug7

        // Sus2: 0,2,7 = 2,5,5
        let sus2 = [2,5,5];
        scales.sus2 = sus2

        // Sus4: 0,5,7 = 5,2,5
        let sus4 = [5,2,5];
        scales.sus4 = sus4

        // Dom7: 0,4,7,10 = 4,3,3,2
        let dom7 = [4,3,3,2];
        scales.dom7 = dom7

        // HalfDim: 0,3,6,10 = 3,3,4,2
        let halfDim = [3,3,4,2];
        scales.halfDim = halfDim

        // Maj6: 0,4,7,9 = 4,3,2,3
        let maj6 = [4,3,2,3];
        scales.maj6 = maj6

        // Min6: 0,3,7,9 = 3,4,2,3
        let min6 = [3,4,2,3];
        scales.min6 = min6

        return scales
    }

    removeBoard = () =>{ //TODO!!! need to make sure that all of my synths are disconnected and not playing when a board gets removed
        if(this.state.numBoards > 0){
            this.setState(prevState => ({numBoards: prevState.numBoards - 1})) 
        } 
    }

    // toggle the state of popupOpen
    togglePopup = () =>{
        this.setState({popupOpen: !this.state.popupOpen})
        console.log(this.state.popupOpen)
    }

    render(){
        return(
            <>
                <div id="header">
                    <h2>Sounds of Life</h2>
                    <button onClick={this.togglePopup} id="helpButton">Help</button>
                    <Popup isOpen={this.state.popupOpen}></Popup>
                </div>
                <div id="buttonContainer">
                    <button className="pageButton" id="startAudio" onClick={this.generateAudioContext}>Start Audio</button>
                    <button className="pageButton" id="golWrap" onClick={this.changeWrapping}>Change Wrapping (Enabled)</button>
                    <button className="pageButton" id="playAllLife" onClick={this.playAllLife}>Play All Life</button>
                    <button className="pageButton" id="addBoard" onClick={this.addBoard}>Add Life Board</button>
                    <button className="pageButton" id="deleteBoard" onClick={this.removeBoard}>Remove Life Board</button>
                </div>
                {this.generateBoards()}
            </>
        )
    }

}