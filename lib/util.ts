export function pad0(number: number | string, len: number) {
  let output = String(number);
  while (output.length < len) {
    output = "0" + output;
  }
  return output;
}
