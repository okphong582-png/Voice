import React from 'react';

/**
 * Voice Hoangha's signature mark: modern acoustic wave with glowing gradient spark.
 */
export default function VoiceStudioMark({ className = '', title = 'Voice Hoangha', ...props }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="vhGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#vhGrad)" fillOpacity="0.12" stroke="url(#vhGrad)" strokeWidth="1.5" />
      <path
        d="M16 32c2.5-4 4.5-9 7-9 3.5 0 3 18 6.5 18 3.5 0 3-20 6.5-20s3 22 6.5 22 3.5-11 6.5-11"
        stroke="url(#vhGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="48.5" cy="32" r="2.5" fill="#a855f7" />
    </svg>
  );
}

