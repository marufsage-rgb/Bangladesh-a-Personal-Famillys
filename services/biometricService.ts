/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FamilyMember } from '../types';

export interface BiometricAuthResult {
  success: boolean;
  method: 'webauthn' | 'touch_gesture' | 'face_gesture' | 'pin';
  credentialId?: string;
  error?: string;
  timestamp: number;
}

export class BiometricService {
  private static audioCtx: AudioContext | null = null;

  private static getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  // Play realistic futuristic biometric feedback tones
  static playFeedbackSound(type: 'scan' | 'success' | 'fail') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'scan') {
        // High-tech subtle scanning hum
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'success') {
        // Harmonic two-tone confirmation chirp (800Hz -> 1200Hz)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else {
        // Low rejection buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.setValueAtTime(120, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Ignore audio failure
    }
  }

  // Check Web Authentication API support
  static async isWebAuthnAvailable(): Promise<boolean> {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return false;
    }
    try {
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      return true;
    } catch {
      return false;
    }
  }

  // Trigger real WebAuthn authentication with graceful simulation fallback
  static async requestWebAuthnUnlock(user: FamilyMember): Promise<BiometricAuthResult> {
    const isAvailable = await this.isWebAuthnAvailable();

    if (isAvailable && navigator.credentials) {
      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // Attempt get credentials
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 30000,
            userVerification: 'preferred',
            rpId: window.location.hostname || 'localhost'
          }
        });

        if (credential) {
          this.playFeedbackSound('success');
          this.setVaultUnlocked(user.id, true);
          return {
            success: true,
            method: 'webauthn',
            credentialId: (credential as any).id,
            timestamp: Date.now()
          };
        }
      } catch (err: any) {
        console.warn('WebAuthn platform auth canceled or unsupported in iframe, fallback available:', err.message);
      }
    }

    // Return status indicating mock biometric UI should take over
    return {
      success: false,
      method: 'webauthn',
      error: 'Platform biometric not activated; use gesture scanner.',
      timestamp: Date.now()
    };
  }

  // Session state storage
  static isVaultUnlocked(userId: string): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const val = sessionStorage.getItem(`maruf_biometric_unlocked_${userId}`);
      if (val === 'true') return true;
      // Default to unlocked for demo unless locked by user
      const lockedVal = sessionStorage.getItem(`maruf_biometric_locked_${userId}`);
      if (lockedVal === 'true') return false;
      return true;
    } catch {
      return true;
    }
  }

  static setVaultUnlocked(userId: string, unlocked: boolean) {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(`maruf_biometric_unlocked_${userId}`, unlocked ? 'true' : 'false');
      sessionStorage.setItem(`maruf_biometric_locked_${userId}`, unlocked ? 'false' : 'true');
    } catch (e) {
      console.warn('Session storage write error', e);
    }
  }
}
