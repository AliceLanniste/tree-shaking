const CHAR_CODE_A = 97;
const CHAR_CODE_0 = 48;

function inToHex(num: number):string {
    if (num < 10) return String.fromCharCode(CHAR_CODE_0 + num);
    else return String.fromCharCode(CHAR_CODE_A + (num - 10));
}

export function Unit8ArrayToHexString(buffer: Uint8Array):string {
    let str = "";
    for (let i = 0; i < buffer.length; i++) {
        str += inToHex(buffer[i] >> 4);
        str += inToHex(buffer[i] & 0x0f);
    }   
    return str;
}

export  function randomUnit8Array(len: number): Uint8Array {
    const buffer = new Uint8Array(len);
    for (let i = 0; i < buffer.length; i++) 
        buffer[i] = Math.random()* (2<<8);
    return buffer;
}

export function Unit8ArrayXor(to: Uint8Array, from: Uint8Array): Uint8Array {
    for (let i = 0; i < to.length; i++) 
        to[i] =to[i] ^ from[i];
    return to;
}

export function Unit8ArrayEqual(bufferA: Uint8Array, bufferB: Uint8Array): boolean {
    for (let i = 0; i < bufferA.length; i++) 
        if (bufferA[i] !== bufferB[i])
            return false;

    return true;
}

export function randomHexString(len: number) :string {
    return Unit8ArrayToHexString(randomUnit8Array(Math.floor(len/2)));
}