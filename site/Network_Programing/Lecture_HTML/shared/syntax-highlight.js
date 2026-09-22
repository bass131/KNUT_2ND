/* 오프라인 강의용 경량 C/Bash 토큰 색상. 코드를 실행하거나 외부에 전송하지 않는다. */
(() => {
  'use strict';
  const cTypes = new Set('void char short int long float double signed unsigned _Bool size_t ssize_t socklen_t sockaddr_in sockaddr FILE'.split(' '));
  const cKeywords = new Set('auto break case const continue default do else enum extern for goto if inline register restrict return sizeof static struct switch typedef union volatile while _Alignas _Alignof _Atomic _Generic _Noreturn _Static_assert _Thread_local'.split(' '));
  const shellCommands = new Set('sudo apt gcc g++ make mkdir cp cd echo printf'.split(' '));

  function tokenize(source, language) {
    // 우선순위: 주석·문자열을 먼저 읽어 그 안의 키워드를 다시 색칠하지 않는다.
    const pattern = language === 'c'
      ? /\/\*[\s\S]*?\*\/|\/\/[^\r\n]*|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|^[ \t]*#[ \t]*[A-Za-z_]\w*|<[A-Za-z_][\w./]*>|\b(?:0[xX][\da-fA-F]+|\d+(?:\.\d+)?)(?:[uUlLfF]*)\b|\b[A-Za-z_]\w*\b/gm
      : /#[^\r\n]*|"(?:\\[\s\S]|[^"\\])*"|'[^']*'|\$\{[^}]+\}|\$[A-Za-z_]\w*|(?:^|(?<=\s))--?[A-Za-z][\w=-]*|(?:\.{0,2}\/|~\/)[^\s]+|\b\d+\b|[A-Za-z_][\w.+-]*/gm;
    const tokens = [];
    let cursor = 0;
    for (const match of source.matchAll(pattern)) {
      if (match.index > cursor) tokens.push({ text: source.slice(cursor, match.index) });
      const word = match[0]; let kind;
      if (/^(\/\*|\/\/)/.test(word) || (language === 'bash' && word.startsWith('#'))) kind = 'comment';
      else if (/^["']/.test(word) || (language === 'c' && word.startsWith('<'))) kind = 'string';
      else if (language === 'c') {
        if (/^\s*#/.test(word)) kind = 'preprocessor';
        else if (cTypes.has(word)) kind = 'type';
        else if (cKeywords.has(word)) kind = 'keyword';
        else if (/^\d/.test(word)) kind = 'number';
        else if (/^[A-Z_][A-Z_\d]*$/.test(word)) kind = 'constant';
        else if (/^\s*\(/.test(source.slice(match.index + word.length))) kind = 'function';
        else kind = 'variable';
      } else {
        if (word.startsWith('$')) kind = 'variable';
        else if (word.startsWith('-')) kind = 'constant';
        else if (shellCommands.has(word) || word.startsWith('./')) kind = 'function';
        else if (/^\d/.test(word)) kind = 'number';
        else if (word.includes('/')) kind = 'string';
      }
      tokens.push({ text: word, kind }); cursor = match.index + word.length;
    }
    if (cursor < source.length) tokens.push({ text: source.slice(cursor) });
    return tokens;
  }

  document.querySelectorAll('pre > code[data-language]').forEach((code) => {
    const language = code.dataset.language;
    if (!['c', 'bash'].includes(language) || code.dataset.highlighted) return;
    const source = code.textContent;
    const fragment = document.createDocumentFragment();
    for (const token of tokenize(source, language)) {
      if (!token.kind) fragment.append(document.createTextNode(token.text));
      else {
        const span = document.createElement('span');
        span.className = `syntax-${token.kind}`;
        span.textContent = token.text; // HTML처럼 해석하지 않고 원문을 그대로 보존한다.
        fragment.append(span);
      }
    }
    code.replaceChildren(fragment);
    code.dataset.highlighted = 'true';
  });
})();
