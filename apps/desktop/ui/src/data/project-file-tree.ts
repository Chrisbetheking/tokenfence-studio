export interface ProjectFileNode {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  type: "file" | "directory";
  sizeBytes?: number;
  fileType?: string;
  children?: ProjectFileNode[];
}

const SUPPORTED_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "md", "txt", "json", "yml", "yaml",
  "py", "java", "cpp", "c", "h", "cs", "html", "css"
]);

export function getFileType(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0) return "other";
  const ext = fileName.slice(dot + 1).toLowerCase();
  if (SUPPORTED_EXTENSIONS.has(ext)) return ext;
  return "other";
}

export function isSupportedFile(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.has(getFileType(fileName));
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Build a mock file tree for the given project path.
 * In the future, this will be replaced by a real Tauri filesystem bridge.
 */
export function buildMockFileTree(projectPath: string): ProjectFileNode[] {
  const rootName = projectPath.split("\\").pop() || projectPath.split("/").pop() || "project";

  const createNode = (name: string, type: "file" | "directory", children?: ProjectFileNode[], size?: number): ProjectFileNode => ({
    id: uid(),
    name,
    path: type === "directory" ? projectPath + "\\" + name : projectPath + "\\" + name,
    relativePath: name,
    type,
    sizeBytes: size,
    fileType: type === "file" ? getFileType(name) : undefined,
    children,
  });

  return [
    createNode(rootName, "directory", [
      createNode("src", "directory", [
        createNode("index.ts", "file", undefined, 1234),
        createNode("App.tsx", "file", undefined, 3456),
        createNode("utils.ts", "file", undefined, 890),
        createNode("components", "directory", [
          createNode("Header.tsx", "file", undefined, 2100),
          createNode("Sidebar.tsx", "file", undefined, 3200),
          createNode("Footer.tsx", "file", undefined, 1500),
        ]),
      ]),
      createNode("docs", "directory", [
        createNode("README.md", "file", undefined, 5000),
        createNode("CHANGELOG.md", "file", undefined, 2400),
      ]),
      createNode("config", "directory", [
        createNode("settings.json", "file", undefined, 800),
        createNode("env.yaml", "file", undefined, 600),
      ]),
      createNode("package.json", "file", undefined, 1200),
      createNode("tsconfig.json", "file", undefined, 900),
    ]),
  ];
}

export function flattenFileTree(nodes: ProjectFileNode[]): ProjectFileNode[] {
  const result: ProjectFileNode[] = [];
  function walk(list: ProjectFileNode[]) {
    for (const node of list) {
      result.push(node);
      if (node.children) walk(node.children);
    }
  }
  walk(nodes);
  return result;
}
