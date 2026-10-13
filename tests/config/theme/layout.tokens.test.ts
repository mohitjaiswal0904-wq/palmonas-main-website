import { layoutTokens } from '@/config/theme/layout.tokens';

describe('layoutTokens', () => {
  it('defines bottom-nav active icon colour', () => {
    expect(layoutTokens.bottomNav.iconActive).toBe('#151515');
  });

  it('defines bottom-nav inactive icon colour', () => {
    expect(layoutTokens.bottomNav.iconInactive).toBe('#A4A4A4');
  });

  it('defines header nav peach hover background', () => {
    expect(layoutTokens.headerNav.hoverBg).toBe('#faf3ec');
  });

  it('defines header nav gold hover text and interactive class', () => {
    expect(layoutTokens.headerNav.hoverText).toBe('#b8956a');
    expect(layoutTokens.headerNav.interactiveClass).toContain('hover:bg-palmonas-headerHover');
    expect(layoutTokens.headerNav.interactiveClass).toContain(
      'hover:text-palmonas-headerHoverText',
    );
  });

  it('defines dropdown item row class that fills column width', () => {
    expect(layoutTokens.headerNav.dropdownItemClass).toContain('flex');
    expect(layoutTokens.headerNav.dropdownItemClass).toContain('w-full');
    expect(layoutTokens.headerNav.dropdownItemClass).toContain('hover:bg-palmonas-headerHover');
  });

  it('defines mega-menu heading and compact link colours', () => {
    expect(layoutTokens.megaMenu.heading).toBe('#151515');
    expect(layoutTokens.megaMenu.linkCompact).toBe('#151515');
  });

  it('defines mega-menu wide link and hover colours', () => {
    expect(layoutTokens.megaMenu.linkWide).toBe('#757575');
    expect(layoutTokens.megaMenu.linkHover).toBe('#151515');
  });

  it('uses reduced mega-menu type sizes', () => {
    expect(layoutTokens.megaMenu.headingClass).toContain('text-[13px]');
    expect(layoutTokens.megaMenu.linkClass).toContain('text-[12px]');
  });

  it('keeps mega-menu headings and links on a single line', () => {
    expect(layoutTokens.megaMenu.linkClass).toContain('whitespace-nowrap');
    expect(layoutTokens.megaMenu.headingClass).toContain('whitespace-nowrap');
    expect(layoutTokens.megaMenu.headingClass).toContain('min-w-max');
  });

  it('makes mega-menu links fill the column row for hover', () => {
    expect(layoutTokens.megaMenu.linkClass).toContain('w-full');
    expect(layoutTokens.megaMenu.linkClass).toContain('flex');
    expect(layoutTokens.megaMenu.linkClass).not.toContain('min-w-max');
    expect(layoutTokens.megaMenu.listClass).toContain('w-full');
  });

  it('spreads wide columns and hugs compact columns', () => {
    expect(layoutTokens.megaMenu.columnsClassWide).toContain('justify-between');
    expect(layoutTokens.megaMenu.columnsClassCompact).toContain('w-max');
    expect(layoutTokens.megaMenu.sectionClass).toContain('min-w-max');
  });
});
