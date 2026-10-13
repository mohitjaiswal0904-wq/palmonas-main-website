export interface CmsBuilderNodeProps {
  className?: string;
  style?: Record<string, string | number>;
  content?: string;
  text?: string;
  tag?: string;
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  label?: string;
  href?: string;
  target?: string;
  poster?: string;
  autoplay?: boolean;
  action_type?: string | null;
  action_value?: string | null;
  variant?: string;
  background_color?: string;
  backgroundColor?: string;
  text_color?: string;
  textColor?: string;
  backgroundImage?: string;
  objectFit?: string;
  opacity?: number;
  clickAction?: string | null;
  clickActionValue?: string | null;
  fontSize?: string | number;
  fontWeight?: string | number;
  color?: string;
  textAlign?: string;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textTransform?: string;
}

export interface CmsBuilderNode {
  id: string;
  type: string;
  name?: string;
  props?: CmsBuilderNodeProps;
  children: CmsBuilderNode[];
}

export interface CmsBuilderComponentData {
  elements?: CmsBuilderNode[];
}
