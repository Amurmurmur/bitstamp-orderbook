export const getInstrument = (instruments, url_symbol) =>
  instruments.find((item, _) => item.url_symbol === url_symbol);
