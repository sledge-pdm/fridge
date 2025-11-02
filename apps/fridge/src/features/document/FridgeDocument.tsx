export type WriteMode = 'ltr' | 'ttb';

export class FridgeDocument {
  mode: WriteMode = 'ltr';

  private id: string;

  private contentOnLoad;

  constructor(
    private title: string | undefined,
    private content: string,
    private filePath?: string,
    overrideId?: string
  ) {
    this.id = overrideId ?? crypto.randomUUID();
    this.contentOnLoad = content;
  }

  getId() {
    return this.id;
  }

  getTitle() {
    return this.title;
  }

  getContent() {
    return this.content;
  }

  getFilePath() {
    return this.filePath;
  }

  getContentOnLoad() {
    return this.contentOnLoad;
  }

  isChangedFromLastLoad(): boolean {
    return this.content !== this.contentOnLoad;
  }

  setContentOnLoad(content: string) {
    this.contentOnLoad = content;
  }

  toJSX(): HTMLElement {
    return (<p>{this.content}</p>) as HTMLElement;
  }
}
