import React, { Component } from 'react';
import '../styles/Popup.css'; // You can create a separate CSS file for styling
import barberAntiDiagonalImage from "../Images/barberAntiDiagonal.png"
import barberDiagonalImage from "../Images/barberDiagonal.png"
import gliderImage from "../Images/glider.png"
import chordBoardImage from "../Images/chordBoard.png"
import barberOddRep from "../Images/barberPoleOddRepresentation.png"
import barberEvenRep from "../Images/barberPoleEvenRepresentation.png"
import chordBoardRep from "../Images/chordBoardRepresentation.png"
import gliderBoardRep from "../Images/glider5x5Representation.png"
import gliderFormsRep from "../Images/glider4Forms.png"

export default class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: props.isOpen
    };
  }

  shouldComponentUpdate(prevProps, prevState){
    if(prevProps.isOpen !== this.props.isOpen || prevState.isOpen !== this.state.isOpen){
        return true
    }
    else return false;
  }


  componentDidUpdate(prevProps, prevState){
    if(prevProps.isOpen !== this.props.isOpen){
        this.setState({isOpen: !this.state.isOpen})
    }
  }

  togglePopup = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    return (
      <div className={this.state.isOpen ? 'popup-open' : 'popup-closed'}>
        <div className="popup-inner">
          <button onClick={this.togglePopup} id="closeButton">Close</button> 
          <h2 style={{marginTop: "0px"}}>Sounds of Life Instructions</h2>
          <div id="TOC">
            <h2>Table of Contents</h2>
            <div><a href="#EA">Enabling Audio</a></div>
            <div><a href="#Playing Sounds">Playing Sounds</a></div>
            <div><a href="#Adding and Removing">Adding and Removing Life Boards</a></div>
            <div><a href="#Wrapping">Wrapping</a></div>
            <div><a href="#Board Modifications">Board Modifications</a></div>
            <div><a href="#Note Patterns">Note Patterns</a></div>
          </div>
          <p>Welcome to Sounds of Life!</p>
          <p>this application was created for my final product for my "Making Algorithmic Music" humanities seminar</p>
          <p>With this program, a user can use the various note boards I have created to make music using the rules of Conway's Game of Life</p>
          <hr></hr>
          <h2 id="EA">Enabling Audio</h2>
          <p>To start being able to hear sounds when particular cells are alive, simply press the <b>Start Audio</b> button at the top-left portion of the page</p>
          <hr></hr>
          <h2 id="Playing Sounds">Playing Sounds with Life Boards</h2>
          <p>To play sounds with a life board, simply click on the cells you wish to toggle the "alive" state once the audio has been enabled, and the frequencies corresponding to those cells will play accordingly</p>
          <p>To start/stop the game of life for a given board, either click the <b>Life Move</b> button below the desired board to toggle life playing on that board, or click the <b>Play All Life</b> button at the top center of the page to toggle the state of Life playing on all boards currently active</p>
          <p><u>Important Note:</u> Life will not stop playing unless the state of a board has been manually toggled by the user, so even if the board has no live cells on it, the user must press the <b>Life Move</b> button to stop the program from calculating consecutive states.</p>
          <hr></hr>
          <h2 id="Adding and Removing">Adding and Removing Life Boards</h2>
          <p>Use the <b>Add Life Board</b> and <b>Remove Life Board</b> buttons at the top right of the page to insert and delete Life boards from the page.</p>
          <hr></hr>
          <h2 id="Wrapping">Wrapping</h2>
          <p>Sequential states of Conway's Game of Life are calculated using the alive and dead states of the cells surrounding a given cell. By pressing the <b>Change Wrapping</b> button at the top left of the page, the user can toggle the adjacent cells to be calculated based on either a bounded square, or toroidal gamespace</p>
          <p>With wrapping enabled, the cells at the top and bottom of the board are calculated as neighbors, as well as the cells on the left and rightmost sides of the board. Without wrapping, the adjacent cells are calculated exactly as they appear on the board.</p>
          <p>The wrapping status denoted by the button text (Enabled or Disabled) applies to all boards active on the page</p>
          <hr></hr>
          <h2 id="Board Modifications">Board Modifications</h2>
          <p>For each board, the <u>size</u>, <u>playing speed</u>, <u>volume</u>, and <u>note pattern</u> can be altered to create unique sounds</p>
          <h3>Size</h3>
          <p>To change the size of a board, input the desired dimension into the <b>Board Size</b> input field to generate an n x n board.</p>
          <h3>Playing Speed</h3>
          <p>To change the playing speed of a life board, scroll the <b>Life Speed</b> slider to the right to increase playing speed, and to the left to decrease playing speed</p>
          <h3>Volume</h3>
          <p>To change the volume of a life board, scroll the <b>Volume</b> slider to the right to increase volume, and to the left to decrease volume</p>
          <hr></hr>
          <h3 id="Note Patterns">Note Patterns</h3>
          <div><a href="#glider">Glider</a></div>
          <div><a href="#gliderChange">Glider Change</a></div>
          <div><a href="#chordBoard">Chord Board</a></div>
          <div><a href="#barberPole">Barber Pole</a></div>
          <p>There are 4 note board patterns currently created: <u>Glider</u>, <u>Glider Change</u>, <u>Chord Board</u>, and <u>Barber Pole</u></p>
          <b id="glider"><u>Glider</u></b>
          <br></br>
          <img className="exampleBoard" src={gliderImage}></img>
          <p>Both the Glider and GliderChange boards were designed to be played using a glider moving along the main diagonal of the board</p>
          <p>All of the cells along the four diagonals which the alive cells of the glider will exist play a specific note derived from the base note, a2 - 110hz frequency</p>
          <p>Seven more notes are generated from this base note, alternating between 3 and 4 semitones above the previous note, and cells along the four desired diagonals are populated with these notes in such a way that prevents excessive overlap of the same note</p>
          <p>The images below depict the diagonals for which specific notes are assigned, and the composition of each form of a glider moving along the main diagonal in terms of which diagonal each cell belongs.</p>
          <div>
            <img className="repBoard" src={gliderBoardRep}></img>
            <img className="repBoard" src={gliderFormsRep}></img>
          </div>
         
          <b id="gliderChange"><u>Glider Change</u></b>
          <p>The notes for Glider Change are calculated in the same way as in Glider, but each diagonal cell class has a 50% chance to play one of two notes from the note generation algorithm, meaning that two identical board structures can play completely different sounds.</p>
          <p>Thus, the note representation remains the same as depicted in <u>Glider</u>, but with each diagonal note class playing one of two possible notes</p>
          <p>I find these boards to play a relaxing sort of sound that reminds me of the Minecraft soundtrack, I hope other people will appreciate it too</p>
          <b id="chordBoard"><u>Chord Board</u></b>
          <br></br>
          <img className='exampleBoard' src={chordBoardImage}></img>
          <p>The notes for Chord Board and Barber Pole are generated based on musical chord qualities</p>
          <p>For Chord Board, the notes given to cells are determined by thier row and column position, and the scales that are input into the <b>Row Scale</b> and <b>Column Scale</b> text input fields.</p>
          <p>The notes along a row of the given life board will increase in pitch according to the input row scale going from left to right, and the notes along the column will increase in pitch according to the input solumn scale going from top to bottom</p>
          <p>In the image below, the green cell represents the base note, with pitches increasing according to their scale along the rows and columns, making the cell in the bottom-right hand corner of the board the note with the highest pitch on the board</p>
          <img className="repBoard" src={chordBoardRep}></img>
          <p>The currently available scales for input, and their associated names for the input fields are:</p>
          <ul>
            <li>
            <p>Major (semitone jumps: [4,3,5]), Input: maj</p>
            </li>
            <li>
            <p>Minor (semitone jumps: [3,4,5]), Input: min</p>
            </li>
            <li>
            <p>Major7 (semitone jumps: [4,3,4,1]), Input: maj7</p>
            </li>
            <li>
            <p>Minor7 (semitone jumps: [3,4,3,2]), Input: min7</p>
            </li>
            <li>
            <p>Diminished (semitone jumps: [3,3,6]), Input: dim</p>
            </li>
            <li>
            <p>Diminished7 (semitone jumps: [3,3,3,3]), Input: dim7</p>
            </li>
            <li>
            <p>Augmented (semitone jumps: [4,4,4]), Input: aug</p>
            </li>
            <li>
            <p>Augmented7 (semitone jumps: [4,4,2,2]), Input: aug7</p>
            </li>
            <li>
            <p>Suspended2 (semitone jumps: [2,5,5]), Input: sus2</p>
            </li>
            <li>
            <p>Suspended4 (semitone jumps: [5,2,5]), Input: sus4</p>
            </li>
            <li>
            <p>Dominant7 (semitone jumps: [4,3,3,2]), Input: dom7</p>
            </li>
            <li>
            <p>Half Diminished (semitone jumps: [3,3,4,2]), Input: halfDim</p>
            </li>
            <li>
            <p>Major 6 (semitone jumps: [4,3,2,3]), Input: maj6</p>
            </li>
            <li>
            <p>Minor 6 (semitone jumps: [3,4,2,3]), Input: min6</p>
            </li>
          </ul>
          <b id="barberPole"><u>Barber Pole</u></b>
          <div>
            <img className="exampleBoard" src={barberDiagonalImage}></img>
            <img className="exampleBoard" src={barberAntiDiagonalImage}></img>
          </div>
          <p>The Barber Pole board was made to be used with the Life construction of the same name, with the ends of the pole being on the edges of the board</p>
          <p>With the pole constructed in this way, the cells within the pole will alternate along either the upper and lower diagonals or upper and lower antidiagonals of the board. These are the only cells on the board for which sound will play for cells which are alive</p>
          <p>With this board, changing the <b>Row Scale</b> input will change the scale used to calculate the notes along the upper and lower diagonals, and the <b>Column Scale</b> input changing the scale used to calculate the notes along the upper and lower antidiagonals</p>
          <p>Similarly to the <u>Glider Change</u> board, each cell has a chance to play a different note when it becomes alive, with this board making it so that each cell has either 6 or 8 distinct notes that can be played depending on the scale used to calculate the notes. (use a scale and progress through its notes two times)</p>
          <p>The image below depicts the note board representation of Barber Pole, with no sound playing for cells along any edge of the board, and different notes played based on which diagonal is used to make the pole.</p>
          <div>
            <img className="repBoard" src={barberEvenRep}></img>
            <img className="repBoard" src={barberOddRep}></img>
          </div>
          <p>It can be seen, that on an odd-sized board, there are four cell positions in which both the diagonal and antidiagonal pass through. The program has been so created that the notes played for these cells is determined by the scale defining the main diagonal (the row scale)</p>
          <p><u>Notes:</u></p>
          <ul>
            <li>A user can only create the Barber Pole on board  greater than size <b>4</b></li>
            <li>Wrapping must be disabled if creating a Barber Pole on a board of size <b>5</b></li>
            <li>The current functionality for not playing sounds on a Barber Pole board may cause random, sporatic audio clicks to occur. If this, or any other audio issue occurs, simply <b>refresh the page</b>.</li>
          </ul>
            
        </div>
      </div>
    );
  }
}