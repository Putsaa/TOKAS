import React from 'react';
import { Box } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

/**
 * High-fidelity vector illustrations matching the exact products in Kasir.png
 */
export const ProductVisual = ({ code, name, size = 68 }) => {
  switch (code) {
    case 'PRD001': // Kertas Thermal 58mm (Dual white rolls)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="rollShadow" x="0" y="20" width="100" height="80" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.12" />
          </filter>
          <g filter="url(#rollShadow)">
            {/* Back roll */}
            <ellipse cx="68" cy="38" rx="16" ry="7" fill="#e2e8f0" />
            <path d="M52 38v24c0 3.86 7.16 7 16 7s16-3.14 16-7V38" fill="#f1f5f9" />
            <ellipse cx="68" cy="38" rx="16" ry="7" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <ellipse cx="68" cy="38" rx="5" ry="2.2" fill="#334155" />
            
            {/* Front roll */}
            <path d="M22 46v26c0 5 9.85 9 22 9s22-4 22-9V46" fill="#f8fafc" />
            <path d="M22 46v26c0 5 9.85 9 22 9s22-4 22-9V46" stroke="#cbd5e1" strokeWidth="1.5" />
            <ellipse cx="44" cy="46" rx="22" ry="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <ellipse cx="44" cy="46" rx="7" ry="3" fill="#1e293b" />
            {/* Unrolled paper edge */}
            <path d="M22 55c-6 2-10 6-12 11" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          </g>
        </svg>
      );

    case 'PRD002': // Tinta Printer Kasir (Black ink bottle with label & red ring)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="bottleShadow" x="15" y="10" width="70" height="85" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.15" />
          </filter>
          <g filter="url(#bottleShadow)">
            {/* Cap */}
            <rect x="42" y="16" width="16" height="12" rx="2" fill="#0f172a" />
            <rect x="40" y="26" width="20" height="4" rx="1" fill="#dc2626" />
            <path d="M43 28h14v7l-4 4h-6l-4-4v-7z" fill="#1e293b" />
            {/* Bottle body */}
            <path d="M31 42c0-3 3-5 6-5h26c3 0 6 2 6 5l3 40c0 3-3 6-6 6H34c-3 0-6-3-6-6l3-40z" fill="#0f172a" />
            {/* White Label */}
            <rect x="34" y="47" width="32" height="26" rx="2" fill="#ffffff" />
            <rect x="38" y="52" width="24" height="4" rx="1" fill="#0284c7" />
            <rect x="38" y="59" width="16" height="2" rx="1" fill="#64748b" />
            <rect x="38" y="64" width="20" height="2" rx="1" fill="#94a3b8" />
            {/* Bottle highlight */}
            <path d="M33 46l2 34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.25" />
          </g>
        </svg>
      );

    case 'PRD003': // Pulpen Standard (Slanted black pen)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="penShadow" x="10" y="10" width="80" height="80" filterUnits="userSpaceOnUse">
            <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.15" />
          </filter>
          <g filter="url(#penShadow)" transform="rotate(35 50 50)">
            {/* Pen barrel */}
            <rect x="47" y="24" width="6" height="48" rx="2" fill="#1e293b" />
            {/* Grip */}
            <rect x="47" y="60" width="6" height="10" fill="#0f172a" />
            {/* Tip */}
            <path d="M47 72l3 8 3-8h-6z" fill="#cbd5e1" />
            <path d="M49 78l1 3 1-3h-2z" fill="#0f172a" />
            {/* Cap / End button */}
            <rect x="46" y="20" width="8" height="5" rx="1.5" fill="#3b82f6" />
            {/* Pen clip */}
            <rect x="53" y="22" width="2" height="20" rx="1" fill="#94a3b8" />
          </g>
        </svg>
      );

    case 'PRD004': // Buku Tulis A5 (Blue notebook with ribbon)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="bookShadow" x="15" y="10" width="70" height="80" filterUnits="userSpaceOnUse">
            <feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity="0.18" />
          </filter>
          <g filter="url(#bookShadow)" transform="rotate(-8 50 50)">
            {/* Page block */}
            <rect x="30" y="22" width="44" height="58" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            {/* Book cover */}
            <rect x="26" y="20" width="46" height="60" rx="5" fill="#2563eb" />
            {/* Spine */}
            <path d="M26 23c0-2 1.5-3 3.5-3H33v60h-3.5C27.5 80 26 79 26 77V23z" fill="#1d4ed8" />
            {/* Spine ribs */}
            <line x1="27" y1="30" x2="32" y2="30" stroke="#60a5fa" strokeWidth="1" />
            <line x1="27" y1="70" x2="32" y2="70" stroke="#60a5fa" strokeWidth="1" />
            {/* Bookmark ribbon */}
            <path d="M50 20v22l4-4 4 4V20h-8z" fill="#ef4444" />
            {/* Elastic band */}
            <line x1="64" y1="20" x2="64" y2="80" stroke="#1e40af" strokeWidth="2.5" />
          </g>
        </svg>
      );

    case 'PRD005': // Plastik Shopping Bag (Tan kraft paper bag)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="bagShadow" x="15" y="15" width="70" height="75" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.12" />
          </filter>
          <g filter="url(#bagShadow)">
            {/* Handles */}
            <path d="M40 32V20c0-4 4-7 10-7s10 3 10 7v12" stroke="#b45309" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Bag body */}
            <path d="M28 32h44l-3 48c0 3-2 5-5 5H36c-3 0-5-2-5-5l-3-48z" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
            {/* Fold & Creases */}
            <path d="M30 40h40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
            <path d="M42 32l-2 53M58 32l2 53" stroke="#fcd34d" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 'PRD006': // Stapler (Vibrant blue desktop stapler)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="staplerShadow" x="10" y="25" width="80" height="60" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.14" />
          </filter>
          <g filter="url(#staplerShadow)">
            {/* Base plate */}
            <rect x="20" y="62" width="60" height="8" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            <rect x="24" y="60" width="16" height="3" rx="1" fill="#475569" />
            {/* Hinge */}
            <circle cx="72" cy="54" r="6" fill="#64748b" />
            {/* Top arm (angled) */}
            <path d="M22 46c0-4 3-7 7-7h36c6 0 11 4 11 9l-4 6H24c-1.5 0-2-1.5-2-4v-4z" fill="#2563eb" />
            <rect x="24" y="48" width="46" height="4" rx="2" fill="#1d4ed8" />
            {/* Chrome magazine */}
            <rect x="26" y="55" width="46" height="4" rx="1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          </g>
        </svg>
      );

    case 'PRD007': // Isi Staples (Blue box with metallic staples)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="boxShadow" x="15" y="25" width="70" height="55" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.12" />
          </filter>
          <g filter="url(#boxShadow)">
            {/* 3D Box perspective */}
            {/* Top face */}
            <path d="M30 38l22-8 22 6-22 8-22-6z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
            {/* Front face */}
            <path d="M30 38l22 6v22l-22-6V38z" fill="#0284c7" />
            {/* Right face */}
            <path d="M52 44l22-6v22l-22 6V44z" fill="#0369a1" />
            {/* Label / Graphic */}
            <rect x="34" y="44" width="14" height="8" rx="1" fill="#ffffff" transform="skewY(15)" />
            {/* Staple strips protruding */}
            <path d="M48 30l12-4M50 32l12-4M52 34l12-4" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'PRD008': // Lakban Bening (Clear tape roll with yellowish ring)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="tapeShadow" x="15" y="15" width="70" height="70" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.12" />
          </filter>
          <g filter="url(#tapeShadow)">
            {/* Outer roll */}
            <circle cx="50" cy="50" r="28" fill="#fef3c7" stroke="#fcd34d" strokeWidth="2" />
            {/* Tape thickness */}
            <circle cx="50" cy="50" r="21" fill="#fffbeb" stroke="#fde68a" strokeWidth="1.5" />
            {/* Inner cardboard core */}
            <circle cx="50" cy="50" r="16" fill="#d97706" />
            {/* Hole */}
            <circle cx="50" cy="50" r="12" fill="#ffffff" />
            {/* Tape peel tab */}
            <path d="M68 28c4 3 6 8 8 12" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'PRD009': // Spidol Permanent (Permanent marker)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="markerShadow" x="10" y="10" width="80" height="80" filterUnits="userSpaceOnUse">
            <feDropShadow dx="1" dy="4" stdDeviation="3" floodOpacity="0.15" />
          </filter>
          <g filter="url(#markerShadow)" transform="rotate(-35 50 50)">
            {/* Body */}
            <rect x="44" y="24" width="12" height="46" rx="4" fill="#0f172a" />
            {/* White stripe */}
            <rect x="44" y="38" width="12" height="12" fill="#ffffff" />
            <rect x="46" y="42" width="8" height="4" rx="1" fill="#dc2626" />
            {/* Tip collar */}
            <path d="M46 70l4 8h4l4-8h-12z" fill="#64748b" />
            {/* Bullet tip */}
            <path d="M48 78l2 5h1l2-5h-5z" fill="#0f172a" />
            {/* Cap end */}
            <rect x="45" y="20" width="10" height="5" rx="2" fill="#334155" />
          </g>
        </svg>
      );

    case 'PRD010': // Map Plastik (Layered translucent plastic folders)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="folderShadow" x="10" y="15" width="80" height="70" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.12" />
          </filter>
          <g filter="url(#folderShadow)">
            {/* Yellow folder back */}
            <rect x="36" y="24" width="38" height="52" rx="4" fill="#fde047" opacity="0.8" transform="rotate(12 55 50)" />
            {/* Blue/Cyan folder middle */}
            <rect x="30" y="23" width="38" height="52" rx="4" fill="#67e8f9" opacity="0.85" transform="rotate(-4 49 49)" />
            {/* Purple folder front */}
            <rect x="25" y="22" width="38" height="52" rx="4" fill="#c084fc" opacity="0.9" />
            {/* Cutout notch */}
            <path d="M55 22a6 6 0 0 1 6 6" stroke="#9333ea" strokeWidth="1.5" fill="none" />
          </g>
        </svg>
      );

    case 'PRD011': // Kertas A4 70gsm (A4 Blue Paper box)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="a4Shadow" x="10" y="20" width="80" height="60" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.15" />
          </filter>
          <g filter="url(#a4Shadow)">
            {/* 3D Box Top */}
            <path d="M26 38l26-10 26 7-26 10-26-7z" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
            {/* Front Face */}
            <path d="M26 38l26 10v22l-26-10V38z" fill="#0369a1" />
            {/* Right Face */}
            <path d="M52 48l26-7v22l-26 7V48z" fill="#075985" />
            {/* Bold 'A4' text box */}
            <rect x="30" y="44" width="18" height="12" rx="2" fill="#ffffff" transform="skewY(20)" />
            <text x="33" y="53" fill="#0284c7" fontSize="9" fontWeight="900" transform="skewY(20)">A4</text>
            <rect x="56" y="47" width="16" height="8" rx="1" fill="#38bdf8" opacity="0.7" transform="skewY(-15)" />
          </g>
        </svg>
      );

    case 'PRD012': // Gunting (Stainless steel scissors)
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="scissorsShadow" x="10" y="15" width="80" height="70" filterUnits="userSpaceOnUse">
            <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.15" />
          </filter>
          <g filter="url(#scissorsShadow)" transform="rotate(-25 50 50)">
            {/* Steel blades */}
            <path d="M30 46l24 4 18-3-18 6-24-7z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
            <path d="M30 52l24-2 18 3-18-6-24 5z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
            {/* Pivot screw */}
            <circle cx="50" cy="49" r="2.5" fill="#475569" stroke="#ffffff" strokeWidth="0.5" />
            {/* Black handles */}
            <ellipse cx="24" cy="42" rx="9" ry="6" fill="#0f172a" />
            <ellipse cx="24" cy="42" rx="6" ry="3.5" fill="#ffffff" />
            <ellipse cx="24" cy="56" rx="9" ry="6" fill="#0f172a" />
            <ellipse cx="24" cy="56" rx="6" ry="3.5" fill="#ffffff" />
          </g>
        </svg>
      );

    default:
      return (
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: '12px',
            bgcolor: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
          }}
        >
          <Inventory2OutlinedIcon sx={{ fontSize: size * 0.6 }} />
        </Box>
      );
  }
};

export default ProductVisual;
