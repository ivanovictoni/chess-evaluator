import { AfterViewInit, Component, HostListener, Inject, OnInit } from '@angular/core';
import { Chess } from 'chess.js';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChesscomService } from '../services/chesscom.service';
import { DialogComponent } from '../dialog/dialog.component';

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
  archivedGames: any[] = [];
  isDisabled: boolean = true;

  constructor(
    private chessComService: ChesscomService,
    public dialog: MatDialog,
    ){}

  ngOnInit(): void {
    this.board = Chessboard2('myBoard', 'start');
    this.chess = new Chess();

    if(this.chess.pgn() !== ''){
      this.isDisabled = false;
    }
  }

  ngAfterViewInit(): void {
    this.handleUserInput();
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
      alert('No game has been imported!');
    }
  }

  loadPGN(selectedValue: string): void {
    const dynamic = document.getElementById('dynamic') as HTMLDivElement;
    if(dynamic){
      dynamic.innerHTML = '';
      const textarea = document.createElement('textarea') as HTMLTextAreaElement;
      textarea.id = selectedValue;
      textarea.rows = 10;
      textarea.cols = 40;
      textarea.placeholder = 'input your pgn';
      dynamic.appendChild(textarea);

      if(this.chess.pgn() !== ''){
        textarea.value = this.chess.pgn();
        this.isDisabled = false;
      }

      textarea.addEventListener('focusout', () => {
        if(textarea.value !== ''){
          try{
            this.chess.loadPgn(textarea.value)
            this.isDisabled = false;
          }catch(error){
            textarea.value = '';
            textarea.placeholder = 'Invalid PGN input. Please provide a correct PGN.'
          }
        } else {
          this.isDisabled = true;
        }
      })
    }
  }

  loadChessCom(selectedValue: string): void {
    const dynamic = document.getElementById('dynamic') as HTMLDivElement;
    if(dynamic){
      dynamic.innerHTML = '';
      const textInput = document.createElement('input') as HTMLInputElement;
      const getButton = document.createElement('button') as HTMLButtonElement;
      textInput.id = selectedValue;
      textInput.type = 'text';
      textInput.placeholder = selectedValue.replace('-', '.') + ' username';
      getButton.id = `btn${selectedValue}`;
      getButton.type = 'button';
      getButton.textContent = 'Get games!';
      dynamic.appendChild(textInput);
      dynamic.appendChild(getButton);

      getButton.addEventListener('click', async () => {
        const inputValue = textInput.value.trim();
        if(inputValue != ''){
          let data = await this.chessComService.getGames(inputValue); 
          if(data){
            if(data.archives && data.archives.length > 0){
              for(let i=0; i<data.archives.length; i++){
                this.archivedGames.push(data.archives[i]);
              }
              this.openDialog('', this.archivedGames);
            }else {
              this.openDialog('User not found!');
            }
          }else {
            this.openDialog('User not found!');
          }
        }else {
          alert('Username is empty!');
        }
      })
    }
  }

  openDialog(message: string = '', archivedGames: any[] = []): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data: { message: message, archivedGames: archivedGames },
    });

    dialogRef.afterClosed().subscribe((selectedGame: any) => {
      if (selectedGame) {
        this.chess.loadPgn(selectedGame.pgn);
        this.isDisabled = false;
      }
    });
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
