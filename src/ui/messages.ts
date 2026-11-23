import type { RecorderErrorCode } from '../services/recorder'

export const UNSUPPORTED = "Recording isn't supported in this browser — try Chrome or Safari."
export const PERMISSION_DENIED =
  'Microphone access is blocked. Allow microphone access for this site in your browser settings, then try again.'
export const RECORDING_FAILED = 'Recording failed — try again.'
export const STORAGE_FULL = 'Storage full — delete old recordings in History.'
export const INSTALL_HINT = 'Add to home screen to keep your recordings safe.'
export const NO_MATCH = 'No questions match — try another category.'

export function recorderErrorMessage(code: RecorderErrorCode): string {
  switch (code) {
    case 'unsupported':
      return UNSUPPORTED
    case 'permission-denied':
      return PERMISSION_DENIED
    case 'failed':
      return RECORDING_FAILED
  }
}

export const SAVE_FAILED = "Couldn't save the answer — try again."
export const DELETE_FAILED = "Couldn't delete — try again."
