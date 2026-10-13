import {
  getBuilderElements,
  getBuilderResponsiveStyleText,
  normalizeBuilderNode,
  toBuilderStyle,
} from '@/lib/utils/cms-builder';

describe('normalizeBuilderNode', () => {
  it('parses a nested builder tree', () => {
    const node = normalizeBuilderNode(
      {
        id: 'el-1',
        type: 'container',
        props: { className: 'flex gap-4' },
        children: [
          {
            id: 'el-text',
            type: 'text',
            props: { content: 'Hello world', tag: 'h2' },
            children: [],
          },
        ],
      },
      'fallback',
    );

    expect(node).toEqual({
      id: 'el-1',
      type: 'container',
      name: undefined,
      props: { className: 'flex gap-4' },
      children: [
        {
          id: 'el-text',
          type: 'text',
          name: undefined,
          props: { content: 'Hello world', tag: 'h2' },
          children: [],
        },
      ],
    });
  });

  it('returns null for invalid nodes', () => {
    expect(normalizeBuilderNode(null, 'fallback')).toBeNull();
    expect(normalizeBuilderNode({ id: 'x' }, 'fallback')).toBeNull();
  });

  it('merges root-level and nested props for legacy builder nodes', () => {
    const node = normalizeBuilderNode(
      {
        id: 'hero-root',
        type: 'container',
        className: 'flex flex-col',
        backgroundImage: ' https://cdn.example.com/hero image.webp ',
        props: {
          style: {
            padding: '16px',
          },
        },
        children: [],
      },
      'fallback',
    );

    expect(node?.props).toEqual({
      className: 'flex flex-col',
      backgroundImage: ' https://cdn.example.com/hero image.webp ',
      style: {
        padding: '16px',
      },
    });
  });
});

describe('getBuilderElements', () => {
  it('reads elements from component_data', () => {
    const elements = getBuilderElements({
      component_data: {
        elements: [
          {
            id: 'el-img',
            type: 'image',
            props: { src: 'https://cdn.example/image.webp', alt: 'Product' },
            children: [],
          },
        ],
      },
    });

    expect(elements).toHaveLength(1);
    expect(elements[0]?.type).toBe('image');
    expect(elements[0]?.props?.src).toBe('https://cdn.example/image.webp');
  });

  it('returns an empty array when component_data is missing', () => {
    expect(getBuilderElements({})).toEqual([]);
    expect(getBuilderElements({ component_data: { elements: 'invalid' } })).toEqual([]);
  });

  it('reads elements from a top-level elements array', () => {
    const elements = getBuilderElements({
      elements: [
        {
          id: 'el-text',
          type: 'text',
          text: 'Hello from top-level elements',
          children: [],
        },
      ],
    });

    expect(elements).toHaveLength(1);
    expect(elements[0]?.props?.text).toBe('Hello from top-level elements');
  });

  it('reads a legacy single component_data node', () => {
    const elements = getBuilderElements({
      component_data: {
        id: 'el-container',
        type: 'container',
        className: 'w-full',
        children: [],
      },
    });

    expect(elements).toHaveLength(1);
    expect(elements[0]?.type).toBe('container');
    expect(elements[0]?.props?.className).toBe('w-full');
  });
});

describe('toBuilderStyle', () => {
  it('applies runtime width and height classes with vw and percentages', () => {
    expect(
      toBuilderStyle({
        className: 'w-[80vw] h-[45%]',
      }),
    ).toMatchObject({
      width: '80vw',
      height: '45%',
    });
  });

  it('applies flex layout, gap, and background utilities from CMS class strings', () => {
    expect(
      toBuilderStyle({
        className: 'w-[100vw] flex flex-row justify-center items-stretch gap-[5vw] bg-[#ffffff]',
      }),
    ).toMatchObject({
      width: '100vw',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'stretch',
      gap: '5vw',
      backgroundColor: '#ffffff',
    });
  });
});

