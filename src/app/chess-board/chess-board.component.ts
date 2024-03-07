import { HtmlParser } from '@angular/compiler';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Chess } from 'chess.js';

declare var Chessboard2: any;

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss']
})
export class ChessBoardComponent implements OnInit, AfterViewInit {
  board: any;
  chess: any;
  pgn: string = ``;
  currentMoveIndex: number = -1;

  ngOnInit(): void {
    this.loadSample();
    this.chess = new Chess();
  }

  ngAfterViewInit(): void {
    this.handleUserInput();
  }

  loadSample(): void {
    this.board = Chessboard2('myBoard', 'start');
  }

  handleUserInput(): void {
    const select = document.getElementById('gameInput') as HTMLSelectElement;
    const button = document.getElementById('btnAnalyse') as HTMLButtonElement;
    if(select.value === 'pgn'){
      this.loadPGN(select.value);
    } else if(select.value === 'chess-com'){
      this.loadChessCom(select.value);
    }
  } 

  analyseGame(): void {
    let defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    let gameFen = this.chess.fen();
    if(gameFen != defaultFen){
      console.log(gameFen);
    } else {
      alert('first load the game!')
    }
  }

  loadPGN(selectedValue: string): void {
    const userInput = document.getElementById('userInput') as HTMLDivElement;
    if(userInput){
      if(userInput.childElementCount > 3){
        if(userInput.lastChild) {
          userInput.removeChild(userInput.lastChild);
        }
      }
      const textarea = document.createElement('textarea') as HTMLTextAreaElement;
      textarea.id = selectedValue;
      textarea.rows = 10;
      textarea.cols = 40;
      textarea.placeholder = 'input your pgn';
      userInput.appendChild(textarea);

      if(this.chess.pgn() !== ''){
        textarea.value = this.chess.pgn();
      }

      textarea.addEventListener('focusout', () => {
        if(textarea.value !== ''){
          try{
            this.chess.loadPgn(textarea.value)
          }catch(error){
            textarea.value = '';
            textarea.placeholder = 'Invalid PGN input. Please provide a correct PGN.'
          }
        }
      })
    }
  }

  loadChessCom(selectedValue: string): void {
    const userInput = document.getElementById('userInput') as HTMLDivElement;
    if(userInput){
      if(userInput.childElementCount > 3){
        if(userInput.lastChild) {
          userInput.removeChild(userInput.lastChild);
        }
      }
      const textInput = document.createElement('input') as HTMLInputElement;
      textInput.id = selectedValue;
      textInput.type = 'text';
      textInput.placeholder = selectedValue.replace('-', '.') + ' username';
      userInput.appendChild(textInput);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if(this.currentMoveIndex < 0) {
      this.currentMoveIndex = 0;
    }
    if (event.key === 'ArrowRight' && this.currentMoveIndex < this.chess.history().length && this.currentMoveIndex >= 0) {
      const move = this.chess.history({ verbose: true })[this.currentMoveIndex];
      if(move){
        this.board.position(move.after);
      }
      this.currentMoveIndex++;
    } else if (event.key === 'ArrowLeft' && this.currentMoveIndex <= this.chess.history().length && this.currentMoveIndex > 0) {
      this.currentMoveIndex--;
      const move = this.chess.history({ verbose: true })[this.currentMoveIndex];
      if(move){
        this.board.position(move.before);
      }
    } else if (event.key === 'ArrowDown'){
      this.board.start();
      this.currentMoveIndex = 0;
    } else if (event.key === 'ArrowUp'){
      this.currentMoveIndex = this.chess.history().length-1;
      const move = this.chess.history({ verbose: true })[this.currentMoveIndex];
      if(move){
        this.board.position(move.after);
      }
    }
  }
}
