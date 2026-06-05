import React, { useState, useCallback, useMemo } from 'react';
import {
  Typography,
  Row,
  Col,
  Input,
  Button,
  Select,
  Switch,
  InputNumber,
  Card,
  Form,
  message,
  Space,
} from 'antd';
import { CopyOutlined, ThunderboltOutlined, ClearOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

// ── types ──────────────────────────────────────────────

interface PromptConfig {
  // Role
  role: string;
  customRole: string;

  // Task
  taskType: string;
  taskDescription: string;

  // Context
  techStack: string;
  existingCode: string;
  references: string;

  // Output
  outputFormat: string;
  outputLanguage: string;
  codeLanguage: string;

  // Constraints
  difficulty: string;
  maxWords: number | null;
  needExamples: boolean;
  needComments: boolean;
  extraConstraints: string;
}

// ── defaults ───────────────────────────────────────────

const DEFAULT_CONFIG: PromptConfig = {
  role: 'frontend',
  customRole: '',
  taskType: 'code-generation',
  taskDescription: '',
  techStack: '',
  existingCode: '',
  references: '',
  outputFormat: 'markdown',
  outputLanguage: 'zh',
  codeLanguage: 'typescript',
  difficulty: 'intermediate',
  maxWords: null,
  needExamples: false,
  needComments: true,
  extraConstraints: '',
};

// ── option constants ───────────────────────────────────

const ROLE_OPTIONS = [
  { value: 'frontend', label: '前端开发工程师' },
  { value: 'backend', label: '后端开发工程师' },
  { value: 'fullstack', label: '全栈工程师' },
  { value: 'architect', label: '架构师' },
  { value: 'tech-writer', label: '技术文档撰写者' },
  { value: 'pm', label: '产品经理' },
  { value: 'qa', label: 'QA 测试工程师' },
  { value: 'devops', label: 'DevOps 工程师' },
  { value: 'data-analyst', label: '数据分析师' },
  { value: 'security', label: '安全工程师' },
  { value: 'custom', label: '自定义...' },
];

const ROLE_LABEL_MAP: Record<string, string> = {
  frontend: '前端开发工程师',
  backend: '后端开发工程师',
  fullstack: '全栈工程师',
  architect: '架构师',
  'tech-writer': '技术文档撰写者',
  pm: '产品经理',
  qa: 'QA 测试工程师',
  devops: 'DevOps 工程师',
  'data-analyst': '数据分析师',
  security: '安全工程师',
};

const TASK_TYPE_OPTIONS = [
  { value: 'code-generation', label: '编写代码' },
  { value: 'code-review', label: '代码审查' },
  { value: 'refactoring', label: '重构优化' },
  { value: 'explain', label: '解释代码逻辑' },
  { value: 'debug', label: '调试修复 Bug' },
  { value: 'documentation', label: '撰写文档' },
  { value: 'test-writing', label: '编写测试' },
  { value: 'design', label: '方案设计' },
  { value: 'performance', label: '性能分析与优化' },
];

const TASK_TYPE_LABEL_MAP: Record<string, string> = {
  'code-generation': '编写代码',
  'code-review': '代码审查',
  'refactoring': '重构优化',
  'explain': '解释代码逻辑',
  'debug': '调试修复 Bug',
  'documentation': '撰写文档',
  'test-writing': '编写测试',
  'design': '方案设计',
  'performance': '性能分析与优化',
};

const FORMAT_OPTIONS = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'plain-text', label: '纯文本' },
  { value: 'code-only', label: '仅代码' },
  { value: 'json', label: 'JSON' },
];

const FORMAT_LABEL_MAP: Record<string, string> = {
  markdown: 'Markdown',
  'plain-text': '纯文本',
  'code-only': '仅代码',
  json: 'JSON',
};

const LANGUAGE_OPTIONS = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
];

const LANGUAGE_LABEL_MAP: Record<string, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
};

const CODE_LANG_OPTIONS = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'other', label: '其他' },
];

const CODE_LANG_LABEL_MAP: Record<string, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  go: 'Go',
  rust: 'Rust',
  cpp: 'C++',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  other: '其他',
};

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: '入门' },
  { value: 'intermediate', label: '中级' },
  { value: 'advanced', label: '高级' },
  { value: 'expert', label: '专家' },
];

