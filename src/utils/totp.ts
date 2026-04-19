export const base32ToHex = (base32: string) => {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let hex = "";
  for (let i = 0; i < base32.length; i++) {
    const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substring(i, i + 4);
    hex = hex + parseInt(chunk, 2).toString(16);
  }
  return hex;
};

export const hexToBytes = (hex: string) => {
  const bytes = new Uint8Array(Math.floor(hex.length / 2));
  for (let i = 0; i < hex.length - 1; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

// Generates a random Base32 string (16 chars)
export const generateBase32Secret = () => {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 16; i++) {
    secret += base32chars.charAt(Math.floor(Math.random() * base32chars.length));
  }
  return secret;
};

// Uses Web Crypto API to generate standard TOTP
export async function generateTOTP(secretBase32: string): Promise<string> {
  const keyBytes = hexToBytes(base32ToHex(secretBase32));
  
  const epoch = Math.floor(Date.now() / 1000);
  const time = Math.floor(epoch / 30);
  
  let timeStr = time.toString(16).padStart(16, '0');
  const msgBytes = hexToBytes(timeStr);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', 
    keyBytes, 
    { name: 'HMAC', hash: 'SHA-1' }, 
    false, 
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgBytes);
  const hmac = new Uint8Array(signature);

  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1e6;
  return otp.toString().padStart(6, '0');
}
