import { BoothGamePage } from './app.po';

describe('booth-game App', () => {
  let page: BoothGamePage;

  beforeEach(() => {
    page = new BoothGamePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
