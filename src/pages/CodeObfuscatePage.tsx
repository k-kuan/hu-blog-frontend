import React, { useState, useCallback, useMemo } from 'react';
import { Typography, Row, Col, Input, Button, Space, message, Card, Segmented, Select } from 'antd';
import { CopyOutlined, SwapOutlined, ClearOutlined } from '@ant-design/icons';
import { obfuscate, type ObfuscatorOptions } from 'javascript-obfuscator';
import Babel from '@babel/standalone';

const { TextArea } = Input;
const { Title, Text } = Typography;

// ── types ──────────────────────────────────────────────

type CodeLanguage = 'auto' | 'javascript' | 'typescript' | 'jsx' | 'css' | 'html';
type ObfuscationPreset = 'low' | 'medium' | 'high';

interface LanguageOption {
  value: CodeLanguage;
  label: string;
}

const LANGUAGES: LanguageOption[] = [
  { value: 'auto', label: 'Auto Detect' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX / TSX' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
];

const JS_LANGUAGES: Set<CodeLanguage> = new Set(['auto', 'javascript', 'typescript', 'jsx']);

// ── obfuscation presets ────────────────────────────────

const PRESET_OPTIONS: Record<ObfuscationPreset, ObfuscatorOptions> = {
  low: {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    stringArray: true,
    stringArrayThreshold: 0.5,
  },
  medium: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: false,
    stringArray: true,
    stringArrayThreshold: 0.75,
    rotateStringArray: true,
  },
  high: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.3,
    stringArray: true,
    stringArrayThreshold: 1,
    rotateStringArray: true,
    stringArrayEncoding: ['base64'],
    splitStrings: true,
    splitStringsChunkLength: 5,
  },
};

// ── CSS minifier (browser-safe, no Node.js dependency) ──

function minifyCSS(css: string): string {
  let result = css
    // remove comments (but keep license comments)
    .replace(/\/\*[\s\S]*?\*\//g, (m) => (m.startsWith('/*!') ? m : ''))
    // collapse whitespace
    .replace(/\s+/g, ' ')
    // remove whitespace around { } : ; ,
    .replace(/\s*\{\s*/g, '{')
    .replace(/\s*\}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    // remove last semicolon before }
    .replace(/;\}/g, '}')
    // remove leading/trailing whitespace
    .replace(/^\s+|\s+$/g, '')
    // remove leading zeros (0.5 → .5)
    .replace(/([: ,])0\./g, '$1.')
    // shorten hex colors (#ffffff → #fff)
    .replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, '#$1$2$3')
    // remove units from zero values
    .replace(/([: ,])0(px|em|rem|%|vh|vw|vmin|vmax|ms|s|deg)/gi, '$10');
  return result;
}

// ── auto-detection heuristics ──────────────────────────