const DIFFICULTY_LABEL_MAP: Record<string, string> = {
  beginner: '入门',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家',
};

// ── markdown generation ────────────────────────────────

function generatePrompt(config: PromptConfig): string {
  const lines: string[] = [];

  const roleLabel =
    config.role === 'custom' && config.customRole.trim()
      ? config.customRole.trim()
      : (ROLE_LABEL_MAP[config.role] ?? config.role);

  const taskTypeLabel = TASK_TYPE_LABEL_MAP[config.taskType] ?? config.taskType;
  const formatLabel = FORMAT_LABEL_MAP[config.outputFormat] ?? config.outputFormat;
  const langLabel = LANGUAGE_LABEL_MAP[config.outputLanguage] ?? config.outputLanguage;
  const codeLabel = CODE_LANG_LABEL_MAP[config.codeLanguage] ?? config.codeLanguage;
  const diffLabel = DIFFICULTY_LABEL_MAP[config.difficulty] ?? config.difficulty;

  const hasContext =
    config.techStack.trim() || config.existingCode.trim() || config.references.trim();

  const hasConstraints =
    (config.maxWords && config.maxWords > 0) ||
    config.needExamples ||
    config.needComments ||
    config.extraConstraints.trim();

  // ── Role ──
  lines.push('# AI Prompt', '');
  lines.push('## 角色 (Role)', '');
  lines.push(`你是一位 **${roleLabel}**。`, '');
  lines.push('---', '');

  // ── Task ──
  lines.push('## 任务 (Task)', '');
  lines.push(`**任务类型：** ${taskTypeLabel}`, '');
  if (config.taskDescription.trim()) {
    lines.push(config.taskDescription.trim(), '');
  }
  lines.push('---', '');

  // ── Context ──
  if (hasContext) {
    lines.push('## 背景上下文 (Context)', '');
    if (config.techStack.trim()) {
      lines.push(`- **技术栈：** ${config.techStack.trim()}`, '');
    }
    if (config.existingCode.trim()) {
      lines.push('**现有代码：**', '');
      lines.push('```' + (config.codeLanguage || ''));
      lines.push(config.existingCode.trim());
      lines.push('```', '');
    }
    if (config.references.trim()) {
      lines.push(`- **参考资料：** ${config.references.trim()}`, '');
    }
    lines.push('---', '');
  }

  // ── Output ──
  lines.push('## 输出要求 (Output Requirements)', '');
  lines.push(`- **输出格式：** ${formatLabel}`);
  lines.push(`- **输出语言：** ${langLabel}`);
  lines.push(`- **代码语言：** ${codeLabel}`, '');
  lines.push('---', '');

  // ── Constraints ──
  lines.push('## 约束条件 (Constraints)', '');
  lines.push(`- **难度级别：** ${diffLabel}`);
  if (config.maxWords && config.maxWords > 0) {
    lines.push(`- **字数限制：** 不超过 ${config.maxWords} 字`);
  }
  if (config.needExamples) {
    lines.push('- **需要示例：** 请在输出中包含具体示例');
  }
  if (config.needComments) {
    lines.push('- **需要注释：** 请在代码中添加必要的注释');
  }
  if (hasConstraints) {
    lines.push('');
  }
  if (config.extraConstraints.trim()) {
    lines.push(`**额外约束：**`, '');
    lines.push(config.extraConstraints.trim(), '');
  }

  return lines.join('\n');
}

// ── section label component ─────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode; first?: boolean }> = ({
  children,
  first,
}) => (
  <Text
    type="secondary"
    strong
    style={{
      display: 'block',
      marginTop: first ? 0 : 24,
      marginBottom: 12,
      paddingBottom: 6,
      borderBottom: '1px solid #f0f0f0',
      fontSize: 13,
      letterSpacing: 0.5,
    }}
  >
    {children}
  </Text>
);

// ── main component ──────────────────────────────────────

