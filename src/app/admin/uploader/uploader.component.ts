import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent {
  @Input()
  type!: 'vignette' | 'image';

  public isHovering: boolean = false;

  files: File[] = [];

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  onDrop(files: FileList) {
    const sortedFiles = this.sortByName(files);
    for (let file of sortedFiles) {
      this.files.push({
        ...file,
        type: this.type,
      });
    }
  }

  sortByName(files: FileList): File[] {
    const arrayFiles = Array.from(files);
    return arrayFiles.sort((a, b) => a.name.localeCompare(b.name));
  }
}
