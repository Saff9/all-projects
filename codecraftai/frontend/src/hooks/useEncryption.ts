import { useState, useCallback, useEffect } from "react";
import { deriveKey, encryptData, decryptData, bufferToBase64, base64ToBuffer } from "../utils/encryption";
import { useSettingsStore } from "../store/settingsStore";

// Static salt for simplicity
const SALT = new Uint8Array([12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12]);

export function useEncryption() {
  const passphrase = useSettingsStore((s) => s.passphrase);
  const [key, setKey] = useState<CryptoKey | null>(null);

  const unlock = useCallback(async (p: string) => {
    const k = await deriveKey(p, SALT);
    setKey(k);
    useSettingsStore.getState().setPassphrase(p);
    return true;
  }, []);

  useEffect(() => {
    if (passphrase && !key) {
      deriveKey(passphrase, SALT).then(setKey);
    }
  }, [passphrase, key]);

  const encrypt = useCallback(async (text: string): Promise<{ iv: string; ciphertext: string }> => {
    if (!key) throw new Error("Store is locked. Please enter your passphrase.");
    const { iv, ciphertext } = await encryptData(text, key);
    return {
      iv: bufferToBase64(iv.buffer as ArrayBuffer),
      ciphertext: bufferToBase64(ciphertext)
    };
  }, [key]);

  const decrypt = useCallback(async (ivB64: string, ciphertextB64: string): Promise<string> => {
    if (!key) throw new Error("Store is locked. Please enter your passphrase.");
    const ivBuf = base64ToBuffer(ivB64);
    const cipherBuf = base64ToBuffer(ciphertextB64);
    return await decryptData(new Uint8Array(ivBuf), cipherBuf, key);
  }, [key]);

  return { unlock, encrypt, decrypt, isLocked: !key, hasPassphrase: !!passphrase };
}