const PromptGeneratorPage: React.FC = () => {
  const [config, setConfig] = useState<PromptConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);
  const [form] = Form.useForm<PromptConfig>();

  const handleValuesChange = useCallback((_: unknown, allValues: PromptConfig) => {
    setConfig(allValues);
  }, []);

  const promptMarkdown = useMemo(() => generatePrompt(config), [config]);

  const handleGenerate = useCallback(() => {
    const values = form.getFieldsValue();
    setConfig(values);
    message.success('Prompt 已生成');
  }, [form]);

  const handleReset = useCallback(() => {
    form.resetFields();
    setConfig(DEFAULT_CONFIG);
    message.info('表单已重置');
  }, [form]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptMarkdown);
      setCopied(true);
      message.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error('复制失败');
    }
  }, [promptMarkdown]);

  // ── render ─────────────────────────────────────────

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* header */}
      <Title level={2} style={{ marginBottom: 24 }}>
        ✨ Prompt 生成器
      </Title>

      <Row gutter={24}>
        {/* ── left: form ── */}
        <Col xs={24} lg={12}>
          <Card
            title="配置表单"
            size="small"
            style={{ marginBottom: 24 }}
            extra={
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  icon={<ThunderboltOutlined />}
                  onClick={handleGenerate}
                >
                  生成
                </Button>
                <Button
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={handleReset}
                >
                  重置
                </Button>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              size="small"
              initialValues={DEFAULT_CONFIG}
              onValuesChange={handleValuesChange}
            >
              {/* ── Section 1: Role ── */}
              <SectionLabel first>角色定义</SectionLabel>

              <Form.Item name="role" label="角色">
                <Select options={ROLE_OPTIONS} />
              </Form.Item>

              {config.role === 'custom' && (
                <Form.Item name="customRole" label="自定义角色">
                  <Input placeholder="例如：专注于微服务架构的资深后端工程师" />
                </Form.Item>
              )}

              {/* ── Section 2: Task ── */}
              <SectionLabel>任务描述</SectionLabel>

              <Form.Item name="taskType" label="任务类型">
                <Select options={TASK_TYPE_OPTIONS} />
              </Form.Item>

              <Form.Item name="taskDescription" label="任务目标">
                <TextArea
                  rows={3}
                  placeholder="详细描述你想要 AI 帮你完成什么任务..."
                />
              </Form.Item>

              {/* ── Section 3: Context ── */}
              <SectionLabel>背景上下文</SectionLabel>

              <Form.Item name="techStack" label="技术栈">
                <Input placeholder="例如：React, TypeScript, Ant Design, Node.js" />
              </Form.Item>

              <Form.Item name="existingCode" label="现有代码">
                <TextArea
                  rows={4}
                  placeholder="粘贴相关的代码片段..."
                  style={{
                    fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                    fontSize: 13,
                  }}
                  spellCheck={false}
                />
              </Form.Item>

              <Form.Item name="references" label="参考资料">
                <TextArea
                  rows={2}
                  placeholder="粘贴相关的文档链接或参考资料..."
                />
              </Form.Item>

              {/* ── Section 4: Output ── */}
              <SectionLabel>输出要求</SectionLabel>

              <Form.Item name="outputFormat" label="输出格式">
                <Select options={FORMAT_OPTIONS} />
              </Form.Item>

              <Form.Item name="outputLanguage" label="输出语言">
                <Select options={LANGUAGE_OPTIONS} />
              </Form.Item>

              <Form.Item name="codeLanguage" label="代码语言">
                <Select options={CODE_LANG_OPTIONS} />
              </Form.Item>

              {/* ── Section 5: Constraints ── */}
              <SectionLabel>约束条件</SectionLabel>

              <Form.Item name="difficulty" label="难度级别">
                <Select options={DIFFICULTY_OPTIONS} />
              </Form.Item>

              <Form.Item name="maxWords" label="字数限制">
                <InputNumber
                  min={0}
                  max={10000}
                  placeholder="0 表示不限制"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="needExamples"
                label="需要示例"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="needComments"
                label="需要注释"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item name="extraConstraints" label="额外约束">
                <TextArea
                  rows={2}
                  placeholder="其他需要补充的约束条件..."
                />
              </Form.Item>

              </Form>
          </Card>
        </Col>

        {/* ── right: preview ── */}
        <Col xs={24} lg={12}>
          <Card
            title="生成结果"
            size="small"
            style={{ marginBottom: 24 }}
            extra={
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopy}
              >
                {copied ? '已复制' : '复制'}
              </Button>
            }
          >
            <TextArea
              value={promptMarkdown}
              readOnly
              rows={28}
              style={{
                fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                fontSize: 13,
                background: '#fafafa',
                minHeight: 500,
              }}
              spellCheck={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PromptGeneratorPage;