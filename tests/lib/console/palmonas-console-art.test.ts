import {
  logPalmonasConsoleArt,
  PALMONAS_CONSOLE_ART,
} from '@/lib/console/palmonas-console-art';

describe('logPalmonasConsoleArt', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs the Palmonas ASCII art via console.info', () => {
    const consoleInfo = jest.fn();
    jest.spyOn(console, 'info').mockImplementation(consoleInfo);

    logPalmonasConsoleArt();

    expect(consoleInfo).toHaveBeenCalledWith(PALMONAS_CONSOLE_ART);
  });

  it('does not gate logging behind environment checks', () => {
    const consoleInfo = jest.fn();
    jest.spyOn(console, 'info').mockImplementation(consoleInfo);

    logPalmonasConsoleArt();
    logPalmonasConsoleArt();

    expect(consoleInfo).toHaveBeenCalledTimes(2);
    expect(consoleInfo).toHaveBeenNthCalledWith(1, PALMONAS_CONSOLE_ART);
    expect(consoleInfo).toHaveBeenNthCalledWith(2, PALMONAS_CONSOLE_ART);
  });
});
