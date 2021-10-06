/**
 *
 * @param params
 * @returns
 */
export function parse(params: Uint8Array) {
  const obj: any = {};
  const NEWLINE = '\n';
  const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
  const RE_NEWLINES = /\\n/g;
  const NEWLINES_MATCH = /\n|\r|\r\n/;

  // convert Buffers before splitting into lines and processing
  params
    .toString()
    .split(NEWLINES_MATCH)
    .forEach((line: string, idx: number) => {
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      if (line.length) console.warn(idx / 2);
      const keyValueArr = line.match(RE_INI_KEY_VAL);

      // matched?
      if (keyValueArr) {
        const key: string = keyValueArr[1].toLocaleLowerCase();
        // default undefined or missing values to empty string
        let val: string = keyValueArr[2] || '';
        const end = val.length - 1;
        const isDoubleQuoted: boolean = val[0] === '"' && val[end] === '"';
        const isSingleQuoted: boolean = val[0] === "'" && val[end] === "'";

        // if single or double quoted, remove quotes
        if (isSingleQuoted || isDoubleQuoted) {
          val = val.substring(1, end);

          // if double quoted, expand newlines
          if (isDoubleQuoted) {
            val = val.replace(RE_NEWLINES, NEWLINE);
          }
        } else {
          // remove surrounding whitespace
          val = val.trim();
        }

        obj[key] = val;
      }
    });

  return obj;
}
