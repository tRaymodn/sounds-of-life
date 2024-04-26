import React, { Component } from 'react';
import "../styles/Cell.css"

export default class Cell extends Component {

    constructor(props){
        super(props)
        this.state = {
            alive: props.alive, // this is weird becuase I never use the state, just the props in the board function and for reference for the props stuff below
        }
        this.boardSize = props.boardSize;
        this.row = props.row;
        this.col = props.col;
        this.onClick = props.onClick;
    }

    render() {
        const renderColor = this.props.alive ? "white" : "black";
        return (
            <div className={renderColor} onClick={this.onClick}></div>
        );
    }
}