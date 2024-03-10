import { Component, Inject, HostListener, ElementRef, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChesscomService } from '../services/chesscom.service';
import { Subject, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit{

  archivedGames: any[] = [];
  message: string = '';
  currentPageIndex: number = 0;
  gamesForCurrentPage: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private chessComService: ChesscomService,
    private elementRef: ElementRef,
    private datePipe: DatePipe
  ) { 
    dialogRef.backdropClick()
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      dialogRef.close();
    });
  
    this.archivedGames = this.data.archivedGames.reverse();
    this.message = this.data.message;
  }

  async ngOnInit(): Promise<void> {
    await this.showGamesForPage(this.currentPageIndex);
  }

  getDate(fullUrl: string): string {
    const datePart = fullUrl.split("/").slice(7, 9).join('-');
    const formattedDate = datePart.replace(/(\d{4}) (\d{2})/, '$1-$2');
  
    const parsedDate = new Date(formattedDate);
    
    if (!isNaN(parsedDate.getTime())) {
      return this.datePipe.transform(parsedDate, 'MMMM yyyy') || '';
    } else {
      return '';
    }
  }

  async showGamesForPage(index: number): Promise<void> {
    this.currentPageIndex = index;
    const url = this.archivedGames[this.currentPageIndex];
    this.gamesForCurrentPage = await this.chessComService.getGamesForDate(url);
  
    const div = document.createElement('div') as HTMLDivElement;
    div.id = 'gamesDiv';
  
    for (let i = 0; i < this.gamesForCurrentPage.length; i++) {
      const button = document.createElement('button') as HTMLButtonElement;
      button.id = 'gameBtn';
      let currentGame = this.gamesForCurrentPage[i];
      let text = '';
      if(currentGame.white.result === 'win'){
        text = currentGame.white.username + '(won) vs ' + currentGame.black.username + ' - ' + currentGame.time_class;
      } else {
        text = currentGame.white.username + ' vs ' + currentGame.black.username + '(won) - ' + currentGame.time_class;
      }
      button.innerText = text;
      button.addEventListener('click', () => {
        this.dialogRef.close(currentGame);
      })
      div.appendChild(button);
    }
  
    const gamesContainer = document.getElementById('gamesContainer');
    if (gamesContainer) {
      gamesContainer.innerHTML = '';
      gamesContainer.appendChild(div);
    }
  }
  

  async navigateToNextPage(): Promise<void> {
    if (this.currentPageIndex > 0) {
      await this.showGamesForPage(this.currentPageIndex - 1);
    }
  }

  async navigateToPreviousPage(): Promise<void> {
    if (this.currentPageIndex < this.archivedGames.length - 1) {
      await this.showGamesForPage(this.currentPageIndex + 1);
    }
  }
  
   
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dialogRef.close();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}