function detectLanguage(code: string): Exclude<CodeLanguage, 'auto'> {
  const s = code.trim();

  // HTML — starts with doctype or a typical block-level HTML tag
  if (
    /^\s*<(!DOCTYPE|html|head|body|div|span|p|a|img|ul|ol|li|table|form|input|button|h[1-6]|header|footer|nav|section|article|main|aside|br|hr|link|meta|style|script)\b/i.test(
      s,
    )
  ) {
    return 'html';
  }

  // CSS — looks like a CSS rule or at-rule, and lacks JS keywords
  if (
    /^[.#@]?[-\w]+[\s]*\{/.test(s) ||
    /^@(import|media|keyframes|font-face|charset|supports|layer)\b/.test(s)
  ) {
    if (!/\b(import|export|const|let|var|function|class|return|from)\b/.test(s)) {
      return 'css';
    }
  }

  // everything else is treated as JS-family (will try Babel + obfuscator fallback)
  return 'javascript';
}

// ── HTML minifier (lightweight, no extra dependency) ───

function minifyHTML(html: string): string {
  let result = html
    // remove HTML comments (but keep IE conditional comments)
    .replace(/<!--(?!\[if\b)[\s\S]*?-->/g, '')
    // collapse whitespace
    .replace(/\s+/g, ' ')
    // remove whitespace between tags
    .replace(/>\s+</g, '><')
    // remove leading/trailing whitespace
    .trim();

  // preserve whitespace inside <pre> and <textarea>
  const preserveBlocks: string[] = [];
  result = result.replace(
    /<(pre|textarea|code)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi,
    (match) => {
      preserveBlocks.push(match);
      return `%%PRESERVE_${preserveBlocks.length - 1}%%`;
    },
  );
  // restore preserved blocks
  result = result.replace(/%%PRESERVE_(\d+)%%/g, (_, i) => preserveBlocks[Number(i)]);

  return result;
}

// ── component ──────────────────────────────────────────

const CodeObfuscatePage: React.FC = () => {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [language, setLanguage] = useState<CodeLanguage>('auto');
  const [preset, setPreset] = useState<ObfuscationPreset>('medium');
  const [obfuscating, setObfuscating] = useState(false);

  const showStrength = JS_LANGUAGES.has(language);

  // Resolve effective language (auto → detected)
  const effectiveLang = useMemo<Exclude<CodeLanguage, 'auto'>>(() => {
    if (language !== 'auto') return language;
    return detectLanguage(inputCode);
  }, [language, inputCode]);

  const detectedLabel = useMemo(() => {
    if (language !== 'auto') return null;
    const label = LANGUAGES.find((l) => l.value === effectiveLang)?.label;
    return label ? `detected as ${label}` : null;
  }, [language, effectiveLang]);

  // ── processing ─────────────────────────────────────

  const handleObfuscate = useCallback(() => {
    const code = inputCode.trim();
    if (!code) {
      message.warning('Please enter some code first');
      return;
    }

    setObfuscating(true);

    try {
      let result: string;

      switch (effectiveLang) {
        // ── JavaScript ────────────────────────────
        case 'javascript': {
          const out = obfuscate(code, PRESET_OPTIONS[preset]);
          result = out.getObfuscatedCode();
          break;
        }

        // ── TypeScript / JSX / TSX ────────────────
        case 'typescript':
        case 'jsx': {
          let transpiled: string;
          try {
            // Apply both presets — handles TS, JSX, and TSX
            const babelOut = Babel.transform(code, {
              presets: ['typescript', 'react'],
              filename: effectiveLang === 'jsx' ? 'file.tsx' : 'file.ts',
            });
            transpiled = babelOut.code ?? code;
          } catch {
            // Babel failed — try obfuscating directly (may be plain JS misidentified)
            transpiled = code;
          }
          const out = obfuscate(transpiled, PRESET_OPTIONS[preset]);
          result = out.getObfuscatedCode();
          break;
        }

        // ── CSS ───────────────────────────────────
        case 'css': {
          result = minifyCSS(code);
          break;
        }

        // ── HTML ──────────────────────────────────
        case 'html': {
          result = minifyHTML(code);
          break;
        }

        default:
          result = code;
      }

      setOutputCode(result);
      message.success('Done');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const hint =
        effectiveLang === 'javascript' &&
        (errorMessage.includes('Unexpected token') || errorMessage.includes('SyntaxError'))
          ? ' Try switching to TypeScript or JSX mode if your code uses those features.'
          : '';
      message.error('Failed: ' + errorMessage + hint);
    } finally {
      setObfuscating(false);
    }
  }, [inputCode, effectiveLang, preset]);

  const handleCopy = useCallback(async () => {
    if (!outputCode) return;
    try {
      await navigator.clipboard.writeText(outputCode);
      message.success('Copied to clipboard');
    } catch {
      message.error('Failed to copy');
    }
  }, [outputCode]);

  const handleClear = useCallback(() => {
    setInputCode('');
    setOutputCode('');
  }, []);

  // ── render ─────────────────────────────────────────

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Code Obfuscator
        </Title>

        <Space size="middle" wrap>
          <Space size="small">
            <Text>Language:</Text>
            <Select
              value={language}
              onChange={(val) => setLanguage(val)}
              style={{ width: 140 }}
              options={LANGUAGES}
            />
          </Space>

          {showStrength && (
            <Space size="small">
              <Text>Strength:</Text>
              <Segmented
                value={preset}
                onChange={(val) => setPreset(val as ObfuscationPreset)}
                options={[
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' },
                ]}
              />
            </Space>
          )}

          <Button
            type="primary"
            icon={<SwapOutlined />}
            onClick={handleObfuscate}
            loading={obfuscating}
          >
            Obfuscate
          </Button>
        </Space>
      </div>

      {/* detected hint */}
      {detectedLabel && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 12, marginTop: -8 }}>
          Auto-detected: {detectedLabel}
        </Text>
      )}

      {/* editor panels */}
      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card
            title="Original Code"
            size="small"
            extra={
              <Button
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClear}
                disabled={!inputCode}
              >
                Clear
              </Button>
            }
            style={{ height: '100%' }}
          >
            <TextArea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your code here…"
              rows={22}
              style={{
                fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                fontSize: 13,
              }}
              spellCheck={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Obfuscated Code"
            size="small"
            extra={
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                disabled={!outputCode}
              >
                Copy
              </Button>
            }
            style={{ height: '100%' }}
          >
            <TextArea
              value={outputCode}
              readOnly
              placeholder="Result will appear here…"
              rows={22}
              style={{
                fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                fontSize: 13,
                background: '#fafafa',
              }}
              spellCheck={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CodeObfuscatePage;
