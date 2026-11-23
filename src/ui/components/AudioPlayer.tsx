import { useEffect, useRef } from 'react'

/** Plays a recording. The object URL is revoked when the blob changes or the player unmounts. */
export function AudioPlayer({ blob }: { blob: Blob }) {
  const ref = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(blob)
    if (ref.current) ref.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [blob])

  return <audio ref={ref} className="audio" controls preload="metadata" />
}
