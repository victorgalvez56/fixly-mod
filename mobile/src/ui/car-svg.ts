/**
 * Top-down car line drawing, rendered through react-native-svg's SvgXml.
 * Kept as a plain SVG string so the illustration can be swapped without
 * touching component code. Only elements SvgXml supports are used
 * (path/rect/circle/ellipse/line/polyline/polygon/g) — no text, CSS or filters.
 * Generic car (no brand marks); strokes #c3c9d1 to match the line token.
 */
export const CAR_SVG_WIDTH = 240;
export const CAR_SVG_HEIGHT = 400;

export const CAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 400">
<path d="M 120 14 C 96 14 70 16 52 21 C 39 25 31 33 29.5 44 C 28.6 52 28.5 58 28.5 62 C 26.6 72 26.6 98 28.5 116 C 29.5 150 29.5 236 28.5 266 C 26.6 278 26.6 334 28.5 346 C 29.5 360 37 373 48 378 C 64 384 92 386 120 386 C 148.00 386.00 176.00 384.00 192.00 378.00 C 203.00 373.00 210.50 360.00 211.50 346.00 C 213.40 334.00 213.40 278.00 211.50 266.00 C 210.50 236.00 210.50 150.00 211.50 116.00 C 213.40 98.00 213.40 72.00 211.50 62.00 C 211.50 58.00 211.40 52.00 210.50 44.00 C 209.00 33.00 201.00 25.00 188.00 21.00 C 170.00 16.00 144.00 14.00 120.00 14.00 Z" fill="#f5f6f8" stroke="#c3c9d1" stroke-width="1.3" stroke-linejoin="round"/>
<rect x="33" y="56" width="14" height="56" rx="5" fill="#c3c9d1" stroke="#c3c9d1" stroke-width="1.0" opacity="0.14"/>
<rect x="193" y="56" width="14" height="56" rx="5" fill="#c3c9d1" stroke="#c3c9d1" stroke-width="1.0" opacity="0.14"/>
<rect x="33" y="56" width="14" height="56" rx="5" fill="none" stroke="#c3c9d1" stroke-width="1.0" opacity="0.8"/>
<rect x="193" y="56" width="14" height="56" rx="5" fill="none" stroke="#c3c9d1" stroke-width="1.0" opacity="0.8"/>
<rect x="36" y="61" width="8" height="46" rx="2.5" fill="none" stroke="#c3c9d1" stroke-width="0.9" opacity="0.7"/>
<rect x="196" y="61" width="8" height="46" rx="2.5" fill="none" stroke="#c3c9d1" stroke-width="0.9" opacity="0.7"/>
<line x1="33.8" y1="62" x2="36" y2="62" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="62" x2="204" y2="62" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="62" x2="46.2" y2="62" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="62" x2="193.8" y2="62" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="67" x2="36" y2="67" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="67" x2="204" y2="67" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="67" x2="46.2" y2="67" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="67" x2="193.8" y2="67" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="72" x2="36" y2="72" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="72" x2="204" y2="72" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="72" x2="46.2" y2="72" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="72" x2="193.8" y2="72" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="77" x2="36" y2="77" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="77" x2="204" y2="77" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="77" x2="46.2" y2="77" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="77" x2="193.8" y2="77" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="82" x2="36" y2="82" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="82" x2="204" y2="82" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="82" x2="46.2" y2="82" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="82" x2="193.8" y2="82" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="87" x2="36" y2="87" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="87" x2="204" y2="87" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="87" x2="46.2" y2="87" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="87" x2="193.8" y2="87" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="92" x2="36" y2="92" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="92" x2="204" y2="92" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="92" x2="46.2" y2="92" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="92" x2="193.8" y2="92" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="97" x2="36" y2="97" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="97" x2="204" y2="97" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="97" x2="46.2" y2="97" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="97" x2="193.8" y2="97" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="102" x2="36" y2="102" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="102" x2="204" y2="102" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="102" x2="46.2" y2="102" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="102" x2="193.8" y2="102" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="107" x2="36" y2="107" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="107" x2="204" y2="107" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="107" x2="46.2" y2="107" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="107" x2="193.8" y2="107" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<rect x="33" y="278" width="14" height="56" rx="5" fill="#c3c9d1" stroke="#c3c9d1" stroke-width="1.0" opacity="0.14"/>
<rect x="193" y="278" width="14" height="56" rx="5" fill="#c3c9d1" stroke="#c3c9d1" stroke-width="1.0" opacity="0.14"/>
<rect x="33" y="278" width="14" height="56" rx="5" fill="none" stroke="#c3c9d1" stroke-width="1.0" opacity="0.8"/>
<rect x="193" y="278" width="14" height="56" rx="5" fill="none" stroke="#c3c9d1" stroke-width="1.0" opacity="0.8"/>
<rect x="36" y="283" width="8" height="46" rx="2.5" fill="none" stroke="#c3c9d1" stroke-width="0.9" opacity="0.7"/>
<rect x="196" y="283" width="8" height="46" rx="2.5" fill="none" stroke="#c3c9d1" stroke-width="0.9" opacity="0.7"/>
<line x1="33.8" y1="284" x2="36" y2="284" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="284" x2="204" y2="284" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="284" x2="46.2" y2="284" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="284" x2="193.8" y2="284" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="289" x2="36" y2="289" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="289" x2="204" y2="289" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="289" x2="46.2" y2="289" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="289" x2="193.8" y2="289" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="294" x2="36" y2="294" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="294" x2="204" y2="294" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="294" x2="46.2" y2="294" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="294" x2="193.8" y2="294" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="299" x2="36" y2="299" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="299" x2="204" y2="299" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="299" x2="46.2" y2="299" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="299" x2="193.8" y2="299" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="304" x2="36" y2="304" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="304" x2="204" y2="304" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="304" x2="46.2" y2="304" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="304" x2="193.8" y2="304" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="309" x2="36" y2="309" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="309" x2="204" y2="309" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="309" x2="46.2" y2="309" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="309" x2="193.8" y2="309" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="314" x2="36" y2="314" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="314" x2="204" y2="314" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="314" x2="46.2" y2="314" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="314" x2="193.8" y2="314" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="319" x2="36" y2="319" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="319" x2="204" y2="319" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="319" x2="46.2" y2="319" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="319" x2="193.8" y2="319" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="324" x2="36" y2="324" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="324" x2="204" y2="324" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="324" x2="46.2" y2="324" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="324" x2="193.8" y2="324" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="33.8" y1="329" x2="36" y2="329" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="206.2" y1="329" x2="204" y2="329" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="44" y1="329" x2="46.2" y2="329" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<line x1="196" y1="329" x2="193.8" y2="329" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<path d="M 33 50 C 35 38 43 29 58 25 C 78 20 100 19 120 19" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 207 50 C 205 38 197 29 182 25 C 162 20 140 19 120 19" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 36 64 C 40 58 46 54 54 52" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 204 64 C 200 58 194 54 186 52" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 70 24.5 C 70 19 73 16.4 79 16 L 161 16 C 167 16.4 170 19 170 24.5 Z" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<line x1="76" y1="17.5" x2="76" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="164" y1="17.5" x2="164" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="81" y1="17.5" x2="81" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="159" y1="17.5" x2="159" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="86" y1="17.5" x2="86" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="154" y1="17.5" x2="154" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="91" y1="17.5" x2="91" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="149" y1="17.5" x2="149" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="96" y1="17.5" x2="96" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="144" y1="17.5" x2="144" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="101" y1="17.5" x2="101" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="139" y1="17.5" x2="139" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="106" y1="17.5" x2="106" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="134" y1="17.5" x2="134" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="111" y1="17.5" x2="111" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<line x1="129" y1="17.5" x2="129" y2="23" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.85"/>
<circle cx="120" cy="20.2" r="3.2" fill="none" stroke="#c3c9d1" stroke-width="1.0"/>
<path d="M 31.5 56 C 31 44 35 33 47 26.5 L 55 28 C 46 33.5 41 43 40.5 56 Z" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 208.5 56 C 209 44 205 33 193 26.5 L 185 28 C 194 33.5 199 43 199.5 56 Z" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 34 52 C 34.5 42 38 34 46 29" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 206 52 C 205.5 42 202 34 194 29" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 64 26 C 57 44 53 72 51 100" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 176 26 C 183 44 187 72 189 100" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 92 24.5 C 87 46 83 74 81 100" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>
<path d="M 148 24.5 C 153 46 157 74 159 100" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>
<line x1="120" y1="26" x2="120" y2="64" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" opacity="0.6"/>
<path d="M 38.5 62 C 41 78 43.5 94 46 106" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
<path d="M 201.5 62 C 199 78 196.5 94 194 106" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
<path d="M 44 104 C 70 98.5 95 96.5 120 96.5 C 145 96.5 170 98.5 196 104" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 43 107 C 70 101 95 99 120 99 C 145 99 170 101 197 107 L 183 157 C 160 152.5 140 151.5 120 151.5 C 100 151.5 80 152.5 57 157 Z" fill="none" stroke="#c3c9d1" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 47 110 C 72 104.5 96 102.5 120 102.5 C 144 102.5 168 104.5 193 110 L 180 154.5 C 158 150.5 140 149.5 120 149.5 C 100 149.5 82 150.5 60 154.5 Z" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
<path d="M 43 107 C 39 140 39 205 41 252 C 43 292 48 318 52 330" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 197 107 C 201 140 201 205 199 252 C 197 292 192 318 188 330" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 57 157 C 55 200 55 250 61 288" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 183 157 C 185 200 185 250 179 288" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 45 114 C 50 130 54 145 57 157" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
<path d="M 195 114 C 190 130 186 145 183 157" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
<path d="M 28.5 150 C 34 146 40 138 43 122" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 211.5 150 C 206 146 200 138 197 122" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 28.5 222 C 33 222 38 221 40.5 220" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 211.5 222 C 207 222 202 221 199.5 220" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 40.5 220 L 55.5 221" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 199.5 220 L 184.5 221" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 28.5 284 C 31 276 36 268 41.5 262" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 211.5 284 C 209 276 204 268 198.5 262" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 44 302 C 50 294 56 290 61 288" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 196 302 C 190 294 184 290 179 288" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 32.80 208.00 C 32.80 210.87 31.90 213.20 30.80 213.20 C 29.70 213.20 28.80 210.87 28.80 208.00 C 28.80 205.13 29.70 202.80 30.80 202.80 C 31.90 202.80 32.80 205.13 32.80 208.00 Z" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 207.2 208 C 207.2 210.87 208.1 213.2 209.2 213.2 C 210.3 213.2 211.2 210.87 211.2 208 C 211.2 205.13 210.3 202.8 209.2 202.8 C 208.1 202.8 207.2 205.13 207.2 208 Z" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 32.80 270.00 C 32.80 272.87 31.90 275.20 30.80 275.20 C 29.70 275.20 28.80 272.87 28.80 270.00 C 28.80 267.13 29.70 264.80 30.80 264.80 C 31.90 264.80 32.80 267.13 32.80 270.00 Z" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 207.2 270 C 207.2 272.87 208.1 275.2 209.2 275.2 C 210.3 275.2 211.2 272.87 211.2 270 C 211.2 267.13 210.3 264.8 209.2 264.8 C 208.1 264.8 207.2 267.13 207.2 270 Z" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 29.5 160 C 30.5 200 30.5 240 29.5 262" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
<path d="M 210.5 160 C 209.5 200 209.5 240 210.5 262" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
<path d="M 40 137.5 C 33 138 25 144 20.5 150.5 C 16.5 156 19 161.5 24.5 160.5 C 31 159 38 149 40 137.5 Z" fill="#f5f6f8" stroke="#c3c9d1" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 200 137.5 C 207 138 215 144 219.5 150.5 C 223.5 156 221 161.5 215.5 160.5 C 209 159 202 149 200 137.5 Z" fill="#f5f6f8" stroke="#c3c9d1" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 36.5 142 C 31 145.5 26 150.5 23 156.5" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 203.5 142 C 209 145.5 214 150.5 217 156.5" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 59 161 C 80 157 100 155.5 120 155.5 C 140 155.5 160 157 181 161" fill="none" stroke="#c3c9d1" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
<rect x="70" y="170" width="100" height="54" rx="7" fill="none" stroke="#c3c9d1" stroke-width="1.1"/>
<rect x="73" y="173" width="94" height="48" rx="5" fill="none" stroke="#c3c9d1" stroke-width="0.8" opacity="0.7"/>
<path d="M 62 284 C 80 283 100 282.5 120 282.5 C 140 282.5 160 283 178 284" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
<path d="M 117 281 C 117.4 275.5 118.8 270.5 120 268.5 C 121.2 270.5 122.6 275.5 123 281 Z" fill="#f5f6f8" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 64 120 C 90 115.5 150 115.5 176 120" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
<circle cx="88" cy="130" r="6" fill="none" stroke="#c3c9d1" stroke-width="0.8" opacity="0.35"/>
<circle cx="88" cy="130" r="1.4" fill="none" stroke="#c3c9d1" stroke-width="0.8" opacity="0.35"/>
<rect x="77" y="234" width="22" height="30" rx="5" fill="none" stroke="#c3c9d1" stroke-width="0.8" opacity="0.32"/>
<rect x="141" y="234" width="22" height="30" rx="5" fill="none" stroke="#c3c9d1" stroke-width="0.8" opacity="0.32"/>
<rect x="81" y="228" width="14" height="6" rx="2.5" fill="none" stroke="#c3c9d1" stroke-width="0.8" opacity="0.32"/>
<rect x="145" y="228" width="14" height="6" rx="2.5" fill="none" stroke="#c3c9d1" stroke-width="0.8" opacity="0.32"/>
<line x1="120" y1="228" x2="120" y2="264" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" opacity="0.3"/>
<path d="M 61 288 C 80 286 100 285 120 285 C 140 285 160 286 179 288 L 191 327 C 166 331.5 141 333 120 333 C 99 333 74 331.5 49 327 Z" fill="none" stroke="#c3c9d1" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 64 291 C 82 289 101 288 120 288 C 139 288 158 289 176 291 L 187 325 C 164 329 141 330.5 120 330.5 C 99 330.5 76 329 53 325 Z" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
<path d="M 48 336 C 72 341 96 343 120 343 C 144 343 168 341 192 336 L 196 356 C 175 366 148 370 120 370 C 92 370 65 366 44 356 Z" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 50 331 C 74 335.5 97 337.5 120 337.5 C 143 337.5 166 335.5 190 331" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
<rect x="104" y="355" width="32" height="9" rx="1.5" fill="none" stroke="#c3c9d1" stroke-width="0.9"/>
<circle cx="120" cy="348.5" r="2.4" fill="none" stroke="#c3c9d1" stroke-width="0.9"/>
<path d="M 31.5 336 C 31.5 346 34 354 41 360 L 48 357.5 C 42.5 351 40.5 344 40.5 336 Z" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 208.5 336 C 208.5 346 206 354 199 360 L 192 357.5 C 197.5 351 199.5 344 199.5 336 Z" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 34.5 339 C 35 346 37 352 42 356.5" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 205.5 339 C 205 346 203 352 198 356.5" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<path d="M 34 364 C 42 372 60 379 82 381.5 C 95 382.6 108 383 120 383" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 206 364 C 198 372 180 379 158 381.5 C 145 382.6 132 383 120 383" fill="none" stroke="#c3c9d1" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 46 372 C 70 377 96 378.5 120 378.5" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
<path d="M 194 372 C 170 377 144 378.5 120 378.5" fill="none" stroke="#c3c9d1" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
<rect x="52" y="366" width="12" height="2.6" rx="1.3" fill="none" stroke="#c3c9d1" stroke-width="0.8" opacity="0.8"/>
<rect x="176" y="366" width="12" height="2.6" rx="1.3" fill="none" stroke="#c3c9d1" stroke-width="0.8" opacity="0.8"/>
</svg>`;
