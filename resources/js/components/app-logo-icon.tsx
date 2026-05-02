import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#1f4f96"
                strokeWidth="4"
            />
            <path
                d="M7 32a25 25 0 0 1 25-25"
                fill="none"
                stroke="#2faa3f"
                strokeWidth="4"
                strokeLinecap="round"
            />

            <rect
                x="20"
                y="14"
                width="24"
                height="32"
                rx="4"
                fill="white"
                stroke="#113a6b"
                strokeWidth="3"
            />
            <rect
                x="27"
                y="11"
                width="10"
                height="5"
                rx="2"
                fill="#113a6b"
            />

            <circle cx="25" cy="24" r="3.5" fill="#2faa3f" />
            <path
                d="M23.5 24l1.1 1.2 2.2-2.4"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M30 24h9"
                stroke="#113a6b"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <circle cx="25" cy="33" r="3.5" fill="#1f4f96" />
            <path
                d="M23.5 33l1.1 1.2 2.2-2.4"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M30 33h9"
                stroke="#113a6b"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <circle cx="44" cy="44" r="8.5" fill="white" stroke="#2faa3f" strokeWidth="2.5" />
            <path
                d="M40.8 44.6v-1.8a3.2 3.2 0 0 1 6.4 0v1.8M40.2 44.6h7.6v5.2h-7.6z"
                fill="none"
                stroke="#2faa3f"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
