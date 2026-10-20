export interface MimeEntry {
  ext: string[];
  mime: string;
  name: string;
  /** Hex signature at the given byte offset, "??" matches any byte */
  magic?: { hex: string; offset?: number };
}

export const MIME_TYPES: MimeEntry[] = [
  { ext: ['jpg', 'jpeg'], mime: 'image/jpeg', name: 'JPEG image', magic: { hex: 'FFD8FF' } },
  { ext: ['png'], mime: 'image/png', name: 'PNG image', magic: { hex: '89504E470D0A1A0A' } },
  { ext: ['gif'], mime: 'image/gif', name: 'GIF image', magic: { hex: '47494638' } },
  { ext: ['webp'], mime: 'image/webp', name: 'WebP image', magic: { hex: '52494646????????57454250' } },
  { ext: ['avif'], mime: 'image/avif', name: 'AVIF image', magic: { hex: '6674797061766966', offset: 4 } },
  { ext: ['heic'], mime: 'image/heic', name: 'HEIC image', magic: { hex: '6674797068656963', offset: 4 } },
  { ext: ['bmp'], mime: 'image/bmp', name: 'Bitmap image', magic: { hex: '424D' } },
  { ext: ['ico'], mime: 'image/vnd.microsoft.icon', name: 'Icon', magic: { hex: '00000100' } },
  { ext: ['tif', 'tiff'], mime: 'image/tiff', name: 'TIFF image', magic: { hex: '49492A00' } },
  { ext: ['svg'], mime: 'image/svg+xml', name: 'SVG vector image' },
  { ext: ['pdf'], mime: 'application/pdf', name: 'PDF document', magic: { hex: '25504446' } },
  { ext: ['zip'], mime: 'application/zip', name: 'ZIP archive', magic: { hex: '504B0304' } },
  { ext: ['docx'], mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'Word document', magic: { hex: '504B0304' } },
  { ext: ['xlsx'], mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'Excel spreadsheet', magic: { hex: '504B0304' } },
  { ext: ['pptx'], mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', name: 'PowerPoint presentation', magic: { hex: '504B0304' } },
  { ext: ['epub'], mime: 'application/epub+zip', name: 'EPUB e-book', magic: { hex: '504B0304' } },
  { ext: ['jar'], mime: 'application/java-archive', name: 'Java archive', magic: { hex: '504B0304' } },
  { ext: ['apk'], mime: 'application/vnd.android.package-archive', name: 'Android package', magic: { hex: '504B0304' } },
  { ext: ['gz', 'tgz'], mime: 'application/gzip', name: 'Gzip archive', magic: { hex: '1F8B' } },
  { ext: ['7z'], mime: 'application/x-7z-compressed', name: '7-Zip archive', magic: { hex: '377ABCAF271C' } },
  { ext: ['rar'], mime: 'application/vnd.rar', name: 'RAR archive', magic: { hex: '526172211A07' } },
  { ext: ['tar'], mime: 'application/x-tar', name: 'Tar archive', magic: { hex: '7573746172', offset: 257 } },
  { ext: ['bz2'], mime: 'application/x-bzip2', name: 'Bzip2 archive', magic: { hex: '425A68' } },
  { ext: ['xz'], mime: 'application/x-xz', name: 'XZ archive', magic: { hex: 'FD377A585A00' } },
  { ext: ['zst'], mime: 'application/zstd', name: 'Zstandard archive', magic: { hex: '28B52FFD' } },
  { ext: ['doc', 'xls', 'ppt', 'msi'], mime: 'application/x-ole-storage', name: 'Legacy Office / OLE file', magic: { hex: 'D0CF11E0A1B11AE1' } },
  { ext: ['rtf'], mime: 'application/rtf', name: 'Rich Text', magic: { hex: '7B5C727466' } },
  { ext: ['odt'], mime: 'application/vnd.oasis.opendocument.text', name: 'OpenDocument text', magic: { hex: '504B0304' } },
  { ext: ['mp3'], mime: 'audio/mpeg', name: 'MP3 audio', magic: { hex: '494433' } },
  { ext: ['wav'], mime: 'audio/wav', name: 'WAV audio', magic: { hex: '52494646????????57415645' } },
  { ext: ['ogg', 'oga'], mime: 'audio/ogg', name: 'Ogg audio', magic: { hex: '4F676753' } },
  { ext: ['flac'], mime: 'audio/flac', name: 'FLAC audio', magic: { hex: '664C6143' } },
  { ext: ['m4a'], mime: 'audio/mp4', name: 'MPEG-4 audio', magic: { hex: '667479704D3441', offset: 4 } },
  { ext: ['aac'], mime: 'audio/aac', name: 'AAC audio' },
  { ext: ['opus'], mime: 'audio/opus', name: 'Opus audio' },
  { ext: ['mid', 'midi'], mime: 'audio/midi', name: 'MIDI', magic: { hex: '4D546864' } },
  { ext: ['mp4', 'm4v'], mime: 'video/mp4', name: 'MPEG-4 video', magic: { hex: '66747970', offset: 4 } },
  { ext: ['mov'], mime: 'video/quicktime', name: 'QuickTime video', magic: { hex: '6674797071742020', offset: 4 } },
  { ext: ['webm'], mime: 'video/webm', name: 'WebM video', magic: { hex: '1A45DFA3' } },
  { ext: ['mkv'], mime: 'video/x-matroska', name: 'Matroska video', magic: { hex: '1A45DFA3' } },
  { ext: ['avi'], mime: 'video/x-msvideo', name: 'AVI video', magic: { hex: '52494646????????41564920' } },
  { ext: ['mpeg', 'mpg'], mime: 'video/mpeg', name: 'MPEG video', magic: { hex: '000001BA' } },
  { ext: ['ts'], mime: 'video/mp2t', name: 'MPEG transport stream (also TypeScript)' },
  { ext: ['woff'], mime: 'font/woff', name: 'WOFF font', magic: { hex: '774F4646' } },
  { ext: ['woff2'], mime: 'font/woff2', name: 'WOFF2 font', magic: { hex: '774F4632' } },
  { ext: ['ttf'], mime: 'font/ttf', name: 'TrueType font', magic: { hex: '0001000000' } },
  { ext: ['otf'], mime: 'font/otf', name: 'OpenType font', magic: { hex: '4F54544F' } },
  { ext: ['html', 'htm'], mime: 'text/html', name: 'HTML' },
  { ext: ['css'], mime: 'text/css', name: 'CSS' },
  { ext: ['js', 'mjs', 'cjs'], mime: 'text/javascript', name: 'JavaScript' },
  { ext: ['json'], mime: 'application/json', name: 'JSON' },
  { ext: ['jsonld'], mime: 'application/ld+json', name: 'JSON-LD' },
  { ext: ['xml'], mime: 'application/xml', name: 'XML', magic: { hex: '3C3F786D6C' } },
  { ext: ['txt'], mime: 'text/plain', name: 'Plain text' },
  { ext: ['csv'], mime: 'text/csv', name: 'CSV' },
  { ext: ['md', 'markdown'], mime: 'text/markdown', name: 'Markdown' },
  { ext: ['yaml', 'yml'], mime: 'application/yaml', name: 'YAML' },
  { ext: ['toml'], mime: 'application/toml', name: 'TOML' },
  { ext: ['ics'], mime: 'text/calendar', name: 'Calendar' },
  { ext: ['vcf'], mime: 'text/vcard', name: 'vCard' },
  { ext: ['wasm'], mime: 'application/wasm', name: 'WebAssembly', magic: { hex: '0061736D' } },
  { ext: ['webmanifest'], mime: 'application/manifest+json', name: 'Web app manifest' },
  { ext: ['exe', 'dll'], mime: 'application/vnd.microsoft.portable-executable', name: 'Windows executable', magic: { hex: '4D5A' } },
  { ext: ['elf', 'so'], mime: 'application/x-elf', name: 'Linux executable (ELF)', magic: { hex: '7F454C46' } },
  { ext: ['dmg'], mime: 'application/x-apple-diskimage', name: 'macOS disk image' },
  { ext: ['iso'], mime: 'application/x-iso9660-image', name: 'Disc image', magic: { hex: '4344303031', offset: 32769 } },
  { ext: ['sqlite', 'db'], mime: 'application/vnd.sqlite3', name: 'SQLite database', magic: { hex: '53514C69746520666F726D6174203300' } },
  { ext: ['bin'], mime: 'application/octet-stream', name: 'Binary data' },
  { ext: ['sh'], mime: 'application/x-sh', name: 'Shell script', magic: { hex: '2321' } },
  { ext: ['psd'], mime: 'image/vnd.adobe.photoshop', name: 'Photoshop document', magic: { hex: '38425053' } },
];

const matches = (bytes: Uint8Array, hex: string, offset = 0) => {
  for (let i = 0; i < hex.length / 2; i++) {
    const h = hex.slice(i * 2, i * 2 + 2);
    if (h === '??') continue;
    if (bytes[offset + i] !== parseInt(h, 16)) return false;
  }
  return true;
};

/** Every known type whose signature matches the start of the file. Longer signatures first. */
export function detect(bytes: Uint8Array): MimeEntry[] {
  return MIME_TYPES.filter((e) => e.magic && bytes.length >= (e.magic.offset ?? 0) + e.magic.hex.length / 2 && matches(bytes, e.magic.hex, e.magic.offset))
    .sort((a, b) => b.magic!.hex.replace(/\?/g, '').length - a.magic!.hex.replace(/\?/g, '').length);
}

export function search(q: string): MimeEntry[] {
  const s = q.trim().toLowerCase().replace(/^\./, '');
  if (!s) return MIME_TYPES;
  return MIME_TYPES.filter((e) => e.ext.some((x) => x.startsWith(s)) || e.mime.includes(s) || e.name.toLowerCase().includes(s));
}
