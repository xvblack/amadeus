export const PREFIX = "AGTA_CONFIG_V1";

export interface AgtaConfig {
  app: string;
  esdl: string;
  load_data_edgeql: string;
  pages: PageConfig[];
}

export interface PageConfig {
  raw: CodeBlock[];
  name?: string;
  icon?: string;
  queries?: QueryConfig[];
  actions?: ActionConfig[];
}

export interface QueryConfig {
  name: string;
  edgeql: string;
}

export interface ActionConfig {
  name: string;
  edgeql_template: string;
}

export interface CodeBlock {
  description: string;
  code: string;
}