describe('getBuilderResponsiveStyleText', () => {
  it('creates media-query CSS for responsive width and height classes', () => {
    const cssText = getBuilderResponsiveStyleText(
      'builder-node-1',
      'tab:w-[70vw] laptop:h-[50%] desktop:max-w-[1200px]',
    );

    expect(cssText).toContain('@media (min-width: 768px)');
    expect(cssText).toContain('width: 70vw;');
    expect(cssText).toContain('@media (min-width: 1024px)');
    expect(cssText).toContain('height: 50%;');
    expect(cssText).toContain('@media (min-width: 1280px)');
    expect(cssText).toContain('max-width: 1200px;');
  });

  it('supports important modifiers and laptop-only hide utilities', () => {
    const cssText = getBuilderResponsiveStyleText(
      'builder-node-2',
      'laptop:!w-0 laptop:!h-0 laptop:overflow-hidden',
    );

    expect(cssText).toContain('@media (min-width: 1024px)');
    expect(cssText).toContain('width: 0 !important;');
    expect(cssText).toContain('height: 0 !important;');
    expect(cssText).toContain('overflow: hidden;');
  });

  it('supports display:none via laptop:hidden', () => {
    const cssText = getBuilderResponsiveStyleText('builder-node-3', 'laptop:hidden');

    expect(cssText).toContain('@media (min-width: 1024px)');
    expect(cssText).toContain('display: none;');
  });

  it('applies tab margin resets for negative mt/mb pull layouts', () => {
    const className =
      'w-[100vw] flex flex-row justify-start items-stretch h-auto tab:w-0 tab:h-0 -mb-[80vw] -mt-[10vw] tab:mb-[0vw] tab:mt-[0vw]';

    // Properties with responsive overrides stay out of inline style.
    expect(toBuilderStyle({ className })).toMatchObject({
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
    });
    expect(toBuilderStyle({ className })?.width).toBeUndefined();
    expect(toBuilderStyle({ className })?.height).toBeUndefined();

    const cssText = getBuilderResponsiveStyleText('builder-node-pull', className);

    expect(cssText).toContain('width: 100vw;');
    expect(cssText).toContain('height: auto;');
    expect(cssText).toContain('margin-bottom: -80vw;');
    expect(cssText).toContain('margin-top: -10vw;');
    expect(cssText).toContain('@media (min-width: 768px)');
    expect(cssText).toContain('width: 0;');
    expect(cssText).toContain('height: 0;');
    expect(cssText).toContain('margin-bottom: 0vw;');
    expect(cssText).toContain('margin-top: 0vw;');
  });

  it('applies card typography and padding utilities including laptop breakpoints', () => {
    expect(
      toBuilderStyle({
        className:
          'w-full overflow-hidden mb-2 mt-1 text-xs text-gray-500 font-normal text-center pt-2',
      }),
    ).toMatchObject({
      width: '100%',
      overflow: 'hidden',
      marginBottom: '0.5rem',
      marginTop: '0.25rem',
      fontSize: '0.75rem',
      color: '#6b7280',
      fontWeight: '400',
      textAlign: 'center',
      paddingTop: '0.5rem',
    });

    const cssText = getBuilderResponsiveStyleText(
      'card-node',
      'laptop:text-xl laptop:pt-4 laptop:text-stone-950',
    );

    expect(cssText).toContain('@media (min-width: 1024px)');
    expect(cssText).toContain('font-size: 1.25rem;');
    expect(cssText).toContain('padding-top: 1rem;');
    expect(cssText).toContain('color: #0c0a09;');
  });

  it('keeps base width in stylesheet so laptop:w-* can override mobile w-*', () => {
    const className = 'w-[76vw] tab:w-[50vw] laptop:w-[30vw]';

    expect(toBuilderStyle({ className })?.width).toBeUndefined();

    const cssText = getBuilderResponsiveStyleText('card-width', className, 'data-cms-style-node');

    expect(cssText).toContain('[data-cms-style-node="card-width"] { width: 76vw; }');
    expect(cssText).toContain('@media (min-width: 768px)');
    expect(cssText).toContain('width: 50vw;');
    expect(cssText).toContain('@media (min-width: 1024px)');
    expect(cssText).toContain('width: 30vw;');
  });
});

describe('toBuilderStyle display utilities', () => {
  it('applies base hidden and overflow classes as inline styles', () => {
    expect(
      toBuilderStyle({
        className: 'hidden overflow-hidden',
      }),
    ).toMatchObject({
      display: 'none',
      overflow: 'hidden',
    });
  });
});
