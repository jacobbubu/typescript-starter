enum ASCII {
  Zero = 0x30,
  Nine = 0x39,
  Plus = '+'.charCodeAt(0),
  Minus = '-'.charCodeAt(0),
  Whitespace = 0x20
}

export default class Solution {
  static atoi(str: string) {
    let sign = 1
    let result = 0
    let started = false

    for (let c of str) {
      const code = c.charCodeAt(0)
      if (!started) {
        if ([ASCII.Plus, ASCII.Minus].includes(code)) {
          sign = code === ASCII.Minus ? -1 : 1
          started = true
        } else if (code >= ASCII.Zero && code < ASCII.Nine) {
          result = result * 10 + code - ASCII.Zero
          started = true
        } else if (code !== ASCII.Whitespace) {
          break
        }
      } else {
        if (code >= ASCII.Zero && code < ASCII.Nine) {
          result = result * 10 + code - ASCII.Zero
        } else {
          break
        }
      }
    }
    return result * sign
  }
}
