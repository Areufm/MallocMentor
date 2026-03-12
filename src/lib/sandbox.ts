/**
 * 代码执行沙盒服务
 *
 * 支持两种后端：
 * 1. Piston API（默认，免费公共实例）
 * 2. Judge0 API（需配置 SANDBOX_API_URL + SANDBOX_API_KEY）
 *
 * 环境变量：
 * - SANDBOX_PROVIDER: "piston" | "judge0"（默认 piston）
 * - SANDBOX_API_URL:  自定义 API 地址（Piston 默认 https://emkc.org/api/v2/piston）
 * - SANDBOX_API_KEY:  Judge0 API Key（仅 judge0 需要）
 */

export interface SandboxResult {
  compileOutput: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  compiled: boolean;
}

type Language = "c" | "cpp";

const PISTON_LANG_MAP: Record<Language, { language: string; version: string }> =
  {
    c: { language: "c", version: "10.2.0" },
    cpp: { language: "c++", version: "10.2.0" },
  };

const JUDGE0_LANG_MAP: Record<Language, number> = {
  c: 50,
  cpp: 54,
};

/** 请求超时（毫秒），避免公共 API 不可达时长时间卡住 */
const REQUEST_TIMEOUT = 15_000;

function getProvider(): "piston" | "judge0" {
  return (process.env.SANDBOX_PROVIDER as "piston" | "judge0") || "piston";
}

function getPistonUrl(): string {
  return process.env.SANDBOX_API_URL || "https://emkc.org/api/v2/piston";
}

/** 带超时的 fetch */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 在沙盒中执行代码，直接尝试执行（不做预检查），失败时抛出有意义的错误。
 */
export async function executeCode(
  code: string,
  language: Language,
  input?: string,
): Promise<SandboxResult> {
  const provider = getProvider();
  return provider === "judge0"
    ? executeJudge0(code, language, input)
    : executePiston(code, language, input);
}

// ---------- Piston ----------

async function executePiston(
  code: string,
  language: Language,
  input?: string,
): Promise<SandboxResult> {
  const baseUrl = getPistonUrl();
  const langConfig = PISTON_LANG_MAP[language];

  const startTime = Date.now();

  let res: Response;
  try {
    res = await fetchWithTimeout(`${baseUrl}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          { name: `main.${language === "cpp" ? "cpp" : "c"}`, content: code },
        ],
        stdin: input || "",
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        "代码执行沙盒请求超时，请检查网络或配置 SANDBOX_API_URL 使用可访问的实例",
      );
    }
    throw new Error(
      `无法连接代码执行沙盒: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Piston API 错误 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const elapsed = Date.now() - startTime;

  const compileResult = data.compile;
  const runResult = data.run;
  const compileFailed = compileResult && compileResult.code !== 0;

  return {
    compileOutput: compileResult
      ? (compileResult.stderr || compileResult.stdout || "").trim()
      : "",
    stdout: compileFailed ? "" : (runResult?.stdout || "").trim(),
    stderr: compileFailed
      ? (compileResult.stderr || "").trim()
      : (runResult?.stderr || "").trim(),
    exitCode: compileFailed
      ? (compileResult.code ?? 1)
      : (runResult?.code ?? 0),
    executionTime: elapsed,
    compiled: !compileFailed,
  };
}

// ---------- Judge0 ----------

async function executeJudge0(
  code: string,
  language: Language,
  input?: string,
): Promise<SandboxResult> {
  const apiUrl = process.env.SANDBOX_API_URL;
  const apiKey = process.env.SANDBOX_API_KEY;

  if (!apiUrl) throw new Error("缺少 SANDBOX_API_URL 环境变量");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) headers["X-Auth-Token"] = apiKey;

  let createRes: Response;
  try {
    createRes = await fetchWithTimeout(
      `${apiUrl}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          language_id: JUDGE0_LANG_MAP[language],
          source_code: code,
          stdin: input || "",
          cpu_time_limit: 5,
          memory_limit: 128000,
        }),
      },
    );
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Judge0 请求超时");
    }
    throw new Error(
      `无法连接 Judge0: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => "");
    throw new Error(`Judge0 API 错误 (${createRes.status}): ${errText}`);
  }

  const result = await createRes.json();
  const compileFailed = result.status?.id === 6;

  return {
    compileOutput: (result.compile_output || "").trim(),
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim(),
    exitCode: result.status?.id === 3 ? 0 : (result.exit_code ?? 1),
    executionTime: Math.round((result.time ?? 0) * 1000),
    compiled: !compileFailed,
  };
}
