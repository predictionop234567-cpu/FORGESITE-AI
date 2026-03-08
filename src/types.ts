export interface Project {
  id: string;
  name: string;
  prompt: string;
  specification?: string;
  html: string;
  css: string;
  js: string;
  react_code?: string;
  package_json?: string;
  folder_structure?: string;
  created_at: string;
}

export interface GeneratedCode {
  name: string;
  specification: string;
  html: string;
  css: string;
  js: string;
  react_code?: string;
  package_json?: string;
  folder_structure?: string;
}
